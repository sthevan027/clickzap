// Testes de integração com WhatsApp Web
async function testWhatsAppConnection() {
  try {
    const response = await fetch('http://localhost:3000/whatsapp/status');
    const data = await response.json();
    console.log('Status WhatsApp:', data);
    return data.connected;
  } catch (error) {
    console.error('Erro ao testar conexão WhatsApp:', error);
    return false;
  }
}

// Testes de armazenamento de configurações
async function testConfigStorage() {
  const testConfig = {
    filtros: ['palavra1', 'palavra2'],
    automações: [
      {
        gatilho: 'teste',
        resposta: 'resposta teste',
        horario: '12:00',
        tipo: 'texto'
      }
    ]
  };

  try {
    // Teste de salvamento
    const saveResponse = await fetch('http://localhost:3000/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testConfig)
    });
    
    if (!saveResponse.ok) throw new Error('Erro ao salvar configuração');

    // Teste de leitura
    const readResponse = await fetch('http://localhost:3000/config');
    const savedConfig = await readResponse.json();
    
    return JSON.stringify(testConfig) === JSON.stringify(savedConfig);
  } catch (error) {
    console.error('Erro nos testes de configuração:', error);
    return false;
  }
}

// Testes de regras de automação
async function testAutomationRules() {
  const testRule = {
    gatilho: 'teste',
    resposta: 'resposta teste',
    horario: '12:00',
    tipo: 'texto'
  };

  try {
    // Teste de criação
    const createResponse = await fetch('http://localhost:3000/regras', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testRule)
    });
    
    if (!createResponse.ok) throw new Error('Erro ao criar regra');

    // Teste de leitura
    const readResponse = await fetch('http://localhost:3000/regras');
    const rules = await readResponse.json();
    
    return rules.some(rule => 
      rule.gatilho === testRule.gatilho && 
      rule.resposta === testRule.resposta
    );
  } catch (error) {
    console.error('Erro nos testes de regras:', error);
    return false;
  }
}

// Função para executar todos os testes
async function runAllTests() {
  console.log('Iniciando bateria de testes...');
  
  const results = {
    whatsapp: await testWhatsAppConnection(),
    config: await testConfigStorage(),
    automation: await testAutomationRules()
  };

  console.log('Resultados dos testes:', results);
  return results;
}

// Exportar funções para uso em outros arquivos
module.exports = {
  testWhatsAppConnection,
  testConfigStorage,
  testAutomationRules,
  runAllTests
}; 