/**
 * ==============================================================================
 * SISTEMA FINANCEIRO EXCLUSIVO - BEATRIZ LEAL BEAUTY
 * Google Apps Script (Backend & API REST com CRUD Completo)
 * ==============================================================================
 */

function resolveSheet(ss, type) {
  const aliases = {
    ATENDIMENTOS: ['Atendimentos', 'atendimentos'],
    DESPESAS: ['Empresa', 'Despesas empresa', 'Despesas', 'empresa'],
    OUTROS: ['Outros', 'Receitas avulsas', 'outros', 'avulsas'],
    PESSOAL: ['Eu', 'Finanças pessoais', 'Pessoal', 'eu', 'pessoal'],
    METAS: ['Metas', 'metas']
  };

  const candidates = aliases[type] || [type];
  for (let i = 0; i < candidates.length; i++) {
    const s = ss.getSheetByName(candidates[i]);
    if (s) return s;
  }

  const allSheets = ss.getSheets();
  for (let s of allSheets) {
    const cleanName = s.getName().toLowerCase().replace(/[^a-z0-9]/g, '');
    for (let c of candidates) {
      const cleanCandidate = c.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanName === cleanCandidate || cleanName.includes(cleanCandidate) || cleanCandidate.includes(cleanName)) {
        return s;
      }
    }
  }
  return null;
}

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'getAllData';
    
    if (action === 'ping') {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      return createJsonResponse({ 
        status: 'success', 
        message: 'Conexão com Google Sheets ativa!',
        abasEncontradas: ss.getSheets().map(s => s.getName())
      });
    }

    if (action === 'getAllData') {
      const data = fetchAllSpreadsheetData();
      return createJsonResponse({ status: 'success', data: data });
    }

    if (action.startsWith('add') || action.startsWith('update') || action.startsWith('delete')) {
      const result = handleAction(action, e.parameter);
      return createJsonResponse(result);
    }

    const data = fetchAllSpreadsheetData();
    return createJsonResponse({ status: 'success', data: data });
  } catch (error) {
    return createJsonResponse({ status: 'error', message: error.toString() });
  }
}

function doPost(e) {
  try {
    let payload = {};
    if (e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (err) {
        payload = e.parameter || {};
      }
    } else {
      payload = e.parameter || {};
    }

    const action = payload.action;
    const result = handleAction(action, payload);
    return createJsonResponse(result);
  } catch (error) {
    return createJsonResponse({ status: 'error', message: error.toString() });
  }
}

function handleAction(action, payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  switch (action) {
    // ATENDIMENTOS
    case 'addAtendimento':
      return addAtendimento(ss, payload);
    case 'updateAtendimento':
      return updateAtendimento(ss, payload);
    case 'deleteAtendimento':
      return deleteRowByIndex(ss, 'ATENDIMENTOS', payload.rowIndex);

    // DESPESAS EMPRESA
    case 'addDespesa':
      return addDespesa(ss, payload);
    case 'updateDespesa':
      return updateDespesa(ss, payload);
    case 'deleteDespesa':
      return deleteRowByIndex(ss, 'DESPESAS', payload.rowIndex);

    // RECEITAS EXTRAS / OUTROS
    case 'addReceitaAvulsa':
      return addReceitaAvulsa(ss, payload);
    case 'updateReceitaAvulsa':
      return updateReceitaAvulsa(ss, payload);
    case 'deleteReceitaAvulsa':
      return deleteRowByIndex(ss, 'OUTROS', payload.rowIndex);

    // FINANÇAS PESSOAIS / EU
    case 'addPessoal':
      return addPessoal(ss, payload);
    case 'updatePessoal':
      return updatePessoal(ss, payload);
    case 'deletePessoal':
      return deleteRowByIndex(ss, 'PESSOAL', payload.rowIndex);

    case 'retiradaProLabore':
      return registrarProLabore(ss, payload);

    case 'updateMetas':
      return updateMetas(ss, payload);

    default:
      return { status: 'error', message: 'Ação desconhecida: ' + action };
  }
}

