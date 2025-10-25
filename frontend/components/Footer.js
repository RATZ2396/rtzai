function createFooter() {
    const currentYear = new Date().getFullYear();
    
    return `
        <footer class="footer">
            <div class="footer-content">
                <p>&copy; ${currentYear} RTZAI. Generador de Imágenes con Inteligencia Artificial.</p>
                <ul class="footer-links">
                    <li><a href="#privacy">Privacidad</a></li>
                    <li><a href="#terms">Términos</a></li>
                    <li><a href="#contact">Contacto</a></li>
                </ul>
            </div>
        </footer>
    `;
}
