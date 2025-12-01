"""
Flask web app - serves scrollable archive of daily digests.
"""

from flask import Flask, render_template, send_from_directory
from pathlib import Path
import os

app = Flask(__name__)

# Get archive directory
ARCHIVE_DIR = Path(__file__).parent.parent / 'archive'

@app.route('/')
def index():
    """Main page - shows list of all digests with infinite scroll style"""
    # Get all HTML files from archive, sorted by date (newest first)
    archive_files = sorted(
        [f for f in ARCHIVE_DIR.glob('*.html')],
        key=lambda x: x.stem,
        reverse=True
    )
    
    # Extract dates from filenames
    digests = []
    for file in archive_files:
        date = file.stem  # YYYY-MM-DD
        digests.append({
            'date': date,
            'filename': file.name
        })
    
    return render_template('index.html', digests=digests)

@app.route('/digest/<date>')
def view_digest(date):
    """View a specific digest"""
    return send_from_directory(ARCHIVE_DIR, f'{date}.html')

@app.route('/health')
def health():
    """Health check endpoint"""
    return {'status': 'ok'}, 200

if __name__ == '__main__':
    # For production, use gunicorn or similar
    # gunicorn -w 4 -b 0.0.0.0:8080 webapp.app:app
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)