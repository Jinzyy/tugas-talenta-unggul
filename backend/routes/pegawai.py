from flask import Blueprint, request, jsonify
from bson import ObjectId
from models import pegawai
from datetime import datetime

pegawai_bp = Blueprint('pegawai', __name__)

@pegawai_bp.route('/api/pegawai', methods=['GET', 'POST'])
def manage_pegawai():
    if request.method == 'GET':
        pegawai_list = list(pegawai().find({'role': 'pegawai'}))
        for item in pegawai_list:
            item['_id'] = str(item['_id'])
        return jsonify({'success': True, 'pegawai': pegawai_list})

    elif request.method == 'POST':
        data = request.json
        pegawai().insert_one({
            'username': data['username'],
            'tempatLahir': data['tempat_lahir'],
            'tanggalLahir': datetime.strptime(data['tanggal_lahir'], '%Y-%m-%d'),
            'jenisKelamin': data['jenis_kelamin'],
            'alamat': data['alamat'],
            'password': data['password'],
            'role': data['role']
        })
        return jsonify({'success': True, 'message': 'Pegawai berhasil ditambahkan'})

@pegawai_bp.route('/api/pegawai/<id>', methods=['PUT', 'DELETE'])
def edit_delete_pegawai(id):
    if request.method == 'PUT':
        data = request.json
        pegawai().update_one({'_id': ObjectId(id)}, {'$set': {
            'username': data['username'],
            'tempatLahir': data['tempatLahir'],
            'tanggalLahir': datetime.strptime(data['tanggalLahir'], '%Y-%m-%d'),
            'jenisKelamin': data['jenisKelamin'],
            'alamat': data['alamat']
        }})
        return jsonify({'success': True, 'message': 'Pegawai berhasil diupdate'})

    elif request.method == 'DELETE':
        pegawai().delete_one({'_id': ObjectId(id)})
        return jsonify({'success': True, 'message': 'Pegawai berhasil dihapus'})
