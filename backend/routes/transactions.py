from flask import Blueprint, request, jsonify, send_file
from models import transaksi
from bson.son import SON
from datetime import datetime
import pandas as pd
from io import BytesIO
import logging
import csv
from routes.dashboard import token_required

transactions_bp = Blueprint('transactions', __name__)

logging.basicConfig(level=logging.INFO)

# Route to get transactions
@transactions_bp.route('/api/transactions', methods=['GET'])
@token_required
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

# Route to export transactions
@transactions_bp.route('/api/export_transactions', methods=['GET'])
@token_required
def export_transactions():
    export_format = request.args.get('format')
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')

    current_date = datetime.now().strftime('%Y-%m-%d')

    # Fetch transactions based on the date range provided
    if start_date_str and end_date_str:
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
        transactions_list = list(transaksi().find({
            'tanggal_transaksi': {
                '$gte': start_date,
                '$lte': end_date
            }
        }))
        date_range_text = f"Periode: {start_date_str} - {end_date_str}"
    else:
        transactions_list = list(transaksi().find())
        date_range_text = "Periode: Semua data"

    for item in transactions_list:
        item['_id'] = str(item['_id'])

    # Convert data to a DataFrame
    df = pd.DataFrame(transactions_list)
    df.drop(columns=['_id'], inplace=True)

    if export_format == 'excel':
        output = BytesIO()
        writer = pd.ExcelWriter(output, engine='xlsxwriter')
        workbook = writer.book
        worksheet = workbook.add_worksheet('Transactions')

        # Define formats
        title_format = workbook.add_format({'bold': True, 'font_size': 14})
        date_range_format = workbook.add_format({'italic': True})
        
        # Header format: Light blue background, bold, with border
        header_format = workbook.add_format({
            'bold': True,
            'bg_color': '#ADD8E6',  # Light blue color
            'border': 1
        })
        
        # Data format: With border
        data_format = workbook.add_format({'border': 1})

        # Add title to the worksheet
        worksheet.merge_range('A1:H1', 'LAPORAN TRANSAKSI CV BERKAT', title_format)
        
        # Add date range information
        worksheet.merge_range('A2:H2', date_range_text, date_range_format)

        # Write column headers with the new format
        for i, column in enumerate(df.columns):
            worksheet.write(3, i, column, header_format)

        # Apply date format for 'tanggal_transaksi' column
        date_format = workbook.add_format({'num_format': 'yyyy-mm-dd hh:mm:ss', 'border': 1})

        # Write data to the worksheet with borders
        for row_num, row_data in enumerate(df.values, 4):
            for col_num, cell_data in enumerate(row_data):
                if df.columns[col_num] == 'tanggal_transaksi':
                    # Convert the timestamp into a proper datetime object
                    if isinstance(cell_data, str):
                        try:
                            cell_data = datetime.strptime(cell_data, '%Y-%m-%d %H:%M:%S')
                        except ValueError:
                            pass  # Handle error if string is not a date
                    worksheet.write_datetime(row_num, col_num, cell_data, date_format)
                else:
                    worksheet.write(row_num, col_num, cell_data, data_format)

        # Adjust column width for better readability
        worksheet.set_column('A:H', 20)

        # Save the file
        writer.close()
        output.seek(0)
        filename = f'transaction_{current_date}.xlsx'
        return send_file(output, mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                            as_attachment=True, download_name=filename)

    if export_format == 'csv':
        csv_data = df.to_csv(index=False)
        response = BytesIO()
        response.write(csv_data.encode('utf-8'))
        response.seek(0)
        filename = f'transaction_{current_date}.csv'
        return send_file(response, mimetype='text/csv', as_attachment=True, download_name=filename)

    return jsonify({'success': False, 'message': 'Invalid format specified'})


# Route to import transactions
@transactions_bp.route('/api/import_transactions', methods=['POST'])
@token_required
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
                # Parse the date, handling different formats
                tanggal_transaksi = pd.to_datetime(row['tanggal_transaksi'], errors='coerce', format='%Y-%m-%d %H:%M:%S')
                if pd.isna(tanggal_transaksi):
                    raise ValueError("Invalid date format")

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

# Route to get aggregated transactions by date
@transactions_bp.route('/api/transactions_by_date', methods=['GET'])
@token_required
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
