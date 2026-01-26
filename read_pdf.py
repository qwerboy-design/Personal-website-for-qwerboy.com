import pdfplumber
import sys

def extract_pdf_text(pdf_path, output_file="resume_content.txt"):
    try:
        all_text = ""
        
        with pdfplumber.open(pdf_path) as pdf:
            num_pages = len(pdf.pages)
            all_text += f"Total pages: {num_pages}\n"
            all_text += "="*80 + "\n"
            
            for page_num, page in enumerate(pdf.pages, start=1):
                text = page.extract_text()
                if text:
                    all_text += f"\n--- Page {page_num} ---\n{text}\n"
                else:
                    all_text += f"\n--- Page {page_num} ---\n[No text found]\n"
            
            # Save to file with UTF-8 encoding
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(all_text)
            
            print(f"Successfully extracted {num_pages} pages to {output_file}")
            print("\n=== Preview (first 2000 characters) ===")
            print(all_text[:2000])
            
    except Exception as e:
        print(f"Error reading PDF: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    extract_pdf_text("M.pdf")
