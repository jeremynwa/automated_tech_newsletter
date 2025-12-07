"""
Flask web app - serves all digests in a single scrollable page.
"""

from flask import Flask, render_template
from pathlib import Path
import os
from datetime import datetime
import re

app = Flask(__name__)

# Get archive directory
ARCHIVE_DIR = Path(__file__).parent.parent / 'archive'

@app.route('/')
def index():
    """Main page - shows all digests in chronological order (newest first)"""
    # Get all HTML files from archive, sorted by date (newest first)
    archive_files = sorted(
        [f for f in ARCHIVE_DIR.glob('*.html') if f.stem != '.gitkeep' and not f.stem.startswith('.')],
        key=lambda x: x.stem,
        reverse=True
    )
    
    # Read content from each file
    digests = []
    for file in archive_files:
        try:
            date = file.stem  # YYYY-MM-DD
            
            with open(file, 'r', encoding='utf-8', errors='replace') as f:
                content = f.read()
                
                # Extract body content
                body_start = content.find('<body>')
                body_end = content.find('</body>')
                
                if body_start != -1 and body_end != -1:
                    body_content = content[body_start + 6:body_end]
                    
                    # Remove header by finding where sections start
                    section_start = body_content.find('<div class="section">')
                    if section_start != -1:
                        # Only keep from first section onwards
                        sections_html = body_content[section_start:]
                    else:
                        sections_html = body_content
                else:
                    sections_html = content
                
                digests.append({
                    'date': date,
                    'content': sections_html,
                    'formatted_date': format_date(date)
                })
        except Exception as e:
            print(f"Error reading {file}: {e}")
            continue
    
    response = render_template('index.html', digests=digests)
    return response, 200, {'Content-Type': 'text/html; charset=utf-8'}

@app.route('/health')
def health():
    """Health check endpoint"""
    return {'status': 'ok'}, 200

def format_date(date_str):
    """Format date string to human-readable format"""
    try:
        date_obj = datetime.strptime(date_str, '%Y-%m-%d')
        return date_obj.strftime('%B %d, %Y')  # e.g., "December 05, 2024"
    except:
        return date_str

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)