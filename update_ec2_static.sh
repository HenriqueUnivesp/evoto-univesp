#!/bin/bash
# Script para atualizar a configuração de arquivos estáticos na instância EC2

# Atualizar para a versão mais recente do código
echo "Atualizando para a versão mais recente do código..."
cd /home/ec2-user/evoto-main
git pull

# Instalar o Whitenoise
echo "Instalando o Whitenoise..."
pip install whitenoise

# Executar o script de consolidação de arquivos estáticos
echo "Consolidando arquivos estáticos..."
python consolidate_static.py

# Executar o collectstatic
echo "Coletando arquivos estáticos..."
python manage.py collectstatic --noinput

# Reiniciar o serviço Gunicorn (se estiver usando)
echo "Reiniciando o serviço Gunicorn..."
sudo systemctl restart gunicorn

echo "Atualização concluída! Os arquivos estáticos agora devem ser servidos corretamente."
