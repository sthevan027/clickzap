#!/bin/bash

echo "Iniciando instalação do ZapClick..."

# Verifica Node.js
if ! command -v node &> /dev/null; then
    echo "Node.js não encontrado. Por favor, instale o Node.js primeiro."
    exit 1
fi

# Verifica npm
if ! command -v npm &> /dev/null; then
    echo "npm não encontrado. Por favor, instale o npm primeiro."
    exit 1
fi

# Verifica MongoDB
if ! command -v mongod &> /dev/null; then
    echo "MongoDB não encontrado. Por favor, instale o MongoDB primeiro."
    exit 1
fi

echo "Instalando dependências..."
npm install

echo "Configurando ambiente..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Arquivo .env criado. Por favor, configure as variáveis de ambiente."
fi

# Cria diretórios necessários
echo "Criando diretórios..."
mkdir -p logs
mkdir -p .wwebjs_auth
mkdir -p public/uploads

# Configura permissões
echo "Configurando permissões..."
chmod 755 logs
chmod 755 .wwebjs_auth
chmod 755 public/uploads

echo "Iniciando banco de dados..."
mongod --fork --logpath /var/log/mongodb.log || true

echo "Instalação concluída!"
echo "Para iniciar o servidor, execute: npm run dev"
echo "Acesse: http://localhost:3000"
echo "Leia o arquivo ENTREGA.md para mais informações." 