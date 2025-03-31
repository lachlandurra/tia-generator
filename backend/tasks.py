import os
import time
import openai
import traceback
from dotenv import load_dotenv

load_dotenv()

# Configure OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

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

        except openai.APIError as api_err:
            # Log the error details to your console or a file
            print("OpenAI APIError:", api_err)
            # Optionally include more details from the exception, e.g., error code or http_body
            return {'error': f'OpenAI APIError: {str(api_err)}'}


        except Exception as e:
            tb_str = ''.join(traceback.format_exception(None, e, e.__traceback__))
            return {"error": str(e), "traceback": tb_str}

    return {"error": "Failed to generate TIA after multiple attempts."}
