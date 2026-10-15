/**
 * ==============================================================================
 * SISTEMA FINANCEIRO EXCLUSIVO - BEATRIZ LEAL BEAUTY
 * Lógica do Cliente, Cálculos, Gráficos e Sincronização Apps Script
 * ==============================================================================
 */

// Versão da Aplicação (Atualizada para Cache Busting)
const APP_VERSION = '1.1.1';

// Estado da Aplicação
const state = {
  data: {
    atendimentos: [],
    despesas: [],
    outros: [],
    pessoal: [],
    metas: { faturamento: 5000, reserva: 10000, limitePessoal: 2500 }
  },
  apiUrl: localStorage.getItem('bia_fin_api_url') || 'https://script.google.com/macros/s/AKfycbxNMWhtU06JuOv_E5wuNyIYKr0wIPnRD6qfBl4qMpgKccEc2m4EG9XO5K1brPATYHzO/exec',
  selectedYear: 2026,
  selectedMonth: 10, // Outubro como padrão (onde estão os dados da planilha)
  currentTab: 'dashboard',
  isSyncing: false,
  charts: {},
  filters: {
    search: '',
    status: 'all',
    payment: 'all'
  }
};

// Procedimentos padrão e valores sugeridos
const PROCEDIMENTOS_CATALOGO = [
  { nome: 'Design de sobrancelhas', valor: 55, sinal: 30 },
  { nome: 'Design com henna', valor: 75, sinal: 30 },
  { nome: 'Lash lifting', valor: 130, sinal: 30 },
  { nome: 'Brow lamination', valor: 145, sinal: 30 },
  { nome: 'Extensão de cílios', valor: 190, sinal: 30 },
  { nome: 'Manutenção de cílios', valor: 100, sinal: 30 },
  { nome: 'Micropigmentação labial', valor: 350, sinal: 50 },
  { nome: 'Micropigmentação sobrancelhas', valor: 450, sinal: 50 }
];

// Obtém catálogo dinâmico de procedimentos: mescla a lista base com qualquer procedimento já existente na planilha
function getDynamicProcedimentos() {
  const map = new Map();

  // 1. Procedimentos base cadastrados no código
  PROCEDIMENTOS_CATALOGO.forEach(p => {
    const key = p.nome.trim().toLowerCase();
    map.set(key, {
      nome: p.nome.trim(),
      valor: p.valor,
      sinal: p.sinal,
      isCustom: false
    });
  });

  // 2. Extrai novos procedimentos a partir do histórico de atendimentos da planilha
  const atendimentos = state.data?.atendimentos || [];
  atendimentos.forEach(a => {
    const servico = (a.servico || '').trim();
    if (!servico) return;
    const key = servico.toLowerCase();

    const val = parseFloat(a.valorTotal) || 0;
    const sin = parseFloat(a.sinal) || 30;

    if (!map.has(key)) {
      map.set(key, {
        nome: servico,
        valor: val,
        sinal: sin,
        isCustom: true
      });
    } else {
      const existing = map.get(key);
      if (existing.isCustom && existing.valor === 0 && val > 0) {
        existing.valor = val;
        existing.sinal = sin;
      }
    }
  });

  return Array.from(map.values());
}

// Popula dinamicamente o select de procedimentos no modal de Atendimento
function populateProcedimentosSelect() {
  const select = document.getElementById('modal-servico-select');
  if (!select) return;

  const currentVal = select.value;
  select.innerHTML = '';

  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Selecione um procedimento cadastrado...';
  select.appendChild(defaultOption);

  const catalog = getDynamicProcedimentos();
  const personalizados = catalog.filter(p => p.isCustom);
  const padroes = catalog.filter(p => !p.isCustom);

  if (personalizados.length > 0) {
    const groupPlanilha = document.createElement('optgroup');
    groupPlanilha.label = '✨ Adicionados da Planilha';
    personalizados.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.nome;
      const priceText = p.valor > 0 ? ` (${formatBRL(p.valor)})` : '';
      opt.textContent = `${p.nome}${priceText}`;
      groupPlanilha.appendChild(opt);
    });
    select.appendChild(groupPlanilha);

    const groupPadrao = document.createElement('optgroup');
    groupPadrao.label = 'Procedimentos do Catálogo';
    padroes.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.nome;
      const priceText = p.valor > 0 ? ` (${formatBRL(p.valor)})` : '';
      opt.textContent = `${p.nome}${priceText}`;
      groupPadrao.appendChild(opt);
    });
    select.appendChild(groupPadrao);
  } else {
    padroes.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.nome;
      const priceText = p.valor > 0 ? ` (${formatBRL(p.valor)})` : '';
      opt.textContent = `${p.nome}${priceText}`;
      select.appendChild(opt);
    });
  }

  if (currentVal) {
    select.value = currentVal;
  }
}

// ==============================================================================
// PARSER SEGURO DE DATAS (Sem problemas de fuso horário / GMT-3)
// ==============================================================================
function parseDateParts(rawDate) {
  if (!rawDate) return null;
  if (typeof rawDate === 'string') {
    // Trata formato 'YYYY-MM-DD' ou 'YYYY-MM-DDTHH:mm:ss'
    const clean = rawDate.split('T')[0].split(' ')[0];
    const parts = clean.split('-');
    if (parts.length === 3) {
      return {
        year: parseInt(parts[0], 10),
        month: parseInt(parts[1], 10), // 1-12
        day: parseInt(parts[2], 10)
      };
    }
  }
  const dt = new Date(rawDate);
  if (isNaN(dt.getTime())) return null;
  return {
    year: dt.getFullYear(),
    month: dt.getMonth() + 1,
    day: dt.getDate()
  };
}

function formatDateBR(rawDate) {
  const p = parseDateParts(rawDate);
  if (!p) return '-';
  const dd = String(p.day).padStart(2, '0');
  const mm = String(p.month).padStart(2, '0');
  return `${dd}/${mm}/${p.year}`;
}

// ==============================================================================
// NORMALIZAÇÃO DE DADOS (Compatível com Apps Script e initial_data.json)
// ==============================================================================
function normalizeAtendimento(a, idx) {
  const rawDate = a.data || a.Data || a.DATA || '';
  const cliente = a.cliente || a['Cliente (opcional)'] || a.clienteopcional || a.client || 'Cliente';
  const servico = a.servico || a['Serviço'] || a.serviço || '-';
  const valorTotal = parseFloat(a.valortotal || a['Valor total'] || a.valorTotal || a.total) || 0;
  const recebido = parseFloat(a.recebido || a['Recebido']) || 0;
  const aReceber = parseFloat(a.areceber || a['A receber'] || a.aReceber) || 0;
  
  let sinal = parseFloat(a.sinal || a['Sinal']) || 0;
  
  let rawSituacao = a.situacao || a['Situação'] || a.situac || '';
  let situacao = 'Concluído';
  if (typeof rawSituacao === 'string' && rawSituacao.trim() !== '') {
    const sLower = rawSituacao.toLowerCase();
    if (sLower.includes('canc')) situacao = 'Cancelado';
    else if (sLower.includes('pend')) situacao = 'Pendente';
    else if (sLower.includes('concl')) situacao = 'Concluído';
    else situacao = aReceber > 0 ? 'Pendente' : 'Concluído';
  } else {
    situacao = aReceber > 0 ? 'Pendente' : 'Concluído';
  }

  // Detecção inteligente do sinal de agendamento (R$ 30)
  if (sinal === 0 && valorTotal > (recebido + aReceber) && situacao !== 'Cancelado') {
    sinal = valorTotal - (recebido + aReceber);
  }

  const formaPagto = a.formadepagamento || a['Forma de pagamento'] || a.formapagamento || a.formaPagamento || 'Pix';
  const parcelas = a.parcelas || a['Parcelas'] || 'À vista';
  const observacoes = a.observacoes || a['Observações'] || a.observacao || '';

  return {
    _rowIndex: a._rowIndex || idx + 2,
    data: rawDate,
    cliente,
    servico,
    valorTotal,
    sinal,
    restante: recebido,
    recebido: recebido + sinal,
    aReceber,
    formaPagamento: formaPagto,
    parcelas,
    situacao,
    observacoes
  };
}

