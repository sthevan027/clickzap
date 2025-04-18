# Configuração do Ambiente

Para criar a conta de administrador, siga estas etapas:

1. **Instale o MongoDB Community Server**
   - Acesse: https://www.mongodb.com/try/download/community
   - Baixe a versão mais recente para Windows
   - Execute o instalador e siga as instruções
   - Escolha "Complete" na instalação
   - Marque a opção "Install MongoDB as a Service"

2. **Verifique a instalação**
   - Abra um novo terminal
   - Execute `mongod --version` para verificar se está instalado
   - Se não funcionar, adicione o MongoDB ao PATH do sistema:
     - Padrão: `C:\Program Files\MongoDB\Server\6.0\bin`

3. **Inicie o MongoDB**
   - O serviço deve iniciar automaticamente
   - Se não, execute: `net start MongoDB`

4. **Execute o script de criação do admin**
   ```bash
   node src/scripts/createAdminSimple.js
   ```

5. **Credenciais do Admin**
   - Email: sthevan.ssantos@gmail.com
   - Senha: admin123

6. **Acesse o sistema**
   - Abra o navegador
   - Acesse: http://localhost:3000/admin
   - Use as credenciais acima para fazer login 