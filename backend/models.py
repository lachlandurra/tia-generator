#!/usr/bin/env python3
"""
Data models for TIA Generator API.
Defines Pydantic models for request/response validation.
"""

from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field

class ProjectDetails(BaseModel):
    """Project details for TIA report"""
    project_title: str = Field(..., description="Title of the project")
    site_address: str = Field(..., description="Address of the site")
    consultant_name: Optional[str] = Field(None, description="Name of the consultant")
    company_name: Optional[str] = Field(None, description="Name of the consulting company")
    qualifications: Optional[str] = Field(None, description="Qualifications of the consultant")
    contact_details: Optional[str] = Field(None, description="Contact details of the consultant")
    client_name: Optional[str] = Field(None, description="Name of the client")
    report_date: Optional[str] = Field(None, description="Date of the report")
    development_type: Optional[str] = Field(None, description="Type of development")
    zoning: Optional[str] = Field(None, description="Zoning classification of the site")
    pptn: Optional[str] = Field(None, description="Principal Public Transport Network status")
    council: Optional[str] = Field(None, description="Local council or governing authority")

class Introduction(BaseModel):
    """Introduction section of TIA report"""
    purpose: str = Field(..., description="Purpose of the report")
    council_feedback: Optional[str] = Field(None, description="Feedback received from council")

class ExistingConditions(BaseModel):
    """Existing conditions section of TIA report"""
    site_location_description: Optional[str] = Field(None, description="Description of the site location")
    existing_land_use_and_layout: Optional[str] = Field(None, description="Existing land use and layout")
    surrounding_road_network_details: Optional[str] = Field(None, description="Details of surrounding road network")
    public_transport_options: Optional[str] = Field(None, description="Public transport options near the site")

class Proposal(BaseModel):
    """Proposal section of TIA report"""
    description: Optional[str] = Field(None, description="Description of the proposed development")
    facilities_details: Optional[str] = Field(None, description="Details of proposed facilities")
    parking_arrangement: Optional[str] = Field(None, description="Proposed parking arrangement")

class ParkingAssessment(BaseModel):
    """Parking assessment section of TIA report"""
    existing_parking_provision: Optional[str] = Field(None, description="Existing parking provision")
    proposed_parking_provision: Optional[str] = Field(None, description="Proposed parking provision")
    parking_rates_calculations: Optional[str] = Field(None, description="Parking rates and calculations")
    expected_patrons: Optional[str] = Field(None, description="Expected patrons")
    justification: Optional[str] = Field(None, description="Justification for proposed parking")

class ParkingDesign(BaseModel):
    """Parking design section of TIA report"""
    dimensions_layout: Optional[str] = Field(None, description="Dimensions and layout of parking spaces")
    compliance: Optional[str] = Field(None, description="Compliance with relevant standards")

class OtherMatters(BaseModel):
    """Other matters section of TIA report"""
    bicycle_parking: Optional[str] = Field(None, description="Bicycle parking requirements and provision")
    loading_and_waste: Optional[str] = Field(None, description="Loading and waste collection details")
    traffic_generation: Optional[str] = Field(None, description="Traffic generation estimates")

class Conclusion(BaseModel):
    """Conclusion section of TIA report"""
    summary: Optional[str] = Field(None, description="Summary of findings and recommendations")

class TIARequest(BaseModel):
    """Request model for TIA generation"""
    project_details: ProjectDetails
    introduction: Introduction
    existing_conditions: ExistingConditions
    proposal: Proposal
    parking_assessment: ParkingAssessment
    parking_design: ParkingDesign
    other_matters: OtherMatters
    conclusion: Conclusion

class TIAResponse(BaseModel):
    """Response model for TIA generation"""
    introduction_purpose: str
    existing_conditions_site_location: str
    existing_conditions_land_use: str
    existing_conditions_road_network: str
    existing_conditions_public_transport: str
    proposal_description: str
    proposal_facilities: str
    proposal_parking: str
    parking_existing_provision: str
    parking_proposed_provision: str
    parking_rates_calculations: str
    parking_expected_patrons: str
    parking_justification: str
    parking_design_dimensions: str
    parking_design_compliance: str
    other_bicycle_parking: str
    other_loading_waste: str
    other_traffic_generation: str
    conclusion_summary: str

class ErrorResponse(BaseModel):
    """Error response model"""
    error: str
    details: Optional[List[str]] = None
    traceback: Optional[str] = None

class JobStatus(BaseModel):
    """Job status model"""
    status: str = Field(..., description="Status of the job (queued, processing, finished, failed)")
    error: Optional[str] = Field(None, description="Error message if job failed")
    result: Optional[Dict[str, Any]] = Field(None, description="Result of the job if finished")

class CacheStats(BaseModel):
    """Cache statistics model"""
    type: str = Field(..., description="Type of cache (redis or memory)")
    sections: int = Field(..., description="Number of cached sections")
    reports: int = Field(..., description="Number of cached reports")
    jobs: int = Field(..., description="Number of cached jobs")

class MetricsResponse(BaseModel):
    """Metrics response model"""
    api_calls: Dict[str, Any] = Field(..., description="API call metrics")
    cache_hits: Dict[str, Any] = Field(..., description="Cache hit metrics")
    generation_times: Dict[str, Any] = Field(..., description="Generation time metrics")
    request_times: Dict[str, Any] = Field(..., description="Request time metrics")