from flask import Blueprint, request, jsonify, send_file
from models import transaksi
from bson.son import SON
from datetime import datetime
import pandas as pd
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import csv
import logging

transactions_bp = Blueprint('transactions', __name__)

logging.basicConfig(level=logging.INFO)

@transactions_bp.route('/api/transactions', methods=['GET'])
def get_transactions():
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')

    if start_date_str and end_date_str:
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
        transactions_list = list(transaksi().find({
            'tanggal_transaksi': {
                '$gte': start_date,
                '$lte': end_date
            }
        }))
    else:
        transactions_list = list(transaksi().find())
        
    for item in transactions_list:
        item['_id'] = str(item['_id'])
    return jsonify({'success': True, 'transactions': transactions_list})

@transactions_bp.route('/api/export_transactions', methods=['GET'])
def export_transactions():
    export_format = request.args.get('format')
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')

    current_date = datetime.now().strftime('%Y-%m-%d')

    if start_date_str and end_date_str:
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
        transactions_list = list(transaksi().find({
            'tanggal_transaksi': {
                '$gte': start_date,
                '$lte': end_date
            }
        }))
    else:
        transactions_list = list(transaksi().find())
        
    for item in transactions_list:
        item['_id'] = str(item['_id'])

    df = pd.DataFrame(transactions_list)

    df.drop(columns=['_id'], inplace=True)

    if export_format == 'csv':
        csv_data = df.to_csv(index=False)
        response = BytesIO()
        response.write(csv_data.encode('utf-8'))
        response.seek(0)
        filename = f'transaction_{current_date}.csv'
        return send_file(response, mimetype='text/csv', as_attachment=True, download_name=filename)

    elif export_format == 'excel':
        output = BytesIO()
        writer = pd.ExcelWriter(output, engine='xlsxwriter')
        df.to_excel(writer, index=False, sheet_name='Transactions')
        writer.close()
        output.seek(0)
        filename = f'transaction_{current_date}.xlsx'
        return send_file(output, mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', as_attachment=True, download_name=filename)

    return jsonify({'success': False, 'message': 'Invalid format specified'})

@transactions_bp.route('/api/import_transactions', methods=['POST'])
def import_transactions():
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'message': 'No selected file'}), 400

    if file and file.filename.endswith('.csv'):
        # Read the CSV file
        df = pd.read_csv(file)

        # Ensure the column names match by stripping spaces and lowercasing them
        df.columns = df.columns.str.strip().str.lower()

        for index, row in df.iterrows():
            try:
                # Ensure tanggal_transaksi is not None before parsing
                if row.get('tanggal_transaksi') is not None:
                    # Parse the date, handling different formats
                    tanggal_transaksi = pd.to_datetime(row['tanggal_transaksi'], errors='coerce', format='%Y-%m-%d')
                    if pd.isna(tanggal_transaksi):
                        raise ValueError("Invalid date format")
                else:
                    logging.warning(f"Skipping row {index} due to missing 'tanggal_transaksi'")
                    continue  # Skip this row if tanggal is None

                # Create the transaction object
                transaction = {
                    'kode_barang': row.get('kode_barang'),
                    'tanggal_transaksi': tanggal_transaksi,
                    'nama_barang': row.get('nama_barang'),
                    'jenis_barang': row.get('jenis_barang'),
                    'jumlah_barang': row.get('jumlah_barang'),
                    'berat': row.get('berat'),
                    'harga': row.get('harga'),
                    'harga_total': row.get('harga_total'),
                    'pelanggan': row.get('pelanggan'),
                    'nama_pegawai': row.get('nama_pegawai'),
                }

                # Insert the transaction into the database
                result = transaksi().insert_one(transaction)
                logging.info(f"Inserted transaction with id: {result.inserted_id}")

            except Exception as e:
                logging.error(f"Error processing row {index}: {e}")

        return jsonify({'success': True, 'message': 'Transactions imported successfully'}), 200

    return jsonify({'success': False, 'message': 'Invalid file type. Please upload a CSV file.'}), 400

@transactions_bp.route('/api/transactions_by_date', methods=['GET'])
def get_transactions_by_date():
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')

    start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
    end_date = datetime.strptime(end_date_str, '%Y-%m-%d')

    pipeline = [
        {
            '$match': {
                'tanggal_transaksi': {
                    '$gte': start_date,
                    '$lte': end_date
                }
            }
        },
        {
            '$group': {
                '_id': {
                    '$dateToString': { 'format': '%Y-%m-%d', 'date': '$tanggal_transaksi' }
                },
                'total_pendapatan': { '$sum': '$harga_total' }
            }
        },
        {
            '$sort': SON([('_id', 1)])  # Sort by date
        }
    ]

    transactions = list(transaksi().aggregate(pipeline))
    return jsonify({'success': True, 'transactions': transactions})
