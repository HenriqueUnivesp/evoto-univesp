#!/usr/bin/env python
"""
Script para verificar as fontes de arquivos estáticos no projeto Django.
Este script imprime todos os diretórios que contêm arquivos estáticos,
incluindo os do ambiente virtual e pacotes instalados.
"""

import os
import sys
import django
from pathlib import Path
from django.conf import settings

# Configurar o ambiente Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_eleicao.settings')
django.setup()

def find_static_dirs():
    """Encontra todos os diretórios que contêm arquivos estáticos."""
    print("Diretórios configurados em STATICFILES_DIRS:")
    for static_dir in settings.STATICFILES_DIRS:
        print(f"  - {static_dir}")
    
    print("\nDiretório configurado como STATIC_ROOT:")
    print(f"  - {settings.STATIC_ROOT}")
    
    print("\nDiretórios de aplicativos Django com arquivos estáticos:")
    for app_config in django.apps.apps.get_app_configs():
        static_dir = os.path.join(app_config.path, 'static')
        if os.path.isdir(static_dir):
            print(f"  - {app_config.name}: {static_dir}")
    
    # Verificar se há arquivos admin duplicados
    admin_dirs = []
    for root, dirs, files in os.walk(settings.BASE_DIR):
        if 'admin' in dirs and 'static' in root.split(os.sep):
            admin_path = os.path.join(root, 'admin')
            admin_dirs.append(admin_path)
    
    if len(admin_dirs) > 1:
        print("\nDiretórios 'admin' duplicados encontrados:")
        for admin_dir in admin_dirs:
            print(f"  - {admin_dir}")

if __name__ == "__main__":
    print("Verificando fontes de arquivos estáticos...")
    find_static_dirs()
    print("\nVerificação concluída.")
