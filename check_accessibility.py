#!/usr/bin/env python
"""
Script para verificar os arquivos de acessibilidade no projeto.
Este script verifica se os arquivos CSS e JS de acessibilidade existem
nos diretórios corretos e se estão sendo coletados pelo collectstatic.
"""

import os
import sys
from pathlib import Path

# Diretórios
BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = os.path.join(BASE_DIR, 'static')
STATICFILES_DIR = os.path.join(BASE_DIR, 'staticfiles')

def check_file(file_path, description):
    """Verifica se um arquivo existe e retorna uma mensagem de status."""
    if os.path.exists(file_path):
        return f"✅ {description} encontrado: {file_path}"
    else:
        return f"❌ {description} NÃO encontrado: {file_path}"

def main():
    """Função principal do script."""
    print("Verificando arquivos de acessibilidade...\n")
    
    # Verificar arquivos no diretório static
    print("Arquivos no diretório static:")
    css_file = os.path.join(STATIC_DIR, 'css', 'accessibility.css')
    js_file = os.path.join(STATIC_DIR, 'js', 'accessibility.js')
    
    print(check_file(css_file, "CSS de acessibilidade"))
    print(check_file(js_file, "JavaScript de acessibilidade"))
    
    # Verificar arquivos no diretório staticfiles (coletados)
    print("\nArquivos coletados pelo collectstatic:")
    css_file_collected = os.path.join(STATICFILES_DIR, 'css', 'accessibility.css')
    js_file_collected = os.path.join(STATICFILES_DIR, 'js', 'accessibility.js')
    
    print(check_file(css_file_collected, "CSS de acessibilidade"))
    print(check_file(js_file_collected, "JavaScript de acessibilidade"))
    
    # Verificar conteúdo do arquivo JS
    if os.path.exists(js_file):
        print("\nVerificando conteúdo do arquivo accessibility.js:")
        with open(js_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Verificar funções importantes
        functions = [
            "initAccessibilitySettings", 
            "setupAccessibilityControls",
            "setupKeyboardShortcuts",
            "enhanceKeyboardNavigation",
            "enhanceAriaAttributes",
            "readPageContent"
        ]
        
        for func in functions:
            if func in content:
                print(f"✅ Função '{func}' encontrada no arquivo JS")
            else:
                print(f"❌ Função '{func}' NÃO encontrada no arquivo JS")
    
    print("\nVerificação concluída.")
    
    print("\nInstruções para verificação manual:")
    print("1. Acesse o site no navegador")
    print("2. Verifique se os botões de acessibilidade estão visíveis no topo da página")
    print("3. Tente clicar nos botões de acessibilidade (alto contraste, tamanho de fonte)")
    print("4. Abra o console do navegador (F12 > Console) e verifique se há erros")
    print("5. Verifique se o arquivo accessibility.js está sendo carregado na aba Network")

if __name__ == "__main__":
    main()
