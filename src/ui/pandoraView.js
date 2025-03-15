// Garantir que estamos em um ambiente seguro
const getVSCodeAPI = () => {
    if (typeof acquireVsCodeApi === 'function') {
        try {
            return acquireVsCodeApi();
        } catch (e) {
            console.warn('VSCode API não disponível:', e);
            return {
                postMessage: () => {},
                setState: () => {},
                getState: () => ({})
            };
        }
    }
    return null;
};

const vscode = getVSCodeAPI();
const win = typeof window !== 'undefined' ? window : null;

// Estado da view
let state = {
  analyzing: false,
  lastResult: null
};

// Inicialização segura
function initializeView() {
  if (!win) return;

  // Setup dos event listeners
  document.addEventListener('DOMContentLoaded', () => {
    // Handlers dos botões
    document.getElementById('analyze-error')?.addEventListener('click', () => {
        if (state.analyzing) return;
        setState({ analyzing: true });
        vscode.postMessage({ type: 'analyzeError' });
    });

    document.getElementById('analyze-code')?.addEventListener('click', () => {
        if (state.analyzing) return;
        setState({ analyzing: true });
        vscode.postMessage({ type: 'analyzeCode' });
    });
  });

  // Event listener da webview
  window.addEventListener('message', event => {
    const message = event.data;
    switch (message.type) {
        case 'result':
            setState({
                analyzing: false,
                lastResult: message.result
            });
            updateResultView();
            break;
        case 'fixSuggestion':
            handleFixSuggestion(message.fix);
            break;
        case 'diagnosticsUpdate':
            updateDiagnostics(message.diagnostics);
            break;
    }
  });
}

// Inicializar apenas se estivermos em um ambiente browser
if (win) {
  initializeView();
}

function setState(newState) {
    state = { ...state, ...newState };
    vscode.setState(state);
}

function updateResultView() {
    const resultEl = document.getElementById('result');
    if (state.analyzing) {
        resultEl.innerHTML = '<div class="loading">Analisando...</div>';
        return;
    }
    if (state.lastResult) {
        resultEl.innerHTML = `<div class="result">${state.lastResult}</div>`;
    }
}

// Handler para diagnósticos
async function handleFixSuggestion(fix) {
    try {
        showLoading(true);
        
        const container = document.getElementById('fixes-container');
        const errorCard = document.createElement('div');
        errorCard.className = 'error-card';
        
        const safeHtml = `
            <div class="error-header">
                <span class="severity">${escapeHtml(fix.severity)}</span>
                <span class="location">${escapeHtml(fix.location.file)}:${fix.location.line}</span>
                <span class="timestamp">${new Date(fix.timestamp).toLocaleTimeString()}</span>
            </div>
            <div class="error-message">${escapeHtml(fix.originalError)}</div>
            <div class="fix-suggestion">
                <pre><code>${escapeHtml(fix.fixedCode)}</code></pre>
                <p class="explanation">${escapeHtml(fix.explanation)}</p>
            </div>
            <div class="actions">
                <button onclick="confirmAndApplyFix('${encodeURIComponent(fix.fixedCode)}')" class="primary">
                    Aplicar Correção
                </button>
                <button onclick="copyToClipboard('${encodeURIComponent(fix.fixedCode)}')" class="secondary">
                    Copiar
                </button>
            </div>`;
        
        errorCard.innerHTML = safeHtml;
        container.insertBefore(errorCard, container.firstChild);
        
        // Animar entrada do card
        await animateEntry(errorCard);
        
    } catch (error) {
        console.error('Erro ao processar sugestão:', error);
        showError('Falha ao processar sugestão de correção');
    } finally {
        showLoading(false);
    }
}

async function confirmAndApplyFix(encodedCode) {
    try {
        const code = decodeURIComponent(encodedCode);
        const confirmed = await showConfirmation(
            'Deseja aplicar esta correção?',
            'Esta ação irá modificar seu código.'
        );
        
        if (confirmed) {
            showLoading(true);
            await vscode.postMessage({
                type: 'applyFix',
                code: code,
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        console.error('Erro ao aplicar correção:', error);
        showError('Falha ao aplicar correção');
    } finally {
        showLoading(false);
    }
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    loading.classList.toggle('hidden', !show);
    
    const fixButton = document.getElementById('fixButton');
    fixButton.disabled = show;
}

function showError(message) {
    const container = document.getElementById('error-container');
    const errorEl = document.createElement('div');
    errorEl.className = 'error-message fade-in';
    errorEl.textContent = message;
    container.appendChild(errorEl);
    
    setTimeout(() => {
        errorEl.remove();
    }, 5000);
}

// Funções de utilidade
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

async function animateEntry(element) {
    element.style.opacity = '0';
    element.style.transform = 'translateY(-20px)';
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    element.style.transition = 'all 0.3s ease-out';
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
}

function applyFix(fixedCode) {
    vscode.postMessage({
        type: 'applyFix',
        code: decodeURIComponent(fixedCode)
    });
}

function updateDiagnostics(diagnostics) {
    const container = document.getElementById('error-container');
    if (!diagnostics.length) {
        container.innerHTML = '<div class="empty-state">Nenhum problema encontrado</div>';
        return;
    }

    container.innerHTML = `
        <div class="error-actions-toolbar">
            <button onclick="analyzeSelectedErrors()" class="primary-button">
                Corrigir Selecionados
            </button>
        </div>
        ${diagnostics.map((d, index) => `
            <div class="error-card severity-${getSeverityClass(d.severity)}">
                <div class="error-checkbox">
                    <input type="checkbox" 
                           id="error-${index}" 
                           class="error-selector"
                           data-error='${encodeURIComponent(JSON.stringify(d))}'>
                </div>
                <div class="error-content">
                    <div class="error-header">
                        <span class="error-location">${d.file}:${d.line}</span>
                        <span class="error-severity">${getSeverityLabel(d.severity)}</span>
                    </div>
                    <div class="error-message">${escapeHtml(d.message)}</div>
                </div>
            </div>
        `).join('')}`;
}

function analyzeSelectedErrors() {
    const selectedErrors = Array.from(document.querySelectorAll('.error-selector:checked'))
        .map(checkbox => JSON.parse(decodeURIComponent(checkbox.dataset.error)));
    
    if (selectedErrors.length === 0) {
        showError('Selecione pelo menos um erro para corrigir');
        return;
    }

    vscode.postMessage({
        type: 'analyzeSelectedErrors',
        errors: selectedErrors
    });
}

function getSeverityClass(severity) {
    switch (severity) {
        case 1: return 'error';
        case 2: return 'warning';
        case 3: return 'info';
        default: return 'hint';
    }
}

function getSeverityLabel(severity) {
    switch (severity) {
        case 1: return 'Erro';
        case 2: return 'Aviso';
        case 3: return 'Informação';
        default: return 'Dica';
    }
}

function analyzeError(errorData) {
    const error = JSON.parse(decodeURIComponent(errorData));
    vscode.postMessage({
        type: 'analyzeError',
        error: error
    });
}