function fetchAllSpreadsheetData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  return {
    atendimentos: getSheetRows(ss, 'ATENDIMENTOS'),
    despesas: getSheetRows(ss, 'DESPESAS'),
    outros: getSheetRows(ss, 'OUTROS'),
    pessoal: getSheetRows(ss, 'PESSOAL'),
    metas: getMetasData(ss),
    updatedAt: new Date().toISOString()
  };
}

function getSheetRows(ss, type) {
  const sheet = resolveSheet(ss, type);
  if (!sheet) return [];

  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol < 1) return [];

  const values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  const headers = values[0].map(h => normalizeHeader(String(h)));

  const result = [];
  for (let r = 1; r < values.length; r++) {
    const row = values[r];
    if (!row.some(cell => cell !== '' && cell !== null && cell !== undefined)) continue;

    const item = { _rowIndex: r + 1 };
    for (let c = 0; c < headers.length; c++) {
      let val = row[c];
      if (val instanceof Date) {
        val = Utilities.formatDate(val, Session.getScriptTimeZone() || 'America/Sao_Paulo', 'yyyy-MM-dd');
      }
      item[headers[c]] = val;
    }
    result.push(item);
  }

  return result;
}

function getMetasData(ss) {
  const sheet = resolveSheet(ss, 'METAS');
  if (!sheet) {
    return { faturamento: 5000, reserva: 10000, limitePessoal: 2500 };
  }

  const values = sheet.getDataRange().getValues();
  const metas = { faturamento: 5000, reserva: 10000, limitePessoal: 2500 };

  for (let r = 1; r < values.length; r++) {
    const desc = String(values[r][0] || '').toLowerCase();
    const val = Number(values[r][1]) || 0;
    if (desc.includes('faturamento')) metas.faturamento = val;
    else if (desc.includes('reserva')) metas.reserva = val;
    else if (desc.includes('pessoal') || desc.includes('gastos')) metas.limitePessoal = val;
  }

  return metas;
}

// ==============================================================================
// ATENDIMENTOS: CRIAR E EDITAR
// ==============================================================================
function addAtendimento(ss, data) {
  const sheet = resolveSheet(ss, 'ATENDIMENTOS');
  if (!sheet) throw new Error('Aba Atendimentos não encontrada');

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => normalizeHeader(String(h)));
  const rowData = buildAtendimentoRow(headers, data);

  sheet.insertRowBefore(2);
  sheet.getRange(2, 1, 1, rowData.length).setValues([rowData]);

  return { status: 'success', message: 'Atendimento adicionado com sucesso!' };
}

function updateAtendimento(ss, data) {
  const sheet = resolveSheet(ss, 'ATENDIMENTOS');
  if (!sheet) throw new Error('Aba Atendimentos não encontrada');

  const idx = Number(data.rowIndex || data._rowIndex);
  if (!idx || idx < 2 || idx > sheet.getLastRow()) {
    throw new Error('Linha inválida para atualização: ' + idx);
  }

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => normalizeHeader(String(h)));
  const rowData = buildAtendimentoRow(headers, data);

  sheet.getRange(idx, 1, 1, rowData.length).setValues([rowData]);

  return { status: 'success', message: 'Atendimento atualizado com sucesso!' };
}

