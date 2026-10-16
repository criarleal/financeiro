/**
 * ==============================================================================
 * SISTEMA FINANCEIRO UNIVERSAL & MODULAR
 * Lógica do Cliente, Cálculos, Gráficos e Sincronização Supabase
 * ==============================================================================
 */

// Versão da Aplicação (Atualizada para Cache Busting - Padrão Mobile Catálogo de Serviços)
const APP_VERSION = '1.4.0';

// ==============================================================================
// PRESETS E ARQUITETURA MODULAR (SAAS UNIVERSAL)
// ==============================================================================
const PERFIS_PRESETS = {
  estetica: {
    id: 'estetica',
    nomePerfil: 'Estética & Beleza',
    appName: 'Studio de Estética & Beleza',
    appSubtitle: 'Gestão Financeira & Caixa',
    logoIcon: 'fa-sparkles',
    modules: {
      operacoes: true,
      empresa: true,
      pessoal: true,
      outros: true,
      metas: true
    },
    terms: {
      operacaoSingular: 'Atendimento',
      operacaoPlural: 'Atendimentos',
      clienteSingular: 'Cliente',
      clientePlural: 'Clientes',
      servicoSingular: 'Procedimento',
      custoNegocio: 'Despesas Empresa'
    },
    catalogo: [
      { nome: 'Design de sobrancelhas', valor: 55, sinal: 30 },
      { nome: 'Design com henna', valor: 75, sinal: 30 },
      { nome: 'Lash lifting', valor: 130, sinal: 30 },
      { nome: 'Brow lamination', valor: 145, sinal: 30 },
      { nome: 'Extensão de cílios', valor: 190, sinal: 30 },
      { nome: 'Manutenção de cílios', valor: 100, sinal: 30 },
      { nome: 'Micropigmentação labial', valor: 350, sinal: 50 },
      { nome: 'Micropigmentação sobrancelhas', valor: 450, sinal: 50 }
    ]
  },
  barbearia: {
    id: 'barbearia',
    nomePerfil: 'Barbearia',
    appName: 'Barbearia & Barber Shop',
    appSubtitle: 'Controle de Cortes & Caixa',
    logoIcon: 'fa-scissors',
    modules: {
      operacoes: true,
      empresa: false,
      pessoal: true,
      outros: true,
      metas: true
    },
    terms: {
      operacaoSingular: 'Corte',
      operacaoPlural: 'Cortes',
      clienteSingular: 'Cliente',
      clientePlural: 'Clientes',
      servicoSingular: 'Serviço',
      custoNegocio: 'Custos Barbearia'
    },
    catalogo: [
      { nome: 'Corte Degradê / Social', valor: 35, sinal: 0 },
      { nome: 'Barba Modelada / Terapia', valor: 25, sinal: 0 },
      { nome: 'Combo Corte + Barba', valor: 55, sinal: 0 },
      { nome: 'Pezinho / Acabamento', valor: 15, sinal: 0 },
      { nome: 'Sobrancelha na Navalha', valor: 15, sinal: 0 },
      { nome: 'Pigmentação de Barba', valor: 30, sinal: 0 }
    ]
  },
  manicure: {
    id: 'manicure',
    nomePerfil: 'Studio de Unhas',
    appName: 'Studio Unhas & Nail Design',
    appSubtitle: 'Gestão de Clientes & Caixa',
    logoIcon: 'fa-hand-dots',
    modules: {
      operacoes: true,
      empresa: false,
      pessoal: true,
      outros: true,
      metas: true
    },
    terms: {
      operacaoSingular: 'Atendimento',
      operacaoPlural: 'Atendimentos',
      clienteSingular: 'Cliente',
      clientePlural: 'Clientes',
      servicoSingular: 'Serviço de Unha',
      custoNegocio: 'Custos do Studio'
    },
    catalogo: [
      { nome: 'Manicure & Pedicure Simples', valor: 45, sinal: 0 },
      { nome: 'Alongamento em Gel / Fibra', valor: 130, sinal: 30 },
      { nome: 'Manutenção de Alongamento', valor: 75, sinal: 0 },
      { nome: 'Esmaltação em Gel', valor: 50, sinal: 0 },
      { nome: 'Blindagem de Unhas', valor: 60, sinal: 0 },
      { nome: 'Spa dos Pés', valor: 40, sinal: 0 }
    ]
  },
  pessoal: {
    id: 'pessoal',
    nomePerfil: '100% Pessoal',
    appName: 'Minhas Finanças Pessoais',
    appSubtitle: 'Gestão de Receitas, Contas & Metas',
    logoIcon: 'fa-wallet',
    modules: {
      operacoes: false,
      empresa: false,
      pessoal: true,
      outros: true,
      metas: true
    },
    terms: {
      operacaoSingular: 'Lançamento',
      operacaoPlural: 'Lançamentos',
      clienteSingular: 'Fonte / Pagador',
      clientePlural: 'Fontes',
      servicoSingular: 'Item',
      custoNegocio: 'Custos'
    },
    catalogo: []
  },
  empresa: {
    id: 'empresa',
    nomePerfil: '100% Empresa',
    appName: 'Gestão Financeira Empresarial',
    appSubtitle: 'Controle de Clientes, Custos & Caixa PJ',
    logoIcon: 'fa-building',
    modules: {
      operacoes: true,
      empresa: true,
      pessoal: false,
      outros: true,
      metas: true
    },
    terms: {
      operacaoSingular: 'Atendimento',
      operacaoPlural: 'Atendimentos',
      clienteSingular: 'Cliente',
      clientePlural: 'Clientes',
      servicoSingular: 'Serviço',
      custoNegocio: 'Despesas Empresa'
    },
    catalogo: [
      { nome: 'Prestação de Serviços / Consultoria', valor: 350, sinal: 100 },
      { nome: 'Contrato Mensal de Serviços PJ', valor: 1200, sinal: 300 },
      { nome: 'Projeto / Execução Corporativa', valor: 2500, sinal: 500 },
      { nome: 'Assessoria / Manutenção Especializada', valor: 800, sinal: 200 }
    ]
  },
  personalizado: {
    id: 'personalizado',
    nomePerfil: 'Sob Medida',
    appName: 'Painel Financeiro Sob Medida',
    appSubtitle: 'Gestão Financeira & Caixa Personalizável',
    logoIcon: 'fa-sliders',
    modules: {
      operacoes: true,
      empresa: true,
      pessoal: true,
      outros: true,
      metas: true
    },
    terms: {
      operacaoSingular: 'Atendimento',
      operacaoPlural: 'Atendimentos',
      clienteSingular: 'Cliente',
      clientePlural: 'Clientes',
      servicoSingular: 'Serviço',
      custoNegocio: 'Despesas Empresa'
    },
    catalogo: [
      { nome: 'Atendimento / Consulta Geral', valor: 150, sinal: 50 },
      { nome: 'Serviço Especializado', valor: 220, sinal: 50 },
      { nome: 'Pacote Mensal', valor: 450, sinal: 100 },
      { nome: 'Assessoria / Projeto', valor: 800, sinal: 200 }
    ]
  }
};

// Procedimentos padrão originais (fallback)
const PROCEDIMENTOS_CATALOGO = PERFIS_PRESETS.personalizado.catalogo;

// Estado da Aplicação
const state = {
  data: {
    atendimentos: [],
    despesas: [],
    outros: [],
    pessoal: [],
    metas: { faturamento: 5000, reserva: 10000, limitePessoal: 2500 }
  },
  apiUrl: localStorage.getItem('bia_fin_api_url') || '',
  selectedYear: 2026,
  selectedMonth: 10,
  currentTab: 'dashboard',
  isSyncing: false,
  charts: {},
  filters: {
    search: '',
    status: 'all',
    payment: 'all',
    despesasSearch: '',
    despesasCat: 'all',
    outrosSearch: '',
    pessoalSearch: '',
    pessoalTipo: 'all'
  },
  sort: {
    atendimentos: { field: 'data', direction: 'desc' },
    despesas: { field: 'data', direction: 'desc' },
    outros: { field: 'data', direction: 'desc' },
    pessoal: { field: 'data', direction: 'desc' }
  },
  selectedItems: {
    atendimentos: new Set(),
    despesas: new Set(),
    outros: new Set(),
    pessoal: new Set()
  },
  config: null,
  supabaseUrl: localStorage.getItem('saas_supabase_url') || 'https://vvpmwpgvdcdutzlofnwx.supabase.co',
  supabaseKey: localStorage.getItem('saas_supabase_key') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2cG13cGd2ZGNkdXR6bG9mbnd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxMTE2NTIsImV4cCI6MjEwNzY4NzY1Mn0.mjCEhG4Kxb1S58oLeTZa5ms8w7yBbbWSdvsBEP_ecM8',
  supabaseClient: null,
  currentUser: null,
  authMode: 'login'
};

// Inicialização da Configuração Modular
function initModularSystem() {
  const saved = localStorage.getItem('saas_fin_config');
  if (saved) {
    try {
      state.config = JSON.parse(saved);
      // Migração automática se estiver com o nome padrão antigo ou legado (e não tiver sido escolhido explicitamente pelo usuário)
      if (!state.config.isUserSelected && (state.config.appName === 'Beatriz Leal Beauty' || state.config.appName === 'Studio de Estética & Beleza')) {
        state.config = JSON.parse(JSON.stringify(PERFIS_PRESETS.personalizado));
        localStorage.setItem('saas_fin_config', JSON.stringify(state.config));
      }
    } catch (e) {
      console.warn('Erro ao carregar config modular:', e);
      state.config = JSON.parse(JSON.stringify(PERFIS_PRESETS.personalizado));
    }
  } else {
    state.config = JSON.parse(JSON.stringify(PERFIS_PRESETS.personalizado));
  }

  // Sanitização automática: remove nome legado se estiver em cache local
  if (state.config && (state.config.appName === 'Beatriz Leal Beauty' || (!state.config.isUserSelected && state.config.appName === 'Studio de Estética & Beleza'))) {
    state.config = JSON.parse(JSON.stringify(PERFIS_PRESETS.personalizado));
    localStorage.setItem('saas_fin_config', JSON.stringify(state.config));
  }

  // Inicializa Supabase se configurado
  if (state.supabaseUrl && state.supabaseKey && window.supabase) {
    try {
      state.supabaseClient = window.supabase.createClient(state.supabaseUrl, state.supabaseKey);
      
      // Escutador global de mudanças de autenticação
      state.supabaseClient.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          state.currentUser = session.user;
          updateAuthNavbarUI(session.user);
        } else {
          state.currentUser = null;
          updateAuthNavbarUI(null);
        }
      });
    } catch (err) {
      console.warn('Erro ao inicializar Supabase:', err);
    }
  }
}

// Aplica as configurações do perfil e módulos na interface
function applyModularUI() {
  if (!state.config) return;

  const cfg = state.config;

  // 1. Branding do Top Header
  setText('header-app-title', cfg.appName || 'Painel Financeiro Sob Medida');
  setText('header-app-subtitle', cfg.appSubtitle || 'Gestão Financeira & Caixa Personalizável');
  
  const logoIcon = document.getElementById('header-logo-icon');
  if (logoIcon) {
    logoIcon.className = `fa-solid ${cfg.logoIcon || 'fa-sliders'} text-sm sm:text-base`;
  }

  const perfilTagText = document.getElementById('header-perfil-tag-text');
  if (perfilTagText) {
    perfilTagText.innerText = cfg.nomePerfil || 'Sob Medida';
  } else {
    const perfilTag = document.getElementById('header-perfil-tag');
    if (perfilTag) {
      perfilTag.innerText = cfg.nomePerfil || 'Sob Medida';
    }
  }

  // 2. Botão de Ação Rápida (Dashboard / Novo Atendimento)
  const actionLabel = document.getElementById('header-btn-action-label');
  if (actionLabel) {
    actionLabel.innerText = cfg.modules?.operacoes 
      ? (cfg.terms?.operacaoSingular || 'Atendimento') 
      : 'Lançamento';
  }

  // 3. Ocultar/Exibir Abas de Navegação conforme Módulos Ativos
  setTabVisibility('tab-nav-atendimentos', cfg.modules?.operacoes);
  setTabVisibility('tab-nav-despesas', cfg.modules?.empresa);
  setTabVisibility('tab-nav-outros', cfg.modules?.outros);
  setTabVisibility('tab-nav-pessoal', cfg.modules?.pessoal);
  setTabVisibility('tab-nav-metas', cfg.modules?.metas);

  // 4. Rótulos das Abas Dinâmicos
  setText('label-nav-atendimentos', cfg.terms?.operacaoPlural || 'Atendimentos');
  setText('label-nav-despesas', cfg.terms?.custoNegocio || 'Despesas Empresa');

  // Rótulos de Seções e Tabelas Dinâmicos
  setText('title-aba-atendimentos', `${cfg.terms?.operacaoPlural || 'Atendimentos'} Realizados`);
  setText('th-servico-atendimentos', cfg.terms?.servicoSingular || 'Procedimento');
  setText('label-chart-procedimentos', `${cfg.terms?.servicoSingular || 'Procedimento'}s Mais Lucrativos`);

  // Se o usuário estiver numa aba que foi desligada, redireciona para o dashboard
  if (state.currentTab === 'atendimentos' && !cfg.modules?.operacoes) switchTab('dashboard');
  if (state.currentTab === 'despesas' && !cfg.modules?.empresa) switchTab('dashboard');
  if (state.currentTab === 'outros' && !cfg.modules?.outros) switchTab('dashboard');
  if (state.currentTab === 'pessoal' && !cfg.modules?.pessoal) switchTab('dashboard');
  if (state.currentTab === 'metas' && !cfg.modules?.metas) switchTab('dashboard');

  // 5. Preencher os campos da aba de Configuração Modular
  setChecked('mod-toggle-operacoes', cfg.modules?.operacoes !== false);
  setChecked('mod-toggle-empresa', cfg.modules?.empresa !== false);
  setChecked('mod-toggle-pessoal', cfg.modules?.pessoal !== false);
  setChecked('mod-toggle-outros', cfg.modules?.outros !== false);
  setChecked('mod-toggle-metas', cfg.modules?.metas !== false);

  setInputValue('mod-input-app-name', cfg.appName || '');
  setInputValue('mod-input-app-subtitle', cfg.appSubtitle || '');
  setInputValue('mod-input-termo-cliente', cfg.terms?.clienteSingular || 'Cliente');
  setInputValue('mod-input-termo-servico', cfg.terms?.servicoSingular || 'Serviço');
  setInputValue('mod-input-termo-plural', cfg.terms?.operacaoPlural || 'Atendimentos');

  // Supabase inputs
  setInputValue('supabase-config-url', state.supabaseUrl || '');
  setInputValue('supabase-config-key', state.supabaseKey || '');
  updateSupabaseStatusBadge();

  // Destaque visual na Barra Rápida de Nichos (Dashboard)
  document.querySelectorAll('.quick-preset-btn').forEach(btn => {
    btn.classList.remove('bg-gradient-to-r', 'from-[#D4888C]', 'to-[#C5A059]', 'text-white', 'border-transparent', 'font-bold', 'shadow-md');
    btn.classList.add('bg-white/10', 'text-white', 'border-white/15');
  });
  const activeQuickBtn = document.getElementById(`btn-quick-preset-${cfg.id}`);
  if (activeQuickBtn) {
    activeQuickBtn.classList.remove('bg-white/10', 'border-white/15');
    activeQuickBtn.classList.add('bg-gradient-to-r', 'from-[#D4888C]', 'to-[#C5A059]', 'text-white', 'border-transparent', 'font-bold', 'shadow-md');
  }

  // Destaque visual no Card de Preset ativo
  document.querySelectorAll('.preset-card').forEach(el => {
    el.classList.remove('border-[#D4888C]', 'bg-[#F9F7F2]');
    el.classList.add('border-transparent');
  });
  const activePresetCard = document.getElementById(`card-preset-${cfg.id}`);
  if (activePresetCard) {
    activePresetCard.classList.remove('border-transparent');
    activePresetCard.classList.add('border-[#D4888C]', 'bg-[#F9F7F2]');
  }

  // Se a seção de operações estiver desligada, oculta o gerenciador de catálogo
  const secaoCatalogo = document.getElementById('secao-catalogo-gerenciador');
  if (secaoCatalogo) {
    secaoCatalogo.style.display = cfg.modules?.operacoes ? '' : 'none';
  }

  // Rodapé Dinâmico Executivo
  setText('footer-branding-text', `© 2026 ${cfg.appName || 'Finanças'} — Gestão Financeira Exclusiva`);
  setText('footer-app-title', cfg.appName || 'Painel Financeiro Sob Medida');
  setText('footer-app-subtitle', cfg.appSubtitle || 'Gestão Financeira & Caixa Personalizável');
  const footerLogoIcon = document.getElementById('footer-logo-icon');
  if (footerLogoIcon) {
    footerLogoIcon.className = `fa-solid ${cfg.logoIcon || 'fa-sliders'} text-base`;
  }

  renderCatalogoTable();
  populateProcedimentosSelect();
}

function setTabVisibility(elementId, isVisible) {
  const el = document.getElementById(elementId);
  if (el) {
    el.style.display = isVisible ? '' : 'none';
  }
}

function setChecked(id, val) {
  const el = document.getElementById(id);
  if (el) el.checked = Boolean(val);
}

