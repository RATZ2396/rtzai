// Variables de paginación y filtros
let currentPage = 1;
const imagesPerPage = 20;
let allImages = [];
let filteredImages = [];

// Inicializar página
document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAuth()) return;
    
    // Inicializar componentes
    document.getElementById('navbar-container').innerHTML = createNavbar();
    document.getElementById('footer-container').innerHTML = createFooter();
    
    // Cargar imágenes
    await loadHistoryImages();
    
    // Event listeners para filtros
    document.getElementById('search-input').addEventListener('input', applyFilters);
    document.getElementById('sort-select').addEventListener('change', applyFilters);
    document.getElementById('provider-filter').addEventListener('change', applyFilters);
    document.getElementById('quality-filter').addEventListener('change', applyFilters);
    
    // Event listeners para paginación
    document.getElementById('prev-page').addEventListener('click', () => changePage(-1));
    document.getElementById('next-page').addEventListener('click', () => changePage(1));
});

// Cargar imágenes del historial
async function loadHistoryImages() {
    try {
        showLoading(true);
        
        const response = await fetch(`${API_URL}/api/images/history?page=${currentPage}&limit=1000`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar historial');
        }
        
        const data = await response.json();
        allImages = data.images || [];
        filteredImages = [...allImages];
        
        // Actualizar estadísticas
        updateStats();
        
        // Aplicar filtros y mostrar imágenes
        applyFilters();
        
        showLoading(false);
        
        if (allImages.length === 0) {
            document.getElementById('no-images').style.display = 'block';
            document.getElementById('images-gallery').style.display = 'none';
        } else {
            document.getElementById('no-images').style.display = 'none';
            document.getElementById('images-gallery').style.display = 'grid';
        }
    } catch (error) {
        console.error('Error cargando historial:', error);
        showLoading(false);
        showToast('Error al cargar el historial', 'error');
    }
}