function normalizeDespesa(d, idx) {
  const rawDate = d.data || d.Data || '';
  const categoria = d.categoria || d['Categoria'] || 'Geral';
  const descricao = d.descricao || d['Descrição'] || '-';
  const valor = parseFloat(d.valor || d['Valor']) || 0;
  const formaPagto = d.formadepagamento || d['Forma de pagamento'] || d.formapagamento || 'Pix';
  const parcelas = d.parcelas || d['Parcelas'] || 'À vista';
  const observacoes = d.observacoes || d['Observações'] || '';

  return {
    _rowIndex: d._rowIndex || idx + 2,
    data: rawDate,
    categoria,
    descricao,
    valor,
    formaPagamento: formaPagto,
    parcelas,
    observacoes
  };
}

function normalizeOutro(o, idx) {
  const rawDate = o.data || o.Data || '';
  const descricao = o.descricao || o['Descrição'] || '-';
  const valor = parseFloat(o.valorrecebido || o['Valor recebido'] || o.valor) || 0;
  const observacoes = o.observacoes || o['Observações'] || '';

  return {
    _rowIndex: o._rowIndex || idx + 2,
    data: rawDate,
    descricao,
    valor,
    observacoes
  };
}

function normalizePessoal(p, idx) {
  const rawDate = p.data || p.Data || '';
  const tipo = p.tipo || p['Tipo'] || 'Despesa';
  const categoria = p.categoria || p['Categoria'] || 'Geral';
  const descricao = p.descricao || p['Descrição'] || '-';
  const valor = parseFloat(p.valor || p['Valor']) || 0;
  const observacoes = p.observacoes || p['Observações'] || '';

  return {
    _rowIndex: p._rowIndex || idx + 2,
    data: rawDate,
    tipo,
    categoria,
    descricao,
    valor,
    observacoes
  };
}

function normalizeFullDataset(raw) {
  if (!raw) return state.data;
  return {
    atendimentos: (raw.atendimentos || []).map(normalizeAtendimento),
    despesas: (raw.despesas || []).map(normalizeDespesa),
    outros: (raw.outros || []).map(normalizeOutro),
    pessoal: (raw.pessoal || []).map(normalizePessoal),
    metas: raw.metas || { faturamento: 5000, reserva: 10000, limitePessoal: 2500 }
  };
}

// Verificação de Versão da Aplicação (Cache Busting Automático)
function checkAppVersion() {
  const savedVersion = localStorage.getItem('bia_app_version');
  if (savedVersion !== APP_VERSION) {
    console.log(`[BiaLeal] Atualizando versão de ${savedVersion || 'v1.0.0'} para ${APP_VERSION}. Limpando cache antigo.`);
    localStorage.setItem('bia_app_version', APP_VERSION);
    localStorage.removeItem('bia_fin_data');
  }
}

// Forçar Atualização e Limpeza de Cache Manual
function forceAppRefresh() {
  localStorage.removeItem('bia_fin_data');
  showToast('Cache limpo! Recarregando dados frescos...');
  if (state.apiUrl) {
    syncWithGoogleSheets(true);
  } else {
    setTimeout(() => window.location.reload(true), 600);
  }
}

// Inicialização ao carregar a página
document.addEventListener('DOMContentLoaded', async () => {
  checkAppVersion();
  await loadInitialData();
  initUI();
  setupEventListeners();
  renderAll();

  // Sincroniza em segundo plano com o Google Sheets
  if (state.apiUrl) {
    syncWithGoogleSheets(false);
  } else {
    updateSyncBadge('local');
  }
});

// Carrega dados iniciais do cache ou de initial_data.json
async function loadInitialData() {
  const cached = localStorage.getItem('bia_fin_data');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      state.data = normalizeFullDataset(parsed);
      return;
    } catch (e) {
      console.warn('Erro ao ler cache local:', e);
    }
  }

  try {
    const res = await fetch('./initial_data.json');
    if (res.ok) {
      const json = await res.json();
      state.data = normalizeFullDataset(json);
      saveLocalCache();
    }
  } catch (err) {
    console.warn('Usando dados de exemplo padrão...');
  }
}

// Configuração da Interface
function initUI() {
  const monthSelect = document.getElementById('select-month');
  const yearSelect = document.getElementById('select-year');
  
  if (monthSelect) monthSelect.value = state.selectedMonth;
  if (yearSelect) yearSelect.value = state.selectedYear;

  const inputApiUrl = document.getElementById('config-api-url');
  if (inputApiUrl && state.apiUrl) {
    inputApiUrl.value = state.apiUrl;
  }

  populateProcedimentosSelect();
}

// Escutadores de Eventos
function setupEventListeners() {
  // Troca de Mês e Ano
  document.getElementById('select-month')?.addEventListener('change', (e) => {
    state.selectedMonth = e.target.value === 'all' ? 'all' : parseInt(e.target.value);
    renderAll();
  });

  document.getElementById('select-year')?.addEventListener('change', (e) => {
    state.selectedYear = parseInt(e.target.value);
    renderAll();
  });

  // Botões de Navegação por Mês (< e >)
  document.getElementById('btn-prev-month')?.addEventListener('click', () => {
    if (state.selectedMonth === 'all') state.selectedMonth = 1;
    else if (state.selectedMonth > 1) state.selectedMonth--;
    else {
      state.selectedMonth = 12;
      state.selectedYear--;
      document.getElementById('select-year').value = state.selectedYear;
    }
    document.getElementById('select-month').value = state.selectedMonth;
    renderAll();
  });

  document.getElementById('btn-next-month')?.addEventListener('click', () => {
    if (state.selectedMonth === 'all') state.selectedMonth = 12;
    else if (state.selectedMonth < 12) state.selectedMonth++;
    else {
      state.selectedMonth = 1;
      state.selectedYear++;
      document.getElementById('select-year').value = state.selectedYear;
    }
    document.getElementById('select-month').value = state.selectedMonth;
    renderAll();
  });

  // Navegação por Abas
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });

  // Filtros de Atendimentos
  document.getElementById('search-atendimentos')?.addEventListener('input', (e) => {
    state.filters.search = e.target.value.toLowerCase();
    renderAtendimentosTable();
  });

  document.getElementById('filter-status')?.addEventListener('change', (e) => {
    state.filters.status = e.target.value;
    renderAtendimentosTable();
  });

  document.getElementById('filter-payment')?.addEventListener('change', (e) => {
    state.filters.payment = e.target.value;
    renderAtendimentosTable();
  });

  // Ações de Sincronização
  document.getElementById('btn-sync')?.addEventListener('click', () => syncWithGoogleSheets(true));
  document.getElementById('btn-save-api')?.addEventListener('click', saveApiConfig);
  document.getElementById('btn-test-api')?.addEventListener('click', testApiConnection);

  // Seleção rápida de procedimento no modal de atendimento
  document.getElementById('modal-servico-select')?.addEventListener('change', (e) => {
    const val = e.target.value;
    if (!val) return;
    const catalog = getDynamicProcedimentos();
    const proc = catalog.find(p => p.nome.toLowerCase() === val.toLowerCase());
    if (proc) {
      document.getElementById('modal-servico').value = proc.nome;
      if (proc.valor > 0) {
        document.getElementById('modal-valor-total').value = proc.valor;
      }
      if (proc.sinal !== undefined && proc.sinal !== null) {
        document.getElementById('modal-sinal').value = proc.sinal;
      }
      recalculateModalAtendimento();
    }
  });

  // Recálculo automático de valores no modal de Atendimento
  ['modal-valor-total', 'modal-sinal', 'modal-a-receber'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', recalculateModalAtendimento);
  });
}

// Troca de Aba
function switchTab(tabId) {
  state.currentTab = tabId;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  document.querySelectorAll('.tab-content').forEach(section => {
    if (section.id === `tab-${tabId}`) {
      section.classList.remove('hidden');
      section.classList.add('animate-fade-in');
    } else {
      section.classList.add('hidden');
    }
  });

  if (tabId === 'dashboard') {
    renderCharts();
  }
}