function buildAtendimentoRow(headers, data) {
  const dateVal = data.data ? new Date(data.data + 'T12:00:00') : new Date();
  const cliente = data.cliente || data['Cliente (opcional)'] || '';
  const servico = data.servico || data['Serviço'] || '';
  const valorTotal = Number(data.valorTotal || data.valortotal || data['Valor total']) || 0;
  const sinal = Number(data.sinal || data['Sinal']) || 0;
  const restante = Number(data.restante || data.recebido || data['Recebido']) || (valorTotal - sinal);
  const aReceber = Number(data.aReceber || data.areceber || data['A receber']) || 0;
  const formaPagto = data.formaPagamento || data.formadepagamento || data['Forma de pagamento'] || 'Pix';
  const parcelas = data.parcelas || data['Parcelas'] || 'À vista';
  const situacao = data.situacao || data['Situação'] || (aReceber > 0 ? 'Pendente' : 'Concluído');
  const observacoes = data.observacoes || data['Observações'] || '';

  const rowData = [];
  headers.forEach((h) => {
    if (h.includes('data')) rowData.push(dateVal);
    else if (h.includes('cliente')) rowData.push(cliente);
    else if (h.includes('servico')) rowData.push(servico);
    else if (h.includes('total')) rowData.push(valorTotal);
    else if (h.includes('sinal')) rowData.push(sinal);
    else if (h.includes('restante')) rowData.push(restante);
    else if (h.includes('recebido')) rowData.push(restante);
    else if (h.includes('receber')) rowData.push(aReceber);
    else if (h.includes('forma') || h.includes('pagamento')) rowData.push(formaPagto);
    else if (h.includes('parcela')) rowData.push(parcelas);
    else if (h.includes('situac')) rowData.push(situacao);
    else if (h.includes('observac')) rowData.push(observacoes);
    else rowData.push('');
  });

  return rowData;
}

// ==============================================================================
// DESPESAS: CRIAR E EDITAR
// ==============================================================================
function addDespesa(ss, data) {
  const sheet = resolveSheet(ss, 'DESPESAS');
  if (!sheet) throw new Error('Aba Empresa / Despesas não encontrada');

  const rowData = buildDespesaRow(data);
  sheet.insertRowBefore(2);
  sheet.getRange(2, 1, 1, 7).setValues([rowData]);

  return { status: 'success', message: 'Despesa registrada com sucesso!' };
}

function updateDespesa(ss, data) {
  const sheet = resolveSheet(ss, 'DESPESAS');
  if (!sheet) throw new Error('Aba Empresa / Despesas não encontrada');

  const idx = Number(data.rowIndex || data._rowIndex);
  if (!idx || idx < 2 || idx > sheet.getLastRow()) throw new Error('Linha inválida: ' + idx);

  const rowData = buildDespesaRow(data);
  sheet.getRange(idx, 1, 1, 7).setValues([rowData]);

  return { status: 'success', message: 'Despesa atualizada com sucesso!' };
}

function buildDespesaRow(data) {
  const dateVal = data.data ? new Date(data.data + 'T12:00:00') : new Date();
  const categoria = data.categoria || 'Geral';
  const descricao = data.descricao || '';
  const valor = Number(data.valor) || 0;
  const formaPagto = data.formaPagamento || data.formadepagamento || 'Pix';
  const parcelas = data.parcelas || 'À vista';
  const observacoes = data.observacoes || '';

  return [dateVal, categoria, descricao, valor, formaPagto, parcelas, observacoes];
}

// ==============================================================================
// RECEITAS EXTRAS: CRIAR E EDITAR
// ==============================================================================
function addReceitaAvulsa(ss, data) {
  const sheet = resolveSheet(ss, 'OUTROS');
  if (!sheet) throw new Error('Aba Outros / Receitas avulsas não encontrada');

  const rowData = buildReceitaAvulsaRow(data);
  sheet.insertRowBefore(2);
  sheet.getRange(2, 1, 1, 4).setValues([rowData]);

  return { status: 'success', message: 'Receita extra registrada com sucesso!' };
}

function updateReceitaAvulsa(ss, data) {
  const sheet = resolveSheet(ss, 'OUTROS');
  if (!sheet) throw new Error('Aba Outros não encontrada');

  const idx = Number(data.rowIndex || data._rowIndex);
  if (!idx || idx < 2 || idx > sheet.getLastRow()) throw new Error('Linha inválida: ' + idx);

  const rowData = buildReceitaAvulsaRow(data);
  sheet.getRange(idx, 1, 1, 4).setValues([rowData]);

  return { status: 'success', message: 'Receita extra atualizada com sucesso!' };
}

