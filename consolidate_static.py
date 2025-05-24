#!/usr/bin/env python
"""
Script para consolidar arquivos estáticos do diretório static1 para o diretório static.
Este script copia apenas os arquivos que não existem no diretório static,
evitando sobrescrever arquivos existentes.
"""

import os
import shutil
from pathlib import Path

# Diretórios de origem e destino
BASE_DIR = Path(__file__).resolve().parent
STATIC1_DIR = os.path.join(BASE_DIR, 'static1')
STATIC_DIR = os.path.join(BASE_DIR, 'static')

def copy_unique_files(src_dir, dest_dir):
    """
    Copia arquivos de src_dir para dest_dir, mantendo a estrutura de diretórios,
    mas apenas se o arquivo de destino não existir.
    """
    # Garantir que o diretório de destino exista
    if not os.path.exists(dest_dir):
        os.makedirs(dest_dir)
    
    # Percorrer todos os arquivos e diretórios na origem
    for root, dirs, files in os.walk(src_dir):
        # Calcular o caminho relativo
        rel_path = os.path.relpath(root, src_dir)
        
        # Criar diretórios correspondentes no destino
        for dir_name in dirs:
            dest_subdir = os.path.join(dest_dir, rel_path, dir_name)
            if not os.path.exists(dest_subdir):
                os.makedirs(dest_subdir)
        
        # Copiar arquivos que não existem no destino
        for file_name in files:
            src_file = os.path.join(root, file_name)
            # Calcular o caminho de destino
            if rel_path == '.':
                dest_file = os.path.join(dest_dir, file_name)
            else:
                dest_file = os.path.join(dest_dir, rel_path, file_name)
            
            # Copiar apenas se o arquivo não existir no destino
            if not os.path.exists(dest_file):
                print(f"Copiando: {os.path.relpath(src_file, BASE_DIR)} -> {os.path.relpath(dest_file, BASE_DIR)}")
                # Garantir que o diretório pai exista
                os.makedirs(os.path.dirname(dest_file), exist_ok=True)
                shutil.copy2(src_file, dest_file)
            else:
                print(f"Ignorando (já existe): {os.path.relpath(src_file, BASE_DIR)}")

def main():
    """Função principal do script."""
    print(f"Consolidando arquivos estáticos de {STATIC1_DIR} para {STATIC_DIR}...")
    copy_unique_files(STATIC1_DIR, STATIC_DIR)
    print("Consolidação concluída!")

if __name__ == "__main__":
    main()
