# ZapClick App

Aplicativo de gerenciamento de mensagens e automação para WhatsApp.

## Características

- Autenticação de usuários
- Painel administrativo
- Configurações de tema (claro/escuro)
- Suporte a múltiplos idiomas (Português, Inglês e Espanhol)
- Integração com Hotmart para pagamentos
- Sistema de créditos para mensagens

## Tecnologias

- Next.js
- React
- Chakra UI
- MongoDB
- i18next para internacionalização
- JWT para autenticação

## Pré-requisitos

- Node.js 14.x ou superior
- MongoDB Atlas conta
- NPM ou Yarn

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/zapclick-app.git
cd zapclick-app
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto e adicione:
```env
# Configurações do Servidor
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=seu_jwt_secret
JWT_EXPIRES_IN=24h

# MongoDB
MONGODB_URI=sua_string_conexao_mongodb

# Hotmart
HOTMART_CLIENT_ID=seu_client_id
HOTMART_CLIENT_SECRET=seu_client_secret
HOTMART_WEBHOOK_TOKEN=seu_webhook_token
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
# ou
yarn dev
```

5. Acesse `http://localhost:3000`

## Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Cria a build de produção
- `npm start`: Inicia o servidor de produção
- `npm run lint`: Executa o linter

## Estrutura do Projeto

```
src/
  ├── components/     # Componentes React reutilizáveis
  ├── config/        # Configurações (i18n, banco de dados, etc)
  ├── locales/       # Arquivos de tradução
  ├── pages/         # Páginas da aplicação
  ├── services/      # Serviços e integrações
  └── styles/        # Estilos e tema
```

## Contribuindo

1. Faça o fork do projeto
2. Crie sua branch de feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.