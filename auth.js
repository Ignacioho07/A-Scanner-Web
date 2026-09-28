import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    signOut
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";


const API_BASE =
    "https://a-scanner-server.onrender.com";


const firebaseConfig = {
    apiKey: "AIzaSyAwWCCHsbAtAhTof-_M4ACa1uiQxc1CcWI",
    authDomain: "scanner-app-c00e9.firebaseapp.com",
    projectId: "scanner-app-c00e9",
    storageBucket: "scanner-app-c00e9.firebasestorage.app",
    messagingSenderId: "236724650270",
    appId: "1:236724650270:web:88d34f611a1154ff24890f"
};


const firebaseApp =
    initializeApp(firebaseConfig);

const auth =
    getAuth(firebaseApp);

const googleProvider =
    new GoogleAuthProvider();


async function apiFetch(
    user,
    path,
    options = {}
) {
    const token =
        await user.getIdToken();

    const response =
        await fetch(
            `${API_BASE}${path}`,
            {
                ...options,

                headers: {
                    "Content-Type":
                        "application/json",

                    Authorization:
                        `Bearer ${token}`,

                    ...(options.headers || {})
                }
            }
        );

    let data = {};

    try {
        data = await response.json();
    } catch (_) {}

    if (!response.ok) {
        throw new Error(
            data.error ||
            "Error del servidor"
        );
    }

    return data;
}


