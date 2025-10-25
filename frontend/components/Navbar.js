function createNavbar() {
    // Obtener usuario actual
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const credits = user ? user.credits : 0;
    const theme = localStorage.getItem('theme') || 'dark';
    
    return `
        <nav class="navbar">
            <div class="navbar-content">
                <div class="navbar-brand">
                    <a href="index.html" style="text-decoration: none;">
                        <span style="font-size: 24px; font-weight: bold; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">RTZ</span><span style="font-weight: bold; color: var(--text-primary);">AI</span>
                    </a>
                </div>
                <ul class="navbar-links">
                    <li><a href="index.html">🏠 Inicio</a></li>
                    <li><a href="historial.html">📚 Historial</a></li>
                    <li><a href="favoritos.html">⭐ Favoritos</a></li>
                    <li><a href="comunidad.html">👥 Comunidad</a></li>
                    <li><a href="planes.html">💎 Planes</a></li>
                    <li><a href="perfil.html">👤 Perfil</a></li>
                </ul>
                <div class="navbar-actions">
                    <button class="theme-toggle" onclick="toggleTheme()" title="Cambiar tema">
                        <span class="theme-toggle-slider">${theme === 'light' ? '☀️' : '🌙'}</span>
                    </button>
                    <a href="planes.html" class="credits-badge" title="Ver planes y comprar créditos">
                        💰 <span id="navbar-credits">${credits}</span>
                    </a>
                </div>
            </div>
        </nav>
        <style>
            .navbar-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 2rem;
            }
            
            .navbar-links {
                display: flex;
                gap: 1.5rem;
                list-style: none;
                flex: 1;
                justify-content: center;
            }
            
            .navbar-links a {
                color: var(--text-secondary);
                text-decoration: none;
                font-weight: 500;
                font-size: 0.9rem;
                transition: color 0.3s;
                padding: 0.5rem 0.75rem;
                border-radius: 6px;
            }
            
            .navbar-links a:hover {
                color: var(--text-primary);
                background: rgba(99, 102, 241, 0.1);
            }
            
            .navbar-actions {
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            
            .theme-toggle {
                position: relative;
                width: 60px;
                height: 30px;
                background: var(--border-color);
                border-radius: 30px;
                cursor: pointer;
                transition: background 0.3s ease;
                border: none;
                padding: 0;
            }
            
            .theme-toggle:hover {
                background: var(--accent-primary);
            }
            
            .theme-toggle-slider {
                position: absolute;
                top: 3px;
                left: ${theme === 'light' ? '33px' : '3px'};
                width: 24px;
                height: 24px;
                background: white;
                border-radius: 50%;
                transition: left 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
            }
            
            .credits-badge {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 8px 16px;
                border-radius: 20px;
                color: white;
                font-weight: bold;
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
                text-decoration: none;
                font-size: 0.9rem;
            }
            
            .credits-badge:hover {
                transform: scale(1.05);
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
            }
            
            @media (max-width: 1024px) {
                .navbar-links {
                    gap: 1rem;
                }
                
                .navbar-links a {
                    font-size: 0.85rem;
                    padding: 0.4rem 0.6rem;
                }
            }
            
            @media (max-width: 768px) {
                .navbar-content {
                    flex-wrap: wrap;
                }
                
                .navbar-links {
                    order: 3;
                    width: 100%;
                    justify-content: flex-start;
                    overflow-x: auto;
                    padding-bottom: 0.5rem;
                }
                
                .navbar-links a {
                    white-space: nowrap;
                }
            }
        </style>
    `;
}

// Función para actualizar créditos en el navbar
function updateNavbarCredits() {
    const creditsEl = document.getElementById('navbar-credits');
    if (creditsEl && currentUser) {
        creditsEl.textContent = currentUser.credits;
    }
}

// Función para cambiar tema
function toggleTheme() {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Recargar navbar para actualizar el icono
    const navbarContainer = document.getElementById('navbar-container');
    if (navbarContainer) {
        navbarContainer.innerHTML = createNavbar();
    }
    
    // Actualizar preferencia en el backend si el usuario está autenticado
    if (currentUser && authToken) {
        fetch(`${API_URL}/api/user/profile`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                preferences: { theme: newTheme }
            })
        }).catch(err => console.error('Error actualizando tema:', err));
    }
}

// Inicializar tema al cargar
document.addEventListener('DOMContentLoaded', () => {
    const theme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
});
