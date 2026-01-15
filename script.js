let seccionActual = 'inicio';
let editandoIndex = null;
const CLAVE_SECRETA = "965112816V";
let unsuscribeChat = null; // Para el chat en tiempo real

window.onload = () => {
    if (localStorage.getItem('vik_admin') === 'true') {
        document.body.classList.add('is-admin');
    }
    aplicarDiseño();
    renderizarPosts();
};

// ACCESO ADMIN
window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        const pass = prompt("Acceso Dueña - Introduce clave:");
        if (pass === CLAVE_SECRETA) {
            localStorage.setItem('vik_admin', 'true');
            document.body.classList.add('is-admin');
            renderizarPosts();
            alert("¡Bienvenida Vik!");
        }
    }
});

// NAVEGACIÓN
window.tab = function(e, id) {
    seccionActual = id;
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if(e) e.currentTarget.classList.add('active');
    
    aplicarDiseño();
    
    if(id === 'comentarios') {
        iniciarChatListener();
    } else {
        if(unsuscribeChat) unsuscribeChat(); // Detener chat si salimos de esa sección
        renderizarPosts();
    }
}

// RENDERIZADO DE POSTS DESDE FIREBASE
async function renderizarPosts() {
    const feed = document.getElementById('feed-' + seccionActual);
    if(!feed) return;

    feed.innerHTML = `<p style="text-align:center; color:white;">Cargando publicaciones...</p>`;

    try {
        const q = window.query(window.collection(window.db, 'posts_' + seccionActual), window.orderBy("fechaOrden", "desc"));
        const querySnapshot = await window.getDocs(q);
        feed.innerHTML = "";

        const nombreBlog = localStorage.getItem('blog_nombre') || "Vikttalie";
        const fotoBlog = localStorage.getItem('blog_img') || "https://via.placeholder.com/100";

        if (querySnapshot.empty) {
            feed.innerHTML = `<p style="text-align:center; color:white; margin-top:20px;">No hay publicaciones en esta sección todavía.</p>`;
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const p = docSnap.data();
            const id = docSnap.id;
            feed.innerHTML += `
                <div class="card-exterior">
                    <div class="admin-btns admin-only">
                        <button onclick="borrarPost('${id}')">🗑️</button>
                    </div>
                    <div class="perfil-zona">
                        <div class="avatar-circulo"><img src="${fotoBlog}"></div>
                        <div style="font-weight:bold; font-size:13px; text-align:center; margin-top:5px;">${nombreBlog}</div>
                    </div>
                    <div class="card-interior">
                        <div class="post-header"><span>${p.titulo}</span> <small>${p.fecha}</small></div>
                        <div style="padding:20px;">
                            <p style="white-space: pre-wrap;">${p.texto}</p>
                            ${p.img ? `<img src="${p.img}" style="width:100%; border-radius:20px; border:3px solid #000; margin-top:15px;">` : ''}
                        </div>
                    </div>
                </div>`;
        });
    } catch (e) {
        console.error("Error cargando posts: ", e);
    }
}

// GUARDAR POST EN FIREBASE
window.guardarPost = async function() {
    const seccionDestino = document.getElementById('post-seccion-destino').value;
    const data = {
        titulo: document.getElementById('post-titulo').value,
        texto: document.getElementById('post-texto').value,
        img: document.getElementById('post-url').value,
        fecha: new Date().toLocaleDateString(),
        fechaOrden: new Date().getTime()
    };

    if(!data.titulo || !data.texto) return alert("Llena los campos");

    try {
        await window.addDoc(window.collection(window.db, 'posts_' + seccionDestino), data);
        cerrarEditorPost();
        window.tab(null, seccionDestino);
    } catch (e) {
        alert("Error al publicar");
    }
}

window.borrarPost = async function(id) {
    if(confirm("¿Eliminar este post definitivamente?")) {
        await window.deleteDoc(window.doc(window.db, 'posts_' + seccionActual, id));
        renderizarPosts();
    }
}

