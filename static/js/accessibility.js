/**
 * Script de acessibilidade para o sistema E-Voto
 * Implementa funcionalidades como alto contraste, tamanho de fonte ajustável e atalhos de teclado
 */

document.addEventListener('DOMContentLoaded', function() {
    // Inicializa as configurações de acessibilidade
    initAccessibilitySettings();
    
    // Adiciona eventos para os botões de acessibilidade
    setupAccessibilityControls();
    
    // Configura atalhos de teclado
    setupKeyboardShortcuts();
    
    // Melhora a navegação por teclado
    enhanceKeyboardNavigation();
    
    // Adiciona ARIA labels onde necessário
    enhanceAriaAttributes();
});

/**
 * Inicializa as configurações de acessibilidade com base nas preferências salvas
 */
function initAccessibilitySettings() {
    // Recupera as configurações salvas no localStorage
    const highContrast = localStorage.getItem('highContrast') === 'true';
    const fontSize = localStorage.getItem('fontSize') || 'normal';
    
    // Aplica as configurações
    if (highContrast) {
        document.body.classList.add('high-contrast');
        document.getElementById('contrast-toggle')?.setAttribute('aria-pressed', 'true');
    }
    
    document.body.classList.add(`font-size-${fontSize}`);
    document.querySelectorAll('.font-size-button').forEach(button => {
        if (button.dataset.size === fontSize) {
            button.setAttribute('aria-pressed', 'true');
        }
    });
}

/**
 * Configura os controles da barra de acessibilidade
 */
function setupAccessibilityControls() {
    // Toggle de alto contraste
    const contrastToggle = document.getElementById('contrast-toggle');
    if (contrastToggle) {
        contrastToggle.addEventListener('click', function() {
            document.body.classList.toggle('high-contrast');
            const isHighContrast = document.body.classList.contains('high-contrast');
            localStorage.setItem('highContrast', isHighContrast);
            this.setAttribute('aria-pressed', isHighContrast);
            
            // Anuncia a mudança para leitores de tela
            announceToScreenReader(`Modo de alto contraste ${isHighContrast ? 'ativado' : 'desativado'}`);
        });
    }
    
    // Botões de tamanho de fonte
    document.querySelectorAll('.font-size-button').forEach(button => {
        button.addEventListener('click', function() {
            const newSize = this.dataset.size;
            
            // Remove classes de tamanho anteriores
            document.body.classList.remove('font-size-normal', 'font-size-large', 'font-size-larger');
            
            // Adiciona a nova classe de tamanho
            document.body.classList.add(`font-size-${newSize}`);
            
            // Salva a preferência
            localStorage.setItem('fontSize', newSize);
            
            // Atualiza o estado dos botões
            document.querySelectorAll('.font-size-button').forEach(btn => {
                btn.setAttribute('aria-pressed', btn.dataset.size === newSize);
            });
            
            // Anuncia a mudança para leitores de tela
            announceToScreenReader(`Tamanho de fonte alterado para ${newSize}`);
        });
    });
    
    // Botão de leitura de tela
    const readPageButton = document.getElementById('read-page');
    if (readPageButton) {
        readPageButton.addEventListener('click', function() {
            readPageContent();
        });
    }
}

/**
 * Configura atalhos de teclado para acessibilidade
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        // Alt + C: Toggle de contraste
        if (event.altKey && event.key === 'c') {
            event.preventDefault();
            document.getElementById('contrast-toggle')?.click();
        }
        
        // Alt + A: Aumentar fonte
        if (event.altKey && event.key === 'a') {
            event.preventDefault();
            const currentSize = localStorage.getItem('fontSize') || 'normal';
            let newSize;
            
            switch (currentSize) {
                case 'normal':
                    newSize = 'large';
                    break;
                case 'large':
                    newSize = 'larger';
                    break;
                case 'larger':
                    newSize = 'normal';
                    break;
                default:
                    newSize = 'normal';
            }
            
            // Simula o clique no botão correspondente
            document.querySelector(`.font-size-button[data-size="${newSize}"]`)?.click();
        }
        
        // Alt + H: Ir para a página inicial
        if (event.altKey && event.key === 'h') {
            event.preventDefault();
            window.location.href = '/';
        }
        
        // Alt + V: Ir para a página de votação (se autenticado)
        if (event.altKey && event.key === 'v') {
            event.preventDefault();
            const votacaoLink = document.querySelector('a[href*="acesso_votacao"]');
            if (votacaoLink) {
                votacaoLink.click();
            }
        }
        
        // Alt + R: Ler conteúdo da página
        if (event.altKey && event.key === 'r') {
            event.preventDefault();
            readPageContent();
        }
    });
    
    // Configura atalhos específicos para a página de votação
    if (window.location.href.includes('votacao')) {
        setupVotingShortcuts();
    }
}

/**
 * Configura atalhos específicos para a página de votação
 */