function buildReceitaAvulsaRow(data) {
  const dateVal = data.data ? new Date(data.data + 'T12:00:00') : new Date();
  const descricao = data.descricao || '';
  const valor = Number(data.valor || data.valorrecebido) || 0;
  const observacoes = data.observacoes || '';

  return [dateVal, descricao, valor, observacoes];
}

// ==============================================================================
// FINANÇAS PESSOAIS: CRIAR E EDITAR
// ==============================================================================
function addPessoal(ss, data) {
  const sheet = resolveSheet(ss, 'PESSOAL');
  if (!sheet) throw new Error('Aba Eu / Finanças pessoais não encontrada');

  const rowData = buildPessoalRow(data);
  sheet.insertRowBefore(2);
  sheet.getRange(2, 1, 1, 6).setValues([rowData]);

  return { status: 'success', message: 'Lançamento pessoal registrado!' };
}

function updatePessoal(ss, data) {
  const sheet = resolveSheet(ss, 'PESSOAL');
  if (!sheet) throw new Error('Aba Eu / Finanças pessoais não encontrada');

  const idx = Number(data.rowIndex || data._rowIndex);
  if (!idx || idx < 2 || idx > sheet.getLastRow()) throw new Error('Linha inválida: ' + idx);

  const rowData = buildPessoalRow(data);
  sheet.getRange(idx, 1, 1, 6).setValues([rowData]);

  return { status: 'success', message: 'Lançamento pessoal atualizado!' };
}

function buildPessoalRow(data) {
  const dateVal = data.data ? new Date(data.data + 'T12:00:00') : new Date();
  const tipo = data.tipo || 'Despesa';
  const categoria = data.categoria || 'Geral';
  const descricao = data.descricao || '';
  const valor = Number(data.valor) || 0;
  const observacoes = data.observacoes || '';

  return [dateVal, tipo, categoria, descricao, valor, observacoes];
}

function registrarProLabore(ss, data) {
  const dateVal = data.data ? new Date(data.data + 'T12:00:00') : new Date();
  const valor = Number(data.valor) || 0;
  const obs = data.observacoes || 'Transferência da empresa para conta pessoal';

  return addPessoal(ss, {
    data: Utilities.formatDate(dateVal, Session.getScriptTimeZone() || 'America/Sao_Paulo', 'yyyy-MM-dd'),
    tipo: 'Receita',
    categoria: 'Retirada da empresa',
    descricao: 'Pró-labore / Retirada',
    valor: valor,
    observacoes: obs
  });
}

function updateMetas(ss, data) {
  const sheet = resolveSheet(ss, 'METAS');
  if (!sheet) throw new Error('Aba Metas não encontrada');

  if (data.faturamento) sheet.getRange(2, 2).setValue(Number(data.faturamento));
  if (data.reserva) sheet.getRange(3, 2).setValue(Number(data.reserva));
  if (data.limitePessoal) sheet.getRange(4, 2).setValue(Number(data.limitePessoal));

  return { status: 'success', message: 'Metas atualizadas com sucesso!' };
}

function deleteRowByIndex(ss, sheetType, rowIndex) {
  const sheet = resolveSheet(ss, sheetType);
  if (!sheet) throw new Error('Aba não encontrada');

  const idx = Number(rowIndex);
  if (idx && idx >= 2 && idx <= sheet.getLastRow()) {
    sheet.deleteRow(idx);
    return { status: 'success', message: 'Item excluído com sucesso!' };
  }

  return { status: 'error', message: 'Linha inválida para exclusão' };
}

function normalizeHeader(str) {
  return str.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '');
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
