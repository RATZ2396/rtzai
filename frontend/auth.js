const API_URL = 'http://localhost:3000';

// Funciones de utilidad
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

// Manejar formulario de login
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const loginBtn = document.getElementById('login-btn');
        
        // Deshabilitar botón
        loginBtn.disabled = true;
        loginBtn.querySelector('.btn-text').textContent = 'Iniciando sesión...';
        loginBtn.querySelector('.loader').style.display = 'inline-block';
        
        try {
            const response = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Error al iniciar sesión');
            }
            
            // Guardar token y datos del usuario
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            showToast('¡Bienvenido de vuelta!', 'success');
            
            // Redirigir al dashboard
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
            
        } catch (error) {
            showToast(error.message, 'error');
            loginBtn.disabled = false;
            loginBtn.querySelector('.btn-text').textContent = 'Iniciar Sesión';
            loginBtn.querySelector('.loader').style.display = 'none';
        }
    });
}

// Manejar formulario de registro
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const registerBtn = document.getElementById('register-btn');
        
        // Deshabilitar botón
        registerBtn.disabled = true;
        registerBtn.querySelector('.btn-text').textContent = 'Creando cuenta...';
        registerBtn.querySelector('.loader').style.display = 'inline-block';
        
        try {
            const response = await fetch(`${API_URL}/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Error al registrarse');
            }
            
            // Guardar token y datos del usuario
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Mostrar mensaje con créditos
            const credits = data.user.credits || 50;
            showToast(`¡Cuenta creada exitosamente! 🎉\n💰 Tienes ${credits} créditos gratis para empezar`, 'success');
            
            // Redirigir al dashboard
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            
        } catch (error) {
            showToast(error.message, 'error');
            registerBtn.disabled = false;
            registerBtn.querySelector('.btn-text').textContent = 'Crear Cuenta';
            registerBtn.querySelector('.loader').style.display = 'none';
        }
    });
}

// Manejar login con Google
const googleLoginBtn = document.getElementById('google-login-btn');
if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', () => {
        // Redirigir a la ruta de autenticación de Google
        window.location.href = `${API_URL}/api/auth/google`;
    });
}

// Manejar registro con Google
const googleRegisterBtn = document.getElementById('google-register-btn');
if (googleRegisterBtn) {
    googleRegisterBtn.addEventListener('click', () => {
        // Redirigir a la ruta de autenticación de Google
        window.location.href = `${API_URL}/api/auth/google`;
    });
}
