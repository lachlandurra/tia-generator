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
from .app import generate_tia_report



redis_url = os.getenv("REDIS_URL")
if not redis_url:
    raise ValueError("REDIS_URL not set. Please export REDIS_URL before importing this module.")
conn = redis.from_url(redis_url)
q = Queue("default", connection=conn)

import traceback

load_dotenv()

# Configure OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

# Flask app configuration
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
logging.basicConfig(level=logging.DEBUG)
app.logger.setLevel(logging.DEBUG)

# Setup Redis and RQ
# redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')
# conn = redis.from_url(redis_url)
# q = Queue('default', connection=conn)

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

def generate_tia_report(data):
    """
    This function runs in a background worker. It takes the input data,
    sends a prompt to OpenAI, and returns the generated JSON content.
    """
    project_details = data.get('project_details', {})
    introduction = data.get('introduction', {})
    existing_conditions = data.get('existing_conditions', {})
    proposal = data.get('proposal', {})
    parking_assessment = data.get('parking_assessment', {})
    parking_design = data.get('parking_design', {})
    other_matters = data.get('other_matters', {})
    conclusion = data.get('conclusion', {})

    prompt = f"""
You are a traffic engineer tasked with generating a Traffic Impact Assessment (TIA) report based on the given input. 
The input is rough, containing only brief points. You must produce a coherent, formal, and detailed TIA report that greatly expands and formalizes each section.

The final output MUST be in JSON format with the below keys and no extra text outside JSON. When it says "A fully formed paragraph(s) based on..." that means you must expand on the text after 'based on':

{{
"introduction_purpose": "A fully formed paragraph(s) based on {introduction.get('purpose', '')}",
"existing_conditions_site_location": "A fully formed paragraph(s) expanding on {existing_conditions.get('site_location_description', '')}",
"existing_conditions_land_use": "A fully formed paragraph(s) from {existing_conditions.get('existing_land_use_and_layout', '')}",
"existing_conditions_road_network": "A fully formed paragraph(s) from {existing_conditions.get('surrounding_road_network_details', '')}",
"existing_conditions_public_transport": "A fully formed paragraph(s) from {existing_conditions.get('public_transport_options', '')}",
"proposal_description": "A fully formed paragraph(s) from {proposal.get('description', '')}",
"proposal_facilities": "A fully formed paragraph(s) from {proposal.get('facilities_details', '')}",
"proposal_parking": "A fully formed paragraph(s) from {proposal.get('parking_arrangement', '')}",
"parking_existing_provision": "A fully formed paragraph(s) from {parking_assessment.get('existing_parking_provision', '')}",
"parking_proposed_provision": "A fully formed paragraph(s) from {parking_assessment.get('proposed_parking_provision', '')}",
"parking_rates_calculations": "A fully formed paragraph(s) from {parking_assessment.get('parking_rates_calculations', '')}",
"parking_expected_patrons": "A fully formed paragraph(s) from {parking_assessment.get('expected_patrons', '')}",
"parking_justification": "A fully formed paragraph(s) from {parking_assessment.get('justification', '')}",
"parking_design_dimensions": "A fully formed paragraph(s) from {parking_design.get('dimensions_layout', '')}",
"parking_design_compliance": "A fully formed paragraph(s) from {parking_design.get('compliance', '')}",
"other_bicycle_parking": "A fully formed paragraph(s) from {other_matters.get('bicycle_parking', '')}",
"other_loading_waste": "A fully formed paragraph(s) from {other_matters.get('loading_and_waste', '')}",
"other_traffic_generation": "A fully formed paragraph(s) from {other_matters.get('traffic_generation', '')}",
"conclusion_summary": "A fully formed paragraph(s) from {conclusion.get('summary', '')}"
}}

Each value should contain a detailed, formalized paragraph or paragraphs that elaborate significantly on the user's rough input. Make sure the text is coherent, uses Australian English, and is professional. Do not include any content outside the JSON object.
    """

    max_retries = 5
    retry_delay = 1

    for attempt in range(max_retries):
        try:
            response = openai.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=4000,
                temperature=0.7
            )
            tia_report_json = response.choices[0].message.content.strip()


            # Parse the JSON returned by OpenAI
            import json
            
            # Parse the JSON returned by OpenAI
            import json
            try:
                tia_data = json.loads(tia_report_json)
                return tia_data
            except json.JSONDecodeError:
                return {"error": "The AI did not return valid JSON."}

        except openai.RateLimitError:
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
                retry_delay *= 2
                continue
            else:
                return {'error': 'Rate limit exceeded. Please try again later.'}

        except openai.APIConnectionError:
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
                retry_delay *= 2
                continue
            else:
                return {'error': 'Unable to connect to OpenAI API. Please try again later.'}

        except openai.APIError:
            return {'error': 'An error occurred while processing your request.'}

        except Exception as e:
            tb_str = ''.join(traceback.format_exception(None, e, e.__traceback__))
            return {"error": str(e), "traceback": tb_str}

    return {"error": "Failed to generate TIA after multiple attempts."}

@app.route('/download-docx', methods=['POST'])
def download_docx():
    data = request.get_json()
    if data is None:
        return jsonify({"error": "No JSON received"}), 400
    
    app.logger.debug("Received data for docx generation: %s", data)

    # data now contains both formData and tiaReport keys.
    # tiaReport keys are the placeholders you want to fill:
    context = {
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

