"""
Convert README.md to PDF
This script converts the project's README.md file to a nicely formatted PDF
"""

from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Preformatted
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.pdfgen import canvas
import re

def convert_markdown_to_pdf(input_file, output_file):
    """Convert Markdown README to PDF with formatting"""
    
    # Read the README file
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Create PDF document
    doc = SimpleDocTemplate(
        output_file,
        pagesize=letter,
        rightMargin=0.75*inch,
        leftMargin=0.75*inch,
        topMargin=0.75*inch,
        bottomMargin=0.75*inch
    )
    
    # Container for the 'Flowable' objects
    story = []
    
    # Define styles
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor='#2563eb',
        spaceAfter=12,
        alignment=TA_CENTER
    )
    
    h2_style = ParagraphStyle(
        'CustomH2',
        parent=styles['Heading2'],
        fontSize=16,
        textColor='#1e40af',
        spaceAfter=10,
        spaceBefore=15
    )
    
    h3_style = ParagraphStyle(
        'CustomH3',
        parent=styles['Heading3'],
        fontSize=14,
        textColor='#3b82f6',
        spaceAfter=8,
        spaceBefore=10
    )
    
    code_style = ParagraphStyle(
        'Code',
        parent=styles['Code'],
        fontSize=9,
        leftIndent=20,
        rightIndent=20,
        textColor='#1e293b',
        backColor='#f1f5f9'
    )
    
    normal_style = styles['Normal']
    
    # Split content into lines
    lines = content.split('\n')
    i = 0
    
    while i < len(lines):
        line = lines[i].strip()
        
        # Skip badges and images
        if line.startswith('![') or line.startswith('<'):
            i += 1
            continue
        
        # Title (# heading)
        if line.startswith('# '):
            title = line[2:].strip()
            story.append(Paragraph(title, title_style))
            story.append(Spacer(1, 0.3*inch))
        
        # H2 heading (## heading)
        elif line.startswith('## '):
            heading = line[3:].strip()
            # Remove emojis for PDF
            heading = re.sub(r'[^\x00-\x7F]+', '', heading).strip()
            story.append(Spacer(1, 0.2*inch))
            story.append(Paragraph(heading, h2_style))
            story.append(Spacer(1, 0.1*inch))
        
        # H3 heading (### heading)
        elif line.startswith('### '):
            heading = line[4:].strip()
            heading = re.sub(r'[^\x00-\x7F]+', '', heading).strip()
            story.append(Paragraph(heading, h3_style))
        
        # Code block
        elif line.startswith('```'):
            i += 1
            code_lines = []
            while i < len(lines) and not lines[i].strip().startswith('```'):
                code_lines.append(lines[i])
                i += 1
            
            code_text = '\n'.join(code_lines)
            # Escape HTML characters
            code_text = code_text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            story.append(Preformatted(code_text, code_style))
            story.append(Spacer(1, 0.1*inch))
        
        # Bullet points
        elif line.startswith('- ') or line.startswith('* '):
            bullet_text = line[2:].strip()
            bullet_text = re.sub(r'[^\x00-\x7F]+', '', bullet_text).strip()
            bullet_text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', bullet_text)
            bullet_text = re.sub(r'\*(.*?)\*', r'<i>\1</i>', bullet_text)
            story.append(Paragraph(f'&bull; {bullet_text}', normal_style))
        
        # Numbered lists
        elif re.match(r'^\d+\.\s', line):
            list_text = re.sub(r'^\d+\.\s', '', line).strip()
            list_text = re.sub(r'[^\x00-\x7F]+', '', list_text).strip()
            list_text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', list_text)
            story.append(Paragraph(list_text, normal_style))
        
        # Horizontal rule
        elif line.startswith('---') or line.startswith('***'):
            story.append(Spacer(1, 0.2*inch))
        
        # Regular paragraph
        elif line and not line.startswith('|'):
            text = re.sub(r'[^\x00-\x7F]+', '', line).strip()
            text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', text)
            text = re.sub(r'\*(.*?)\*', r'<i>\1</i>', text)
            text = re.sub(r'`(.*?)`', r'<font face="Courier">\1</font>', text)
            
            if text:
                story.append(Paragraph(text, normal_style))
                story.append(Spacer(1, 0.05*inch))
        
        i += 1
    
    # Build PDF
    doc.build(story)
    print(f"✅ PDF created successfully: {output_file}")

if __name__ == "__main__":
    try:
        print("📄 Converting README.md to PDF...")
        convert_markdown_to_pdf("README.md", "InsightAgent_Documentation.pdf")
        print("✨ Conversion complete!")
        print("📍 Location: InsightAgent_Documentation.pdf")
    except FileNotFoundError:
        print("❌ Error: README.md file not found in current directory")
    except Exception as e:
        print(f"❌ Error: {e}")
