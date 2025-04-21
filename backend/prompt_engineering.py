#!/usr/bin/env python3
"""
Optimized prompt engineering for TIA report generation.
Contains specialized prompts for each section to improve quality and response time.
"""

from typing import Dict, Any, Optional

def get_section_system_prompt(section: str) -> str:
    """
    Get the system prompt for a specific section.
    These system prompts help guide the model to generate appropriate content.
    """
    base_prompt = "You are an expert traffic engineer with extensive experience in preparing Traffic Impact Assessment reports. "
    base_prompt += "You write in clear, professional Australian English using proper technical terminology. "
    
    section_prompts = {
        "introduction_purpose": base_prompt + "You are generating the Introduction section which explains the purpose and scope of the assessment.",
        
        "existing_conditions_site_location": base_prompt + "You are generating the Site Location section which describes the physical location and surroundings of the site.",
        
        "existing_conditions_land_use": base_prompt + "You are generating the Existing Land Use section which describes the current use and layout of the site.",
        
        "existing_conditions_road_network": base_prompt + "You are generating the Road Network section which describes the surrounding road network, including classifications, speed limits, and traffic conditions.",
        
        "existing_conditions_public_transport": base_prompt + "You are generating the Public Transport section which describes available public transport options near the site.",
        
        "proposal_description": base_prompt + "You are generating the Proposal Description section which outlines the proposed development in detail.",
        
        "proposal_facilities": base_prompt + "You are generating the Facilities section which describes the facilities included in the proposed development.",
        
        "proposal_parking": base_prompt + "You are generating the Parking Arrangement section which describes the proposed parking layout and access arrangements.",
        
        "parking_existing_provision": base_prompt + "You are generating the Existing Parking Provision section which details the current parking available on site.",
        
        "parking_proposed_provision": base_prompt + "You are generating the Proposed Parking Provision section which details the number and types of parking spaces to be provided.",
        
        "parking_rates_calculations": base_prompt + "You are generating the Parking Rates and Calculations section which analyzes applicable parking requirements and calculations.",
        
        "parking_expected_patrons": base_prompt + "You are generating the Expected Patrons section which estimates the number and patterns of visitors to the site.",
        
        "parking_justification": base_prompt + "You are generating the Parking Justification section which provides the rationale for the proposed parking provision.",
        
        "parking_design_dimensions": base_prompt + "You are generating the Parking Dimensions section which details the physical dimensions and layout of parking spaces.",
        
        "parking_design_compliance": base_prompt + "You are generating the Parking Compliance section which analyzes compliance with relevant standards and regulations.",
        
        "other_bicycle_parking": base_prompt + "You are generating the Bicycle Parking section which addresses bicycle parking requirements and provisions.",
        
        "other_loading_waste": base_prompt + "You are generating the Loading and Waste section which details arrangements for loading areas and waste collection.",
        
        "other_traffic_generation": base_prompt + "You are generating the Traffic Generation section which estimates traffic generation from the development.",
        
        "conclusion_summary": base_prompt + "You are generating the Conclusion section which summarizes key findings and recommendations.",
    }
    
    return section_prompts.get(
        section, 
        base_prompt + "You are generating a section of a Traffic Impact Assessment report."
    )

