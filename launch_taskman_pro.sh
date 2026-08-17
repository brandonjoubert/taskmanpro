#!/bin/bash
# Navigate to the project directory
cd ~/taskman_pro
# Activate the virtual environment
source venv/bin/activate
# Run the Flask application with nohup to detach it from the terminal
nohup python app.py > flask_output.log 2>&1 &
# Wait briefly for the server to start
sleep 5
# Open Chrome to localhost:5000
google-chrome http://localhost:5000 &
