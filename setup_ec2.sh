#!/bin/bash

# Script para configurar o ambiente na instância EC2 com Amazon Linux
# Execute este script como sudo: sudo bash setup_ec2.sh

# Atualizar o sistema
echo "Atualizando o sistema..."
yum update -y

# Instalar dependências
echo "Instalando dependências..."
# Incluindo dependências para Pillow (biblioteca de processamento de imagens)
yum install -y python3 python3-devel mariadb-devel gcc git zlib-devel libjpeg-devel freetype-devel

# Criar diretório para logs do Gunicorn
mkdir -p /var/log/gunicorn
chmod 777 /var/log/gunicorn

# Configurar o MariaDB
echo "Instalando MariaDB..."

# Instalar MariaDB
yum install -y mariadb-server

# Iniciar e habilitar o MariaDB
systemctl start mariadb
systemctl enable mariadb

# Informações sobre a configuração inicial
echo "Para configurar o MariaDB com segurança, execute o comando: sudo mysql_secure_installation"
echo "Você pode definir uma senha para o usuário root durante este processo"

# Configurar o banco de dados (você precisará executar estes comandos manualmente)
echo "Para configurar o banco de dados, execute os seguintes comandos:"
echo "mysql -u root -p"
echo "CREATE DATABASE sistema_eleicao CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
echo "CREATE USER 'seu_usuario_mariadb'@'localhost' IDENTIFIED BY 'sua_senha_mariadb';"
echo "GRANT ALL PRIVILEGES ON sistema_eleicao.* TO 'seu_usuario_mariadb'@'localhost';"
echo "FLUSH PRIVILEGES;"
echo "EXIT;"

# Configurar o ambiente Python
echo "Configurando ambiente Python..."
pip3 install --upgrade pip
pip3 install virtualenv

# Criar e ativar ambiente virtual
if [ ! -d "venv" ]; then
    echo "Criando ambiente virtual..."
    python3 -m virtualenv venv
fi

# Instalar dependências Python incluindo Pillow
echo "Instalando dependências Python..."
source venv/bin/activate
pip install -r requirements.txt
pip install pillow
deactivate

# Instalar e configurar Nginx
echo "Instalando Nginx..."
yum install -y nginx
systemctl start nginx
systemctl enable nginx

# Instalar Supervisor
echo "Instalando Supervisor..."
pip3 install supervisor
mkdir -p /etc/supervisor/conf.d

# Criar e configurar arquivo .env
echo "Criando arquivo .env a partir do exemplo..."
cp .env.example .env
echo "Edite o arquivo .env com suas configurações reais: nano .env"

# Configurar o Supervisor para gerenciar o Gunicorn
echo "Configurando o Supervisor..."
mkdir -p /etc/supervisor/conf.d
cat > /etc/supervisor/conf.d/evoto.conf << EOF
[program:evoto]
command=/home/ec2-user/e-voto-main/venv/bin/gunicorn --config=/home/ec2-user/e-voto-main/gunicorn_config.py sistema_eleicao.wsgi:application
directory=/home/ec2-user/e-voto-main
user=ec2-user
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/gunicorn/evoto.log
EOF

# Criar arquivo de configuração principal do Supervisor
cat > /etc/supervisord.conf << EOF
[unix_http_server]
file=/tmp/supervisor.sock

[supervisord]
logfile=/var/log/supervisord.log
logfile_maxbytes=50MB
logfile_backups=10
loglevel=info
pidfile=/tmp/supervisord.pid
nodaemon=false

[rpcinterface:supervisor]
supervisor.rpcinterface_factory = supervisor.rpcinterface:make_main_rpcinterface

[supervisorctl]
serverurl=unix:///tmp/supervisor.sock

[include]
files = /etc/supervisor/conf.d/*.conf
EOF

# Configurar o Nginx
echo "Configurando o Nginx..."
cat > /etc/nginx/conf.d/evoto.conf << EOF
server {
    listen 80;
    server_name seu_dominio_ou_ip;

    location = /favicon.ico { access_log off; log_not_found off; }
    
    location /static/ {
        alias /home/ec2-user/e-voto-main/staticfiles/;
    }

    location /media/ {
        alias /home/ec2-user/e-voto-main/media/;
    }

    location / {
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_pass http://localhost:8000;
    }
}
EOF

# Remover a configuração padrão se existir
rm -f /etc/nginx/conf.d/default.conf

# Verificar a configuração do Nginx
nginx -t

# Iniciar o Supervisor
echo "Iniciando o Supervisor..."
supervisord -c /etc/supervisord.conf

# Reiniciar o Nginx
systemctl restart nginx

# Configurar o Supervisor para iniciar na inicialização
cat > /etc/systemd/system/supervisord.service << EOF
[Unit]
Description=Supervisor daemon
After=network.target

[Service]
Type=forking
ExecStart=/usr/local/bin/supervisord -c /etc/supervisord.conf
ExecStop=/usr/local/bin/supervisorctl shutdown
ExecReload=/usr/local/bin/supervisorctl reload
KillMode=process
Restart=on-failure
RestartSec=50s

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable supervisord
systemctl start supervisord

echo "Configuração concluída! Lembre-se de editar o arquivo .env com suas configurações reais."
echo "Você também precisa configurar o banco de dados conforme as instruções acima."
