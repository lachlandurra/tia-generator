#!/usr/bin/env python3
"""
Document generator for TIA reports.
Handles generation of DOCX files from TIA data.
"""

import os
import io
import asyncio
import logging
from typing import Dict, Any, Tuple
from datetime import datetime

from docxtpl import DocxTemplate

# Configure logging
logger = logging.getLogger("tia-generator.docx")

async def generate_docx(tia_data: Dict[str, Any], project_data: Dict[str, Any]) -> Tuple[io.BytesIO, str]:
    """
    Generate a DOCX file from TIA report data
    
    Args:
        tia_data: The generated TIA report data
        project_data: Project details data
    
    Returns:
        A tuple containing the document bytes and filename
    """
    # Use async executor to run DocxTemplate in a separate thread
    # since it's a CPU-bound operation
    return await asyncio.to_thread(_generate_docx_sync, tia_data, project_data)

def _generate_docx_sync(tia_data: Dict[str, Any], project_data: Dict[str, Any]) -> Tuple[io.BytesIO, str]:
    """
    Synchronous implementation of DOCX generation
    """
    try:
        # Prepare context for template rendering
        context = _prepare_docx_context(tia_data, project_data)
        
        # Load template
        template_path = os.path.join('templates', 'tia_template.docx')
        doc = DocxTemplate(template_path)
        
        # Render template
        logger.info("Rendering DOCX template")
        doc.render(context)
        
        # Save to BytesIO
        output = io.BytesIO()
        doc.save(output)
        output.seek(0)
        
        # Generate filename
        project_title = project_data.get('project_details', {}).get('project_title', 'TIA_Report')
        sanitized_title = ''.join(c if c.isalnum() else '_' for c in project_title)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{sanitized_title}_{timestamp}.docx"
        
        logger.info(f"DOCX file generated successfully: {filename}")
        return output, filename
        
    except Exception as e:
        logger.error(f"Error generating DOCX: {str(e)}")
        raise

def _prepare_docx_context(tia_data: Dict[str, Any], project_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Prepare context for DOCX template rendering
    
    Args:
        tia_data: The generated TIA report data
        project_data: Project details data
    
    Returns:
        A dictionary with all context keys for template rendering
    """
    # Get project details
    project_details = project_data.get('project_details', {})
    
    # Create context with all possible keys to avoid KeyErrors in template
    context = {
        # Project details
        'development_type': project_details.get('development_type', ''),
        'council': project_details.get('council', ''),
        'client_name': project_details.get('client_name', ''),
        'site_address': project_details.get('site_address', ''),
        'project_title': project_details.get('project_title', ''),
        'consultant_name': project_details.get('consultant_name', 'Dai Wang'),
        'company_name': project_details.get('company_name', 'TrafficAble Consultants'),
        'qualifications': project_details.get('qualifications', 'B.Eng (Civil), MEng Study (Traffic and Transport)'),
        'contact_details': project_details.get('contact_details', 'Email: trafficable@gmail.com, Mobile: 0450461917'),
        'report_date': project_details.get('report_date', datetime.now().strftime('%d/%m/%Y')),
        
        # TIA sections (use empty string as fallback to avoid None values in template)
        'introduction_purpose': tia_data.get('introduction_purpose', ''),
        'existing_conditions_site_location': tia_data.get('existing_conditions_site_location', ''),
        'existing_conditions_land_use': tia_data.get('existing_conditions_land_use', ''),
        'existing_conditions_road_network': tia_data.get('existing_conditions_road_network', ''),
        'existing_conditions_public_transport': tia_data.get('existing_conditions_public_transport', ''),
        'proposal_description': tia_data.get('proposal_description', ''),
        'proposal_facilities': tia_data.get('proposal_facilities', ''),
        'proposal_parking': tia_data.get('proposal_parking', ''),
        'parking_existing_provision': tia_data.get('parking_existing_provision', ''),
        'parking_proposed_provision': tia_data.get('parking_proposed_provision', ''),
        'parking_rates_calculations': tia_data.get('parking_rates_calculations', ''),
        'parking_expected_patrons': tia_data.get('parking_expected_patrons', ''),
        'parking_justification': tia_data.get('parking_justification', ''),
        'parking_design_dimensions': tia_data.get('parking_design_dimensions', ''),
        'parking_design_compliance': tia_data.get('parking_design_compliance', ''),
        'other_bicycle_parking': tia_data.get('other_bicycle_parking', ''),
        'other_loading_waste': tia_data.get('other_loading_waste', ''),
        'other_traffic_generation': tia_data.get('other_traffic_generation', ''),
        'conclusion_summary': tia_data.get('conclusion_summary', '')
    }
    
    # Log context keys for debugging
    logger.debug(f"DOCX context keys: {', '.join(context.keys())}")
    
    return context