// Recálculo dos campos no modal de atendimento
function recalculateModalAtendimento() {
  const total = parseFloat(document.getElementById('modal-valor-total')?.value) || 0;
  const sinal = parseFloat(document.getElementById('modal-sinal')?.value) || 0;
  const aReceber = parseFloat(document.getElementById('modal-a-receber')?.value) || 0;
  
  const restante = Math.max(0, total - sinal - aReceber);
  const elRestante = document.getElementById('modal-restante');
  if (elRestante) elRestante.value = restante.toFixed(2);

  const elSituacao = document.getElementById('modal-situacao');
  if (elSituacao && elSituacao.value !== 'Cancelado') {
    elSituacao.value = aReceber > 0 ? 'Pendente' : 'Concluído';
  }
}

// Renderiza todas as seções
function renderAll() {
  renderKPIs();
  renderCharts();
  renderAtendimentosTable();
  renderDespesasTable();
  renderOutrosTable();
  renderPessoalTable();
  renderMetasCard();
  populateProcedimentosSelect();
}

// Filtra registros por mês e ano (Imune a fuso horário)
function filterByPeriod(items) {
  if (!items || !Array.isArray(items)) return [];
  return items.filter(item => {
    const rawDate = item.data;
    if (!rawDate) return false;
    const p = parseDateParts(rawDate);
    if (!p) return false;

    if (p.year !== state.selectedYear) return false;
    if (state.selectedMonth !== 'all' && p.month !== state.selectedMonth) return false;
    return true;
  });
}

