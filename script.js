// --- (A) FUNÇÕES AUXILIARES GENÉRICAS ---

// Remove um item de qualquer lista (botão "Remover")
function removerItem(buttonElement) {
    buttonElement.parentElement.remove();
}

/**
 * Adiciona um item (objeto) a uma lista na página.
 * @param {Array} fields - Array de objetos {id: 'id-do-input', jsonKey: 'chave_json', label: 'Nome Campo', required: true/false}
 * @param {string} containerId - ID da div onde a lista de itens será exibida.
 * @param {Function} itemText - Função que recebe o objeto 'data' e retorna o HTML para o item.
 */
function adicionarItemGenerico(fields, containerId, itemText) {
    const itemData = {};
    for (const field of fields) {
        const input = document.getElementById(field.id);
        let value = (input.type === 'number') ? parseFloat(input.value) : input.value;
        
        // Trata NaN para números
        if (input.type === 'number' && isNaN(value)) {
            value = null;
        }
        // Trata string vazia
        if (input.type !== 'number' && value === "") {
            value = null;
        }

        // Validação de campos obrigatórios
        if (field.required && (value === null)) {
             alert(`Preencha o campo obrigatório: ${field.label}`);
             return;
        }
        
        // Adiciona ao objeto apenas se tiver valor
        if (value !== null) {
            itemData[field.jsonKey] = value;
        }
    }
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item';
    itemDiv.dataset.json = JSON.stringify(itemData);
    itemDiv.innerHTML = `
        <span>${itemText(itemData)}</span>
        <button type="button" class="btn-remove" onclick="removerItem(this)">Remover</button>
    `;
    document.getElementById(containerId).appendChild(itemDiv);
    for (const field of fields) {
        document.getElementById(field.id).value = "";
    }
}

/**
 * Adiciona um item (string) a uma lista na página.
 * @param {string} inputId - ID do input de onde pegar o valor.
 * @param {string} containerId - ID da div onde a lista de itens será exibida.
 * @param {Function} itemText - Função que recebe a string 'data' e retorna o HTML para o item.
 */
function adicionarStringGenerico(inputId, containerId, itemText) {
    const input = document.getElementById(inputId);
    const value = input.value;

    if (!value) {
        alert("Preencha o campo.");
        return;
    }
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item';
    itemDiv.dataset.json = value; // Armazena a string pura
    itemDiv.innerHTML = `
        <span>${itemText(value)}</span>
        <button type="button" class="btn-remove" onclick="removerItem(this)">Remover</button>
    `;
    document.getElementById(containerId).appendChild(itemDiv);
    
    input.value = ""; // Limpa o campo
}