function setupVotingShortcuts() {
    document.addEventListener('keydown', function(event) {
        // Números 1-9 para selecionar chapas
        if (/^[1-9]$/.test(event.key)) {
            const chapaNumber = parseInt(event.key);
            const chapas = document.querySelectorAll('.card');
            
            if (chapas.length >= chapaNumber) {
                const targetChapa = Array.from(chapas).find(chapa => 
                    chapa.querySelector('.badge')?.textContent.trim() === chapaNumber.toString()
                );
                
                if (targetChapa) {
                    const voteButton = targetChapa.querySelector('.btn-primary');
                    if (voteButton) voteButton.click();
                }
            }
        }
    });
}

/**
 * Melhora a navegação por teclado adicionando tabindex e focus styles
 */
function enhanceKeyboardNavigation() {
    // Adiciona tabindex a elementos que devem ser focáveis
    document.querySelectorAll('.card, .list-group-item').forEach((item, index) => {
        if (!item.getAttribute('tabindex')) {
            item.setAttribute('tabindex', '0');
        }
    });
    
    // Adiciona eventos de foco para elementos interativos
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                const button = this.querySelector('.btn-primary');
                if (button) button.click();
            }
        });
    });
}

/**
 * Adiciona atributos ARIA para melhorar a experiência com leitores de tela
 */
function enhanceAriaAttributes() {
    // Adiciona rótulos para elementos que precisam de contexto adicional
    document.querySelectorAll('button:not([aria-label])').forEach(button => {
        if (!button.textContent.trim() && !button.getAttribute('aria-label')) {
            const icon = button.querySelector('i, .icon');
            if (icon && icon.classList) {
                // Tenta determinar a função do botão com base na classe do ícone
                if (icon.classList.contains('trash') || icon.classList.contains('delete')) {
                    button.setAttribute('aria-label', 'Excluir');
                } else if (icon.classList.contains('edit')) {
                    button.setAttribute('aria-label', 'Editar');
                } else if (icon.classList.contains('add')) {
                    button.setAttribute('aria-label', 'Adicionar');
                }
            }
        }
    });
    
    // Adiciona roles para melhorar a semântica
    document.querySelectorAll('.card').forEach(card => {
        card.setAttribute('role', 'region');
        const header = card.querySelector('.card-header');
        if (header) {
            header.setAttribute('role', 'heading');
            header.setAttribute('aria-level', '3');
        }
    });
}

/**
 * Limita o foco dentro de um elemento específico (para modais)
 */
function trapFocus(element) {
    const focusableElements = element.querySelectorAll('a[href], button, textarea, input, select');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    element.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    });
    
    firstElement.focus();
}

/**
 * Anuncia uma mensagem para leitores de tela
 */
function announceToScreenReader(message) {
    let announcer = document.getElementById('screen-reader-announcer');
    
    if (!announcer) {
        announcer = document.createElement('div');
        announcer.id = 'screen-reader-announcer';
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.classList.add('sr-only');
        document.body.appendChild(announcer);
    }
    
    announcer.textContent = message;
    
    // Limpa após alguns segundos
    setTimeout(() => {
        announcer.textContent = '';
    }, 3000);
}

/**
 * Lê o conteúdo principal da página
 */
function readPageContent() {
    const mainContent = document.querySelector('main');
    if (!mainContent) return;
    
    // Coleta o texto principal da página
    let textToRead = '';
    
    // Título da página
    const pageTitle = document.querySelector('h1, h2');
    if (pageTitle) {
        textToRead += pageTitle.textContent + '. ';
    }
    
    // Conteúdo principal
    const paragraphs = mainContent.querySelectorAll('p, li, h3, h4, h5, h6');
    paragraphs.forEach(p => {
        textToRead += p.textContent + '. ';
    });
    
    // Se estiver na página de votação, lê informações sobre as chapas
    if (window.location.href.includes('votacao')) {
        const chapas = document.querySelectorAll('.card');
        chapas.forEach(chapa => {
            const numero = chapa.querySelector('.badge')?.textContent;
            const nome = chapa.querySelector('.card-title')?.textContent;
            const propostas = chapa.querySelector('.card-text')?.textContent;
            
            if (numero && nome) {
                textToRead += `Chapa número ${numero}: ${nome}. `;
                if (propostas) {
                    textToRead += `${propostas} `;
                }
                textToRead += 'Para votar nesta chapa, pressione o botão Votar. ';
            }
        });
    }
    
    // Usa a API de síntese de voz se disponível
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = 'pt-BR';
        speechSynthesis.speak(utterance);
        
        // Adiciona controle para parar a leitura
        const stopButton = document.createElement('button');
        stopButton.textContent = 'Parar leitura';
        stopButton.classList.add('btn', 'btn-danger', 'mt-3');
        stopButton.setAttribute('aria-label', 'Parar leitura em voz alta');
        stopButton.onclick = function() {
            speechSynthesis.cancel();
            this.remove();
        };
        
        mainContent.prepend(stopButton);
    } else {
        // Fallback se a API não estiver disponível
        alert('Seu navegador não suporta a funcionalidade de leitura em voz alta.');
    }
}
