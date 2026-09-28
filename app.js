document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("auth-modal");
    const btnIngresar = document.getElementById("btn-ingresar");
    const btnSuscribirse = document.getElementById("btn-suscribirse");
    const btnClose = document.querySelector(".close-modal");
    const modalTitle = document.getElementById("modal-title");
    const btnAuthAction = document.getElementById("btn-auth-action");
    const confirmGroup = document.getElementById("confirm-group");
    const toggleText = document.getElementById("auth-toggle-text");

    window.isLoginMode = true;

    window.setAuthMode = (login) => {
        window.isLoginMode = login;

        if (login) {
            modalTitle.innerText = "Ingresar";
            btnAuthAction.innerText = "Iniciar sesión";
            confirmGroup.style.display = "none";

            toggleText.innerHTML =
                '¿No tenés cuenta? <span id="toggle-link" onclick="setAuthMode(false)">Crear una aquí</span>';
        } else {
            modalTitle.innerText = "Crear cuenta";
            btnAuthAction.innerText = "Crear cuenta";
            confirmGroup.style.display = "block";

            toggleText.innerHTML =
                '¿Ya tenés cuenta? <span id="toggle-link" onclick="setAuthMode(true)">Volver a iniciar sesión</span>';
        }
    };

    const openModal = (modo) => {
        window.setAuthMode(modo === "ingreso");
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
    };

    const closeModal = () => {
        modal.classList.remove("active");
        document.body.style.overflow = "auto";
    };

    btnIngresar.addEventListener("click", () =>
        openModal("ingreso")
    );

    btnSuscribirse.addEventListener("click", () =>
        openModal("suscripcion")
    );

    btnClose.addEventListener("click", closeModal);

    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    document
        .querySelectorAll(".faq-question")
        .forEach((button) => {
            button.addEventListener("click", () => {
                const faqItem = button.parentElement;
                faqItem.classList.toggle("active");

                const answer =
                    faqItem.querySelector(".faq-answer");

                if (
                    faqItem.classList.contains("active")
                ) {
                    answer.style.maxHeight =
                        answer.scrollHeight + "px";
                } else {
                    answer.style.maxHeight = "0px";
                }
            });
        });
});
