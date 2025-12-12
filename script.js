/**
 * ARQUIVO: script.js (Completo e Consolidado)
 * Funcionalidades: Navegação, CRUD de Listas, Geração de JSONs Individuais/Completo e Salvar Rascunho.
 */

// ============================================================================
// --- (A) NAVEGAÇÃO E INTERFACE ---
// ============================================================================

function openPage(event, pageId) {
    if(event) event.preventDefault();

    // 1. Remove classe 'active' de todas as páginas
    const pages = document.querySelectorAll('.content-page');
    pages.forEach(page => page.classList.remove('active'));

    // 2. Remove classe 'active' do menu lateral
    const links = document.querySelectorAll('.sidebar-menu a');
    links.forEach(link => link.classList.remove('active'));

    // 3. Ativa a página alvo
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    } else {
        console.warn(`Página "${pageId}" não encontrada.`);
    }

    // 4. Ativa o link clicado
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    } else {
        // Fallback: se a função for chamada sem evento de clique (ex: load inicial), tenta achar o link pelo href
        const link = document.querySelector(`.sidebar-menu a[onclick*="${pageId}"]`);
        if(link) link.classList.add('active');
    }
}

// Inicialização ao carregar a página
document.addEventListener("DOMContentLoaded", function() {
    // Tenta abrir a primeira página (Geral)
    openPage(null, 'page-geral');
});

// ============================================================================
// --- (B) FUNÇÕES AUXILIARES GENÉRICAS ---
// ============================================================================

function removerItem(buttonElement) {
    buttonElement.parentElement.remove();
}

/**
 * Helper para adicionar itens (objetos) a uma lista visual.
 */
