from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, Form
from pydantic import BaseModel
import uuid
import time
from app.services.ocr import process_document
from app.services.llm import extract_metrics_from_report, extract_prescriptions_from_report
from app.core.db import get_supabase

router = APIRouter()

class DocumentResponse(BaseModel):
    document_id: str
    status: str
    message: str

def background_process_document(document_id: str, file_bytes: bytes, filename: str, session_id: str):
    supabase = get_supabase()
    
    try:
        # Update status to processing
        supabase.table("documents").update({"processing_status": "processing"}).eq("id", document_id).execute()
        
        # Extract text
        extracted_text = process_document(file_bytes, filename)
        
        # Update document with extracted text
        supabase.table("documents").update({
            "processing_status": "completed",
            "extracted_text": extracted_text
        }).eq("id", document_id).execute()
        
        # Get profile_id from session
        session_res = supabase.table("sessions").select("profile_id").eq("id", session_id).execute()
        if session_res.data:
            profile_id = session_res.data[0]["profile_id"]
            
            # Extract metrics using AI
            metrics = extract_metrics_from_report(extracted_text)
            
            if metrics:
                # Insert metrics into DB
                records = []
                for m in metrics:
                    records.append({
                        "profile_id": profile_id,
                        "document_id": document_id,
                        "metric_name": m.get("metric_name", ""),
                        "metric_value": float(m.get("metric_value", 0)),
                        "unit": m.get("unit", ""),
                        "reference_range": m.get("reference_range", ""),
                        "flag": m.get("flag", "normal")
                    })
                if records:
                    supabase.table("metrics").insert(records).execute()
                    
            # Extract prescriptions using AI
            prescriptions = extract_prescriptions_from_report(extracted_text)
            
            if prescriptions:
                # Need user_id for prescriptions
                user_res = supabase.table("sessions").select("user_id").eq("id", session_id).execute()
                if user_res.data:
                    user_id = user_res.data[0]["user_id"]
                    
                    presc_records = []
                    for p in prescriptions:
                        presc_records.append({
                            "user_id": user_id,
                            "document_id": document_id,
                            "medicine_name": p.get("medicine_name", ""),
                            "dosage": p.get("dosage", ""),
                            "frequency": p.get("frequency", ""),
                            "duration": p.get("duration", "")
                        })
                    if presc_records:
                        supabase.table("prescriptions").insert(presc_records).execute()
        
    except Exception as e:
        print(f"Failed to process document: {e}")
        supabase.table("documents").update({
            "processing_status": "failed",
        }).eq("id", document_id).execute()


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    session_id: str = Form(...),
):
    try:
        file_bytes = await file.read()
        document_id = str(uuid.uuid4())
        
        # In a real app, upload file_bytes to Supabase Storage and get file_url
        file_url = f"/storage/{document_id}/{file.filename}"
        
        supabase = get_supabase()
        
        # Determine file type
        ext = file.filename.lower().split('.')[-1]
        file_type = "unknown"
        if ext == 'pdf':
            file_type = "report" # generic
        elif ext in ['jpg', 'jpeg', 'png']:
            file_type = "image"
            
        # Create DB record
        supabase.table("documents").insert({
            "id": document_id,
            "session_id": session_id,
            "file_name": file.filename,
            "file_url": file_url,
            "file_type": file_type,
            "processing_status": "pending"
        }).execute()
        
        # Start background processing
        background_tasks.add_task(
            background_process_document, 
            document_id=document_id, 
            file_bytes=file_bytes, 
            filename=file.filename,
            session_id=session_id
        )
        
        return DocumentResponse(
            document_id=document_id,
            status="pending",
            message="Document uploaded and processing started."
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{document_id}/status")
def get_document_status(document_id: str):
    supabase = get_supabase()
    response = supabase.table("documents").select("processing_status, extracted_text").eq("id", document_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Document not found")
        
    return response.data[0]
