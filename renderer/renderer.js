// Configurações globais
let whatsappStatus = false;
let config = {
  filtros: [],
  automações: []
};

// Função para navegar entre as abas
function navegarPara(aba) {
  // Esconder todas as seções
  document.querySelectorAll('.content-section').forEach(section => {
    section.style.display = 'none';
  });
  
  // Remover classe active de todos os itens do menu
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  
  // Mostrar a seção selecionada
  const section = document.getElementById(aba + '-section');
  if (section) {
    section.style.display = 'block';
  }
  
  // Ativar o item do menu correspondente
  const menuItem = document.querySelector(`.nav-item[data-section="${aba}"]`);
  if (menuItem) {
    menuItem.classList.add('active');
  }
}

// Função para verificar status do WhatsApp
async function checkWhatsAppStatus() {
  try {
    const response = await fetch('http://localhost:3000/whatsapp/status');
    const data = await response.json();
    whatsappStatus = data.connected;
    updateWhatsAppStatus();
    return data.connected;
  } catch (error) {
    console.error('Erro ao verificar status WhatsApp:', error);
    whatsappStatus = false;
    updateWhatsAppStatus();
    return false;
  }
}

// Função para atualizar a interface com o status do WhatsApp
function updateWhatsAppStatus() {
  const statusElement = document.getElementById('whatsapp-status');
  if (statusElement) {
    statusElement.innerHTML = `
      <i class="fas ${whatsappStatus ? 'fa-check-circle' : 'fa-times-circle'}"></i>
      WhatsApp ${whatsappStatus ? 'Conectado' : 'Desconectado'}
    `;
    statusElement.className = `status ${whatsappStatus ? 'connected' : 'disconnected'}`;
  }
}

// Função para carregar configurações
async function loadConfig() {
  try {
    const response = await fetch('http://localhost:3000/config');
    const data = await response.json();
    config = data;
    updateFiltersList();
    return data;
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
    return null;
  }
}

// Função para salvar configurações
async function saveConfig() {
  try {
    const response = await fetch('http://localhost:3000/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return response.ok;
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    return false;
  }
}

// Função para adicionar filtro
async function addFilter() {
  const filterInput = document.getElementById('filter-input');
  if (filterInput && filterInput.value.trim()) {
    config.filtros.push(filterInput.value.trim());
    await saveConfig();
    updateFiltersList();
    filterInput.value = '';
  }
}

// Função para atualizar lista de filtros
function updateFiltersList() {
  const filtersList = document.getElementById('filters-list');
  if (filtersList) {
    filtersList.innerHTML = config.filtros.map(filter => `
      <div class="filter-item">
        <span>${filter}</span>
        <button onclick="removeFilter('${filter}')">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `).join('');
  }
}

// Função para remover filtro
async function removeFilter(filter) {
  config.filtros = config.filtros.filter(f => f !== filter);
  await saveConfig();
  updateFiltersList();
}

// Função para salvar regra de automação
async function salvar() {
  const gatilho = document.getElementById("gatilho").value;
  const resposta = document.getElementById("resposta").value;
  const horario = document.getElementById("horario").value;
  const tipo = document.getElementById("tipo").value;
  
  if (!gatilho || !resposta || !tipo) {
    alert('Por favor, preencha todos os campos obrigatórios!');
    return;
  }

  const regra = { gatilho, resposta, horario, tipo };
  
  try {
    const res = await fetch("http://localhost:3000/regras", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(regra)
    });
    
    if (res.ok) {
      alert("Regra salva com sucesso!");
      carregarRegras();
      limparFormulario();
    } else {
      alert("Erro ao salvar a regra. Tente novamente.");
    }
  } catch (error) {
    console.error('Erro ao salvar regra:', error);
    alert("Erro ao salvar a regra. Tente novamente.");
  }
}

// Função para carregar regras
async function carregarRegras() {
  try {
    const res = await fetch("http://localhost:3000/regras");
    const regras = await res.json();
    const listaRegras = document.getElementById("regras");
    listaRegras.innerHTML = "";
    
    regras.forEach(regra => {
      const li = document.createElement("li");
      li.className = "regra-item";
      li.innerHTML = `
        <div class="regra-header">
          <strong>Gatilho:</strong> ${regra.gatilho}
          <button onclick="deleteRegra('${regra.id}')" class="delete-btn">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        <div class="regra-content">
          <strong>Resposta:</strong> ${regra.resposta}<br>
          <strong>Horário:</strong> ${regra.horario || 'Qualquer horário'}<br>
          <strong>Tipo:</strong> ${regra.tipo}
        </div>
      `;
      listaRegras.appendChild(li);
    });
  } catch (error) {
    console.error('Erro ao carregar regras:', error);
  }
}

// Função para deletar regra
async function deleteRegra(id) {
  try {
    const res = await fetch(`http://localhost:3000/regras/${id}`, {
      method: "DELETE"
    });
    
    if (res.ok) {
      carregarRegras();
    } else {
      alert("Erro ao deletar a regra. Tente novamente.");
    }
  } catch (error) {
    console.error('Erro ao deletar regra:', error);
    alert("Erro ao deletar a regra. Tente novamente.");
  }
}

