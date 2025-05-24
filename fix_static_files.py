#!/usr/bin/env python
"""
Script para limpar e recriar os arquivos estáticos para resolver problemas de duplicação.
Este script:
1. Remove o diretório staticfiles
2. Limpa o diretório static1 (opcional)
3. Executa collectstatic com a opção --clear
"""

import os
import shutil
import subprocess
from pathlib import Path

# Diretórios
BASE_DIR = Path(__file__).resolve().parent
STATICFILES_DIR = os.path.join(BASE_DIR, 'staticfiles')
STATIC1_DIR = os.path.join(BASE_DIR, 'static1')

def main():
    """Função principal do script."""
    print("Iniciando limpeza de arquivos estáticos...")
    
    # 1. Remover o diretório staticfiles se existir
    if os.path.exists(STATICFILES_DIR):
        print(f"Removendo diretório: {STATICFILES_DIR}")
        shutil.rmtree(STATICFILES_DIR)
        print("Diretório staticfiles removido com sucesso.")
    
    # 2. Opcionalmente, limpar o diretório static1
    if os.path.exists(STATIC1_DIR):
        response = input(f"Deseja remover o diretório {STATIC1_DIR}? (s/n): ")
        if response.lower() == 's':
            print(f"Removendo diretório: {STATIC1_DIR}")
            shutil.rmtree(STATIC1_DIR)
            print("Diretório static1 removido com sucesso.")
    
    # 3. Executar collectstatic com a opção --clear
    print("Executando collectstatic com a opção --clear...")
    try:
        subprocess.run(["python", "manage.py", "collectstatic", "--clear", "--noinput"], check=True)
        print("Collectstatic executado com sucesso.")
    except subprocess.CalledProcessError as e:
        print(f"Erro ao executar collectstatic: {e}")
    
    print("Processo de limpeza e recriação de arquivos estáticos concluído.")

if __name__ == "__main__":
    main()