def get_optimized_prompt(section: str, content: str, **context) -> str:
    """
    Generate optimized prompts for each section of the TIA report.
    
    Args:
        section: The section identifier
        content: The user input content for this section
        context: Additional context like project_title, site_address, etc.
    
    Returns:
        An optimized prompt designed for this specific section
    """
    # Get project context
    project_title = context.get("project_title", "")
    site_address = context.get("site_address", "")
    development_type = context.get("development_type", "")
    council = context.get("council", "")
    
    # Create context header for all prompts
    context_header = ""
    if project_title:
        context_header += f"PROJECT: {project_title}\n"
    if site_address:
        context_header += f"LOCATION: {site_address}\n"
    if development_type:
        context_header += f"DEVELOPMENT TYPE: {development_type}\n"
    if council:
        context_header += f"COUNCIL: {council}\n"
    
    if context_header:
        context_header += "\n"
    
    # Section-specific prompts with examples and structure guidance
    prompts = {
        "introduction_purpose": {
            "instruction": "Write a professional introduction section for a Traffic Impact Assessment report.",
            "format": "A clear, concise paragraph explaining the purpose and scope of the assessment.",
            "example": "This Traffic Impact Assessment has been prepared to evaluate the traffic impacts associated with the proposed [development type] at [location]. The assessment aims to analyze the existing traffic conditions, estimate the traffic generation of the development, and assess the adequacy of the proposed parking and access arrangements.",
            "guidance": "Include the purpose of the report, the development it relates to, and any specific requirements or standards being addressed."
        },
        
        "existing_conditions_site_location": {
            "instruction": "Write a detailed site location description for a Traffic Impact Assessment report.",
            "format": "A descriptive paragraph about the site's location, including notable landmarks and surrounding features.",
            "example": "The subject site is located at 123 Main Street in the suburb of Richmond. It is situated approximately 5km east of the Melbourne CBD and is bounded by Smith Street to the east, Jones Road to the north, and residential properties to the south and west.",
            "guidance": "Describe the physical location, nearby landmarks, and surrounding streets and properties."
        },
        
        "existing_conditions_land_use": {
            "instruction": "Write a description of the existing land use and layout of the site.",
            "format": "A paragraph describing the current use, structures, and layout of the site.",
            "example": "The site currently contains a single-storey commercial building with a floor area of approximately 500m². The building was previously used as a retail shop and has been vacant for the past six months. The site has an existing crossover on Smith Street providing access to a small car park with 6 parking spaces at the rear of the property.",
            "guidance": "Include details about existing buildings, current use, site layout, and existing access arrangements."
        },
        
        "existing_conditions_road_network": {
            "instruction": "Write a comprehensive description of the surrounding road network.",
            "format": "Multiple paragraphs describing surrounding roads, their classification, traffic conditions, and relevant features.",
            "example": "Smith Street is a collector road with a single traffic lane in each direction and parallel parking on both sides. It has a posted speed limit of 50km/h and carries approximately 5,000 vehicles per day. The road primarily serves local traffic and provides access to the commercial precinct.",
            "guidance": "Include road classifications, speed limits, traffic volumes, intersection controls, and any notable traffic issues in the area."
        },
        
        "existing_conditions_public_transport": {
            "instruction": "Write a description of the public transport options near the site.",
            "format": "A paragraph describing nearby public transport services, stops, and frequencies.",
            "example": "The site is well-served by public transport, with bus route 456 operating along Smith Street with stops directly in front of the site. This service operates at 15-minute intervals during peak periods and 30-minute intervals during off-peak periods, providing connections to Richmond Station and the CBD.",
            "guidance": "Include nearby bus routes, train stations, tram lines, service frequencies, and walking distances to stops/stations."
        },
        
        "proposal_description": {
            "instruction": "Write a comprehensive description of the proposed development.",
            "format": "Multiple paragraphs describing the development type, size, and key features.",
            "example": "The proposal involves the construction of a four-storey mixed-use development comprising ground floor retail and three levels of residential apartments above. The development will include 2 retail tenancies with a combined floor area of 400m² and 20 residential apartments (8 one-bedroom and 12 two-bedroom units).",
            "guidance": "Include details about building height, floor area, number of units/tenancies, and primary functions."
        },
        
        "proposal_facilities": {
            "instruction": "Write a description of the facilities included in the proposed development.",
            "format": "A paragraph detailing the amenities and facilities within the development.",
            "example": "The development will include a communal rooftop garden of 150m² for residents, a ground floor lobby with secure access, bicycle storage for 30 bicycles, and a waste storage area. Each apartment will have private balconies ranging from 8-12m² in size.",
            "guidance": "Include details about common areas, recreational facilities, service areas, and other amenities."
        },
        
        "proposal_parking": {
            "instruction": "Write a description of the proposed parking arrangement.",
            "format": "A paragraph explaining the parking layout, access, and allocation.",
            "example": "Parking for the development will be provided in a basement level car park accessed via a 6.0m wide ramp from Smith Street. The car park will contain 30 parking spaces, including 25 resident spaces, 3 visitor spaces, and 2 retail staff spaces. The car park layout includes 28 standard spaces and 2 accessible spaces located near the lift.",
            "guidance": "Include the number of spaces, their allocation, access arrangements, and layout configuration."
        },
        
        "parking_existing_provision": {
            "instruction": "Write a description of the existing parking provision on the site.",
            "format": "A paragraph describing current parking availability on the site.",
            "example": "The site currently contains 6 at-grade parking spaces located at the rear of the existing building. These spaces are accessed via a single crossover from Smith Street and were previously used by staff and customers of the retail premises.",
            "guidance": "Include the number of existing spaces, their configuration, and how they were used."
        },
        
        "parking_proposed_provision": {
            "instruction": "Write a description of the proposed parking provision.",
            "format": "A detailed paragraph explaining the number and allocation of parking spaces.",
            "example": "The development proposes a total of 30 car parking spaces located within the basement car park. These spaces will be allocated as 25 resident spaces (1 space per apartment plus 5 additional spaces), 3 visitor spaces, and 2 retail staff spaces. No customer parking is proposed for the retail component.",
            "guidance": "Include a clear breakdown of parking numbers by user type and any special provisions."
        },
        
        "parking_rates_calculations": {
            "instruction": "Write an analysis of applicable parking rates and calculations.",
            "format": "Multiple paragraphs showing statutory requirements, calculations, and resulting parking numbers.",
            "example": "According to Clause 52.06 of the Yarra Planning Scheme, the statutory parking requirement for the development is as follows:\n\n- Dwellings: 1 space per 1-2 bedroom dwelling (20 spaces) and 0.1 visitor spaces per dwelling (2 spaces)\n- Retail: 4 spaces per 100m² of leasable floor area (16 spaces)\n\nThis results in a total statutory requirement of 38 spaces (22 residential and 16 retail).",
            "guidance": "Include the relevant planning scheme requirements, calculate the statutory requirement, and compare to the proposed provision."
        },
        
        "parking_expected_patrons": {
            "instruction": "Write an analysis of expected patron numbers and patterns.",
            "format": "A paragraph estimating visitor numbers and their arrival/departure patterns.",
            "example": "The retail tenancies are expected to generate approximately 100 customer visits per day, with peak activity occurring between 12pm and 2pm on weekdays and 10am to 4pm on weekends. The majority of customers (approximately 70%) are expected to arrive by foot or public transport, given the site's location within an established commercial strip and proximity to public transport.",
            "guidance": "Include estimates of visitor numbers, peak times, and mode share assumptions."
        },
        
        "parking_justification": {
            "instruction": "Write a justification for the proposed parking provision.",
            "format": "Multiple paragraphs providing rationale for the parking numbers with supporting evidence.",
            "example": "The proposed parking provision of 30 spaces represents a shortfall of 8 spaces against the statutory requirement. However, this reduction is considered appropriate for the following reasons:\n\n1. The site has excellent access to public transport, with high-frequency bus services directly in front of the site and a train station within 500m.\n\n2. Recent parking surveys conducted in the area indicate that on-street parking utilization is typically below 70% during business hours, with approximately 20 spaces consistently available within 200m of the site.",
            "guidance": "Provide a clear rationale for the proposed parking, especially if there's a shortfall against requirements. Include relevant factors like public transport accessibility, existing parking availability, and car ownership trends."
        },
        
        "parking_design_dimensions": {
            "instruction": "Write a description of parking space dimensions and layout.",
            "format": "A technical paragraph detailing dimensions of parking spaces, aisles, and access ways.",
            "example": "The proposed car park will provide standard parking spaces with dimensions of 2.6m x 4.9m, which complies with the minimum requirements. Accessible spaces will be 2.4m wide with an adjacent shared area of 2.4m, resulting in a total width of 4.8m. The central aisle width is 6.1m, allowing for efficient two-way traffic flow and complying with the minimum 6.0m requirement for two-way aisles.",
            "guidance": "Include specific dimensions for spaces, aisles, ramps, headroom clearance, and other relevant measurements."
        },
        
        "parking_design_compliance": {
            "instruction": "Write an analysis of the parking design's compliance with standards.",
            "format": "Multiple paragraphs assessing compliance with relevant design standards.",
            "example": "The proposed car park layout has been assessed against the requirements of Clause 52.06-9 of the Planning Scheme and Australian Standard AS2890.1:2004, and is found to comply with these requirements in the following ways:\n\n1. All spaces meet or exceed the minimum dimensions of 2.6m x 4.9m for user class 1A (residents).\n\n2. The aisle width of 6.1m exceeds the minimum 5.8m required for 90-degree parking.\n\n3. The 1:5 gradient of the entry ramp transitions to 1:8 at the bottom, providing suitable transitions in accordance with AS2890.1.",
            "guidance": "Reference specific standards (e.g., Planning Scheme clauses, Australian Standards) and assess compliance with each relevant requirement."
        },
        
        "other_bicycle_parking": {
            "instruction": "Write a description of bicycle parking requirements and provision.",
            "format": "A paragraph detailing bicycle parking requirements, provision, and facilities.",
            "example": "Under Clause 52.34 of the Planning Scheme, the development requires 4 resident bicycle spaces, 2 visitor bicycle spaces, and 1 employee bicycle space for the retail component. The proposal exceeds these requirements by providing 30 bicycle parking spaces in a secure room at ground level, comprising 25 resident spaces and 5 visitor/staff spaces. Additionally, 4 visitor bicycle hoops will be installed on the Smith Street frontage.",
            "guidance": "Include statutory requirements, proposed provision, and details of bicycle parking facilities and access arrangements."
        },
        
        "other_loading_waste": {
            "instruction": "Write a description of loading and waste collection arrangements.",
            "format": "A paragraph explaining loading zones and waste collection procedures.",
            "example": "A dedicated loading bay (3.5m x 7.5m) will be provided adjacent to the retail tenancies, accessed from the rear laneway. This bay is designed to accommodate small to medium rigid vehicles (up to 6.4m in length) and will be available for deliveries between 7am and 7pm daily. Waste collection will occur from a designated collection point at the rear of the property, with bins being transported from the waste storage room to the collection area by the building manager on collection days.",
            "guidance": "Include details about loading bay dimensions, types of vehicles accommodated, waste collection points, and management procedures."
        },
        
        "other_traffic_generation": {
            "instruction": "Write an analysis of expected traffic generation.",
            "format": "Multiple paragraphs with traffic estimates, peak hour impacts, and distribution.",
            "example": "The proposed development is expected to generate approximately 120 vehicle movements per day, comprising 80 movements from the residential component and 40 movements from the retail component. During the AM peak hour (8-9am), the development is expected to generate 12 movements (10 outbound, 2 inbound), while during the PM peak hour (5-6pm), it is expected to generate 15 movements (5 outbound, 10 inbound).\n\nBased on existing traffic patterns in the area, it is estimated that 60% of traffic will access the site from/to Smith Street, with the remaining 40% using Jones Road.",
            "guidance": "Include daily traffic generation, peak hour movements (with directional split), and distribution patterns. Reference industry standards or databases used for estimates."
        },
        
        "conclusion_summary": {
            "instruction": "Write a conclusion summarizing the key findings of the Traffic Impact Assessment.",
            "format": "A comprehensive paragraph summarizing findings and recommendations.",
            "example": "Based on the assessment conducted, it is concluded that the proposed development can be accommodated within the existing road network without significant adverse impacts on traffic operation or safety. The proposed parking provision, while below the statutory requirement, is considered appropriate given the site's excellent access to public transport and the availability of on-street parking in the vicinity. The car park design complies with relevant standards, and appropriate arrangements have been made for loading, waste collection, and bicycle parking. It is recommended that a Green Travel Plan be implemented to further encourage sustainable transport modes among residents and staff.",
            "guidance": "Summarize key findings regarding traffic impact, parking adequacy, compliance with standards, and any recommendations or mitigation measures."
        }
    }
    
    # Get the appropriate prompt structure
    prompt_structure = prompts.get(
        section, 
        {
            "instruction": "Write a section for a Traffic Impact Assessment report.",
            "format": "A well-structured paragraph providing professional analysis.",
            "example": "This section should contain technical information relevant to the traffic assessment.",
            "guidance": "Include relevant technical details and professional analysis."
        }
    )
    
    # Construct the optimized prompt
    prompt = context_header
    prompt += f"TASK: {prompt_structure['instruction']}\n\n"
    prompt += f"EXPECTED FORMAT: {prompt_structure['format']}\n\n"
    prompt += f"CONTENT TO EXPAND: {content}\n\n"
    prompt += f"GUIDANCE: {prompt_structure['guidance']}\n\n"
    
    # Add example if helpful (only for empty or very short inputs)
    if not content or len(content) < 20:
        prompt += f"EXAMPLE: {prompt_structure['example']}\n\n"
    
    prompt += "Your response should contain only the formatted text for this section with no additional explanations or metadata."
    
    return prompt