// Função para limpar formulário
function limparFormulario() {
  document.getElementById("gatilho").value = "";
  document.getElementById("resposta").value = "";
  document.getElementById("horario").value = "";
  document.getElementById("tipo").value = "";
}

// Função para adicionar nova conta WhatsApp
async function adicionarConta() {
  try {
    const qrCode = await fetch('http://localhost:3000/whatsapp/qr');
    const qrData = await qrCode.json();
    
    document.getElementById('qr-code').innerHTML = `
      <img src="${qrData.qr}" alt="QR Code WhatsApp">
      <p>Escaneie o QR Code com seu WhatsApp</p>
    `;
  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);
    alert('Erro ao gerar QR Code. Tente novamente.');
  }
}

// Função para salvar template
async function salvarTemplate() {
  const nome = document.getElementById('template-nome').value;
  const conteudo = document.getElementById('template-conteudo').value;
  
  if (!nome || !conteudo) {
    alert('Por favor, preencha todos os campos do template.');
    return;
  }
  
  try {
    const res = await fetch('http://localhost:3000/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, conteudo })
    });
    
    if (res.ok) {
      alert('Template salvo com sucesso!');
      carregarTemplates();
      document.getElementById('template-nome').value = '';
      document.getElementById('template-conteudo').value = '';
    }
  } catch (error) {
    console.error('Erro ao salvar template:', error);
    alert('Erro ao salvar template. Tente novamente.');
  }
}