// Formatação Monetária BRL
function formatBRL(val) {
  const num = parseFloat(val) || 0;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Renderiza os Cards Principais (KPIs)
function renderKPIs() {
  const atendimentos = filterByPeriod(state.data.atendimentos || []);
  const despesas = filterByPeriod(state.data.despesas || []);
  const outros = filterByPeriod(state.data.outros || []);
  const pessoal = filterByPeriod(state.data.pessoal || []);
  const metas = state.data.metas || { faturamento: 5000, limitePessoal: 2500 };

  // 1. Faturamento Total Real (Valor Total dos Atendimentos)
  let faturamentoTotal = 0;
  let recebidoEfetivo = 0;
  let totalAReceber = 0;

  atendimentos.forEach(a => {
    if (a.situacao === 'Cancelado') return;
    faturamentoTotal += a.valorTotal;
    recebidoEfetivo += a.recebido;
    totalAReceber += a.aReceber;
  });

  // 2. Receitas Extras / Avulsas
  const totalOutros = outros.reduce((acc, o) => acc + o.valor, 0);

  // Faturamento Geral da Empresa (Atendimentos + Avulsas)
  const faturamentoGeral = faturamentoTotal + totalOutros;

  // 3. Despesas da Empresa
  const totalDespesas = despesas.reduce((acc, d) => acc + d.valor, 0);

  // 4. Lucro Líquido Operacional
  const lucroOperacional = faturamentoGeral - totalDespesas;
  const margemLucro = faturamentoGeral > 0 ? (lucroOperacional / faturamentoGeral) * 100 : 0;

  // 5. Finanças Pessoais
  let receitasPessoais = 0;
  let despesasPessoais = 0;
  let retiradasEmpresa = 0;

  pessoal.forEach(p => {
    const val = p.valor;
    const tipo = (p.tipo || '').toLowerCase();
    const cat = (p.categoria || '').toLowerCase();

    if (tipo === 'receita') {
      receitasPessoais += val;
      if (cat.includes('retirada') || cat.includes('empresa') || cat.includes('pro-labore')) {
        retiradasEmpresa += val;
      }
    } else {
      despesasPessoais += val;
    }
  });

  const saldoPessoal = receitasPessoais - despesasPessoais;

  // Atualizar elementos no DOM
  setText('kpi-faturamento', formatBRL(faturamentoGeral));
  setText('kpi-atendimentos-qtd', `${atendimentos.length} atendimentos`);
  setText('kpi-recebido-caixa', formatBRL(recebidoEfetivo + totalOutros));
  setText('kpi-a-receber', formatBRL(totalAReceber));
  setText('kpi-despesas-empresa', formatBRL(totalDespesas));
  setText('kpi-lucro-empresa', formatBRL(lucroOperacional));
  setText('kpi-margem-lucro', `${margemLucro.toFixed(1)}% margem`);
  
  setText('kpi-retirada-empresa', formatBRL(retiradasEmpresa));
  setText('kpi-gastos-pessoais', formatBRL(despesasPessoais));
  setText('kpi-saldo-pessoal', formatBRL(saldoPessoal));

  // Progresso da Meta de Faturamento
  const metaFat = parseFloat(metas.faturamento) || 5000;
  const progressoMeta = Math.min(100, Math.round((faturamentoGeral / metaFat) * 100));
  setText('meta-faturamento-pct', `${progressoMeta}%`);
  setText('meta-faturamento-alvo', `Meta: ${formatBRL(metaFat)}`);
  const barraMeta = document.getElementById('meta-faturamento-bar');
  if (barraMeta) barraMeta.style.width = `${progressoMeta}%`;

  // Banner do Mês Selecionado
  const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const txtPeriodo = state.selectedMonth === 'all' 
    ? `Ano Completo de ${state.selectedYear}` 
    : `${nomesMeses[state.selectedMonth - 1]} de ${state.selectedYear}`;
  setText('label-periodo-atual', txtPeriodo);
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.innerText = text;
}

// Renderiza a Tabela e os Cards Mobile de Atendimentos
function renderAtendimentosTable() {
  const tbody = document.getElementById('tbody-atendimentos');
  const cards = document.getElementById('cards-atendimentos');
  if (!tbody && !cards) return;

  let list = filterByPeriod(state.data.atendimentos || []);

  // Filtros de busca e selects
  if (state.filters.search) {
    list = list.filter(a => {
      const cliente = a.cliente.toLowerCase();
      const servico = a.servico.toLowerCase();
      return cliente.includes(state.filters.search) || servico.includes(state.filters.search);
    });
  }

  if (state.filters.status !== 'all') {
    list = list.filter(a => a.situacao.toLowerCase() === state.filters.status.toLowerCase());
  }

  if (state.filters.payment !== 'all') {
    list = list.filter(a => a.formaPagamento.toLowerCase().includes(state.filters.payment.toLowerCase()));
  }

  if (list.length === 0) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="9" class="text-center py-8 text-gray-400 font-light">Nenhum atendimento encontrado para o período ou filtro selecionado.</td></tr>`;
    if (cards) cards.innerHTML = `<div class="card-lux p-8 text-center text-gray-400 font-light text-sm">Nenhum atendimento encontrado para o período ou filtro selecionado.</div>`;
    return;
  }

  // 1. Tabela Desktop
  if (tbody) {
    tbody.innerHTML = list.map((a, idx) => {
      const dataFmt = formatDateBR(a.data);
      const badgeStatus = a.situacao === 'Concluído' 
        ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Concluído</span>'
        : a.situacao === 'Pendente'
        ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">Pendente</span>'
        : '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">Cancelado</span>';

      return `
        <tr class="transition-colors hover:bg-rose-50/20">
          <td class="font-medium text-xs text-gray-500 whitespace-nowrap">${dataFmt}</td>
          <td class="font-semibold text-gray-800">${a.cliente}</td>
          <td class="text-gray-700 font-medium">${a.servico}</td>
          <td class="font-bold text-gray-900">${formatBRL(a.valorTotal)}</td>
          <td class="text-xs text-gray-600">
            ${a.sinal > 0 ? `<span class="badge-gold px-2 py-0.5 rounded font-medium text-[11px] block w-fit mb-0.5">Sinal: ${formatBRL(a.sinal)}</span>` : ''}
            <span>Restante: ${formatBRL(a.restante)}</span>
          </td>
          <td class="font-medium ${a.aReceber > 0 ? 'text-amber-600 font-bold' : 'text-gray-400'}">${formatBRL(a.aReceber)}</td>
          <td class="text-xs text-gray-600">
            <span class="inline-block px-2 py-0.5 bg-gray-100 rounded text-gray-700 font-medium">${a.formaPagamento}</span>
            ${a.parcelas && a.parcelas !== 'À vista' ? `<span class="text-[10px] text-gray-400 block mt-0.5">${a.parcelas}</span>` : ''}
          </td>
          <td>${badgeStatus}</td>
          <td class="text-right whitespace-nowrap">
            <button onclick="openEditAtendimento(${idx})" class="text-gray-400 hover:text-[#C5A059] transition-colors p-1 mr-1.5" title="Editar Atendimento">
              <i class="fa-regular fa-pen-to-square"></i>
            </button>
            <button onclick="deleteItem('Atendimentos', ${a._rowIndex || idx})" class="text-gray-400 hover:text-rose-500 transition-colors p-1" title="Excluir">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // 2. Cards Mobile Exclusivos (Sem rolagem lateral)
  if (cards) {
    cards.innerHTML = list.map((a, idx) => {
      const dataFmt = formatDateBR(a.data);
      const badgeStatus = a.situacao === 'Concluído' 
        ? '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Concluído</span>'
        : a.situacao === 'Pendente'
        ? '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">Pendente</span>'
        : '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">Cancelado</span>';

      return `
        <div class="card-lux mobile-card p-4 space-y-3">
          <div class="flex items-start justify-between gap-2">
            <div>
              <span class="text-[11px] text-gray-400 font-medium block">${dataFmt}</span>
              <h4 class="font-bold text-gray-900 text-sm mt-0.5 leading-snug">${a.cliente}</h4>
            </div>
            <div>${badgeStatus}</div>
          </div>

          <div class="flex items-center gap-2 text-xs text-gray-700 bg-stone-50 px-3 py-1.5 rounded-xl border border-black/5">
            <i class="fa-solid fa-sparkles text-[#C5A059] text-[10px]"></i>
            <span class="font-medium">${a.servico}</span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-xs">
            <div class="bg-stone-50/80 p-2.5 rounded-xl border border-black/5">
              <span class="text-[10px] text-gray-400 uppercase font-semibold block">Valor Total</span>
              <span class="font-bold text-gray-900 text-sm">${formatBRL(a.valorTotal)}</span>
            </div>
            <div class="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
              <span class="text-[10px] text-emerald-700 uppercase font-semibold block">Recebido</span>
              <span class="font-bold text-emerald-700 text-sm">${formatBRL(a.recebido)}</span>
              ${a.sinal > 0 ? `<span class="text-[10px] text-amber-700 block font-medium">(Sinal ${formatBRL(a.sinal)})</span>` : ''}
            </div>
          </div>

          ${a.aReceber > 0 ? `
            <div class="flex items-center justify-between text-xs bg-amber-50 px-3 py-2 rounded-xl border border-amber-200">
              <span class="font-semibold text-amber-800">A Receber:</span>
              <span class="font-bold text-amber-800">${formatBRL(a.aReceber)}</span>
            </div>
          ` : ''}

          <div class="flex items-center justify-between pt-2 border-t border-black/5 text-xs">
            <div class="text-gray-500 text-[11px]">
              <span class="px-2 py-0.5 bg-gray-100 rounded text-gray-700 font-medium">${a.formaPagamento}</span>
              ${a.parcelas && a.parcelas !== 'À vista' ? `<span class="text-gray-400 ml-1">(${a.parcelas})</span>` : ''}
            </div>
            <div class="flex items-center gap-2">
              <button onclick="openEditAtendimento(${idx})" class="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-[#C5A059] font-semibold text-xs flex items-center gap-1.5 transition-colors">
                <i class="fa-regular fa-pen-to-square"></i> Editar
              </button>
              <button onclick="deleteItem('Atendimentos', ${a._rowIndex || idx})" class="p-1.5 text-gray-400 hover:text-rose-500 transition-colors" title="Excluir">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
}

// Renderiza a Tabela e os Cards Mobile de Despesas da Empresa
function renderDespesasTable() {
  const tbody = document.getElementById('tbody-despesas');
  const cards = document.getElementById('cards-despesas');
  if (!tbody && !cards) return;

  const list = filterByPeriod(state.data.despesas || []);
  if (list.length === 0) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-gray-400 font-light">Nenhuma despesa registrada para este período.</td></tr>`;
    if (cards) cards.innerHTML = `<div class="card-lux p-8 text-center text-gray-400 font-light text-sm">Nenhuma despesa registrada para este período.</div>`;
    return;
  }

  // 1. Tabela Desktop
  if (tbody) {
    tbody.innerHTML = list.map((d, idx) => {
      const dataFmt = formatDateBR(d.data);

      return `
        <tr class="hover:bg-rose-50/20 transition-colors">
          <td class="text-xs text-gray-500 whitespace-nowrap">${dataFmt}</td>
          <td><span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700">${d.categoria}</span></td>
          <td class="text-gray-800 font-medium">${d.descricao}</td>
          <td class="font-bold text-rose-600">${formatBRL(d.valor)}</td>
          <td class="text-xs text-gray-600">${d.formaPagamento} ${d.parcelas && d.parcelas !== 'À vista' ? `(${d.parcelas})` : ''}</td>
          <td class="text-right whitespace-nowrap">
            <button onclick="openEditDespesa(${idx})" class="text-gray-400 hover:text-[#C5A059] transition-colors p-1 mr-1.5" title="Editar Despesa">
              <i class="fa-regular fa-pen-to-square"></i>
            </button>
            <button onclick="deleteItem('Despesas', ${d._rowIndex || idx})" class="text-gray-400 hover:text-rose-500 transition-colors p-1" title="Excluir">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // 2. Cards Mobile
  if (cards) {
    cards.innerHTML = list.map((d, idx) => {
      const dataFmt = formatDateBR(d.data);

      return `
        <div class="card-lux mobile-card p-4 space-y-2.5">
          <div class="flex items-start justify-between gap-2">
            <div>
              <span class="text-[11px] text-gray-400 font-medium block">${dataFmt}</span>
              <h4 class="font-bold text-gray-800 text-sm mt-0.5">${d.descricao}</h4>
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700 whitespace-nowrap">${d.categoria}</span>
          </div>

          <div class="flex items-center justify-between pt-1">
            <div>
              <span class="text-[10px] text-gray-400 uppercase font-semibold block">Valor Pago</span>
              <span class="font-bold text-rose-600 text-base">${formatBRL(d.valor)}</span>
            </div>
            <div class="text-right text-xs text-gray-500 font-medium">
              <span class="px-2 py-0.5 bg-gray-100 rounded text-gray-700">${d.formaPagamento}</span>
              ${d.parcelas && d.parcelas !== 'À vista' ? `<span class="text-gray-400 block text-[10px] mt-0.5">${d.parcelas}</span>` : ''}
            </div>
          </div>

          ${d.observacoes ? `<p class="text-xs text-gray-500 bg-stone-50 p-2 rounded-lg border border-black/5 italic">${d.observacoes}</p>` : ''}

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-black/5">
            <button onclick="openEditDespesa(${idx})" class="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-[#C5A059] font-semibold text-xs flex items-center gap-1.5 transition-colors">
              <i class="fa-regular fa-pen-to-square"></i> Editar
            </button>
            <button onclick="deleteItem('Despesas', ${d._rowIndex || idx})" class="p-1.5 text-gray-400 hover:text-rose-500 transition-colors" title="Excluir">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }
}

// Renderiza a Tabela e os Cards Mobile de Receitas Extras / Avulsas
function renderOutrosTable() {
  const tbody = document.getElementById('tbody-outros');
  const cards = document.getElementById('cards-outros');
  if (!tbody && !cards) return;

  const list = filterByPeriod(state.data.outros || []);
  if (list.length === 0) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-gray-400 font-light">Nenhuma receita extra registrada para este período.</td></tr>`;
    if (cards) cards.innerHTML = `<div class="card-lux p-8 text-center text-gray-400 font-light text-sm">Nenhuma receita extra registrada para este período.</div>`;
    return;
  }

  // 1. Tabela Desktop
  if (tbody) {
    tbody.innerHTML = list.map((o, idx) => {
      const dataFmt = formatDateBR(o.data);

      return `
        <tr class="hover:bg-rose-50/20 transition-colors">
          <td class="text-xs text-gray-500 whitespace-nowrap">${dataFmt}</td>
          <td class="font-medium text-gray-800">${o.descricao}</td>
          <td class="font-bold text-emerald-600">${formatBRL(o.valor)}</td>
          <td class="text-xs text-gray-500">${o.observacoes}</td>
          <td class="text-right whitespace-nowrap">
            <button onclick="openEditReceitaExtra(${idx})" class="text-gray-400 hover:text-[#C5A059] transition-colors p-1 mr-1.5" title="Editar Receita Extra">
              <i class="fa-regular fa-pen-to-square"></i>
            </button>
            <button onclick="deleteItem('Outros', ${o._rowIndex || idx})" class="text-gray-400 hover:text-rose-500 transition-colors p-1" title="Excluir">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // 2. Cards Mobile
  if (cards) {
    cards.innerHTML = list.map((o, idx) => {
      const dataFmt = formatDateBR(o.data);

      return `
        <div class="card-lux mobile-card p-4 space-y-2.5">
          <div class="flex items-start justify-between gap-2">
            <div>
              <span class="text-[11px] text-gray-400 font-medium block">${dataFmt}</span>
              <h4 class="font-bold text-gray-800 text-sm mt-0.5">${o.descricao}</h4>
            </div>
            <div class="text-right">
              <span class="text-[10px] text-gray-400 uppercase font-semibold block">Valor Recebido</span>
              <span class="font-bold text-emerald-600 text-base">${formatBRL(o.valor)}</span>
            </div>
          </div>

          ${o.observacoes ? `<p class="text-xs text-gray-500 bg-stone-50 p-2 rounded-lg border border-black/5">${o.observacoes}</p>` : ''}

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-black/5">
            <button onclick="openEditReceitaExtra(${idx})" class="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-[#C5A059] font-semibold text-xs flex items-center gap-1.5 transition-colors">
              <i class="fa-regular fa-pen-to-square"></i> Editar
            </button>
            <button onclick="deleteItem('Outros', ${o._rowIndex || idx})" class="p-1.5 text-gray-400 hover:text-rose-500 transition-colors" title="Excluir">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }
}

// Renderiza a Tabela e os Cards Mobile de Finanças Pessoais
function renderPessoalTable() {
  const tbody = document.getElementById('tbody-pessoal');
  const cards = document.getElementById('cards-pessoal');
  if (!tbody && !cards) return;

  const list = filterByPeriod(state.data.pessoal || []);
  if (list.length === 0) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-gray-400 font-light">Nenhum lançamento pessoal registrado para este período.</td></tr>`;
    if (cards) cards.innerHTML = `<div class="card-lux p-8 text-center text-gray-400 font-light text-sm">Nenhum lançamento pessoal registrado para este período.</div>`;
    return;
  }

  // 1. Tabela Desktop
  if (tbody) {
    tbody.innerHTML = list.map((p, idx) => {
      const dataFmt = formatDateBR(p.data);
      const isReceita = (p.tipo || '').toLowerCase() === 'receita';
      const badgeTipo = isReceita
        ? '<span class="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">Entrada / Pró-labore</span>'
        : '<span class="px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800">Gasto Pessoal</span>';

      return `
        <tr class="hover:bg-rose-50/20 transition-colors">
          <td class="text-xs text-gray-500 whitespace-nowrap">${dataFmt}</td>
          <td>${badgeTipo}</td>
          <td><span class="text-xs font-medium text-gray-600">${p.categoria}</span></td>
          <td class="font-medium text-gray-800">${p.descricao}</td>
          <td class="font-bold ${isReceita ? 'text-emerald-600' : 'text-gray-800'}">${formatBRL(p.valor)}</td>
          <td class="text-right whitespace-nowrap">
            <button onclick="openEditPessoal(${idx})" class="text-gray-400 hover:text-[#C5A059] transition-colors p-1 mr-1.5" title="Editar Lançamento Pessoal">
              <i class="fa-regular fa-pen-to-square"></i>
            </button>
            <button onclick="deleteItem('Pessoal', ${p._rowIndex || idx})" class="text-gray-400 hover:text-rose-500 transition-colors p-1" title="Excluir">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // 2. Cards Mobile
  if (cards) {
    cards.innerHTML = list.map((p, idx) => {
      const dataFmt = formatDateBR(p.data);
      const isReceita = (p.tipo || '').toLowerCase() === 'receita';
      const badgeTipo = isReceita
        ? '<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">Entrada / Pró-labore</span>'
        : '<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800">Gasto Pessoal</span>';

      return `
        <div class="card-lux mobile-card p-4 space-y-2.5">
          <div class="flex items-start justify-between gap-2">
            <div>
              <span class="text-[11px] text-gray-400 font-medium block">${dataFmt}</span>
              <h4 class="font-bold text-gray-800 text-sm mt-0.5">${p.descricao}</h4>
              <span class="text-xs text-gray-500 font-medium">${p.categoria}</span>
            </div>
            <div class="text-right">
              ${badgeTipo}
              <span class="font-bold ${isReceita ? 'text-emerald-600' : 'text-gray-800'} text-base block mt-1">${formatBRL(p.valor)}</span>
            </div>
          </div>

          ${p.observacoes ? `<p class="text-xs text-gray-400 italic bg-stone-50 p-2 rounded-lg border border-black/5">${p.observacoes}</p>` : ''}

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-black/5">
            <button onclick="openEditPessoal(${idx})" class="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-[#C5A059] font-semibold text-xs flex items-center gap-1.5 transition-colors">
              <i class="fa-regular fa-pen-to-square"></i> Editar
            </button>
            <button onclick="deleteItem('Pessoal', ${p._rowIndex || idx})" class="p-1.5 text-gray-400 hover:text-rose-500 transition-colors" title="Excluir">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }
}

// Renderiza Metas e Planejamento
function renderMetasCard() {
  const metas = state.data.metas || { faturamento: 5000, reserva: 10000, limitePessoal: 2500 };
  
  const elFat = document.getElementById('input-meta-fat');
  const elRes = document.getElementById('input-meta-res');
  const elLim = document.getElementById('input-meta-lim');

  if (elFat) elFat.value = metas.faturamento;
  if (elRes) elRes.value = metas.reserva;
  if (elLim) elLim.value = metas.limitePessoal;
}

// Renderiza os Gráficos com Chart.js
function renderCharts() {
  if (typeof Chart === 'undefined') return;

  renderChartEvolucao();
  renderChartProcedimentos();
  renderChartPagamentos();
}

// Gráfico 1: Evolução de Faturamento vs Despesas no Ano
function renderChartEvolucao() {
  const ctx = document.getElementById('chart-evolucao')?.getContext('2d');
  if (!ctx) return;

  const mesesLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const fatMensal = new Array(12).fill(0);
  const despMensal = new Array(12).fill(0);

  (state.data.atendimentos || []).forEach(a => {
    if (a.situacao === 'Cancelado') return;
    const p = parseDateParts(a.data);
    if (p && p.year === state.selectedYear) {
      fatMensal[p.month - 1] += a.valorTotal;
    }
  });

  (state.data.outros || []).forEach(o => {
    const p = parseDateParts(o.data);
    if (p && p.year === state.selectedYear) {
      fatMensal[p.month - 1] += o.valor;
    }
  });

  (state.data.despesas || []).forEach(d => {
    const p = parseDateParts(d.data);
    if (p && p.year === state.selectedYear) {
      despMensal[p.month - 1] += d.valor;
    }
  });

  if (state.charts.evolucao) state.charts.evolucao.destroy();

  state.charts.evolucao = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: mesesLabels,
      datasets: [
        {
          label: 'Faturamento',
          data: fatMensal,
          backgroundColor: '#D4888C',
          borderRadius: 8,
          barPercentage: 0.6
        },
        {
          label: 'Despesas',
          data: despMensal,
          backgroundColor: '#E5D6C5',
          borderRadius: 8,
          barPercentage: 0.6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { font: { family: 'Montserrat', size: 12 } } },
        tooltip: {
          callbacks: {
            label: (item) => `${item.dataset.label}: ${formatBRL(item.raw)}`
          }
        }
      },
      scales: {
        x: { grid: { display: false } },
        y: {
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: {
            callback: (v) => 'R$ ' + v
          }
        }
      }
    }
  });
}

// Gráfico 2: Mix de Procedimentos Mais Lucrativos
function renderChartProcedimentos() {
  const ctx = document.getElementById('chart-procedimentos')?.getContext('2d');
  if (!ctx) return;

  const atendimentos = filterByPeriod(state.data.atendimentos || []);
  const procedimentosMap = {};

  atendimentos.forEach(a => {
    if (a.situacao === 'Cancelado') return;
    const servico = a.servico || 'Outros';
    procedimentosMap[servico] = (procedimentosMap[servico] || 0) + a.valorTotal;
  });

  const labels = Object.keys(procedimentosMap);
  const dataVals = Object.values(procedimentosMap);

  const colors = ['#D4888C', '#C5A059', '#3D3A39', '#E0A899', '#8C7262', '#B9A18D', '#9A8272'];

  if (state.charts.procedimentos) state.charts.procedimentos.destroy();

  state.charts.procedimentos = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels.length ? labels : ['Nenhum dado'],
      datasets: [{
        data: dataVals.length ? dataVals : [1],
        backgroundColor: colors.slice(0, labels.length || 1),
        borderWidth: 2,
        borderColor: '#FFFFFF'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 12, font: { family: 'Montserrat', size: 11 } } },
        tooltip: {
          callbacks: {
            label: (item) => `${item.label}: ${formatBRL(item.raw)}`
          }
        }
      }
    }
  });
}