// --- (B) LÓGICA DE NAVEGAÇÃO DO MENU ---
function openPage(event, pageId) {
    event.preventDefault();
    document.querySelectorAll('.content-page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.sidebar-menu a').forEach(link => link.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    event.currentTarget.classList.add('active');
}

// --- (C) LÓGICA: PÁGINA 2. RELAÇÃO DE EMPREGADOS ---
function addPeriodoRemuneracao() {
    const mes = parseInt(document.getElementById('rem-mes').value);
    const carga = parseFloat(document.getElementById('rem-carga').value);
    const bruta = parseFloat(document.getElementById('rem-bruta').value);
    if (isNaN(mes) || isNaN(carga) || isNaN(bruta)) {
        alert("Preencha todos os campos do período de remuneração.");
        return;
    }
    const periodo = { "mes": mes, "carga_horaria": carga, "remuneracao_bruta": bruta };
    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item-remuneracao';
    itemDiv.dataset.json = JSON.stringify(periodo);
    itemDiv.innerHTML = `
        <span>Mês: ${mes} | Carga: ${carga}h | Bruta: R$ ${bruta.toFixed(2)}</span>
        <button type="button" class="btn-remove" onclick="removerItem(this)">Remover</button>
    `;
    document.getElementById('staging-periodos-list').appendChild(itemDiv);
    document.getElementById('rem-mes').value = "";
    document.getElementById('rem-carga').value = "";
    document.getElementById('rem-bruta').value = "";
}
function salvarEmpregado() {
    const empregado = {
        "cpf": document.getElementById('emp-cpf').value,
        "data_admissao": document.getElementById('emp-data-admissao').value,
        "data_demissao": document.getElementById('emp-data-demissao').value || null,
        "cbo": document.getElementById('emp-cbo').value,
        "cns": document.getElementById('emp-cns').value,
        "salario_contratual": parseFloat(document.getElementById('emp-salario-contratual').value),
        "periodos_remuneracao": []
    };
    if (!empregado.cpf || !empregado.data_admissao || !empregado.cbo || !empregado.cns || isNaN(empregado.salario_contratual)) {
        alert("Preencha todos os dados principais do empregado.");
        return;
    }
    const periodosStaging = document.querySelectorAll('#staging-periodos-list .list-item-remuneracao');
    periodosStaging.forEach(item => {
        empregado.periodos_remuneracao.push(JSON.parse(item.dataset.json));
    });
    if (empregado.periodos_remuneracao.length === 0) {
        alert("Adicione pelo menos um período de remuneração.");
        return;
    }
    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item';
    itemDiv.dataset.json = JSON.stringify(empregado); 
    itemDiv.innerHTML = `
        <span>
            <strong>CPF: ${empregado.cpf}</strong> (Admissão: ${empregado.data_admissao})
            <br>
            <small>${empregado.periodos_remuneracao.length} período(s) de remuneração adicionado(s)</small>
        </span>
        <button type="button" class="btn-remove" onclick="removerItem(this)">Remover</button>
    `;
    document.getElementById('lista-empregados').appendChild(itemDiv);
    document.getElementById('emp-cpf').value = "";
    document.getElementById('emp-data-admissao').value = "";
    document.getElementById('emp-data-demissao').value = "";
    document.getElementById('emp-cbo').value = "";
    document.getElementById('emp-cns').value = "";
    document.getElementById('emp-salario-contratual').value = "";
    document.getElementById('staging-periodos-list').innerHTML = ""; 
}

// --- (D) LÓGICA: PÁGINA 10. SERVIDORES CEDIDOS ---
function addPeriodoCessao() {
    const mes = parseInt(document.getElementById('cessao-mes').value);
    const carga = parseFloat(document.getElementById('cessao-carga').value);
    const bruta = parseFloat(document.getElementById('cessao-bruta').value);
    if (isNaN(mes) || isNaN(carga) || isNaN(bruta)) {
        alert("Preencha todos os campos do período de cessão.");
        return;
    }
    const periodo = { "mes": mes, "carga_horaria": carga, "remuneracao_bruta": bruta };
    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item-remuneracao'; // Reutilizando classe
    itemDiv.dataset.json = JSON.stringify(periodo);
    itemDiv.innerHTML = `
        <span>Mês: ${mes} | Carga: ${carga}h | Bruta: R$ ${bruta.toFixed(2)}</span>
        <button type="button" class="btn-remove" onclick="removerItem(this)">Remover</button>
    `;
    document.getElementById('staging-periodos-cessao-list').appendChild(itemDiv);
    document.getElementById('cessao-mes').value = "";
    document.getElementById('cessao-carga').value = "";
    document.getElementById('cessao-bruta').value = "";
}
function salvarServidorCedido() {
    const servidor = {
        "cpf": document.getElementById('serv-cpf').value,
        "data_inicial_cessao": document.getElementById('serv-data-inicio').value,
        "data_final_cessao": document.getElementById('serv-data-final').value,
        "cargo_publico_ocupado": document.getElementById('serv-cargo').value,
        "funcao_desempenhada_entidade_beneficiaria": document.getElementById('serv-funcao').value,
        "onus_pagamento": parseInt(document.getElementById('serv-onus').value),
        "periodos_cessao": []
    };
    if (!servidor.cpf || !servidor.data_inicial_cessao || !servidor.cargo_publico_ocupado || !servidor.funcao_desempenhada_entidade_beneficiaria || isNaN(servidor.onus_pagamento)) {
        alert("Preencha todos os dados principais do servidor cedido.");
        return;
    }
    const periodosStaging = document.querySelectorAll('#staging-periodos-cessao-list .list-item-remuneracao');
    periodosStaging.forEach(item => {
        servidor.periodos_cessao.push(JSON.parse(item.dataset.json));
    });
    if (servidor.periodos_cessao.length === 0) {
        alert("Adicione pelo menos um período de cessão.");
        return;
    }
    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item';
    itemDiv.dataset.json = JSON.stringify(servidor); 
    itemDiv.innerHTML = `
        <span>
            <strong>CPF: ${servidor.cpf}</strong> (Cargo: ${servidor.cargo_publico_ocupado})
            <br>
            <small>${servidor.periodos_cessao.length} período(s) de cessão adicionado(s)</small>
        </span>
        <button type="button" class="btn-remove" onclick="removerItem(this)">Remover</button>
    `;
    document.getElementById('lista-servidores-cedidos').appendChild(itemDiv);
    document.getElementById('serv-cpf').value = "";
    document.getElementById('serv-data-inicio').value = "";
    document.getElementById('serv-data-final').value = "";
    document.getElementById('serv-cargo').value = "";
    document.getElementById('serv-funcao').value = "";
    document.getElementById('serv-onus').value = "";
    document.getElementById('staging-periodos-cessao-list').innerHTML = ""; 
}

// --- (E) LÓGICA: PÁGINA 3. RELAÇÃO DE BENS ---
function addBemMovelAdquirido() {
    adicionarItemGenerico(
        [{id: 'bma-patrimonio', jsonKey: 'numero_patrimonio', label: 'Nº Patrimônio', required: true}, {id: 'bma-data', jsonKey: 'data_aquisicao', label: 'Data Aquisição', required: true}, {id: 'bma-valor', jsonKey: 'valor_aquisicao', label: 'Valor Aquisição', required: true}, {id: 'bma-descricao', jsonKey: 'descricao', label: 'Descrição', required: true}],
        'lista-bens-moveis-adquiridos',
        (data) => `<strong>Patrimônio: ${data.numero_patrimonio}</strong> - ${data.descricao} (Valor: R$ ${data.valor_aquisicao.toFixed(2)})`
    );
}
function addBemMovelCedido() {
    adicionarItemGenerico(
        [{id: 'bmc-patrimonio', jsonKey: 'numero_patrimonio', label: 'Nº Patrimônio', required: true}, {id: 'bmc-data', jsonKey: 'data_cessao', label: 'Data Cessão', required: true}, {id: 'bmc-valor', jsonKey: 'valor_cessao', label: 'Valor Cessão', required: true}, {id: 'bmc-descricao', jsonKey: 'descricao', label: 'Descrição', required: true}],
        'lista-bens-moveis-cedidos',
        (data) => `<strong>Patrimônio: ${data.numero_patrimonio}</strong> - ${data.descricao} (Valor: R$ ${data.valor_cessao.toFixed(2)})`
    );
}
function addBemMovelBaixado() {
    adicionarItemGenerico(
        [{id: 'bmb-patrimonio', jsonKey: 'numero_patrimonio', label: 'Nº Patrimônio', required: true}, {id: 'bmb-data', jsonKey: 'data_baixa_devolucao', label: 'Data Baixa', required: true}],
        'lista-bens-moveis-baixados',
        (data) => `<strong>Patrimônio: ${data.numero_patrimonio}</strong> (Data: ${data.data_baixa_devolucao})`
    );
}
function addBemImovelAdquirido() {
    adicionarItemGenerico(
        [{id: 'bia-descricao', jsonKey: 'descricao', label: 'Descrição', required: true}, {id: 'bia-data', jsonKey: 'data_aquisicao', label: 'Data Aquisição', required: true}],
        'lista-bens-imoveis-adquiridos',
        (data) => `<strong>Imóvel: ${data.descricao}</strong> (Data: ${data.data_aquisicao})`
    );
}
function addBemImovelCedido() {
    adicionarItemGenerico(
        [{id: 'bic-descricao', jsonKey: 'descricao', label: 'Descrição', required: true}, {id: 'bic-data', jsonKey: 'data_cessao', label: 'Data Cessão', required: true}],
        'lista-bens-imoveis-cedidos',
        (data) => `<strong>Imóvel: ${data.descricao}</strong> (Data: ${data.data_cessao})`
    );
}
function addBemImovelBaixado() {
    adicionarItemGenerico(
        [{id: 'bib-descricao', jsonKey: 'descricao', label: 'Descrição', required: true}, {id: 'bib-data', jsonKey: 'data_baixa_devolucao', label: 'Data Baixa', required: true}],
        'lista-bens-imoveis-baixados',
        (data) => `<strong>Imóvel: ${data.descricao}</strong> (Data: ${data.data_baixa_devolucao})`
    );
}

// --- (F) LÓGICA: PÁGINA 4. CONTRATOS ---
function addContrato() {
    const naturezaStr = document.getElementById('contrato-natureza').value;
    const naturezaArray = naturezaStr.split(',').map(s => s.trim()).filter(s => s.length > 0).map(s => parseInt(s)).filter(n => !isNaN(n));
    
    const contrato = {
        "numero": document.getElementById('contrato-numero').value,
        "credor": {
            "documento_tipo": parseInt(document.getElementById('contrato-credor-tipo').value),
            "documento_numero": document.getElementById('contrato-credor-numero').value,
            "nome": document.getElementById('contrato-credor-nome').value
        },
        "data_assinatura": document.getElementById('contrato-data-assinatura').value,
        "vigencia_tipo": parseInt(document.getElementById('contrato-vigencia-tipo').value),
        "vigencia_data_inicial": document.getElementById('contrato-vigencia-inicio').value,
        "vigencia_data_final": document.getElementById('contrato-vigencia-final').value,
        "objeto": document.getElementById('contrato-objeto').value,
        "natureza_contratacao": naturezaArray,
        "natureza_contratacao_outro": document.getElementById('contrato-natureza-outro').value || undefined,
        "criterio_selecao": parseInt(document.getElementById('contrato-criterio').value),
        "criterio_selecao_outro": document.getElementById('contrato-criterio-outro').value || undefined,
        "artigo_regulamento_compras": document.getElementById('contrato-artigo').value,
        "valor_montante": parseFloat(document.getElementById('contrato-valor-montante').value),
        "valor_tipo": parseInt(document.getElementById('contrato-valor-tipo').value)
    };
    
    // Limpeza de valores NaN
    Object.keys(contrato).forEach(key => {
        if (typeof contrato[key] === 'number' && isNaN(contrato[key])) contrato[key] = null;
    });
    Object.keys(contrato.credor).forEach(key => {
        if (typeof contrato.credor[key] === 'number' && isNaN(contrato.credor[key])) contrato.credor[key] = null;
    });

    if (!contrato.numero || !contrato.credor.nome || !contrato.objeto) {
        alert("Preencha pelo menos o Número, Nome do Credor e Objeto do contrato.");
        return;
    }

    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item';
    itemDiv.dataset.json = JSON.stringify(contrato);
    itemDiv.innerHTML = `
        <span>
            <strong>Contrato: ${contrato.numero}</strong>
            <br>
            <small>Credor: ${contrato.credor.nome} | Objeto: ${contrato.objeto}</small>
        </span>
        <button type="button" class="btn-remove" onclick="removerItem(this)">Remover</button>
    `;
    document.getElementById('lista-contratos').appendChild(itemDiv);
    const fieldsToClear = [
        'contrato-numero', 'contrato-credor-tipo', 'contrato-credor-numero', 'contrato-credor-nome',
        'contrato-data-assinatura', 'contrato-vigencia-tipo', 'contrato-vigencia-inicio', 'contrato-vigencia-final',
        'contrato-objeto', 'contrato-natureza', 'contrato-natureza-outro', 'contrato-criterio',
        'contrato-criterio-outro', 'contrato-artigo', 'contrato-valor-montante', 'contrato-valor-tipo'
    ];
    fieldsToClear.forEach(id => document.getElementById(id).value = "");
}

// --- (G) LÓGICA: PÁGINA 5. DOCUMENTOS FISCAIS ---
function addDocumentoFiscal() {
    const docFiscal = {
        "numero": document.getElementById('doc-numero').value,
        "credor": {
            "documento_tipo": parseInt(document.getElementById('doc-credor-tipo').value),
            "documento_numero": document.getElementById('doc-credor-numero').value,
            "nome": document.getElementById('doc-credor-nome').value
        },
        "identificacao_contrato": {
            "numero": document.getElementById('doc-contrato-numero').value,
            "data_assinatura": document.getElementById('doc-contrato-data').value,
            "identificacao_credor": {
                "documento_tipo": parseInt(document.getElementById('doc-contrato-credor-tipo').value),
                "documento_numero": document.getElementById('doc-contrato-credor-numero').value
            }
        },
        "descricao": document.getElementById('doc-descricao').value,
        "data_emissao": document.getElementById('doc-data-emissao').value,
        "estado_emissor": parseInt(document.getElementById('doc-estado-emissor').value),
        "valor_bruto": parseFloat(document.getElementById('doc-valor-bruto').value),
        "valor_encargos": parseFloat(document.getElementById('doc-valor-encargos').value),
        "categoria_despesas_tipo": parseInt(document.getElementById('doc-categoria-despesa').value),
        "rateio_proveniente_tipo": parseInt(document.getElementById('doc-rateio-tipo').value),
        "rateio_percentual": parseFloat(document.getElementById('doc-rateio-percentual').value)
    };
    if (!docFiscal.numero || !docFiscal.credor.nome || !docFiscal.descricao) {
        alert("Preencha pelo menos o Número, Nome do Credor e Descrição do documento.");
        return;
    }
    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item';
    itemDiv.dataset.json = JSON.stringify(docFiscal);
    itemDiv.innerHTML = `
        <span>
            <strong>Doc: ${docFiscal.numero}</strong> (R$ ${docFiscal.valor_bruto || 0.0})
            <br>
            <small>Credor: ${docFiscal.credor.nome} | Descrição: ${docFiscal.descricao}</small>
        </span>
        <button type="button" class="btn-remove" onclick="removerItem(this)">Remover</button>
    `;
    document.getElementById('lista-docfiscais').appendChild(itemDiv);
    const fieldsToClear = [
        'doc-numero', 'doc-data-emissao', 'doc-descricao', 'doc-credor-tipo', 'doc-credor-numero',
        'doc-credor-nome', 'doc-contrato-numero', 'doc-contrato-data', 'doc-contrato-credor-tipo',
        'doc-contrato-credor-numero', 'doc-estado-emissor', 'doc-valor-bruto', 'doc-valor-encargos',
        'doc-categoria-despesa', 'doc-rateio-tipo', 'doc-rateio-percentual'
    ];
    fieldsToClear.forEach(id => document.getElementById(id).value = "");
}

// --- (H) LÓGICA: PÁGINA 6. PAGAMENTOS ---
function addPagamento() {
    const pagamento = {
        "identificacao_documento_fiscal": {
            "numero": document.getElementById('pag-doc-numero').value,
            "identificacao_credor": {
                "documento_tipo": parseInt(document.getElementById('pag-doc-credor-tipo').value),
                "documento_numero": document.getElementById('pag-doc-credor-numero').value
            }
        },
        "pagamento_data": document.getElementById('pag-data').value,
        "pagamento_valor": parseFloat(document.getElementById('pag-valor').value),
        "fonte_recurso_tipo": parseInt(document.getElementById('pag-fonte-recurso').value),
        "meio_pagamento_tipo": parseInt(document.getElementById('pag-meio-pagamento').value),
        "banco": parseInt(document.getElementById('pag-banco').value),
        "agencia": parseInt(document.getElementById('pag-agencia').value),
        "conta_corrente": document.getElementById('pag-conta').value,
        "numero_transacao": document.getElementById('pag-transacao').value
    };
    if (!pagamento.identificacao_documento_fiscal.numero || !pagamento.pagamento_data || isNaN(pagamento.pagamento_valor)) {
        alert("Preencha pelo menos o Número do Doc. Fiscal, Data e Valor do Pagamento.");
        return;
    }
    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item';
    itemDiv.dataset.json = JSON.stringify(pagamento);
    itemDiv.innerHTML = `
        <span>
            <strong>Doc: ${pagamento.identificacao_documento_fiscal.numero}</strong> (R$ ${pagamento.pagamento_valor.toFixed(2)})
            <br>
            <small>Data: ${pagamento.pagamento_data} | Transação: ${pagamento.numero_transacao}</small>
        </span>
        <button type="button" class="btn-remove" onclick="removerItem(this)">Remover</button>
    `;
    document.getElementById('lista-pagamentos').appendChild(itemDiv);
    const fieldsToClear = [
        'pag-doc-numero', 'pag-doc-credor-tipo', 'pag-doc-credor-numero',
        'pag-data', 'pag-valor', 'pag-fonte-recurso', 'pag-meio-pagamento',
        'pag-banco', 'pag-agencia', 'pag-conta', 'pag-transacao'
    ];
    fieldsToClear.forEach(id => document.getElementById(id).value = "");
}

// --- (I) LÓGICA: PÁGINA 7. DISPONIBILIDADES ---
function addSaldo() {
     adicionarItemGenerico(
        [
            {id: 'saldo-banco', jsonKey: 'banco', label: 'Banco', required: true},
            {id: 'saldo-agencia', jsonKey: 'agencia', label: 'Agência', required: true},
            {id: 'saldo-conta', jsonKey: 'conta', label: 'Conta', required: true},
            {id: 'saldo-conta-tipo', jsonKey: 'conta_tipo', label: 'Tipo da Conta', required: true},
            {id: 'saldo-bancario', jsonKey: 'saldo_bancario', label: 'Saldo Bancário', required: true},
            {id: 'saldo-contabil', jsonKey: 'saldo_contabil', label: 'Saldo Contábil', required: true}
        ],
        'lista-saldos',
        (data) => `<strong>Conta: ${data.conta} (Ag: ${data.agencia} / Bco: ${data.banco})</strong>
                   <br>
                   <small>Saldo Bancário: R$ ${data.saldo_bancario.toFixed(2)} | Saldo Contábil: R$ ${data.saldo_contabil.toFixed(2)}</small>`
    );
}

// --- (J) LÓGICA: PÁGINA 8. RECEITAS ---
function addRepasseRecebido() {
    adicionarItemGenerico(
        [{id: 'rep-data-prevista', jsonKey: 'data_prevista', label: 'Data Prevista', required: true}, {id: 'rep-data-repasse', jsonKey: 'data_repasse', label: 'Data Repasse', required: true}, {id: 'rep-valor', jsonKey: 'valor', label: 'Valor', required: true}, {id: 'rep-fonte-recurso', jsonKey: 'fonte_recurso_tipo', label: 'Fonte Recurso', required: true}],
        'lista-repasses-recebidos',
        (data) => `<strong>Data Repasse: ${data.data_repasse}</strong> - Valor: R$ ${data.valor.toFixed(2)} (Fonte: ${data.fonte_recurso_tipo})`
    );
}
function addOutraReceita() {
    adicionarItemGenerico(
        [{id: 'outra-descricao', jsonKey: 'descricao', label: 'Descrição', required: true}, {id: 'outra-valor', jsonKey: 'valor', label: 'Valor', required: true}],
        'lista-outras-receitas',
        (data) => `<strong>${data.descricao}</strong> - Valor: R$ ${data.valor.toFixed(2)}`
    );
}
function addRecursoProprio() {
    adicionarItemGenerico(
        [{id: 'proprio-descricao', jsonKey: 'descricao', label: 'Descrição', required: true}, {id: 'proprio-valor', jsonKey: 'valor', label: 'Valor', required: true}],
        'lista-recursos-proprios',
        (data) => `<strong>${data.descricao}</strong> - Valor: R$ ${data.valor.toFixed(2)}`
    );
}

// --- (K) LÓGICA: PÁGINA 9. AJUSTES DE SALDO ---
function addRetificacaoRepasse() {
    adicionarItemGenerico(
        [
            {id: 'ajuste-rr-data-prevista', jsonKey: 'data_prevista', label: 'Data Prevista', required: true},
            {id: 'ajuste-rr-data-repasse', jsonKey: 'data_repasse', label: 'Data Repasse', required: true},
            {id: 'ajuste-rr-valor-retificado', jsonKey: 'valor_retificado', label: 'Valor Retificado', required: true}
        ],
        'lista-retificacao-repasses',
        (data) => `<strong>Data: ${data.data_repasse}</strong> - Valor Retificado: R$ ${data.valor_retificado.toFixed(2)}`
    );
}
function addInclusaoRepasse() {
    adicionarItemGenerico(
        [
            {id: 'ajuste-ir-data-prevista', jsonKey: 'data_prevista', label: 'Data Prevista', required: true},
            {id: 'ajuste-ir-data-repasse', jsonKey: 'data_repasse', label: 'Data Repasse', required: true},
            {id: 'ajuste-ir-valor', jsonKey: 'valor', label: 'Valor', required: true},
            {id: 'ajuste-ir-fonte', jsonKey: 'fonte_recurso_tipo', label: 'Fonte Recurso', required: true}
        ],
        'lista-inclusao-repasses',
        (data) => `<strong>Data: ${data.data_repasse}</strong> - Valor: R$ ${data.valor.toFixed(2)} (Fonte: ${data.fonte_recurso_tipo})`
    );
}
function addRetificacaoPagamento() {
    const retificacao = {
        "identificacao_documento_fiscal": {
            "numero": document.getElementById('ajuste-rp-doc-numero').value,
            "identificacao_credor": {
                "documento_tipo": parseInt(document.getElementById('ajuste-rp-credor-tipo').value),
                "documento_numero": document.getElementById('ajuste-rp-credor-numero').value
            }
        },
        "pagamento_data": document.getElementById('ajuste-rp-data').value,
        "pagamento_valor": parseFloat(document.getElementById('ajuste-rp-valor').value),
        "fonte_recurso_tipo": parseInt(document.getElementById('ajuste-rp-fonte').value),
        "valor_retificado": parseFloat(document.getElementById('ajuste-rp-valor-retificado').value)
    };
    if (!retificacao.identificacao_documento_fiscal.numero || isNaN(retificacao.valor_retificado)) {
        alert("Preencha o Número do Doc. Fiscal e o Valor Retificado.");
        return;
    }
    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item';
    itemDiv.dataset.json = JSON.stringify(retificacao);
    itemDiv.innerHTML = `
        <span>
            <strong>Doc: ${retificacao.identificacao_documento_fiscal.numero}</strong>
            <br>
            <small>Valor Original: R$ ${retificacao.pagamento_valor.toFixed(2)} | Valor Retificado: R$ ${retificacao.valor_retificado.toFixed(2)}</small>
        </span>
        <button type="button" class="btn-remove" onclick="removerItem(this)">Remover</button>
    `;
    document.getElementById('lista-retificacao-pagamentos').appendChild(itemDiv);
    const fieldsToClear = [
        'ajuste-rp-doc-numero', 'ajuste-rp-credor-tipo', 'ajuste-rp-credor-numero',
        'ajuste-rp-data', 'ajuste-rp-valor', 'ajuste-rp-fonte', 'ajuste-rp-valor-retificado'
    ];
    fieldsToClear.forEach(id => document.getElementById(id).value = "");
}
function addInclusaoPagamento() {
    const inclusao = {
        "identificacao_documento_fiscal": {
            "numero": document.getElementById('ajuste-ip-doc-numero').value,
            "identificacao_credor": {
                "documento_tipo": parseInt(document.getElementById('ajuste-ip-credor-tipo').value),
                "documento_numero": document.getElementById('ajuste-ip-credor-numero').value
            }
        },
        "pagamento_data": document.getElementById('ajuste-ip-data').value,
        "pagamento_valor": parseFloat(document.getElementById('ajuste-ip-valor').value),
        "fonte_recurso_tipo": parseInt(document.getElementById('ajuste-ip-fonte-recurso').value),
        "meio_pagamento_tipo": parseInt(document.getElementById('ajuste-ip-meio-pagamento').value),
        "banco": parseInt(document.getElementById('ajuste-ip-banco').value),
        "agencia": parseInt(document.getElementById('ajuste-ip-agencia').value),
        "conta_corrente": document.getElementById('ajuste-ip-conta').value,
        "numero_transacao": document.getElementById('ajuste-ip-transacao').value
    };
    if (!inclusao.identificacao_documento_fiscal.numero || !inclusao.pagamento_data || isNaN(inclusao.pagamento_valor)) {
        alert("Preencha pelo menos o Número do Doc. Fiscal, Data e Valor do Pagamento.");
        return;
    }
    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item';
    itemDiv.dataset.json = JSON.stringify(inclusao);
    itemDiv.innerHTML = `
        <span>
            <strong>Doc: ${inclusao.identificacao_documento_fiscal.numero}</strong> (R$ ${inclusao.pagamento_valor.toFixed(2)})
            <br>
            <small>Data: ${inclusao.pagamento_data} | Transação: ${inclusao.numero_transacao}</small>
        </span>
        <button type="button" class="btn-remove" onclick="removerItem(this)">Remover</button>
    `;
    document.getElementById('lista-inclusao-pagamentos').appendChild(itemDiv);
    const fieldsToClear = [
        'ajuste-ip-doc-numero', 'ajuste-ip-credor-tipo', 'ajuste-ip-credor-numero',
        'ajuste-ip-data', 'ajuste-ip-valor', 'ajuste-ip-fonte-recurso', 'ajuste-ip-meio-pagamento',
        'ajuste-ip-banco', 'ajuste-ip-agencia', 'ajuste-ip-conta', 'ajuste-ip-transacao'
    ];
    fieldsToClear.forEach(id => document.getElementById(id).value = "");
}

// --- (L) LÓGICA: PÁGINA 11. DESCONTOS ---
function addDesconto() {
     adicionarItemGenerico(
        [
            {id: 'desc-data', jsonKey: 'data', label: 'Data', required: true},
            {id: 'desc-descricao', jsonKey: 'descricao', label: 'Descrição', required: true},
            {id: 'desc-valor', jsonKey: 'valor', label: 'Valor', required: true}
        ],
        'lista-descontos',
        (data) => `<strong>${data.descricao}</strong> (Data: ${data.data} | Valor: R$ ${data.valor.toFixed(2)})`
    );
}

// --- (M) LÓGICA: PÁGINA 12. DEVOLUÇÕES ---
function addDevolucao() {
     adicionarItemGenerico(
        [
            {id: 'dev-data', jsonKey: 'data', label: 'Data', required: true},
            {id: 'dev-natureza', jsonKey: 'natureza_devolucao_tipo', label: 'Natureza Devolução', required: true},
            {id: 'dev-valor', jsonKey: 'valor', label: 'Valor', required: true}
        ],
        'lista-devolucoes',
        (data) => `<strong>Natureza: ${data.natureza_devolucao_tipo}</strong> (Data: ${data.data} | Valor: R$ ${data.valor.toFixed(2)})`
    );
}

// --- (N) LÓGICA: PÁGINA 13. GLOSAS ---
function addGlosa() {
    const glosa = {
        "identificacao_documento_fiscal": {
            "numero": document.getElementById('glosa-doc-numero').value,
            "identificacao_credor": {
                "documento_tipo": parseInt(document.getElementById('glosa-credor-tipo').value),
                "documento_numero": document.getElementById('glosa-credor-numero').value
            }
        },
        "resultado_analise": parseInt(document.getElementById('glosa-resultado').value),
        "valor_glosa": parseFloat(document.getElementById('glosa-valor').value)
    };
    
    if (!glosa.identificacao_documento_fiscal.numero || isNaN(glosa.resultado_analise) || isNaN(glosa.valor_glosa)) {
        alert("Preencha todos os campos da glosa.");
        return;
    }
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item';
    itemDiv.dataset.json = JSON.stringify(glosa);
    itemDiv.innerHTML = `
        <span>
            <strong>Doc: ${glosa.identificacao_documento_fiscal.numero}</strong> (Valor: R$ ${glosa.valor_glosa.toFixed(2)})
            <br>
            <small>Resultado Análise: ${glosa.resultado_analise}</small>
        </span>
        <button type="button" class="btn-remove" onclick="removerItem(this)">Remover</button>
    `;
    document.getElementById('lista-glosas').appendChild(itemDiv);
    
    const fieldsToClear = [
        'glosa-doc-numero', 'glosa-credor-tipo', 'glosa-credor-numero',
        'glosa-resultado', 'glosa-valor'
    ];
    fieldsToClear.forEach(id => document.getElementById(id).value = "");
}

// --- (O) LÓGICA: PÁGINA 14. EMPENHOS ---
function addEmpenho() {
     adicionarItemGenerico(
        [
            {id: 'emp-numero', jsonKey: 'numero', label: 'Número', required: true},
            {id: 'emp-data-emissao', jsonKey: 'data_emissao', label: 'Data Emissão', required: true},
            {id: 'emp-classificacao', jsonKey: 'classificacao_economica_tipo', label: 'Classificação Econômica', required: true},
            {id: 'emp-fonte-recurso', jsonKey: 'fonte_recurso_tipo', label: 'Fonte Recurso', required: true},
            {id: 'emp-valor', jsonKey: 'valor', label: 'Valor', required: true},
            {id: 'emp-historico', jsonKey: 'historico', label: 'Histórico', required: true},
            {id: 'emp-cpf-ordenador', jsonKey: 'cpf_ordenador_despesa', label: 'CPF Ordenador', required: true}
        ],
        'lista-empenhos',
        (data) => `<strong>Nº: ${data.numero}</strong> (Data: ${data.data_emissao} | Valor: R$ ${data.valor.toFixed(2)})
                   <br>
                   <small>Histórico: ${data.historico}</small>`
    );
}

// --- (P) LÓGICA: PÁGINA 15. REPASSES ---
function addRepasse() {
    const repasse = {
        "identificacao_empenho": {
            "numero": document.getElementById('repasse-emp-numero').value,
            "data_emissao": document.getElementById('repasse-emp-data').value
        },
        "data_prevista": document.getElementById('repasse-data-prevista').value,
        "data_repasse": document.getElementById('repasse-data-repasse').value,
        "valor_previsto": parseFloat(document.getElementById('repasse-valor-previsto').value),
        "valor_repasse": parseFloat(document.getElementById('repasse-valor-repasse').value),
        "justificativa_diferenca_valor": document.getElementById('repasse-justificativa').value || undefined,
        "tipo_documento_bancario": parseInt(document.getElementById('repasse-doc-tipo').value),
        "descricao_outros": document.getElementById('repasse-doc-outros').value || undefined,
        "numero_documento": document.getElementById('repasse-doc-numero').value,
        "banco": parseInt(document.getElementById('repasse-banco').value),
        "agencia": parseInt(document.getElementById('repasse-agencia').value),
        "conta": document.getElementById('repasse-conta').value
    };

    if (!repasse.identificacao_empenho.numero || !repasse.data_repasse || isNaN(repasse.valor_repasse)) {
        alert("Preencha pelo menos o Número do Empenho, Data do Repasse e Valor do Repasse.");
        return;
    }
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item';
    itemDiv.dataset.json = JSON.stringify(repasse);
    itemDiv.innerHTML = `
        <span>
            <strong>Empenho: ${repasse.identificacao_empenho.numero}</strong> (Valor: R$ ${repasse.valor_repasse.toFixed(2)})
            <br>
            <small>Data: ${repasse.data_repasse} | Doc: ${repasse.numero_documento}</small>
        </span>
        <button type="button" class="btn-remove" onclick="removerItem(this)">Remover</button>
    `;
    document.getElementById('lista-repasses').appendChild(itemDiv);

    const fieldsToClear = [
        'repasse-emp-numero', 'repasse-emp-data', 'repasse-data-prevista', 'repasse-data-repasse',
        'repasse-valor-previsto', 'repasse-valor-repasse', 'repasse-justificativa', 'repasse-doc-tipo',
        'repasse-doc-outros', 'repasse-doc-numero', 'repasse-banco', 'repasse-agencia', 'repasse-conta'
    ];
    fieldsToClear.forEach(id => document.getElementById(id).value = "");
}

// --- (Q) LÓGICA: PÁGINA 16. RELATÓRIO DE ATIVIDADES ---
function addPeriodicidade() {
    const periodoNum = parseInt(document.getElementById('periodo-num').value);
    const quantidade = parseFloat(document.getElementById('periodo-qtd').value);
    const resultado = parseInt(document.getElementById('periodo-res').value);
    const justificativa = document.getElementById('periodo-just').value;

    if (isNaN(periodoNum)) {
        alert("Preencha pelo menos o campo 'Período (Mês)'.");
        return;
    }

    const periodo = { "periodo": periodoNum };
    if (!isNaN(quantidade)) periodo.quantidade_realizada = quantidade;
    if (!isNaN(resultado)) periodo.resultado_meta = resultado;
    if (justificativa) periodo.justificativa = justificativa;

    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item-remuneracao';
    itemDiv.dataset.json = JSON.stringify(periodo);
    
    let displayText = `Período: ${periodo.periodo}`;
    if(periodo.quantidade_realizada) displayText += ` | Qtd: ${periodo.quantidade_realizada}`;
    if(periodo.resultado_meta) displayText += ` | Res: ${periodo.resultado_meta}`;
    
    itemDiv.innerHTML = `
        <span>${displayText}</span>
        <button type="button" class="btn-remove" onclick="removerItem(this)">Remover</button>
    `;
    document.getElementById('staging-periodicidades-list').appendChild(itemDiv);

    document.getElementById('periodo-num').value = "";
    document.getElementById('periodo-qtd').value = "";
    document.getElementById('periodo-res').value = "";
    document.getElementById('periodo-just').value = "";
}
function salvarMeta() {
    const meta = {
        "codigo_meta": document.getElementById('meta-codigo').value,
        "meta_atendida": (document.getElementById('meta-atendida').value === 'true'),
        "periodicidades": []
    };
    const justificativaMeta = document.getElementById('meta-justificativa').value;
    if (justificativaMeta) meta.justificativa = justificativaMeta;

    if (!meta.codigo_meta) {
        alert("Preencha o 'Código da Meta'.");
        return;
    }

    const periodosStaging = document.querySelectorAll('#staging-periodicidades-list .list-item-remuneracao');
    periodosStaging.forEach(item => {
        meta.periodicidades.push(JSON.parse(item.dataset.json));
    });

    if (meta.periodicidades.length === 0) {
        alert("Adicione pelo menos uma 'Periodicidade' à meta.");
        return;
    }

    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item';
    itemDiv.dataset.json = JSON.stringify(meta); 
    itemDiv.innerHTML = `
        <span>
            <strong>Meta: ${meta.codigo_meta}</strong> (Atendida: ${meta.meta_atendida ? 'Sim' : 'Não'})
            <br>
            <small>${meta.periodicidades.length} período(s) adicionado(s)</small>
        </span>
        <button type="button" class="btn-remove" onclick="removerItem(this)">Remover</button>
    `;
    document.getElementById('staging-metas-list').appendChild(itemDiv);

    document.getElementById('meta-codigo').value = "";
    document.getElementById('meta-atendida').value = "true";
    document.getElementById('meta-justificativa').value = "";
    document.getElementById('staging-periodicidades-list').innerHTML = "";
}
function salvarPrograma() {
    const programa = {
        "nome_programa": document.getElementById('programa-nome').value,
        "metas": []
    };
    
    if (!programa.nome_programa) {
        alert("Preencha o 'Nome do Programa'.");
        return;
    }

    const metasStaging = document.querySelectorAll('#staging-metas-list .list-item');
    metasStaging.forEach(item => {
        programa.metas.push(JSON.parse(item.dataset.json));
    });

    if (programa.metas.length === 0) {
        alert("Adicione pelo menos uma 'Meta' ao programa.");
        return;
    }
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item';
    itemDiv.dataset.json = JSON.stringify(programa); 
    itemDiv.innerHTML = `
        <span>
            <strong>Programa: ${programa.nome_programa}</strong>
            <br>
            <small>${programa.metas.length} meta(s) adicionada(s)</small>
        </span>
        <button type="button" class="btn-remove" onclick="removerItem(this)">Remover</button>
    `;
    document.getElementById('lista-programas').appendChild(itemDiv);

    document.getElementById('programa-nome').value = "";
    document.getElementById('staging-metas-list').innerHTML = ""; 
    document.getElementById('staging-periodicidades-list').innerHTML = "";
}

// --- (R) LÓGICA: PÁGINAS 17. DADOS GERAIS ENTIDADE ---
// (Esta página não possui listas dinâmicas, apenas geração de JSON)

// --- (S) LÓGICA: PÁGINAS 18. RESPONSÁVEIS E MEMBROS ---
// (Esta página não possui listas dinâmicas, apenas geração de JSON)

// --- (T) LÓGICA: PÁGINAS 19. PUBLICAÇÃO REGULAMENTO ---
function addPubInicial() {
    adicionarItemGenerico(
        [
            {id: 'pub-inicial-tipo', jsonKey: 'tipo_veiculo_publicacao', label: 'Tipo Veículo', required: true},
            {id: 'pub-inicial-nome', jsonKey: 'nome_veiculo', label: 'Nome Veículo', required: false},
            {id: 'pub-inicial-data', jsonKey: 'data_publicacao', label: 'Data Publicação', required: true},
            {id: 'pub-inicial-url', jsonKey: 'endereco_internet', label: 'Endereço Internet', required: false}
        ],
        'lista-pub-inicial',
        (data) => `<strong>Data: ${data.data_publicacao}</strong> (Tipo: ${data.tipo_veiculo_publicacao})<br><small>${data.endereco_internet || data.nome_veiculo || ''}</small>`
    );
}
function addPubAlteracao() {
    adicionarItemGenerico(
        [
            {id: 'pub-alteracao-tipo', jsonKey: 'tipo_veiculo_publicacao', label: 'Tipo Veículo', required: true},
            {id: 'pub-alteracao-nome', jsonKey: 'nome_veiculo', label: 'Nome Veículo', required: false},
            {id: 'pub-alteracao-data', jsonKey: 'data_publicacao', label: 'Data Publicação', required: true},
            {id: 'pub-alteracao-url', jsonKey: 'endereco_internet', label: 'Endereço Internet', required: false}
        ],
        'lista-pub-alteracao',
        (data) => `<strong>Data: ${data.data_publicacao}</strong> (Tipo: ${data.tipo_veiculo_publicacao})<br><small>${data.endereco_internet || data.nome_veiculo || ''}</small>`
    );
}

// --- (U) LÓGICA: PÁGINA 20. PUBLICAÇÃO EXTRATO ---
function addPubExtrato() {
    adicionarItemGenerico(
        [
            {id: 'extrato-pub-tipo', jsonKey: 'tipo_veiculo_publicacao', label: 'Tipo Veículo', required: true},
            {id: 'extrato-pub-nome', jsonKey: 'nome_veiculo', label: 'Nome Veículo', required: false},
            {id: 'extrato-pub-data', jsonKey: 'data_publicacao', label: 'Data Publicação', required: true},
            {id: 'extrato-pub-url', jsonKey: 'endereco_internet', label: 'Endereço Internet', required: false}
        ],
        'lista-pub-extrato',
        (data) => `<strong>Data: ${data.data_publicacao}</strong> (Tipo: ${data.tipo_veiculo_publicacao})<br><small>${data.endereco_internet || data.nome_veiculo || ''}</small>`
    );
}

// --- (V) LÓGICA: PÁGINA 21. DECLARAÇÕES ---
function addEmpresaPertencente() {
    // Validação customizada para CNPJ ou CPF
    const cnpj = document.getElementById('empresa-cnpj').value;
    const cpf = document.getElementById('empresa-cpf').value;
    
    if (!cnpj && !cpf) {
        alert("Preencha pelo menos o CNPJ ou o CPF.");
        return;
    }
    
    adicionarItemGenerico(
        [
            {id: 'empresa-cnpj', jsonKey: 'cnpj', label: 'CNPJ', required: false},
            {id: 'empresa-cpf', jsonKey: 'cpf', label: 'CPF', required: false}
        ],
        'lista-empresas-pertencentes',
        (data) => `<strong>CNPJ:</strong> ${data.cnpj || 'N/A'} | <strong>CPF:</strong> ${data.cpf || 'N/A'}`
    );
}
function addCpfContratado() {
    const cpfInput = document.getElementById('part-cpf-contratado');
    const cpf = cpfInput.value;
    
    if (!cpf) {
        alert("Preencha o CPF do Contratado.");
        return;
    }
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item-remuneracao'; 
    itemDiv.dataset.json = cpf; // Armazena a string pura
    itemDiv.innerHTML = `
        <span>CPF: ${cpf}</span>
        <button type="button" class="btn-remove" onclick="removerItem(this)">Remover</button>
    `;
    document.getElementById('staging-cpf-contratados-list').appendChild(itemDiv);
    
    cpfInput.value = ""; // Limpa o campo
}
function salvarParticipacaoDiretivo() {
    const participacao = {
        "cpf_dirigente": document.getElementById('part-cpf-dirigente').value,
        "cpf_contratados": []
    };

    if (!participacao.cpf_dirigente) {
        alert("Preencha o 'CPF do Dirigente'.");
        return;
    }

    const cpfStaging = document.querySelectorAll('#staging-cpf-contratados-list .list-item-remuneracao');
    cpfStaging.forEach(item => {
        participacao.cpf_contratados.push(item.dataset.json); // Pega a string do dataset
    });

    if (participacao.cpf_contratados.length === 0) {
        alert("Adicione pelo menos um 'CPF de Contratado' para este dirigente.");
        return;
    }

    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item'; 
    itemDiv.dataset.json = JSON.stringify(participacao); 
    itemDiv.innerHTML = `
        <span>
            <strong>Dirigente (CPF): ${participacao.cpf_dirigente}</strong>
            <br>
            <small>${participacao.cpf_contratados.length} CPF(s) de contratado(s) vinculado(s)</small>
        </span>
        <button type="button" class="btn-remove" onclick="removerItem(this)">Remover</button>
    `;
    document.getElementById('lista-participacoes-diretivo').appendChild(itemDiv);

    // Limpa forms
    document.getElementById('part-cpf-dirigente').value = "";
    document.getElementById('staging-cpf-contratados-list').innerHTML = ""; // Limpa a lista de staging
}

// --- (W) LÓGICA: PÁGINA 22. REL. COMISSÃO AVALIAÇÃO ---
// (Esta página não possui listas dinâmicas, apenas geração de JSON)

// --- (X) LÓGICA: PÁGINA 23. REL. GOVERNAMENTAL ---
// (Esta página não possui listas dinâmicas, apenas geração de JSON)

// --- (Y) LÓGICA: PÁGINA 24. REL. MONITORAMENTO ---
// (Esta página não possui listas dinâmicas, apenas geração de JSON)

// --- (Z) LÓGICA: PÁGINA 25. DEMONSTRAÇÕES CONTÁBEIS ---
function addDemonstracaoPublicacao() {
    adicionarItemGenerico(
        [
            {id: 'demo-pub-tipo', jsonKey: 'tipo_veiculo_publicacao', label: 'Tipo Veículo', required: true},
            {id: 'demo-pub-nome', jsonKey: 'nome_veiculo', label: 'Nome Veículo', required: false},
            {id: 'demo-pub-data', jsonKey: 'data_publicacao', label: 'Data Publicação', required: true},
            {id: 'demo-pub-url', jsonKey: 'endereco_internet', label: 'Endereço Internet', required: false}
        ],
        'lista-demonstracoes-publicacoes',
        (data) => `<strong>Data: ${data.data_publicacao}</strong> (Tipo: ${data.tipo_veiculo_publicacao})<br><small>${data.endereco_internet || data.nome_veiculo || ''}</small>`
    );
}

// --- (AA) LÓGICA: PÁGINA 26. PUBLICAÇÕES PARECER/ATA ---
function addParecerPublicacao() {
    adicionarItemGenerico(
        [
            {id: 'pa-pub-tipo', jsonKey: 'tipo_veiculo_publicacao', label: 'Tipo Veículo', required: true},
            {id: 'pa-pub-nome', jsonKey: 'nome_veiculo', label: 'Nome Veículo', required: false},
            {id: 'pa-pub-data', jsonKey: 'data_publicacao', label: 'Data Publicação', required: true},
            {id: 'pa-pub-url', jsonKey: 'endereco_internet', label: 'Endereço Internet', required: false}
        ],
        'staging-parecer-publicacoes-list', // Adiciona na lista de staging
        (data) => `<strong>Data: ${data.data_publicacao}</strong> (Tipo: ${data.tipo_veiculo_publicacao})<br><small>${data.endereco_internet || data.nome_veiculo || ''}</small>`
    );
}
function salvarParecerAta() {
    const parecerAta = {
        "tipo_parecer_ata": parseInt(document.getElementById('pa-tipo').value),
        "houve_publicacao": (document.getElementById('pa-houve-pub').value === 'true'),
        "publicacoes": [],
        "conclusao_parecer": parseInt(document.getElementById('pa-conclusao').value)
    };
    
    if (isNaN(parecerAta.tipo_parecer_ata) || isNaN(parecerAta.conclusao_parecer)) {
        alert("Preencha os campos 'Tipo (Parecer ou Ata)' e 'Conclusão (Tipo)'.");
        return;
    }

    // Coletar publicações da lista de staging
    const publicacoesStaging = document.querySelectorAll('#staging-parecer-publicacoes-list .list-item');
    publicacoesStaging.forEach(item => {
        parecerAta.publicacoes.push(JSON.parse(item.dataset.json));
    });
    
    if (parecerAta.houve_publicacao && parecerAta.publicacoes.length === 0) {
        alert("Você indicou 'Sim' para 'Houve Publicação?', mas não adicionou nenhuma publicação.");
        return;
    }

    // Adicionar à lista principal da página
    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item';
    itemDiv.dataset.json = JSON.stringify(parecerAta); 
    itemDiv.innerHTML = `
        <span>
            <strong>Tipo: ${parecerAta.tipo_parecer_ata}</strong> (Conclusão: ${parecerAta.conclusao_parecer})
            <br>
            <small>${parecerAta.publicacoes.length} publicação(ões) adicionada(s)</small>
        </span>
        <button type="button" class="btn-remove" onclick="removerItem(this)">Remover</button>
    `;
    document.getElementById('lista-pub-parecer').appendChild(itemDiv);

    // Limpar formulário principal e staging
    document.getElementById('pa-tipo').value = "";
    document.getElementById('pa-houve-pub').value = "false";
    document.getElementById('pa-conclusao').value = "";
    document.getElementById('staging-parecer-publicacoes-list').innerHTML = "";
}

// --- (BB) LÓGICA: PÁGINA 27. PUBLICAÇÃO REL. ATIVIDADES ---
function addPubRelAtividades() {
    adicionarItemGenerico(
        [
            {id: 'pra-pub-tipo', jsonKey: 'tipo_veiculo_publicacao', label: 'Tipo Veículo', required: true},
            {id: 'pra-pub-nome', jsonKey: 'nome_veiculo', label: 'Nome Veículo', required: false},
            {id: 'pra-pub-data', jsonKey: 'data_publicacao', label: 'Data Publicação', required: true},
            {id: 'pra-pub-url', jsonKey: 'endereco_internet', label: 'Endereço Internet', required: false}
        ],
        'lista-pub-rel-atividades',
        (data) => `<strong>Data: ${data.data_publicacao}</strong> (Tipo: ${data.tipo_veiculo_publicacao})<br><small>${data.endereco_internet || data.nome_veiculo || ''}</small>`
    );
}

// --- (CC) LÓGICA: PÁGINA 28. PRESTAÇÃO DE CONTAS ---
// (Esta página não possui listas dinâmicas, apenas geração de JSON)

// --- (CC) LÓGICA: PÁGINA 29. PARECER CONCLUSIVO (NOVO!) ---
function addDeclaracaoParecer() {
    adicionarItemGenerico(
        [
            {id: 'pc-decl-tipo', jsonKey: 'tipo_declaracao', label: 'Tipo Declaração', required: true},
            {id: 'pc-decl-declaracao', jsonKey: 'declaracao', label: 'Declaração (Tipo)', required: true},
            {id: 'pc-decl-justificativa', jsonKey: 'justificativa', label: 'Justificativa', required: false}
        ],
        'lista-declaracoes-parecer',
        (data) => `<strong>Tipo: ${data.tipo_declaracao}</strong> (Declaração: ${data.declaracao})<br><small>Justificativa: ${data.justificativa || 'N/A'}</small>`
    );
}
// --- (EE) LÓGICA: PÁGINA 30. TRANSPARÊNCIA ---
function addSitioInternet() {
    adicionarStringGenerico(
        'trans-sitio-url',
        'lista-sitios-internet',
        (data) => `<strong>URL:</strong> ${data}`
    );
}
function addRequisitoArt78p1() {
    adicionarItemGenerico(
        [
            {id: 'req-781-num', jsonKey: 'requisito', label: 'Requisito', required: true},
            {id: 'req-781-atende', jsonKey: 'atende', label: 'Atende', required: true} // O valor será 'true' ou 'false' (string)
        ],
        'lista-requisitos-781',
        (data) => `Requisito: ${data.requisito} | Atende: ${data.atende === 'true' ? 'Sim' : 'Não'}`
    );
}
function addRequisitoArt8p3() {
    adicionarItemGenerico(
        [
            {id: 'req-83-num', jsonKey: 'requisito', label: 'Requisito', required: true},
            {id: 'req-83-atende', jsonKey: 'atende', label: 'Atende', required: true}
        ],
        'lista-requisitos-83',
        (data) => `Requisito: ${data.requisito} | Atende: ${data.atende === 'true' ? 'Sim' : 'Não'}`
    );
}
function addRequisitoDivulgacao() {
    adicionarItemGenerico(
        [
            {id: 'req-div-num', jsonKey: 'requisito', label: 'Requisito', required: true},
            {id: 'req-div-atende', jsonKey: 'atende', label: 'Atende', required: true}
        ],
        'lista-requisitos-divulgacao',
        (data) => `Requisito: ${data.requisito} | Atende: ${data.atende === 'true' ? 'Sim' : 'Não'}`
    );
}


// --- (FF) FUNÇÕES DE GERAÇÃO DE JSON ---

// FF1: Gerador da Página 1. "Geral"
function gerarJsonGeral() {
    const dados = {
        "descritor": {
            tipo_documento: document.getElementById('tipo_documento').value,
            municipio: parseInt(document.getElementById('municipio').value),
            entidade: parseInt(document.getElementById('entidade').value),
            ano: parseInt(document.getElementById('ano').value),
            mes: parseInt(document.getElementById('mes').value)
        },
        "codigo_ajuste": document.getElementById('codigo_ajuste').value
    };
    const jsonString = JSON.stringify(dados, null, 2);
    downloadJson(jsonString, `descritor_e_ajuste.json`);
}

// FF2: Gerador da Página 2. "Relação de Empregados"
function gerarJsonEmpregados() {
    const dados = { "relacao_empregados": [] };
    document.querySelectorAll('#lista-empregados .list-item').forEach(item => {
        dados.relacao_empregados.push(JSON.parse(item.dataset.json));
    });
    if (dados.relacao_empregados.length === 0) {
        alert("Nenhum empregado foi salvo na lista.");
        return;
    }
    const jsonString = JSON.stringify(dados, null, 2);
    downloadJson(jsonString, `relacao_empregados.json`);
}

// FF3: Gerador da Página 3. "Relação de Bens"
function gerarJsonBens() {
    const dados = { "relacao_bens": {
        "relacao_bens_moveis_adquiridos": [], "relacao_bens_moveis_cedidos": [],
        "relacao_bens_moveis_baixados_devolvidos": [], "relacao_bens_imoveis_adquiridos": [],
        "relacao_bens_imoveis_cedidos": [], "relacao_bens_imoveis_baixados_devolvidos": []
    }};
    let totalItens = 0;
    function coletarLista(listaId, chaveJson) {
        document.querySelectorAll(`#${listaId} .list-item`).forEach(item => {
            dados.relacao_bens[chaveJson].push(JSON.parse(item.dataset.json));
            totalItens++;
        });
    }
    coletarLista('lista-bens-moveis-adquiridos', 'relacao_bens_moveis_adquiridos');
    coletarLista('lista-bens-moveis-cedidos', 'relacao_bens_moveis_cedidos');
    coletarLista('lista-bens-moveis-baixados', 'relacao_bens_moveis_baixados_devolvidos');
    coletarLista('lista-bens-imoveis-adquiridos', 'relacao_bens_imoveis_adquiridos');
    coletarLista('lista-bens-imoveis-cedidos', 'relacao_bens_imoveis_cedidos');
    coletarLista('lista-bens-imoveis-baixados', 'relacao_bens_imoveis_baixados_devolvidos');
    if (totalItens === 0) {
        alert("Nenhum bem foi adicionado em nenhuma das listas.");
        return;
    }
    const jsonString = JSON.stringify(dados, null, 2);
    downloadJson(jsonString, `relacao_bens.json`);
}

// FF4: Gerador da Página 4. "Contratos"
function gerarJsonContratos() {
    const dados = { "contratos": [] };
    document.querySelectorAll('#lista-contratos .list-item').forEach(item => {
        dados.contratos.push(JSON.parse(item.dataset.json));
    });
    if (dados.contratos.length === 0) {
        alert("Nenhum contrato foi salvo na lista.");
        return;
    }
    const jsonString = JSON.stringify(dados, null, 2);
    downloadJson(jsonString, `contratos.json`);
}

// FF5: Gerador da Página 5. "Documentos Fiscais"
function gerarJsonDocFiscais() {
    const dados = { "documentos_fiscais": [] };
    document.querySelectorAll('#lista-docfiscais .list-item').forEach(item => {
        dados.documentos_fiscais.push(JSON.parse(item.dataset.json));
    });
    if (dados.documentos_fiscais.length === 0) {
        alert("Nenhum documento fiscal foi salvo na lista.");
        return;
    }
    const jsonString = JSON.stringify(dados, null, 2);
    downloadJson(jsonString, `documentos_fiscais.json`);
}

// FF6: Gerador da Página 6. "Pagamentos"
function gerarJsonPagamentos() {
    const dados = { "pagamentos": [] };
    document.querySelectorAll('#lista-pagamentos .list-item').forEach(item => {
        dados.pagamentos.push(JSON.parse(item.dataset.json));
    });
    if (dados.pagamentos.length === 0) {
        alert("Nenhum pagamento foi salvo na lista.");
        return;
    }
    const jsonString = JSON.stringify(dados, null, 2);
    downloadJson(jsonString, `pagamentos.json`);
}

// FF7: Gerador da Página 7. "Disponibilidades"
function gerarJsonDisponibilidades() {
    const dados = {
        "disponibilidades": {
            "saldos": [],
            "saldo_fundo_fixo": parseFloat(document.getElementById('disp-fundo-fixo').value) || 0
        }
    };
    
    document.querySelectorAll('#lista-saldos .list-item').forEach(item => {
        dados.disponibilidades.saldos.push(JSON.parse(item.dataset.json));
    });
    
    if (dados.disponibilidades.saldos.length === 0 && dados.disponibilidades.saldo_fundo_fixo === 0) {
         alert("Nenhum saldo foi adicionado e o fundo fixo é zero. Pelo menos um deve ser preenchido.");
         return;
    }

    const jsonString = JSON.stringify(dados, null, 2);
    downloadJson(jsonString, `disponibilidades.json`);
}

// FF8: Gerador da Página 8. "Receitas"
function gerarJsonReceitas() {
    const dados = {
        "receitas": {
            "receitas_aplic_financ_repasses_publicos_municipais": parseFloat(document.getElementById('rec-aplic-municipais').value) || 0,
            "receitas_aplic_financ_repasses_publicos_estaduais": parseFloat(document.getElementById('rec-aplic-estaduais').value) || 0,
            "receitas_aplic_financ_repasses_publicos_federais": parseFloat(document.getElementById('rec-aplic-federais').value) || 0,
            "repasses_recebidos": [],
            "outras_receitas": [],
            "recursos_proprios": []
        }
    };
    document.querySelectorAll('#lista-repasses-recebidos .list-item').forEach(item => {
        dados.receitas.repasses_recebidos.push(JSON.parse(item.dataset.json));
    });
    document.querySelectorAll('#lista-outras-receitas .list-item').forEach(item => {
        dados.receitas.outras_receitas.push(JSON.parse(item.dataset.json));
    });
    document.querySelectorAll('#lista-recursos-proprios .list-item').forEach(item => {
        dados.receitas.recursos_proprios.push(JSON.parse(item.dataset.json));
    });
    const jsonString = JSON.stringify(dados, null, 2);
    downloadJson(jsonString, `receitas.json`);
}

// FF9: Gerador da Página 9. "Ajustes de Saldo"
function gerarJsonAjustesSaldo() {
    const dados = {
        "ajustes_saldo": {
            "retificacao_repasses": [],
            "inclusao_repasses": [],
            "retificacao_pagamentos": [],
            "inclusao_pagamentos": []
        }
    };
    let totalItens = 0;
    document.querySelectorAll('#lista-retificacao-repasses .list-item').forEach(item => {
        dados.ajustes_saldo.retificacao_repasses.push(JSON.parse(item.dataset.json));
        totalItens++;
    });
    document.querySelectorAll('#lista-inclusao-repasses .list-item').forEach(item => {
        dados.ajustes_saldo.inclusao_repasses.push(JSON.parse(item.dataset.json));
        totalItens++;
    });
    document.querySelectorAll('#lista-retificacao-pagamentos .list-item').forEach(item => {
        dados.ajustes_saldo.retificacao_pagamentos.push(JSON.parse(item.dataset.json));
        totalItens++;
    });
    document.querySelectorAll('#lista-inclusao-pagamentos .list-item').forEach(item => {
        dados.ajustes_saldo.inclusao_pagamentos.push(JSON.parse(item.dataset.json));
        totalItens++;
    });
    if (totalItens === 0) {
        alert("Nenhum ajuste foi adicionado em nenhuma das listas.");
        return;
    }
    const jsonString = JSON.stringify(dados, null, 2);
    downloadJson(jsonString, `ajustes_saldo.json`);
}

// FF10: Gerador da Página 10. "Servidores Cedidos"
function gerarJsonServidoresCedidos() {
    const dados = { "servidores_cedidos": [] };
    document.querySelectorAll('#lista-servidores-cedidos .list-item').forEach(item => {
        dados.servidores_cedidos.push(JSON.parse(item.dataset.json));
    });
    if (dados.servidores_cedidos.length === 0) {
        alert("Nenhum servidor cedido foi salvo na lista.");
        return;
    }
    const jsonString = JSON.stringify(dados, null, 2);
    downloadJson(jsonString, `servidores_cedidos.json`);
}

// FF11: Gerador da Página 11. "Descontos"
function gerarJsonDescontos() {
    const dados = { "descontos": [] };
    document.querySelectorAll('#lista-descontos .list-item').forEach(item => {
        dados.descontos.push(JSON.parse(item.dataset.json));
    });
    if (dados.descontos.length === 0) {
        alert("Nenhum desconto foi salvo na lista.");
        return;
    }
    const jsonString = JSON.stringify(dados, null, 2);
    downloadJson(jsonString, `descontos.json`);
}

// FF12: Gerador da Página 12. "Devoluções"
function gerarJsonDevolucoes() {
    const dados = { "devolucoes": [] };
    document.querySelectorAll('#lista-devolucoes .list-item').forEach(item => {
        dados.devolucoes.push(JSON.parse(item.dataset.json));
    });
    if (dados.devolucoes.length === 0) {
        alert("Nenhuma devolução foi salva na lista.");
        return;
    }
    const jsonString = JSON.stringify(dados, null, 2);
    downloadJson(jsonString, `devolucoes.json`);
}

// FF13: Gerador da Página 13. "Glosas"
function gerarJsonGlosas() {
    const dados = { "glosas": [] };
    document.querySelectorAll('#lista-glosas .list-item').forEach(item => {
        dados.glosas.push(JSON.parse(item.dataset.json));
    });
    if (dados.glosas.length === 0) {
        alert("Nenhuma glosa foi salva na lista.");
        return;
    }
    const jsonString = JSON.stringify(dados, null, 2);
    downloadJson(jsonString, `glosas.json`);
}

// FF14: Gerador da Página 14. "Empenhos"
function gerarJsonEmpenhos() {
    const dados = { "empenhos": [] };
    document.querySelectorAll('#lista-empenhos .list-item').forEach(item => {
        dados.empenhos.push(JSON.parse(item.dataset.json));
    });
    if (dados.empenhos.length === 0) {
        alert("Nenhum empenho foi salvo na lista.");
        return;
    }
    const jsonString = JSON.stringify(dados, null, 2);
    downloadJson(jsonString, `empenhos.json`);
}

// FF15: Gerador da Página 15. "Repasses"
function gerarJsonRepasses() {
    const dados = { "repasses": [] };
    document.querySelectorAll('#lista-repasses .list-item').forEach(item => {
        dados.repasses.push(JSON.parse(item.dataset.json));
    });
    if (dados.repasses.length === 0) {
        alert("Nenhum repasse foi salvo na lista.");
        return;
    }
    const jsonString = JSON.stringify(dados, null, 2);
    downloadJson(jsonString, `repasses.json`);
}

// FF16: Gerador da Página 16. "Relatório de Atividades"
function gerarJsonRelatorioAtividades() {
    const dados = {
        "relatorio_atividades": {
            "programas": []
        }
    };
    
    document.querySelectorAll('#lista-programas .list-item').forEach(item => {
        dados.relatorio_atividades.programas.push(JSON.parse(item.dataset.json));
    });
    
    if (dados.relatorio_atividades.programas.length === 0) {
         alert("Nenhum programa foi adicionado à lista.");
         return;
    }

    const jsonString = JSON.stringify(dados, null, 2);
    downloadJson(jsonString, `relatorio_atividades.json`);
}

// FF17: Gerador da Página 17. "Dados Gerais Entidade"
function gerarJsonDadosGeraisEntidade() {
    const dados = {
        "dados_gerais_entidade_beneficiaria": {
            "identificacao_certidao_dados_gerais": document.getElementById('certidao-dados-gerais').value,
            "identificacao_certidao_corpo_diretivo": document.getElementById('certidao-corpo-diretivo').value,
            "identificacao_certidao_membros_conselho": document.getElementById('certidao-membros-conselho').value,
            "identificacao_certidao_responsaveis": document.getElementById('certidao-responsaveis-entidade').value
        }
    };
    
    if (!dados.dados_gerais_entidade_beneficiaria.identificacao_certidao_dados_gerais) {
        alert("Preencha pelo menos a 'ID Certidão de Dados Gerais'.");
        return;
    }
    
    const jsonString = JSON.stringify(dados, null, 2);
    downloadJson(jsonString, `dados_gerais_entidade.json`);
}

// FF18: Gerador da Página 18. "Responsáveis e Membros"
function gerarJsonResponsaveisOrgao() {
    const dados = {
        "responsaveis_membros_orgao_concessor": {
            "identificacao_certidao_responsaveis": document.getElementById('certidao-responsaveis-concessor').value,
            "identificacao_certidao_membros_comissao_avaliacao": document.getElementById('certidao-membros-comissao').value,
            "identificacao_certidao_membros_controle_interno": document.getElementById('certidao-membros-controle').value
        }
    };

    if (!dados.responsaveis_membros_orgao_concessor.identificacao_certidao_responsaveis) {
        alert("Preencha pelo menos a 'ID Certidão dos Responsáveis (Concessor)'.");
        return;
    }
    
    const jsonString = JSON.stringify(dados, null, 2);
    downloadJson(jsonString, `responsaveis_membros_orgao.json`);
}

// FF19: Gerador da Página 19. "Publicação Regulamento"
function gerarJsonPubRegulamento() {
    const dados = {
        "publicacao_regulamento_compras": {
            "houve_publicacao_inicial": (document.getElementById('pub-inicial-houve').value === 'true'),
            "publicacoes_regulamento_inicial": [],
            "houve_alteracao_do_regulamento": (document.getElementById('pub-alteracao-houve').value === 'true'),
            "houve_publicacao_regulamento_alterado": (document.getElementById('pub-alteracao-publicada').value === 'true'),
            "publicacoes_alteracao_regulamento": []
        }
    };
    
    document.querySelectorAll('#lista-pub-inicial .list-item').forEach(item => {
        dados.publicacao_regulamento_compras.publicacoes_regulamento_inicial.push(JSON.parse(item.dataset.json));
    });
    
    document.querySelectorAll('#lista-pub-alteracao .list-item').forEach(item => {
        dados.publicacao_regulamento_compras.publicacoes_alteracao_regulamento.push(JSON.parse(item.dataset.json));
    });
    
    if (dados.publicacao_regulamento_compras.houve_publicacao_inicial && dados.publicacao_regulamento_compras.publicacoes_regulamento_inicial.length === 0) {
        alert("Você indicou que 'Houve Publicação Inicial', mas não adicionou nenhuma publicação.");
        return;
    }
    
    if (dados.publicacao_regulamento_compras.houve_publicacao_regulamento_alterado && dados.publicacao_regulamento_compras.publicacoes_alteracao_regulamento.length === 0) {
        alert("Você indicou que 'Houve Publicação da Alteração', mas não adicionou nenhuma publicação.");
        return;
    }

    const jsonString = JSON.stringify(dados, null, 2);
    downloadJson(jsonString, `publicacao_regulamento.json`);
}

// FF20: Gerador da Página 20. "Publicação Extrato"
function gerarJsonPubExtrato() {
    const dados = {
        "publicacao_extrato_execucao_fisica_financeira": {
            "ha_extrato_execucao_fisica_financeira": (document.getElementById('extrato-ha').value === 'true'),
            "extrato_elaborado_conforme_modelo": (document.getElementById('extrato-conforme').value === 'true'),
            "publicacoes": []
        }
    };
    
    document.querySelectorAll('#lista-pub-extrato .list-item').forEach(item => {
        dados.publicacao_extrato_execucao_fisica_financeira.publicacoes.push(JSON.parse(item.dataset.json));
    });
    
    if (dados.publicacao_extrato_execucao_fisica_financeira.ha_extrato_execucao_fisica_financeira && dados.publicacao_extrato_execucao_fisica_financeira.publicacoes.length === 0) {
        alert("Você indicou que 'Há Extrato', mas não adicionou nenhuma publicação.");
        return;
    }

    const jsonString = JSON.stringify(dados, null, 2);
    downloadJson(jsonString, `publicacao_extrato.json`);
}

// FF21: Gerador da Página 21. "Declarações"
function gerarJsonDeclaracoes() {
    const dados = {
        "declaracoes": {
            "houve_contratacao_empresas_pertencentes": (document.getElementById('decl-houve-contratacao').value === 'true'),
            "empresas_pertencentes": [],
            "houve_participacao_quadro_diretivo_administrativo": (document.getElementById('decl-houve-participacao').value === 'true'),
            "participacoes_quadro_diretivo_administrativo": []
        }
    };

    document.querySelectorAll('#lista-empresas-pertencentes .list-item').forEach(item => {
        dados.declaracoes.empresas_pertencentes.push(JSON.parse(item.dataset.json));
    });
    
    document.querySelectorAll('#lista-participacoes-diretivo .list-item').forEach(item => {
        dados.declaracoes.participacoes_quadro_diretivo_administrativo.push(JSON.parse(item.dataset.json));
    });
    
    if (dados.declaracoes.houve_contratacao_empresas_pertencentes && dados.declaracoes.empresas_pertencentes.length === 0) {
        alert("Você indicou 'Sim' para 'Contratação de Empresas', mas não adicionou nenhuma empresa.");
        return;
    }
    
    if (dados.declaracoes.houve_participacao_quadro_diretivo_administrativo && dados.declaracoes.participacoes_quadro_diretivo_administrativo.length === 0) {
        alert("Você indicou 'Sim' para 'Participação no Quadro Diretivo', mas não adicionou nenhuma participação.");
        return;
    }

    const jsonString = JSON.stringify(dados, null, 2);
    downloadJson(jsonString, `declaracoes.json`);
}

// FF22: Gerador da Página 22. "Rel. Comissão Avaliação"
function gerarJsonRelComissao() {
    const dados = {
        "relatorio_comissao_avaliacao": {
            "houve_emissao_relatorio_final": (document.getElementById('comissao-houve-emissao').value === 'true'),
            "conclusao_relatorio": parseInt(document.getElementById('comissao-conclusao').value)
        }
    };

    const justificativa = document.getElementById('comissao-justificativa').value;
    if (justificativa) {
        dados.relatorio_comissao_avaliacao.justificativa = justificativa;
    }
    
    if (isNaN(dados.relatorio_comissao_avaliacao.conclusao_relatorio)) {
        if (document.getElementById('comissao-conclusao').value === "") {
             alert("Preencha o campo 'Conclusão do Relatório'.");
             return;
        }
    }

    const jsonString = JSON.stringify(dados, null, 2);
    downloadJson(jsonString, `relatorio_comissao_avaliacao.json`);
}

// FF23: Gerador da Página 23. "Rel. Governamental"
function gerarJsonRelGovernamental() {
    const dados = {
        "relatorio_governamental_analise_execucao": {
            "houve_emissao_relatorio_final": (document.getElementById('gov-houve-emissao').value === 'true'),
            "conclusao_relatorio": parseInt(document.getElementById('gov-conclusao').value)
        }
    };

    const justificativa = document.getElementById('gov-justificativa').value;
    if (justificativa) {
        dados.relatorio_governamental_analise_execucao.justificativa = justificativa;
    }
    
    if (isNaN(dados.relatorio_governamental_analise_execucao.conclusao_relatorio)) {
        if (document.getElementById('gov-conclusao').value === "") {
             alert("Preencha o campo 'Conclusão do Relatório'.");
             return;
        }
    }

    const jsonString = JSON.stringify(dados, null, 2);
    downloadJson(jsonString, `relatorio_governamental.json`);
}

// FF24: Gerador da Página 24. "Rel. Monitoramento"
function gerarJsonRelMonitoramento() {
    const dados = {
        "relatorio_monitoramento_avaliacao": {
            "houve_emissao_relatorio_final": (document.getElementById('monit-houve-emissao').value === 'true'),
            "conclusao_relatorio": parseInt(document.getElementById('monit-conclusao').value)
        }
    };

    const justificativa = document.getElementById('monit-justificativa').value;
    if (justificativa) {
        dados.relatorio_monitoramento_avaliacao.justificativa = justificativa;
    }
    
    if (isNaN(dados.relatorio_monitoramento_avaliacao.conclusao_relatorio)) {
        if (document.getElementById('monit-conclusao').value === "") {
             alert("Preencha o campo 'Conclusão do Relatório'.");
             return;
        }
    }

    const jsonString = JSON.stringify(dados, null, 2);
    downloadJson(jsonString, `relatorio_monitoramento.json`);
}

// FF25: Gerador da Página 25. "Demonstrações Contábeis"
function gerarJsonDemonstracoesContabeis() {
    const dados = {
        "demonstracoes_contabeis": {
            "publicacoes": [],
            "responsavel": {
                "numero_crc": document.getElementById('demo-crc').value,
                "cpf": document.getElementById('demo-cpf').value,
                "situacao_regular_crc": (document.getElementById('demo-crc-regular').value === 'true')
            }
        }
    };
    
    document.querySelectorAll('#lista-demonstracoes-publicacoes .list-item').forEach(item => {
        dados.demonstracoes_contabeis.publicacoes.push(JSON.parse(item.dataset.json));
    });
    
    if (!dados.demonstracoes_contabeis.responsavel.numero_crc || !dados.demonstracoes_contabeis.responsavel.cpf) {
        alert("Preencha os dados do Responsável (CRC e CPF).");
        return;
    }
    
    if (dados.demonstracoes_contabeis.publicacoes.length === 0) {
         alert("Adicione pelo menos uma Publicação.");
         return;
    }

    const jsonString = JSON.stringify(dados, null, 2);
    downloadJson(jsonString, `demonstracoes_contabeis.json`);
}

// FF26: Gerador da Página 26. "Publicações Parecer/Ata"
function gerarJsonPubParecer() {
    const dados = { "publicacoes_parecer_ata": [] };
    
    document.querySelectorAll('#lista-pub-parecer .list-item').forEach(item => {
        dados.publicacoes_parecer_ata.push(JSON.parse(item.dataset.json));
    });
    
    if (dados.publicacoes_parecer_ata.length === 0) {
         alert("Nenhum parecer/ata foi adicionado à lista.");
         return;
    }

    const jsonString = JSON.stringify(dados, null, 2);
    downloadJson(jsonString, `publicacoes_parecer_ata.json`);
}

// FF27: Gerador da Página 27. "Publicação Rel. Atividades"
function gerarJsonPubRelAtividades() {
    const dados = {
        "publicacao_relatorio_atividades": {
            "houve_publicacao_exercicio": (document.getElementById('pra-houve').value === 'true'),
            "publicacoes": []
        }
    };
    
    document.querySelectorAll('#lista-pub-rel-atividades .list-item').forEach(item => {
        dados.publicacao_relatorio_atividades.publicacoes.push(JSON.parse(item.dataset.json));
    });
    
    if (dados.publicacao_relatorio_atividades.houve_publicacao_exercicio && dados.publicacao_relatorio_atividades.publicacoes.length === 0) {
        alert("Você indicou que 'Houve Publicação', mas não adicionou nenhuma publicação.");
        return;
    }

    const jsonString = JSON.stringify(dados, null, 2);
    downloadJson(jsonString, `publicacao_relatorio_atividades.json`);
}

// FF28: Gerador da Página 28. "Prestação de Contas da Entidade"
function gerarJsonPrestacaoContas() {
    const dados = {
        "prestacao_contas_entidade_beneficiaria": {
            "data_prestacao": document.getElementById('pc-data-prestacao').value,
            "periodo_referencia_data_inicial": document.getElementById('pc-data-ref-inicio').value,
            "periodo_referencia_data_final": document.getElementById('pc-data-ref-final').value
        }
    };
    
    if (!dados.prestacao_contas_entidade_beneficiaria.data_prestacao) {
        alert("Preencha a 'Data da Prestação de Contas'.");
        return;
    }

    const jsonString = JSON.stringify(dados, null, 2);
    downloadJson(jsonString, `prestacao_contas_entidade.json`);
}

// DD29: Gerador da Página 29. "Parecer Conclusivo" (NOVO!)
function gerarJsonParecerConclusivo() {
    const dados = {
        "parecer_conclusivo": {
            "identificacao_parecer": document.getElementById('pc-identificacao').value,
            "conclusao_parecer": parseInt(document.getElementById('pc-conclusao').value),
            "consideracoes_parecer": document.getElementById('pc-consideracoes').value || undefined,
            "declaracoes": []
        }
    };

    // Coleta as declarações
    document.querySelectorAll('#lista-declaracoes-parecer .list-item').forEach(item => {
        dados.parecer_conclusivo.declaracoes.push(JSON.parse(item.dataset.json));
    });

    if (!dados.parecer_conclusivo.identificacao_parecer || isNaN(dados.parecer_conclusivo.conclusao_parecer)) {
        alert("Preencha os campos 'Identificação do Parecer' e 'Conclusão do Parecer'.");
        return;
    }
    
    if (dados.parecer_conclusivo.declaracoes.length === 0) {
        alert("Adicione pelo menos uma Declaração ao parecer.");
        return;
    }

    const jsonString = JSON.stringify(dados, null, 2);
    downloadJson(jsonString, `parecer_conclusivo.json`);
}

// FF30: Gerador da Página 30. "Transparência"
function gerarJsonTransparencia() {
    const dados = {
        "transparencia": {
            "entidade_beneficiaria_mantem_sitio_internet": (document.getElementById('trans-mantem-sitio').value === 'true'),
            "sitios_internet": [],
            "requisitos_artigos_7o_8o_paragrafo_1o": [],
            "requisitos_sitio_artigo_8o_paragrafo_3o": [],
            "requisitos_divulgacao_informacoes": []
        }
    };

    // Coleta a lista simples de strings (URLs)
    document.querySelectorAll('#lista-sitios-internet .list-item').forEach(item => {
        dados.transparencia.sitios_internet.push(item.dataset.json); // Pega a string pura
    });

    // Coleta a lista de requisitos 7/8 p1
    document.querySelectorAll('#lista-requisitos-781 .list-item').forEach(item => {
        const req = JSON.parse(item.dataset.json);
        req.atende = (req.atende === 'true'); // Converte string para booleano
        dados.transparencia.requisitos_artigos_7o_8o_paragrafo_1o.push(req);
    });
    
    // Coleta a lista de requisitos 8 p3
    document.querySelectorAll('#lista-requisitos-83 .list-item').forEach(item => {
        const req = JSON.parse(item.dataset.json);
        req.atende = (req.atende === 'true'); // Converte string para booleano
        dados.transparencia.requisitos_sitio_artigo_8o_paragrafo_3o.push(req);
    });
    
    // Coleta a lista de requisitos divulgação
    document.querySelectorAll('#lista-requisitos-divulgacao .list-item').forEach(item => {
        const req = JSON.parse(item.dataset.json);
        req.atende = (req.atende === 'true'); // Converte string para booleano
        dados.transparencia.requisitos_divulgacao_informacoes.push(req);
    });

    if (dados.transparencia.entidade_beneficiaria_mantem_sitio_internet && dados.transparencia.sitios_internet.length === 0) {
        alert("Você indicou 'Sim' para 'Mantém Sítio', mas não adicionou nenhuma URL.");
        return;
    }
    
    if (dados.transparencia.requisitos_artigos_7o_8o_paragrafo_1o.length === 0) {
        alert("Adicione pelo menos um 'Requisito Art. 7º/8º, § 1º'.");
        return;
    }
    
    // (Validações para as outras listas de requisitos podem ser adicionadas aqui se forem obrigatórias)

    const jsonString = JSON.stringify(dados, null, 2);
    downloadJson(jsonString, `transparencia.json`);
}


// --- (GG) FUNÇÃO AUXILIAR DE DOWNLOAD ---
function downloadJson(conteudo, nomeDoArquivo) {
    const blob = new Blob([conteudo], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nomeDoArquivo;
    a.click();
    URL.revokeObjectURL(a.href);
}

// Inicia a primeira página como ativa
document.addEventListener("DOMContentLoaded", function() {
    document.querySelector("#nav-geral").click();
});
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
        // Pegamos todos os campos que possuem ID
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(el => {
            if (el.id) {
                // Checkbox e Radio usam 'checked', outros usam 'value'
                if (el.type === 'checkbox' || el.type === 'radio') {
                    estado.inputs[el.id] = el.checked;
                } else {
                    estado.inputs[el.id] = el.value;
                }
            }
        });

        // 2. Salvar o HTML das Listas (Listas finais e Listas de Staging)
        // Isso preserva os itens adicionados e os dados JSON atrelados (data-json)
        const listas = document.querySelectorAll('.list-container, .staging-list-container');
        listas.forEach(el => {
            if (el.id) {
                estado.listas[el.id] = el.innerHTML;
            }
        });

        // 3. Salva no LocalStorage do navegador
        localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
        
        // Feedback visual simples
        const btn = document.querySelector('.btn-save-draft');
        const textoOriginal = btn.innerText;
        btn.innerText = "Salvo! ✓";
        setTimeout(() => { btn.innerText = textoOriginal; }, 2000);
        
    } catch (erro) {
        console.error("Erro ao salvar rascunho:", erro);
        alert("Não foi possível salvar. O armazenamento local pode estar cheio ou desabilitado.");
    }
}

