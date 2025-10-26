from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

app = FastAPI()

# Global variables for model and tokenizer
model = None
tokenizer = None

class SimplifyRequest(BaseModel):
    summary: str

class SimplifyResponse(BaseModel):
    elevator_pitch: str

@app.on_event("startup")
async def load_model():
    global model, tokenizer
    try:
        print("Loading TinyLlama model...")
        model_name = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype=torch.float32,
            device_map="cpu"
        )
        print("Model loaded successfully!")
    except Exception as e:
        print(f"Error loading model: {e}")
        raise

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": model is not None}

@app.post("/simplify", response_model=SimplifyResponse)
async def simplify_idea(request: SimplifyRequest):
    if model is None or tokenizer is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    try:
        # Create a prompt for the model
        prompt = f"""<|system|>
You are a helpful assistant that creates concise elevator pitches. Convert the following idea summary into a clear, compelling 1-2 sentence elevator pitch that captures the essence of the idea.</s>
<|user|>
{request.summary}</s>
<|assistant|>
"""

        # Tokenize and generate
        inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512)

        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=100,
                temperature=0.7,
                do_sample=True,
                top_p=0.9,
                pad_token_id=tokenizer.eos_token_id
            )

        # Decode the output
        full_response = tokenizer.decode(outputs[0], skip_special_tokens=True)

        # Extract just the assistant's response
        assistant_response = full_response.split("<|assistant|>")[-1].strip()

        # Clean up and ensure it's 1-2 sentences
        sentences = assistant_response.split('.')
        elevator_pitch = '. '.join(sentences[:2]).strip()
        if not elevator_pitch.endswith('.'):
            elevator_pitch += '.'

        # Limit to 280 characters max (Twitter-style length)
        if len(elevator_pitch) > 280:
            elevator_pitch = elevator_pitch[:277] + '...'

        return SimplifyResponse(elevator_pitch=elevator_pitch)

    except Exception as e:
        print(f"Error during generation: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating elevator pitch: {str(e)}")
