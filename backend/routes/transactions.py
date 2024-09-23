from flask import Blueprint, request, jsonify, send_file
from models import transaksi
from bson.son import SON
from datetime import datetime
import pandas as pd
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

transactions_bp = Blueprint('transactions', __name__)

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