// Actualizar estadísticas
async function updateStats() {
    try {
        const statsResponse = await fetch(`${API_URL}/api/user/stats`, {
            headers: getAuthHeaders()
        });
        
        if (statsResponse.ok) {
            const stats = await statsResponse.json();
            
            document.getElementById('total-images').textContent = stats.stats.totalImagesGenerated || 0;
            document.getElementById('total-credits-spent').textContent = stats.stats.totalCreditsSpent || 0;
            document.getElementById('total-favorites').textContent = currentUser?.stats?.favoriteImages?.length || 0;
            
            // Calcular vistas totales
            const totalViews = allImages.reduce((sum, img) => sum + (img.views || 0), 0);
            document.getElementById('total-views').textContent = totalViews;
        }
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

// Aplicar filtros
function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const sortValue = document.getElementById('sort-select').value;
    const providerFilter = document.getElementById('provider-filter').value;
    const qualityFilter = document.getElementById('quality-filter').value;
    
    // Filtrar imágenes
    filteredImages = allImages.filter(image => {
        const matchesSearch = image.prompt.toLowerCase().includes(searchTerm);
        const matchesProvider = !providerFilter || image.aiProvider === providerFilter;
        const matchesQuality = !qualityFilter || image.quality === qualityFilter;
        
        return matchesSearch && matchesProvider && matchesQuality;
    });
    
    // Ordenar imágenes
    const [sortBy, order] = sortValue.split('-');
    filteredImages.sort((a, b) => {
        let aVal = a[sortBy];
        let bVal = b[sortBy];
        
        if (sortBy === 'createdAt') {
            aVal = new Date(aVal).getTime();
            bVal = new Date(bVal).getTime();
        }
        
        return order === 'desc' ? bVal - aVal : aVal - bVal;
    });
    
    // Reiniciar a la primera página
    currentPage = 1;
    
    // Mostrar imágenes
    displayImages();
}

// Mostrar imágenes
function displayImages() {
    const gallery = document.getElementById('images-gallery');
    
    // Calcular índices de paginación
    const startIndex = (currentPage - 1) * imagesPerPage;
    const endIndex = startIndex + imagesPerPage;
    const imagesToShow = filteredImages.slice(startIndex, endIndex);
    
    // Limpiar galería
    gallery.innerHTML = '';
    
    // Crear cards de imágenes
    imagesToShow.forEach(image => {
        const card = createImageCard(image);
        gallery.appendChild(card);
    });
    
    // Actualizar paginación
    updatePagination();
}

// Crear card de imagen mejorada
function createImageCard(image) {
    const card = document.createElement('div');
    card.className = 'image-card';
    
    const isFavorite = currentUser?.stats?.favoriteImages?.includes(image._id);
    
    card.innerHTML = `
        <div class="video-wrapper">
            <img src="${image.url}" alt="${image.prompt}" loading="lazy">
        </div>
        <div class="video-info">
            <p class="video-prompt">${image.prompt}</p>
            <div class="video-meta">
                <span>🤖 ${getProviderName(image.aiProvider)}</span>
                <span>📐 ${image.quality.toUpperCase()}</span>
                <span>💰 ${image.creditsUsed} créditos</span>
            </div>
            <div class="video-meta">
                <span>📅 ${formatDate(image.createdAt)}</span>
                ${image.isPublic ? '<span>🌐 Público</span>' : '<span>🔒 Privado</span>'}
                <span>👁️ ${image.views || 0} vistas</span>
            </div>
            <div class="action-buttons">
                <button class="btn-icon btn-favorite ${isFavorite ? 'active' : ''}" 
                        onclick="toggleFavorite('${image._id}')" 
                        title="${isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}">
                    ${isFavorite ? '❤️' : '🤍'}
                </button>
                <button class="btn-icon btn-public ${image.isPublic ? 'active' : ''}" 
                        onclick="togglePublic('${image._id}', ${image.isPublic})" 
                        title="${image.isPublic ? 'Hacer privada' : 'Hacer pública'}">
                    ${image.isPublic ? '🌐' : '🔒'}
                </button>
                <button class="btn-icon btn-share" 
                        onclick="shareImage('${image._id}')" 
                        title="Compartir">
                    📤
                </button>
                <button class="btn-download" onclick="downloadImage('${image.url}', '${image.prompt}')">
                    ⬇️ Descargar
                </button>
                <button class="btn-delete" onclick="deleteImage('${image._id}')">
                    🗑️ Eliminar
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Obtener nombre del proveedor
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

// Formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // Menos de 1 día
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        if (hours < 1) {
            const minutes = Math.floor(diff / 60000);
            return `Hace ${minutes} min`;
        }
        return `Hace ${hours}h`;
    }
    
    // Menos de 7 días
    if (diff < 604800000) {
        const days = Math.floor(diff / 86400000);
        return `Hace ${days} día${days !== 1 ? 's' : ''}`;
    }
    
    // Formato completo
    return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
    });
}

// Toggle favorito
async function toggleFavorite(imageId) {
    try {
        const isFavorite = currentUser?.stats?.favoriteImages?.includes(imageId);
        const method = isFavorite ? 'DELETE' : 'POST';
        
        const response = await fetch(`${API_URL}/api/images/${imageId}/favorite`, {
            method,
            headers: getAuthHeaders()
        });
        
        if (!response.ok) throw new Error('Error al actualizar favorito');
        
        // Actualizar usuario local
        await refreshUserData();
        
        // Recargar imágenes
        await loadHistoryImages();
        
        showToast(isFavorite ? 'Quitado de favoritos' : 'Agregado a favoritos', 'success');
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al actualizar favorito', 'error');
    }
}

// Toggle visibilidad pública
async function togglePublic(imageId, isCurrentlyPublic) {
    try {
        const response = await fetch(`${API_URL}/api/images/${imageId}/visibility`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify({ isPublic: !isCurrentlyPublic })
        });
        
        if (!response.ok) throw new Error('Error al cambiar visibilidad');
        
        // Actualizar imagen en la lista
        const image = allImages.find(img => img._id === imageId);
        if (image) image.isPublic = !isCurrentlyPublic;
        
        displayImages();
        
        showToast(isCurrentlyPublic ? 'Imagen ahora es privada' : 'Imagen ahora es pública', 'success');
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al cambiar visibilidad', 'error');
    }
}

// Compartir imagen
function shareImage(imageId) {
    const image = allImages.find(img => img._id === imageId);
    if (!image) return;
    
    const shareText = `¡Mira esta increíble imagen generada con IA en RTZAI! "${image.prompt}"`;
    const shareUrl = `${window.location.origin}/comunidad.html?image=${imageId}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'RTZAI - Imagen con IA',
            text: shareText,
            url: shareUrl
        }).catch(err => console.log('Error compartiendo:', err));
    } else {
        // Copiar al portapapeles
        navigator.clipboard.writeText(shareUrl);
        showToast('Enlace copiado al portapapeles', 'success');
    }
}

// Descargar imagen
function downloadImage(url, prompt) {
    const link = document.createElement('a');
    link.href = url;
    link.download = `rtzai-${prompt.substring(0, 30).replace(/[^a-z0-9]/gi, '-')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Eliminar imagen
async function deleteImage(imageId) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta imagen?')) return;
    
    try {
        const response = await fetch(`${API_URL}/api/images/${imageId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) throw new Error('Error al eliminar imagen');
        
        // Eliminar de la lista local
        allImages = allImages.filter(img => img._id !== imageId);
        filteredImages = filteredImages.filter(img => img._id !== imageId);
        
        displayImages();
        updateStats();
        
        showToast('Imagen eliminada', 'success');
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al eliminar imagen', 'error');
    }
}

// Cambiar página
function changePage(direction) {
    const totalPages = Math.ceil(filteredImages.length / imagesPerPage);
    const newPage = currentPage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        displayImages();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Actualizar paginación
function updatePagination() {
    const totalPages = Math.ceil(filteredImages.length / imagesPerPage);
    
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages;
    document.getElementById('page-info').textContent = `Página ${currentPage} de ${totalPages}`;
    
    document.getElementById('pagination').style.display = totalPages > 1 ? 'flex' : 'none';
}

// Mostrar/ocultar loading
function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'flex' : 'none';
}

// Mostrar toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}
