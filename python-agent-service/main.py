import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from llama_index.core import VectorStoreIndex, Document, SimpleDirectoryReader
from llama_index.vector_stores.pinecone import PineconeVectorStore
from llama_index.core.storage.storage_context import StorageContext
from llama_index.llms.huggingface_api import HuggingFaceInferenceAPI
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.core import Settings
from pinecone import Pinecone

from dotenv import load_dotenv

# Load env variables
load_dotenv(dotenv_path="../.env.local")
load_dotenv(dotenv_path="../.env")

# Get Hugging Face token
hf_token = os.environ.get("HUGGING_FACE_TOKEN", "dummy-hf-token-for-local")

app = FastAPI(title="LlamaIndex RAG Backend")

# Initialize Pinecone
api_key = os.environ.get("PINECONE_API_KEY", "dummy")
index_name = os.environ.get("PINECONE_INDEX", "quickstart")

if api_key != "dummy" and api_key != "dummy-test-key" and api_key != "":
    pc = Pinecone(api_key=api_key)
    # We assume the index already exists in Pinecone
    pinecone_index = pc.Index(index_name)
    vector_store = PineconeVectorStore(pinecone_index=pinecone_index)
else:
    print("WARNING: Using in-memory vector store because PINECONE_API_KEY is dummy/missing")
    # Fallback for local development
    from llama_index.core.vector_stores import SimpleVectorStore
    vector_store = SimpleVectorStore()

storage_context = StorageContext.from_defaults(vector_store=vector_store)

# Configure global settings
Settings.llm = HuggingFaceInferenceAPI(model_name="HuggingFaceH4/zephyr-7b-beta", token=hf_token, temperature=0.1)
Settings.embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-small-en-v1.5")

# Initialize the index object
if api_key == "dummy" or api_key == "dummy-test-key" or api_key == "":
    # Cannot init from an empty in-memory vector store that doesn't store text, use from_documents instead
    index = VectorStoreIndex.from_documents([], storage_context=storage_context)
else:
    # Connect to the existing Pinecone vector store
    index = VectorStoreIndex.from_vector_store(vector_store=vector_store, storage_context=storage_context)

class QueryRequest(BaseModel):
    query: str
    
class QueryResponse(BaseModel):
    answer: str
    sources: List[str]

class IngestRequest(BaseModel):
    documents: List[dict] # Expected: [{"text": "...", "metadata": {"docId": "..."}}]

@app.post("/api/v1/query", response_model=QueryResponse)
async def query_rag(request: QueryRequest):
    try:
        query_engine = index.as_query_engine(similarity_top_k=5)
        response = query_engine.query(request.query)
        
        sources = []
        for node in response.source_nodes:
            doc_id = node.metadata.get("docId", "unknown")
            if doc_id not in sources:
                sources.append(doc_id)
                
        return QueryResponse(answer=str(response), sources=sources)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/index")
async def ingest_documents(request: IngestRequest):
    try:
        docs = []
        for d in request.documents:
            docs.append(Document(text=d["text"], metadata=d.get("metadata", {})))
            
        # Insert into Pinecone via LlamaIndex
        for doc in docs:
            index.insert(doc)
            
        return {"status": "success", "indexed_count": len(docs)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
