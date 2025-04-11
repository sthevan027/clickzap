// Funções para o Construtor de Funis
let stepCounter = 0;

function adicionarPassoFunil() {
    stepCounter++;
    const stepsContainer = document.getElementById('funil-steps');
    
    const stepDiv = document.createElement('div');
    stepDiv.className = 'step-container';
    stepDiv.dataset.stepNumber = stepCounter;
    
    stepDiv.innerHTML = `
        <div class="step-header">
            <span class="step-number">Passo ${stepCounter}</span>
            <button class="delete-step" onclick="removerPassoFunil(this)">Excluir</button>
        </div>
        <textarea class="step-message" placeholder="Digite a mensagem deste passo..."></textarea>
        <div class="step-config">
            <select class="wait-type" onchange="toggleWaitTimeInput(this)">
                <option value="time">Aguardar Tempo</option>
                <option value="response">Aguardar Resposta</option>
            </select>
            <div class="wait-time-container">
                <input type="number" class="wait-time" placeholder="Tempo de espera (minutos)" min="1">
            </div>
            <div class="keywords-container" style="display: none;">
                <input type="text" class="keywords" placeholder="Palavras-chave (separadas por vírgula)">
            </div>
        </div>
    `;
    
    stepsContainer.appendChild(stepDiv);
}

function removerPassoFunil(button) {
    const stepDiv = button.closest('.step-container');
    stepDiv.remove();
    reordenarPassos();
}

function reordenarPassos() {
    const steps = document.querySelectorAll('.step-container');
    steps.forEach((step, index) => {
        step.dataset.stepNumber = index + 1;
        step.querySelector('.step-number').textContent = `Passo ${index + 1}`;
    });
    stepCounter = steps.length;
}

function toggleWaitTimeInput(select) {
    const stepDiv = select.closest('.step-container');
    const waitTimeContainer = stepDiv.querySelector('.wait-time-container');
    const keywordsContainer = stepDiv.querySelector('.keywords-container');
    
    if (select.value === 'time') {
        waitTimeContainer.style.display = 'block';
        keywordsContainer.style.display = 'none';
    } else {
        waitTimeContainer.style.display = 'none';
        keywordsContainer.style.display = 'block';
    }
}

function salvarFunil() {
    const nome = document.getElementById('funil-nome').value;
    if (!nome) {
        alert('Por favor, insira um nome para o funil');
        return;
    }
    
    const steps = [];
    document.querySelectorAll('.step-container').forEach(stepDiv => {
        const message = stepDiv.querySelector('.step-message').value;
        const waitType = stepDiv.querySelector('.wait-type').value;
        const waitTime = stepDiv.querySelector('.wait-time').value;
        const keywords = stepDiv.querySelector('.keywords').value;
        
        steps.push({
            message,
            waitType,
            waitTime: waitType === 'time' ? parseInt(waitTime) : null,
            keywords: waitType === 'response' ? keywords.split(',').map(k => k.trim()) : null
        });
    });
    
    if (steps.length === 0) {
        alert('Adicione pelo menos um passo ao funil');
        return;
    }
    
    const funil = {
        id: Date.now(),
        nome,
        steps,
        createdAt: new Date().toISOString()
    };
    
    // Salvar no localStorage
    const funis = JSON.parse(localStorage.getItem('funis') || '[]');
    funis.push(funil);
    localStorage.setItem('funis', JSON.stringify(funis));
    
    // Atualizar a lista de funis
    carregarFunis();
    
    // Limpar o formulário
    document.getElementById('funil-nome').value = '';
    document.getElementById('funil-steps').innerHTML = '';
    stepCounter = 0;
}

function carregarFunis() {
    const funisGrid = document.getElementById('funis-grid');
    const funis = JSON.parse(localStorage.getItem('funis') || '[]');
    
    funisGrid.innerHTML = '';
    
    funis.forEach(funil => {
        const funilCard = document.createElement('div');
        funilCard.className = 'funil-card';
        funilCard.innerHTML = `
            <h3>${funil.nome}</h3>
            <p>${funil.steps.length} passos</p>
            <div class="funil-card-actions">
                <button class="edit-btn" onclick="editarFunil(${funil.id})">Editar</button>
                <button class="delete-btn" onclick="excluirFunil(${funil.id})">Excluir</button>
            </div>
        `;
        funisGrid.appendChild(funilCard);
    });
}

function excluirFunil(id) {
    if (!confirm('Tem certeza que deseja excluir este funil?')) return;
    
    const funis = JSON.parse(localStorage.getItem('funis') || '[]');
    const index = funis.findIndex(f => f.id === id);
    if (index > -1) {
        funis.splice(index, 1);
        localStorage.setItem('funis', JSON.stringify(funis));
        carregarFunis();
    }
}

function editarFunil(id) {
    const funis = JSON.parse(localStorage.getItem('funis') || '[]');
    const funil = funis.find(f => f.id === id);
    if (!funil) return;
    
    document.getElementById('funil-nome').value = funil.nome;
    document.getElementById('funil-steps').innerHTML = '';
    stepCounter = 0;
    
    funil.steps.forEach(step => {
        adicionarPassoFunil();
        const stepDiv = document.querySelector('.step-container:last-child');
        stepDiv.querySelector('.step-message').value = step.message;
        stepDiv.querySelector('.wait-type').value = step.waitType;
        
        if (step.waitType === 'time') {
            stepDiv.querySelector('.wait-time').value = step.waitTime;
        } else {
            stepDiv.querySelector('.keywords').value = step.keywords.join(', ');
        }
        
        toggleWaitTimeInput(stepDiv.querySelector('.wait-type'));
    });
}

// Carregar funis ao iniciar
document.addEventListener('DOMContentLoaded', () => {
    carregarFunis();
}); 