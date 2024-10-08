# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import openai
import logging
import time
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
# Allow both localhost and 127.0.0.1 in development
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}})
logging.basicConfig(level=logging.DEBUG)

# Set OpenAI API key
openai.api_key = os.getenv('OPENAI_API_KEY')

# Root route
@app.route('/', methods=['GET'])
def home():
    return "TIA Generator Backend is Running.", 200

@app.route('/test-openai', methods=['GET'])
def test_openai():
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Hello!"},
            ],
        )
        message = response.choices[0].message.content.strip()
        return jsonify({'message': message})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/generate-tia', methods=['POST'])
def generate_tia():
    data = request.json

    # Extract data from the request
    project_details = data.get('project_details', {})
    introduction = data.get('introduction', {})
    existing_conditions = data.get('existing_conditions', {})
    proposal = data.get('proposal', {})
    parking_assessment = data.get('parking_assessment', {})
    parking_design = data.get('parking_design', {})
    other_matters = data.get('other_matters', {})
    conclusion = data.get('conclusion', {})

    # Construct the prompt for OpenAI API
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
Report Version: {project_details.get('report_version', '')}

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

Generate a comprehensive Traffic Impact Assessment report based on the above information. The report should follow standard formatting and include all necessary sections such as Introduction, Existing Conditions, The Proposal, Parking Assessment, Parking Space Design, Other Matters, and Conclusion. Use Australian English and ensure that the report is suitable for submission to local council authorities.

Note: Where specific details are not provided, make reasonable assumptions based on standard practices, but indicate that these are assumptions.
    """

    max_retries = 5
    retry_delay = 1  # Start with a 1-second delay

    for attempt in range(max_retries):
        try:
            # Create a chat completion using the OpenAI API
            response = openai.ChatCompletion.create(
                messages=[
                    {"role": "user", "content": prompt}
                ],
                model="gpt-3.5-turbo",
                max_tokens=2000,  # Increased to allow for a detailed report
                temperature=0.7,
            )
            tia_report = response.choices[0].message.content.strip()
            return jsonify({'tia_report': tia_report})
        except openai.error.RateLimitError as e:
            if attempt < max_retries - 1:
                logging.warning(f"Rate limit exceeded. Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
                retry_delay *= 2  # Exponential backoff
                continue
            else:
                logging.error(f"Rate limit exceeded after {max_retries} attempts: {e}")
                return jsonify({'error': 'Rate limit exceeded. Please try again later.'}), 429
        except openai.error.APIConnectionError as e:
            if attempt < max_retries - 1:
                logging.warning(f"API connection error. Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
                retry_delay *= 2
                continue
            else:
                logging.error(f"API connection error after {max_retries} attempts: {e}")
                return jsonify({'error': 'Unable to connect to OpenAI API. Please try again later.'}), 503
        except openai.error.APIError as e:
            logging.error(f"API error: {e}")
            return jsonify({'error': 'An error occurred while processing your request.'}), 500
        except Exception as e:
            logging.error(f"Unexpected error: {e}")
            return jsonify({'error': 'An unexpected error occurred.'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=4999)
