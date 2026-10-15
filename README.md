# 🌸 Sistema de Gestão Financeira Exclusivo — Beatriz Leal Beauty

Site e painel financeiro pessoal exclusivo inspirado na identidade visual de [bialealbeauty.com.br](https://bialealbeauty.com.br), 100% compatível com **GitHub Pages** e alimentado em tempo real pelo **Google Sheets via Google Apps Script**.

---

## 💎 O que foi desenvolvido

1. **Interface Web Responsiva de Alto Padrão (`index.html`, `styles.css`)**:
   - Paleta oficial: Rosa Queimado (`#D4888C`), Dourado Champagne (`#C5A059`), Fundo Areia (`#F9F7F2`) e Preto Grafite (`#1A1A1A`).
   - Tipografia editorial refinada: *Playfair Display* e *Montserrat*.
   - Botões com efeito hover idênticos ao site oficial (`rose-button` e `gold-button`).
   - Cards executivos de Faturamento, Caixa Efetivo, Despesas, Lucro Líquido Real, Pró-labore e Saldo Pessoal.
   - Gráficos interativos com **Chart.js** (Evolução Anual, Procedimentos Mais Lucrativos e Meios de Pagamento).

2. **Cálculo Financeiro Inteligente (`app.js`)**:
   - **Correção do "Furo do Sinal"**: Registra automaticamente o sinal (R$ 30 antecipado) e o restante pago no dia, garantindo que nenhum centavo deixe de ser computado no faturamento.
   - **Gestão de Pró-labore**: Botão de retirada que debita da empresa e credita nas finanças pessoais.
   - **Modo Offline / Demonstração Imediata**: Já vem pré-carregado com os dados reais de outubro de 2026, funcionando mesmo antes de você conectar a planilha!

3. **Backend Serverless no Google Apps Script (`Codigo.gs`)**:
   - API REST ultraleve (`doGet` e `doPost`) para ler e gravar dados diretamente na sua planilha oficial no Google Drive com zero custo de servidor.

---

## 🚀 Passo a Passo: Como Publicar no GitHub Pages

O GitHub Pages requer apenas arquivos estáticos (HTML, CSS e JavaScript), o que torna este projeto ideal e 100% gratuito para sempre!

### 1. Criar o Repositório no GitHub
1. Acesse [github.com/new](https://github.com/new) e crie um novo repositório (ex: `financeiro-beatriz-leal`).
2. Marque como **Público** (se quiser usar o GitHub Pages gratuito) ou **Privado** (se tiver GitHub Pro).

### 2. Enviar os arquivos pelo Terminal / Git
Abra o PowerShell nesta pasta (`C:\PATH_Programs\Downloads\postar\programas\Financeiro`) e execute:

```powershell
git init
git add .
git commit -m "Sistema Financeiro Beatriz Leal Beauty"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/financeiro-beatriz-leal.git
git push -u origin main
```

### 3. Ativar o GitHub Pages
1. No seu repositório no GitHub, clique na aba **Settings** (Configurações).
2. No menu lateral esquerdo, clique em **Pages**.
3. Em **Build and deployment > Branch**, selecione `main` e a pasta `/ (root)`.
4. Clique em **Save**. Em cerca de 1 a 2 minutos seu site estará no ar no endereço:
   `https://SEU_USUARIO.github.io/financeiro-beatriz-leal/`

---

## ⚡ Passo a Passo: Conectar com o Google Apps Script

Para que o site salve e leia dados direto da sua planilha do Google Drive:

1. Abra sua planilha do Google Sheets:
   `https://docs.google.com/spreadsheets/d/e/.../pubhtml` (ou o link editável no Drive).
2. No menu superior da planilha, clique em **Extensões** > **Apps Script**.
3. Apague todo o código que estiver lá e cole todo o conteúdo do arquivo **`Codigo.gs`**.
4. Clique no botão azul **Implantar (Deploy)** no canto superior direito > **Nova Implantação**.
5. No ícone de engrenagem ⚙️, escolha **App da Web (Web App)**:
   - **Descrição**: *API Financeiro Beatriz Leal*
   - **Executar como**: *Eu (sua conta)*
   - **Quem pode acessar**: *Qualquer pessoa (Anyone)* *(Importante para que o site no GitHub Pages consiga ler e gravar)*.
6. Clique em **Implantar** e autorize o acesso à sua conta Google.
7. Copie a **URL do App da Web** gerada (algo parecido com `https://script.google.com/macros/s/AKfycb.../exec`).
8. Abra seu site, vá na aba **Conexão Sheets**, cole a URL no campo e clique em **Testar Conexão** e depois em **Salvar Configuração**.

---

## 📂 Estrutura de Arquivos

```
Financeiro/
├── index.html              # Página principal do sistema
├── styles.css              # Identidade visual bialealbeauty.com.br
├── app.js                  # Lógica, cálculos, gráficos e API
├── initial_data.json       # Dados iniciais de outubro/2026
├── Codigo.gs               # Script para o Google Apps Script
├── README.md               # Manual de uso e instalação
└── assets/
    └── images/
        ├── logo.png        # Logo oficial Beatriz Leal Beauty
        └── favicon.png     # Ícone da marca
```
