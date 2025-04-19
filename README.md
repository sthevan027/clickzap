# ZapClick

Sistema de gerenciamento de assinaturas e automação de WhatsApp.

## Funcionalidades

- Autenticação de usuários
- Gerenciamento de assinaturas via Hotmart
- Integração com WhatsApp Web
- Dashboard administrativo
- Notificações automáticas
- Temas claro/escuro

## Tecnologias

- Next.js
- Node.js
- MongoDB
- Chakra UI
- WhatsApp Web JS
- Winston (logging)
- Hotmart API

## Requisitos

- Node.js 18+
- MongoDB
- Conta Hotmart
- WhatsApp Web

## Instalação

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

Edite o arquivo `.env` com suas configurações:

```env
MONGODB_URI=sua_uri_mongodb
HOTMART_TOKEN=seu_token_hotmart
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Scripts

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm start` - Inicia o servidor em produção
- `npm run lint` - Executa verificação de código

## Estrutura do Projeto

```
src/
  ├── components/     # Componentes React
  ├── config/        # Configurações
  ├── contexts/      # Contextos React
  ├── database/      # Configuração do banco de dados
  ├── models/        # Modelos do MongoDB
  ├── pages/         # Páginas Next.js
  ├── routes/        # Rotas da API
  ├── services/      # Serviços
  └── utils/         # Utilitários
```

## Licença

Este projeto está licenciado sob a [Licença MIT](LICENSE).

## 📧 Contato

Seu Nome - [@seu_twitter](https://twitter.com/seu_twitter) - email@exemplo.com

Link do Projeto: [https://github.com/seu-usuario/zapclick](https://github.com/seu-usuario/zapclick)