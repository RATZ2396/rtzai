let userProfile = null;
let userStats = null;
let referralData = null;

document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAuth()) return;
    
    document.getElementById('navbar-container').innerHTML = createNavbar();
    document.getElementById('footer-container').innerHTML = createFooter();
    
    await loadProfile();
    await loadStats();
    await loadReferralData();
});

async function loadProfile() {
    try {
        const response = await fetch(`${API_URL}/api/user/profile`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) throw new Error('Error al cargar perfil');
        
        const data = await response.json();
        userProfile = data.user;
        
        displayProfile();
        checkDailyReward();
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al cargar perfil', 'error');
    }
}

async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/api/user/stats`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) throw new Error('Error al cargar estadísticas');
        
        const data = await response.json();
        userStats = data.stats;
        
        displayStats();
    } catch (error) {
        console.error('Error:', error);
    }
}

async function loadReferralData() {
    try {
        const response = await fetch(`${API_URL}/api/user/referral`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) throw new Error('Error al cargar datos de referidos');
        
        const data = await response.json();
        referralData = data;
        
        displayReferralData();
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayProfile() {
    const avatar = document.getElementById('profile-avatar');
    avatar.src = userProfile.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name)}&size=150`;
    
    document.getElementById('profile-name').textContent = userProfile.name;
    
    const levelBadge = document.getElementById('profile-level-badge');
    levelBadge.textContent = `${userProfile.levelName || 'Básico'} - Nivel ${userProfile.level || 1}`;
    levelBadge.className = `badge badge-${(userProfile.levelName || 'básico').toLowerCase()}`;
    
    const memberSince = new Date(userProfile.createdAt).toLocaleDateString('es-ES', {
        month: 'long',
        year: 'numeric'
    });
    document.getElementById('profile-member-since').textContent = `Miembro desde ${memberSince}`;
    
    document.getElementById('profile-images-count').textContent = userProfile.totalImagesGenerated || 0;
    document.getElementById('profile-likes-count').textContent = userProfile.stats?.communityLikes || 0;
    document.getElementById('profile-referrals-count').textContent = userProfile.referralCount || 0;
    
    // Llenar formularios de configuración
    document.getElementById('settings-name').value = userProfile.name;
    document.getElementById('settings-email').value = userProfile.email;
    document.getElementById('settings-picture').value = userProfile.picture || '';
    document.getElementById('settings-public-profile').checked = userProfile.preferences?.publicProfile || false;
    document.getElementById('settings-notifications').checked = userProfile.preferences?.notifications !== false;
}

function displayStats() {
    document.getElementById('stat-credits').textContent = userStats.credits || 0;
    document.getElementById('stat-credits-spent').textContent = userStats.totalCreditsSpent || 0;
    document.getElementById('stat-total-images').textContent = userStats.totalImagesGenerated || 0;
    document.getElementById('stat-favorites').textContent = currentUser?.stats?.favoriteImages?.length || 0;
    document.getElementById('stat-level').textContent = userStats.level || 1;
    document.getElementById('stat-referral-earnings').textContent = userStats.referralEarnings || 0;
    
    // Mostrar transacciones recientes
    const transactionsList = document.getElementById('recent-transactions');
    transactionsList.innerHTML = '';
    
    if (userStats.recentTransactions && userStats.recentTransactions.length > 0) {
        userStats.recentTransactions.forEach(tx => {
            const txEl = document.createElement('div');
            txEl.className = 'transaction-item';
            
            const isPositive = tx.amount > 0;
            const icon = isPositive ? '💰' : '💸';
            const sign = isPositive ? '+' : '';
            
            txEl.innerHTML = `
                <div class="transaction-info">
                    <span class="transaction-icon">${icon}</span>
                    <div>
                        <div class="transaction-description">${tx.description}</div>
                        <div class="transaction-date">${formatDate(tx.createdAt)}</div>
                    </div>
                </div>
                <div class="transaction-amount ${isPositive ? 'positive' : 'negative'}">
                    ${sign}${tx.amount} créditos
                </div>
            `;
            
            transactionsList.appendChild(txEl);
        });
    } else {
        transactionsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No hay transacciones recientes</p>';
    }
}

function displayReferralData() {
    document.getElementById('referral-code').textContent = referralData.referralCode;
    document.getElementById('referral-link').value = referralData.referralLink;
    document.getElementById('referral-count').textContent = referralData.referralCount || 0;
    document.getElementById('referral-earnings').textContent = referralData.referralEarnings || 0;
    
    // Mostrar usuarios referidos
    const referredUsersList = document.getElementById('referred-users-list');
    const noReferrals = document.getElementById('no-referrals');
    
    if (referralData.referredUsers && referralData.referredUsers.length > 0) {
        referredUsersList.innerHTML = '';
        noReferrals.style.display = 'none';
        
        referralData.referredUsers.forEach(user => {
            const userCard = document.createElement('div');
            userCard.className = 'referred-user-card';
            
            userCard.innerHTML = `
                <img src="${user.picture || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name)}" 
                     alt="${user.name}">
                <div class="referred-user-info">
                    <strong>${user.name}</strong>
                    <small>${formatDate(user.createdAt)}</small>
                </div>
            `;
            
            referredUsersList.appendChild(userCard);
        });
    } else {
        noReferrals.style.display = 'block';
    }
}

