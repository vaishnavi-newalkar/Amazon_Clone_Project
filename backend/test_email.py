import os
from dotenv import load_dotenv
import smtplib

load_dotenv(override=True)

try:
    print(f"Connecting to SMTP...")
    server = smtplib.SMTP(os.getenv("SMTP_HOST"), int(os.getenv("SMTP_PORT")))
    server.ehlo()
    server.starttls()
    print("Logging in...")
    server.login(os.getenv("SMTP_USER"), os.getenv("SMTP_PASSWORD"))
    print("Successfully logged in!")
    server.quit()
except Exception as e:
    print(f"SMTP Error: {e}")
