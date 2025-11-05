"""
Utilities để xuất file (PDF, DOCX, audio)
"""
from docx import Document
from pathlib import Path
import json

def export_to_docx(content: str, filename: str, output_path: str):
    """Xuất nội dung ra file DOCX"""
    doc = Document()
    doc.add_paragraph(content)
    doc.save(Path(output_path) / filename)
    return str(Path(output_path) / filename)

def export_to_txt(content: str, filename: str, output_path: str):
    """Xuất nội dung ra file TXT"""
    file_path = Path(output_path) / filename
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    return str(file_path)

def export_quiz_to_json(questions: list, filename: str, output_path: str):
    """Xuất quiz ra file JSON"""
    file_path = Path(output_path) / filename
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
    return str(file_path)


