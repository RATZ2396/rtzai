const API_URL = 'http://localhost:3000';
let currentUser = null;
let authToken = null;

// Verificar autenticación
function checkAuth() {
    authToken = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!authToken || !userStr) {
        // No hay sesión, redirigir a login
        window.location.href = 'login.html';
        return false;
    }
    
    currentUser = JSON.parse(userStr);
    return true;
}

// Cerrar sesión
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Obtener headers con autenticación
function getAuthHeaders() {
    return {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
    };
}

// Inicializar componentes
document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticación primero
    if (!checkAuth()) return;
    
    document.getElementById('navbar-container').innerHTML = createNavbar();
    document.getElementById('footer-container').innerHTML = createFooter();
    
    // Mostrar información del usuario
    updateUserInfo();
    
    // Actualizar créditos desde el servidor
    refreshUserData();
    
    loadVideos();
    initializeForm();
    initializeAIProviderSelector();
    initializeQualitySelector();
    
    // Botón de logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});

// Actualizar información del usuario en la UI
function updateUserInfo() {
    // Actualizar nombre del usuario
    const userNameEl = document.getElementById('user-name');
    if (userNameEl && currentUser) {
        userNameEl.textContent = currentUser.name;
    }
    
    // Actualizar créditos
    const creditsEl = document.getElementById('user-credits');
    if (creditsEl && currentUser) {
        creditsEl.textContent = currentUser.credits;
    }
    
    // Actualizar créditos en navbar
    updateNavbarCredits();
}

