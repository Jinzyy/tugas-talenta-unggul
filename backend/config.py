import os
from dotenv import load_dotenv

load_dotenv()  # Memuat variabel lingkungan dari file .env

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY') or 'default_secret_key'
    MONGO_URI = os.getenv('MONGO_URI') or 'mongodb://localhost:27017/default_db'