function checkDailyReward() {
    const streakDays = userProfile.dailyStreakDays || 0;
    document.getElementById('daily-streak-days').textContent = streakDays;
    
    // Calcular si puede reclamar
    const lastReward = userProfile.lastDailyReward ? new Date(userProfile.lastDailyReward) : null;
    const now = new Date();
    
    let canClaim = true;
    let nextRewardTime = null;
    
    if (lastReward) {
        const hoursSinceLast = (now - lastReward) / (1000 * 60 * 60);
        canClaim = hoursSinceLast >= 20; // 20 horas para dar margen
        
        if (!canClaim) {
            nextRewardTime = new Date(lastReward.getTime() + 24 * 60 * 60 * 1000);
        }
    }
    
    const claimBtn = document.getElementById('claim-daily-btn');
    const description = document.getElementById('daily-reward-description');
    
    if (canClaim) {
        claimBtn.disabled = false;
        const baseCredits = 5;
        const bonusCredits = Math.min(streakDays * 2, 20);
        const totalCredits = baseCredits + bonusCredits;
        description.textContent = `¡Reclama ${totalCredits} créditos gratis hoy!`;
    } else {
        claimBtn.disabled = true;
        const hoursLeft = Math.ceil((nextRewardTime - now) / (1000 * 60 * 60));
        description.textContent = `Próxima recompensa en ${hoursLeft} hora${hoursLeft !== 1 ? 's' : ''}`;
    }
}

async function claimDailyReward() {
    try {
        const response = await fetch(`${API_URL}/api/user/daily-reward`, {
            method: 'POST',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al reclamar recompensa');
        }
        
        const data = await response.json();
        
        showToast(`¡${data.credits} créditos reclamados! Racha: ${data.streakDays} días`, 'success');
        
        // Recargar perfil y actualizar navbar
        await loadProfile();
        await refreshUserData();
        
        // Actualizar navbar
        const navbarContainer = document.getElementById('navbar-container');
        if (navbarContainer) {
            navbarContainer.innerHTML = createNavbar();
        }
    } catch (error) {
        console.error('Error:', error);
        showToast(error.message, 'error');
    }
}

function switchTab(tab) {
    // Actualizar tabs
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    // Mostrar/ocultar secciones
    document.getElementById('stats-section').style.display = tab === 'stats' ? 'block' : 'none';
    document.getElementById('referrals-section').style.display = tab === 'referrals' ? 'block' : 'none';
    document.getElementById('settings-section').style.display = tab === 'settings' ? 'block' : 'none';
}

function copyReferralCode() {
    const code = document.getElementById('referral-code').textContent;
    navigator.clipboard.writeText(code);
    showToast('Código copiado al portapapeles', 'success');
}

function copyReferralLink() {
    const link = document.getElementById('referral-link');
    link.select();
    navigator.clipboard.writeText(link.value);
    showToast('Enlace copiado al portapapeles', 'success');
}

async function saveProfile() {
    try {
        const name = document.getElementById('settings-name').value;
        const picture = document.getElementById('settings-picture').value;
        
        const response = await fetch(`${API_URL}/api/user/profile`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify({ name, picture })
        });
        
        if (!response.ok) throw new Error('Error al actualizar perfil');
        
        const data = await response.json();
        userProfile = data.user;
        
        // Actualizar localStorage
        currentUser.name = name;
        currentUser.picture = picture;
        localStorage.setItem('user', JSON.stringify(currentUser));
        
        displayProfile();
        
        // Actualizar navbar
        const navbarContainer = document.getElementById('navbar-container');
        if (navbarContainer) {
            navbarContainer.innerHTML = createNavbar();
        }
        
        showToast('Perfil actualizado exitosamente', 'success');
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al actualizar perfil', 'error');
    }
}

async function savePreferences() {
    try {
        const publicProfile = document.getElementById('settings-public-profile').checked;
        const notifications = document.getElementById('settings-notifications').checked;
        
        const response = await fetch(`${API_URL}/api/user/profile`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                preferences: { publicProfile, notifications }
            })
        });
        
        if (!response.ok) throw new Error('Error al actualizar preferencias');
        
        showToast('Preferencias actualizadas exitosamente', 'success');
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al actualizar preferencias', 'error');
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}
