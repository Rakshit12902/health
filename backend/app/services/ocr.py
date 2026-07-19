import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from a PDF file using PyMuPDF."""
    text = ""
    try:
        # Open the PDF from bytes
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text += page.get_text("text") + "\n"
        doc.close()
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
    return text.strip()

def extract_text_from_image(file_bytes: bytes) -> str:
    """Extract text from an image using Tesseract OCR."""
    text = ""
    try:
        image = Image.open(io.BytesIO(file_bytes))
        # Point to the Tesseract installation path
        pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
        text = pytesseract.image_to_string(image)
    except Exception as e:
        print(f"Error extracting text from Image: {e}")
        text = f"MOCK_EXTRACTION: [Tesseract OCR failed to parse the image. Error: {e}]"
    
    clean_text = text.strip()
    if not clean_text:
        return "[SYSTEM MESSAGE: The OCR engine could not detect any readable text in this image. The image might be too blurry, compressed, or a non-document image.]"
    return clean_text

def process_document(file_bytes: bytes, filename: str) -> str:
    """Process document based on extension."""
    ext = filename.lower().split('.')[-1]
    if ext == 'pdf':
        return extract_text_from_pdf(file_bytes)
    elif ext in ['jpg', 'jpeg', 'png']:
        return extract_text_from_image(file_bytes)
    else:
        raise ValueError(f"Unsupported file type: {ext}")
