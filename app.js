document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById('auth-modal');
    const btnIngresar = document.getElementById('btn-ingresar');
    const btnSuscribirse = document.getElementById('btn-suscribirse');
    const btnClose = document.querySelector('.close-modal');
    const modalTitle = document.getElementById('modal-title');
    const btnAuthAction = document.getElementById('btn-auth-action');
    const confirmGroup = document.getElementById('confirm-group');
    const toggleText = document.getElementById('auth-toggle-text');
    const confirmInput = document.getElementById('confirm-password-input');

    // Estado global de la ventana
    window.isLoginMode = true; 

    // Función para cambiar entre Login y Registro
    window.setAuthMode = (login) => {
        window.isLoginMode = login;
        if(login) {
            modalTitle.innerText = "Acceso VIP";
            btnAuthAction.innerText = "Iniciar Sesión";
            confirmGroup.style.display = "none";
            toggleText.innerHTML = '¿No tenés cuenta? <span id="toggle-link" onclick="setAuthMode(false)">Crear una aquí</span>';
        } else {
            modalTitle.innerText = "Crear Cuenta";
            btnAuthAction.innerText = "Registrarse y Pagar $10.000";
            confirmGroup.style.display = "block";
            toggleText.innerHTML = '¿Ya tenés cuenta? <span id="toggle-link" onclick="setAuthMode(true)">Volver a iniciar sesión</span>';
        }
    };

    const openModal = (modo) => {
        window.setAuthMode(modo === 'ingreso');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    btnIngresar.addEventListener('click', () => openModal('ingreso'));
    btnSuscribirse.addEventListener('click', () => openModal('suscripcion'));
    btnClose.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    // Bloqueo de Pegado (Anti-tontos)
    confirmInput.addEventListener('paste', e => {
        e.preventDefault();
        alert("⚠️ Por tu seguridad, debés escribir la contraseña manualmente.");
    });

    document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
        const faqItem = button.parentElement;
        
        // Alternamos la clase active en el elemento clickeado
        faqItem.classList.toggle('active');
        
        // Control dinámico de la altura para la animación CSS
        const answer = faqItem.querySelector('.faq-answer');
        if (faqItem.classList.contains('active')) {
            answer.style.maxHeight = answer.scrollHeight + "px";
        } else {
            answer.style.maxHeight = "0px";
        }
    });
});
});