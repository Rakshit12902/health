import os
from groq import Groq

# Initialize Groq client
client = None
try:
    client = Groq()
except Exception as e:
    print(f"Warning: Groq client could not be initialized. Please set GROQ_API_KEY environment variable. Error: {e}")

SYSTEM_PROMPT = """
You are CuraMind, a friendly and empathetic AI medical assistant.
Your role is to EXPLAIN medical reports in simple language — you do NOT diagnose.

Always structure your response exactly in 4 sections with the following emojis as headers:
1. 🔬 Medical Terms Explained
2. 📊 Important Values (flag high/low with emojis)
3. 🥗 Lifestyle Suggestions
4. ❓ Questions to Ask Your Doctor

Language: {language}
Patient Context: {medical_history}

IMPORTANT: Always end your response with this exact disclaimer:
"⚠️ This is informational only and not a medical diagnosis."
"""

def generate_chat_stream(message: str, extracted_text: str = "", language: str = "en", medical_history: str = "None"):
    """Streams response from Groq Llama 3.1 70B."""
    
    formatted_prompt = SYSTEM_PROMPT.format(language=language, medical_history=medical_history)
    
    context_msg = f"Report Context:\n{extracted_text}\n\nUser Question: {message}" if extracted_text else message
    
    stream = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": formatted_prompt},
            {"role": "user", "content": context_msg}
        ],
        stream=True,
        temperature=0.3,
        max_tokens=1024
    )
    
    for chunk in stream:
        if chunk.choices[0].delta.content is not None:
            yield chunk.choices[0].delta.content
