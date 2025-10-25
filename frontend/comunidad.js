let currentTab = 'explore';
let currentPage = 1;
let imagesPerPage = 20;
let communityImages = [];

document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;
    
    document.getElementById('navbar-container').innerHTML = createNavbar();
    document.getElementById('footer-container').innerHTML = createFooter();
    
    loadCommunityImages();
});

function switchTab(tab) {
    currentTab = tab;
    
    // Actualizar tabs activos
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    // Mostrar/ocultar secciones
    document.getElementById('explore-section').style.display = tab === 'explore' ? 'block' : 'none';
    document.getElementById('trending-section').style.display = tab === 'trending' ? 'block' : 'none';
    document.getElementById('creators-section').style.display = tab === 'creators' ? 'block' : 'none';
    document.getElementById('explore-filters').style.display = tab === 'explore' ? 'flex' : 'none';
    
    // Cargar datos según tab
    if (tab === 'explore') {
        loadCommunityImages();
    } else if (tab === 'trending') {
        loadTrendingImages();
    } else if (tab === 'creators') {
        loadTopCreators();
    }
}

async function loadCommunityImages() {
    try {
        const timeframe = document.getElementById('timeframe-filter').value;
        const sortBy = document.getElementById('sort-filter').value;
        
        document.getElementById('loading-explore').style.display = 'flex';
        
        const response = await fetch(
            `${API_URL}/api/community/explore?page=${currentPage}&limit=${imagesPerPage}&sortBy=${sortBy}&timeframe=${timeframe}`
        );
        
        if (!response.ok) throw new Error('Error al cargar comunidad');
        
        const data = await response.json();
        communityImages = data.images || [];
        
        document.getElementById('loading-explore').style.display = 'none';
        
        if (communityImages.length === 0) {
            document.getElementById('no-images-explore').style.display = 'block';
            document.getElementById('explore-gallery').style.display = 'none';
        } else {
            document.getElementById('no-images-explore').style.display = 'none';
            document.getElementById('explore-gallery').style.display = 'grid';
            displayCommunityImages();
        }
        
        updatePagination(data.pagination);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('loading-explore').style.display = 'none';
        showToast('Error al cargar imágenes de la comunidad', 'error');
    }
}

