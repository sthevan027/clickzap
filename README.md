# ZapClick - Sistema de Automação WhatsApp com IA

## Descrição
O ZapClick é um sistema SaaS que permite automatizar respostas no WhatsApp utilizando Inteligência Artificial. O sistema oferece diferentes planos com recursos variados.

## Recursos
- Múltiplas instâncias do WhatsApp
- Respostas automáticas com IA
- Diferentes planos (Free, Basic, Premium)
- Dashboard de gerenciamento
- API RESTful

## Requisitos
- Node.js 14+
- PostgreSQL
- Redis
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
# Edite o arquivo .env com suas configurações
```

4. Inicie o servidor:
```bash
npm start
```

## Planos

### Free
- 1 instância do WhatsApp
- 3 respostas por dia
- Suporte básico

### Basic (R$ 9,90/mês)
- 3 instâncias do WhatsApp
- Respostas com IA
- Suporte prioritário

### Premium (R$ 14,90/mês)
- 10 instâncias do WhatsApp
- Respostas com IA avançada
- Suporte 24/7

## API

### Autenticação
Todas as requisições à API devem incluir o token JWT no header:
```
Authorization: Bearer seu-token-jwt
```

### Endpoints Principais

#### Usuários
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Login
- `GET /api/users/profile` - Perfil do usuário

#### WhatsApp
- `POST /api/whatsapp/instances` - Criar nova instância
- `DELETE /api/whatsapp/instances/:id` - Remover instância
- `POST /api/whatsapp/messages` - Enviar mensagem

#### Assinaturas
- `POST /api/subscriptions` - Criar assinatura
- `PUT /api/subscriptions/:id` - Atualizar assinatura
- `DELETE /api/subscriptions/:id` - Cancelar assinatura

## Segurança
- Autenticação JWT
- Rate limiting
- Validação de entrada
- Logs de auditoria

## Suporte
Para suporte, entre em contato:
- Email: suporte@zapclick.com
- WhatsApp: (11) 99999-9999

## Licença
MIT #   c l i c k z a p  
 