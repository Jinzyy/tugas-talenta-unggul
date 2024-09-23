from pymongo.mongo_client import MongoClient
from flask import current_app

# Initialize MongoDB connection
def db():
    client = MongoClient(current_app.config['MONGO_URI'])
    db = client['db-tokobawang']
    return db

# Collections
def pegawai():
    return db()['user']

def transaksi():
    return db()['transaksi']

def barang():
    return db()['barang']