// Gráfico 3: Formas de Pagamento
function renderChartPagamentos() {
  const ctx = document.getElementById('chart-pagamentos')?.getContext('2d');
  if (!ctx) return;

  const atendimentos = filterByPeriod(state.data.atendimentos || []);
  const pagtosMap = { 'Pix': 0, 'Crédito': 0, 'Débito': 0, 'Dinheiro': 0 };

  atendimentos.forEach(a => {
    const pagto = a.formaPagamento || 'Pix';
    if (pagto.includes('Pix')) pagtosMap['Pix'] += a.valorTotal;
    else if (pagto.includes('Crédito')) pagtosMap['Crédito'] += a.valorTotal;
    else if (pagto.includes('Débito')) pagtosMap['Débito'] += a.valorTotal;
    else pagtosMap['Dinheiro'] += a.valorTotal;
  });

  const labels = Object.keys(pagtosMap).filter(k => pagtosMap[k] > 0);
  const dataVals = labels.map(k => pagtosMap[k]);

  if (state.charts.pagamentos) state.charts.pagamentos.destroy();

  state.charts.pagamentos = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels.length ? labels : ['Nenhum dado'],
      datasets: [{
        data: dataVals.length ? dataVals : [1],
        backgroundColor: ['#D4888C', '#C5A059', '#635B57', '#93C5FD'],
        borderWidth: 2,
        borderColor: '#FFFFFF'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 12, font: { family: 'Montserrat', size: 11 } } },
        tooltip: {
          callbacks: {
            label: (item) => `${item.label}: ${formatBRL(item.raw)}`
          }
        }
      }
    }
  });
}

