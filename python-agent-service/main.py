#!/usr/bin/env python3
import os
import time
import uuid
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# --- Load Environment ---
load_dotenv()

# --- Configuration ---
APP_NAME = "DealFlow AI Agent Service"
APP_VERSION = "0.1.0"
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
DEBUG = os.getenv("DEBUG", "false").lower() == "true"

# --- Initialize App ---
app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description="AI Agent Service for DealFlow",
    docs_url="/docs",
    redoc_url="/redoc",
    debug=DEBUG,
)

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Logging Helper ---
def log(message: str, level: str = "info"):
    timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    print(f"[{timestamp}] [{APP_NAME}] [{level.upper()}] {message}")

# --- Pydantic Schemas ---
class AgentActionRequest(BaseModel):
    user_id: str = Field(..., description="ID of the user making the request")
    agent_id: str = Field(..., description="ID of the agent to execute")
    action_type: str = Field(..., description="Type of action to perform")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Parameters for the action")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Additional context")

class AgentActionResponse(BaseModel):
    success: bool
    action_id: str
    result: Optional[Any] = None
    error: Optional[str] = None
    timestamp: str
    execution_time_ms: float

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    timestamp: str
    uptime_seconds: float

# --- In-Memory Storage ---
start_time = time.time()
action_history: List[Dict[str, Any]] = []

# --- Helper Functions ---
def generate_timestamp() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

def execute_dummy_action(action_type: str, parameters: Dict[str, Any]) -> Any:
    """Execute a dummy action for demonstration purposes"""
    time.sleep(0.1)  # Simulate work
    if action_type == "echo":
        return {"message": parameters.get("input", "")}
    elif action_type == "add":
        a = parameters.get("a", 0)
        b = parameters.get("b", 0)
        return {"sum": a + b}
    elif action_type == "analyze":
        return {
            "analysis_id": str(uuid.uuid4()),
            "score": 0.85,
            "insights": ["Positive sentiment detected", "High engagement"]
        }
    else:
        return {"status": "completed", "parameters": parameters}

# --- Routes ---
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_req_time = time.time()
    log(f"Incoming request: {request.method} {request.url}", "debug")
    response = await call_next(request)
    process_time_ms = (time.time() - start_req_time) * 1000
    log(f"Request completed: {request.method} {request.url} - {response.status_code} - {process_time_ms:.2f}ms", "info")
    return response

@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    uptime = time.time() - start_time
    return HealthResponse(
        status="healthy",
        service=APP_NAME,
        version=APP_VERSION,
        timestamp=generate_timestamp(),
        uptime_seconds=uptime,
    )

@app.get("/", tags=["Root"])
async def root():
    return JSONResponse(
        content={
            "service": APP_NAME,
            "version": APP_VERSION,
            "docs": "/docs",
            "health": "/health",
        },
        status_code=status.HTTP_200_OK,
    )

@app.post("/agent/action", response_model=AgentActionResponse, tags=["Agent"])
async def execute_agent_action(request: AgentActionRequest):
    start_exec_time = time.time()
    action_id = str(uuid.uuid4())
    
    log(f"Executing agent action: {request.action_type} for user {request.user_id}", "info")
    
    try:
        result = execute_dummy_action(request.action_type, request.parameters)
        
        execution_time_ms = (time.time() - start_exec_time) * 1000
        
        response = AgentActionResponse(
            success=True,
            action_id=action_id,
            result=result,
            timestamp=generate_timestamp(),
            execution_time_ms=execution_time_ms,
        )
        
        # Store in history
        action_history.append({
            "action_id": action_id,
            "user_id": request.user_id,
            "agent_id": request.agent_id,
            "action_type": request.action_type,
            "parameters": request.parameters,
            "success": True,
            "timestamp": generate_timestamp(),
            "execution_time_ms": execution_time_ms,
        })
        
        log(f"Agent action completed successfully: {action_id}", "info")
        return response
        
    except Exception as e:
        execution_time_ms = (time.time() - start_exec_time) * 1000
        error_msg = str(e)
        log(f"Agent action failed: {error_msg}", "error")
        
        action_history.append({
            "action_id": action_id,
            "user_id": request.user_id,
            "agent_id": request.agent_id,
            "action_type": request.action_type,
            "parameters": request.parameters,
            "success": False,
            "error": error_msg,
            "timestamp": generate_timestamp(),
            "execution_time_ms": execution_time_ms,
        })
        
        return AgentActionResponse(
            success=False,
            action_id=action_id,
            error=error_msg,
            timestamp=generate_timestamp(),
            execution_time_ms=execution_time_ms,
        )

@app.get("/agent/history/{user_id}", tags=["Agent"])
async def get_agent_history(user_id: str, limit: int = 100):
    filtered_history = [
        entry for entry in reversed(action_history)
        if entry["user_id"] == user_id
    ][:limit]
    return {
        "user_id": user_id,
        "count": len(filtered_history),
        "history": filtered_history,
    }

# --- Run ---
if __name__ == "__main__":
    import uvicorn
    log(f"Starting {APP_NAME} v{APP_VERSION} on {HOST}:{PORT}")
    uvicorn.run(
        "main:app",
        host=HOST,
        port=PORT,
        reload=DEBUG,
        log_level="debug" if DEBUG else "info",
    )
