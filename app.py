# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from openai import OpenAI
import logging

app = Flask(__name__)
# Allow both localhost and 127.0.0.1 in development
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}})
logging.basicConfig(level=logging.DEBUG)

# Initialize the OpenAI client
client = OpenAI(
    api_key=os.getenv('OPENAI_API_KEY')
)

# Root route
@app.route('/', methods=['GET'])
def home():
    return "TIA Generator Backend is Running.", 200

@app.route('/generate-tia', methods=['POST'])
def generate_tia():
    data = request.json

    # Extract data from the request
    site_location = data.get('site_location')
    site_type = data.get('site_type')
    existing_conditions = data.get('existing_conditions')
    existing_use = data.get('existing_use')
    proposal = data.get('proposal')
    parking_assessment = data.get('parking_assessment')
    compliance_comments = data.get('compliance_comments')
    other_matters = data.get('other_matters')

    # Construct the prompt for OpenAI API
    prompt = f"""
    Generate a Traffic Impact Assessment (TIA) report based on the following information:

    Site Location: {site_location}
    Site Type: {site_type}
    Existing Conditions: {existing_conditions}
    Existing Use: {existing_use}
    Proposal: {proposal}
    Parking Assessment: {parking_assessment}
    Compliance Comments: {compliance_comments}
    Other Matters: {other_matters}

    The report should follow the standard format and include all necessary sections such as Introduction, Existing Conditions, Proposal, Parking Assessment, Other Matters, and Conclusions.
    """

    try:
        # Create a chat completion using the new client
        response = client.chat.completions.create(
            messages=[
                {"role": "user", "content": prompt}
            ],
            model="gpt-3.5-turbo",
            max_tokens=1500,
            temperature=0.7,
        )
        tia_report = response.choices[0].message.content.strip()
        return jsonify({'tia_report': tia_report})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=4999)