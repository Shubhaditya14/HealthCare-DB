#!/bin/bash

# Script to create a zip archive of the project excluding Claude-related files

# Set the output filename with timestamp
OUTPUT_FILE="DBMS_EL_$(date +%Y%m%d_%H%M%S).zip"

echo "Creating zip archive: $OUTPUT_FILE"

# Create zip archive with exclusions
zip -r "$OUTPUT_FILE" . \
  -x "*.claude*" \
  -x "*/.claude/*" \
  -x ".claude/*" \
  -x "*/node_modules/*" \
  -x "*/__pycache__/*" \
  -x "*.pyc" \
  -x "*/.git/*" \
  -x "*.DS_Store" \
  -x "*/.env" \
  -x "*/venv/*" \
  -x "*/env/*" \
  -x "*/*.egg-info/*"

echo "✓ Archive created successfully: $OUTPUT_FILE"
echo "File size: $(du -h "$OUTPUT_FILE" | cut -f1)"
