from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
from dotenv import load_dotenv
import openai
import logging
import time
from docxtpl import DocxTemplate
import io

load_dotenv()

openai.api_key = os.getenv('OPENAI_API_KEY')

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
logging.basicConfig(level=logging.DEBUG)

@app.route('/', methods=['GET'])
def home():
    return "TIA Generator Backend is Running.", 200

@app.route('/generate-tia', methods=['POST'])
def generate_tia():
    data = request.get_json()
    if data is None:
        return jsonify({"error": "No JSON received"}), 400

    project_details = data.get('project_details', {})
    introduction = data.get('introduction', {})
    existing_conditions = data.get('existing_conditions', {})
    proposal = data.get('proposal', {})
    parking_assessment = data.get('parking_assessment', {})
    parking_design = data.get('parking_design', {})
    other_matters = data.get('other_matters', {})
    conclusion = data.get('conclusion', {})

    # Construct the prompt
    prompt = f"""
You are a traffic engineer tasked with generating a Traffic Impact Assessment (TIA) report based on the following information:

### Project Details
Project Title: {project_details.get('project_title', '')}
Site Address: {project_details.get('site_address', '')}
Prepared By:
  - Name: {project_details.get('consultant_name', '')}
  - Company: {project_details.get('company_name', '')}
  - Qualifications: {project_details.get('qualifications', '')}
  - Contact Details: {project_details.get('contact_details', '')}
Client Name: {project_details.get('client_name', '')}
Report Date: {project_details.get('report_date', '')}

### Introduction
Purpose of the Report: {introduction.get('purpose', '')}
Council Feedback: {introduction.get('council_feedback', '')}

### Existing Conditions
Site Location Description: {existing_conditions.get('site_location_description', '')}
Existing Land Use and Layout: {existing_conditions.get('existing_land_use_and_layout', '')}
Surrounding Road Network Details: {existing_conditions.get('surrounding_road_network_details', '')}
Public Transport Options: {existing_conditions.get('public_transport_options', '')}

### The Proposal
Description of Proposed Development: {proposal.get('description', '')}
Details of Proposed Facilities: {proposal.get('facilities_details', '')}
Proposed Parking Arrangement: {proposal.get('parking_arrangement', '')}

### Parking Assessment
Existing Parking Provision: {parking_assessment.get('existing_parking_provision', '')}
Proposed Parking Provision: {parking_assessment.get('proposed_parking_provision', '')}
Applicable Parking Rates and Calculations: {parking_assessment.get('parking_rates_calculations', '')}
Expected Number of Patrons: {parking_assessment.get('expected_patrons', '')}
Justification for Parking Provision: {parking_assessment.get('justification', '')}

### Parking Space Design
Dimensions and Layout: {parking_design.get('dimensions_layout', '')}
Compliance with Standards: {parking_design.get('compliance', '')}

### Other Matters
Bicycle Parking Requirements and Provision: {other_matters.get('bicycle_parking', '')}
Loading and Waste Collection Details: {other_matters.get('loading_and_waste', '')}
Traffic Generation Estimates: {other_matters.get('traffic_generation', '')}

### Conclusion
Summary of Findings: {conclusion.get('summary', '')}

Generate a comprehensive Traffic Impact Assessment report based on the above information. Use Australian English and be very detailed.

Each paragraph in the Existing Conditions, The Proposal, Parking Assessment, Parking Space Design, Other Matters, Conclusion sections should be at least 100 words. 
    """

    max_retries = 5
    retry_delay = 1

    for attempt in range(max_retries):
        try:
            # Use the new API interface
            response = openai.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=4000,
                temperature=0.7
            )
            tia_report = response.choices[0].message.content.strip()
            return jsonify({'tia_report': tia_report})

        except openai.RateLimitError:
            # Rate limit exceeded
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
                retry_delay *= 2
                continue
            else:
                return jsonify({'error': 'Rate limit exceeded. Please try again later.'}), 429

        except openai.APIConnectionError:
            # Connection error
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
                retry_delay *= 2
                continue
            else:
                return jsonify({'error': 'Unable to connect to OpenAI API. Please try again later.'}), 503

        except openai.APIError:
            # Generic API error
            return jsonify({'error': 'An error occurred while processing your request.'}), 500

        except Exception:
            # Catch-all for unexpected errors
            return jsonify({'error': 'An unexpected error occurred.'}), 500

@app.route('/download-docx', methods=['POST'])
def download_docx():
    data = request.get_json()
    if data is None:
        return jsonify({"error": "No JSON received"}), 400

    project_details = data.get('project_details', {})
    introduction = data.get('introduction', {})
    existing_conditions = data.get('existing_conditions', {})
    proposal = data.get('proposal', {})
    parking_assessment = data.get('parking_assessment', {})
    parking_design = data.get('parking_design', {})
    other_matters = data.get('other_matters', {})
    conclusion = data.get('conclusion', {})

    context = {
        'project_title': project_details.get('project_title', ''),
        'site_address': project_details.get('site_address', ''),
        'consultant_name': project_details.get('consultant_name', ''),
        'company_name': project_details.get('company_name', ''),
        'client_name': project_details.get('client_name', ''),
        'report_date': project_details.get('report_date', ''),

        'introduction_purpose': introduction.get('purpose', ''),
        'introduction_council_feedback': introduction.get('council_feedback', ''),

        'existing_conditions_site_location': existing_conditions.get('site_location_description', ''),
        'existing_conditions_land_use': existing_conditions.get('existing_land_use_and_layout', ''),
        'existing_conditions_road_network': existing_conditions.get('surrounding_road_network_details', ''),
        'existing_conditions_public_transport': existing_conditions.get('public_transport_options', ''),

        'proposal_description': proposal.get('description', ''),
        'proposal_facilities': proposal.get('facilities_details', ''),
        'proposal_parking': proposal.get('parking_arrangement', ''),

        'parking_existing_provision': parking_assessment.get('existing_parking_provision', ''),
        'parking_proposed_provision': parking_assessment.get('proposed_parking_provision', ''),
        'parking_rates_calculations': parking_assessment.get('parking_rates_calculations', ''),
        'parking_expected_patrons': parking_assessment.get('expected_patrons', ''),
        'parking_justification': parking_assessment.get('justification', ''),

        'parking_design_dimensions': parking_design.get('dimensions_layout', ''),
        'parking_design_compliance': parking_design.get('compliance', ''),

        'other_bicycle_parking': other_matters.get('bicycle_parking', ''),
        'other_loading_waste': other_matters.get('loading_and_waste', ''),
        'other_traffic_generation': other_matters.get('traffic_generation', ''),

        'conclusion_summary': conclusion.get('summary', '')
    }

    template_path = 'templates/tia_template.docx'
    doc = DocxTemplate(template_path)
    doc.render(context)

    output_stream = io.BytesIO()
    doc.save(output_stream)
    output_stream.seek(0)

    return send_file(
        output_stream,
        as_attachment=True,
        download_name='TIA_Report.docx',
        mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )

if __name__ == '__main__':
    app.run(debug=True, port=4999)