async function loadTrendingImages() {
    try {
        document.getElementById('loading-trending').style.display = 'flex';
        
        const response = await fetch(`${API_URL}/api/community/trending?limit=20`);
        
        if (!response.ok) throw new Error('Error al cargar tendencias');
        
        const data = await response.json();
        const trendingImages = data.images || [];
        
        document.getElementById('loading-trending').style.display = 'none';
        
        if (trendingImages.length === 0) {
            document.getElementById('no-images-trending').style.display = 'block';
            document.getElementById('trending-gallery').style.display = 'none';
        } else {
            document.getElementById('no-images-trending').style.display = 'none';
            document.getElementById('trending-gallery').style.display = 'grid';
            
            const gallery = document.getElementById('trending-gallery');
            gallery.innerHTML = '';
            
            trendingImages.forEach(image => {
                const card = createCommunityCard(image);
                gallery.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('loading-trending').style.display = 'none';
        showToast('Error al cargar tendencias', 'error');
    }
}

async function loadTopCreators() {
    try {
        document.getElementById('loading-creators').style.display = 'flex';
        
        const response = await fetch(`${API_URL}/api/community/top-creators?limit=20`);
        
        if (!response.ok) throw new Error('Error al cargar creadores');
        
        const data = await response.json();
        const creators = data.creators || [];
        
        document.getElementById('loading-creators').style.display = 'none';
        
        if (creators.length === 0) {
            document.getElementById('no-creators').style.display = 'block';
            document.getElementById('creators-grid').style.display = 'none';
        } else {
            document.getElementById('no-creators').style.display = 'none';
            document.getElementById('creators-grid').style.display = 'grid';
            
            const grid = document.getElementById('creators-grid');
            grid.innerHTML = '';
            
            creators.forEach((creator, index) => {
                const card = createCreatorCard(creator, index + 1);
                grid.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('loading-creators').style.display = 'none';
        showToast('Error al cargar creadores', 'error');
    }
}

function displayCommunityImages() {
    const gallery = document.getElementById('explore-gallery');
    gallery.innerHTML = '';
    
    communityImages.forEach(image => {
        const card = createCommunityCard(image);
        gallery.appendChild(card);
    });
}

function createCommunityCard(image) {
    const card = document.createElement('div');
    card.className = 'image-card';
    
    const hasLiked = image.likes?.some(like => like.user === currentUser?._id);
    
    card.innerHTML = `
        <div class="video-wrapper">
            <img src="${image.url}" alt="${image.prompt}" loading="lazy">
            <div style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.7); padding: 5px 10px; border-radius: 8px; color: white; font-size: 0.85rem;">
                ❤️ ${image.likesCount || 0}
            </div>
        </div>
        <div class="video-info">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <img src="${image.user?.picture || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(image.user?.name || 'User')}" 
                     alt="${image.user?.name}" 
                     style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">
                <div>
                    <strong style="color: var(--text-primary);">${image.user?.name || 'Usuario'}</strong>
                    ${image.user?.levelName ? `<span class="badge badge-${image.user.levelName.toLowerCase()}" style="margin-left: 0.5rem; font-size: 0.65rem;">${image.user.levelName}</span>` : ''}
                </div>
            </div>
            <p class="video-prompt">${image.prompt}</p>
            <div class="video-meta">
                <span>🤖 ${getProviderName(image.aiProvider)}</span>
                <span>📐 ${image.quality?.toUpperCase()}</span>
                <span>👁️ ${image.views || 0}</span>
            </div>
            <div class="video-meta">
                <span>📅 ${formatDate(image.createdAt)}</span>
            </div>
            <div class="action-buttons">
                <button class="btn-icon btn-favorite ${hasLiked ? 'active' : ''}" 
                        onclick="toggleLike('${image._id}', ${hasLiked})" 
                        title="${hasLiked ? 'Quitar like' : 'Dar like'}">
                    ${hasLiked ? '❤️' : '🤍'}
                </button>
                <button class="btn-icon btn-share" 
                        onclick="sharePublicImage('${image._id}')" 
                        title="Compartir">
                    📤
                </button>
                <button class="btn-download" onclick="downloadImage('${image.url}', '${image.prompt}')">
                    ⬇️ Descargar
                </button>
            </div>
        </div>
    `;
    
    return card;
}

function createCreatorCard(creator, rank) {
    const card = document.createElement('div');
    card.className = 'stat-card';
    
    const medals = ['🥇', '🥈', '🥉'];
    const medal = rank <= 3 ? medals[rank - 1] : `#${rank}`;
    
    card.innerHTML = `
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">${medal}</div>
        <img src="${creator.picture || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(creator.name)}" 
             alt="${creator.name}" 
             style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin: 1rem 0;">
        <h3 style="color: var(--text-primary); margin: 0.5rem 0;">${creator.name}</h3>
        <span class="badge badge-${creator.levelName?.toLowerCase() || 'basic'}">${creator.levelName || 'Básico'}</span>
        <div style="margin-top: 1rem; display: flex; gap: 1rem; justify-content: center;">
            <div style="text-align: center;">
                <div style="font-size: 1.5rem; font-weight: bold; color: var(--accent-primary);">${creator.totalImagesGenerated || 0}</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">Imágenes</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 1.5rem; font-weight: bold; color: var(--accent-primary);">${creator.stats?.communityLikes || 0}</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">Likes</div>
            </div>
        </div>
    `;
    
    return card;
}

async function toggleLike(imageId, hasLiked) {
    try {
        const method = hasLiked ? 'DELETE' : 'POST';
        
        const response = await fetch(`${API_URL}/api/images/${imageId}/like`, {
            method,
            headers: getAuthHeaders()
        });
        
        if (!response.ok) throw new Error('Error al actualizar like');
        
        // Recargar imágenes según tab actual
        if (currentTab === 'explore') {
            await loadCommunityImages();
        } else if (currentTab === 'trending') {
            await loadTrendingImages();
        }
        
        showToast(hasLiked ? 'Like removido' : 'Like agregado', 'success');
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al actualizar like', 'error');
    }
}

function sharePublicImage(imageId) {
    const shareUrl = `${window.location.origin}/comunidad.html?image=${imageId}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'RTZAI - Imagen con IA',
            text: '¡Mira esta increíble imagen generada con IA!',
            url: shareUrl
        }).catch(err => console.log('Error compartiendo:', err));
    } else {
        navigator.clipboard.writeText(shareUrl);
        showToast('Enlace copiado al portapapeles', 'success');
    }
}

function changePage(direction) {
    currentPage += direction;
    loadCommunityImages();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updatePagination(pagination) {
    if (!pagination) {
        document.getElementById('pagination').style.display = 'none';
        return;
    }
    
    const { page, pages } = pagination;
    
    document.getElementById('prev-page').disabled = page === 1;
    document.getElementById('next-page').disabled = page === pages;
    document.getElementById('page-info').textContent = `Página ${page} de ${pages}`;
    
    document.getElementById('pagination').style.display = pages > 1 ? 'flex' : 'none';
}

function getProviderName(provider) {
    const names = {
        'huggingface': 'SD XL',
        'openai': 'DALL-E 3',
        'midjourney': 'Midjourney',
        'leonardo': 'Leonardo AI',
        'flux': 'Flux Pro'
    };
    return names[provider] || provider;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        if (hours < 1) {
            const minutes = Math.floor(diff / 60000);
            return `Hace ${minutes} min`;
        }
        return `Hace ${hours}h`;
    }
    
    if (diff < 604800000) {
        const days = Math.floor(diff / 86400000);
        return `Hace ${days} día${days !== 1 ? 's' : ''}`;
    }
    
    return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
    });
}

function downloadImage(url, prompt) {
    const link = document.createElement('a');
    link.href = url;
    link.download = `rtzai-${prompt.substring(0, 30).replace(/[^a-z0-9]/gi, '-')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
