# ZapClick - Sistema de Automação WhatsApp

Sistema de automação para WhatsApp com integração Hotmart e painel administrativo.

## 🚀 Tecnologias

- Next.js
- Node.js
- MongoDB
- Chakra UI
- Hotmart API
- WhatsApp Web API

## 📋 Pré-requisitos

- Node.js 14.x ou superior
- MongoDB Atlas ou local
- Conta Hotmart com produtos configurados
- WhatsApp Business API ou WhatsApp Web

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/zapclick.git
cd zapclick
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```
Edite o arquivo `.env` com suas configurações.

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Servidor
PORT=3000

# JWT
JWT_SECRET=sua_chave_secreta
JWT_EXPIRES_IN=7d

# MongoDB
MONGODB_URI=sua_uri_mongodb

# Hotmart
HOTMART_CLIENT_ID=seu_client_id
HOTMART_CLIENT_SECRET=seu_client_secret
HOTMART_WEBHOOK_TOKEN=seu_webhook_token

# WhatsApp
WHATSAPP_SESSION_FILE=whatsapp-session.json

# Admin
ADMIN_EMAIL=admin@email.com
ADMIN_PASSWORD=sua_senha_segura
```

### Configuração Hotmart

1. Acesse o painel da Hotmart
2. Configure os produtos e ofertas
3. Atualize os IDs e códigos no arquivo `src/config/hotmart.js`

## 📦 Estrutura do Projeto

```
src/
├── components/     # Componentes React
├── config/        # Configurações
├── controllers/   # Controladores
├── database/      # Configuração do banco
├── middleware/    # Middlewares
├── models/        # Modelos MongoDB
├── pages/         # Páginas Next.js
├── routes/        # Rotas
├── services/      # Serviços
└── utils/         # Utilitários
```

## 📝 Funcionalidades

- Automação de mensagens no WhatsApp
- Integração com Hotmart para vendas
- Painel administrativo
- Gerenciamento de usuários
- Sistema de logs
- Promoções e cupons

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📧 Contato

Seu Nome - [@seu_twitter](https://twitter.com/seu_twitter) - email@exemplo.com

Link do Projeto: [https://github.com/seu-usuario/zapclick](https://github.com/seu-usuario/zapclick)