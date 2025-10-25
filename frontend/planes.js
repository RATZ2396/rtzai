const API_URL = 'http://localhost:3000';
let currentUser = null;
let authToken = null;

// Verificar autenticación
function checkAuth() {
    authToken = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!authToken || !userStr) {
        window.location.href = 'login.html';
        return false;
    }
    
    currentUser = JSON.parse(userStr);
    return true;
}

// Inicializar componentes
document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAuth()) return;
    
    document.getElementById('navbar-container').innerHTML = createNavbar();
    document.getElementById('footer-container').innerHTML = createFooter();
    
    await loadCurrentBalance();
});

// Cargar saldo actual del usuario
async function loadCurrentBalance() {
    try {
        const response = await fetch(`${API_URL}/api/credits/balance`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar saldo');
        }
        
        const data = await response.json();
        
        // Actualizar UI
        document.getElementById('current-credits').textContent = data.credits;
        
        // Actualizar localStorage
        currentUser.credits = data.credits;
        localStorage.setItem('user', JSON.stringify(currentUser));
        
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('current-credits').textContent = currentUser.credits || 0;
    }
}

// Comprar plan
async function purchasePlan(planId) {
    // Obtener información del plan
    const plans = {
        'starter': { name: 'Starter', credits: 100, price: 5 },
        'basic': { name: 'Basic', credits: 250, price: 10 },
        'pro': { name: 'Pro', credits: 500, price: 18 },
        'premium': { name: 'Premium', credits: 1000, price: 30 }
    };
    
    const plan = plans[planId];
    
    if (!plan) {
        showToast('Plan no encontrado', 'error');
        return;
    }
    
    // Confirmar compra
    const confirmed = confirm(
        `¿Deseas comprar el plan ${plan.name}?\n\n` +
        `💰 Créditos: ${plan.credits}\n` +
        `💵 Precio: $${plan.price} USD\n\n` +
        `Nota: Este es un sistema de prueba. Los créditos se agregarán automáticamente.`
    );
    
    if (!confirmed) return;
    
    try {
        // Simular compra (en producción esto iría a Stripe/MercadoPago)
        const response = await fetch(`${API_URL}/api/credits/purchase`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                planId: planId,
                credits: plan.credits,
                amount: plan.price
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al procesar la compra');
        }
        
        const data = await response.json();
        
        // Actualizar UI
        document.getElementById('current-credits').textContent = data.newBalance;
        
        // Actualizar localStorage
        currentUser.credits = data.newBalance;
        localStorage.setItem('user', JSON.stringify(currentUser));
        
        // Actualizar navbar si existe
        const creditsBadge = document.querySelector('.credits-badge');
        if (creditsBadge) {
            creditsBadge.textContent = `💰 ${data.newBalance} créditos`;
        }
        
        showToast(
            `✅ ¡Compra exitosa!\n` +
            `Se agregaron ${plan.credits} créditos a tu cuenta.\n` +
            `Nuevo saldo: ${data.newBalance} créditos`,
            'success'
        );
        
    } catch (error) {
        console.error('Error:', error);
        showToast(error.message || 'Error al procesar la compra', 'error');
    }
}

// Mostrar notificaciones toast
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 20px 30px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        font-size: 16px;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
        white-space: pre-line;
    `;
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 4000);
}

// Agregar animaciones CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