// ==============================================================================
// MODAIS, CRIAÇÃO E EDIÇÃO DE DADOS
// ==============================================================================

function openModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) {
    el.classList.remove('hidden');
    el.classList.add('flex');
  }
}

function closeModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) {
    el.classList.add('hidden');
    el.classList.remove('flex');
  }
}

// --- ATENDIMENTOS: NOVO E EDITAR ---
function openNewAtendimento() {
  populateProcedimentosSelect();
  document.getElementById('modal-atend-rowindex').value = '';
  document.getElementById('modal-atend-title').innerText = 'Novo Atendimento';
  document.getElementById('modal-atend-submit-btn').innerText = 'Salvar Atendimento';
  
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('modal-data').value = today;
  document.getElementById('modal-cliente').value = '';
  document.getElementById('modal-servico').value = '';
  document.getElementById('modal-servico-select').value = '';
  document.getElementById('modal-valor-total').value = '';
  document.getElementById('modal-sinal').value = '30.00';
  document.getElementById('modal-restante').value = '';
  document.getElementById('modal-a-receber').value = '0.00';
  document.getElementById('modal-forma-pagto').value = 'Pix';
  document.getElementById('modal-parcelas').value = 'À vista';
  document.getElementById('modal-situacao').value = 'Concluído';
  document.getElementById('modal-observacoes').value = '';
  openModal('modal-novo-atendimento');
}

function openEditAtendimento(listIndex) {
  const list = filterByPeriod(state.data.atendimentos || []);
  const item = list[listIndex];
  if (!item) return;

  populateProcedimentosSelect();

  document.getElementById('modal-atend-rowindex').value = item._rowIndex;
  document.getElementById('modal-atend-title').innerText = 'Editar Atendimento';
  document.getElementById('modal-atend-submit-btn').innerText = 'Salvar Alterações';

  document.getElementById('modal-data').value = item.data;
  document.getElementById('modal-cliente').value = item.cliente;
  document.getElementById('modal-servico').value = item.servico;

  const select = document.getElementById('modal-servico-select');
  if (select) {
    const match = Array.from(select.options).find(opt => opt.value.toLowerCase() === (item.servico || '').toLowerCase());
    select.value = match ? match.value : '';
  }

  document.getElementById('modal-valor-total').value = item.valorTotal;
  document.getElementById('modal-sinal').value = item.sinal;
  document.getElementById('modal-restante').value = item.restante;
  document.getElementById('modal-a-receber').value = item.aReceber;
  document.getElementById('modal-forma-pagto').value = item.formaPagamento;
  document.getElementById('modal-parcelas').value = item.parcelas;
  document.getElementById('modal-situacao').value = item.situacao || (item.aReceber > 0 ? 'Pendente' : 'Concluído');
  document.getElementById('modal-observacoes').value = item.observacoes || '';

  openModal('modal-novo-atendimento');
}

async function submitAtendimento(event) {
  event.preventDefault();

  const rowIndex = document.getElementById('modal-atend-rowindex').value;
  const dataVal = document.getElementById('modal-data').value;
  const cliente = document.getElementById('modal-cliente').value;
  const servico = document.getElementById('modal-servico').value;
  const valorTotal = parseFloat(document.getElementById('modal-valor-total').value) || 0;
  const sinal = parseFloat(document.getElementById('modal-sinal').value) || 0;
  const restante = parseFloat(document.getElementById('modal-restante').value) || 0;
  const aReceber = parseFloat(document.getElementById('modal-a-receber').value) || 0;
  const formaPagto = document.getElementById('modal-forma-pagto').value;
  const parcelas = document.getElementById('modal-parcelas').value;
  const situacao = document.getElementById('modal-situacao')?.value || (aReceber > 0 ? 'Pendente' : 'Concluído');
  const observacoes = document.getElementById('modal-observacoes')?.value || '';

  const rawItem = {
    data: dataVal,
    cliente: cliente,
    servico: servico,
    valortotal: valorTotal,
    sinal: sinal,
    recebido: restante,
    areceber: aReceber,
    formadepagamento: formaPagto,
    parcelas: parcelas,
    situacao: situacao,
    observacoes: observacoes
  };

  const normalized = normalizeAtendimento(rawItem, 0);

  if (rowIndex) {
    normalized._rowIndex = parseInt(rowIndex, 10);
    const targetIdx = state.data.atendimentos.findIndex(a => String(a._rowIndex) === String(rowIndex));
    if (targetIdx !== -1) {
      state.data.atendimentos[targetIdx] = normalized;
    }
    showToast('Atendimento atualizado com sucesso!');
    if (state.apiUrl) {
      callGasApi('updateAtendimento', { rowIndex: rowIndex, ...rawItem });
    }
  } else {
    normalized._rowIndex = 2;
    state.data.atendimentos.unshift(normalized);
    showToast('Atendimento registrado com sucesso!');
    if (state.apiUrl) {
      callGasApi('addAtendimento', rawItem);
    }
  }

  saveLocalCache();
  closeModal('modal-novo-atendimento');
  renderAll();
}

// --- DESPESAS: NOVA E EDITAR ---
function openNewDespesa() {
  document.getElementById('modal-desp-rowindex').value = '';
  document.getElementById('modal-desp-title').innerText = 'Nova Despesa da Empresa';
  document.getElementById('modal-desp-submit-btn').innerText = 'Salvar Despesa';

  const today = new Date().toISOString().split('T')[0];
  document.getElementById('modal-desp-data').value = today;
  document.getElementById('modal-desp-cat').value = 'Materiais';
  document.getElementById('modal-desp-desc').value = '';
  document.getElementById('modal-desp-valor').value = '';
  document.getElementById('modal-desp-pagto').value = 'Pix';
  document.getElementById('modal-desp-parcelas').value = 'À vista';
  document.getElementById('modal-desp-obs').value = '';
  openModal('modal-nova-despesa');
}