// Recargar datos del usuario desde el servidor
async function refreshUserData() {
    try {
        // Obtener saldo de créditos desde el nuevo endpoint
        const creditsResponse = await fetch(`${API_URL}/api/credits/balance`, {
            headers: getAuthHeaders()
        });
        
        if (!creditsResponse.ok) {
            if (creditsResponse.status === 401) {
                // Token inválido, cerrar sesión
                logout();
                return;
            }
            throw new Error('Error al obtener datos del usuario');
        }
        
        const creditsData = await creditsResponse.json();
        
        // Actualizar los créditos del usuario actual
        if (currentUser) {
            currentUser.credits = creditsData.credits;
            localStorage.setItem('user', JSON.stringify(currentUser));
            updateUserInfo();
        }
        
        console.log('💰 Créditos actualizados:', creditsData.credits);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

// Actualizar display de créditos
function updateCreditsDisplay() {
    const creditsHint = document.getElementById('quality-hint');
    
    if (creditsHint && currentUser) {
        creditsHint.classList.remove('warning', 'danger', 'hidden');
        creditsHint.innerHTML = `Tienes <span>${currentUser.credits}</span> créditos`;
        
        // Cambiar color según créditos restantes
        if (currentUser.credits <= 1) {
            creditsHint.classList.add('danger');
        } else if (currentUser.credits <= 3) {
            creditsHint.classList.add('warning');
        }
    }
}

// Inicializar selector de calidad
function initializeQualitySelector() {
    const qualitySelect = document.getElementById('quality');
    
    qualitySelect.addEventListener('change', () => {
        updateQualityBadge();
    });
    
    updateQualityBadge();
}

// Actualizar hint de calidad
function updateQualityBadge() {
    updateCreditsDisplay();
}

// Inicializar selector de proveedor de IA
function initializeAIProviderSelector() {
    const aiProviderSelect = document.getElementById('ai-provider');
    const creditsInfo = document.getElementById('credits-info');
    const buyCreditsLink = document.getElementById('buy-credits-link');
    
    // Modelos que requieren créditos (de pago)
    const premiumProviders = ['openai', 'midjourney', 'leonardo', 'flux'];
    
    aiProviderSelect.addEventListener('change', () => {
        const selectedProvider = aiProviderSelect.value;
        
        // Mostrar/ocultar mensaje de créditos
        if (premiumProviders.includes(selectedProvider)) {
            creditsInfo.style.display = 'block';
        } else {
            creditsInfo.style.display = 'none';
        }
    });
    
    // Evento para comprar créditos
    if (buyCreditsLink) {
        buyCreditsLink.addEventListener('click', (e) => {
            e.preventDefault();
            showCreditsInfo();
        });
    }
}

// Inicializar formulario
function initializeForm() {
    const form = document.getElementById('video-form');
    const generateBtn = document.getElementById('generate-btn');
    
    if (!form || !generateBtn) {
        console.error('Elementos del formulario no encontrados');
        return;
    }

    form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const prompt = document.getElementById('prompt').value;
    const imageFile = document.getElementById('image-upload').files[0];
    const aiProvider = document.getElementById('ai-provider').value;
    const quality = document.getElementById('quality').value;

    if (!prompt.trim()) {
        showToast('Por favor ingresa una descripción', 'error');
        return;
    }

    // Verificar créditos
    if (currentUser.credits < 1) {
        showToast('❌ No tienes créditos suficientes. Cada imagen cuesta 1 crédito.', 'error');
        return;
    }

    // Deshabilitar botón y mostrar estado
    generateBtn.disabled = true;
    const originalText = generateBtn.innerHTML;
    generateBtn.innerHTML = '<span class="btn-text">Generando imagen...</span><span class="loader"></span>';

    try {
        const formData = new FormData();
        formData.append('prompt', prompt);
        formData.append('aiProvider', aiProvider);
        formData.append('quality', quality);
        
        if (imageFile) {
            formData.append('image', imageFile);
        }

        const response = await fetch(`${API_URL}/api/generate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            
            // Manejar error de créditos insuficientes
            if (response.status === 403 && error.code === 'INSUFFICIENT_CREDITS') {
                const details = error.details || {};
                throw new Error(`❌ No tienes créditos suficientes\n\nNecesitas: ${details.requiredCredits || 'N/A'} créditos\nTienes: ${details.currentCredits || 0} créditos\nFaltan: ${details.missingCredits || 'N/A'} créditos`);
            }
            
            throw new Error(error.error || 'Error al generar la imagen');
        }

        const data = await response.json();
        
        // Actualizar créditos del usuario
        if (data.creditsRemaining !== undefined) {
            currentUser.credits = data.creditsRemaining;
            localStorage.setItem('user', JSON.stringify(currentUser));
            updateUserInfo(); // Esto también actualiza el navbar gracias a updateNavbarCredits()
            updateCreditsDisplay();
            console.log(`💰 Créditos usados: ${data.creditsUsed}, Créditos restantes: ${data.creditsRemaining}`);
        }
        
        showToast(`✅ ¡Imagen generada! Créditos usados: ${data.creditsUsed || 1}. Te quedan ${currentUser.credits} créditos.`, 'success');
        
        // Limpiar formulario
        form.reset();
        
        // Resetear selector de IA a opción gratuita
        document.getElementById('ai-provider').value = 'huggingface';
        document.getElementById('credits-info').style.display = 'none';
        
        // Recargar galería
        await loadVideos();
        
    } catch (error) {
        console.error('Error:', error);
        showToast(error.message || 'Error al generar la imagen', 'error');
    } finally {
        // Restaurar botón
        generateBtn.disabled = false;
        generateBtn.innerHTML = originalText;
    }
    });
}

// Cargar imágenes del usuario
async function loadVideos() {
    try {
        const response = await fetch(`${API_URL}/api/images`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                logout();
                return;
            }
            throw new Error('Error al cargar imágenes');
        }
        
        const videos = await response.json();
        
        const gallery = document.getElementById('videos-gallery');
        const noVideos = document.getElementById('no-videos');
        
        if (videos.length === 0) {
            gallery.style.display = 'none';
            noVideos.style.display = 'block';
        } else {
            gallery.style.display = 'grid';
            noVideos.style.display = 'none';
            
            gallery.innerHTML = videos.map(video => createVideoCard(video)).join('');
            
            // Agregar event listeners a los botones
            videos.forEach(video => {
                const downloadBtn = document.getElementById(`download-${video.id}`);
                const deleteBtn = document.getElementById(`delete-${video.id}`);
                
                if (downloadBtn) {
                    downloadBtn.addEventListener('click', () => downloadVideo(video));
                }
                
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', () => deleteVideo(video.id));
                }
            });
        }
        
    } catch (error) {
        console.error('Error al cargar videos:', error);
        showToast('Error al cargar los videos', 'error');
    }
}

// Descargar video
function downloadVideo(video) {
    const link = document.createElement('a');
    link.href = video.url;
    link.download = `video-${video.id}.mp4`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Descargando video...', 'success');
}

// Eliminar video
async function deleteVideo(videoId) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/images/${videoId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Error al eliminar el video');
        }

        showToast('Video eliminado', 'success');
        await loadVideos();
        
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al eliminar el video', 'error');
    }
}

// Mostrar notificaciones toast
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Mostrar información de créditos
async function showCreditsInfo() {
    try {
        // Obtener saldo actual y planes
        const [balanceRes, plansRes] = await Promise.all([
            fetch(`${API_URL}/api/credits/balance`, { headers: getAuthHeaders() }),
            fetch(`${API_URL}/api/credits/plans`)
        ]);
        
        const balanceData = await balanceRes.json();
        const plansData = await plansRes.json();
        
        const credits = balanceData.credits;
        const plans = plansData.plans;
        
        // Crear modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.7); z-index: 10000; display: flex;
            align-items: center; justify-content: center; padding: 20px;
        `;
        
        modal.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 12px; max-width: 600px; width: 100%; max-height: 80vh; overflow-y: auto;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h2 style="margin: 0 0 10px 0;">💰 Tus Créditos</h2>
                    <div style="font-size: 48px; font-weight: bold; color: #667eea;">${credits}</div>
                    <p style="color: #666; margin: 5px 0;">créditos disponibles</p>
                </div>
                
                <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 15px 0; font-size: 18px;">💡 Costos por Acción</h3>
                    <div style="display: grid; gap: 10px;">
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                            <span>🎨 Generar imagen (HuggingFace)</span>
                            <strong>1 crédito</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                            <span>📹 Generar video</span>
                            <strong>5 créditos</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                            <span>🤖 OpenAI (DALL-E 3)</span>
                            <strong>+10 créditos</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                            <span>✨ Calidad 4K</span>
                            <strong>+5 créditos</strong>
                        </div>
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h3 style="margin: 0 0 15px 0; font-size: 18px;">💎 Planes Disponibles</h3>
                    <div style="display: grid; gap: 10px;">
                        ${plans.map(plan => `
                            <div style="border: 2px solid ${plan.popular ? '#667eea' : '#e2e8f0'}; padding: 15px; border-radius: 8px; ${plan.popular ? 'background: #f7fafc;' : ''}">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <strong>${plan.name}</strong> ${plan.popular ? '⭐' : ''}
                                        <div style="color: #666; font-size: 14px;">${plan.credits} créditos</div>
                                    </div>
                                    <div style="font-size: 24px; font-weight: bold; color: #667eea;">
                                        $${plan.price}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <p style="text-align: center; color: #999; font-size: 14px; margin-top: 15px;">
                        💳 Sistema de pagos próximamente disponible
                    </p>
                </div>
                
                <button onclick="this.parentElement.parentElement.remove()" style="
                    width: 100%; padding: 12px; background: #667eea; color: white;
                    border: none; border-radius: 8px; font-size: 16px; cursor: pointer;
                    font-weight: bold;
                ">Cerrar</button>
            </div>
        `;
        
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
        
        document.body.appendChild(modal);
        
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al cargar información de créditos', 'error');
    }
}

// Actualizar badge de créditos en navbar
function updateNavbarCredits() {
    const creditsBadge = document.querySelector('.credits-badge');
    if (creditsBadge && currentUser) {
        creditsBadge.textContent = `💰 ${currentUser.credits} créditos`;
    }
}

