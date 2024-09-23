from flask import Blueprint, request, session, jsonify
from models import pegawai

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/login', methods=['POST'])
def login():
    if request.method == 'POST':
        data = request.json
        username = data['username']
        password = data['password']
        user = pegawai().find_one({'username': username})
        if user and user['password'] == password:
            if user['role'] == 'admin':
                session['username'] = username
                session['role'] = user['role']
                return jsonify({'success': True, 'message': 'Login berhasil'})
            else:
                return jsonify({'success': False, 'message': 'Hanya admin yang bisa masuk!'})
        return jsonify({'success': False, 'message': 'Username atau Password salah'})

@auth_bp.route('/api/logout', methods=['GET'])
def logout():
    session.pop('username', None)
    session.pop('role', None)
    return jsonify({'success': True, 'message': 'Logged out successfully'})