function adicionarItemGenerico(fields, containerId, itemText) {
    const itemData = {};
    for (const field of fields) {
        const input = document.getElementById(field.id);
        if(!input) continue;

        let value = (input.type === 'number') ? parseFloat(input.value) : input.value;
        
        // Trata NaN
        if (input.type === 'number' && isNaN(value)) value = null;
        // Trata string vazia
        if (input.type !== 'number' && value === "") value = null;

        // Validação obrigatória
        if (field.required && (value === null)) {
             alert(`Preencha o campo obrigatório: ${field.label}`);
             return;
        }
        
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
    
    // Limpa campos
    for (const field of fields) {
        const input = document.getElementById(field.id);
        if(input) input.value = "";
    }
}

/**
 * Helper para adicionar itens (strings simples) a uma lista.
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
    itemDiv.dataset.json = value; // String pura
    itemDiv.innerHTML = `
        <span>${itemText(value)}</span>
        <button type="button" class="btn-remove" onclick="removerItem(this)">Remover</button>
    `;
    document.getElementById(containerId).appendChild(itemDiv);
    input.value = "";
}

function downloadJson(conteudo, nomeDoArquivo) {
    const blob = new Blob([conteudo], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nomeDoArquivo;
    a.click();
    URL.revokeObjectURL(a.href);
}

// ============================================================================
// --- (C) LÓGICA DAS PÁGINAS (ADICIONAR ITENS) ---
// ============================================================================

// --- PÁGINA 2: EMPREGADOS ---
function addPeriodoRemuneracao() {
    const mes = parseInt(document.getElementById('rem-mes').value);
    const carga = parseFloat(document.getElementById('rem-carga').value);
    const bruta = parseFloat(document.getElementById('rem-bruta').value);
    if (isNaN(mes) || isNaN(carga) || isNaN(bruta)) {
        alert("Preencha todos os campos do período.");
        return;
    }
    const periodo = { "mes": mes, "carga_horaria": carga, "remuneracao_bruta": bruta };
    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item-remuneracao';
    itemDiv.dataset.json = JSON.stringify(periodo);
    itemDiv.innerHTML = `<span>Mês: ${mes} | Carga: ${carga}h | R$ ${bruta.toFixed(2)}</span> <button type="button" class="btn-remove" onclick="removerItem(this)">x</button>`;
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
    if (!empregado.cpf || !empregado.data_admissao || isNaN(empregado.salario_contratual)) {
        alert("Preencha CPF, Admissão e Salário.");
        return;
    }
    const periodosStaging = document.querySelectorAll('#staging-periodos-list .list-item-remuneracao');
    periodosStaging.forEach(item => empregado.periodos_remuneracao.push(JSON.parse(item.dataset.json)));
    
    if (empregado.periodos_remuneracao.length === 0) {
        alert("Adicione ao menos um período de remuneração.");
        return;
    }

    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item';
    itemDiv.dataset.json = JSON.stringify(empregado); 
    itemDiv.innerHTML = `<span><strong>${empregado.cpf}</strong> (Adm: ${empregado.data_admissao}) - ${empregado.periodos_remuneracao.length} períodos</span> <button type="button" class="btn-remove" onclick="removerItem(this)">Remover</button>`;
    document.getElementById('lista-empregados').appendChild(itemDiv);
    
    // Limpar form
    document.getElementById('emp-cpf').value = "";
    document.getElementById('emp-data-admissao').value = "";
    document.getElementById('emp-data-demissao').value = "";
    document.getElementById('emp-cbo').value = "";
    document.getElementById('emp-cns').value = "";
    document.getElementById('emp-salario-contratual').value = "";
    document.getElementById('staging-periodos-list').innerHTML = ""; 
}

// --- PÁGINA 3: BENS ---
function addBemMovelAdquirido() {
    adicionarItemGenerico(
        [{id: 'bma-patrimonio', jsonKey: 'numero_patrimonio', label: 'Nº Patrimônio', required: true}, {id: 'bma-data', jsonKey: 'data_aquisicao', label: 'Data', required: true}, {id: 'bma-valor', jsonKey: 'valor_aquisicao', label: 'Valor', required: true}, {id: 'bma-descricao', jsonKey: 'descricao', label: 'Descrição', required: true}],
        'lista-bens-moveis-adquiridos', (d) => `Patr: ${d.numero_patrimonio} - ${d.descricao}`
    );
}
function addBemMovelCedido() {
    adicionarItemGenerico(
        [{id: 'bmc-patrimonio', jsonKey: 'numero_patrimonio', label: 'Nº Patrimônio', required: true}, {id: 'bmc-data', jsonKey: 'data_cessao', label: 'Data', required: true}, {id: 'bmc-valor', jsonKey: 'valor_cessao', label: 'Valor', required: true}, {id: 'bmc-descricao', jsonKey: 'descricao', label: 'Descrição', required: true}],
        'lista-bens-moveis-cedidos', (d) => `Patr: ${d.numero_patrimonio} - ${d.descricao}`
    );
}
function addBemMovelBaixado() {
    adicionarItemGenerico(
        [{id: 'bmb-patrimonio', jsonKey: 'numero_patrimonio', label: 'Nº Patrimônio', required: true}, {id: 'bmb-data', jsonKey: 'data_baixa_devolucao', label: 'Data', required: true}],
        'lista-bens-moveis-baixados', (d) => `Patr: ${d.numero_patrimonio} (Baixa: ${d.data_baixa_devolucao})`
    );
}
function addBemImovelAdquirido() {
    adicionarItemGenerico(
        [{id: 'bia-descricao', jsonKey: 'descricao', label: 'Descrição', required: true}, {id: 'bia-data', jsonKey: 'data_aquisicao', label: 'Data', required: true}],
        'lista-bens-imoveis-adquiridos', (d) => `${d.descricao} (${d.data_aquisicao})`
    );
}
function addBemImovelCedido() {
    adicionarItemGenerico(
        [{id: 'bic-descricao', jsonKey: 'descricao', label: 'Descrição', required: true}, {id: 'bic-data', jsonKey: 'data_cessao', label: 'Data', required: true}],
        'lista-bens-imoveis-cedidos', (d) => `${d.descricao} (${d.data_cessao})`
    );
}
function addBemImovelBaixado() {
    adicionarItemGenerico(
        [{id: 'bib-descricao', jsonKey: 'descricao', label: 'Descrição', required: true}, {id: 'bib-data', jsonKey: 'data_baixa_devolucao', label: 'Data', required: true}],
        'lista-bens-imoveis-baixados', (d) => `${d.descricao} (${d.data_baixa_devolucao})`
    );
}

// --- PÁGINA 4: CONTRATOS ---
function addContrato() {
    const naturezaStr = document.getElementById('contrato-natureza').value;
    const naturezaArray = naturezaStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    
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

    if (!contrato.numero || !contrato.credor.nome) {
        alert("Preencha Número e Credor.");
        return;
    }

    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item';
    itemDiv.dataset.json = JSON.stringify(contrato);
    itemDiv.innerHTML = `<span><strong>${contrato.numero}</strong> - ${contrato.credor.nome}</span> <button type="button" class="btn-remove" onclick="removerItem(this)">Remover</button>`;
    document.getElementById('lista-contratos').appendChild(itemDiv);
    
    // Limpar campos principais (simplificado)
    document.getElementById('contrato-numero').value = "";
    document.getElementById('contrato-credor-nome').value = "";
    document.getElementById('contrato-objeto').value = "";
}

// --- PÁGINA 5: DOCS FISCAIS ---
function addDocumentoFiscal() {
    const doc = {
        "numero": document.getElementById('doc-numero').value,
        "data_emissao": document.getElementById('doc-data-emissao').value,
        "descricao": document.getElementById('doc-descricao').value,
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
        "valor_bruto": parseFloat(document.getElementById('doc-valor-bruto').value),
        "valor_encargos": parseFloat(document.getElementById('doc-valor-encargos').value),
        "categoria_despesas_tipo": parseInt(document.getElementById('doc-categoria-despesa').value),
        "rateio_proveniente_tipo": parseInt(document.getElementById('doc-rateio-tipo').value),
        "rateio_percentual": parseFloat(document.getElementById('doc-rateio-percentual').value)
    };

    if (!doc.numero || isNaN(doc.valor_bruto)) { alert("Preencha Número e Valor Bruto"); return; }
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item';
    itemDiv.dataset.json = JSON.stringify(doc);
    itemDiv.innerHTML = `<span>Doc: ${doc.numero} (R$ ${doc.valor_bruto})</span> <button type="button" class="btn-remove" onclick="removerItem(this)">Remover</button>`;
    document.getElementById('lista-docfiscais').appendChild(itemDiv);
    document.getElementById('doc-numero').value = "";
    document.getElementById('doc-valor-bruto').value = "";
}

// --- PÁGINA 6: PAGAMENTOS ---
function addPagamento() {
    const pag = {
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
    if (!pag.identificacao_documento_fiscal.numero || isNaN(pag.pagamento_valor)) { alert("Dados incompletos."); return; }

    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item';
    itemDiv.dataset.json = JSON.stringify(pag);
    itemDiv.innerHTML = `<span>Ref. Doc: ${pag.identificacao_documento_fiscal.numero} - R$ ${pag.pagamento_valor}</span> <button type="button" class="btn-remove" onclick="removerItem(this)">Remover</button>`;
    document.getElementById('lista-pagamentos').appendChild(itemDiv);
    document.getElementById('pag-valor').value = "";
}

// --- PÁGINA 7: DISPONIBILIDADES ---
function addSaldo() {
     adicionarItemGenerico(
        [{id: 'saldo-banco', jsonKey: 'banco', label: 'Banco', required: true}, {id: 'saldo-agencia', jsonKey: 'agencia', label: 'Agência', required: true}, {id: 'saldo-conta', jsonKey: 'conta', label: 'Conta', required: true}, {id: 'saldo-conta-tipo', jsonKey: 'conta_tipo', label: 'Tipo', required: true}, {id: 'saldo-bancario', jsonKey: 'saldo_bancario', label: 'Saldo Bancário', required: true}, {id: 'saldo-contabil', jsonKey: 'saldo_contabil', label: 'Saldo Contábil', required: true}],
        'lista-saldos', (d) => `Conta: ${d.conta} - Saldo: R$ ${d.saldo_bancario}`
    );
}

// --- PÁGINA 8: RECEITAS ---
function addRepasseRecebido() {
    adicionarItemGenerico(
        [{id: 'rep-data-prevista', jsonKey: 'data_prevista', label: 'Data Prev.', required: true}, {id: 'rep-data-repasse', jsonKey: 'data_repasse', label: 'Data Repasse', required: true}, {id: 'rep-valor', jsonKey: 'valor', label: 'Valor', required: true}, {id: 'rep-fonte-recurso', jsonKey: 'fonte_recurso_tipo', label: 'Fonte', required: true}],
        'lista-repasses-recebidos', (d) => `Repasse: ${d.data_repasse} - R$ ${d.valor}`
    );
}
function addOutraReceita() {
    adicionarItemGenerico(
        [{id: 'outra-descricao', jsonKey: 'descricao', label: 'Descrição', required: true}, {id: 'outra-valor', jsonKey: 'valor', label: 'Valor', required: true}],
        'lista-outras-receitas', (d) => `${d.descricao} - R$ ${d.valor}`
    );
}
function addRecursoProprio() {
    adicionarItemGenerico(
        [{id: 'proprio-descricao', jsonKey: 'descricao', label: 'Descrição', required: true}, {id: 'proprio-valor', jsonKey: 'valor', label: 'Valor', required: true}],
        'lista-recursos-proprios', (d) => `${d.descricao} - R$ ${d.valor}`
    );
}

// --- PÁGINA 9: AJUSTES ---
function addRetificacaoRepasse() {
    adicionarItemGenerico(
        [{id: 'ajuste-rr-data-prevista', jsonKey: 'data_prevista', label: 'Data Prev', required: true}, {id: 'ajuste-rr-data-repasse', jsonKey: 'data_repasse', label: 'Data Repasse', required: true}, {id: 'ajuste-rr-valor-retificado', jsonKey: 'valor_retificado', label: 'Valor', required: true}],
        'lista-retificacao-repasses', (d) => `Retif. Repasse: ${d.data_repasse} (R$ ${d.valor_retificado})`
    );
}
function addInclusaoRepasse() {
    adicionarItemGenerico(
        [{id: 'ajuste-ir-data-prevista', jsonKey: 'data_prevista', label: 'Data Prev', required: true}, {id: 'ajuste-ir-data-repasse', jsonKey: 'data_repasse', label: 'Data Repasse', required: true}, {id: 'ajuste-ir-valor', jsonKey: 'valor', label: 'Valor', required: true}, {id: 'ajuste-ir-fonte', jsonKey: 'fonte_recurso_tipo', label: 'Fonte', required: true}],
        'lista-inclusao-repasses', (d) => `Incl. Repasse: ${d.data_repasse} (R$ ${d.valor})`
    );
}
function addRetificacaoPagamento() {
    const data = {
        identificacao_documento_fiscal: { numero: document.getElementById('ajuste-rp-doc-numero').value, identificacao_credor: { documento_tipo: parseInt(document.getElementById('ajuste-rp-credor-tipo').value), documento_numero: document.getElementById('ajuste-rp-credor-numero').value } },
        pagamento_data: document.getElementById('ajuste-rp-data').value,
        pagamento_valor: parseFloat(document.getElementById('ajuste-rp-valor').value),
        fonte_recurso_tipo: parseInt(document.getElementById('ajuste-rp-fonte').value),
        valor_retificado: parseFloat(document.getElementById('ajuste-rp-valor-retificado').value)
    };
    if(!data.identificacao_documento_fiscal.numero) return;
    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item';
    itemDiv.dataset.json = JSON.stringify(data);
    itemDiv.innerHTML = `<span>Retif. Pag (Doc ${data.identificacao_documento_fiscal.numero}): R$ ${data.valor_retificado}</span> <button type="button" class="btn-remove" onclick="removerItem(this)">Remover</button>`;
    document.getElementById('lista-retificacao-pagamentos').appendChild(itemDiv);
    document.getElementById('ajuste-rp-doc-numero').value = "";
}
function addInclusaoPagamento() {
    const data = {
        identificacao_documento_fiscal: { numero: document.getElementById('ajuste-ip-doc-numero').value, identificacao_credor: { documento_tipo: parseInt(document.getElementById('ajuste-ip-credor-tipo').value), documento_numero: document.getElementById('ajuste-ip-credor-numero').value } },
        pagamento_data: document.getElementById('ajuste-ip-data').value,
        pagamento_valor: parseFloat(document.getElementById('ajuste-ip-valor').value),
        fonte_recurso_tipo: parseInt(document.getElementById('ajuste-ip-fonte-recurso').value),
        meio_pagamento_tipo: parseInt(document.getElementById('ajuste-ip-meio-pagamento').value),
        banco: parseInt(document.getElementById('ajuste-ip-banco').value),
        agencia: parseInt(document.getElementById('ajuste-ip-agencia').value),
        conta_corrente: document.getElementById('ajuste-ip-conta').value,
        numero_transacao: document.getElementById('ajuste-ip-transacao').value
    };
    if(!data.identificacao_documento_fiscal.numero) return;
    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item';
    itemDiv.dataset.json = JSON.stringify(data);
    itemDiv.innerHTML = `<span>Incl. Pag (Doc ${data.identificacao_documento_fiscal.numero}): R$ ${data.pagamento_valor}</span> <button type="button" class="btn-remove" onclick="removerItem(this)">Remover</button>`;
    document.getElementById('lista-inclusao-pagamentos').appendChild(itemDiv);
    document.getElementById('ajuste-ip-doc-numero').value = "";
}

// --- PÁGINA 10: SERVIDORES ---
function addPeriodoCessao() {
    const mes = parseInt(document.getElementById('cessao-mes').value);
    const carga = parseFloat(document.getElementById('cessao-carga').value);
    const bruta = parseFloat(document.getElementById('cessao-bruta').value);
    if (isNaN(mes)) return;
    const periodo = { "mes": mes, "carga_horaria": carga, "remuneracao_bruta": bruta };
    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item-remuneracao';
    itemDiv.dataset.json = JSON.stringify(periodo);
    itemDiv.innerHTML = `<span>Mês ${mes}</span> <button type="button" class="btn-remove" onclick="removerItem(this)">x</button>`;
    document.getElementById('staging-periodos-cessao-list').appendChild(itemDiv);
    document.getElementById('cessao-mes').value = "";
}
function salvarServidorCedido() {
    const serv = {
        "cpf": document.getElementById('serv-cpf').value,
        "data_inicial_cessao": document.getElementById('serv-data-inicio').value,
        "data_final_cessao": document.getElementById('serv-data-final').value,
        "cargo_publico_ocupado": document.getElementById('serv-cargo').value,
        "funcao_desempenhada_entidade_beneficiaria": document.getElementById('serv-funcao').value,
        "onus_pagamento": parseInt(document.getElementById('serv-onus').value),
        "periodos_cessao": []
    };
    if (!serv.cpf) return alert("Preencha o CPF");
    document.querySelectorAll('#staging-periodos-cessao-list .list-item-remuneracao').forEach(item => serv.periodos_cessao.push(JSON.parse(item.dataset.json)));
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item';
    itemDiv.dataset.json = JSON.stringify(serv);
    itemDiv.innerHTML = `<span><strong>${serv.cpf}</strong> (${serv.periodos_cessao.length} períodos)</span> <button type="button" class="btn-remove" onclick="removerItem(this)">Remover</button>`;
    document.getElementById('lista-servidores-cedidos').appendChild(itemDiv);
    document.getElementById('serv-cpf').value = "";
    document.getElementById('staging-periodos-cessao-list').innerHTML = "";
}

// --- PÁGINA 11: DESCONTOS ---
function addDesconto() {
    adicionarItemGenerico(
        [{id: 'desc-data', jsonKey: 'data', label: 'Data', required: true}, {id: 'desc-descricao', jsonKey: 'descricao', label: 'Descrição', required: true}, {id: 'desc-valor', jsonKey: 'valor', label: 'Valor', required: true}],
        'lista-descontos', (d) => `${d.descricao} - R$ ${d.valor}`
    );
}

// --- PÁGINA 12: DEVOLUÇÕES ---
function addDevolucao() {
    adicionarItemGenerico(
        [{id: 'dev-data', jsonKey: 'data', label: 'Data', required: true}, {id: 'dev-natureza', jsonKey: 'natureza_devolucao_tipo', label: 'Natureza', required: true}, {id: 'dev-valor', jsonKey: 'valor', label: 'Valor', required: true}],
        'lista-devolucoes', (d) => `Natureza ${d.natureza_devolucao_tipo} - R$ ${d.valor}`
    );
}

// --- PÁGINA 13: GLOSAS ---
function addGlosa() {
    const glosa = {
        "identificacao_documento_fiscal": { "numero": document.getElementById('glosa-doc-numero').value, "identificacao_credor": { "documento_tipo": parseInt(document.getElementById('glosa-credor-tipo').value), "documento_numero": document.getElementById('glosa-credor-numero').value } },
        "resultado_analise": parseInt(document.getElementById('glosa-resultado').value),
        "valor_glosa": parseFloat(document.getElementById('glosa-valor').value)
    };
    if(!glosa.identificacao_documento_fiscal.numero) return;
    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item';
    itemDiv.dataset.json = JSON.stringify(glosa);
    itemDiv.innerHTML = `<span>Glosa Doc ${glosa.identificacao_documento_fiscal.numero} - R$ ${glosa.valor_glosa}</span> <button type="button" class="btn-remove" onclick="removerItem(this)">Remover</button>`;
    document.getElementById('lista-glosas').appendChild(itemDiv);
    document.getElementById('glosa-doc-numero').value = "";
}

// --- PÁGINA 14: EMPENHOS ---
function addEmpenho() {
    adicionarItemGenerico(
        [{id: 'emp-numero', jsonKey: 'numero', label: 'Número', required: true}, {id: 'emp-data-emissao', jsonKey: 'data_emissao', label: 'Data', required: true}, {id: 'emp-classificacao', jsonKey: 'classificacao_economica_tipo', label: 'Classif.', required: true}, {id: 'emp-fonte-recurso', jsonKey: 'fonte_recurso_tipo', label: 'Fonte', required: true}, {id: 'emp-valor', jsonKey: 'valor', label: 'Valor', required: true}, {id: 'emp-historico', jsonKey: 'historico', label: 'Histórico', required: true}, {id: 'emp-cpf-ordenador', jsonKey: 'cpf_ordenador_despesa', label: 'CPF Ordenador', required: true}],
        'lista-empenhos', (d) => `Empenho ${d.numero} - R$ ${d.valor}`
    );
}

// --- PÁGINA 15: REPASSES ---
function addRepasse() {
    const rep = {
        "identificacao_empenho": { "numero": document.getElementById('repasse-emp-numero').value, "data_emissao": document.getElementById('repasse-emp-data').value },
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
    if(!rep.identificacao_empenho.numero) return;
    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item';
    itemDiv.dataset.json = JSON.stringify(rep);
    itemDiv.innerHTML = `<span>Repasse Empenho ${rep.identificacao_empenho.numero} - R$ ${rep.valor_repasse}</span> <button type="button" class="btn-remove" onclick="removerItem(this)">Remover</button>`;
    document.getElementById('lista-repasses').appendChild(itemDiv);
    document.getElementById('repasse-emp-numero').value = "";
}

// --- PÁGINA 16: REL. ATIVIDADES ---
function addPeriodicidade() {
    const p = { "periodo": parseInt(document.getElementById('periodo-num').value) };
    const qtd = parseFloat(document.getElementById('periodo-qtd').value);
    const res = parseInt(document.getElementById('periodo-res').value);
    if (!isNaN(qtd)) p.quantidade_realizada = qtd;
    if (!isNaN(res)) p.resultado_meta = res;
    p.justificativa = document.getElementById('periodo-just').value || undefined;
    
    if(!p.periodo) return alert("Informe o período");
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item-remuneracao';
    itemDiv.dataset.json = JSON.stringify(p);
    itemDiv.innerHTML = `<span>Período ${p.periodo}</span> <button type="button" class="btn-remove" onclick="removerItem(this)">x</button>`;
    document.getElementById('staging-periodicidades-list').appendChild(itemDiv);
    document.getElementById('periodo-num').value = "";
}
function salvarMeta() {
    const meta = { "codigo_meta": document.getElementById('meta-codigo').value, "meta_atendida": (document.getElementById('meta-atendida').value === 'true'), "periodicidades": [] };
    if(!meta.codigo_meta) return alert("Informe o código da meta");
    document.querySelectorAll('#staging-periodicidades-list .list-item-remuneracao').forEach(item => meta.periodicidades.push(JSON.parse(item.dataset.json)));
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item';
    itemDiv.dataset.json = JSON.stringify(meta);
    itemDiv.innerHTML = `<span>Meta ${meta.codigo_meta}</span> <button type="button" class="btn-remove" onclick="removerItem(this)">Remover</button>`;
    document.getElementById('staging-metas-list').appendChild(itemDiv);
    document.getElementById('meta-codigo').value = "";
    document.getElementById('staging-periodicidades-list').innerHTML = "";
}
function salvarPrograma() {
    const prog = { "nome_programa": document.getElementById('programa-nome').value, "metas": [] };
    if(!prog.nome_programa) return alert("Informe o nome do programa");
    document.querySelectorAll('#staging-metas-list .list-item').forEach(item => prog.metas.push(JSON.parse(item.dataset.json)));
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item';
    itemDiv.dataset.json = JSON.stringify(prog);
    itemDiv.innerHTML = `<span>Programa ${prog.nome_programa} (${prog.metas.length} metas)</span> <button type="button" class="btn-remove" onclick="removerItem(this)">Remover</button>`;
    document.getElementById('lista-programas').appendChild(itemDiv);
    document.getElementById('programa-nome').value = "";
    document.getElementById('staging-metas-list').innerHTML = "";
}

// --- PÁGINAS 19, 20, 25, 26, 27: PUBLICAÇÕES ---
function addPubGenerico(prefixo, listaId) {
    adicionarItemGenerico(
        [{id: `${prefixo}-tipo`, jsonKey: 'tipo_veiculo_publicacao', label: 'Tipo', required: true}, {id: `${prefixo}-nome`, jsonKey: 'nome_veiculo', label: 'Nome', required: false}, {id: `${prefixo}-data`, jsonKey: 'data_publicacao', label: 'Data', required: true}, {id: `${prefixo}-url`, jsonKey: 'endereco_internet', label: 'URL', required: false}],
        listaId, (d) => `Pub. em ${d.data_publicacao} (${d.tipo_veiculo_publicacao})`
    );
}
// Wrappers específicos
function addPubInicial() { addPubGenerico('pub-inicial', 'lista-pub-inicial'); }
function addPubAlteracao() { addPubGenerico('pub-alteracao', 'lista-pub-alteracao'); }
function addPubExtrato() { addPubGenerico('extrato-pub', 'lista-pub-extrato'); }
function addDemonstracaoPublicacao() { addPubGenerico('demo-pub', 'lista-demonstracoes-publicacoes'); }
function addPubRelAtividades() { addPubGenerico('pra-pub', 'lista-pub-rel-atividades'); }

// --- PÁGINA 21: DECLARAÇÕES ---
function addEmpresaPertencente() {
    const cnpj = document.getElementById('empresa-cnpj').value;
    const cpf = document.getElementById('empresa-cpf').value;
    if(!cnpj && !cpf) return alert("Informe CNPJ ou CPF");
    const item = {cnpj: cnpj, cpf: cpf};
    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item';
    itemDiv.dataset.json = JSON.stringify(item);
    itemDiv.innerHTML = `<span>CNPJ:${cnpj || ''} CPF:${cpf || ''}</span> <button type="button" class="btn-remove" onclick="removerItem(this)">x</button>`;
    document.getElementById('lista-empresas-pertencentes').appendChild(itemDiv);
    document.getElementById('empresa-cnpj').value = "";
}
function addCpfContratado() {
    adicionarStringGenerico('part-cpf-contratado', 'staging-cpf-contratados-list', (v) => `CPF: ${v}`);
}
function salvarParticipacaoDiretivo() {
    const part = { "cpf_dirigente": document.getElementById('part-cpf-dirigente').value, "cpf_contratados": [] };
    document.querySelectorAll('#staging-cpf-contratados-list .list-item').forEach(item => part.cpf_contratados.push(item.dataset.json));
    if(!part.cpf_dirigente) return alert("Informe CPF Dirigente");
    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item';
    itemDiv.dataset.json = JSON.stringify(part);
    itemDiv.innerHTML = `<span>Dirigente ${part.cpf_dirigente}</span> <button type="button" class="btn-remove" onclick="removerItem(this)">x</button>`;
    document.getElementById('lista-participacoes-diretivo').appendChild(itemDiv);
    document.getElementById('part-cpf-dirigente').value = "";
    document.getElementById('staging-cpf-contratados-list').innerHTML = "";
}

// --- PÁGINA 26: PARECER/ATA ---
function addParecerPublicacao() {
    addPubGenerico('pa-pub', 'staging-parecer-publicacoes-list');
}
function salvarParecerAta() {
    const item = { "tipo_parecer_ata": parseInt(document.getElementById('pa-tipo').value), "houve_publicacao": (document.getElementById('pa-houve-pub').value === 'true'), "conclusao_parecer": parseInt(document.getElementById('pa-conclusao').value), "publicacoes": [] };
    document.querySelectorAll('#staging-parecer-publicacoes-list .list-item').forEach(l => item.publicacoes.push(JSON.parse(l.dataset.json)));
    if(isNaN(item.tipo_parecer_ata)) return;
    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item';
    itemDiv.dataset.json = JSON.stringify(item);
    itemDiv.innerHTML = `<span>Parecer Tipo ${item.tipo_parecer_ata}</span> <button type="button" class="btn-remove" onclick="removerItem(this)">x</button>`;
    document.getElementById('lista-pub-parecer').appendChild(itemDiv);
    document.getElementById('pa-tipo').value = "";
    document.getElementById('staging-parecer-publicacoes-list').innerHTML = "";
}

// --- PÁGINA 29: PARECER CONCLUSIVO ---
function addDeclaracaoParecer() {
    adicionarItemGenerico(
        [{id: 'pc-decl-tipo', jsonKey: 'tipo_declaracao', label: 'Tipo', required: true}, {id: 'pc-decl-declaracao', jsonKey: 'declaracao', label: 'Declaração', required: true}, {id: 'pc-decl-justificativa', jsonKey: 'justificativa', label: 'Justif.', required: false}],
        'lista-declaracoes-parecer', (d) => `Decl. Tipo ${d.tipo_declaracao}`
    );
}

// --- PÁGINA 30: TRANSPARÊNCIA ---
function addSitioInternet() { adicionarStringGenerico('trans-sitio-url', 'lista-sitios-internet', (v) => v); }
function addRequisitoGeneric(prefixo, lista) {
    const req = { "requisito": parseInt(document.getElementById(`${prefixo}-num`).value), "atende": document.getElementById(`${prefixo}-atende`).value };
    if(isNaN(req.requisito)) return;
    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item';
    itemDiv.dataset.json = JSON.stringify(req);
    itemDiv.innerHTML = `<span>Req ${req.requisito}: ${req.atende === 'true' ? 'Sim' : 'Não'}</span> <button type="button" class="btn-remove" onclick="removerItem(this)">x</button>`;
    document.getElementById(lista).appendChild(itemDiv);
    document.getElementById(`${prefixo}-num`).value = "";
}
function addRequisitoArt78p1() { addRequisitoGeneric('req-781', 'lista-requisitos-781'); }
function addRequisitoArt8p3() { addRequisitoGeneric('req-83', 'lista-requisitos-83'); }
function addRequisitoDivulgacao() { addRequisitoGeneric('req-div', 'lista-requisitos-divulgacao'); }

// ============================================================================
// --- (D) GERADORES DE JSON INDIVIDUAIS (LEGADO) ---
// ============================================================================
function gerarJsonGeral() {
    const d = { "descritor": { tipo_documento: document.getElementById('tipo_documento').value, municipio: parseInt(document.getElementById('municipio').value), entidade: parseInt(document.getElementById('entidade').value), ano: parseInt(document.getElementById('ano').value), mes: parseInt(document.getElementById('mes').value) }, "codigo_ajuste": document.getElementById('codigo_ajuste').value };
    downloadJson(JSON.stringify(d, null, 2), "descritor.json");
}
// ... (Para manter o código enxuto, as funções individuais usam lógica similar à Master abaixo)
// Se precisar de alguma específica, ela segue o padrão de pegar os dados e chamar downloadJson.
function gerarJsonEmpregados() { const d={relacao_empregados:[]}; document.querySelectorAll('#lista-empregados .list-item').forEach(i=>d.relacao_empregados.push(JSON.parse(i.dataset.json))); downloadJson(JSON.stringify(d,null,2), "empregados.json"); }
function gerarJsonBens() { const d={relacao_bens:{relacao_bens_moveis_adquiridos:[],relacao_bens_moveis_cedidos:[],relacao_bens_moveis_baixados_devolvidos:[],relacao_bens_imoveis_adquiridos:[],relacao_bens_imoveis_cedidos:[],relacao_bens_imoveis_baixados_devolvidos:[]}}; 
    const push=(id,k)=>document.querySelectorAll(`#${id} .list-item`).forEach(i=>d.relacao_bens[k].push(JSON.parse(i.dataset.json)));
    push('lista-bens-moveis-adquiridos','relacao_bens_moveis_adquiridos'); push('lista-bens-moveis-cedidos','relacao_bens_moveis_cedidos'); push('lista-bens-moveis-baixados','relacao_bens_moveis_baixados_devolvidos'); push('lista-bens-imoveis-adquiridos','relacao_bens_imoveis_adquiridos'); push('lista-bens-imoveis-cedidos','relacao_bens_imoveis_cedidos'); push('lista-bens-imoveis-baixados','relacao_bens_imoveis_baixados_devolvidos');
    downloadJson(JSON.stringify(d,null,2),"bens.json"); }
function gerarJsonContratos() { const d={contratos:[]}; document.querySelectorAll('#lista-contratos .list-item').forEach(i=>d.contratos.push(JSON.parse(i.dataset.json))); downloadJson(JSON.stringify(d,null,2), "contratos.json"); }
function gerarJsonDocFiscais() { const d={documentos_fiscais:[]}; document.querySelectorAll('#lista-docfiscais .list-item').forEach(i=>d.documentos_fiscais.push(JSON.parse(i.dataset.json))); downloadJson(JSON.stringify(d,null,2), "docs.json"); }
function gerarJsonPagamentos() { const d={pagamentos:[]}; document.querySelectorAll('#lista-pagamentos .list-item').forEach(i=>d.pagamentos.push(JSON.parse(i.dataset.json))); downloadJson(JSON.stringify(d,null,2), "pagamentos.json"); }
function gerarJsonDisponibilidades() { const d={disponibilidades:{saldos:[], saldo_fundo_fixo: parseFloat(document.getElementById('disp-fundo-fixo').value)||0}}; document.querySelectorAll('#lista-saldos .list-item').forEach(i=>d.disponibilidades.saldos.push(JSON.parse(i.dataset.json))); downloadJson(JSON.stringify(d,null,2), "disponibilidades.json"); }
function gerarJsonReceitas() { 
    const d={receitas:{receitas_aplic_financ_repasses_publicos_municipais:parseFloat(document.getElementById('rec-aplic-municipais').value)||0, receitas_aplic_financ_repasses_publicos_estaduais:parseFloat(document.getElementById('rec-aplic-estaduais').value)||0, receitas_aplic_financ_repasses_publicos_federais:parseFloat(document.getElementById('rec-aplic-federais').value)||0, repasses_recebidos:[], outras_receitas:[], recursos_proprios:[]}};
    document.querySelectorAll('#lista-repasses-recebidos .list-item').forEach(i=>d.receitas.repasses_recebidos.push(JSON.parse(i.dataset.json)));
    document.querySelectorAll('#lista-outras-receitas .list-item').forEach(i=>d.receitas.outras_receitas.push(JSON.parse(i.dataset.json)));
    document.querySelectorAll('#lista-recursos-proprios .list-item').forEach(i=>d.receitas.recursos_proprios.push(JSON.parse(i.dataset.json)));
    downloadJson(JSON.stringify(d,null,2),"receitas.json");
}
function gerarJsonAjustesSaldo() {
    const d={ajustes_saldo:{retificacao_repasses:[], inclusao_repasses:[], retificacao_pagamentos:[], inclusao_pagamentos:[]}};
    document.querySelectorAll('#lista-retificacao-repasses .list-item').forEach(i=>d.ajustes_saldo.retificacao_repasses.push(JSON.parse(i.dataset.json)));
    document.querySelectorAll('#lista-inclusao-repasses .list-item').forEach(i=>d.ajustes_saldo.inclusao_repasses.push(JSON.parse(i.dataset.json)));
    document.querySelectorAll('#lista-retificacao-pagamentos .list-item').forEach(i=>d.ajustes_saldo.retificacao_pagamentos.push(JSON.parse(i.dataset.json)));
    document.querySelectorAll('#lista-inclusao-pagamentos .list-item').forEach(i=>d.ajustes_saldo.inclusao_pagamentos.push(JSON.parse(i.dataset.json)));
    downloadJson(JSON.stringify(d,null,2),"ajustes.json");
}
function gerarJsonServidoresCedidos() { const d={servidores_cedidos:[]}; document.querySelectorAll('#lista-servidores-cedidos .list-item').forEach(i=>d.servidores_cedidos.push(JSON.parse(i.dataset.json))); downloadJson(JSON.stringify(d,null,2), "servidores.json"); }
function gerarJsonDescontos() { const d={descontos:[]}; document.querySelectorAll('#lista-descontos .list-item').forEach(i=>d.descontos.push(JSON.parse(i.dataset.json))); downloadJson(JSON.stringify(d,null,2), "descontos.json"); }
function gerarJsonDevolucoes() { const d={devolucoes:[]}; document.querySelectorAll('#lista-devolucoes .list-item').forEach(i=>d.devolucoes.push(JSON.parse(i.dataset.json))); downloadJson(JSON.stringify(d,null,2), "devolucoes.json"); }
function gerarJsonGlosas() { const d={glosas:[]}; document.querySelectorAll('#lista-glosas .list-item').forEach(i=>d.glosas.push(JSON.parse(i.dataset.json))); downloadJson(JSON.stringify(d,null,2), "glosas.json"); }
function gerarJsonEmpenhos() { const d={empenhos:[]}; document.querySelectorAll('#lista-empenhos .list-item').forEach(i=>d.empenhos.push(JSON.parse(i.dataset.json))); downloadJson(JSON.stringify(d,null,2), "empenhos.json"); }
function gerarJsonRepasses() { const d={repasses:[]}; document.querySelectorAll('#lista-repasses .list-item').forEach(i=>d.repasses.push(JSON.parse(i.dataset.json))); downloadJson(JSON.stringify(d,null,2), "repasses.json"); }
function gerarJsonRelatorioAtividades() { const d={relatorio_atividades:{programas:[]}}; document.querySelectorAll('#lista-programas .list-item').forEach(i=>d.relatorio_atividades.programas.push(JSON.parse(i.dataset.json))); downloadJson(JSON.stringify(d,null,2), "atividades.json"); }
function gerarJsonDadosGeraisEntidade() {
    const d={dados_gerais_entidade_beneficiaria:{identificacao_certidao_dados_gerais:document.getElementById('certidao-dados-gerais').value, identificacao_certidao_corpo_diretivo:document.getElementById('certidao-corpo-diretivo').value, identificacao_certidao_membros_conselho:document.getElementById('certidao-membros-conselho').value, identificacao_certidao_responsaveis:document.getElementById('certidao-responsaveis-entidade').value}};
    downloadJson(JSON.stringify(d,null,2),"entidade.json");
}
function gerarJsonResponsaveisOrgao() {
    const d={responsaveis_membros_orgao_concessor:{identificacao_certidao_responsaveis:document.getElementById('certidao-responsaveis-concessor').value, identificacao_certidao_membros_comissao_avaliacao:document.getElementById('certidao-membros-comissao').value, identificacao_certidao_membros_controle_interno:document.getElementById('certidao-membros-controle').value}};
    downloadJson(JSON.stringify(d,null,2),"responsaveis_orgao.json");
}
function gerarJsonPubRegulamento() {
    const d={publicacao_regulamento_compras:{houve_publicacao_inicial:(document.getElementById('pub-inicial-houve').value==='true'), publicacoes_regulamento_inicial:[], houve_alteracao_do_regulamento:(document.getElementById('pub-alteracao-houve').value==='true'), houve_publicacao_regulamento_alterado:(document.getElementById('pub-alteracao-publicada').value==='true'), publicacoes_alteracao_regulamento:[]}};
    document.querySelectorAll('#lista-pub-inicial .list-item').forEach(i=>d.publicacao_regulamento_compras.publicacoes_regulamento_inicial.push(JSON.parse(i.dataset.json)));
    document.querySelectorAll('#lista-pub-alteracao .list-item').forEach(i=>d.publicacao_regulamento_compras.publicacoes_alteracao_regulamento.push(JSON.parse(i.dataset.json)));
    downloadJson(JSON.stringify(d,null,2),"regulamento.json");
}
function gerarJsonPubExtrato() { const d={publicacao_extrato_execucao_fisica_financeira:{ha_extrato_execucao_fisica_financeira:(document.getElementById('extrato-ha').value==='true'), extrato_elaborado_conforme_modelo:(document.getElementById('extrato-conforme').value==='true'), publicacoes:[]}}; document.querySelectorAll('#lista-pub-extrato .list-item').forEach(i=>d.publicacao_extrato_execucao_fisica_financeira.publicacoes.push(JSON.parse(i.dataset.json))); downloadJson(JSON.stringify(d,null,2), "extrato.json"); }
function gerarJsonDeclaracoes() {
    const d={declaracoes:{houve_contratacao_empresas_pertencentes:(document.getElementById('decl-houve-contratacao').value==='true'), empresas_pertencentes:[], houve_participacao_quadro_diretivo_administrativo:(document.getElementById('decl-houve-participacao').value==='true'), participacoes_quadro_diretivo_administrativo:[]}};
    document.querySelectorAll('#lista-empresas-pertencentes .list-item').forEach(i=>d.declaracoes.empresas_pertencentes.push(JSON.parse(i.dataset.json)));
    document.querySelectorAll('#lista-participacoes-diretivo .list-item').forEach(i=>d.declaracoes.participacoes_quadro_diretivo_administrativo.push(JSON.parse(i.dataset.json)));
    downloadJson(JSON.stringify(d,null,2),"declaracoes.json");
}
function gerarJsonRelComissao() { const d={relatorio_comissao_avaliacao:{houve_emissao_relatorio_final:(document.getElementById('comissao-houve-emissao').value==='true'), conclusao_relatorio:parseInt(document.getElementById('comissao-conclusao').value), justificativa:document.getElementById('comissao-justificativa').value}}; downloadJson(JSON.stringify(d,null,2),"rel_comissao.json"); }
function gerarJsonRelGovernamental() { const d={relatorio_governamental_analise_execucao:{houve_emissao_relatorio_final:(document.getElementById('gov-houve-emissao').value==='true'), conclusao_relatorio:parseInt(document.getElementById('gov-conclusao').value), justificativa:document.getElementById('gov-justificativa').value}}; downloadJson(JSON.stringify(d,null,2),"rel_governamental.json"); }
function gerarJsonRelMonitoramento() { const d={relatorio_monitoramento_avaliacao:{houve_emissao_relatorio_final:(document.getElementById('monit-houve-emissao').value==='true'), conclusao_relatorio:parseInt(document.getElementById('monit-conclusao').value), justificativa:document.getElementById('monit-justificativa').value}}; downloadJson(JSON.stringify(d,null,2),"rel_monitoramento.json"); }
function gerarJsonDemonstracoesContabeis() { const d={demonstracoes_contabeis:{publicacoes:[], responsavel:{numero_crc:document.getElementById('demo-crc').value, cpf:document.getElementById('demo-cpf').value, situacao_regular_crc:(document.getElementById('demo-crc-regular').value==='true')}}}; document.querySelectorAll('#lista-demonstracoes-publicacoes .list-item').forEach(i=>d.demonstracoes_contabeis.publicacoes.push(JSON.parse(i.dataset.json))); downloadJson(JSON.stringify(d,null,2),"demonstracoes.json"); }
function gerarJsonPubParecer() { const d={publicacoes_parecer_ata:[]}; document.querySelectorAll('#lista-pub-parecer .list-item').forEach(i=>d.publicacoes_parecer_ata.push(JSON.parse(i.dataset.json))); downloadJson(JSON.stringify(d,null,2),"pub_parecer.json"); }
function gerarJsonPubRelAtividades() { const d={publicacao_relatorio_atividades:{houve_publicacao_exercicio:(document.getElementById('pra-houve').value==='true'), publicacoes:[]}}; document.querySelectorAll('#lista-pub-rel-atividades .list-item').forEach(i=>d.publicacao_relatorio_atividades.publicacoes.push(JSON.parse(i.dataset.json))); downloadJson(JSON.stringify(d,null,2),"pub_atividades.json"); }
function gerarJsonPrestacaoContas() { const d={prestacao_contas_entidade_beneficiaria:{data_prestacao:document.getElementById('pc-data-prestacao').value, periodo_referencia_data_inicial:document.getElementById('pc-data-ref-inicio').value, periodo_referencia_data_final:document.getElementById('pc-data-ref-final').value}}; downloadJson(JSON.stringify(d,null,2),"prestacao_contas.json"); }
function gerarJsonParecerConclusivo() {
    const d={parecer_conclusivo:{identificacao_parecer:document.getElementById('pc-identificacao').value, conclusao_parecer:parseInt(document.getElementById('pc-conclusao').value), consideracoes_parecer:document.getElementById('pc-consideracoes').value, declaracoes:[]}};
    document.querySelectorAll('#lista-declaracoes-parecer .list-item').forEach(i=>d.parecer_conclusivo.declaracoes.push(JSON.parse(i.dataset.json)));
    downloadJson(JSON.stringify(d,null,2),"parecer_conclusivo.json");
}
function gerarJsonTransparencia() {
    const d={transparencia:{entidade_beneficiaria_mantem_sitio_internet:(document.getElementById('trans-mantem-sitio').value==='true'), sitios_internet:[], requisitos_artigos_7o_8o_paragrafo_1o:[], requisitos_sitio_artigo_8o_paragrafo_3o:[], requisitos_divulgacao_informacoes:[]}};
    document.querySelectorAll('#lista-sitios-internet .list-item').forEach(i=>d.transparencia.sitios_internet.push(i.dataset.json));
    const pushReq=(lista, arr)=>document.querySelectorAll(`#${lista} .list-item`).forEach(i=>{let r=JSON.parse(i.dataset.json); r.atende=(r.atende==='true'); arr.push(r)});
    pushReq('lista-requisitos-781', d.transparencia.requisitos_artigos_7o_8o_paragrafo_1o);
    pushReq('lista-requisitos-83', d.transparencia.requisitos_sitio_artigo_8o_paragrafo_3o);
    pushReq('lista-requisitos-divulgacao', d.transparencia.requisitos_divulgacao_informacoes);
    downloadJson(JSON.stringify(d,null,2),"transparencia.json");
}

// ============================================================================
// --- (E) FUNÇÃO MESTRE: GERAR JSON COMPLETO (TODAS AS PÁGINAS) ---
// ============================================================================

function gerarJsonCompleto() {
    try {
        const jsonCompleto = {};

        // 1. Geral
        jsonCompleto.descritor = {
            tipo_documento: document.getElementById('tipo_documento').value,
            municipio: parseInt(document.getElementById('municipio').value) || null,
            entidade: parseInt(document.getElementById('entidade').value) || null,
            ano: parseInt(document.getElementById('ano').value) || null,
            mes: parseInt(document.getElementById('mes').value) || null
        };
        jsonCompleto.codigo_ajuste = document.getElementById('codigo_ajuste').value;

        // 2. Empregados
        jsonCompleto.relacao_empregados = [];
        document.querySelectorAll('#lista-empregados .list-item').forEach(item => jsonCompleto.relacao_empregados.push(JSON.parse(item.dataset.json)));

        // 3. Bens
        jsonCompleto.relacao_bens = {
            "relacao_bens_moveis_adquiridos": [], "relacao_bens_moveis_cedidos": [], "relacao_bens_moveis_baixados_devolvidos": [],
            "relacao_bens_imoveis_adquiridos": [], "relacao_bens_imoveis_cedidos": [], "relacao_bens_imoveis_baixados_devolvidos": []
        };
        const pushList = (idLista, arrayDestino) => {
            document.querySelectorAll(`#${idLista} .list-item`).forEach(item => arrayDestino.push(JSON.parse(item.dataset.json)));
        };
        pushList('lista-bens-moveis-adquiridos', jsonCompleto.relacao_bens.relacao_bens_moveis_adquiridos);
        pushList('lista-bens-moveis-cedidos', jsonCompleto.relacao_bens.relacao_bens_moveis_cedidos);
        pushList('lista-bens-moveis-baixados', jsonCompleto.relacao_bens.relacao_bens_moveis_baixados_devolvidos);
        pushList('lista-bens-imoveis-adquiridos', jsonCompleto.relacao_bens.relacao_bens_imoveis_adquiridos);
        pushList('lista-bens-imoveis-cedidos', jsonCompleto.relacao_bens.relacao_bens_imoveis_cedidos);
        pushList('lista-bens-imoveis-baixados', jsonCompleto.relacao_bens.relacao_bens_imoveis_baixados_devolvidos);

        // 4, 5, 6
        jsonCompleto.contratos = []; document.querySelectorAll('#lista-contratos .list-item').forEach(i => jsonCompleto.contratos.push(JSON.parse(i.dataset.json)));
        jsonCompleto.documentos_fiscais = []; document.querySelectorAll('#lista-docfiscais .list-item').forEach(i => jsonCompleto.documentos_fiscais.push(JSON.parse(i.dataset.json)));
        jsonCompleto.pagamentos = []; document.querySelectorAll('#lista-pagamentos .list-item').forEach(i => jsonCompleto.pagamentos.push(JSON.parse(i.dataset.json)));

        // 7, 8
        jsonCompleto.disponibilidades = { "saldos": [], "saldo_fundo_fixo": parseFloat(document.getElementById('disp-fundo-fixo').value) || 0 };
        document.querySelectorAll('#lista-saldos .list-item').forEach(i => jsonCompleto.disponibilidades.saldos.push(JSON.parse(i.dataset.json)));
        
        jsonCompleto.receitas = {
            "receitas_aplic_financ_repasses_publicos_municipais": parseFloat(document.getElementById('rec-aplic-municipais').value) || 0,
            "receitas_aplic_financ_repasses_publicos_estaduais": parseFloat(document.getElementById('rec-aplic-estaduais').value) || 0,
            "receitas_aplic_financ_repasses_publicos_federais": parseFloat(document.getElementById('rec-aplic-federais').value) || 0,
            "repasses_recebidos": [], "outras_receitas": [], "recursos_proprios": []
        };
        pushList('lista-repasses-recebidos', jsonCompleto.receitas.repasses_recebidos);
        pushList('lista-outras-receitas', jsonCompleto.receitas.outras_receitas);
        pushList('lista-recursos-proprios', jsonCompleto.receitas.recursos_proprios);

        // 9
        jsonCompleto.ajustes_saldo = { "retificacao_repasses": [], "inclusao_repasses": [], "retificacao_pagamentos": [], "inclusao_pagamentos": [] };
        pushList('lista-retificacao-repasses', jsonCompleto.ajustes_saldo.retificacao_repasses);
        pushList('lista-inclusao-repasses', jsonCompleto.ajustes_saldo.inclusao_repasses);
        pushList('lista-retificacao-pagamentos', jsonCompleto.ajustes_saldo.retificacao_pagamentos);
        pushList('lista-inclusao-pagamentos', jsonCompleto.ajustes_saldo.inclusao_pagamentos);

        // 10-15
        jsonCompleto.servidores_cedidos = []; pushList('lista-servidores-cedidos', jsonCompleto.servidores_cedidos);
        jsonCompleto.descontos = []; pushList('lista-descontos', jsonCompleto.descontos);
        jsonCompleto.devolucoes = []; pushList('lista-devolucoes', jsonCompleto.devolucoes);
        jsonCompleto.glosas = []; pushList('lista-glosas', jsonCompleto.glosas);
        jsonCompleto.empenhos = []; pushList('lista-empenhos', jsonCompleto.empenhos);
        jsonCompleto.repasses = []; pushList('lista-repasses', jsonCompleto.repasses);

        // 16
        jsonCompleto.relatorio_atividades = { "programas": [] }; pushList('lista-programas', jsonCompleto.relatorio_atividades.programas);

        // 17-18
        jsonCompleto.dados_gerais_entidade_beneficiaria = {
            "identificacao_certidao_dados_gerais": document.getElementById('certidao-dados-gerais').value,
            "identificacao_certidao_corpo_diretivo": document.getElementById('certidao-corpo-diretivo').value,
            "identificacao_certidao_membros_conselho": document.getElementById('certidao-membros-conselho').value,
            "identificacao_certidao_responsaveis": document.getElementById('certidao-responsaveis-entidade').value
        };
        jsonCompleto.responsaveis_membros_orgao_concessor = {
            "identificacao_certidao_responsaveis": document.getElementById('certidao-responsaveis-concessor').value,
            "identificacao_certidao_membros_comissao_avaliacao": document.getElementById('certidao-membros-comissao').value,
            "identificacao_certidao_membros_controle_interno": document.getElementById('certidao-membros-controle').value
        };

        // 19, 20
        jsonCompleto.publicacao_regulamento_compras = {
            "houve_publicacao_inicial": (document.getElementById('pub-inicial-houve').value === 'true'),
            "publicacoes_regulamento_inicial": [],
            "houve_alteracao_do_regulamento": (document.getElementById('pub-alteracao-houve').value === 'true'),
            "houve_publicacao_regulamento_alterado": (document.getElementById('pub-alteracao-publicada').value === 'true'),
            "publicacoes_alteracao_regulamento": []
        };
        pushList('lista-pub-inicial', jsonCompleto.publicacao_regulamento_compras.publicacoes_regulamento_inicial);
        pushList('lista-pub-alteracao', jsonCompleto.publicacao_regulamento_compras.publicacoes_alteracao_regulamento);

        jsonCompleto.publicacao_extrato_execucao_fisica_financeira = {
            "ha_extrato_execucao_fisica_financeira": (document.getElementById('extrato-ha').value === 'true'),
            "extrato_elaborado_conforme_modelo": (document.getElementById('extrato-conforme').value === 'true'),
            "publicacoes": []
        };
        pushList('lista-pub-extrato', jsonCompleto.publicacao_extrato_execucao_fisica_financeira.publicacoes);

        // 21-24
        jsonCompleto.declaracoes = {
            "houve_contratacao_empresas_pertencentes": (document.getElementById('decl-houve-contratacao').value === 'true'),
            "empresas_pertencentes": [],
            "houve_participacao_quadro_diretivo_administrativo": (document.getElementById('decl-houve-participacao').value === 'true'),
            "participacoes_quadro_diretivo_administrativo": []
        };
        pushList('lista-empresas-pertencentes', jsonCompleto.declaracoes.empresas_pertencentes);
        pushList('lista-participacoes-diretivo', jsonCompleto.declaracoes.participacoes_quadro_diretivo_administrativo);

        jsonCompleto.relatorio_comissao_avaliacao = {
            "houve_emissao_relatorio_final": (document.getElementById('comissao-houve-emissao').value === 'true'),
            "conclusao_relatorio": parseInt(document.getElementById('comissao-conclusao').value) || null,
            "justificativa": document.getElementById('comissao-justificativa').value || undefined
        };
        jsonCompleto.relatorio_governamental_analise_execucao = {
            "houve_emissao_relatorio_final": (document.getElementById('gov-houve-emissao').value === 'true'),
            "conclusao_relatorio": parseInt(document.getElementById('gov-conclusao').value) || null,
            "justificativa": document.getElementById('gov-justificativa').value || undefined
        };
        jsonCompleto.relatorio_monitoramento_avaliacao = {
            "houve_emissao_relatorio_final": (document.getElementById('monit-houve-emissao').value === 'true'),
            "conclusao_relatorio": parseInt(document.getElementById('monit-conclusao').value) || null,
            "justificativa": document.getElementById('monit-justificativa').value || undefined
        };

        // 25-29
        jsonCompleto.demonstracoes_contabeis = {
            "publicacoes": [],
            "responsavel": {
                "numero_crc": document.getElementById('demo-crc').value,
                "cpf": document.getElementById('demo-cpf').value,
                "situacao_regular_crc": (document.getElementById('demo-crc-regular').value === 'true')
            }
        };
        pushList('lista-demonstracoes-publicacoes', jsonCompleto.demonstracoes_contabeis.publicacoes);

        jsonCompleto.publicacoes_parecer_ata = [];
        pushList('lista-pub-parecer', jsonCompleto.publicacoes_parecer_ata);

        jsonCompleto.publicacao_relatorio_atividades = {
            "houve_publicacao_exercicio": (document.getElementById('pra-houve').value === 'true'),
            "publicacoes": []
        };
        pushList('lista-pub-rel-atividades', jsonCompleto.publicacao_relatorio_atividades.publicacoes);

        jsonCompleto.prestacao_contas_entidade_beneficiaria = {
            "data_prestacao": document.getElementById('pc-data-prestacao').value,
            "periodo_referencia_data_inicial": document.getElementById('pc-data-ref-inicio').value,
            "periodo_referencia_data_final": document.getElementById('pc-data-ref-final').value
        };

        jsonCompleto.parecer_conclusivo = {
            "identificacao_parecer": document.getElementById('pc-identificacao').value,
            "conclusao_parecer": parseInt(document.getElementById('pc-conclusao').value) || null,
            "consideracoes_parecer": document.getElementById('pc-consideracoes').value || undefined,
            "declaracoes": []
        };
        pushList('lista-declaracoes-parecer', jsonCompleto.parecer_conclusivo.declaracoes);

        // 30
        jsonCompleto.transparencia = {
            "entidade_beneficiaria_mantem_sitio_internet": (document.getElementById('trans-mantem-sitio').value === 'true'),
            "sitios_internet": [],
            "requisitos_artigos_7o_8o_paragrafo_1o": [],
            "requisitos_sitio_artigo_8o_paragrafo_3o": [],
            "requisitos_divulgacao_informacoes": []
        };
        document.querySelectorAll('#lista-sitios-internet .list-item').forEach(item => jsonCompleto.transparencia.sitios_internet.push(item.dataset.json));
        
        const pushReq = (idLista, arrayDestino) => {
            document.querySelectorAll(`#${idLista} .list-item`).forEach(item => {
                let req = JSON.parse(item.dataset.json);
                if(typeof req.atende === 'string') req.atende = (req.atende === 'true');
                arrayDestino.push(req);
            });
        };
        pushReq('lista-requisitos-781', jsonCompleto.transparencia.requisitos_artigos_7o_8o_paragrafo_1o);
        pushReq('lista-requisitos-83', jsonCompleto.transparencia.requisitos_sitio_artigo_8o_paragrafo_3o);
        pushReq('lista-requisitos-divulgacao', jsonCompleto.transparencia.requisitos_divulgacao_informacoes);

        // GERAÇÃO
        console.log("JSON Completo:", jsonCompleto);
        downloadJson(JSON.stringify(jsonCompleto, null, 2), `prestacao_contas_completa.json`);

    } catch (erro) {
        console.error(erro);
        alert("Erro ao gerar JSON. Verifique o console.");
    }
}

// ============================================================================
// --- (F) SALVAR E RECUPERAR RASCUNHO (LOCAL STORAGE) ---
// ============================================================================

const STORAGE_KEY = 'auditoria_dados_parciais';

function salvarDadosParciais() {
    try {
        const estado = { inputs: {}, listas: {} };
        // 1. Inputs
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(el => {
            if (el.id) {
                if (el.type === 'checkbox' || el.type === 'radio') estado.inputs[el.id] = el.checked;
                else estado.inputs[el.id] = el.value;
            }
        });
        // 2. Listas (innerHTML e atributos)
        const listas = document.querySelectorAll('.list-container, .staging-list-container');
        listas.forEach(el => { if (el.id) estado.listas[el.id] = el.innerHTML; });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
        
        // Feedback Visual
        const btn = document.querySelector('.btn-save-draft');
        if(btn) {
            const original = btn.innerText;
            btn.innerText = "Salvo!";
            setTimeout(() => btn.innerText = original, 1500);
        }
    } catch (erro) {
        alert("Erro ao salvar rascunho. Storage cheio?");
    }
}

function recuperarDadosParciais() {
    const dadosJson = localStorage.getItem(STORAGE_KEY);
    if (!dadosJson) return alert("Nenhum rascunho salvo.");
    if (!confirm("Isso irá substituir os dados atuais pelos salvos. Continuar?")) return;

    try {
        const estado = JSON.parse(dadosJson);
        // 1. Restaurar Inputs
        Object.keys(estado.inputs).forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (el.type === 'checkbox' || el.type === 'radio') el.checked = estado.inputs[id];
                else el.value = estado.inputs[id];
            }
        });
        // 2. Restaurar Listas
        Object.keys(estado.listas).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = estado.listas[id];
        });
        alert("Rascunho recuperado!");
    } catch (erro) {
        console.error(erro);
        alert("Erro ao ler rascunho.");
    }
}

function limparRascunho() {
    if(confirm("Apagar rascunho da memória?")) {
        localStorage.removeItem(STORAGE_KEY);
        alert("Limpo.");
    }
}

// Auto-save a cada 1 minuto (Opcional, silencioso)
setInterval(() => {
    try {
        const dados = localStorage.getItem(STORAGE_KEY);
        if(dados) salvarDadosParciais(); // Só atualiza se já houver algo salvo intencionalmente pelo usuário
    } catch(e){}
}, 60000);
