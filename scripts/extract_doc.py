from pathlib import Path
import zipfile
import xml.etree.ElementTree as ET


def extract_docx_text(path: Path) -> str:
    with zipfile.ZipFile(path) as zf:
        xml_bytes = zf.read('word/document.xml')

    root = ET.fromstring(xml_bytes)
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

    paragraphs = []
    for para in root.findall('.//w:p', ns):
        texts = [node.text for node in para.findall('.//w:t', ns) if node.text]
        if texts:
            paragraphs.append(''.join(texts))

    return '\n'.join(paragraphs)


def main() -> None:
    doc_path = Path('Documento Mestre Plataforma Nôa Esperanza Med Cann Lab 3.0.docx')
    if not doc_path.exists():
        raise FileNotFoundError(f'Documento não encontrado: {doc_path}')

    text = extract_docx_text(doc_path)
    output_path = Path('assistant_documents') / 'documento_mestre.txt'
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(text, encoding='utf-8')
    print(f'Texto extraído para {output_path} ({len(text)} caracteres)')


if __name__ == '__main__':
    main()

