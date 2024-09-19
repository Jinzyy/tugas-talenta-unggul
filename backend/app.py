import datetime
from flask import Flask, request, send_file, session, redirect, url_for, flash, jsonify
from pymongo.mongo_client import MongoClient
from bson import ObjectId, json_util
from flask_cors import CORS
from datetime import datetime

import pandas as pd
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas


app = Flask(__name__)
CORS(app)
app.secret_key = 'ttucvberkat'

# Menghubungkan ke MongoDB
client = MongoClient("mongodb+srv://rafaeldeandra:backenddata@rafaeldb.vxcdqx1.mongodb.net/")

# Cluster
db = client['db-tokobawang']
# Collection
pegawai = db['user']
transaksi = db['transaksi']
barang = db['barang']

@app.route('/api/login', methods=['POST'])
def login():
    if request.method == 'POST':
        data = request.json
        username = data['username']
        password = data['password']
        user = pegawai.find_one({'username': username})
        if user and user['password'] == password:
            if user['role'] == 'admin':
                session['username'] = username
                session['role'] = user['role']
                return jsonify({'success': True, 'message': 'Login berhasil'})
            else:
                return jsonify({'success': False, 'message': 'Hanya admin yang bisa masuk!'})
        return jsonify({'success': False, 'message': 'Username atau Password tidak sesuai!'})

@app.route('/home', methods=['GET'])
def homedashboard():
    inventory_summary = list(barang.find())
    employee_summary = list(pegawai.find({'role': 'pegawai'}))
    
    # Convert ObjectId to string for JSON serialization
    for item in inventory_summary:
        item['_id'] = str(item['_id'])
    for item in employee_summary:
        item['_id'] = str(item['_id'])

    return jsonify({
        'success': True,
        'message': 'User authenticated',
        'inventory_summary': inventory_summary,
        'employee_summary': employee_summary
    })

@app.route('/api/revenue', methods=['GET'])
def get_revenue():
    # Ambil parameter start_date dan end_date dari query string
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')

    # Konversi string ke datetime jika parameter disediakan
    if start_date_str and end_date_str:
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
        query = {'tanggal_transaksi': {'$gte': start_date, '$lte': end_date}}
    else:
        # Jika tidak ada rentang tanggal, ambil semua data transaksi
        query = {}

    transactions = list(transaksi.find(query))

    # Mengelompokkan transaksi berdasarkan bulan dan menghitung total pendapatan
    revenue_by_month = {}
    for trans in transactions:
        tanggal_transaksi = trans['tanggal_transaksi']
        bulan_tahun = tanggal_transaksi.strftime('%Y-%m')  # Contoh format: "2024-09"
        total_harga = trans['total_harga']

        if bulan_tahun not in revenue_by_month:
            revenue_by_month[bulan_tahun] = 0
        revenue_by_month[bulan_tahun] += total_harga

    return jsonify({'success': True, 'revenue_by_month': revenue_by_month})

@app.route('/api/logout', methods=['GET'])
def logout():
    session.pop('username', None)
    session.pop('role', None)
    return jsonify({'success': True, 'message': 'Logged out successfully'})

@app.route('/api/inventory', methods=['GET', 'POST'])
def inventory():
    if request.method == 'POST':
            data = request.json
            nama_barang = data['nama_barang']
            jenis_barang = data['jenis_barang']
            stok_barang = int(data['stok_barang'])
            harga_barang = float(data['harga_barang'])
            barang.insert_one({
                'nama_barang': nama_barang,
                'jenis_barang': jenis_barang,
                'stok_barang': stok_barang,
                'harga_barang': harga_barang
            })
            return jsonify({'success': True, 'message': 'Barang berhasil ditambahkan'})
        
    elif request.method == 'GET':            
            inventory_summary = list(barang.find())
            
            for item in inventory_summary:
                item['_id'] = str(item['_id'])
            return jsonify({'success': True, 'inventory_summary': inventory_summary})

    elif request.method == 'POST':
        if 'username' in session and session['role'] == 'admin':
            data = request.json
            nama_barang = data['nama_barang']
            jenis_barang = data['jenis_barang']
            stok_barang = int(data['stok_barang'])
            harga_barang = float(data['harga_barang'])
            barang.insert_one({
                'nama_barang': nama_barang,
                'jenis_barang': jenis_barang,
                'stok_barang': stok_barang,
                'harga_barang': harga_barang
            })
            return jsonify({'success': True, 'message': 'Barang berhasil ditambahkan'})
        return jsonify({'success': False, 'message': 'Unauthorized'})