/**
 * Recupera os dados salvos e preenche a página.
 */
function recuperarDadosParciais() {
    const dadosJson = localStorage.getItem(STORAGE_KEY);
    
    if (!dadosJson) {
        alert("Nenhum rascunho salvo encontrado.");
        return;
    }

    if (!confirm("Isso substituirá os dados atuais pelos dados salvos anteriormente. Deseja continuar?")) {
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
        // Como suas funções de remover usam onclick="removerItem(this)" inline,
        // restaurar o innerHTML funciona perfeitamente.
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
 * Limpa o rascunho salvo da memória.
 */
function limparRascunho() {
    if(confirm("Tem certeza? Isso apagará o rascunho salvo na memória do navegador.")) {
        localStorage.removeItem(STORAGE_KEY);
        alert("Memória limpa.");
    }
}

/**
 * Função placeholder para o botão Mestre, caso ainda não tenha sido criada.
 * Se você já criou uma função gerarJsonCompleto() personalizada, pode remover esta.
 */
if (typeof gerarJsonCompleto === 'undefined') {
    window.gerarJsonCompleto = function() {
        alert("Funcionalidade de Gerar JSON Completo ainda precisa ser implementada unificando as funções parciais.");
    };
}

// Opcional: Auto-save a cada 60 segundos
setInterval(() => {
    // Salva silenciosamente sem feedback visual para não interromper
    try {
        const estado = { inputs: {}, listas: {} };
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(el => {
            if (el.id) {
                if (el.type === 'checkbox' || el.type === 'radio') estado.inputs[el.id] = el.checked;
                else estado.inputs[el.id] = el.value;
            }
        });
        const listas = document.querySelectorAll('.list-container, .staging-list-container');
        listas.forEach(el => { if (el.id) estado.listas[el.id] = el.innerHTML; });
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
        console.log("Auto-save realizado.");
    } catch(e) { console.warn("Falha no auto-save", e); }
}, 60000);
