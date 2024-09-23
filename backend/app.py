from flask import Flask
from flask_cors import CORS
from pymongo.mongo_client import MongoClient
from config import Config
from models import db
from routes.auth import auth_bp
from routes.dashboard import dashboard_bp
from routes.inventory import inventory_bp
from routes.pegawai import pegawai_bp
from routes.transactions import transactions_bp

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

# Register Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(dashboard_bp)
app.register_blueprint(inventory_bp)
app.register_blueprint(pegawai_bp)
app.register_blueprint(transactions_bp)

if __name__ == '__main__':
    app.run(debug=True)
