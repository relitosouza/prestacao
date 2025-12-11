// --- (ZZ) FUNÇÕES DE SALVAMENTO PARCIAL (RASCUNHO) ---

const STORAGE_KEY = 'auditoria_dados_parciais';

/**
 * Salva o estado atual de todos os inputs e das listas dinâmicas.
 */
function salvarDadosParciais() {
    try {
        const estado = {
            inputs: {},
            listas: {}
        };

        // 1. Salvar valores de Inputs e Selects
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(el => {
            if (el.id) {
                // Para checkboxes/radios usamos 'checked', para o resto 'value'
                if (el.type === 'checkbox' || el.type === 'radio') {
                    estado.inputs[el.id] = el.checked;
                } else {
                    estado.inputs[el.id] = el.value;
                }
            }
        });

        // 2. Salvar o HTML das Listas (incluindo Staging)
        // Seleciona divs que contém listas de itens ou listas temporárias
        const listas = document.querySelectorAll('.list-container, .staging-list-container');
        listas.forEach(el => {
            if (el.id) {
                estado.listas[el.id] = el.innerHTML;
            }
        });

        // 3. Salva no LocalStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
        
        // Feedback visual
        alert('Rascunho salvo com sucesso! Você pode fechar o navegador e continuar depois.');
        
    } catch (erro) {
        console.error("Erro ao salvar rascunho:", erro);
        alert("Não foi possível salvar os dados. O armazenamento local pode estar cheio.");
    }
}

/**
 * Recupera os dados salvos e preenche a página.
 */
function recuperarDadosParciais() {
    const dadosJson = localStorage.getItem(STORAGE_KEY);
    
    if (!dadosJson) {
        alert("Nenhum rascunho encontrado.");
        return;
    }

    try {
        const estado = JSON.parse(dadosJson);

        // 1. Restaurar Inputs
        Object.keys(estado.inputs).forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (el.type === 'checkbox' || el.type === 'radio') {
                    el.checked = estado.inputs[id];
                } else {
                    el.value = estado.inputs[id];
                }
            }
        });

        // 2. Restaurar Listas
        Object.keys(estado.listas).forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.innerHTML = estado.listas[id];
            }
        });

        alert("Dados recuperados com sucesso!");

    } catch (erro) {
        console.error("Erro ao recuperar rascunho:", erro);
        alert("Erro ao processar o rascunho salvo.");
    }
}

/**
 * Limpa o rascunho salvo.
 */
function limparRascunho() {
    if(confirm("Tem certeza? Isso apagará o rascunho salvo na memória do navegador.")) {
        localStorage.removeItem(STORAGE_KEY);
        alert("Rascunho apagado.");
    }
}

// Opcional: Adicionar Auto-Save a cada 1 minuto
setInterval(() => {
    // Salvamento silencioso (sem alert)
    const dadosAntigos = localStorage.getItem(STORAGE_KEY);
    // ... lógica de salvar ...
    // Para simplificar, não ativei por padrão para não gerar conflito, 
    // mas você pode chamar salvarDadosParciais() aqui se remover o alert de sucesso.
}, 60000);
