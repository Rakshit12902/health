FROM python:3.10-slim

# Install system dependencies (Tesseract OCR)
RUN apt-get update && apt-get install -y tesseract-ocr

WORKDIR /app

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Run the Uvicorn server on the port provided by Render
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]
