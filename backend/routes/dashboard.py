from flask import Blueprint, jsonify, session
from models import barang, pegawai

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/home', methods=['GET'])
def homedashboard():
 # Check if the user is in session
    if 'user_id' in session:
        return jsonify({
            'success': True,
            'message': 'User authenticated'
        }), 200
    
    # Fetch data if the user is authenticated
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
        'employee_summary': employee_summary
    })
