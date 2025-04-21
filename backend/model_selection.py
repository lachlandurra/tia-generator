#!/usr/bin/env python3
"""
Strategic model selection for TIA report generation.
Restricts to cost‑capped chat models: gpt‑4.1‑mini and gpt‑3.5‑turbo.
"""

import os
import logging

# Configure logging
logger = logging.getLogger("tia-generator.models")

# Load model configuration from environment variables
# High-quality tier => gpt-4.1-mini
# Fast tier => gpt-3.5-turbo (chat-compatible)
DEFAULT_MODEL       = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")
FAST_MODEL          = os.getenv("OPENAI_FAST_MODEL", "gpt-3.5-turbo")
HIGH_QUALITY_MODEL  = DEFAULT_MODEL

# Threshold (in characters) to consider input "long" or "complex"
COMPLEXITY_THRESHOLD = int(os.getenv("COMPLEXITY_THRESHOLD", "100"))
# Optionally force DEFAULT_MODEL for every section
FORCE_DEFAULT_MODEL  = os.getenv("FORCE_DEFAULT_MODEL", "").lower() == "true"

# Sections requiring the highest fidelity
HIGH_COMPLEXITY_SECTIONS = {
    "introduction_purpose",
    "proposal_description",
    "parking_justification",
    "other_traffic_generation",
    "conclusion_summary",
}

# Sections eligible for the fastest, lowest-cost model
FAST_MODEL_SECTIONS = {
    "existing_conditions_public_transport",
    "parking_existing_provision",
    "other_bicycle_parking",
    "other_loading_waste",
}


def select_model_for_section(section: str, content_length: int) -> str:
    """
    Choose between gpt-4.1-mini and gpt-3.5-turbo based on section complexity.

    - FORCE_DEFAULT_MODEL: always DEFAULT_MODEL
    - If section in HIGH_COMPLEXITY_SECTIONS or content_length > threshold: HIGH_QUALITY_MODEL
    - If section in FAST_MODEL_SECTIONS and content_length <= threshold: FAST_MODEL
    - Otherwise: DEFAULT_MODEL
    """
    # 1. Forced override
    if FORCE_DEFAULT_MODEL:
        logger.info(f"FORCE_DEFAULT_MODEL: using {DEFAULT_MODEL} for '{section}'")
        return DEFAULT_MODEL

    # 2. High-complexity or long content
    if section in HIGH_COMPLEXITY_SECTIONS or content_length > COMPLEXITY_THRESHOLD:
        logger.info(f"High complexity: using {HIGH_QUALITY_MODEL} for '{section}' ({content_length} chars)")
        return HIGH_QUALITY_MODEL

    # 3. Fast tier for simple sections
    if section in FAST_MODEL_SECTIONS and content_length <= COMPLEXITY_THRESHOLD:
        logger.info(f"Simple section: using {FAST_MODEL} for '{section}' ({content_length} chars)")
        return FAST_MODEL

    # 4. Default fallback
    logger.info(f"Default fallback: using {DEFAULT_MODEL} for '{section}'")
    return DEFAULT_MODEL
