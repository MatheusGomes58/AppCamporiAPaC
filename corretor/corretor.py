import fitz  # PyMuPDF

import pytesseract
from PIL import Image
import pdf2image

# Converter PDF para imagens
def pdf_para_imagens(caminho_pdf):
    paginas = pdf2image.convert_from_path(caminho_pdf)
    return paginas

# Usar OCR para extrair texto das imagens
def ocr_no_pdf(caminho_pdf):
    imagens = pdf_para_imagens(caminho_pdf)
    texto = ""
    for imagem in imagens:
        texto += pytesseract.image_to_string(imagem)
    return texto

caminho_pdf = "./respostas_aluno.pdf"  # Caminho do PDF
texto_extraido = ocr_no_pdf(caminho_pdf)
print(texto_extraido)


def extrair_texto_pdf(caminho_pdf):
    """Extrai o texto de um PDF."""
    texto = ""
    with fitz.open(caminho_pdf) as pdf:
        for pagina in pdf:
            texto += pagina.get_text()
    return texto

def processar_gabarito(texto):
    """Converte o texto do gabarito extraído do PDF em um dicionário."""
    gabarito = {}
    linhas = texto.split("\n")
    for linha in linhas:
        partes = linha.split(".")
        if len(partes) == 2:
            numero = partes[0].strip()
            resposta = partes[1].strip().upper()
            if numero.isdigit():
                gabarito[int(numero)] = resposta
    return gabarito

def corrigir_prova(gabarito, respostas_aluno):
    """Compara as respostas do aluno com o gabarito e retorna a nota."""
    acertos = 0
    total = len(gabarito)
    
    for numero, resposta in respostas_aluno.items():
        if gabarito.get(numero) == resposta:
            acertos += 1

    nota = (acertos / total) * 10  # Nota de 0 a 10
    return acertos, total, nota

# Exemplo de uso:
caminho_gabarito = "/l/disk0/mwillian/Documentos/AppCamporiAPaC/corretor/gabarito.pdf"
caminho_respostas = "/l/disk0/mwillian/Documentos/AppCamporiAPaC/corretor/respostas_aluno.pdf"

# Extrair texto dos PDFs
texto_gabarito = extrair_texto_pdf(caminho_gabarito)
texto_respostas = extrair_texto_pdf(caminho_respostas)

# Processar o gabarito e as respostas
gabarito = processar_gabarito(texto_gabarito)
respostas_aluno = processar_gabarito(texto_respostas)

# Corrigir a prova
acertos, total, nota = corrigir_prova(gabarito, respostas_aluno)

# Exibir o resultado
print(f"Acertos: {acertos}/{total}")
print(f"Nota: {nota:.2f}")