function openEditDespesa(listIndex) {
  const list = filterByPeriod(state.data.despesas || []);
  const item = list[listIndex];
  if (!item) return;

  document.getElementById('modal-desp-rowindex').value = item._rowIndex;
  document.getElementById('modal-desp-title').innerText = 'Editar Despesa';
  document.getElementById('modal-desp-submit-btn').innerText = 'Salvar Alterações';

  document.getElementById('modal-desp-data').value = item.data;
  document.getElementById('modal-desp-cat').value = item.categoria;
  document.getElementById('modal-desp-desc').value = item.descricao;
  document.getElementById('modal-desp-valor').value = item.valor;
  document.getElementById('modal-desp-pagto').value = item.formaPagamento;
  document.getElementById('modal-desp-parcelas').value = item.parcelas;
  document.getElementById('modal-desp-obs').value = item.observacoes || '';

  openModal('modal-nova-despesa');
}

async function submitDespesa(event) {
  event.preventDefault();

  const rowIndex = document.getElementById('modal-desp-rowindex').value;
  const dataVal = document.getElementById('modal-desp-data').value;
  const categoria = document.getElementById('modal-desp-cat').value;
  const descricao = document.getElementById('modal-desp-desc').value;
  const valor = parseFloat(document.getElementById('modal-desp-valor').value) || 0;
  const formaPagto = document.getElementById('modal-desp-pagto').value;
  const parcelas = document.getElementById('modal-desp-parcelas').value;
  const observacoes = document.getElementById('modal-desp-obs')?.value || '';

  const rawItem = {
    data: dataVal,
    categoria: categoria,
    descricao: descricao,
    valor: valor,
    formadepagamento: formaPagto,
    parcelas: parcelas,
    observacoes: observacoes
  };

  const normalized = normalizeDespesa(rawItem, 0);

  if (rowIndex) {
    normalized._rowIndex = parseInt(rowIndex, 10);
    const targetIdx = state.data.despesas.findIndex(d => String(d._rowIndex) === String(rowIndex));
    if (targetIdx !== -1) {
      state.data.despesas[targetIdx] = normalized;
    }
    showToast('Despesa atualizada com sucesso!');
    if (state.apiUrl) {
      callGasApi('updateDespesa', { rowIndex: rowIndex, ...rawItem });
    }
  } else {
    normalized._rowIndex = 2;
    state.data.despesas.unshift(normalized);
    showToast('Despesa registrada com sucesso!');
    if (state.apiUrl) {
      callGasApi('addDespesa', rawItem);
    }
  }

  saveLocalCache();
  closeModal('modal-nova-despesa');
  renderAll();
}

// --- RECEITAS EXTRAS: NOVA E EDITAR ---
function openNewReceitaExtra() {
  document.getElementById('modal-extra-rowindex').value = '';
  document.getElementById('modal-extra-title').innerText = 'Nova Receita Extra';
  document.getElementById('modal-extra-submit-btn').innerText = 'Salvar Receita';

  const today = new Date().toISOString().split('T')[0];
  document.getElementById('modal-extra-data').value = today;
  document.getElementById('modal-extra-desc').value = '';
  document.getElementById('modal-extra-valor').value = '';
  document.getElementById('modal-extra-obs').value = '';
  openModal('modal-nova-receita-extra');
}

function openEditReceitaExtra(listIndex) {
  const list = filterByPeriod(state.data.outros || []);
  const item = list[listIndex];
  if (!item) return;

  document.getElementById('modal-extra-rowindex').value = item._rowIndex;
  document.getElementById('modal-extra-title').innerText = 'Editar Receita Extra';
  document.getElementById('modal-extra-submit-btn').innerText = 'Salvar Alterações';

  document.getElementById('modal-extra-data').value = item.data;
  document.getElementById('modal-extra-desc').value = item.descricao;
  document.getElementById('modal-extra-valor').value = item.valor;
  document.getElementById('modal-extra-obs').value = item.observacoes || '';

  openModal('modal-nova-receita-extra');
}

async function submitReceitaExtra(event) {
  event.preventDefault();

  const rowIndex = document.getElementById('modal-extra-rowindex').value;
  const dataVal = document.getElementById('modal-extra-data').value;
  const descricao = document.getElementById('modal-extra-desc').value;
  const valor = parseFloat(document.getElementById('modal-extra-valor').value) || 0;
  const obs = document.getElementById('modal-extra-obs')?.value || '';

  const rawItem = {
    data: dataVal,
    descricao: descricao,
    valorrecebido: valor,
    observacoes: obs
  };

  const normalized = normalizeOutro(rawItem, 0);

  if (rowIndex) {
    normalized._rowIndex = parseInt(rowIndex, 10);
    const targetIdx = state.data.outros.findIndex(o => String(o._rowIndex) === String(rowIndex));
    if (targetIdx !== -1) {
      state.data.outros[targetIdx] = normalized;
    }
    showToast('Receita extra atualizada!');
    if (state.apiUrl) {
      callGasApi('updateReceitaAvulsa', { rowIndex: rowIndex, ...rawItem });
    }
  } else {
    normalized._rowIndex = 2;
    state.data.outros.unshift(normalized);
    showToast('Receita extra registrada com sucesso!');
    if (state.apiUrl) {
      callGasApi('addReceitaAvulsa', rawItem);
    }
  }

  saveLocalCache();
  closeModal('modal-nova-receita-extra');
  renderAll();
}

// --- FINANÇAS PESSOAIS: NOVO E EDITAR ---
function openNewPessoal() {
  document.getElementById('modal-pess-rowindex').value = '';
  document.getElementById('modal-pess-title').innerText = 'Lançamento Pessoal (PF)';
  document.getElementById('modal-pess-submit-btn').innerText = 'Salvar';

  const today = new Date().toISOString().split('T')[0];
  document.getElementById('modal-pess-data').value = today;
  document.getElementById('modal-pess-tipo').value = 'Despesa';
  document.getElementById('modal-pess-cat').value = 'Moradia';
  document.getElementById('modal-pess-desc').value = '';
  document.getElementById('modal-pess-valor').value = '';
  document.getElementById('modal-pess-obs').value = '';
  openModal('modal-novo-pessoal');
}

function openEditPessoal(listIndex) {
  const list = filterByPeriod(state.data.pessoal || []);
  const item = list[listIndex];
  if (!item) return;

  document.getElementById('modal-pess-rowindex').value = item._rowIndex;
  document.getElementById('modal-pess-title').innerText = 'Editar Lançamento Pessoal';
  document.getElementById('modal-pess-submit-btn').innerText = 'Salvar Alterações';

  document.getElementById('modal-pess-data').value = item.data;
  document.getElementById('modal-pess-tipo').value = item.tipo;
  document.getElementById('modal-pess-cat').value = item.categoria;
  document.getElementById('modal-pess-desc').value = item.descricao;
  document.getElementById('modal-pess-valor').value = item.valor;
  document.getElementById('modal-pess-obs').value = item.observacoes || '';

  openModal('modal-novo-pessoal');
}

async function submitPessoal(event) {
  event.preventDefault();

  const rowIndex = document.getElementById('modal-pess-rowindex').value;
  const dataVal = document.getElementById('modal-pess-data').value;
  const tipo = document.getElementById('modal-pess-tipo').value;
  const categoria = document.getElementById('modal-pess-cat').value;
  const descricao = document.getElementById('modal-pess-desc').value;
  const valor = parseFloat(document.getElementById('modal-pess-valor').value) || 0;
  const obs = document.getElementById('modal-pess-obs')?.value || '';

  const rawItem = {
    data: dataVal,
    tipo: tipo,
    categoria: categoria,
    descricao: descricao,
    valor: valor,
    observacoes: obs
  };

  const normalized = normalizePessoal(rawItem, 0);

  if (rowIndex) {
    normalized._rowIndex = parseInt(rowIndex, 10);
    const targetIdx = state.data.pessoal.findIndex(p => String(p._rowIndex) === String(rowIndex));
    if (targetIdx !== -1) {
      state.data.pessoal[targetIdx] = normalized;
    }
    showToast('Lançamento pessoal atualizado!');
    if (state.apiUrl) {
      callGasApi('updatePessoal', { rowIndex: rowIndex, ...rawItem });
    }
  } else {
    normalized._rowIndex = 2;
    state.data.pessoal.unshift(normalized);
    showToast('Lançamento pessoal registrado!');
    if (state.apiUrl) {
      callGasApi('addPessoal', rawItem);
    }
  }

  saveLocalCache();
  closeModal('modal-novo-pessoal');
  renderAll();
}

