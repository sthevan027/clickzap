// Funções para gerenciamento de funis
let passosFunil = [];

function adicionarPassoFunil() {
  const funilBuilder = document.querySelector('.funil-builder');
  const novoPassoIndex = passosFunil.length + 1;
  
  const novoPassoHTML = `
    <div class="funil-step" data-step="${novoPassoIndex}">
      <button class="remove-step-btn" onclick="removerPassoFunil(${novoPassoIndex})">
        <i class="fas fa-times"></i>
      </button>
      <h3>Passo ${novoPassoIndex}</h3>
      <select class="step-type" onchange="atualizarCamposPasso(${novoPassoIndex})">
        <option value="">Selecione o tipo de ação</option>
        <option value="whatsapp">Enviar mensagem WhatsApp</option>
        <option value="email">Enviar e-mail</option>
        <option value="delay">Aguardar tempo</option>
      </select>
      <div class="step-fields"></div>
    </div>
  `;
  
  funilBuilder.insertAdjacentHTML('beforeend', novoPassoHTML);
  passosFunil.push({
    tipo: '',
    configuracoes: {}
  });
}

function removerPassoFunil(index) {
  const passo = document.querySelector(`.funil-step[data-step="${index}"]`);
  if (passo) {
    passo.remove();
    passosFunil.splice(index - 1, 1);
    // Reordenar os passos restantes
    document.querySelectorAll('.funil-step').forEach((step, idx) => {
      step.setAttribute('data-step', idx + 1);
      step.querySelector('h3').textContent = `Passo ${idx + 1}`;
    });
  }
}

function atualizarCamposPasso(index) {
  const passo = document.querySelector(`.funil-step[data-step="${index}"]`);
  const tipo = passo.querySelector('.step-type').value;
  const camposContainer = passo.querySelector('.step-fields');
  
  let camposHTML = '';
  switch (tipo) {
    case 'whatsapp':
      camposHTML = `
        <input type="text" placeholder="Número do WhatsApp" class="whatsapp-number">
        <input type="text" placeholder="Mensagem" class="whatsapp-message">
      `;
      break;
    case 'email':
      camposHTML = `
        <input type="email" placeholder="E-mail do destinatário" class="email-to">
        <input type="text" placeholder="Assunto" class="email-subject">
        <input type="text" placeholder="Mensagem" class="email-message">
      `;
      break;
    case 'delay':
      camposHTML = `
        <input type="number" placeholder="Tempo em minutos" class="delay-time">
      `;
      break;
  }
  
  camposContainer.innerHTML = camposHTML;
  passosFunil[index - 1] = {
    tipo: tipo,
    configuracoes: {}
  };
}

function salvarFunil() {
  const nomeFunil = document.querySelector('#funil-name').value;
  if (!nomeFunil) {
    alert('Por favor, insira um nome para o funil');
    return;
  }
  
  const passos = [];
  document.querySelectorAll('.funil-step').forEach((step, index) => {
    const tipo = step.querySelector('.step-type').value;
    const configuracoes = {};
    
    switch (tipo) {
      case 'whatsapp':
        configuracoes.numero = step.querySelector('.whatsapp-number').value;
        configuracoes.mensagem = step.querySelector('.whatsapp-message').value;
        break;
      case 'email':
        configuracoes.para = step.querySelector('.email-to').value;
        configuracoes.assunto = step.querySelector('.email-subject').value;
        configuracoes.mensagem = step.querySelector('.email-message').value;
        break;
      case 'delay':
        configuracoes.tempo = step.querySelector('.delay-time').value;
        break;
    }
    
    passos.push({
      tipo: tipo,
      configuracoes: configuracoes
    });
  });
  
  const funil = {
    nome: nomeFunil,
    passos: passos,
    dataCriacao: new Date().toISOString()
  };
  
  // Salvar no localStorage
  const funisSalvos = JSON.parse(localStorage.getItem('funis') || '[]');
  funisSalvos.push(funil);
  localStorage.setItem('funis', JSON.stringify(funisSalvos));
  
  // Limpar formulário
  document.querySelector('#funil-name').value = '';
  document.querySelector('.funil-builder').innerHTML = '';
  passosFunil = [];
  
  // Atualizar lista de funis
  carregarFunis();
}

function carregarFunis() {
  const funisContainer = document.querySelector('.funis-container');
  const funisSalvos = JSON.parse(localStorage.getItem('funis') || '[]');
  
  let html = '';
  funisSalvos.forEach((funil, index) => {
    html += `
      <div class="funil-item">
        <h3>${funil.nome}</h3>
        <div class="funil-actions">
          <button onclick="editarFunil(${index})">
            <i class="fas fa-edit"></i>
          </button>
          <button onclick="excluirFunil(${index})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  });
  
  funisContainer.innerHTML = html;
}

function editarFunil(index) {
  const funisSalvos = JSON.parse(localStorage.getItem('funis') || '[]');
  const funil = funisSalvos[index];
  
  document.querySelector('#funil-name').value = funil.nome;
  document.querySelector('.funil-builder').innerHTML = '';
  passosFunil = [];
  
  funil.passos.forEach((passo, idx) => {
    adicionarPassoFunil();
    const passoElement = document.querySelector(`.funil-step[data-step="${idx + 1}"]`);
    passoElement.querySelector('.step-type').value = passo.tipo;
    atualizarCamposPasso(idx + 1);
    
    // Preencher campos específicos
    switch (passo.tipo) {
      case 'whatsapp':
        passoElement.querySelector('.whatsapp-number').value = passo.configuracoes.numero;
        passoElement.querySelector('.whatsapp-message').value = passo.configuracoes.mensagem;
        break;
      case 'email':
        passoElement.querySelector('.email-to').value = passo.configuracoes.para;
        passoElement.querySelector('.email-subject').value = passo.configuracoes.assunto;
        passoElement.querySelector('.email-message').value = passo.configuracoes.mensagem;
        break;
      case 'delay':
        passoElement.querySelector('.delay-time').value = passo.configuracoes.tempo;
        break;
    }
  });
  
  // Remover o funil atual
  funisSalvos.splice(index, 1);
  localStorage.setItem('funis', JSON.stringify(funisSalvos));
  carregarFunis();
}

function excluirFunil(index) {
  if (confirm('Tem certeza que deseja excluir este funil?')) {
    const funisSalvos = JSON.parse(localStorage.getItem('funis') || '[]');
    funisSalvos.splice(index, 1);
    localStorage.setItem('funis', JSON.stringify(funisSalvos));
    carregarFunis();
  }
}

// Carregar funis ao iniciar
document.addEventListener('DOMContentLoaded', () => {
  carregarFunis();
}); 