# Guia de Entrega - ZapClick

## Visão Geral
O ZapClick é um sistema completo de automação do WhatsApp com integração Hotmart para gerenciamento de assinaturas. O sistema permite enviar mensagens, arquivos e mídia através de uma interface web intuitiva.

## Recursos Principais
- ✅ Interface web moderna e responsiva
- ✅ Integração com WhatsApp Web
- ✅ Sistema de assinaturas via Hotmart
- ✅ 3 planos disponíveis (Free, Basic e Premium)
- ✅ Controle de créditos por mensagem/mídia
- ✅ Painel administrativo
- ✅ Sistema de logs e monitoramento

## Planos e Limites

### Plano Free
- 100 mensagens de texto
- 10 envios de mídia
- Sem custo

### Plano Basic
- 1000 mensagens de texto
- 100 envios de mídia
- Preço: R$ 9,90/mês

### Plano Premium
- 5000 mensagens de texto
- 500 envios de mídia
- Preço: R$ 14,90/mês

## Configuração Inicial

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
- Renomeie o arquivo `.env.example` para `.env`
- Preencha as seguintes informações:
  - `HOTMART_CLIENT_ID`: Seu ID do cliente Hotmart
  - `HOTMART_CLIENT_SECRET`: Sua chave secreta Hotmart
  - `HOTMART_WEBHOOK_TOKEN`: Token para webhooks Hotmart
  - `JWT_SECRET`: Chave secreta para tokens JWT
  - `MONGODB_URI`: URL do seu banco MongoDB

3. Inicie o servidor:
```bash
npm run dev
```

4. Acesse: `http://localhost:3000`

## Configuração do Hotmart

1. Acesse sua conta Hotmart
2. Configure os produtos com os seguintes IDs:
   - Basic: O99214851V
   - Premium: O99214851V

3. Configure o webhook:
   - URL: `https://seu-dominio.com/api/webhooks/hotmart`
   - Eventos: PURCHASE_COMPLETE, PURCHASE_CANCELED, SUBSCRIPTION_CANCELLATION

## Uso do Sistema

### Primeiro Acesso
1. Acesse o sistema
2. Faça login/cadastro
3. Escaneie o QR Code do WhatsApp
4. Comece a usar!

### Envio de Mensagens
1. Selecione um contato
2. Digite a mensagem
3. Clique em enviar

### Envio de Mídia
1. Selecione um contato
2. Clique no ícone de anexo
3. Escolha o arquivo
4. Envie

## Manutenção

### Logs
- Os logs ficam em: `logs/app.log`
- Monitore regularmente

### Backup
- Faça backup do MongoDB regularmente
- Mantenha cópia das variáveis de ambiente

### Atualizações
- Verifique atualizações semanalmente:
```bash
npm outdated
npm update
```

## Suporte Técnico

### Problemas Comuns

1. QR Code não aparece:
   - Verifique a conexão com internet
   - Reinicie o servidor
   - Limpe a pasta `.wwebjs_auth`

2. Mensagens não enviam:
   - Verifique os créditos disponíveis
   - Confirme status da assinatura
   - Verifique conexão do WhatsApp

3. Erro de autenticação:
   - Verifique as credenciais Hotmart
   - Confirme as variáveis de ambiente
   - Verifique logs de erro

### Contatos de Suporte
- Email: seu-email@suporte.com
- WhatsApp: (XX) XXXXX-XXXX
- Horário: 9h às 18h (Segunda a Sexta)

## Recomendações de Segurança

1. Mantenha as senhas seguras
2. Altere as chaves de API regularmente
3. Monitore os logs de acesso
4. Faça backup regularmente
5. Mantenha o sistema atualizado

## Termos de Uso

1. Respeite os limites de envio
2. Não envie spam
3. Não utilize para fins ilegais
4. Mantenha seus dados atualizados
5. Respeite os termos do WhatsApp

## Atualizações Futuras

Próximas funcionalidades planejadas:
- [ ] Mensagens programadas
- [ ] Templates de mensagem
- [ ] Relatórios avançados
- [ ] API para integração
- [ ] App mobile

## Considerações Finais

O ZapClick foi desenvolvido pensando na sua necessidade de automação e gestão de mensagens. Mantenha o sistema atualizado e siga as boas práticas para garantir o melhor funcionamento.

Para qualquer dúvida adicional, nossa equipe de suporte está à disposição.

Bom uso! 