// Função para carregar templates
async function carregarTemplates() {
  try {
    const res = await fetch('http://localhost:3000/templates');
    const templates = await res.json();
    const listaTemplates = document.getElementById('templates-list');
    
    listaTemplates.innerHTML = templates.map(template => `
      <div class="template-item">
        <div class="template-header">
          <strong>${template.nome}</strong>
          <button onclick="deletarTemplate('${template.id}')" class="delete-btn">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        <div class="template-content">
          ${template.conteudo}
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Erro ao carregar templates:', error);
  }
}

// Função para salvar configurações
async function salvarConfiguracoes() {
  const configs = {
    notificacoes: document.getElementById('config-notificacoes').checked,
    autoResponder: document.getElementById('config-autoresponder').checked,
    intervalo: document.getElementById('config-intervalo').value
  };
  
  try {
    const res = await fetch('http://localhost:3000/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(configs)
    });
    
    if (res.ok) {
      alert('Configurações salvas com sucesso!');
    }
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    alert('Erro ao salvar configurações. Tente novamente.');
  }
}

// Função para adicionar novo passo ao funil
function adicionarPassoFunil() {
  const funilBuilder = document.querySelector('.funil-builder');
  const totalPassos = document.querySelectorAll('.funil-step').length;
  const novoPassoNumero = totalPassos + 1;
  
  const novoPassoHTML = `
    <div class="funil-step" data-step="${novoPassoNumero}">
      <div class="step-header">
        <h3>Passo ${novoPassoNumero}</h3>
        <button class="delete-step-btn" onclick="removerPasso(${novoPassoNumero})">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="input-group">
        <label>Gatilho</label>
        <select class="funil-trigger" onchange="atualizarCamposGatilho(${novoPassoNumero})">
          <option value="">Selecione o gatilho</option>
          <option value="mensagem">Mensagem recebida</option>
          <option value="horario">Horário específico</option>
          <option value="palavra">Palavra-chave</option>
          <option value="tempo">Tempo após último passo</option>
        </select>
      </div>
      
      <div class="input-group gatilho-campos"></div>
      
      <div class="input-group">
        <label>Ação</label>
        <select class="funil-action" onchange="atualizarCamposAcao(${novoPassoNumero})">
          <option value="">Selecione a ação</option>
          <option value="responder">Responder mensagem</option>
          <option value="encaminhar">Encaminhar para grupo</option>
          <option value="marcar">Marcar mensagem</option>
          <option value="esperar">Aguardar tempo</option>
          <option value="condicional">Condição</option>
        </select>
      </div>
      
      <div class="input-group acao-campos"></div>
    </div>
  `;
  
  // Inserir novo passo antes do botão de adicionar
  const addButton = document.querySelector('.add-step-btn');
  addButton.insertAdjacentHTML('beforebegin', novoPassoHTML);
}

// Função para remover um passo
function removerPasso(numeroPasso) {
  const passo = document.querySelector(`.funil-step[data-step="${numeroPasso}"]`);
  if (passo) {
    passo.remove();
    // Reordenar números dos passos
    document.querySelectorAll('.funil-step').forEach((step, index) => {
      const novoNumero = index + 1;
      step.setAttribute('data-step', novoNumero);
      step.querySelector('h3').textContent = `Passo ${novoNumero}`;
    });
  }
}

// Função para atualizar campos do gatilho
function atualizarCamposGatilho(numeroPasso) {
  const passo = document.querySelector(`.funil-step[data-step="${numeroPasso}"]`);
  const gatilho = passo.querySelector('.funil-trigger').value;
  const camposContainer = passo.querySelector('.gatilho-campos');
  
  let camposHTML = '';
  
  switch (gatilho) {
    case 'palavra':
      camposHTML = `
        <label>Palavra-chave</label>
        <input type="text" class="gatilho-palavra" placeholder="Digite a palavra-chave">
      `;
      break;
    case 'horario':
      camposHTML = `
        <label>Horário</label>
        <input type="time" class="gatilho-horario">
      `;
      break;
    case 'tempo':
      camposHTML = `
        <label>Tempo de espera (minutos)</label>
        <input type="number" class="gatilho-tempo" min="1" value="5">
      `;
      break;
  }
  
  camposContainer.innerHTML = camposHTML;
}

// Função para atualizar campos da ação
function atualizarCamposAcao(numeroPasso) {
  const passo = document.querySelector(`.funil-step[data-step="${numeroPasso}"]`);
  const acao = passo.querySelector('.funil-action').value;
  const camposContainer = passo.querySelector('.acao-campos');
  
  let camposHTML = '';
  
  switch (acao) {
    case 'responder':
      camposHTML = `
        <label>Mensagem</label>
        <textarea class="acao-mensagem" placeholder="Digite a mensagem de resposta"></textarea>
      `;
      break;
    case 'encaminhar':
      camposHTML = `
        <label>Grupo</label>
        <select class="acao-grupo">
          <option value="">Selecione o grupo</option>
          <option value="grupo1">Grupo 1</option>
          <option value="grupo2">Grupo 2</option>
        </select>
      `;
      break;
    case 'esperar':
      camposHTML = `
        <label>Tempo de espera (minutos)</label>
        <input type="number" class="acao-tempo" min="1" value="5">
      `;
      break;
    case 'condicional':
      camposHTML = `
        <label>Condição</label>
        <select class="acao-condicao">
          <option value="contem">Contém texto</option>
          <option value="igual">Texto exato</option>
          <option value="comeca">Começa com</option>
          <option value="termina">Termina com</option>
        </select>
        <input type="text" class="acao-valor" placeholder="Valor para comparação">
      `;
      break;
  }
  
  camposContainer.innerHTML = camposHTML;
}

// Função para salvar funil
async function salvarFunil() {
  const nome = document.getElementById('funil-nome').value;
  if (!nome) {
    alert('Por favor, dê um nome ao funil');
    return;
  }
  
  const passos = [];
  document.querySelectorAll('.funil-step').forEach(step => {
    const gatilho = {
      tipo: step.querySelector('.funil-trigger').value,
      valor: getGatilhoValor(step)
    };
    
    const acao = {
      tipo: step.querySelector('.funil-action').value,
      valor: getAcaoValor(step)
    };
    
    passos.push({ gatilho, acao });
  });
  
  if (passos.length === 0) {
    alert('Adicione pelo menos um passo ao funil');
    return;
  }
  
  const funil = {
    nome,
    passos,
    ativo: true,
    criadoEm: new Date().toISOString()
  };
  
  try {
    const res = await fetch('http://localhost:3000/funis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(funil)
    });
    
    if (res.ok) {
      alert('Funil salvo com sucesso!');
      carregarFunis();
      document.getElementById('funil-nome').value = '';
      document.querySelector('.funil-builder').innerHTML = `
        <button class="add-step-btn" onclick="adicionarPassoFunil()">
          <i class="fas fa-plus"></i> Adicionar Passo
        </button>
      `;
    }
  } catch (error) {
    console.error('Erro ao salvar funil:', error);
    alert('Erro ao salvar funil. Tente novamente.');
  }
}

// Funções auxiliares para obter valores dos campos
function getGatilhoValor(step) {
  const tipo = step.querySelector('.funil-trigger').value;
  switch (tipo) {
    case 'palavra':
      return step.querySelector('.gatilho-palavra')?.value;
    case 'horario':
      return step.querySelector('.gatilho-horario')?.value;
    case 'tempo':
      return step.querySelector('.gatilho-tempo')?.value;
    default:
      return null;
  }
}

function getAcaoValor(step) {
  const tipo = step.querySelector('.funil-action').value;
  switch (tipo) {
    case 'responder':
      return step.querySelector('.acao-mensagem')?.value;
    case 'encaminhar':
      return step.querySelector('.acao-grupo')?.value;
    case 'esperar':
      return step.querySelector('.acao-tempo')?.value;
    case 'condicional':
      return {
        condicao: step.querySelector('.acao-condicao')?.value,
        valor: step.querySelector('.acao-valor')?.value
      };
    default:
      return null;
  }
}

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
  await checkWhatsAppStatus();
  await loadConfig();
  await carregarRegras();
  await carregarTemplates();
  
  // Adicionar listeners para navegação
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const section = item.getAttribute('data-section');
      if (section) {
        navegarPara(section);
      }
    });
  });
  
  // Iniciar na seção inicial
  navegarPara('inicio');
  
  // Verificar status do WhatsApp a cada 30 segundos
  setInterval(checkWhatsAppStatus, 30000);
});