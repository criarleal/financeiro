-- ==============================================================================
-- SISTEMA FINANCEIRO MULTI-TENANT (SAAS FAMILIAR / UNIVERSAL)
-- Schema PostgreSQL com Row Level Security (RLS) para Supabase
-- ==============================================================================
-- Execute este script no SQL Editor do seu projeto Supabase (supabase.com)
-- Todas as tabelas são 100% isoladas por usuário (auth.uid()) garantindo privacidade total.

-- 1. TABELA DE PERFIS E PREFERÊNCIAS MODULARES
CREATE TABLE IF NOT EXISTS public.perfis (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    nome TEXT,
    app_name TEXT DEFAULT 'Meu Painel Financeiro',
    app_subtitle TEXT DEFAULT 'Gestão Financeira & Caixa',
    logo_icon TEXT DEFAULT 'fa-sparkles',
    tipo_perfil TEXT DEFAULT 'personalizado', -- 'estetica', 'barbearia', 'manicure', 'pessoal', 'personalizado'
    modulos JSONB DEFAULT '{"operacoes": true, "empresa": true, "pessoal": true, "outros": true, "metas": true}'::jsonb,
    termos JSONB DEFAULT '{"operacaoSingular": "Atendimento", "operacaoPlural": "Atendimentos", "clienteSingular": "Cliente", "clientePlural": "Clientes", "servicoSingular": "Procedimento", "custoNegocio": "Despesas da Empresa"}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE CATÁLOGO DE SERVIÇOS / ITENS (Próprio de cada usuário)
CREATE TABLE IF NOT EXISTS public.catalogo_servicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    valor NUMERIC(10,2) DEFAULT 0,
    sinal NUMERIC(10,2) DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE OPERAÇÕES / ATENDIMENTOS / CLIENTES
CREATE TABLE IF NOT EXISTS public.atendimentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    cliente TEXT,
    servico TEXT NOT NULL,
    valor_total NUMERIC(10,2) NOT NULL DEFAULT 0,
    sinal NUMERIC(10,2) DEFAULT 0,
    recebido NUMERIC(10,2) DEFAULT 0,
    a_receber NUMERIC(10,2) DEFAULT 0,
    forma_pagamento TEXT DEFAULT 'Pix',
    parcelas TEXT DEFAULT 'À vista',
    situacao TEXT DEFAULT 'Concluído', -- 'Concluído', 'Pendente', 'Cancelado'
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA DE CUSTOS OPERACIONAIS / DESPESAS DA EMPRESA (PJ)
CREATE TABLE IF NOT EXISTS public.despesas_empresa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    categoria TEXT NOT NULL,
    descricao TEXT NOT NULL,
    valor NUMERIC(10,2) NOT NULL DEFAULT 0,
    forma_pagamento TEXT DEFAULT 'Pix',
    parcelas TEXT DEFAULT 'À vista',
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABELA DE RECEITAS EXTRAS / AVULSAS
CREATE TABLE IF NOT EXISTS public.receitas_extras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    tipo TEXT NOT NULL,
    valor NUMERIC(10,2) NOT NULL DEFAULT 0,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABELA DE FINANÇAS PESSOAIS (PF)
CREATE TABLE IF NOT EXISTS public.financas_pessoais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'Despesa', -- 'Receita', 'Despesa'
    categoria TEXT NOT NULL,
    descricao TEXT NOT NULL,
    valor NUMERIC(10,2) NOT NULL DEFAULT 0,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABELA DE METAS FINANCEIRAS
CREATE TABLE IF NOT EXISTS public.metas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    faturamento NUMERIC(10,2) DEFAULT 5000,
    reserva NUMERIC(10,2) DEFAULT 10000,
    limite_pessoal NUMERIC(10,2) DEFAULT 2500,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) - PRIVACIDADE TOTAL ENTRE FAMILIARES / USUÁRIOS
-- ==============================================================================

ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogo_servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atendimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.despesas_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receitas_extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financas_pessoais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metas ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso: Cada usuário só enxerga e manipula seus próprios registros
CREATE POLICY "Acesso perfil proprio" ON public.perfis
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Acesso catalogo proprio" ON public.catalogo_servicos
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Acesso atendimentos proprios" ON public.atendimentos
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Acesso despesas_empresa proprias" ON public.despesas_empresa
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Acesso receitas_extras proprias" ON public.receitas_extras
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Acesso financas_pessoais proprias" ON public.financas_pessoais
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Acesso metas proprias" ON public.metas
    FOR ALL USING (auth.uid() = user_id);

-- ==============================================================================
-- TRIGGER AUTOMÁTICO: CRIA PERFIL E METAS NO CADASTRO DE NOVO USUÁRIO
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.perfis (id, email, nome)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)));

    INSERT INTO public.metas (user_id, faturamento, reserva, limite_pessoal)
    VALUES (NEW.id, 5000, 10000, 2500);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- HABILITAR REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.atendimentos, public.despesas_empresa, public.financas_pessoais, public.metas;
