from flask import Blueprint, request, jsonify
from models import pegawai
import jwt
from datetime import datetime, timedelta

auth_bp = Blueprint('auth', __name__)

# Secret key untuk JWT (harus disimpan aman di environment)
SECRET_KEY = 'ttu_berkat'

@auth_bp.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data['username']
    password = data['password']
    user = pegawai().find_one({'username': username})

    if user and user['password'] == password:
        if user['role'] == 'admin':
            # Buat token JWT
            token = jwt.encode({
                'username': username,
                'role': user['role'],
                'exp': datetime.utcnow() + timedelta(hours=1)
            }, SECRET_KEY, algorithm='HS256')

            return jsonify({'success': True, 'token': token, 'message': 'Login berhasil'})
        else:
            return jsonify({'success': False, 'message': 'Hanya admin yang bisa masuk!'})
    return jsonify({'success': False, 'message': 'Username atau Password salah'})

# Rute untuk memvalidasi token
@auth_bp.route('/api/validate_token', methods=['GET'])
def validate_token():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'success': False, 'message': 'Token tidak ditemukan'}), 401

    try:
        # Decode token
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return jsonify({'success': True, 'user': decoded_token})
    except jwt.ExpiredSignatureError:
        return jsonify({'success': False, 'message': 'Token telah kadaluarsa'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'success': False, 'message': 'Token tidak valid'}), 401