// Submissão de Pró-labore
async function submitProLabore(event) {
  event.preventDefault();

  const dataVal = document.getElementById('modal-pro-data').value;
  const valor = parseFloat(document.getElementById('modal-pro-valor').value) || 0;
  const obs = document.getElementById('modal-pro-obs')?.value || 'Retirada da empresa para conta pessoal';

  const rawItem = {
    data: dataVal,
    tipo: 'Receita',
    categoria: 'Retirada da empresa',
    descricao: 'Pró-labore / Retirada',
    valor: valor,
    observacoes: obs
  };

  const normalized = normalizePessoal(rawItem, 0);
  normalized._rowIndex = 2;

  state.data.pessoal.unshift(normalized);
  saveLocalCache();
  closeModal('modal-pro-labore');
  renderAll();
  showToast(`Pró-labore de ${formatBRL(valor)} transferido com sucesso!`);

  if (state.apiUrl) {
    callGasApi('retiradaProLabore', rawItem);
  }
}

// Atualização de Metas
function submitMetas(event) {
  event.preventDefault();

  const faturamento = parseFloat(document.getElementById('input-meta-fat').value) || 5000;
  const reserva = parseFloat(document.getElementById('input-meta-res').value) || 10000;
  const limitePessoal = parseFloat(document.getElementById('input-meta-lim').value) || 2500;

  state.data.metas = { faturamento, reserva, limitePessoal };
  saveLocalCache();
  renderKPIs();
  showToast('Metas financeiras salvas com sucesso!');

  if (state.apiUrl) {
    callGasApi('updateMetas', { faturamento, reserva, limitePessoal });
  }
}

// Exclusão de Item
function deleteItem(sheetType, rowIndex) {
  if (!confirm(`Deseja realmente excluir este lançamento?`)) return;

  const key = sheetType.toLowerCase();
  let list = state.data[key] || [];
  
  const targetIndex = list.findIndex((item, idx) => (item._rowIndex || idx) === rowIndex);
  if (targetIndex !== -1) {
    list.splice(targetIndex, 1);
    saveLocalCache();
    renderAll();
    showToast('Item excluído!');

    if (state.apiUrl) {
      callGasApi(`delete${sheetType}`, { rowIndex: rowIndex });
    }
  }
}

// ==============================================================================
// SINCRONIZAÇÃO COM GOOGLE APPS SCRIPT
// ==============================================================================

async function syncWithGoogleSheets(showNotification = true) {
  if (!state.apiUrl) {
    if (showNotification) showToast('Por favor, configure a URL do seu Apps Script na aba Configurações.');
    updateSyncBadge('local');
    return;
  }

  state.isSyncing = true;
  updateSyncBadge('syncing');

  try {
    const url = `${state.apiUrl}?action=getAllData&t=${Date.now()}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const result = await response.json();
    if (result.status === 'success' && result.data) {
      // Normaliza todos os dados recebidos da planilha
      state.data = normalizeFullDataset(result.data);
      saveLocalCache();
      renderAll();
      updateSyncBadge('connected');
      if (showNotification) showToast('Sincronizado com o Google Sheets com sucesso!');
    } else {
      throw new Error(result.message || 'Erro na resposta do Apps Script');
    }
  } catch (error) {
    console.warn('Erro ao sincronizar com Google Sheets:', error);
    updateSyncBadge('error');
    if (showNotification) {
      showToast('Não foi possível conectar ao Google Sheets. Usando dados locais.', 'warning');
    }
  } finally {
    state.isSyncing = false;
  }
}

// Chama a API do Apps Script
async function callGasApi(action, payload) {
  if (!state.apiUrl) return;

  try {
    const body = JSON.stringify({ action, ...payload });
    await fetch(state.apiUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: body
    });
  } catch (err) {
    console.warn(`Erro ao enviar ação ${action} para Apps Script:`, err);
  }
}

// Salva e Testa Conexão
function saveApiConfig() {
  const url = document.getElementById('config-api-url')?.value.trim();
  state.apiUrl = url;
  localStorage.setItem('bia_fin_api_url', url);
  showToast('URL salva com sucesso!');
  syncWithGoogleSheets(true);
}

async function testApiConnection() {
  const url = document.getElementById('config-api-url')?.value.trim();
  if (!url) {
    alert('Digite a URL do seu App da Web do Google Apps Script!');
    return;
  }

  const btn = document.getElementById('btn-test-api');
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Testando...';

  try {
    const resp = await fetch(`${url}?action=ping&t=${Date.now()}`);
    const data = await resp.json();
    if (data.status === 'success') {
      alert('🎉 Conexão estabelecida com sucesso com o Google Sheets!');
      saveApiConfig();
    } else {
      alert('⚠️ O script respondeu, mas retornou: ' + (data.message || 'Erro desconhecido'));
    }
  } catch (err) {
    alert('❌ Não foi possível se conectar à URL. Verifique se publicou como "Qualquer pessoa" e se copiou a URL correta!');
  } finally {
    btn.innerHTML = '<i class="fa-solid fa-bolt mr-2"></i> Testar Conexão';
  }
}

function updateSyncBadge(status) {
  const badge = document.getElementById('sync-status-badge');
  if (!badge) return;

  if (status === 'connected') {
    badge.className = 'inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200';
    badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 sm:mr-2 pulse-green"></span> <span class="hidden sm:inline">Conectado ao Google Sheets</span><span class="sm:hidden text-[11px]">Online</span>';
  } else if (status === 'syncing') {
    badge.className = 'inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200';
    badge.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1.5 sm:mr-2"></i> <span class="hidden sm:inline">Sincronizando...</span><span class="sm:hidden text-[11px]">Sync...</span>';
  } else if (status === 'error') {
    badge.className = 'inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 cursor-pointer';
    badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-rose-500 mr-1.5 sm:mr-2"></span> <span class="hidden sm:inline">Erro de Conexão (Verificar API)</span><span class="sm:hidden text-[11px]">Offline</span>';
  } else {
    badge.className = 'inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200 cursor-pointer';
    badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-stone-400 mr-1.5 sm:mr-2"></span> <span class="hidden sm:inline">Modo Demonstração (Local)</span><span class="sm:hidden text-[11px]">Demo</span>';
  }
}

function saveLocalCache() {
  localStorage.setItem('bia_fin_data', JSON.stringify(state.data));
}

// Notificação Flutuante (Toast)
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-[#1A1A1A] text-white border border-[#D4888C]/30' : 'bg-amber-800 text-white';
  
  toast.className = `${bgColor} px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-medium animate-fade-in transition-all`;
  toast.innerHTML = `
    <i class="fa-solid ${type === 'success' ? 'fa-check text-[#D4888C]' : 'fa-triangle-exclamation text-amber-300'}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

// Exportar CSV
function exportDataCSV() {
  const atendimentos = state.data.atendimentos || [];
  if (atendimentos.length === 0) {
    alert('Nenhum dado para exportar.');
    return;
  }

  const headers = ['Data', 'Cliente', 'Serviço', 'Valor Total', 'Sinal', 'Recebido', 'A Receber', 'Forma Pagamento', 'Parcelas', 'Situação'];
  const rows = atendimentos.map(a => [
    formatDateBR(a.data),
    `"${a.cliente}"`,
    `"${a.servico}"`,
    a.valorTotal,
    a.sinal,
    a.restante,
    a.aReceber,
    `"${a.formaPagamento}"`,
    `"${a.parcelas}"`,
    `"${a.situacao}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Financeiro_BiaLeal_${state.selectedYear}_${state.selectedMonth}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}
