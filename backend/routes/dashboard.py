from flask import Blueprint, jsonify, request
from models import barang, pegawai
import jwt

dashboard_bp = Blueprint('dashboard', __name__)

# Secret key should match the one used in auth.py
SECRET_KEY = 'ttu_berkat'

# Middleware function to verify JWT token
def token_required(f):
    def wrap(*args, **kwargs):
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return jsonify({'success': False, 'message': 'Token is missing!'}), 401

        try:
            # Ambil token tanpa kata 'Bearer'
            token = auth_header.split(" ")[1]
            decoded_token = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            request.user = decoded_token  # Simpan informasi user ke dalam request
        except jwt.ExpiredSignatureError:
            return jsonify({'success': False, 'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'success': False, 'message': 'Invalid token!'}), 401

        return f(*args, **kwargs)

    wrap.__name__ = f.__name__  # Flask membutuhkan ini untuk decorator
    return wrap

@dashboard_bp.route('/home', methods=['GET'])
@token_required  # Apply the token_required decorator to this route
def homedashboard():
    inventory_summary = list(barang().find())
    employee_summary = list(pegawai().find({'role': 'pegawai'}))
    
    # Convert ObjectId to string for JSON serialization
    for item in inventory_summary:
        item['_id'] = str(item['_id'])
    for item in employee_summary:
        item['_id'] = str(item['_id'])

    return jsonify({
        'success': True,
        'message': 'User authenticated',
        'inventory_summary': inventory_summary,
        'employee_summary': employee_summary,
        'user': request.user  # Send the decoded user data back as well
    })
