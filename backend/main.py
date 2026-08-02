from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.api import documents, chat, voice, notifications
import os
import json
from datetime import datetime
import pytz
from pywebpush import webpush, WebPushException
from supabase import create_client
from apscheduler.schedulers.background import BackgroundScheduler
from contextlib import asynccontextmanager

def send_pill_notifications():
    print("Checking for pill notifications...")
    supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))
    
    # Get current UTC time and convert to India Standard Time (IST) or let's just use UTC hours for demo,
    # or just use a generic timezone. Let's use UTC for now to be safe, but wait, 8am IST is different.
    # Actually, for demonstration, we check current hour in UTC and match it, or check IST.
    # Since we want 8am, 1pm, 8pm, let's just use Indian Standard Time (Asia/Kolkata)
    tz = pytz.timezone('Asia/Kolkata')
    now = datetime.now(tz)
    
    current_time_of_day = None
    # Calculate current time of day based on hours
    if now.hour == 8 and now.minute == 0:
        current_time_of_day = "morning"
    elif now.hour == 13 and now.minute == 0:
        current_time_of_day = "afternoon"
    elif now.hour == 20 and now.minute == 0:
        current_time_of_day = "night"
        
    if current_time_of_day:
        try:
            # 1. Fetch users and their pills scheduled for this time
            reminders_res = supabase.table("pill_reminders").select("*, prescriptions(user_id, medicine_name)").eq("time_of_day", current_time_of_day).eq("taken_status", False).execute()
            reminders = reminders_res.data
            
            if not reminders:
                return
                
            # Group by user_id
            user_pills = {}
            for r in reminders:
                if not r.get('prescriptions'): continue
                
                uid = r['prescriptions']['user_id']
                if uid not in user_pills:
                    user_pills[uid] = []
                user_pills[uid].append(r['prescriptions']['medicine_name'])
                
            # 2. Fetch push subscriptions for these users
            for uid, pills in user_pills.items():
                subs_res = supabase.table("push_subscriptions").select("*").eq("user_id", uid).execute()
                subs = subs_res.data
                
                if subs:
                    pill_list = ", ".join(pills)
                    message_title = "💊 Time for your Medication!"
                    message_body = f"It's time to take your {pill_list}."
                    
                    vapid_private_key = os.getenv("VAPID_PRIVATE_KEY")
                    vapid_claims = {"sub": "mailto:admin@curamind.com"}
                    
                    for sub in subs:
                        try:
                            webpush(
                                subscription_info={
                                    "endpoint": sub['endpoint'],
                                    "keys": {
                                        "p256dh": sub['p256dh'],
                                        "auth": sub['auth']
                                    }
                                },
                                data=json.dumps({"title": message_title, "body": message_body}),
                                vapid_private_key=vapid_private_key,
                                vapid_claims=vapid_claims
                            )
                        except WebPushException as ex:
                            print("WebPush Error:", repr(ex))
        except Exception as e:
            print("Scheduler error:", e)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    scheduler = BackgroundScheduler()
    scheduler.add_job(send_pill_notifications, 'cron', minute='*') # Run every minute
    scheduler.start()
    yield
    # Shutdown
    scheduler.shutdown()

app = FastAPI(title="CuraMind API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(voice.router, prefix="/api/voice", tags=["voice"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])

@app.get("/")
def read_root():
    return {"message": "Welcome to CuraMind API"}

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

