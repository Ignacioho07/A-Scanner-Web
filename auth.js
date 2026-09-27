import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// ==========================================
// 🔴 TUS CREDENCIALES DE FIREBASE ACÁ
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyAwWCCHsbAtAhTof-_M4ACa1uiQxc1CcWI",
  authDomain: "scanner-app-c00e9.firebaseapp.com",
  projectId: "scanner-app-c00e9",
  storageBucket: "scanner-app-c00e9.firebasestorage.app",
  messagingSenderId: "236724650270",
  appId: "1:236724650270:web:88d34f611a1154ff24890f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore();
const googleProvider = new GoogleAuthProvider();

document.addEventListener("DOMContentLoaded", () => {
    const btnAuthAction = document.getElementById('btn-auth-action');
    const btnGoogle = document.getElementById('btn-google');
    const emailInput = document.getElementById('email-input');
    const passwordInput = document.getElementById('password-input');
    const confirmPasswordInput = document.getElementById('confirm-password-input');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc'); 

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{7,}$/;

    // ==========================================
    // 🪄 MAGIA 1: TRANSFORMAR PARA PAGAR (MOROSOS O NUEVOS)
    // ==========================================
    function transformarModalParaPago(email, nombre = "Socio") {
        document.querySelectorAll('.input-group').forEach(el => el.style.display = 'none');
        document.getElementById('btn-google').style.display = 'none';
        document.querySelector('.auth-divider').style.display = 'none';
        document.getElementById('auth-toggle-text').style.display = 'none';
        document.getElementById('forgot-password').style.display = 'none'; 
        document.getElementById('btn-logout').style.display = 'block'; 

        modalTitle.innerText = `¡Bienvenido, ${nombre}!`;
        modalDesc.innerHTML = `Sesión vinculada: <strong>${email}</strong><br><br>Para activar el radar y recibir las alertas VIP, aboná tu membresía.`;

        const btnMP = document.getElementById('btn-auth-action');
        btnMP.innerText = "⚡ Abonar $10.000 en Mercado Pago";
        btnMP.style.background = "linear-gradient(135deg, #009EE3 0%, #007EB5 100%)"; 
        btnMP.style.borderColor = "#009EE3";
        btnMP.style.boxShadow = "0 10px 30px -10px #009EE3";

        const nuevoBtnMP = btnMP.cloneNode(true);
        btnMP.parentNode.replaceChild(nuevoBtnMP, btnMP);

        nuevoBtnMP.addEventListener('click', () => {
            nuevoBtnMP.innerText = "Conectando con la pasarela...";
            iniciarFlujoDePago(email);
        });
    }

    // ==========================================
    // 🪄 MAGIA 2: TRANSFORMAR PARA VIP (SOCIOS AL DÍA)
    // ==========================================
    function transformarModalParaVIP(email, nombre = "Socio") {
        // Ocultamos todo lo innecesario del login
        document.querySelectorAll('.input-group').forEach(el => el.style.display = 'none');
        document.getElementById('btn-google').style.display = 'none';
        document.querySelector('.auth-divider').style.display = 'none';
        document.getElementById('auth-toggle-text').style.display = 'none';
        document.getElementById('forgot-password').style.display = 'none'; 
        document.getElementById('btn-logout').style.display = 'block'; 

        // Mensaje de éxito
        modalTitle.innerText = `¡Acceso Concedido, ${nombre}!`;
        modalDesc.innerHTML = `Tu suscripción está <strong>activa</strong>. Ya podés ingresar al canal de operaciones.`;

        // Transformamos el botón para Telegram
        const btnVIP = document.getElementById('btn-auth-action');
        btnVIP.innerText = "🚀 Generar mi Acceso Único al Radar";
        btnVIP.style.background = "linear-gradient(135deg, #2AABEE 0%, #229ED9 100%)"; // Azul Telegram
        btnVIP.style.borderColor = "#2AABEE";
        btnVIP.style.boxShadow = "0 10px 30px -10px #2AABEE";

        const nuevoBtnVIP = btnVIP.cloneNode(true);
        btnVIP.parentNode.replaceChild(nuevoBtnVIP, btnVIP);

        // LE INYECTAMOS LA LÓGICA DE LA LLAVE CRIPTOGRÁFICA
        nuevoBtnVIP.addEventListener('click', async () => {
            window.location.href = "radar.html";

            try {
                const response = await fetch('https://ascanner-server.onrender.com/generar-acceso-vip', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email })
                });

                const data = await response.json();

                if (data.link) {
                    // Viaja directo al link seguro de Telegram
                    window.location.href = data.link; 
                } else {
                    alert("Error generando el acceso VIP. Contactá a soporte.");
                    nuevoBtnVIP.innerText = "🚀 Generar mi Acceso Único al Radar";
                    nuevoBtnVIP.disabled = false;
                }
            } catch (error) {
                alert("El servidor está procesando datos. Reintentá en unos segundos.");
                nuevoBtnVIP.innerText = "🚀 Generar mi Acceso Único al Radar";
                nuevoBtnVIP.disabled = false;
            }
        });
    }

    // ==========================================
    // FLUJO 1: EMAIL Y CONTRASEÑA 
    // ==========================================
    btnAuthAction.addEventListener('click', async () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const confirm = confirmPasswordInput.value.trim();
        const esRegistro = !window.isLoginMode; 

        if (!email || !password) return alert("⚠️ Por favor, ingresá correo y contraseña.");

        if (esRegistro) {
            if (password !== confirm) return alert("❌ Las contraseñas no coinciden.");
            if (!passwordRegex.test(password)) return alert("🔒 Tu contraseña es débil.");

            try {
                btnAuthAction.innerText = "Creando credenciales...";
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                transformarModalParaPago(userCredential.user.email, "Nuevo Socio");
            } catch (error) {
                manejarErrores(error);
                btnAuthAction.innerText = "Registrarse y Pagar $10.000";
            }
        } else {
            try {
                btnAuthAction.innerText = "Verificando credenciales...";
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                const userRef = doc(db, 'usuarios', user.uid);
                const userDoc = await getDoc(userRef);
                
                if (userDoc.exists()) {
                    const datosUsuario = userDoc.data();
                    
                    if (datosUsuario.isPremium === true && datosUsuario.estado_suscripcion !== 'moroso') {
                        console.log("¡Acceso concedido! Cliente Premium.");
                        // 🔥 LLAMAMOS A LA FUNCIÓN VIP
                        transformarModalParaVIP(user.email, "Socio");
                    } else {
                        transformarModalParaPago(user.email, "Socio");
                    }
                } else {
                    transformarModalParaPago(user.email, "Socio");
                }
            } catch (error) {
                console.error(error);
                alert("Error al iniciar sesión. Verificá tus datos.");
                btnAuthAction.innerText = "Iniciar Sesión";
            }
        }
    });

    // ==========================================
    // FLUJO 2: LOGIN CON GOOGLE
    // ==========================================
    btnGoogle.addEventListener('click', async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            const primerNombre = user.displayName ? user.displayName.split(" ")[0] : "Socio";
            
            const userRef = doc(db, 'usuarios', user.uid);
            const userDoc = await getDoc(userRef);
            
            if (userDoc.exists()) {
                const datosUsuario = userDoc.data();
                
                if (datosUsuario.isPremium === true && datosUsuario.estado_suscripcion !== 'moroso') {
                    console.log(`¡Bienvenido ${primerNombre}! Bypass de pago autorizado.`);
                    // 🔥 LLAMAMOS A LA FUNCIÓN VIP CON SU NOMBRE
                    transformarModalParaVIP(user.email, primerNombre);
                } else {
                    transformarModalParaPago(user.email, primerNombre);
                }
            } else {
                transformarModalParaPago(user.email, primerNombre);
            }
        } catch (error) {
            console.error("❌ Error Google Auth:", error);
            alert("No se pudo conectar con Google. Intentá de nuevo.");
        }
    });

    // Manejador de errores estéticos
    function manejarErrores(error) {
        if (error.code === 'auth/email-already-in-use') alert("❌ Ese correo ya existe. Hacé clic en 'Volver a iniciar sesión'.");
        else if (error.code === 'auth/invalid-credential') alert("❌ Correo o contraseña incorrectos.");
        else alert("❌ Error en el servidor: " + error.message);
    }

    // ==========================================
    // EL PUENTE FINAL: FETCH A SERVER.JS
    // ==========================================
    async function iniciarFlujoDePago(email) {
        try {
            const response = await fetch('https://ascanner-server.onrender.com/crear-suscripcion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email })
            });

            const data = await response.json();

            if (data.init_point) {
                window.location.href = data.init_point;
            } else {
                alert("⚠️ Hubo un error al generar el link de Mercado Pago.");
                document.getElementById('btn-auth-action').innerText = "Reintentar conexión";
            }
        } catch (error) {
            console.error("❌ Error conectando con el servidor:", error);
            alert("El servidor de pagos está apagado. Recordá prender node server.js");
        }
    }

    // ==========================================
    // RECUPERAR CONTRASEÑA
    // ==========================================
    const forgotPasswordBtn = document.getElementById('forgot-password');
    forgotPasswordBtn.addEventListener('click', async () => {
        const email = emailInput.value.trim();
        if (!email) {
            return alert("⚠️ Por favor, escribí tu correo electrónico en el campo de arriba y volvé a tocar este botón.");
        }
        try {
            await sendPasswordResetEmail(auth, email);
            alert("✅ Te enviamos un correo para restablecer tu contraseña. Revisá tu bandeja de entrada o Spam.");
        } catch (error) {
            console.error(error);
            alert("❌ Hubo un error. Asegurate de que el correo esté bien escrito.");
        }
    });

    // ==========================================
    // CERRAR SESIÓN
    // ==========================================
    const btnLogout = document.getElementById('btn-logout');
    btnLogout.addEventListener('click', async () => {
        try {
            await signOut(auth);
            window.location.reload(); 
        } catch (error) {
            console.error("Error al cerrar sesión", error);
        }
    });
});