function setInputValue(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

// Troca rápida de Preset
function selectProfilePreset(presetId) {
  const preset = PERFIS_PRESETS[presetId];
  if (!preset) return;

  state.config = JSON.parse(JSON.stringify(preset));
  state.config.isUserSelected = true;
  localStorage.setItem('saas_fin_config', JSON.stringify(state.config));
  
  applyModularUI();
  renderAll();
  showToast(`Perfil "${preset.nomePerfil}" aplicado com sucesso!`);

  // Se logado no Supabase, persiste a mudança no perfil da nuvem
  if (state.currentUser && state.supabaseClient) {
    state.supabaseClient.from('perfis').update({
      tipo_perfil: presetId,
      app_name: preset.appName,
      app_subtitle: preset.appSubtitle,
      modulos: preset.modules,
      termos: preset.terms,
      updated_at: new Date().toISOString()
    }).eq('id', state.currentUser.id).then(({ error }) => {
      if (error) console.error('Erro ao atualizar perfil no Supabase:', error);
    });
  }
}

// Quando o usuário mexe em algum toggle na tela
function handleModuleToggleChange() {
  saveModularConfig(false);
}

// Salva as configurações customizadas pelo usuário
function saveModularConfig(showToastMsg = true) {
  if (!state.config) state.config = JSON.parse(JSON.stringify(PERFIS_PRESETS.personalizado));

  state.config.id = 'personalizado';
  state.config.nomePerfil = 'Sob Medida';
  state.config.isUserSelected = true;

  state.config.modules = {
    operacoes: document.getElementById('mod-toggle-operacoes')?.checked ?? true,
    empresa: document.getElementById('mod-toggle-empresa')?.checked ?? true,
    pessoal: document.getElementById('mod-toggle-pessoal')?.checked ?? true,
    outros: document.getElementById('mod-toggle-outros')?.checked ?? true,
    metas: document.getElementById('mod-toggle-metas')?.checked ?? true
  };

  const appName = document.getElementById('mod-input-app-name')?.value.trim();
  const appSubtitle = document.getElementById('mod-input-app-subtitle')?.value.trim();
  const termoCliente = document.getElementById('mod-input-termo-cliente')?.value.trim() || 'Cliente';
  const termoServico = document.getElementById('mod-input-termo-servico')?.value.trim() || 'Serviço';
  const termoPlural = document.getElementById('mod-input-termo-plural')?.value.trim() || 'Atendimentos';

  if (appName) state.config.appName = appName;
  if (appSubtitle) state.config.appSubtitle = appSubtitle;

  state.config.terms = {
    operacaoSingular: termoServico,
    operacaoPlural: termoPlural,
    clienteSingular: termoCliente,
    clientePlural: `${termoCliente}s`,
    servicoSingular: termoServico,
    custoNegocio: state.config.modules.empresa ? 'Despesas Empresa' : 'Custos Negócio'
  };

  localStorage.setItem('saas_fin_config', JSON.stringify(state.config));
  applyModularUI();
  renderAll();

  // Se logado no Supabase, sincroniza alterações de perfil na nuvem
  if (state.currentUser && state.supabaseClient) {
    state.supabaseClient.from('perfis').update({
      app_name: state.config.appName,
      app_subtitle: state.config.appSubtitle,
      modulos: state.config.modules,
      termos: state.config.terms,
      updated_at: new Date().toISOString()
    }).eq('id', state.currentUser.id).then(({ error }) => {
      if (error) console.error('Erro ao salvar perfil no Supabase:', error);
    });
  }

  if (showToastMsg) {
    showToast('Preferências e módulos salvos!');
  }
}

// Clique no botão de Ação Rápida do Cabeçalho
function handleHeaderQuickAction() {
  if (state.config?.modules?.operacoes) {
    openNewAtendimento();
  } else if (state.config?.modules?.pessoal) {
    openNewPessoal();
  } else if (state.config?.modules?.empresa) {
    openNewDespesa();
  } else {
    openNewReceitaExtra();
  }
}

// Gerenciamento de Catálogo de Serviços
function renderCatalogoTable() {
  const tbody = document.getElementById('tbody-catalogo-servicos');
  const cards = document.getElementById('cards-catalogo-servicos');
  if (!tbody && !cards) return;

  const catalog = state.config?.catalogo || [];
  if (catalog.length === 0) {
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="py-4 text-center text-gray-400 text-xs italic">
            Nenhum serviço cadastrado no seu catálogo ainda. Clique em "Adicionar Serviço" acima.
          </td>
        </tr>
      `;
    }
    if (cards) {
      cards.innerHTML = `
        <div class="card-lux p-6 text-center text-gray-400 font-light text-xs italic">
          Nenhum serviço cadastrado no seu catálogo ainda. Toque em "Adicionar Serviço" acima.
        </div>
      `;
    }
    return;
  }

  // 1. Tabela Desktop
  if (tbody) {
    tbody.innerHTML = catalog.map((item, idx) => `
      <tr class="hover:bg-stone-50 transition row-clickable cursor-pointer" onclick="handleCatalogoRowClick(event, ${idx})" title="Clique para editar este serviço">
        <td class="py-2.5 px-3 font-semibold text-gray-800">${item.nome}</td>
        <td class="py-2.5 px-3 font-bold text-gray-900">${formatBRL(item.valor)}</td>
        <td class="py-2.5 px-3 text-stone-600">${item.sinal > 0 ? formatBRL(item.sinal) : 'Sem sinal'}</td>
        <td class="py-2.5 px-3 text-right whitespace-nowrap no-row-click" onclick="event.stopPropagation()">
          <button onclick="openEditCatalogoItem(${idx})" class="text-gray-400 hover:text-[#C5A059] transition-colors p-1 mr-1.5" title="Editar Serviço">
            <i class="fa-regular fa-pen-to-square text-xs"></i>
          </button>
          <button onclick="removeCatalogoItem(${idx})" class="text-rose-500 hover:text-rose-700 p-1 transition-colors" title="Remover Serviço">
            <i class="fa-solid fa-trash text-xs"></i>
          </button>
        </td>
      </tr>
    `).join('');
  }

  // 2. Cards Mobile Exclusivos (Sem rolagem lateral)
  if (cards) {
    cards.innerHTML = catalog.map((item, idx) => `
      <div class="card-lux mobile-card card-clickable p-4 space-y-3" onclick="handleCatalogoRowClick(event, ${idx})" title="Toque para editar">
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-start gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#D4888C] shrink-0 mt-0.5">
              <i class="fa-solid fa-sparkles text-xs"></i>
            </div>
            <div>
              <span class="text-[10px] text-gray-400 uppercase font-semibold block tracking-wider">Serviço / Procedimento</span>
              <h4 class="font-bold text-gray-900 text-sm mt-0.5 leading-snug">${item.nome}</h4>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="bg-stone-50/80 p-2.5 rounded-xl border border-black/5">
            <span class="text-[10px] text-gray-400 uppercase font-semibold block">Valor Sugerido</span>
            <span class="font-bold text-gray-900 text-sm">${formatBRL(item.valor)}</span>
          </div>
          <div class="bg-stone-50/80 p-2.5 rounded-xl border border-black/5">
            <span class="text-[10px] text-gray-400 uppercase font-semibold block">Sinal Sugerido</span>
            <span class="font-bold ${item.sinal > 0 ? 'text-[#C5A059]' : 'text-stone-500'} text-sm">
              ${item.sinal > 0 ? formatBRL(item.sinal) : 'Sem sinal'}
            </span>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2 border-t border-black/5 no-row-click" onclick="event.stopPropagation()">
          <button onclick="openEditCatalogoItem(${idx})" class="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-[#C5A059] font-semibold text-xs flex items-center gap-1.5 transition-colors">
            <i class="fa-regular fa-pen-to-square"></i> Editar
          </button>
          <button onclick="removeCatalogoItem(${idx})" class="p-1.5 text-gray-400 hover:text-rose-500 transition-colors" title="Excluir">
            <i class="fa-regular fa-trash-can"></i>
          </button>
        </div>
      </div>
    `).join('');
  }
}

function handleCatalogoRowClick(event, idx) {
  if (event && event.target && event.target.closest('button, input, select, label, a, .no-row-click')) return;
  openEditCatalogoItem(idx);
}

function handleDeleteCatalogoFromModal() {
  const idxVal = document.getElementById('modal-cat-index')?.value;
  if (idxVal === '' || idxVal === null || idxVal === undefined) return;
  const idx = parseInt(idxVal, 10);
  if (isNaN(idx)) return;
  const item = state.config?.catalogo?.[idx];
  const nome = item?.nome || 'este serviço';
  if (!confirm(`Deseja realmente excluir "${nome}" do catálogo?`)) return;
  removeCatalogoItem(idx, false);
  closeModal('modal-add-catalogo');
}

function openModalAddCatalogoItem() {
  const indexInput = document.getElementById('modal-cat-index');
  if (indexInput) indexInput.value = '';
  const titleEl = document.getElementById('modal-cat-title');
  if (titleEl) titleEl.innerText = 'Novo Serviço / Item do Catálogo';
  const submitBtn = document.getElementById('modal-cat-submit-btn');
  if (submitBtn) submitBtn.innerText = 'Adicionar ao Catálogo';
  document.getElementById('modal-cat-btn-delete')?.classList.add('hidden');

  document.getElementById('modal-cat-nome').value = '';
  document.getElementById('modal-cat-valor').value = '';
  document.getElementById('modal-cat-sinal').value = '0.00';
  openModal('modal-add-catalogo');
}

function openEditCatalogoItem(idx) {
  const catalog = state.config?.catalogo || [];
  const item = catalog[idx];
  if (!item) return;

  const indexInput = document.getElementById('modal-cat-index');
  if (indexInput) indexInput.value = String(idx);
  const titleEl = document.getElementById('modal-cat-title');
  if (titleEl) titleEl.innerText = 'Editar Serviço / Item do Catálogo';
  const submitBtn = document.getElementById('modal-cat-submit-btn');
  if (submitBtn) submitBtn.innerText = 'Salvar Alterações';
  document.getElementById('modal-cat-btn-delete')?.classList.remove('hidden');

  document.getElementById('modal-cat-nome').value = item.nome || '';
  document.getElementById('modal-cat-valor').value = item.valor != null ? item.valor : '';
  document.getElementById('modal-cat-sinal').value = item.sinal != null ? item.sinal : '0.00';
  openModal('modal-add-catalogo');
}

function submitAddCatalogoItem(e) {
  e.preventDefault();
  const indexVal = document.getElementById('modal-cat-index')?.value;
  const isEditing = indexVal !== '' && indexVal !== null && indexVal !== undefined;
  const nome = document.getElementById('modal-cat-nome').value.trim();
  const valor = parseFloat(document.getElementById('modal-cat-valor').value) || 0;
  const sinal = parseFloat(document.getElementById('modal-cat-sinal').value) || 0;

  if (!nome) return;

  if (!state.config) state.config = {};
  if (!state.config.catalogo) state.config.catalogo = [];

  if (isEditing) {
    const idx = parseInt(indexVal, 10);
    const targetItem = state.config.catalogo[idx];
    if (targetItem) {
      targetItem.nome = nome;
      targetItem.valor = valor;
      targetItem.sinal = sinal;

      localStorage.setItem('saas_fin_config', JSON.stringify(state.config));
      closeModal('modal-add-catalogo');
      renderCatalogoTable();
      populateProcedimentosSelect();
      if (state.currentUser) {
        showToast(`Serviço "${nome}" atualizado com sucesso!`);
      } else {
        showToast(`Serviço "${nome}" atualizado localmente (Modo Teste). Faça login para salvar na nuvem!`, 'info');
        revealDemoBanner();
      }

      // Se logado no Supabase, atualiza ou insere na nuvem
      if (state.currentUser && state.supabaseClient) {
        if (targetItem.id) {
          state.supabaseClient
            .from('catalogo_servicos')
            .update({ nome, valor, sinal })
            .eq('id', targetItem.id)
            .then(({ error }) => {
              if (error) console.error('Erro ao atualizar serviço no Supabase:', error);
            });
        } else {
          state.supabaseClient
            .from('catalogo_servicos')
            .insert({
              user_id: state.currentUser.id,
              nome,
              valor,
              sinal,
              ativo: true
            })
            .select()
            .single()
            .then(({ data: ins, error }) => {
              if (ins) targetItem.id = ins.id;
              if (error) console.error('Erro ao salvar serviço no Supabase:', error);
            });
        }
      }
      return;
    }
  }

  // Novo item
  const newItem = { nome, valor, sinal };
  state.config.catalogo.push(newItem);

  localStorage.setItem('saas_fin_config', JSON.stringify(state.config));
  closeModal('modal-add-catalogo');
  renderCatalogoTable();
  populateProcedimentosSelect();
  if (state.currentUser) {
    showToast(`Serviço "${nome}" adicionado com sucesso!`);
  } else {
    showToast(`Serviço "${nome}" adicionado localmente (Modo Teste). Faça login para salvar na nuvem!`, 'info');
    revealDemoBanner();
  }

  // Se logado no Supabase, adiciona no catálogo na nuvem
  if (state.currentUser && state.supabaseClient) {
    state.supabaseClient.from('catalogo_servicos').insert({
      user_id: state.currentUser.id,
      nome,
      valor,
      sinal,
      ativo: true
    }).select().single().then(({ data: ins, error }) => {
      if (ins) newItem.id = ins.id;
      if (error) console.error('Erro ao adicionar serviço no Supabase:', error);
    });
  }
}

function removeCatalogoItem(idx, askConfirm = true) {
  if (!state.config?.catalogo) return;
  const item = state.config.catalogo[idx];
  if (!item) return;

  if (askConfirm) {
    const nome = item.nome || 'este serviço';
    if (!confirm(`Deseja realmente excluir "${nome}" do catálogo?`)) return;
  }

  const removed = state.config.catalogo.splice(idx, 1);
  localStorage.setItem('saas_fin_config', JSON.stringify(state.config));
  renderCatalogoTable();
  populateProcedimentosSelect();
  if (removed.length > 0) {
    if (state.currentUser) {
      showToast(`"${removed[0].nome}" removido do catálogo.`);
    } else {
      showToast(`"${removed[0].nome}" removido localmente (Modo Teste). Faça login para salvar na nuvem!`, 'info');
      revealDemoBanner();
    }

    // Se logado no Supabase e item tem id, remove da nuvem
    if (state.currentUser && state.supabaseClient && removed[0].id) {
      state.supabaseClient.from('catalogo_servicos').delete().eq('id', removed[0].id).then(({ error }) => {
        if (error) console.error('Erro ao excluir serviço do Supabase:', error);
      });
    }
  }
}

// Conexão Supabase
function saveSupabaseConfig() {
  const url = document.getElementById('supabase-config-url')?.value.trim();
  const key = document.getElementById('supabase-config-key')?.value.trim();

  state.supabaseUrl = url;
  state.supabaseKey = key;
  localStorage.setItem('saas_supabase_url', url);
  localStorage.setItem('saas_supabase_key', key);

  if (url && key && window.supabase) {
    try {
      state.supabaseClient = window.supabase.createClient(url, key);
      showToast('Credenciais do Supabase salvas!');
    } catch (e) {
      showToast('Erro ao inicializar cliente Supabase.');
    }
  } else {
    state.supabaseClient = null;
    showToast('Configuração salva em modo local.');
  }

  updateSupabaseStatusBadge();
}

async function testSupabaseConnection() {
  if (!state.supabaseUrl || !state.supabaseKey) {
    showToast('Preencha a URL e a Anon Key do Supabase primeiro.');
    return;
  }

  if (!window.supabase) {
    showToast('Biblioteca do Supabase ainda carregando, tente novamente em instantes.');
    return;
  }

  try {
    const client = window.supabase.createClient(state.supabaseUrl, state.supabaseKey);
    const { data, error } = await client.from('perfis').select('id').limit(1);

    if (error && error.code !== 'PGRST116') {
      showToast(`Conectou ao Supabase com sucesso!`);
    } else {
      showToast('Conexão com o Supabase bem-sucedida!');
    }
    updateSupabaseStatusBadge(true);
  } catch (err) {
    showToast(`Erro na conexão: ${err.message || 'Verifique as chaves'}`);
    updateSupabaseStatusBadge(false);
  }
}

function updateSupabaseStatusBadge(isConnected = null) {
  const badge = document.getElementById('badge-supabase-status');
  if (!badge) return;

  if (isConnected === true || state.currentUser) {
    badge.className = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200';
    badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span> Supabase Conectado';
  } else if (state.supabaseUrl && state.supabaseKey) {
    badge.className = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200';
    badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-500 mr-2"></span> Supabase Configurado';
  } else {
    badge.className = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200';
    badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-stone-400 mr-2"></span> Modo Local (Demonstração)';
  }
}

function downloadSupabaseSQL() {
  window.open('./supabase_schema.sql', '_blank');
}

// ==============================================================================
// AUTENTICAÇÃO E NUVEM MULTI-USUÁRIO (SUPABASE SAAS)
// ==============================================================================

function openAuthModal(initialMode = 'login') {
  switchAuthMode(initialMode);
  const msgEl = document.getElementById('auth-feedback-msg');
  if (msgEl) msgEl.className = 'hidden';
  openModal('modal-auth');
}

function closeAuthModal() {
  closeModal('modal-auth');
}

function switchAuthMode(mode) {
  state.authMode = mode;
  const tabLogin = document.getElementById('auth-tab-login');
  const tabSignup = document.getElementById('auth-tab-signup');
  const fieldName = document.getElementById('auth-field-name');
  const fieldPreset = document.getElementById('auth-field-preset');
  const submitBtnText = document.getElementById('auth-submit-btn-text');
  const modalTitle = document.getElementById('auth-modal-title');
  const modalSubtitle = document.getElementById('auth-modal-subtitle');
  const msgEl = document.getElementById('auth-feedback-msg');
  if (msgEl) msgEl.className = 'hidden';

  if (mode === 'signup') {
    tabSignup?.classList.add('bg-white', 'text-gray-900', 'shadow-sm');
    tabSignup?.classList.remove('text-gray-500');
    tabLogin?.classList.remove('bg-white', 'text-gray-900', 'shadow-sm');
    tabLogin?.classList.add('text-gray-500');

    fieldName?.classList.remove('hidden');
    fieldPreset?.classList.remove('hidden');
    if (submitBtnText) submitBtnText.innerText = 'Criar Minha Conta & Iniciar';
    if (modalTitle) modalTitle.innerText = 'Criar Nova Conta';
    if (modalSubtitle) modalSubtitle.innerText = 'Configure seu espaço exclusivo e seguro na nuvem.';
  } else {
    tabLogin?.classList.add('bg-white', 'text-gray-900', 'shadow-sm');
    tabLogin?.classList.remove('text-gray-500');
    tabSignup?.classList.remove('bg-white', 'text-gray-900', 'shadow-sm');
    tabSignup?.classList.add('text-gray-500');

    fieldName?.classList.add('hidden');
    fieldPreset?.classList.add('hidden');
    if (submitBtnText) submitBtnText.innerText = 'Entrar no meu Painel';
    if (modalTitle) modalTitle.innerText = 'Acesso ao Painel';
    if (modalSubtitle) modalSubtitle.innerText = 'Acesse seu painel com segurança e privacidade total.';
  }
}

function showAuthFeedback(msg, type = 'error') {
  const el = document.getElementById('auth-feedback-msg');
  if (!el) return;
  el.classList.remove('hidden');
  if (type === 'error') {
    el.className = 'p-3 rounded-xl text-xs bg-rose-50 text-rose-700 border border-rose-200';
  } else if (type === 'success') {
    el.className = 'p-3 rounded-xl text-xs bg-emerald-50 text-emerald-700 border border-emerald-200';
  } else {
    el.className = 'p-3 rounded-xl text-xs bg-stone-100 text-stone-700 border border-stone-200';
  }
  el.innerText = msg;
}

function updateAuthNavbarUI(user) {
  const pill = document.getElementById('auth-user-pill');
  if (pill) {
    if (user) {
      const displayName = user.user_metadata?.nome || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário';
      pill.innerHTML = `
        <div class="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-white text-xs font-semibold shadow-sm">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="max-w-[100px] sm:max-w-[130px] truncate font-medium text-emerald-200" title="${user.email}">${displayName}</span>
          <button onclick="handleSupabaseLogout()" class="text-white/60 hover:text-rose-400 transition ml-1 p-0.5" title="Sair da conta">
            <i class="fa-solid fa-right-from-bracket text-xs"></i>
          </button>
        </div>
      `;
      updateSupabaseStatusBadge(true);
      updateSyncBadge('supabase');
      hideDemoBanner(true);
    } else {
      pill.innerHTML = `
        <button onclick="openAuthModal()" class="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-2 transition border border-white/15 shadow-sm hover:border-[#D4888C]" title="Acessar ou Criar Conta">
          <i class="fa-solid fa-user-lock text-[#D4888C]"></i>
          <span class="hidden sm:inline">Entrar / Cadastrar</span>
        </button>
      `;
      updateSupabaseStatusBadge(false);
      showDemoBanner();
    }
  }
}

// --- CONTROLE DA BARRA DE AVISO: MODO DEMONSTRAÇÃO / TESTE ---
function showDemoBanner() {
  if (state.currentUser) return;
  const banner = document.getElementById('demo-mode-bottom-bar');
  if (!banner) return;
  banner.classList.remove('hidden');
  requestAnimationFrame(() => {
    banner.classList.remove('translate-y-full');
    banner.classList.add('translate-y-0');
  });
}

function hideDemoBanner(permanent = false) {
  const banner = document.getElementById('demo-mode-bottom-bar');
  if (!banner) return;
  banner.classList.remove('translate-y-0');
  banner.classList.add('translate-y-full');
  setTimeout(() => {
    banner.classList.add('hidden');
  }, 300);
}

function dismissDemoBanner() {
  hideDemoBanner();
}

function revealDemoBanner() {
  if (state.currentUser) return;
  const banner = document.getElementById('demo-mode-bottom-bar');
  if (!banner) return;
  banner.classList.remove('hidden');
  requestAnimationFrame(() => {
    banner.classList.remove('translate-y-full');
    banner.classList.add('translate-y-0');
    const contentTargets = banner.querySelectorAll('.demo-banner-content');
    if (contentTargets.length > 0) {
      contentTargets.forEach(el => el.classList.add('ring-2', 'ring-[#D4888C]'));
      setTimeout(() => {
        contentTargets.forEach(el => el.classList.remove('ring-2', 'ring-[#D4888C]'));
      }, 1500);
    } else {
      banner.classList.add('ring-2', 'ring-[#D4888C]');
      setTimeout(() => {
        banner.classList.remove('ring-2', 'ring-[#D4888C]');
      }, 1500);
    }
  });
}

async function handleAuthSubmit(event) {
  event.preventDefault();

  if (!state.supabaseClient) {
    showAuthFeedback('Cliente Supabase não inicializado. Verifique a URL e a Anon Key.', 'error');
    return;
  }

  const email = document.getElementById('auth-input-email').value.trim();
  const password = document.getElementById('auth-input-password').value;
  const submitBtn = document.getElementById('auth-submit-btn');

  if (submitBtn) submitBtn.disabled = true;

  try {
    if (state.authMode === 'signup') {
      const nome = document.getElementById('auth-input-name').value.trim() || 'Meu Espaço';
      const presetId = document.getElementById('auth-input-preset').value || 'personalizado';
      const preset = PERFIS_PRESETS[presetId] || PERFIS_PRESETS.personalizado;

      showAuthFeedback('Criando sua conta exclusiva...', 'info');

      const { data, error } = await state.supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome: nome,
            preset: presetId
          }
        }
      });

      if (error) throw error;

      if (data?.user) {
        state.currentUser = data.user;

        // Atualiza o perfil criado automaticamente com o preset escolhido
        try {
          await state.supabaseClient.from('perfis').upsert({
            id: data.user.id,
            email: data.user.email,
            nome: nome,
            tipo_perfil: presetId,
            app_name: preset.appName,
            app_subtitle: preset.appSubtitle,
            modulos: preset.modules,
            termos: preset.terms,
            updated_at: new Date().toISOString()
          });

          // Se o preset tem catálogo inicial, insere no catálogo do usuário
          if (preset.catalogo && preset.catalogo.length > 0) {
            const catItems = preset.catalogo.map(c => ({
              user_id: data.user.id,
              nome: c.nome,
              valor: c.valor,
              sinal: c.sinal || 0,
              ativo: true
            }));
            await state.supabaseClient.from('catalogo_servicos').insert(catItems);
          }
        } catch (e) {
          console.warn('Aviso ao sincronizar perfil inicial:', e);
        }

        if (data.session) {
          closeAuthModal();
          updateAuthNavbarUI(data.user);
          await loadUserDataFromSupabase(data.user);
          showToast(`Conta criada com sucesso! Bem-vindo(a), ${nome}!`);
        } else {
          showAuthFeedback('Conta criada com sucesso! Se a confirmação de e-mail estiver ativada no seu Supabase, clique no link recebido no e-mail para ativar o login.', 'success');
        }
      }
    } else {
      // Login
      showAuthFeedback('Autenticando...', 'info');
      const { data, error } = await state.supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data?.user) {
        state.currentUser = data.user;
        closeAuthModal();
        updateAuthNavbarUI(data.user);
        await loadUserDataFromSupabase(data.user);
        showToast('Login realizado com sucesso!');
      }
    }
  } catch (err) {
    console.error('Erro na autenticação:', err);
    let msg = err.message || 'Erro ao processar autenticação.';
    if (msg.includes('Invalid login credentials')) {
      msg = 'E-mail ou senha incorretos.';
    } else if (msg.includes('User already registered')) {
      msg = 'Este e-mail já possui uma conta cadastrada. Clique em "Já tenho conta" para entrar.';
    } else if (msg.includes('Password should be at least')) {
      msg = 'A senha deve conter no mínimo 6 caracteres.';
    }
    showAuthFeedback(msg, 'error');
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

async function handleSupabaseLogout() {
  if (!confirm('Deseja realmente sair da sua conta?')) return;

  if (state.supabaseClient) {
    try {
      await state.supabaseClient.auth.signOut();
    } catch (e) {
      console.warn('Erro ao deslogar do Supabase:', e);
    }
  }

  state.currentUser = null;
  updateAuthNavbarUI(null);
  
  // Recarrega os dados locais / demonstrativos
  await loadInitialData();
  const savedConfig = localStorage.getItem('saas_fin_config');
  if (savedConfig) {
    try { state.config = JSON.parse(savedConfig); } catch (e) {}
  }
  applyModularUI();
  renderAll();
  updateSyncBadge(state.apiUrl ? 'connected' : 'local');
  showToast('Você saiu da sua conta.');
}

async function loadUserDataFromSupabase(user) {
  if (!state.supabaseClient || !user) return;

  try {
    updateSyncBadge('syncing');

    // 1. Carrega Perfil
    const { data: perfil } = await state.supabaseClient
      .from('perfis')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (perfil) {
      let appName = perfil.app_name || 'Painel Financeiro Sob Medida';
      if (appName === 'Beatriz Leal Beauty' || appName === 'Studio de Estética & Beleza') {
        appName = 'Painel Financeiro Sob Medida';
        // Atualiza no banco silenciosamente para limpar o registro legado do usuário
        state.supabaseClient.from('perfis').update({ app_name: appName }).eq('id', user.id).then();
      }

      state.config = {
        id: perfil.tipo_perfil || 'personalizado',
        nomePerfil: perfil.nome || user.user_metadata?.nome || 'Sob Medida',
        appName: appName,
        appSubtitle: perfil.app_subtitle || 'Gestão Financeira & Caixa Personalizável',
        logoIcon: perfil.logo_icon || 'fa-sliders',
        preset: perfil.tipo_perfil || 'personalizado',
        isUserSelected: true,
        modules: perfil.modulos || { operacoes: true, empresa: true, pessoal: true, outros: true, metas: true },
        terms: perfil.termos || {
          operacaoSingular: 'Atendimento',
          operacaoPlural: 'Atendimentos',
          clienteSingular: 'Cliente',
          clientePlural: 'Clientes',
          servicoSingular: 'Serviço',
          custoNegocio: 'Despesas Empresa'
        },
        catalogo: []
      };
      localStorage.setItem('saas_fin_config', JSON.stringify(state.config));
      applyModularUI();
    }

    // 2. Carrega Catálogo de Serviços
    const { data: servicos } = await state.supabaseClient
      .from('catalogo_servicos')
      .select('*')
      .eq('user_id', user.id)
      .eq('ativo', true)
      .order('nome');

    if (servicos && servicos.length > 0) {
      if (!state.config) state.config = {};
      state.config.catalogo = servicos.map(s => ({
        id: s.id,
        nome: s.nome,
        valor: parseFloat(s.valor) || 0,
        sinal: parseFloat(s.sinal) || 0
      }));
    }
    renderCatalogoTable();
    populateProcedimentosSelect();

    // 3. Carrega Metas
    const { data: metas } = await state.supabaseClient
      .from('metas')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (metas) {
      state.data.metas = {
        faturamento: parseFloat(metas.faturamento) || 5000,
        reserva: parseFloat(metas.reserva) || 10000,
        limitePessoal: parseFloat(metas.limite_pessoal) || 2500
      };
    }

    // 4. Carrega Atendimentos
    const { data: atendimentos } = await state.supabaseClient
      .from('atendimentos')
      .select('*')
      .eq('user_id', user.id)
      .order('data', { ascending: false });

    state.data.atendimentos = (atendimentos || []).map(a => ({
      _id: a.id,
      _rowIndex: a.id,
      data: a.data,
      cliente: a.cliente || '',
      servico: a.servico || '',
      valorTotal: parseFloat(a.valor_total) || 0,
      sinal: parseFloat(a.sinal) || 0,
      restante: parseFloat(a.recebido) || 0,
      recebido: (parseFloat(a.recebido) || 0) + (parseFloat(a.sinal) || 0),
      aReceber: parseFloat(a.a_receber) || 0,
      formaPagamento: a.forma_pagamento || 'Pix',
      parcelas: a.parcelas || 'À vista',
      situacao: a.situacao || 'Concluído',
      observacoes: a.observacoes || ''
    }));

    // 5. Carrega Despesas da Empresa
    const { data: despesas } = await state.supabaseClient
      .from('despesas_empresa')
      .select('*')
      .eq('user_id', user.id)
      .order('data', { ascending: false });

    state.data.despesas = (despesas || []).map(d => ({
      _id: d.id,
      _rowIndex: d.id,
      data: d.data,
      categoria: d.categoria || 'Geral',
      descricao: d.descricao || '-',
      valor: parseFloat(d.valor) || 0,
      formaPagamento: d.forma_pagamento || 'Pix',
      parcelas: d.parcelas || 'À vista',
      observacoes: d.observacoes || ''
    }));

    // 6. Carrega Receitas Extras
    const { data: receitas } = await state.supabaseClient
      .from('receitas_extras')
      .select('*')
      .eq('user_id', user.id)
      .order('data', { ascending: false });

    state.data.outros = (receitas || []).map(r => ({
      _id: r.id,
      _rowIndex: r.id,
      data: r.data,
      descricao: r.tipo || '-',
      valor: parseFloat(r.valor) || 0,
      observacoes: r.observacoes || ''
    }));

    // 7. Carrega Finanças Pessoais
    const { data: pessoal } = await state.supabaseClient
      .from('financas_pessoais')
      .select('*')
      .eq('user_id', user.id)
      .order('data', { ascending: false });

    state.data.pessoal = (pessoal || []).map(p => ({
      _id: p.id,
      _rowIndex: p.id,
      data: p.data,
      tipo: p.tipo || 'Despesa',
      categoria: p.categoria || 'Geral',
      descricao: p.descricao || '-',
      valor: parseFloat(p.valor) || 0,
      observacoes: p.observacoes || ''
    }));

    updateSyncBadge('supabase');
    renderAll();
  } catch (err) {
    console.error('Erro ao carregar dados do Supabase:', err);
    updateSyncBadge('error');
    showToast('Erro ao carregar dados do Supabase: ' + err.message, 'warning');
  }
}

// Obtém catálogo dinâmico de procedimentos: mescla a lista do perfil com qualquer procedimento já existente na planilha
function getDynamicProcedimentos() {
  const map = new Map();

  // 1. Procedimentos cadastrados no perfil / catálogo ativo
  const catalogoBase = (state.config && Array.isArray(state.config.catalogo)) 
    ? state.config.catalogo 
    : PROCEDIMENTOS_CATALOGO;

  catalogoBase.forEach(p => {
    const key = (p.nome || '').trim().toLowerCase();
    if (!key) return;
    map.set(key, {
      nome: p.nome.trim(),
      valor: parseFloat(p.valor) || 0,
      sinal: parseFloat(p.sinal) || 0,
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
    const sin = parseFloat(a.sinal) || 0;

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
  defaultOption.textContent = 'Selecione um item cadastrado...';
  select.appendChild(defaultOption);

  const catalog = getDynamicProcedimentos();
  const personalizados = catalog.filter(p => p.isCustom);
  const padroes = catalog.filter(p => !p.isCustom);

  if (personalizados.length > 0) {
    const groupPlanilha = document.createElement('optgroup');
    groupPlanilha.label = '✨ Adicionados na Planilha';
    personalizados.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.nome;
      const priceText = p.valor > 0 ? ` (${formatBRL(p.valor)})` : '';
      opt.textContent = `${p.nome}${priceText}`;
      groupPlanilha.appendChild(opt);
    });
    select.appendChild(groupPlanilha);

    const groupPadrao = document.createElement('optgroup');
    groupPadrao.label = 'Catálogo Ativo';
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
    console.log(`[Financeiro] Atualizando versão de ${savedVersion || 'v1.0.0'} para ${APP_VERSION}. Limpando cache antigo.`);
    localStorage.setItem('bia_app_version', APP_VERSION);
    localStorage.removeItem('bia_fin_data');
    const savedCfg = localStorage.getItem('saas_fin_config');
    if (savedCfg && (savedCfg.includes('Beatriz Leal Beauty') || (!savedCfg.includes('"isUserSelected":true') && savedCfg.includes('Studio de Estética & Beleza')))) {
      localStorage.removeItem('saas_fin_config');
    }
  }
}

// Forçar Atualização e Limpeza de Cache Manual
function forceAppRefresh() {
  localStorage.removeItem('bia_fin_data');
  const savedCfg = localStorage.getItem('saas_fin_config');
  if (savedCfg && (savedCfg.includes('Beatriz Leal Beauty') || (!savedCfg.includes('"isUserSelected":true') && savedCfg.includes('Studio de Estética & Beleza')))) {
    localStorage.removeItem('saas_fin_config');
  }
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
  initModularSystem();
  await loadInitialData();
  initUI();
  setupEventListeners();
  renderAll();
  applyModularUI();

  // Restaura a aba ativa em que o usuário estava antes de atualizar a página
  const initialTab = getInitialTab();
  switchTab(initialTab);

  // Verifica se há sessão ativa no Supabase
  if (state.supabaseClient) {
    try {
      const { data: { session } } = await state.supabaseClient.auth.getSession();
      if (session?.user) {
        state.currentUser = session.user;
        updateAuthNavbarUI(session.user);
        await loadUserDataFromSupabase(session.user);
        return; // Sessão na nuvem carregada com sucesso
      } else {
        updateAuthNavbarUI(null);
      }
    } catch (e) {
      console.warn('Erro ao verificar sessão Supabase:', e);
      updateAuthNavbarUI(null);
    }
  } else {
    updateAuthNavbarUI(null);
  }

  // Sincroniza em segundo plano com o Google Sheets (se não estiver logado no Supabase)
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

  // Suporte à navegação pelo botão voltar/avançar ou alteração do hash da URL
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash ? window.location.hash.replace(/^#/, '').trim() : '';
    if (hash && hash !== state.currentTab && isTabAvailable(hash)) {
      switchTab(hash, false);
    }
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

  // Filtros de Despesas
  document.getElementById('search-despesas')?.addEventListener('input', (e) => {
    state.filters.despesasSearch = e.target.value;
    renderDespesasTable();
  });

  document.getElementById('filter-cat-despesas')?.addEventListener('change', (e) => {
    state.filters.despesasCat = e.target.value;
    renderDespesasTable();
  });

  // Filtros de Receitas Extras
  document.getElementById('search-outros')?.addEventListener('input', (e) => {
    state.filters.outrosSearch = e.target.value;
    renderOutrosTable();
  });

  // Filtros de Finanças Pessoais
  document.getElementById('search-pessoal')?.addEventListener('input', (e) => {
    state.filters.pessoalSearch = e.target.value;
    renderPessoalTable();
  });

  document.getElementById('filter-tipo-pessoal')?.addEventListener('change', (e) => {
    state.filters.pessoalTipo = e.target.value;
    renderPessoalTable();
  });

  // Ações de Sincronização
  document.getElementById('btn-sync')?.addEventListener('click', () => {
    if (state.currentUser) {
      loadUserDataFromSupabase(state.currentUser);
    } else if (state.apiUrl) {
      syncWithGoogleSheets(true);
    } else {
      showToast('Entre na sua conta para sincronizar na nuvem Supabase.');
      openAuthModal();
    }
  });
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

// Verifica se a aba solicitada é válida e se seu respectivo módulo está habilitado
function isTabAvailable(tabId) {
  if (!tabId) return false;
  const section = document.getElementById(`tab-${tabId}`);
  if (!section) return false;

  const cfg = state.config || {};
  if (tabId === 'atendimentos' && cfg.modules?.operacoes === false) return false;
  if (tabId === 'despesas' && cfg.modules?.empresa === false) return false;
  if (tabId === 'outros' && cfg.modules?.outros === false) return false;
  if (tabId === 'pessoal' && cfg.modules?.pessoal === false) return false;
  if (tabId === 'metas' && cfg.modules?.metas === false) return false;

  return true;
}

// Obtém a aba inicial a partir do hash da URL ou do localStorage
function getInitialTab() {
  // 1. Tenta pegar da URL hash (#despesas, #atendimentos, etc.)
  const hash = window.location.hash ? window.location.hash.replace(/^#/, '').trim() : '';
  if (hash && isTabAvailable(hash)) {
    return hash;
  }

  // 2. Tenta pegar do localStorage salvo de sessões anteriores
  try {
    const savedTab = localStorage.getItem('saas_fin_active_tab');
    if (savedTab && isTabAvailable(savedTab)) {
      return savedTab;
    }
  } catch (e) {
    console.warn('Erro ao ler aba ativa do localStorage:', e);
  }

  return 'dashboard';
}

// Troca de Aba
function switchTab(tabId, updateUrl = true) {
  if (!tabId || !document.getElementById(`tab-${tabId}`)) {
    tabId = 'dashboard';
  }

  state.currentTab = tabId;

  // Persiste a aba no localStorage para que ao atualizar (F5) o usuário permaneça na mesma aba
  try {
    localStorage.setItem('saas_fin_active_tab', tabId);
  } catch (e) {
    console.warn('Erro ao salvar aba ativa no localStorage:', e);
  }

  // Atualiza a URL hash sem recarregar a página
  if (updateUrl && window.location.hash !== `#${tabId}`) {
    try {
      history.replaceState(null, '', `#${tabId}`);
    } catch (e) {
      window.location.hash = tabId;
    }
  }

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

  // Atualiza barra de ações em massa conforme a aba ativa
  if (typeof updateBulkActionBar === 'function') {
    updateBulkActionBar();
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

  // Atualizar elementos no DOM conforme Módulos Ativos (SaaS)
  const cfg = state.config || {};
  const isOperacoesActive = cfg.modules?.operacoes !== false;
  const isEmpresaActive = cfg.modules?.empresa !== false;
  const isPessoalActive = cfg.modules?.pessoal !== false;
  const termoPlural = cfg.terms?.operacaoPlural || 'Atendimentos';

  if (!isOperacoesActive && !isEmpresaActive) {
    // Modo 100% Pessoal (Você / Sem clientes)
    setText('kpi-card1-title', 'Receitas Pessoais');
    setText('kpi-faturamento', formatBRL(receitasPessoais));
    setText('kpi-atendimentos-qtd', `${pessoal.filter(p => (p.tipo||'').toLowerCase() === 'receita').length} entradas`);
    setText('kpi-card1-tag', 'Total Pessoal');

    setText('kpi-card2-title', 'Saldo do Mês');
    setText('kpi-recebido-caixa', formatBRL(saldoPessoal));
    setText('kpi-card2-sub-label', 'Despesas:');
    setText('kpi-a-receber', formatBRL(despesasPessoais));

    setText('kpi-card3-title', 'Despesas da Casa');
    setText('kpi-despesas-empresa', formatBRL(despesasPessoais));
    setText('kpi-card3-sub-label', 'Gastos do Mês');
    setText('kpi-card3-sub-detail', 'Contas & Cotidiano');

    setText('kpi-card4-title', 'Reserva Financeira');
    setText('kpi-lucro-empresa', formatBRL(metas.reserva || 10000));
    setText('kpi-margem-lucro', 'Meta Reserva');
    setText('kpi-card4-sub-detail', 'Cofrinho Pessoal');
  } else if (isOperacoesActive && !isEmpresaActive) {
    // Modo Prestador de Serviço Simplificado (ex: Barbearia, Manicure sem PJ)
    setText('kpi-card1-title', `Total em ${termoPlural}`);
    setText('kpi-faturamento', formatBRL(faturamentoGeral));
    setText('kpi-atendimentos-qtd', `${atendimentos.length} ${termoPlural.toLowerCase()}`);
    setText('kpi-card1-tag', `Total ${termoPlural}`);

    setText('kpi-card2-title', 'Recebido no Caixa');
    setText('kpi-recebido-caixa', formatBRL(recebidoEfetivo + totalOutros));
    setText('kpi-card2-sub-label', 'A Receber:');
    setText('kpi-a-receber', formatBRL(totalAReceber));

    setText('kpi-card3-title', 'Gastos Pessoais');
    setText('kpi-despesas-empresa', formatBRL(despesasPessoais));
    setText('kpi-card3-sub-label', 'Despesas Pessoais');
    setText('kpi-card3-sub-detail', 'Cotidiano');

    setText('kpi-card4-title', 'Saldo Livre Final');
    setText('kpi-lucro-empresa', formatBRL(recebidoEfetivo + totalOutros - despesasPessoais));
    setText('kpi-margem-lucro', 'Disponível');
    setText('kpi-card4-sub-detail', 'Após contas');
  } else {
    // Modo Completo (PJ + PF - Estética / Empresa)
    setText('kpi-card1-title', 'Faturamento Bruto');
    setText('kpi-faturamento', formatBRL(faturamentoGeral));
    setText('kpi-atendimentos-qtd', `${atendimentos.length} ${termoPlural.toLowerCase()}`);
    setText('kpi-card1-tag', `Total ${termoPlural}`);

    setText('kpi-card2-title', 'Recebido no Caixa');
    setText('kpi-recebido-caixa', formatBRL(recebidoEfetivo + totalOutros));
    setText('kpi-card2-sub-label', 'A Receber:');
    setText('kpi-a-receber', formatBRL(totalAReceber));

    setText('kpi-card3-title', cfg.terms?.custoNegocio || 'Despesas Empresa');
    setText('kpi-despesas-empresa', formatBRL(totalDespesas));
    setText('kpi-card3-sub-label', 'Custos operacionais');
    setText('kpi-card3-sub-detail', cfg.id === 'estetica' ? 'Insumos & Aluguel' : 'Custos & Fornecedores');

    setText('kpi-card4-title', 'Lucro Líquido PJ');
    setText('kpi-lucro-empresa', formatBRL(lucroOperacional));
    setText('kpi-margem-lucro', `${margemLucro.toFixed(1)}% margem`);
    setText('kpi-card4-sub-detail', isPessoalActive ? 'Antes do Pró-labore' : 'Resultado da Operação');
  }
  
  // Card Dark (Finanças Pessoais ou Fluxo Corporativo PJ)
  if (isPessoalActive) {
    setText('card-dark-badge', 'Finanças Pessoais (Pessoa Física)');
    const btnAction = document.getElementById('card-dark-btn-action');
    if (btnAction) {
      btnAction.innerHTML = '<i class="fa-solid fa-plus-circle"></i> Nova Retirada';
      btnAction.setAttribute('onclick', "openModal('modal-pro-labore')");
      btnAction.style.display = '';
    }
    setText('card-dark-kpi1-label', 'Pró-labore Retirado');
    setText('kpi-retirada-empresa', formatBRL(retiradasEmpresa));
    setText('card-dark-kpi1-sub', 'Transferência PJ → PF');

    setText('card-dark-kpi2-label', 'Gastos Pessoais');
    setText('kpi-gastos-pessoais', formatBRL(despesasPessoais));
    setText('card-dark-kpi2-sub', 'Moradia, mercado, etc.');

    setText('card-dark-kpi3-label', 'Saldo Pessoal');
    setText('kpi-saldo-pessoal', formatBRL(saldoPessoal));
    setText('card-dark-kpi3-sub', 'Sobra / Reserva pessoal');

    setText('card-dark-tip', 'Dica: Mantenha sempre a conta da empresa separada da sua conta pessoal.');
    const linkBtn = document.getElementById('card-dark-link');
    if (linkBtn) {
      linkBtn.innerHTML = 'Ver Detalhes <i class="fa-solid fa-arrow-right text-[10px] ml-1"></i>';
      linkBtn.setAttribute('onclick', "switchTab('pessoal')");
    }
  } else {
    setText('card-dark-badge', 'Fluxo de Caixa Corporativo (Pessoa Jurídica)');
    const btnAction = document.getElementById('card-dark-btn-action');
    if (btnAction) {
      btnAction.innerHTML = '<i class="fa-solid fa-plus-circle"></i> Nova Despesa PJ';
      btnAction.setAttribute('onclick', "openNewDespesa()");
      btnAction.style.display = '';
    }
    setText('card-dark-kpi1-label', 'Total Entradas PJ');
    setText('kpi-retirada-empresa', formatBRL(recebidoEfetivo + totalOutros));
    setText('card-dark-kpi1-sub', 'Atendimentos + Extras');

    setText('card-dark-kpi2-label', 'Despesas Operacionais');
    setText('kpi-gastos-pessoais', formatBRL(totalDespesas));
    setText('card-dark-kpi2-sub', 'Custos pagos no mês');

    setText('card-dark-kpi3-label', 'Saldo Operacional PJ');
    setText('kpi-saldo-pessoal', formatBRL(lucroOperacional));
    setText('card-dark-kpi3-sub', 'Resultado líquido');

    setText('card-dark-tip', 'Dica Corporativa: Monitore custos e prazos de recebimento para manter o caixa da empresa saudável.');
    const linkBtn = document.getElementById('card-dark-link');
    if (linkBtn) {
      linkBtn.innerHTML = 'Ver Despesas PJ <i class="fa-solid fa-arrow-right text-[10px] ml-1"></i>';
      linkBtn.setAttribute('onclick', "switchTab('despesas')");
    }
  }

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

// ==============================================================================
// SISTEMA DE ORDENAÇÃO E FILTROS RÁPIDOS
// ==============================================================================

function sortItemList(list, field, direction = 'desc') {
  if (!Array.isArray(list) || list.length === 0) return [];
  const cloned = [...list];

  return cloned.sort((a, b) => {
    // 1. Ordenação por Data (Mais nova vs Mais antiga)
    if (field === 'data') {
      const pA = parseDateParts(a.data);
      const pB = parseDateParts(b.data);
      const tA = pA ? (pA.year * 10000 + pA.month * 100 + pA.day) : 0;
      const tB = pB ? (pB.year * 10000 + pB.month * 100 + pB.day) : 0;
      if (tA !== tB) {
        return direction === 'asc' ? tA - tB : tB - tA;
      }
      // Desempate estável pela ordem de cadastro (_rowIndex ou ID numérico)
      const rA = Number(a._rowIndex) || Number(a._id) || 0;
      const rB = Number(b._rowIndex) || Number(b._id) || 0;
      return direction === 'asc' ? rA - rB : rB - rA;
    }

    // 2. Ordenação por Valores Monetários ou Numéricos
    if (['valorTotal', 'valor', 'recebido', 'aReceber', 'sinal', 'restante'].includes(field)) {
      let vA = 0;
      let vB = 0;
      if (field === 'recebido') {
        vA = parseFloat(a.recebido) || ((parseFloat(a.sinal) || 0) + (parseFloat(a.restante) || 0));
        vB = parseFloat(b.recebido) || ((parseFloat(b.sinal) || 0) + (parseFloat(b.restante) || 0));
      } else {
        vA = parseFloat(a[field]) || 0;
        vB = parseFloat(b[field]) || 0;
      }
      if (vA !== vB) {
        return direction === 'asc' ? vA - vB : vB - vA;
      }
    }

    // 3. Ordenação por Situação / Status (Pendente > Concluído > Cancelado)
    if (field === 'situacao') {
      const rank = { 'pendente': 1, 'concluído': 2, 'cancelado': 3 };
      const rA = rank[(a.situacao || '').toLowerCase()] || 99;
      const rB = rank[(b.situacao || '').toLowerCase()] || 99;
      if (rA !== rB) {
        return direction === 'asc' ? rA - rB : rB - rA;
      }
    }

    // 4. Ordenação por Texto (Cliente, Procedimento, Pagamento, Categoria, Descrição, etc.)
    const strA = String(a[field] || '').trim();
    const strB = String(b[field] || '').trim();
    const cmp = strA.localeCompare(strB, 'pt-BR', { numeric: true, sensitivity: 'base' });
    if (cmp !== 0) {
      return direction === 'asc' ? cmp : -cmp;
    }

    // Desempate por data mais recente
    const pA = parseDateParts(a.data);
    const pB = parseDateParts(b.data);
    const tA = pA ? (pA.year * 10000 + pA.month * 100 + pA.day) : 0;
    const tB = pB ? (pB.year * 10000 + pB.month * 100 + pB.day) : 0;
    return tB - tA;
  });
}

function toggleSortAtendimentos(field) {
  if (!state.sort) state.sort = {};
  if (!state.sort.atendimentos) {
    state.sort.atendimentos = { field: 'data', direction: 'desc' };
  }

  const current = state.sort.atendimentos;
  if (current.field === field) {
    current.direction = current.direction === 'desc' ? 'asc' : 'desc';
  } else {
    current.field = field;
    if (['cliente', 'servico', 'formaPagamento', 'situacao'].includes(field)) {
      current.direction = 'asc';
    } else {
      current.direction = 'desc';
    }
  }

  renderAtendimentosTable();
}

function applyQuickFilter(filterKey) {
  if (!state.sort) state.sort = {};
  if (!state.filters) state.filters = { search: '', status: 'all', payment: 'all' };

  if (filterKey === 'recentes') {
    state.sort.atendimentos = { field: 'data', direction: 'desc' };
  } else if (filterKey === 'antigos') {
    state.sort.atendimentos = { field: 'data', direction: 'asc' };
  } else if (filterKey === 'cliente_az') {
    state.sort.atendimentos = { field: 'cliente', direction: 'asc' };
  } else if (filterKey === 'pendentes') {
    state.filters.status = state.filters.status === 'pendente' ? 'all' : 'pendente';
    const sel = document.getElementById('filter-status');
    if (sel) sel.value = state.filters.status;
  } else if (filterKey === 'maior_valor') {
    state.sort.atendimentos = { field: 'valorTotal', direction: 'desc' };
  }

  renderAtendimentosTable();
}

function resetAtendimentosFilters() {
  if (!state.filters) state.filters = {};
  state.filters.search = '';
  state.filters.status = 'all';
  state.filters.payment = 'all';

  const searchInput = document.getElementById('search-atendimentos');
  if (searchInput) searchInput.value = '';

  const filterStatus = document.getElementById('filter-status');
  if (filterStatus) filterStatus.value = 'all';

  const filterPayment = document.getElementById('filter-payment');
  if (filterPayment) filterPayment.value = 'all';

  if (!state.sort) state.sort = {};
  state.sort.atendimentos = { field: 'data', direction: 'desc' };

  renderAtendimentosTable();
  showToast('Ordem padrão restaurada (Mais novos primeiro)!');
}

function updateSortHeadersUI() {
  const sortCfg = state.sort?.atendimentos || { field: 'data', direction: 'desc' };
  const field = sortCfg.field;
  const direction = sortCfg.direction;

  const columns = ['data', 'cliente', 'servico', 'valorTotal', 'recebido', 'aReceber', 'formaPagamento', 'situacao'];

  columns.forEach(col => {
    const th = document.getElementById('th-sort-' + col);
    const icon = document.getElementById('sort-icon-' + col);
    if (!th || !icon) return;

    if (col === field) {
      th.classList.add('active-sort');
      if (col === 'data') {
        icon.className = direction === 'desc' 
          ? 'fa-solid fa-arrow-down-wide-short text-[#C5A059] text-[11px]' 
          : 'fa-solid fa-arrow-up-wide-short text-[#C5A059] text-[11px]';
        th.title = direction === 'desc' 
          ? 'Data: Mais novos no topo (Clique para inverter: mais antigos primeiro)' 
          : 'Data: Mais antigos no topo (Clique para inverter: mais novos primeiro)';
      } else if (['cliente', 'servico', 'formaPagamento'].includes(col)) {
        icon.className = direction === 'asc' 
          ? 'fa-solid fa-arrow-down-a-z text-[#C5A059] text-[11px]' 
          : 'fa-solid fa-arrow-up-z-a text-[#C5A059] text-[11px]';
        th.title = direction === 'asc' 
          ? 'Ordem alfabética (A-Z) (Clique para Z-A)' 
          : 'Ordem alfabética (Z-A) (Clique para A-Z)';
      } else if (['valorTotal', 'recebido', 'aReceber'].includes(col)) {
        icon.className = direction === 'desc' 
          ? 'fa-solid fa-arrow-down-9-1 text-[#C5A059] text-[11px]' 
          : 'fa-solid fa-arrow-up-1-9 text-[#C5A059] text-[11px]';
        th.title = direction === 'desc' 
          ? 'Maior valor no topo (Clique para menor)' 
          : 'Menor valor no topo (Clique para maior)';
      } else if (col === 'situacao') {
        icon.className = direction === 'asc' 
          ? 'fa-solid fa-arrow-down-short-wide text-[#C5A059] text-[11px]' 
          : 'fa-solid fa-arrow-up-wide-short text-[#C5A059] text-[11px]';
        th.title = direction === 'asc' 
          ? 'Pendentes primeiro (Clique para inverter)' 
          : 'Cancelados primeiro (Clique para inverter)';
      }
    } else {
      th.classList.remove('active-sort');
      icon.className = 'fa-solid fa-sort text-gray-300 text-[11px]';
    }
  });

  // Atualiza as pílulas de filtros rápidos
  const pillRecentes = document.getElementById('pill-recentes');
  const pillAntigos = document.getElementById('pill-antigos');
  const pillCliente = document.getElementById('pill-cliente_az');
  const pillPendentes = document.getElementById('pill-pendentes');
  const pillMaiorValor = document.getElementById('pill-maior_valor');

  if (pillRecentes) pillRecentes.classList.toggle('active', field === 'data' && direction === 'desc' && state.filters.status === 'all');
  if (pillAntigos) pillAntigos.classList.toggle('active', field === 'data' && direction === 'asc');
  if (pillCliente) pillCliente.classList.toggle('active', field === 'cliente' && direction === 'asc');
  if (pillPendentes) pillPendentes.classList.toggle('active', state.filters.status === 'pendente');
  if (pillMaiorValor) pillMaiorValor.classList.toggle('active', field === 'valorTotal' && direction === 'desc');

  // Atualiza texto indicador de ordenação ativa
  const indicator = document.getElementById('active-sort-indicator');
  if (indicator) {
    let descr = '';
    if (field === 'data') descr = direction === 'desc' ? '<i class="fa-solid fa-arrow-down-wide-short"></i> Mais novos primeiro' : '<i class="fa-solid fa-arrow-up-wide-short"></i> Mais antigos primeiro';
    else if (field === 'cliente') descr = direction === 'asc' ? '<i class="fa-solid fa-arrow-down-a-z"></i> Cliente (A → Z)' : '<i class="fa-solid fa-arrow-up-z-a"></i> Cliente (Z → A)';
    else if (field === 'servico') descr = direction === 'asc' ? '<i class="fa-solid fa-arrow-down-a-z"></i> Procedimento (A → Z)' : '<i class="fa-solid fa-arrow-up-z-a"></i> Procedimento (Z → A)';
    else if (field === 'valorTotal') descr = direction === 'desc' ? '<i class="fa-solid fa-arrow-down-9-1"></i> Maior Valor Total' : '<i class="fa-solid fa-arrow-up-1-9"></i> Menor Valor Total';
    else if (field === 'recebido') descr = direction === 'desc' ? '<i class="fa-solid fa-arrow-down-9-1"></i> Maior Recebido' : '<i class="fa-solid fa-arrow-up-1-9"></i> Menor Recebido';
    else if (field === 'aReceber') descr = direction === 'desc' ? '<i class="fa-solid fa-arrow-down-9-1"></i> Maiores Pendências' : '<i class="fa-solid fa-arrow-up-1-9"></i> Menores Pendências';
    else if (field === 'formaPagamento') descr = direction === 'asc' ? '<i class="fa-solid fa-arrow-down-a-z"></i> Pagamento (A → Z)' : '<i class="fa-solid fa-arrow-up-z-a"></i> Pagamento (Z → A)';
    else if (field === 'situacao') descr = direction === 'asc' ? '<i class="fa-solid fa-arrow-down-short-wide"></i> Pendentes primeiro' : '<i class="fa-solid fa-arrow-up-wide-short"></i> Cancelados primeiro';

    indicator.innerHTML = descr;
  }

  // Destaque no botão de reset se houver filtros ativos
  const btnReset = document.getElementById('btn-reset-filters-atend');
  if (btnReset) {
    const isFiltered = (state.filters.search !== '') || 
                       (state.filters.status !== 'all') || 
                       (state.filters.payment !== 'all') || 
                       (field !== 'data' || direction !== 'desc');
    if (isFiltered) {
      btnReset.classList.add('border-amber-300', 'text-[#94712F]', 'bg-amber-50/60');
      btnReset.classList.remove('border-stone-200', 'text-stone-600', 'bg-stone-50');
      btnReset.innerHTML = '<i class="fa-solid fa-rotate-left text-xs"></i> Limpar Filtros';
    } else {
      btnReset.classList.remove('border-amber-300', 'text-[#94712F]', 'bg-amber-50/60');
      btnReset.classList.add('border-stone-200', 'text-stone-600', 'bg-stone-50');
      btnReset.innerHTML = '<i class="fa-solid fa-rotate-left text-xs"></i> Restaurar Padrão';
    }
  }
}

// ------------------------------------------------------------------------------
// ORDENAÇÃO E FILTROS RÁPIDOS: DESPESAS DA EMPRESA (PJ)
// ------------------------------------------------------------------------------
function toggleSortDespesas(field) {
  if (!state.sort) state.sort = {};
  if (!state.sort.despesas) {
    state.sort.despesas = { field: 'data', direction: 'desc' };
  }

  const current = state.sort.despesas;
  if (current.field === field) {
    current.direction = current.direction === 'desc' ? 'asc' : 'desc';
  } else {
    current.field = field;
    if (['categoria', 'descricao', 'formaPagamento'].includes(field)) {
      current.direction = 'asc';
    } else {
      current.direction = 'desc';
    }
  }

  renderDespesasTable();
}

function applyQuickFilterDespesas(filterKey) {
  if (!state.sort) state.sort = {};
  if (!state.filters) state.filters = {};

  if (filterKey === 'recentes') {
    state.sort.despesas = { field: 'data', direction: 'desc' };
  } else if (filterKey === 'antigas') {
    state.sort.despesas = { field: 'data', direction: 'asc' };
  } else if (filterKey === 'maior_valor') {
    state.sort.despesas = { field: 'valor', direction: 'desc' };
  } else if (filterKey === 'categoria') {
    state.sort.despesas = { field: 'categoria', direction: 'asc' };
  } else if (filterKey === 'descricao') {
    state.sort.despesas = { field: 'descricao', direction: 'asc' };
  }

  renderDespesasTable();
}

function resetDespesasFilters() {
  if (!state.filters) state.filters = {};
  state.filters.despesasSearch = '';
  state.filters.despesasCat = 'all';

  const searchInput = document.getElementById('search-despesas');
  if (searchInput) searchInput.value = '';

  const filterCat = document.getElementById('filter-cat-despesas');
  if (filterCat) filterCat.value = 'all';

  if (!state.sort) state.sort = {};
  state.sort.despesas = { field: 'data', direction: 'desc' };

  renderDespesasTable();
  showToast('Ordem padrão de Despesas restaurada (Mais novas primeiro)!');
}

function updateSortHeadersDespesasUI() {
  const sortCfg = state.sort?.despesas || { field: 'data', direction: 'desc' };
  const field = sortCfg.field;
  const direction = sortCfg.direction;

  const columns = ['data', 'categoria', 'descricao', 'valor', 'formaPagamento'];

  columns.forEach(col => {
    const th = document.getElementById('th-sort-desp-' + col);
    const icon = document.getElementById('sort-icon-desp-' + col);
    if (!th || !icon) return;

    if (col === field) {
      th.classList.add('active-sort');
      if (col === 'data') {
        icon.className = direction === 'desc' 
          ? 'fa-solid fa-arrow-down-wide-short text-[#C5A059] text-[11px]' 
          : 'fa-solid fa-arrow-up-wide-short text-[#C5A059] text-[11px]';
        th.title = direction === 'desc' 
          ? 'Data: Mais novas no topo (Clique para inverter)' 
          : 'Data: Mais antigas no topo (Clique para inverter)';
      } else if (['categoria', 'descricao', 'formaPagamento'].includes(col)) {
        icon.className = direction === 'asc' 
          ? 'fa-solid fa-arrow-down-a-z text-[#C5A059] text-[11px]' 
          : 'fa-solid fa-arrow-up-z-a text-[#C5A059] text-[11px]';
        th.title = direction === 'asc' 
          ? 'Ordem alfabética (A-Z) (Clique para Z-A)' 
          : 'Ordem alfabética (Z-A) (Clique para A-Z)';
      } else if (col === 'valor') {
        icon.className = direction === 'desc' 
          ? 'fa-solid fa-arrow-down-9-1 text-[#C5A059] text-[11px]' 
          : 'fa-solid fa-arrow-up-1-9 text-[#C5A059] text-[11px]';
        th.title = direction === 'desc' 
          ? 'Maior valor no topo (Clique para menor)' 
          : 'Menor valor no topo (Clique para maior)';
      }
    } else {
      th.classList.remove('active-sort');
      icon.className = 'fa-solid fa-sort text-gray-300 text-[11px]';
    }
  });

  // Pílulas
  const pillRecentes = document.getElementById('pill-desp-recentes');
  const pillAntigas = document.getElementById('pill-desp-antigas');
  const pillMaiorValor = document.getElementById('pill-desp-maior_valor');
  const pillCategoria = document.getElementById('pill-desp-categoria');
  const pillDescricao = document.getElementById('pill-desp-descricao');

  if (pillRecentes) pillRecentes.classList.toggle('active', field === 'data' && direction === 'desc' && (!state.filters.despesasCat || state.filters.despesasCat === 'all'));
  if (pillAntigas) pillAntigas.classList.toggle('active', field === 'data' && direction === 'asc');
  if (pillMaiorValor) pillMaiorValor.classList.toggle('active', field === 'valor' && direction === 'desc');
  if (pillCategoria) pillCategoria.classList.toggle('active', field === 'categoria' && direction === 'asc');
  if (pillDescricao) pillDescricao.classList.toggle('active', field === 'descricao' && direction === 'asc');

  // Indicador
  const indicator = document.getElementById('active-sort-indicator-desp');
  if (indicator) {
    let descr = '';
    if (field === 'data') descr = direction === 'desc' ? '<i class="fa-solid fa-arrow-down-wide-short"></i> Mais novas primeiro' : '<i class="fa-solid fa-arrow-up-wide-short"></i> Mais antigas primeiro';
    else if (field === 'categoria') descr = direction === 'asc' ? '<i class="fa-solid fa-arrow-down-a-z"></i> Categoria (A → Z)' : '<i class="fa-solid fa-arrow-up-z-a"></i> Categoria (Z → A)';
    else if (field === 'descricao') descr = direction === 'asc' ? '<i class="fa-solid fa-arrow-down-a-z"></i> Descrição (A → Z)' : '<i class="fa-solid fa-arrow-up-z-a"></i> Descrição (Z → A)';
    else if (field === 'valor') descr = direction === 'desc' ? '<i class="fa-solid fa-arrow-down-9-1"></i> Maior Valor' : '<i class="fa-solid fa-arrow-up-1-9"></i> Menor Valor';
    else if (field === 'formaPagamento') descr = direction === 'asc' ? '<i class="fa-solid fa-arrow-down-a-z"></i> Pagamento (A → Z)' : '<i class="fa-solid fa-arrow-up-z-a"></i> Pagamento (Z → A)';
    indicator.innerHTML = descr;
  }

  // Botão reset
  const btnReset = document.getElementById('btn-reset-filters-desp');
  if (btnReset) {
    const isFiltered = Boolean(state.filters.despesasSearch) || 
                       (state.filters.despesasCat && state.filters.despesasCat !== 'all') || 
                       (field !== 'data' || direction !== 'desc');
    if (isFiltered) {
      btnReset.classList.add('border-amber-300', 'text-[#94712F]', 'bg-amber-50/60');
      btnReset.classList.remove('border-stone-200', 'text-stone-600', 'bg-stone-50');
      btnReset.innerHTML = '<i class="fa-solid fa-rotate-left text-xs"></i> Limpar Filtros';
    } else {
      btnReset.classList.remove('border-amber-300', 'text-[#94712F]', 'bg-amber-50/60');
      btnReset.classList.add('border-stone-200', 'text-stone-600', 'bg-stone-50');
      btnReset.innerHTML = '<i class="fa-solid fa-rotate-left text-xs"></i> Restaurar Padrão';
    }
  }
}

// ------------------------------------------------------------------------------
// ORDENAÇÃO E FILTROS RÁPIDOS: RECEITAS AVULSAS & PRODUTOS (PJ)
// ------------------------------------------------------------------------------
function toggleSortOutros(field) {
  if (!state.sort) state.sort = {};
  if (!state.sort.outros) {
    state.sort.outros = { field: 'data', direction: 'desc' };
  }

  const current = state.sort.outros;
  if (current.field === field) {
    current.direction = current.direction === 'desc' ? 'asc' : 'desc';
  } else {
    current.field = field;
    if (['descricao', 'observacoes'].includes(field)) {
      current.direction = 'asc';
    } else {
      current.direction = 'desc';
    }
  }

  renderOutrosTable();
}

function applyQuickFilterOutros(filterKey) {
  if (!state.sort) state.sort = {};
  if (!state.filters) state.filters = {};

  if (filterKey === 'recentes') {
    state.sort.outros = { field: 'data', direction: 'desc' };
  } else if (filterKey === 'antigas') {
    state.sort.outros = { field: 'data', direction: 'asc' };
  } else if (filterKey === 'maior_valor') {
    state.sort.outros = { field: 'valor', direction: 'desc' };
  } else if (filterKey === 'descricao') {
    state.sort.outros = { field: 'descricao', direction: 'asc' };
  }

  renderOutrosTable();
}

function resetOutrosFilters() {
  if (!state.filters) state.filters = {};
  state.filters.outrosSearch = '';

  const searchInput = document.getElementById('search-outros');
  if (searchInput) searchInput.value = '';

  if (!state.sort) state.sort = {};
  state.sort.outros = { field: 'data', direction: 'desc' };

  renderOutrosTable();
  showToast('Ordem padrão de Receitas Extras restaurada (Mais novas primeiro)!');
}

function updateSortHeadersOutrosUI() {
  const sortCfg = state.sort?.outros || { field: 'data', direction: 'desc' };
  const field = sortCfg.field;
  const direction = sortCfg.direction;

  const columns = ['data', 'descricao', 'valor', 'observacoes'];

  columns.forEach(col => {
    const th = document.getElementById('th-sort-outros-' + col);
    const icon = document.getElementById('sort-icon-outros-' + col);
    if (!th || !icon) return;

    if (col === field) {
      th.classList.add('active-sort');
      if (col === 'data') {
        icon.className = direction === 'desc' 
          ? 'fa-solid fa-arrow-down-wide-short text-[#C5A059] text-[11px]' 
          : 'fa-solid fa-arrow-up-wide-short text-[#C5A059] text-[11px]';
        th.title = direction === 'desc' 
          ? 'Data: Mais novas no topo (Clique para inverter)' 
          : 'Data: Mais antigas no topo (Clique para inverter)';
      } else if (['descricao', 'observacoes'].includes(col)) {
        icon.className = direction === 'asc' 
          ? 'fa-solid fa-arrow-down-a-z text-[#C5A059] text-[11px]' 
          : 'fa-solid fa-arrow-up-z-a text-[#C5A059] text-[11px]';
        th.title = direction === 'asc' 
          ? 'Ordem alfabética (A-Z) (Clique para Z-A)' 
          : 'Ordem alfabética (Z-A) (Clique para A-Z)';
      } else if (col === 'valor') {
        icon.className = direction === 'desc' 
          ? 'fa-solid fa-arrow-down-9-1 text-[#C5A059] text-[11px]' 
          : 'fa-solid fa-arrow-up-1-9 text-[#C5A059] text-[11px]';
        th.title = direction === 'desc' 
          ? 'Maior valor no topo (Clique para menor)' 
          : 'Menor valor no topo (Clique para maior)';
      }
    } else {
      th.classList.remove('active-sort');
      icon.className = 'fa-solid fa-sort text-gray-300 text-[11px]';
    }
  });

  // Pílulas
  const pillRecentes = document.getElementById('pill-outros-recentes');
  const pillAntigas = document.getElementById('pill-outros-antigas');
  const pillMaiorValor = document.getElementById('pill-outros-maior_valor');
  const pillDescricao = document.getElementById('pill-outros-descricao');

  if (pillRecentes) pillRecentes.classList.toggle('active', field === 'data' && direction === 'desc');
  if (pillAntigas) pillAntigas.classList.toggle('active', field === 'data' && direction === 'asc');
  if (pillMaiorValor) pillMaiorValor.classList.toggle('active', field === 'valor' && direction === 'desc');
  if (pillDescricao) pillDescricao.classList.toggle('active', field === 'descricao' && direction === 'asc');

  // Indicador
  const indicator = document.getElementById('active-sort-indicator-outros');
  if (indicator) {
    let descr = '';
    if (field === 'data') descr = direction === 'desc' ? '<i class="fa-solid fa-arrow-down-wide-short"></i> Mais novas primeiro' : '<i class="fa-solid fa-arrow-up-wide-short"></i> Mais antigas primeiro';
    else if (field === 'descricao') descr = direction === 'asc' ? '<i class="fa-solid fa-arrow-down-a-z"></i> Descrição (A → Z)' : '<i class="fa-solid fa-arrow-up-z-a"></i> Descrição (Z → A)';
    else if (field === 'valor') descr = direction === 'desc' ? '<i class="fa-solid fa-arrow-down-9-1"></i> Maior Valor' : '<i class="fa-solid fa-arrow-up-1-9"></i> Menor Valor';
    else if (field === 'observacoes') descr = direction === 'asc' ? '<i class="fa-solid fa-arrow-down-a-z"></i> Observações (A → Z)' : '<i class="fa-solid fa-arrow-up-z-a"></i> Observações (Z → A)';
    indicator.innerHTML = descr;
  }

  // Botão reset
  const btnReset = document.getElementById('btn-reset-filters-outros');
  if (btnReset) {
    const isFiltered = Boolean(state.filters.outrosSearch) || (field !== 'data' || direction !== 'desc');
    if (isFiltered) {
      btnReset.classList.add('border-amber-300', 'text-[#94712F]', 'bg-amber-50/60');
      btnReset.classList.remove('border-stone-200', 'text-stone-600', 'bg-stone-50');
      btnReset.innerHTML = '<i class="fa-solid fa-rotate-left text-xs"></i> Limpar Filtros';
    } else {
      btnReset.classList.remove('border-amber-300', 'text-[#94712F]', 'bg-amber-50/60');
      btnReset.classList.add('border-stone-200', 'text-stone-600', 'bg-stone-50');
      btnReset.innerHTML = '<i class="fa-solid fa-rotate-left text-xs"></i> Restaurar Padrão';
    }
  }
}

// ------------------------------------------------------------------------------
// ORDENAÇÃO E FILTROS RÁPIDOS: FINANÇAS PESSOAIS (PF)
// ------------------------------------------------------------------------------
function toggleSortPessoal(field) {
  if (!state.sort) state.sort = {};
  if (!state.sort.pessoal) {
    state.sort.pessoal = { field: 'data', direction: 'desc' };
  }

  const current = state.sort.pessoal;
  if (current.field === field) {
    current.direction = current.direction === 'desc' ? 'asc' : 'desc';
  } else {
    current.field = field;
    if (['tipo', 'categoria', 'descricao'].includes(field)) {
      current.direction = 'asc';
    } else {
      current.direction = 'desc';
    }
  }

  renderPessoalTable();
}

function applyQuickFilterPessoal(filterKey) {
  if (!state.sort) state.sort = {};
  if (!state.filters) state.filters = {};

  if (filterKey === 'recentes') {
    state.sort.pessoal = { field: 'data', direction: 'desc' };
    state.filters.pessoalTipo = 'all';
    const sel = document.getElementById('filter-tipo-pessoal');
    if (sel) sel.value = 'all';
  } else if (filterKey === 'antigas') {
    state.sort.pessoal = { field: 'data', direction: 'asc' };
  } else if (filterKey === 'entradas') {
    state.filters.pessoalTipo = state.filters.pessoalTipo === 'receita' ? 'all' : 'receita';
    const sel = document.getElementById('filter-tipo-pessoal');
    if (sel) sel.value = state.filters.pessoalTipo;
  } else if (filterKey === 'gastos') {
    state.filters.pessoalTipo = state.filters.pessoalTipo === 'despesa' ? 'all' : 'despesa';
    const sel = document.getElementById('filter-tipo-pessoal');
    if (sel) sel.value = state.filters.pessoalTipo;
  } else if (filterKey === 'maior_valor') {
    state.sort.pessoal = { field: 'valor', direction: 'desc' };
  } else if (filterKey === 'categoria') {
    state.sort.pessoal = { field: 'categoria', direction: 'asc' };
  }

  renderPessoalTable();
}

function resetPessoalFilters() {
  if (!state.filters) state.filters = {};
  state.filters.pessoalSearch = '';
  state.filters.pessoalTipo = 'all';

  const searchInput = document.getElementById('search-pessoal');
  if (searchInput) searchInput.value = '';

  const filterTipo = document.getElementById('filter-tipo-pessoal');
  if (filterTipo) filterTipo.value = 'all';

  if (!state.sort) state.sort = {};
  state.sort.pessoal = { field: 'data', direction: 'desc' };

  renderPessoalTable();
  showToast('Ordem padrão de Finanças Pessoais restaurada (Mais novos primeiro)!');
}

function updateSortHeadersPessoalUI() {
  const sortCfg = state.sort?.pessoal || { field: 'data', direction: 'desc' };
  const field = sortCfg.field;
  const direction = sortCfg.direction;

  const columns = ['data', 'tipo', 'categoria', 'descricao', 'valor'];

  columns.forEach(col => {
    const th = document.getElementById('th-sort-pess-' + col);
    const icon = document.getElementById('sort-icon-pess-' + col);
    if (!th || !icon) return;

    if (col === field) {
      th.classList.add('active-sort');
      if (col === 'data') {
        icon.className = direction === 'desc' 
          ? 'fa-solid fa-arrow-down-wide-short text-[#C5A059] text-[11px]' 
          : 'fa-solid fa-arrow-up-wide-short text-[#C5A059] text-[11px]';
        th.title = direction === 'desc' 
          ? 'Data: Mais novos no topo (Clique para inverter)' 
          : 'Data: Mais antigos no topo (Clique para inverter)';
      } else if (['tipo', 'categoria', 'descricao'].includes(col)) {
        icon.className = direction === 'asc' 
          ? 'fa-solid fa-arrow-down-a-z text-[#C5A059] text-[11px]' 
          : 'fa-solid fa-arrow-up-z-a text-[#C5A059] text-[11px]';
        th.title = direction === 'asc' 
          ? 'Ordem alfabética (A-Z) (Clique para Z-A)' 
          : 'Ordem alfabética (Z-A) (Clique para A-Z)';
      } else if (col === 'valor') {
        icon.className = direction === 'desc' 
          ? 'fa-solid fa-arrow-down-9-1 text-[#C5A059] text-[11px]' 
          : 'fa-solid fa-arrow-up-1-9 text-[#C5A059] text-[11px]';
        th.title = direction === 'desc' 
          ? 'Maior valor no topo (Clique para menor)' 
          : 'Menor valor no topo (Clique para maior)';
      }
    } else {
      th.classList.remove('active-sort');
      icon.className = 'fa-solid fa-sort text-gray-300 text-[11px]';
    }
  });

  // Pílulas
  const pillRecentes = document.getElementById('pill-pess-recentes');
  const pillAntigas = document.getElementById('pill-pess-antigas');
  const pillEntradas = document.getElementById('pill-pess-entradas');
  const pillGastos = document.getElementById('pill-pess-gastos');
  const pillMaiorValor = document.getElementById('pill-pess-maior_valor');
  const pillCategoria = document.getElementById('pill-pess-categoria');

  if (pillRecentes) pillRecentes.classList.toggle('active', field === 'data' && direction === 'desc' && (!state.filters.pessoalTipo || state.filters.pessoalTipo === 'all'));
  if (pillAntigas) pillAntigas.classList.toggle('active', field === 'data' && direction === 'asc');
  if (pillEntradas) pillEntradas.classList.toggle('active', state.filters.pessoalTipo === 'receita');
  if (pillGastos) pillGastos.classList.toggle('active', state.filters.pessoalTipo === 'despesa');
  if (pillMaiorValor) pillMaiorValor.classList.toggle('active', field === 'valor' && direction === 'desc');
  if (pillCategoria) pillCategoria.classList.toggle('active', field === 'categoria' && direction === 'asc');

  // Indicador
  const indicator = document.getElementById('active-sort-indicator-pess');
  if (indicator) {
    let descr = '';
    if (field === 'data') descr = direction === 'desc' ? '<i class="fa-solid fa-arrow-down-wide-short"></i> Mais novos primeiro' : '<i class="fa-solid fa-arrow-up-wide-short"></i> Mais antigas primeiro';
    else if (field === 'tipo') descr = direction === 'asc' ? '<i class="fa-solid fa-arrow-down-a-z"></i> Tipo (A → Z)' : '<i class="fa-solid fa-arrow-up-z-a"></i> Tipo (Z → A)';
    else if (field === 'categoria') descr = direction === 'asc' ? '<i class="fa-solid fa-arrow-down-a-z"></i> Categoria (A → Z)' : '<i class="fa-solid fa-arrow-up-z-a"></i> Categoria (Z → A)';
    else if (field === 'descricao') descr = direction === 'asc' ? '<i class="fa-solid fa-arrow-down-a-z"></i> Descrição (A → Z)' : '<i class="fa-solid fa-arrow-up-z-a"></i> Descrição (Z → A)';
    else if (field === 'valor') descr = direction === 'desc' ? '<i class="fa-solid fa-arrow-down-9-1"></i> Maior Valor' : '<i class="fa-solid fa-arrow-up-1-9"></i> Menor Valor';
    indicator.innerHTML = descr;
  }

  // Botão reset
  const btnReset = document.getElementById('btn-reset-filters-pess');
  if (btnReset) {
    const isFiltered = Boolean(state.filters.pessoalSearch) || 
                       (state.filters.pessoalTipo && state.filters.pessoalTipo !== 'all') || 
                       (field !== 'data' || direction !== 'desc');
    if (isFiltered) {
      btnReset.classList.add('border-amber-300', 'text-[#94712F]', 'bg-amber-50/60');
      btnReset.classList.remove('border-stone-200', 'text-stone-600', 'bg-stone-50');
      btnReset.innerHTML = '<i class="fa-solid fa-rotate-left text-xs"></i> Limpar Filtros';
    } else {
      btnReset.classList.remove('border-amber-300', 'text-[#94712F]', 'bg-amber-50/60');
      btnReset.classList.add('border-stone-200', 'text-stone-600', 'bg-stone-50');
      btnReset.innerHTML = '<i class="fa-solid fa-rotate-left text-xs"></i> Restaurar Padrão';
    }
  }
}

// ==============================================================================
// MELHORIAS DE USABILIDADE: LINHAS CLICÁVEIS, SELEÇÃO E EXCLUSÃO EM MASSA
// ==============================================================================

/**
 * Abre a edição correspondente quando o usuário clica em qualquer lugar da linha ou card.
 * Ignora se o clique foi em botões, checkboxes, selects ou links.
 */
function handleRowClick(event, tab, itemKey) {
  if (event && event.target && event.target.closest('button, input, select, label, a, .no-row-click')) {
    return;
  }
  if (tab === 'atendimentos') {
    openEditAtendimento(itemKey);
  } else if (tab === 'despesas') {
    openEditDespesa(itemKey);
  } else if (tab === 'outros') {
    openEditReceitaExtra(itemKey);
  } else if (tab === 'pessoal') {
    openEditPessoal(itemKey);
  }
}

/**
 * Alterna a seleção de um item individual (checkbox)
 */
function toggleSelectItem(tab, itemKey, event) {
  if (event) event.stopPropagation();
  if (!state.selectedItems[tab]) state.selectedItems[tab] = new Set();
  
  const keyStr = String(itemKey);
  if (state.selectedItems[tab].has(keyStr)) {
    state.selectedItems[tab].delete(keyStr);
  } else {
    state.selectedItems[tab].add(keyStr);
  }

  // Re-renderiza a tabela da aba para atualizar os destaques visuais e contadores
  if (tab === 'atendimentos') renderAtendimentosTable();
  else if (tab === 'despesas') renderDespesasTable();
  else if (tab === 'outros') renderOutrosTable();
  else if (tab === 'pessoal') renderPessoalTable();

  updateBulkActionBar();
}

/**
 * Retorna os itens atualmente filtrados/visíveis da aba especificada
 */
function getVisibleItemsForTab(tab) {
  if (tab === 'atendimentos') {
    let list = filterByPeriod(state.data.atendimentos || []);
    if (state.filters.search) {
      list = list.filter(a => {
        const cliente = (a.cliente || '').toLowerCase();
        const servico = (a.servico || '').toLowerCase();
        return cliente.includes(state.filters.search) || servico.includes(state.filters.search);
      });
    }
    if (state.filters.status !== 'all') {
      list = list.filter(a => (a.situacao || '').toLowerCase() === state.filters.status.toLowerCase());
    }
    if (state.filters.payment !== 'all') {
      list = list.filter(a => (a.formaPagamento || '').toLowerCase().includes(state.filters.payment.toLowerCase()));
    }
    const sortCfg = state.sort?.atendimentos || { field: 'data', direction: 'desc' };
    return sortItemList(list, sortCfg.field, sortCfg.direction);
  } else if (tab === 'despesas') {
    let list = filterByPeriod(state.data.despesas || []);
    if (state.filters.despesasSearch) {
      const q = state.filters.despesasSearch.toLowerCase();
      list = list.filter(d => (d.descricao || '').toLowerCase().includes(q) || (d.categoria || '').toLowerCase().includes(q) || (d.observacoes || '').toLowerCase().includes(q));
    }
    if (state.filters.despesasCat && state.filters.despesasCat !== 'all') {
      list = list.filter(d => (d.categoria || '').toLowerCase() === state.filters.despesasCat.toLowerCase());
    }
    const sortCfg = state.sort?.despesas || { field: 'data', direction: 'desc' };
    return sortItemList(list, sortCfg.field, sortCfg.direction);
  } else if (tab === 'outros') {
    let list = filterByPeriod(state.data.outros || []);
    if (state.filters.outrosSearch) {
      const q = state.filters.outrosSearch.toLowerCase();
      list = list.filter(o => (o.descricao || '').toLowerCase().includes(q) || (o.observacoes || '').toLowerCase().includes(q));
    }
    const sortCfg = state.sort?.outros || { field: 'data', direction: 'desc' };
    return sortItemList(list, sortCfg.field, sortCfg.direction);
  } else if (tab === 'pessoal') {
    let list = filterByPeriod(state.data.pessoal || []);
    if (state.filters.pessoalSearch) {
      const q = state.filters.pessoalSearch.toLowerCase();
      list = list.filter(p => (p.descricao || '').toLowerCase().includes(q) || (p.categoria || '').toLowerCase().includes(q) || (p.observacoes || '').toLowerCase().includes(q));
    }
    if (state.filters.pessoalTipo && state.filters.pessoalTipo !== 'all') {
      list = list.filter(p => (p.tipo || '').toLowerCase() === state.filters.pessoalTipo.toLowerCase());
    }
    const sortCfg = state.sort?.pessoal || { field: 'data', direction: 'desc' };
    return sortItemList(list, sortCfg.field, sortCfg.direction);
  }
  return [];
}

/**
 * Seleciona ou desseleciona todos os itens visíveis na aba atual
 */
function toggleSelectAll(tab, event) {
  if (event) event.stopPropagation();
  if (!state.selectedItems[tab]) state.selectedItems[tab] = new Set();

  const visible = getVisibleItemsForTab(tab);
  if (visible.length === 0) return;

  const allVisibleSelected = visible.every((item, idx) => {
    const key = String(item._id || item.id || item._rowIndex || idx);
    return state.selectedItems[tab].has(key);
  });

  if (allVisibleSelected) {
    // Desmarca todos os visíveis
    visible.forEach((item, idx) => {
      const key = String(item._id || item.id || item._rowIndex || idx);
      state.selectedItems[tab].delete(key);
    });
  } else {
    // Marca todos os visíveis
    visible.forEach((item, idx) => {
      const key = String(item._id || item.id || item._rowIndex || idx);
      state.selectedItems[tab].add(key);
    });
  }

  if (tab === 'atendimentos') renderAtendimentosTable();
  else if (tab === 'despesas') renderDespesasTable();
  else if (tab === 'outros') renderOutrosTable();
  else if (tab === 'pessoal') renderPessoalTable();

  updateBulkActionBar();
}

/**
 * Atualiza o checkbox "Selecionar Todos" no cabeçalho da tabela
 */
function updateSelectAllHeader(tab) {
  const chkAll = document.getElementById(`chk-all-${tab}`);
  if (!chkAll) return;

  const visible = getVisibleItemsForTab(tab);
  if (!visible || visible.length === 0) {
    chkAll.checked = false;
    chkAll.indeterminate = false;
    return;
  }

  const selectedCount = visible.filter((item, idx) => {
    const key = String(item._id || item.id || item._rowIndex || idx);
    return state.selectedItems[tab]?.has(key);
  }).length;

  if (selectedCount === 0) {
    chkAll.checked = false;
    chkAll.indeterminate = false;
  } else if (selectedCount === visible.length) {
    chkAll.checked = true;
    chkAll.indeterminate = false;
  } else {
    chkAll.checked = false;
    chkAll.indeterminate = true;
  }
}

/**
 * Desmarca todos os itens selecionados na aba atual
 */
function clearCurrentTabSelection() {
  const tab = state.currentTab;
  if (state.selectedItems[tab]) {
    state.selectedItems[tab].clear();
  }
  if (tab === 'atendimentos') renderAtendimentosTable();
  else if (tab === 'despesas') renderDespesasTable();
  else if (tab === 'outros') renderOutrosTable();
  else if (tab === 'pessoal') renderPessoalTable();

  updateBulkActionBar();
}

/**
 * Atualiza a visibilidade e o texto da barra flutuante de ações em massa
 */
function updateBulkActionBar() {
  const bar = document.getElementById('bulk-action-bar');
  if (!bar) return;

  const validTabs = ['atendimentos', 'despesas', 'outros', 'pessoal'];
  const tab = state.currentTab;

  if (!validTabs.includes(tab)) {
    bar.classList.add('hidden');
    return;
  }

  const selectedSet = state.selectedItems[tab];
  const count = selectedSet ? selectedSet.size : 0;

  if (count === 0) {
    bar.classList.add('hidden');
    return;
  }

  bar.classList.remove('hidden');

  const badgeEl = document.getElementById('bulk-selected-badge');
  if (badgeEl) badgeEl.textContent = count;

  const textEl = document.getElementById('bulk-selected-text');
  if (textEl) {
    let singular = 'item';
    let plural = 'itens';
    if (tab === 'atendimentos') {
      singular = state.config?.terms?.operacaoSingular || 'atendimento';
      plural = state.config?.terms?.operacaoPlural || 'atendimentos';
    } else if (tab === 'despesas') {
      singular = 'despesa';
      plural = 'despesas';
    } else if (tab === 'outros') {
      singular = 'receita';
      plural = 'receitas';
    } else if (tab === 'pessoal') {
      singular = 'lançamento';
      plural = 'lançamentos';
    }
    const label = count === 1 ? singular.toLowerCase() : plural.toLowerCase();
    textEl.textContent = `${count} ${label} ${count === 1 ? 'selecionado' : 'selecionados'}`;
  }
}

/**
 * Exclui em lote todos os itens selecionados na aba atual
 */
async function deleteBulkSelected() {
  const tab = state.currentTab;
  const validTabs = ['atendimentos', 'despesas', 'outros', 'pessoal'];
  if (!validTabs.includes(tab)) return;

  const selectedSet = state.selectedItems[tab];
  if (!selectedSet || selectedSet.size === 0) return;

  const count = selectedSet.size;
  let termLabel = 'lançamentos';
  if (tab === 'atendimentos') termLabel = (state.config?.terms?.operacaoPlural || 'atendimentos').toLowerCase();
  else if (tab === 'despesas') termLabel = 'despesas';
  else if (tab === 'outros') termLabel = 'receitas';
  else if (tab === 'pessoal') termLabel = 'lançamentos pessoais';

  const confirmMsg = count === 1
    ? `Deseja realmente excluir o item selecionado? Esta ação não pode ser desfeita.`
    : `Deseja realmente excluir os ${count} ${termLabel} selecionados em massa? Esta ação não pode ser desfeita.`;

  if (!confirm(confirmMsg)) return;

  const selectedKeys = Array.from(selectedSet);
  const list = state.data[tab] || [];
  const removedItems = [];

  state.data[tab] = list.filter((item, idx) => {
    const key1 = String(item._id || '');
    const key2 = String(item.id || '');
    const key3 = String(item._rowIndex || '');
    const key4 = String(idx);

    const isMatch = selectedKeys.includes(key1) || 
                    selectedKeys.includes(key2) || 
                    selectedKeys.includes(key3) || 
                    selectedKeys.includes(key4);
    if (isMatch) {
      removedItems.push(item);
      return false; // remove
    }
    return true; // mantém
  });

  // Limpa a seleção da aba
  state.selectedItems[tab].clear();
  saveLocalCache();

  // Se logado no Supabase, exclui da nuvem com .in('id', ids)
  if (state.currentUser && state.supabaseClient) {
    const idsToDelete = removedItems
      .map(item => item._id || item.id)
      .filter(id => id && (typeof id === 'string' && (id.length > 10 || isNaN(Number(id)))));

    if (idsToDelete.length > 0) {
      const tableMap = {
        'atendimentos': 'atendimentos',
        'despesas': 'despesas_empresa',
        'outros': 'receitas_extras',
        'pessoal': 'financas_pessoais'
      };
      const tbl = tableMap[tab];
      if (tbl) {
        state.supabaseClient.from(tbl).delete().in('id', idsToDelete).then(({ error }) => {
          if (error) console.error('Erro ao excluir em massa no Supabase:', error);
        });
      }
    }
  }

  showToast(`${count} ${count > 1 ? `${termLabel} excluídos` : `${termLabel} excluído`} com sucesso!`);
  renderAll();
  updateBulkActionBar();
}

/**
 * Trata o clique no botão de deletar posicionado dentro do modal de edição
 */
function handleDeleteFromModal(sheetType) {
  let inputId = '';
  let modalId = '';
  if (sheetType === 'Atendimentos') {
    inputId = 'modal-atend-rowindex';
    modalId = 'modal-novo-atendimento';
  } else if (sheetType === 'Despesas') {
    inputId = 'modal-desp-rowindex';
    modalId = 'modal-nova-despesa';
  } else if (sheetType === 'Outros') {
    inputId = 'modal-extra-rowindex';
    modalId = 'modal-nova-receita-extra';
  } else if (sheetType === 'Pessoal') {
    inputId = 'modal-pess-rowindex';
    modalId = 'modal-novo-pessoal';
  }

  const rowIndex = document.getElementById(inputId)?.value;
  if (!rowIndex) return;

  const wasDeleted = deleteItem(sheetType, rowIndex);
  if (wasDeleted !== false) {
    closeModal(modalId);
  }
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
      const cliente = (a.cliente || '').toLowerCase();
      const servico = (a.servico || '').toLowerCase();
      return cliente.includes(state.filters.search) || servico.includes(state.filters.search);
    });
  }

  if (state.filters.status !== 'all') {
    list = list.filter(a => (a.situacao || '').toLowerCase() === state.filters.status.toLowerCase());
  }

  if (state.filters.payment !== 'all') {
    list = list.filter(a => (a.formaPagamento || '').toLowerCase().includes(state.filters.payment.toLowerCase()));
  }

  // Ordenação ativa (Padrão: Mais novos para os mais antigos)
  const sortCfg = state.sort?.atendimentos || { field: 'data', direction: 'desc' };
  list = sortItemList(list, sortCfg.field, sortCfg.direction);

  updateSortHeadersUI();

  if (list.length === 0) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="10" class="text-center py-8 text-gray-400 font-light">Nenhum atendimento encontrado para o período ou filtro selecionado.</td></tr>`;
    if (cards) cards.innerHTML = `<div class="card-lux p-8 text-center text-gray-400 font-light text-sm">Nenhum atendimento encontrado para o período ou filtro selecionado.</div>`;
    updateSelectAllHeader('atendimentos');
    updateBulkActionBar();
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

      const itemKey = String(a._id || a.id || a._rowIndex || idx);
      const isSelected = state.selectedItems.atendimentos ? state.selectedItems.atendimentos.has(itemKey) : false;

      return `
        <tr class="row-clickable transition-colors ${isSelected ? 'row-selected' : ''}" onclick="handleRowClick(event, 'atendimentos', '${itemKey}')" title="Clique para editar este atendimento">
          <td class="w-10 text-center no-row-click px-3 py-3" onclick="event.stopPropagation()">
            <input type="checkbox" data-id="${itemKey}" ${isSelected ? 'checked' : ''} onchange="toggleSelectItem('atendimentos', '${itemKey}', event)" onclick="event.stopPropagation()" class="custom-checkbox cursor-pointer" title="Selecionar atendimento">
          </td>
          <td class="font-medium text-xs text-gray-500 whitespace-nowrap">${dataFmt}</td>
          <td class="font-semibold text-gray-800">${a.cliente}</td>
          <td class="text-gray-700 font-medium">${a.servico}</td>
          <td class="font-bold text-gray-900 whitespace-nowrap">${formatBRL(a.valorTotal)}</td>
          <td class="text-xs text-gray-600 whitespace-nowrap">
            ${a.sinal > 0 ? `<span class="badge-gold px-2 py-0.5 rounded font-medium text-[11px] block w-fit mb-0.5">Sinal: ${formatBRL(a.sinal)}</span>` : ''}
            <span>Restante: ${formatBRL(a.restante)}</span>
          </td>
          <td class="font-medium whitespace-nowrap ${a.aReceber > 0 ? 'text-amber-600 font-bold' : 'text-gray-400'}">${formatBRL(a.aReceber)}</td>
          <td class="text-xs text-gray-600 whitespace-nowrap">
            <span class="inline-block px-2 py-0.5 bg-gray-100 rounded text-gray-700 font-medium">${a.formaPagamento}</span>
            ${a.parcelas && a.parcelas !== 'À vista' ? `<span class="text-[10px] text-gray-400 block mt-0.5">${a.parcelas}</span>` : ''}
          </td>
          <td class="whitespace-nowrap">${badgeStatus}</td>
          <td class="text-right whitespace-nowrap no-row-click" onclick="event.stopPropagation()">
            <button onclick="openEditAtendimento('${itemKey}')" class="text-gray-400 hover:text-[#C5A059] transition-colors p-1 mr-1.5" title="Editar Atendimento">
              <i class="fa-regular fa-pen-to-square"></i>
            </button>
            <button onclick="deleteItem('Atendimentos', '${itemKey}')" class="text-gray-400 hover:text-rose-500 transition-colors p-1" title="Excluir">
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

      const itemKey = String(a._id || a.id || a._rowIndex || idx);
      const isSelected = state.selectedItems.atendimentos ? state.selectedItems.atendimentos.has(itemKey) : false;

      return `
        <div class="card-lux mobile-card card-clickable p-4 space-y-3 ${isSelected ? 'card-selected' : ''}" onclick="handleRowClick(event, 'atendimentos', '${itemKey}')" title="Toque para editar">
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-start gap-2.5">
              <div class="pt-0.5 no-row-click" onclick="event.stopPropagation()">
                <input type="checkbox" data-id="${itemKey}" ${isSelected ? 'checked' : ''} onchange="toggleSelectItem('atendimentos', '${itemKey}', event)" onclick="event.stopPropagation()" class="custom-checkbox cursor-pointer" title="Selecionar atendimento">
              </div>
              <div>
                <span class="text-[11px] text-gray-400 font-medium block">${dataFmt}</span>
                <h4 class="font-bold text-gray-900 text-sm mt-0.5 leading-snug">${a.cliente}</h4>
              </div>
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
            <div class="flex items-center gap-2 no-row-click" onclick="event.stopPropagation()">
              <button onclick="openEditAtendimento('${itemKey}')" class="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-[#C5A059] font-semibold text-xs flex items-center gap-1.5 transition-colors">
                <i class="fa-regular fa-pen-to-square"></i> Editar
              </button>
              <button onclick="deleteItem('Atendimentos', '${itemKey}')" class="p-1.5 text-gray-400 hover:text-rose-500 transition-colors" title="Excluir">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  updateSelectAllHeader('atendimentos');
  updateBulkActionBar();
}

// Renderiza a Tabela e os Cards Mobile de Despesas da Empresa
function renderDespesasTable() {
  const tbody = document.getElementById('tbody-despesas');
  const cards = document.getElementById('cards-despesas');
  if (!tbody && !cards) return;

  updateSortHeadersDespesasUI();
  let list = getVisibleItemsForTab('despesas');

  if (list.length === 0) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-gray-400 font-light">Nenhuma despesa registrada para este período.</td></tr>`;
    if (cards) cards.innerHTML = `<div class="card-lux p-8 text-center text-gray-400 font-light text-sm">Nenhuma despesa registrada para este período.</div>`;
    updateSelectAllHeader('despesas');
    updateBulkActionBar();
    return;
  }

  // 1. Tabela Desktop
  if (tbody) {
    tbody.innerHTML = list.map((d, idx) => {
      const dataFmt = formatDateBR(d.data);
      const itemKey = String(d._id || d.id || d._rowIndex || idx);
      const isSelected = state.selectedItems.despesas ? state.selectedItems.despesas.has(itemKey) : false;

      return `
        <tr class="row-clickable transition-colors ${isSelected ? 'row-selected' : ''}" onclick="handleRowClick(event, 'despesas', '${itemKey}')" title="Clique para editar esta despesa">
          <td class="w-10 text-center no-row-click px-3 py-3" onclick="event.stopPropagation()">
            <input type="checkbox" data-id="${itemKey}" ${isSelected ? 'checked' : ''} onchange="toggleSelectItem('despesas', '${itemKey}', event)" onclick="event.stopPropagation()" class="custom-checkbox cursor-pointer" title="Selecionar despesa">
          </td>
          <td class="text-xs text-gray-500 whitespace-nowrap">${dataFmt}</td>
          <td><span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700">${d.categoria}</span></td>
          <td class="text-gray-800 font-medium">${d.descricao}</td>
          <td class="font-bold text-rose-600">${formatBRL(d.valor)}</td>
          <td class="text-xs text-gray-600">${d.formaPagamento} ${d.parcelas && d.parcelas !== 'À vista' ? `(${d.parcelas})` : ''}</td>
          <td class="text-right whitespace-nowrap no-row-click" onclick="event.stopPropagation()">
            <button onclick="openEditDespesa('${itemKey}')" class="text-gray-400 hover:text-[#C5A059] transition-colors p-1 mr-1.5" title="Editar Despesa">
              <i class="fa-regular fa-pen-to-square"></i>
            </button>
            <button onclick="deleteItem('Despesas', '${itemKey}')" class="text-gray-400 hover:text-rose-500 transition-colors p-1" title="Excluir">
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
      const itemKey = String(d._id || d.id || d._rowIndex || idx);
      const isSelected = state.selectedItems.despesas ? state.selectedItems.despesas.has(itemKey) : false;

      return `
        <div class="card-lux mobile-card card-clickable p-4 space-y-2.5 ${isSelected ? 'card-selected' : ''}" onclick="handleRowClick(event, 'despesas', '${itemKey}')" title="Toque para editar">
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-start gap-2.5">
              <div class="pt-0.5 no-row-click" onclick="event.stopPropagation()">
                <input type="checkbox" data-id="${itemKey}" ${isSelected ? 'checked' : ''} onchange="toggleSelectItem('despesas', '${itemKey}', event)" onclick="event.stopPropagation()" class="custom-checkbox cursor-pointer" title="Selecionar despesa">
              </div>
              <div>
                <span class="text-[11px] text-gray-400 font-medium block">${dataFmt}</span>
                <h4 class="font-bold text-gray-800 text-sm mt-0.5">${d.descricao}</h4>
              </div>
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

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-black/5 no-row-click" onclick="event.stopPropagation()">
            <button onclick="openEditDespesa('${itemKey}')" class="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-[#C5A059] font-semibold text-xs flex items-center gap-1.5 transition-colors">
              <i class="fa-regular fa-pen-to-square"></i> Editar
            </button>
            <button onclick="deleteItem('Despesas', '${itemKey}')" class="p-1.5 text-gray-400 hover:text-rose-500 transition-colors" title="Excluir">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  updateSelectAllHeader('despesas');
  updateBulkActionBar();
}

// Renderiza a Tabela e os Cards Mobile de Receitas Extras / Avulsas
function renderOutrosTable() {
  const tbody = document.getElementById('tbody-outros');
  const cards = document.getElementById('cards-outros');
  if (!tbody && !cards) return;

  updateSortHeadersOutrosUI();
  let list = getVisibleItemsForTab('outros');

  if (list.length === 0) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-gray-400 font-light">Nenhuma receita extra registrada para este período.</td></tr>`;
    if (cards) cards.innerHTML = `<div class="card-lux p-8 text-center text-gray-400 font-light text-sm">Nenhuma receita extra registrada para este período.</div>`;
    updateSelectAllHeader('outros');
    updateBulkActionBar();
    return;
  }

  // 1. Tabela Desktop
  if (tbody) {
    tbody.innerHTML = list.map((o, idx) => {
      const dataFmt = formatDateBR(o.data);
      const itemKey = String(o._id || o.id || o._rowIndex || idx);
      const isSelected = state.selectedItems.outros ? state.selectedItems.outros.has(itemKey) : false;

      return `
        <tr class="row-clickable transition-colors ${isSelected ? 'row-selected' : ''}" onclick="handleRowClick(event, 'outros', '${itemKey}')" title="Clique para editar esta receita extra">
          <td class="w-10 text-center no-row-click px-3 py-3" onclick="event.stopPropagation()">
            <input type="checkbox" data-id="${itemKey}" ${isSelected ? 'checked' : ''} onchange="toggleSelectItem('outros', '${itemKey}', event)" onclick="event.stopPropagation()" class="custom-checkbox cursor-pointer" title="Selecionar receita">
          </td>
          <td class="text-xs text-gray-500 whitespace-nowrap">${dataFmt}</td>
          <td class="font-medium text-gray-800">${o.descricao}</td>
          <td class="font-bold text-emerald-600">${formatBRL(o.valor)}</td>
          <td class="text-xs text-gray-500">${o.observacoes}</td>
          <td class="text-right whitespace-nowrap no-row-click" onclick="event.stopPropagation()">
            <button onclick="openEditReceitaExtra('${itemKey}')" class="text-gray-400 hover:text-[#C5A059] transition-colors p-1 mr-1.5" title="Editar Receita Extra">
              <i class="fa-regular fa-pen-to-square"></i>
            </button>
            <button onclick="deleteItem('Outros', '${itemKey}')" class="text-gray-400 hover:text-rose-500 transition-colors p-1" title="Excluir">
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
      const itemKey = String(o._id || o.id || o._rowIndex || idx);
      const isSelected = state.selectedItems.outros ? state.selectedItems.outros.has(itemKey) : false;

      return `
        <div class="card-lux mobile-card card-clickable p-4 space-y-2.5 ${isSelected ? 'card-selected' : ''}" onclick="handleRowClick(event, 'outros', '${itemKey}')" title="Toque para editar">
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-start gap-2.5">
              <div class="pt-0.5 no-row-click" onclick="event.stopPropagation()">
                <input type="checkbox" data-id="${itemKey}" ${isSelected ? 'checked' : ''} onchange="toggleSelectItem('outros', '${itemKey}', event)" onclick="event.stopPropagation()" class="custom-checkbox cursor-pointer" title="Selecionar receita">
              </div>
              <div>
                <span class="text-[11px] text-gray-400 font-medium block">${dataFmt}</span>
                <h4 class="font-bold text-gray-800 text-sm mt-0.5">${o.descricao}</h4>
              </div>
            </div>
            <div class="text-right">
              <span class="text-[10px] text-gray-400 uppercase font-semibold block">Valor Recebido</span>
              <span class="font-bold text-emerald-600 text-base">${formatBRL(o.valor)}</span>
            </div>
          </div>

          ${o.observacoes ? `<p class="text-xs text-gray-500 bg-stone-50 p-2 rounded-lg border border-black/5">${o.observacoes}</p>` : ''}

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-black/5 no-row-click" onclick="event.stopPropagation()">
            <button onclick="openEditReceitaExtra('${itemKey}')" class="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-[#C5A059] font-semibold text-xs flex items-center gap-1.5 transition-colors">
              <i class="fa-regular fa-pen-to-square"></i> Editar
            </button>
            <button onclick="deleteItem('Outros', '${itemKey}')" class="p-1.5 text-gray-400 hover:text-rose-500 transition-colors" title="Excluir">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  updateSelectAllHeader('outros');
  updateBulkActionBar();
}

// Renderiza a Tabela e os Cards Mobile de Finanças Pessoais
function renderPessoalTable() {
  const tbody = document.getElementById('tbody-pessoal');
  const cards = document.getElementById('cards-pessoal');
  if (!tbody && !cards) return;

  updateSortHeadersPessoalUI();
  let list = getVisibleItemsForTab('pessoal');

  if (list.length === 0) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-gray-400 font-light">Nenhum lançamento pessoal registrado para este período.</td></tr>`;
    if (cards) cards.innerHTML = `<div class="card-lux p-8 text-center text-gray-400 font-light text-sm">Nenhum lançamento pessoal registrado para este período.</div>`;
    updateSelectAllHeader('pessoal');
    updateBulkActionBar();
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
      const itemKey = String(p._id || p.id || p._rowIndex || idx);
      const isSelected = state.selectedItems.pessoal ? state.selectedItems.pessoal.has(itemKey) : false;

      return `
        <tr class="row-clickable transition-colors ${isSelected ? 'row-selected' : ''}" onclick="handleRowClick(event, 'pessoal', '${itemKey}')" title="Clique para editar este lançamento pessoal">
          <td class="w-10 text-center no-row-click px-3 py-3" onclick="event.stopPropagation()">
            <input type="checkbox" data-id="${itemKey}" ${isSelected ? 'checked' : ''} onchange="toggleSelectItem('pessoal', '${itemKey}', event)" onclick="event.stopPropagation()" class="custom-checkbox cursor-pointer" title="Selecionar lançamento">
          </td>
          <td class="text-xs text-gray-500 whitespace-nowrap">${dataFmt}</td>
          <td>${badgeTipo}</td>
          <td><span class="text-xs font-medium text-gray-600">${p.categoria}</span></td>
          <td class="font-medium text-gray-800">${p.descricao}</td>
          <td class="font-bold ${isReceita ? 'text-emerald-600' : 'text-gray-800'}">${formatBRL(p.valor)}</td>
          <td class="text-right whitespace-nowrap no-row-click" onclick="event.stopPropagation()">
            <button onclick="openEditPessoal('${itemKey}')" class="text-gray-400 hover:text-[#C5A059] transition-colors p-1 mr-1.5" title="Editar Lançamento Pessoal">
              <i class="fa-regular fa-pen-to-square"></i>
            </button>
            <button onclick="deleteItem('Pessoal', '${itemKey}')" class="text-gray-400 hover:text-rose-500 transition-colors p-1" title="Excluir">
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
      const itemKey = String(p._id || p.id || p._rowIndex || idx);
      const isSelected = state.selectedItems.pessoal ? state.selectedItems.pessoal.has(itemKey) : false;

      return `
        <div class="card-lux mobile-card card-clickable p-4 space-y-2.5 ${isSelected ? 'card-selected' : ''}" onclick="handleRowClick(event, 'pessoal', '${itemKey}')" title="Toque para editar">
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-start gap-2.5">
              <div class="pt-0.5 no-row-click" onclick="event.stopPropagation()">
                <input type="checkbox" data-id="${itemKey}" ${isSelected ? 'checked' : ''} onchange="toggleSelectItem('pessoal', '${itemKey}', event)" onclick="event.stopPropagation()" class="custom-checkbox cursor-pointer" title="Selecionar lançamento">
              </div>
              <div>
                <span class="text-[11px] text-gray-400 font-medium block">${dataFmt}</span>
                <h4 class="font-bold text-gray-800 text-sm mt-0.5">${p.descricao}</h4>
                <span class="text-xs text-gray-500 font-medium">${p.categoria}</span>
              </div>
            </div>
            <div class="text-right">
              ${badgeTipo}
              <span class="font-bold ${isReceita ? 'text-emerald-600' : 'text-gray-800'} text-base block mt-1">${formatBRL(p.valor)}</span>
            </div>
          </div>

          ${p.observacoes ? `<p class="text-xs text-gray-400 italic bg-stone-50 p-2 rounded-lg border border-black/5">${p.observacoes}</p>` : ''}

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-black/5 no-row-click" onclick="event.stopPropagation()">
            <button onclick="openEditPessoal('${itemKey}')" class="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-[#C5A059] font-semibold text-xs flex items-center gap-1.5 transition-colors">
              <i class="fa-regular fa-pen-to-square"></i> Editar
            </button>
            <button onclick="deleteItem('Pessoal', '${itemKey}')" class="p-1.5 text-gray-400 hover:text-rose-500 transition-colors" title="Excluir">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  updateSelectAllHeader('pessoal');
  updateBulkActionBar();
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
  document.getElementById('modal-atend-btn-delete')?.classList.add('hidden');
  
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

function openEditAtendimento(keyOrIndex) {
  let item = (state.data.atendimentos || []).find(a => 
    (a._id && String(a._id) === String(keyOrIndex)) || 
    (a.id && String(a.id) === String(keyOrIndex)) ||
    (a._rowIndex && String(a._rowIndex) === String(keyOrIndex))
  );
  if (!item) {
    const list = filterByPeriod(state.data.atendimentos || []);
    item = list[keyOrIndex];
  }
  if (!item) return;

  populateProcedimentosSelect();

  document.getElementById('modal-atend-rowindex').value = item._rowIndex || item._id || item.id;
  document.getElementById('modal-atend-title').innerText = 'Editar Atendimento';
  document.getElementById('modal-atend-submit-btn').innerText = 'Salvar Alterações';
  document.getElementById('modal-atend-btn-delete')?.classList.remove('hidden');

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
    normalized._rowIndex = rowIndex;
    const targetIdx = state.data.atendimentos.findIndex(a => String(a._rowIndex) === String(rowIndex) || String(a._id) === String(rowIndex));
    if (targetIdx !== -1) {
      normalized._id = state.data.atendimentos[targetIdx]._id;
      state.data.atendimentos[targetIdx] = normalized;
    }
    if (state.currentUser) {
      showToast('Atendimento atualizado com sucesso!');
    } else {
      showToast('Item atualizado localmente (Modo Teste). Faça login para salvar na nuvem!', 'info');
      revealDemoBanner();
    }
  } else {
    normalized._rowIndex = 2;
    state.data.atendimentos.unshift(normalized);
    if (state.currentUser) {
      showToast('Atendimento registrado com sucesso!');
    } else {
      showToast('Item adicionado localmente (Modo Teste). Faça login para salvar na nuvem!', 'info');
      revealDemoBanner();
    }
  }

  // Persistência: Supabase Nuvem ou Google Sheets
  if (state.currentUser && state.supabaseClient) {
    const sbData = {
      user_id: state.currentUser.id,
      data: dataVal,
      cliente: cliente,
      servico: servico,
      valor_total: valorTotal,
      sinal: sinal,
      recebido: restante,
      a_receber: aReceber,
      forma_pagamento: formaPagto,
      parcelas: parcelas,
      situacao: situacao,
      observacoes: observacoes,
      updated_at: new Date().toISOString()
    };

    if (rowIndex) {
      const target = state.data.atendimentos.find(a => String(a._rowIndex) === String(rowIndex) || String(a._id) === String(rowIndex));
      const sbId = target?._id || (isNaN(Number(rowIndex)) ? rowIndex : null);
      if (sbId) {
        state.supabaseClient.from('atendimentos').update(sbData).eq('id', sbId).then(({ error }) => {
          if (error) console.error('Erro ao atualizar atendimento no Supabase:', error);
        });
      }
    } else {
      state.supabaseClient.from('atendimentos').insert(sbData).select().single().then(({ data: ins, error }) => {
        if (ins) {
          normalized._id = ins.id;
          normalized._rowIndex = ins.id;
        }
        if (error) console.error('Erro ao cadastrar atendimento no Supabase:', error);
      });
    }
  } else if (rowIndex) {
    if (state.apiUrl) callGasApi('updateAtendimento', { rowIndex: rowIndex, ...rawItem });
  } else {
    if (state.apiUrl) callGasApi('addAtendimento', rawItem);
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
  document.getElementById('modal-desp-btn-delete')?.classList.add('hidden');

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

function openEditDespesa(keyOrIndex) {
  let item = (state.data.despesas || []).find(d => 
    (d._id && String(d._id) === String(keyOrIndex)) || 
    (d.id && String(d.id) === String(keyOrIndex)) ||
    (d._rowIndex && String(d._rowIndex) === String(keyOrIndex))
  );
  if (!item) {
    const list = filterByPeriod(state.data.despesas || []);
    item = list[keyOrIndex];
  }
  if (!item) return;

  document.getElementById('modal-desp-rowindex').value = item._rowIndex || item._id || item.id;
  document.getElementById('modal-desp-title').innerText = 'Editar Despesa';
  document.getElementById('modal-desp-submit-btn').innerText = 'Salvar Alterações';
  document.getElementById('modal-desp-btn-delete')?.classList.remove('hidden');

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
    normalized._rowIndex = rowIndex;
    const targetIdx = state.data.despesas.findIndex(d => String(d._rowIndex) === String(rowIndex) || String(d._id) === String(rowIndex));
    if (targetIdx !== -1) {
      normalized._id = state.data.despesas[targetIdx]._id;
      state.data.despesas[targetIdx] = normalized;
    }
    if (state.currentUser) {
      showToast('Despesa atualizada com sucesso!');
    } else {
      showToast('Item atualizado localmente (Modo Teste). Faça login para salvar na nuvem!', 'info');
      revealDemoBanner();
    }
  } else {
    normalized._rowIndex = 2;
    state.data.despesas.unshift(normalized);
    if (state.currentUser) {
      showToast('Despesa registrada com sucesso!');
    } else {
      showToast('Item adicionado localmente (Modo Teste). Faça login para salvar na nuvem!', 'info');
      revealDemoBanner();
    }
  }

  // Persistência: Supabase Nuvem ou Google Sheets
  if (state.currentUser && state.supabaseClient) {
    const sbData = {
      user_id: state.currentUser.id,
      data: dataVal,
      categoria: categoria,
      descricao: descricao,
      valor: valor,
      forma_pagamento: formaPagto,
      parcelas: parcelas,
      observacoes: observacoes
    };

    if (rowIndex) {
      const target = state.data.despesas.find(d => String(d._rowIndex) === String(rowIndex) || String(d._id) === String(rowIndex));
      const sbId = target?._id || (isNaN(Number(rowIndex)) ? rowIndex : null);
      if (sbId) {
        state.supabaseClient.from('despesas_empresa').update(sbData).eq('id', sbId).then(({ error }) => {
          if (error) console.error('Erro ao atualizar despesa no Supabase:', error);
        });
      }
    } else {
      state.supabaseClient.from('despesas_empresa').insert(sbData).select().single().then(({ data: ins, error }) => {
        if (ins) {
          normalized._id = ins.id;
          normalized._rowIndex = ins.id;
        }
        if (error) console.error('Erro ao cadastrar despesa no Supabase:', error);
      });
    }
  } else if (rowIndex) {
    if (state.apiUrl) callGasApi('updateDespesa', { rowIndex: rowIndex, ...rawItem });
  } else {
    if (state.apiUrl) callGasApi('addDespesa', rawItem);
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
  document.getElementById('modal-extra-btn-delete')?.classList.add('hidden');

  const today = new Date().toISOString().split('T')[0];
  document.getElementById('modal-extra-data').value = today;
  document.getElementById('modal-extra-desc').value = '';
  document.getElementById('modal-extra-valor').value = '';
  document.getElementById('modal-extra-obs').value = '';
  openModal('modal-nova-receita-extra');
}

function openEditReceitaExtra(keyOrIndex) {
  let item = (state.data.outros || []).find(o => 
    (o._id && String(o._id) === String(keyOrIndex)) || 
    (o.id && String(o.id) === String(keyOrIndex)) || 
    (o._rowIndex && String(o._rowIndex) === String(keyOrIndex))
  );
  if (!item) {
    const list = filterByPeriod(state.data.outros || []);
    item = list[keyOrIndex];
  }
  if (!item) return;

  document.getElementById('modal-extra-rowindex').value = item._rowIndex || item._id || item.id;
  document.getElementById('modal-extra-title').innerText = 'Editar Receita Extra';
  document.getElementById('modal-extra-submit-btn').innerText = 'Salvar Alterações';
  document.getElementById('modal-extra-btn-delete')?.classList.remove('hidden');

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
    normalized._rowIndex = rowIndex;
    const targetIdx = state.data.outros.findIndex(o => String(o._rowIndex) === String(rowIndex) || String(o._id) === String(rowIndex));
    if (targetIdx !== -1) {
      normalized._id = state.data.outros[targetIdx]._id;
      state.data.outros[targetIdx] = normalized;
    }
    if (state.currentUser) {
      showToast('Receita extra atualizada!');
    } else {
      showToast('Item atualizado localmente (Modo Teste). Faça login para salvar na nuvem!', 'info');
      revealDemoBanner();
    }
  } else {
    normalized._rowIndex = 2;
    state.data.outros.unshift(normalized);
    if (state.currentUser) {
      showToast('Receita extra registrada com sucesso!');
    } else {
      showToast('Item adicionado localmente (Modo Teste). Faça login para salvar na nuvem!', 'info');
      revealDemoBanner();
    }
  }

  // Persistência: Supabase Nuvem ou Google Sheets
  if (state.currentUser && state.supabaseClient) {
    const sbData = {
      user_id: state.currentUser.id,
      data: dataVal,
      tipo: descricao,
      valor: valor,
      observacoes: obs
    };

    if (rowIndex) {
      const target = state.data.outros.find(o => String(o._rowIndex) === String(rowIndex) || String(o._id) === String(rowIndex));
      const sbId = target?._id || (isNaN(Number(rowIndex)) ? rowIndex : null);
      if (sbId) {
        state.supabaseClient.from('receitas_extras').update(sbData).eq('id', sbId).then(({ error }) => {
          if (error) console.error('Erro ao atualizar receita extra no Supabase:', error);
        });
      }
    } else {
      state.supabaseClient.from('receitas_extras').insert(sbData).select().single().then(({ data: ins, error }) => {
        if (ins) {
          normalized._id = ins.id;
          normalized._rowIndex = ins.id;
        }
        if (error) console.error('Erro ao cadastrar receita extra no Supabase:', error);
      });
    }
  } else if (rowIndex) {
    if (state.apiUrl) callGasApi('updateReceitaAvulsa', { rowIndex: rowIndex, ...rawItem });
  } else {
    if (state.apiUrl) callGasApi('addReceitaAvulsa', rawItem);
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
  document.getElementById('modal-pess-btn-delete')?.classList.add('hidden');

  const today = new Date().toISOString().split('T')[0];
  document.getElementById('modal-pess-data').value = today;
  document.getElementById('modal-pess-tipo').value = 'Despesa';
  document.getElementById('modal-pess-cat').value = 'Moradia';
  document.getElementById('modal-pess-desc').value = '';
  document.getElementById('modal-pess-valor').value = '';
  document.getElementById('modal-pess-obs').value = '';
  openModal('modal-novo-pessoal');
}

function openEditPessoal(keyOrIndex) {
  let item = (state.data.pessoal || []).find(p => 
    (p._id && String(p._id) === String(keyOrIndex)) || 
    (p.id && String(p.id) === String(keyOrIndex)) || 
    (p._rowIndex && String(p._rowIndex) === String(keyOrIndex))
  );
  if (!item) {
    const list = filterByPeriod(state.data.pessoal || []);
    item = list[keyOrIndex];
  }
  if (!item) return;

  document.getElementById('modal-pess-rowindex').value = item._rowIndex || item._id || item.id;
  document.getElementById('modal-pess-title').innerText = 'Editar Lançamento Pessoal';
  document.getElementById('modal-pess-submit-btn').innerText = 'Salvar Alterações';
  document.getElementById('modal-pess-btn-delete')?.classList.remove('hidden');

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
    normalized._rowIndex = rowIndex;
    const targetIdx = state.data.pessoal.findIndex(p => String(p._rowIndex) === String(rowIndex) || String(p._id) === String(rowIndex));
    if (targetIdx !== -1) {
      normalized._id = state.data.pessoal[targetIdx]._id;
      state.data.pessoal[targetIdx] = normalized;
    }
    if (state.currentUser) {
      showToast('Lançamento pessoal atualizado!');
    } else {
      showToast('Item atualizado localmente (Modo Teste). Faça login para salvar na nuvem!', 'info');
      revealDemoBanner();
    }
  } else {
    normalized._rowIndex = 2;
    state.data.pessoal.unshift(normalized);
    if (state.currentUser) {
      showToast('Lançamento pessoal registrado!');
    } else {
      showToast('Item adicionado localmente (Modo Teste). Faça login para salvar na nuvem!', 'info');
      revealDemoBanner();
    }
  }

  // Persistência: Supabase Nuvem ou Google Sheets
  if (state.currentUser && state.supabaseClient) {
    const sbData = {
      user_id: state.currentUser.id,
      data: dataVal,
      tipo: tipo,
      categoria: categoria,
      descricao: descricao,
      valor: valor,
      observacoes: obs
    };

    if (rowIndex) {
      const target = state.data.pessoal.find(p => String(p._rowIndex) === String(rowIndex) || String(p._id) === String(rowIndex));
      const sbId = target?._id || (isNaN(Number(rowIndex)) ? rowIndex : null);
      if (sbId) {
        state.supabaseClient.from('financas_pessoais').update(sbData).eq('id', sbId).then(({ error }) => {
          if (error) console.error('Erro ao atualizar finança pessoal no Supabase:', error);
        });
      }
    } else {
      state.supabaseClient.from('financas_pessoais').insert(sbData).select().single().then(({ data: ins, error }) => {
        if (ins) {
          normalized._id = ins.id;
          normalized._rowIndex = ins.id;
        }
        if (error) console.error('Erro ao cadastrar finança pessoal no Supabase:', error);
      });
    }
  } else if (rowIndex) {
    if (state.apiUrl) callGasApi('updatePessoal', { rowIndex: rowIndex, ...rawItem });
  } else {
    if (state.apiUrl) callGasApi('addPessoal', rawItem);
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
  if (state.currentUser) {
    showToast(`Pró-labore de ${formatBRL(valor)} transferido com sucesso!`);
  } else {
    showToast('Pró-labore transferido localmente (Modo Teste). Faça login para salvar na nuvem!', 'info');
    revealDemoBanner();
  }

  if (state.currentUser && state.supabaseClient) {
    state.supabaseClient.from('financas_pessoais').insert({
      user_id: state.currentUser.id,
      data: dataVal,
      tipo: 'Receita',
      categoria: 'Retirada da empresa',
      descricao: 'Pró-labore / Retirada',
      valor: valor,
      observacoes: obs
    }).select().single().then(({ data: ins, error }) => {
      if (ins) {
        normalized._id = ins.id;
        normalized._rowIndex = ins.id;
      }
      if (error) console.error('Erro ao transferir pró-labore no Supabase:', error);
    });
  } else if (state.apiUrl) {
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
  if (state.currentUser) {
    showToast('Metas financeiras salvas com sucesso!');
  } else {
    showToast('Metas salvas localmente (Modo Teste). Faça login para salvar na nuvem!', 'info');
    revealDemoBanner();
  }

  if (state.currentUser && state.supabaseClient) {
    state.supabaseClient.from('metas').upsert({
      user_id: state.currentUser.id,
      faturamento,
      reserva,
      limite_pessoal: limitePessoal,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' }).then(({ error }) => {
      if (error) console.error('Erro ao salvar metas no Supabase:', error);
    });
  } else if (state.apiUrl) {
    callGasApi('updateMetas', { faturamento, reserva, limitePessoal });
  }
}

// Exclusão de Item
function deleteItem(sheetType, rowIndex) {
  if (!confirm(`Deseja realmente excluir este lançamento?`)) return false;

  const key = sheetType.toLowerCase();
  let list = state.data[key] || [];
  
  const targetIndex = list.findIndex((item, idx) => 
    (item._rowIndex && String(item._rowIndex) === String(rowIndex)) || 
    (item._id && String(item._id) === String(rowIndex)) || 
    (item.id && String(item.id) === String(rowIndex)) || 
    String(idx) === String(rowIndex)
  );

  if (targetIndex !== -1) {
    const removedItem = list[targetIndex];
    list.splice(targetIndex, 1);

    // Remove do Set de selecionados se estiver lá
    if (state.selectedItems[key]) {
      state.selectedItems[key].delete(String(removedItem._id || removedItem.id || removedItem._rowIndex || targetIndex));
      state.selectedItems[key].delete(String(rowIndex));
    }

    saveLocalCache();
    renderAll();
    updateBulkActionBar();

    if (state.currentUser) {
      showToast('Item excluído com sucesso!');
    } else {
      showToast('Item removido localmente (Modo Teste). Faça login para salvar na nuvem!', 'info');
      revealDemoBanner();
    }

    // Se estiver logado no Supabase, exclui na nuvem
    if (state.currentUser && state.supabaseClient && (removedItem?._id || removedItem?.id)) {
      const idToDelete = removedItem._id || removedItem.id;
      const tableMap = {
        'atendimentos': 'atendimentos',
        'despesas': 'despesas_empresa',
        'outros': 'receitas_extras',
        'pessoal': 'financas_pessoais'
      };
      const tbl = tableMap[key];
      if (tbl && (typeof idToDelete === 'string' && (idToDelete.length > 10 || isNaN(Number(idToDelete))))) {
        state.supabaseClient.from(tbl).delete().eq('id', idToDelete).then(({ error }) => {
          if (error) console.error('Erro ao excluir do Supabase:', error);
        });
      }
    } else if (state.apiUrl) {
      callGasApi(`delete${sheetType}`, { rowIndex: rowIndex });
    }
    return true;
  }
  return false;
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

  if (status === 'supabase') {
    badge.className = 'inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-pointer';
    badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 sm:mr-2 pulse-green"></span> <span class="hidden sm:inline">Nuvem Supabase (Privado)</span><span class="sm:hidden text-[11px]">Nuvem</span>';
  } else if (status === 'connected') {
    badge.className = 'inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-pointer';
    badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 sm:mr-2 pulse-green"></span> <span class="hidden sm:inline">Online (Nuvem)</span><span class="sm:hidden text-[11px]">Online</span>';
  } else if (status === 'syncing') {
    badge.className = 'inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200';
    badge.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1.5 sm:mr-2"></i> <span class="hidden sm:inline">Sincronizando...</span><span class="sm:hidden text-[11px]">Sync...</span>';
  } else if (status === 'error') {
    badge.className = 'inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 cursor-pointer';
    badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-rose-500 mr-1.5 sm:mr-2"></span> <span class="hidden sm:inline">Erro de Conexão</span><span class="sm:hidden text-[11px]">Offline</span>';
  } else {
    badge.className = 'inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200 cursor-pointer';
    badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-stone-400 mr-1.5 sm:mr-2"></span> <span class="hidden sm:inline">Modo Demonstração (Local)</span><span class="sm:hidden text-[11px]">Demo</span>';
  }
}

function saveLocalCache() {
  localStorage.setItem('bia_fin_data', JSON.stringify(state.data));
}

// Notificação Flutuante (Toast - Mantém apenas uma mensagem ativa sem empilhar)
let activeToastTimeout = null;
let activeToastRemoveTimeout = null;

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  // Limpa timeouts da notificação anterior
  if (activeToastTimeout) clearTimeout(activeToastTimeout);
  if (activeToastRemoveTimeout) clearTimeout(activeToastRemoveTimeout);

  // Remove qualquer toast anterior imediatamente para garantir apenas uma mensagem na tela
  container.innerHTML = '';

  const toast = document.createElement('div');
  let bgColor = 'bg-[#1A1A1A] text-white border border-[#D4888C]/30';
  let icon = 'fa-check text-[#D4888C]';

  if (type === 'warning' || type === 'error') {
    bgColor = 'bg-rose-950 text-white border border-rose-500/40';
    icon = 'fa-triangle-exclamation text-rose-300';
  } else if (type === 'info') {
    bgColor = 'bg-[#1A1818] text-white border border-[#D4888C]/70 shadow-[0_10px_30px_rgba(0,0,0,0.6)]';
    icon = 'fa-cloud-arrow-up text-[#E8A5A8]';
  }
  
  toast.className = `${bgColor} px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs sm:text-sm font-medium animate-fade-in transition-all duration-300 pointer-events-auto cursor-pointer`;
  toast.title = 'Clique para fechar';
  toast.innerHTML = `
    <i class="fa-solid ${icon} text-sm sm:text-base shrink-0"></i>
    <span class="leading-snug">${message}</span>
  `;

  // Permite fechar clicando na notificação
  toast.onclick = () => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(6px)';
    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 250);
  };

  container.appendChild(toast);
  const duration = type === 'info' ? 4500 : 3000;
  activeToastTimeout = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(6px)';
    activeToastRemoveTimeout = setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 350);
  }, duration);
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
  link.setAttribute('download', `Financeiro_${state.selectedYear}_${state.selectedMonth}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}
