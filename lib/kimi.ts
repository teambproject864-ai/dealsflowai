export { KimiClient } from './kimi/client';
import { getKimiClient } from './instances';

export async function kimiInfer(
  prompt: string,
  systemPrompt: string,
  options: any = {}
): Promise<string> {
  const kimiClient = getKimiClient();
  const response = await kimiClient.chatCompletion({
    model: process.env.KIMI_MODEL || 'moonshot-v1-8k',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
    ...options,
  });
  return response.choices[0].message.content;
}

export async function kimiInferJSON(
  prompt: string,
  systemPrompt: string,
  options: any = {}
): Promise<any> {
  const jsonSystem = `${systemPrompt}\n\nIMPORTANT: Respond ONLY with valid JSON. No explanation, no markdown, no backticks. Raw JSON only. Ensure no trailing commas.`;
  const result = await kimiInfer(prompt, jsonSystem, {
    ...options,
    temperature: 0.2,
  });

  const stripFences = (t: string) => t.replace(/```json\s*|```/gi, '').trim();
  const cleaned = stripFences(result);
  
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('[kimi.ts] Failed to parse JSON response:', err);
    console.log('[kimi.ts] Raw response:', result);
    throw new Error('Invalid JSON response from Kimi API');
  }
}
