// Función mejorada para mostrar modal de créditos - RTZAI
// Esta es la versión corregida que debe reemplazar showCreditsInfo() en script.js

async function showCreditsInfo() {
    try {
        // Obtener saldo actual y planes
        const [balanceRes, plansRes] = await Promise.all([
            fetch(`${API_URL}/api/credits/balance`, { headers: getAuthHeaders() }),
            fetch(`${API_URL}/api/credits/plans`)
        ]);
        
        if (!balanceRes.ok || !plansRes.ok) {
            throw new Error('Error al cargar datos');
        }
        
        const balanceData = await balanceRes.json();
        const plansData = await plansRes.json();
        
        const credits = balanceData.credits;
        const plans = plansData.plans;
        
        // Crear elemento del modal
        const modalHTML = `
            <div id="credits-modal-overlay" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.75);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                animation: fadeIn 0.3s ease;
            ">
                <div id="credits-modal-content" style="
                    background: #ffffff;
                    border-radius: 16px;
                    max-width: 650px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    position: relative;
                    animation: slideUp 0.3s ease;
                ">
                    <!-- Botón cerrar -->
                    <button onclick="document.getElementById('credits-modal-overlay').remove()" style="
                        position: absolute;
                        top: 15px;
                        right: 15px;
                        background: #f1f5f9;
                        border: none;
                        border-radius: 50%;
                        width: 32px;
                        height: 32px;
                        font-size: 20px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s;
                        color: #64748b;
                        padding: 0;
                        line-height: 1;
                    " onmouseover="this.style.background='#e2e8f0'; this.style.color='#1e293b';" 
                       onmouseout="this.style.background='#f1f5f9'; this.style.color='#64748b';">
                        ✕
                    </button>

                    <!-- Header: Saldo actual -->
                    <div style="
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        padding: 40px 30px;
                        border-radius: 16px 16px 0 0;
                        text-align: center;
                        color: white;
                    ">
                        <h2 style="margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">
                            💰 Tu Saldo de Créditos
                        </h2>
                        <div style="font-size: 64px; font-weight: bold; margin: 15px 0; text-shadow: 0 2px 10px rgba(0,0,0,0.2);">
                            ${credits}
                        </div>
                        <p style="margin: 0; font-size: 16px; opacity: 0.95;">
                            créditos disponibles
                        </p>
                    </div>

                    <!-- Contenido del modal -->
                    <div style="padding: 30px;">
                        
                        <!-- Sección: Costos por acción -->
                        <div style="margin-bottom: 30px;">
                            <h3 style="
                                margin: 0 0 20px 0;
                                font-size: 20px;
                                font-weight: 600;
                                color: #1e293b;
                                display: flex;
                                align-items: center;
                                gap: 10px;
                            ">
                                <span>💡</span> Costos por Acción
                            </h3>
                            <div style="
                                background: #f8fafc;
                                border-radius: 12px;
                                padding: 20px;
                                border: 1px solid #e2e8f0;
                            ">
                                <!-- Imagen básica -->
                                <div style="
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    padding: 12px 0;
                                    border-bottom: 1px solid #e2e8f0;
                                ">
                                    <span style="color: #475569; font-size: 15px;">
                                        <span style="margin-right: 8px;">🎨</span>
                                        Generar imagen (Stable Diffusion)
                                    </span>
                                    <strong style="color: #0f172a; font-size: 16px;">1 crédito</strong>
                                </div>
                                
                                <!-- Video -->
                                <div style="
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    padding: 12px 0;
                                    border-bottom: 1px solid #e2e8f0;
                                ">
                                    <span style="color: #475569; font-size: 15px;">
                                        <span style="margin-right: 8px;">📹</span>
                                        Generar video (5 segundos)
                                    </span>
                                    <strong style="color: #0f172a; font-size: 16px;">5 créditos</strong>
                                </div>
                                
                                <!-- OpenAI -->
                                <div style="
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    padding: 12px 0;
                                    border-bottom: 1px solid #e2e8f0;
                                ">
                                    <span style="color: #475569; font-size: 15px;">
                                        <span style="margin-right: 8px;">🤖</span>
                                        OpenAI DALL-E 3 (premium)
                                    </span>
                                    <strong style="color: #0f172a; font-size: 16px;">+10 créditos</strong>
                                </div>
                                
                                <!-- 4K -->
                                <div style="
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    padding: 12px 0;
                                ">
                                    <span style="color: #475569; font-size: 15px;">
                                        <span style="margin-right: 8px;">✨</span>
                                        Calidad 4K Ultra
                                    </span>
                                    <strong style="color: #0f172a; font-size: 16px;">+5 créditos</strong>
                                </div>
                            </div>
                        </div>

                        <!-- Sección: Planes disponibles -->
                        <div style="margin-bottom: 20px;">
                            <h3 style="
                                margin: 0 0 20px 0;
                                font-size: 20px;
                                font-weight: 600;
                                color: #1e293b;
                                display: flex;
                                align-items: center;
                                gap: 10px;
                            ">
                                <span>💎</span> Planes Disponibles
                            </h3>
                            <div style="display: grid; gap: 12px;">
                                ${plans.map(plan => `
                                    <div style="
                                        border: 2px solid ${plan.popular ? '#667eea' : '#e2e8f0'};
                                        border-radius: 12px;
                                        padding: 18px 20px;
                                        background: ${plan.popular ? '#f7fafc' : '#ffffff'};
                                        transition: all 0.3s;
                                        cursor: pointer;
                                    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(102, 126, 234, 0.2)';"
                                       onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                                        <div style="display: flex; justify-content: space-between; align-items: center;">
                                            <div style="flex: 1;">
                                                <div style="
                                                    font-size: 18px;
                                                    font-weight: 600;
                                                    color: #1e293b;
                                                    margin-bottom: 5px;
                                                ">
                                                    ${plan.name} ${plan.popular ? '<span style="color: #f59e0b;">⭐</span>' : ''}
                                                </div>
                                                <div style="
                                                    font-size: 14px;
                                                    color: #64748b;
                                                ">
                                                    ${plan.credits} créditos • ${plan.description || 'Plan completo'}
                                                </div>
                                            </div>
                                            <div style="
                                                font-size: 28px;
                                                font-weight: bold;
                                                color: #667eea;
                                                margin-left: 20px;
                                            ">
                                                $${plan.price}
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Botón ir a planes -->
                        <a href="planes.html" style="
                            display: block;
                            width: 100%;
                            padding: 14px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            text-align: center;
                            border-radius: 10px;
                            text-decoration: none;
                            font-weight: 600;
                            font-size: 16px;
                            margin-bottom: 15px;
                            transition: all 0.3s;
                        " onmouseover="this.style.transform='scale(1.02)'; this.style.boxShadow='0 8px 20px rgba(102, 126, 234, 0.4)';"
                           onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none';">
                            Ver Todos los Planes →
                        </a>

                        <!-- Nota -->
                        <p style="
                            text-align: center;
                            color: #94a3b8;
                            font-size: 13px;
                            margin: 0;
                            line-height: 1.5;
                        ">
                            💳 Los pagos con Stripe y MercadoPago estarán disponibles próximamente
                        </p>
                    </div>
                </div>
            </div>
        `;

        // Agregar animaciones CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            #credits-modal-content::-webkit-scrollbar {
                width: 8px;
            }
            #credits-modal-content::-webkit-scrollbar-track {
                background: #f1f5f9;
                border-radius: 10px;
            }
            #credits-modal-content::-webkit-scrollbar-thumb {
                background: #cbd5e1;
                border-radius: 10px;
            }
            #credits-modal-content::-webkit-scrollbar-thumb:hover {
                background: #94a3b8;
            }
        `;
        document.head.appendChild(style);

        // Crear elemento temporal
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = modalHTML;
        const modal = tempDiv.firstElementChild;

        // Cerrar al hacer click fuera
        modal.addEventListener('click', (e) => {
            if (e.target.id === 'credits-modal-overlay') {
                modal.remove();
            }
        });

        // Agregar al DOM
        document.body.appendChild(modal);
        
    } catch (error) {
        console.error('Error al cargar información de créditos:', error);
        showToast('Error al cargar información de créditos. Intenta nuevamente.', 'error');
    }
}