document.addEventListener(
    "DOMContentLoaded",
    () => {

        const btnAuthAction =
            document.getElementById(
                "btn-auth-action"
            );

        const btnGoogle =
            document.getElementById(
                "btn-google"
            );

        const emailInput =
            document.getElementById(
                "email-input"
            );

        const passwordInput =
            document.getElementById(
                "password-input"
            );

        const confirmPasswordInput =
            document.getElementById(
                "confirm-password-input"
            );

        const modalTitle =
            document.getElementById(
                "modal-title"
            );

        const modalDesc =
            document.getElementById(
                "modal-desc"
            );

        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{7,}$/;


        function ocultarCamposAuth() {

            document
                .querySelectorAll(
                    ".input-group"
                )
                .forEach(
                    el =>
                        el.style.display =
                        "none"
                );

            btnGoogle.style.display =
                "none";

            document.querySelector(
                ".auth-divider"
            ).style.display =
                "none";

            document.getElementById(
                "auth-toggle-text"
            ).style.display =
                "none";

            document.getElementById(
                "forgot-password"
            ).style.display =
                "none";

            document.getElementById(
                "btn-logout"
            ).style.display =
                "block";
        }


        function reemplazarBoton() {

            const oldButton =
                document.getElementById(
                    "btn-auth-action"
                );

            const newButton =
                oldButton.cloneNode(true);

            oldButton.parentNode
                .replaceChild(
                    newButton,
                    oldButton
                );

            return newButton;
        }


        function mostrarPago(
            user,
            nombre = "Socio"
        ) {

            ocultarCamposAuth();

            modalTitle.innerText =
                `¡Bienvenido, ${nombre}!`;

            modalDesc.innerHTML =
                `Sesión vinculada: <strong>${user.email}</strong>` +
                `<br><br>` +
                `Tu cuenta todavía no tiene una membresía Ultra activa.`;

            const btn =
                reemplazarBoton();

            btn.innerText =
                "⚡ Suscribirme por $10.000/mes";

            btn.style.background =
                "linear-gradient(135deg, #009EE3 0%, #007EB5 100%)";

            btn.style.borderColor =
                "#009EE3";

            btn.addEventListener(
                "click",
                async () => {

                    try {

                        btn.disabled = true;

                        btn.innerText =
                            "Conectando con Mercado Pago...";

                        const data =
                            await apiFetch(
                                user,
                                "/crear-suscripcion",
                                {
                                    method: "POST"
                                }
                            );

                        window.location.href =
                            data.init_point;

                    } catch (error) {

                        console.error(error);

                        alert(
                            "❌ " +
                            error.message
                        );

                        btn.disabled =
                            false;

                        btn.innerText =
                            "⚡ Suscribirme por $10.000/mes";
                    }
                }
            );
        }


        function mostrarPremium(
            user,
            nombre = "Socio"
        ) {

            ocultarCamposAuth();

            modalTitle.innerText =
                `¡Acceso activo, ${nombre}!`;

            modalDesc.innerHTML =
                `Tu membresía A-Scanner Ultra está ` +
                `<strong>activa</strong>.`;

            const btn =
                reemplazarBoton();

            btn.innerText =
                "🚀 Entrar al Radar";

            btn.style.background =
                "linear-gradient(135deg, #2AABEE 0%, #229ED9 100%)";

            btn.style.borderColor =
                "#2AABEE";

            btn.addEventListener(
                "click",
                () => {
                    window.location.href =
                        "radar.html";
                }
            );
        }


        async function resolverEstado(
            user,
            nombre
        ) {

            const estado =
                await apiFetch(
                    user,
                    "/mi-estado"
                );

            if (estado.isPremium) {

                mostrarPremium(
                    user,
                    nombre
                );

            } else {

                mostrarPago(
                    user,
                    nombre
                );
            }
        }


        btnAuthAction.addEventListener(
            "click",
            async () => {

                const email =
                    emailInput.value.trim();

                const password =
                    passwordInput.value;

                const confirm =
                    confirmPasswordInput.value;

                const esRegistro =
                    !window.isLoginMode;


                if (
                    !email ||
                    !password
                ) {
                    return alert(
                        "Ingresá correo y contraseña."
                    );
                }


                try {

                    btnAuthAction.disabled =
                        true;


                    if (esRegistro) {

                        if (
                            password !==
                            confirm
                        ) {
                            throw new Error(
                                "Las contraseñas no coinciden."
                            );
                        }


                        if (
                            !passwordRegex.test(
                                password
                            )
                        ) {
                            throw new Error(
                                "La contraseña debe incluir mayúscula, minúscula, número y símbolo."
                            );
                        }


                        const credential =
                            await createUserWithEmailAndPassword(
                                auth,
                                email,
                                password
                            );


                        mostrarPago(
                            credential.user,
                            "Nuevo socio"
                        );

                        return;
                    }


                    const credential =
                        await signInWithEmailAndPassword(
                            auth,
                            email,
                            password
                        );


                    await resolverEstado(
                        credential.user,
                        "Socio"
                    );


                } catch (error) {

                    console.error(error);

                    alert(
                        "❌ " +
                        (
                            error.message ||
                            "No se pudo iniciar sesión."
                        )
                    );

                    btnAuthAction.disabled =
                        false;

                    btnAuthAction.innerText =
                        esRegistro
                            ? "Crear cuenta"
                            : "Iniciar sesión";
                }
            }
        );


        btnGoogle.addEventListener(
            "click",
            async () => {

                try {

                    const result =
                        await signInWithPopup(
                            auth,
                            googleProvider
                        );


                    const nombre =
                        result.user.displayName
                            ? result.user.displayName
                                .split(" ")[0]
                            : "Socio";


                    await resolverEstado(
                        result.user,
                        nombre
                    );


                } catch (error) {

                    console.error(error);

                    alert(
                        "No se pudo iniciar sesión con Google."
                    );
                }
            }
        );


        document
            .getElementById(
                "forgot-password"
            )
            .addEventListener(
                "click",
                async () => {

                    const email =
                        emailInput.value.trim();


                    if (!email) {
                        return alert(
                            "Escribí tu correo primero."
                        );
                    }


                    try {

                        await sendPasswordResetEmail(
                            auth,
                            email
                        );

                        alert(
                            "Te enviamos el correo para restablecer la contraseña."
                        );

                    } catch (error) {

                        console.error(error);

                        alert(
                            "No pudimos enviar el correo."
                        );
                    }
                }
            );


        document
            .getElementById(
                "btn-logout"
            )
            .addEventListener(
                "click",
                async () => {

                    await signOut(auth);

                    window.location.reload();
                }
            );
    }
);