@app.route('/api/inventory/<id>', methods=['PUT', 'DELETE'])
def edit_delete_inventory(id):
    if request.method == 'PUT':
        data = request.json
        # Lakukan update berdasarkan _id
        barang.update_one({'_id': ObjectId(id)}, {'$set': {
            'nama_barang': data['nama_barang'],
            'jenis_barang': data['jenis_barang'],
            'stok_barang': int(data['stok_barang']),
            'harga_barang': float(data['harga_barang'])
        }})
        return jsonify({'success': True, 'message': 'Barang berhasil diupdate'})

    elif request.method == 'DELETE':
        # Hapus barang berdasarkan _id
        barang.delete_one({'_id': ObjectId(id)})
        return jsonify({'success': True, 'message': 'Barang berhasil dihapus'})

@app.route('/api/pegawai', methods=['GET', 'POST'])
def manage_pegawai():
    if request.method == 'GET':
        pegawai_list = list(pegawai.find({'role': 'pegawai'}))
        for item in pegawai_list:
            item['_id'] = str(item['_id'])
        return jsonify({'success': True, 'pegawai': pegawai_list})

    elif request.method == 'POST':
        data = request.json
        username = data['username']
        tempat_lahir = data['tempat_lahir']
        tanggal_lahir_str = data['tanggal_lahir']
        tanggal_lahir = datetime.strptime(tanggal_lahir_str, '%Y-%m-%d')
        jenis_kelamin = data['jenis_kelamin']
        alamat = data['alamat']
        password = data['password']
        role = data['role']
        
        pegawai.insert_one({
            'username': username,
            'tempatLahir': tempat_lahir,
            'tanggalLahir': tanggal_lahir,
            'jenisKelamin': jenis_kelamin,
            'alamat': alamat,
            'password': password,
            'role': role
        })
        return jsonify({'success': True, 'message': 'Pegawai berhasil ditambahkan'})
    
@app.route('/api/pegawai/<id>', methods=['PUT', 'DELETE'])
def edit_delete_pegawai(id):
    if request.method == 'PUT':
        data = request.json
        # Lakukan update berdasarkan _id
        pegawai.update_one({'_id': ObjectId(id)}, {'$set': {
            'username': data['username'],
            'tempatLahir': data['tempatLahir'],
            'tanggalLahir': datetime.strptime(data['tanggalLahir'], '%Y-%m-%d'),
            'jenisKelamin': data['jenisKelamin'],
            'alamat': data['alamat'],
        }})
        return jsonify({'success': True, 'message': 'Pegawai berhasil diupdate'})

    elif request.method == 'DELETE':
        # Hapus pegawai berdasarkan _id
        pegawai.delete_one({'_id': ObjectId(id)})
        return jsonify({'success': True, 'message': 'Pegawai berhasil dihapus'})

@app.route('/api/transactions', methods=['GET'])
def get_transactions():
        transactions_list = list(transaksi.find())
        
        for item in transactions_list:
            item['_id'] = str(item['_id'])
        
        return jsonify({'success': True, 'transactions': transactions_list})
    
@app.route('/api/export_transactions', methods=['GET'])
def export_transactions():
    export_format = request.args.get('format')
    
    transactions_list = list(transaksi.find())
    for item in transactions_list:
        item['_id'] = str(item['_id'])
    
    df = pd.DataFrame(transactions_list)
    
    if export_format == 'csv':
        csv_data = df.to_csv(index=False)
        response = BytesIO()
        response.write(csv_data.encode('utf-8'))
        response.seek(0)
        return send_file(response, mimetype='text/csv', as_attachment=True, download_name='transactions.csv')
    
    elif export_format == 'pdf':
        response = BytesIO()
        c = canvas.Canvas(response, pagesize=letter)
        width, height = letter

        c.drawString(30, height - 30, 'Transaction List')
        
        y = height - 50
        for column in df.columns:
            c.drawString(30, y, column)
            y -= 15

        y = height - 65
        for index, row in df.iterrows():
            x = 30
            for column in df.columns:
                c.drawString(x, y, str(row[column]))
                x += 100
            y -= 15
            if y < 40:
                c.showPage()
                y = height - 50
        
        c.save()
        response.seek(0)
        return send_file(response, mimetype='application/pdf', as_attachment=True, download_name='transactions.pdf')
    
    else:
        return jsonify({'success': False, 'message': 'Invalid format specified'})

if __name__ == '__main__':
    app.run(debug=True)
