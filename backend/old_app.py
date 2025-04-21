from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
from dotenv import load_dotenv
import openai
import ssl
import logging
import time
from docxtpl import DocxTemplate
import io
import json
import httpx

# RQ/Redis imports
import os
import redis
from rq import Queue
try:
    from backend.tasks import generate_tia_report
except ImportError:
    # Try local import if not in package structure
    from tasks import generate_tia_report

load_dotenv()

# UNCOMMENT FOR PRODUCTION
redis_url = os.getenv("REDIS_URL")
if not redis_url:
    raise ValueError("REDIS_URL not set. Please export REDIS_URL before importing this module.")
conn = redis.from_url(redis_url)
q = Queue("default", connection=conn)

import traceback

# Configure OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

# Flask app configuration
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
logging.basicConfig(level=logging.DEBUG)
app.logger.setLevel(logging.DEBUG)

@app.before_request
def log_request_info():
    app.logger.debug("Headers: %s", request.headers)
    app.logger.debug("Body: %s", request.get_data())

@app.after_request
def log_response_info(response):
    app.logger.debug("Response status: %s", response.status)
    return response

@app.route('/', methods=['GET'])
def home():
    return "TIA Generator Backend is Running.", 200

@app.route('/download-docx', methods=['POST'])
def download_docx():
    data = request.get_json()
    if data is None:
        return jsonify({"error": "No JSON received"}), 400
    
    app.logger.debug("Received data for docx generation: %s", data)

    # data now contains both formData and tiaReport keys.
    # tiaReport keys are the placeholders you want to fill:
    context = {
        'development_type': data["project_details"].get('development_type', ''),
        'council': data["project_details"].get('council', ''),
        'client_name': data["project_details"].get('client_name', ''),
        'site_address': data["project_details"].get('site_address', ''),
        'introduction_purpose': data.get('introduction_purpose', ''),
        'existing_conditions_site_location': data.get('existing_conditions_site_location', ''),
        'existing_conditions_land_use': data.get('existing_conditions_land_use', ''),
        'existing_conditions_road_network': data.get('existing_conditions_road_network', ''),
        'existing_conditions_public_transport': data.get('existing_conditions_public_transport', ''),
        'proposal_description': data.get('proposal_description', ''),
        'proposal_facilities': data.get('proposal_facilities', ''),
        'proposal_parking': data.get('proposal_parking', ''),
        'parking_existing_provision': data.get('parking_existing_provision', ''),
        'parking_proposed_provision': data.get('parking_proposed_provision', ''),
        'parking_rates_calculations': data.get('parking_rates_calculations', ''),
        'parking_expected_patrons': data.get('parking_expected_patrons', ''),
        'parking_justification': data.get('parking_justification', ''),
        'parking_design_dimensions': data.get('parking_design_dimensions', ''),
        'parking_design_compliance': data.get('parking_design_compliance', ''),
        'other_bicycle_parking': data.get('other_bicycle_parking', ''),
        'other_loading_waste': data.get('other_loading_waste', ''),
        'other_traffic_generation': data.get('other_traffic_generation', ''),
        'conclusion_summary': data.get('conclusion_summary', '')
    }

    app.logger.debug("Context for docx template rendering: %s", context)

    # Check if all fields are as expected
    for key, value in context.items():
        app.logger.debug("Context field '%s': '%s'", key, value)

    try:
        template_path = 'templates/tia_template.docx'
        doc = DocxTemplate(template_path)
        doc.render(context)
        app.logger.debug("Docx template rendered successfully.")

        output_stream = io.BytesIO()
        doc.save(output_stream)
        output_stream.seek(0)
        app.logger.debug("Docx file generated successfully, returning file.")

        return send_file(
            output_stream,
            as_attachment=True,
            download_name='TIA_Report.docx',
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
    except Exception as e:
        import traceback
        tb_str = ''.join(traceback.format_exception(None, e, e.__traceback__))
        app.logger.error("Error generating docx: %s", tb_str)
        return jsonify({"error": str(e), "traceback": tb_str}), 500

@app.route('/generate-tia', methods=['POST'])
def enqueue_generate_tia():
    data = request.get_json()
    if data is None:
        return jsonify({"error": "No JSON received"}), 400

    # Enqueue the job
    job = q.enqueue(generate_tia_report, data)
    return jsonify({"job_id": job.get_id()}), 202

@app.route('/job-status/<job_id>', methods=['GET'])
def job_status(job_id):
    job = q.fetch_job(job_id)
    if job is None:
        return jsonify({"error": "Job not found"}), 404
    if job.is_finished:
        return jsonify({"status": "finished", "result": job.result}), 200
    elif job.is_failed:
        return jsonify({"status": "failed", "error": str(job.exc_info)}), 500
    else:
        return jsonify({"status": job.get_status()}), 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(debug=True, host="0.0.0.0", port=port)