// CHAT EN TIEMPO REAL
function iniciarChatListener() {
    const box = document.getElementById('chat-box');
    if(!box) return;
    if(unsuscribeChat) unsuscribeChat();

    const q = window.query(window.collection(window.db, "chat"), window.orderBy("fechaOrden", "asc"));
    unsuscribeChat = window.onSnapshot(q, (snapshot) => {
        box.innerHTML = "";
        const esAdmin = localStorage.getItem('vik_admin') === 'true';
        snapshot.forEach((docSnap) => {
            const m = docSnap.data();
            box.innerHTML += `
                <div class="msg-bubble">
                    ${esAdmin ? `<button onclick="borrarMsg('${docSnap.id}')" style="float:right; border:none; background:none; cursor:pointer;">🗑️</button>` : ''}
                    <strong>${m.user}:</strong> ${m.text}
                </div>`;
        });
        box.scrollTop = box.scrollHeight;
    });
}

window.enviarChat = async function() {
    const input = document.getElementById('chat-input');
    if(!input.value.trim()) return;
    try {
        await window.addDoc(window.collection(window.db, "chat"), {
            user: localStorage.getItem('blog_nombre') || "Visitante",
            text: input.value,
            fechaOrden: new Date().getTime()
        });
        input.value = "";
    } catch(e) { console.error(e); }
}

window.borrarMsg = async function(id) {
    await window.deleteDoc(window.doc(window.db, "chat", id));
}

// --- MANTENER FUNCIONES DE DISEÑO EXISTENTES (Local) ---
function aplicarDiseño() {
    const navColor = localStorage.getItem('v_color_nav') || '#bca89d';
    const header = document.getElementById('main-header');
    if(header) header.style.backgroundColor = navColor;

    const fondo = localStorage.getItem('v_fondo_img');
    const opFondo = localStorage.getItem('v_op_fondo') || "1";
    document.body.style.backgroundImage = fondo ? `url('${fondo}')` : 'none';
    document.getElementById('fondo-overlay').style.opacity = 1 - opFondo;

    const bannerImg = localStorage.getItem('v_banner_' + seccionActual);
    const opBanner = localStorage.getItem('v_op_banner_' + seccionActual) || "1";
    const bannerDiv = document.getElementById('banner-seccion');
    
    if(bannerImg) {
        bannerDiv.style.backgroundImage = `url('${bannerImg}')`;
        bannerDiv.style.opacity = opBanner;
        bannerDiv.innerText = "";
    } else {
        bannerDiv.style.backgroundImage = "none";
        bannerDiv.style.opacity = "1";
        bannerDiv.innerText = seccionActual.toUpperCase();
    }
}

window.guardarTodoConfig = function() {
    localStorage.setItem('blog_nombre', document.getElementById('perfil-nombre').value);
    localStorage.setItem('blog_img', document.getElementById('perfil-img').value);
    localStorage.setItem('v_color_nav', document.getElementById('cfg-color-nav').value);
    localStorage.setItem('v_fondo_img', document.getElementById('cfg-fondo-web').value);
    localStorage.setItem('v_op_fondo', document.getElementById('cfg-op-fondo').value);
    localStorage.setItem('v_banner_' + seccionActual, document.getElementById('cfg-banner-secc').value);
    localStorage.setItem('v_op_banner_' + seccionActual, document.getElementById('cfg-op-banner').value);
    aplicarDiseño();
    toggleModalPerfil(false);
}

window.toggleModalPerfil = function(s) {
    if(s) {
        document.getElementById('perfil-nombre').value = localStorage.getItem('blog_nombre') || "";
        document.getElementById('perfil-img').value = localStorage.getItem('blog_img') || "";
        document.getElementById('cfg-color-nav').value = localStorage.getItem('v_color_nav') || "#bca89d";
        document.getElementById('cfg-fondo-web').value = localStorage.getItem('v_fondo_img') || "";
        document.getElementById('cfg-op-fondo').value = localStorage.getItem('v_op_fondo') || "1";
        document.getElementById('cfg-banner-secc').value = localStorage.getItem('v_banner_' + seccionActual) || "";
        document.getElementById('cfg-op-banner').value = localStorage.getItem('v_op_banner_' + seccionActual) || "1";
    }
    document.getElementById('modal-perfil').style.display = s ? 'block' : 'none';
}

window.cerrarSesion = () => { localStorage.removeItem('vik_admin'); location.reload(); }
window.abrirEditorPost = () => { document.getElementById('modal-post').style.display = 'block'; }
window.cerrarEditorPost = () => { document.getElementById('modal-post').style.display = 'none'; }
window.verTabConfig = (id) => { document.querySelectorAll('.config-content').forEach(c => c.style.display = 'none'); document.getElementById(id).style.display = 'block'; }
