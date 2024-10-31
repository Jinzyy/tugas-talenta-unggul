from flask import Blueprint, request, jsonify
from bson import ObjectId
from models import barang
from routes.dashboard import token_required

inventory_bp = Blueprint('inventory', __name__)

@inventory_bp.route('/api/inventory', methods=['GET', 'POST'])
@token_required
def inventory():
    if request.method == 'POST':
        data = request.json
        barang().insert_one({
            'nama_barang': data['nama_barang'],
            'jenis_barang': data['jenis_barang'],
            'stok_barang': int(data['stok_barang']),
            'harga_barang': float(data['harga_barang'])
        })
        return jsonify({'success': True, 'message': 'Barang berhasil ditambahkan'})

    elif request.method == 'GET':            
        inventory_summary = list(barang().find())
        for item in inventory_summary:
            item['_id'] = str(item['_id'])
        return jsonify({'success': True, 'inventory_summary': inventory_summary})

@inventory_bp.route('/api/inventory/<id>', methods=['PUT', 'DELETE'])
@token_required
def edit_delete_inventory(id):
    if request.method == 'PUT':
        data = request.json
        barang().update_one({'_id': ObjectId(id)}, {'$set': {
            'nama_barang': data['nama_barang'],
            'jenis_barang': data['jenis_barang'],
            'stok_barang': int(data['stok_barang']),
            'harga_barang': float(data['harga_barang'])
        }})
        return jsonify({'success': True, 'message': 'Barang berhasil diupdate'})

    elif request.method == 'DELETE':
        barang().delete_one({'_id': ObjectId(id)})
        return jsonify({'success': True, 'message': 'Barang berhasil dihapus'})
