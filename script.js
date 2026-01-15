let seccionActual = 'inicio';
let editandoIndex = null;
const CLAVE_SECRETA = "965112816V";

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

// NAVEGACIÓN ENTRE SECCIONES
function tab(e, id) {
    seccionActual = id;
    
    // Cambiar clases activas
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active'));
    
    document.getElementById(id).classList.add('active');
    if(e) e.currentTarget.classList.add('active');
    
    aplicarDiseño();
    
    if(id === 'comentarios') {
        renderChat();
    } else {
        renderizarPosts();
    }
}

// DISEÑO PERSONALIZADO (Aquí está la lógica del color de la barra)
function aplicarDiseño() {
    // 1. Aplicar color de barra nav guardado
    const navColor = localStorage.getItem('v_color_nav') || '#bca89d';
    const header = document.getElementById('main-header');
    if(header) header.style.backgroundColor = navColor;

    // 2. Fondo y Banner
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

// RENDERIZADO DE POSTS
function renderizarPosts() {
    document.querySelectorAll('[id^="feed-"]').forEach(feed => feed.innerHTML = "");

    const container = document.getElementById('feed-' + seccionActual);
    if(!container) return;
    
    const key = 'posts_vik_' + seccionActual;
    const posts = JSON.parse(localStorage.getItem(key) || "[]");
    const nombre = localStorage.getItem('blog_nombre') || "Vikttalie";
    const foto = localStorage.getItem('blog_img') || "";

    if(posts.length === 0) {
        container.innerHTML = `<p style="text-align:center; color:white; margin-top:20px;">No hay publicaciones en esta sección todavía.</p>`;
        return;
    }

    posts.forEach((p, i) => {
        container.innerHTML += `
            <div class="card-exterior">
                <div class="admin-btns admin-only">
                    <button onclick="editarPost(${i})">✏️</button>
                    <button onclick="borrarPost(${i})">🗑️</button>
                </div>
                <div class="perfil-zona">
                    <div class="avatar-circulo"><img src="${foto || 'https://via.placeholder.com/100'}"></div>
                    <div style="font-weight:bold; font-size:13px; text-align:center; margin-top:5px;">${nombre}</div>
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
}

// GUARDAR POST
function guardarPost() {
    const seccionDestino = document.getElementById('post-seccion-destino').value;
    const keyDestino = 'posts_vik_' + seccionDestino;
    let postsDestino = JSON.parse(localStorage.getItem(keyDestino) || "[]");
    
    const data = {
        titulo: document.getElementById('post-titulo').value,
        texto: document.getElementById('post-texto').value,
        img: document.getElementById('post-url').value,
        fecha: new Date().toLocaleDateString()
    };

    if(editandoIndex !== null) {
        const keyOrigen = 'posts_vik_' + seccionActual;
        let postsOrigen = JSON.parse(localStorage.getItem(keyOrigen) || "[]");
        
        if (seccionDestino !== seccionActual) {
            postsOrigen.splice(editandoIndex, 1);
            postsDestino.unshift(data);
            localStorage.setItem(keyOrigen, JSON.stringify(postsOrigen));
        } else {
            postsDestino[editandoIndex] = data;
        }
    } else {
        postsDestino.unshift(data);
    }
    
    localStorage.setItem(keyDestino, JSON.stringify(postsDestino));
    cerrarEditorPost();
    tab(null, seccionDestino); 
}

function borrarPost(index) {
    if(confirm("¿Seguro que quieres eliminar este post?")) {
        const key = 'posts_vik_' + seccionActual;
        let posts = JSON.parse(localStorage.getItem(key));
        posts.splice(index, 1);
        localStorage.setItem(key, JSON.stringify(posts));
        renderizarPosts();
    }
}

function editarPost(index) {
    const key = 'posts_vik_' + seccionActual;
    const posts = JSON.parse(localStorage.getItem(key));
    const p = posts[index];
    
    editandoIndex = index;
    document.getElementById('post-titulo').value = p.titulo;
    document.getElementById('post-texto').value = p.texto;
    document.getElementById('post-url').value = p.img;
    document.getElementById('post-seccion-destino').value = seccionActual;
    document.getElementById('modal-post').style.display = 'block';
}

// CONFIGURACIÓN (Actualizada para guardar el color de la barra)
function guardarTodoConfig() {
    localStorage.setItem('blog_nombre', document.getElementById('perfil-nombre').value);
    localStorage.setItem('blog_img', document.getElementById('perfil-img').value);
    
    // Guardar color nav
    localStorage.setItem('v_color_nav', document.getElementById('cfg-color-nav').value);
    
    localStorage.setItem('v_fondo_img', document.getElementById('cfg-fondo-web').value);
    localStorage.setItem('v_op_fondo', document.getElementById('cfg-op-fondo').value);
    localStorage.setItem('v_banner_' + seccionActual, document.getElementById('cfg-banner-secc').value);
    localStorage.setItem('v_op_banner_' + seccionActual, document.getElementById('cfg-op-banner').value);
    
    aplicarDiseño();
    toggleModalPerfil(false);
    renderizarPosts();
}

// CHAT
function renderChat() {
    const box = document.getElementById('chat-box');
    if(!box) return;
    const chat = JSON.parse(localStorage.getItem('chat_v') || "[]");
    const esAdmin = localStorage.getItem('vik_admin') === 'true';

    box.innerHTML = chat.map((m, i) => `
        <div class="msg-bubble">
            ${esAdmin ? `<button onclick="borrarMsg(${i})" style="float:right; border:none; background:none; cursor:pointer;">🗑️</button>` : ''}
            <strong>${m.user}:</strong> ${m.text}
        </div>
    `).join('');
    box.scrollTop = box.scrollHeight;
}

function enviarChat() {
    const input = document.getElementById('chat-input');
    if(!input.value.trim()) return;
    let chat = JSON.parse(localStorage.getItem('chat_v') || "[]");
    chat.push({ user: localStorage.getItem('blog_nombre') || "Visitante", text: input.value });
    localStorage.setItem('chat_v', JSON.stringify(chat));
    input.value = ""; 
    renderChat();
}

function borrarMsg(i) {
    let chat = JSON.parse(localStorage.getItem('chat_v'));
    chat.splice(i, 1);
    localStorage.setItem('chat_v', JSON.stringify(chat));
    renderChat();
}

// MODALES Y UI
function toggleModalPerfil(s) {
    if(s) {
        document.getElementById('perfil-nombre').value = localStorage.getItem('blog_nombre') || "";
        document.getElementById('perfil-img').value = localStorage.getItem('blog_img') || "";
        
        // Cargar color guardado al input
        document.getElementById('cfg-color-nav').value = localStorage.getItem('v_color_nav') || "#bca89d";
        
        document.getElementById('cfg-fondo-web').value = localStorage.getItem('v_fondo_img') || "";
        document.getElementById('cfg-op-fondo').value = localStorage.getItem('v_op_fondo') || "1";
        document.getElementById('cfg-banner-secc').value = localStorage.getItem('v_banner_' + seccionActual) || "";
        document.getElementById('cfg-op-banner').value = localStorage.getItem('v_op_banner_' + seccionActual) || "1";
    }
    document.getElementById('modal-perfil').style.display = s ? 'block' : 'none';
}
function cerrarSesion() { localStorage.removeItem('vik_admin'); location.reload(); }
function abrirEditorPost() { editandoIndex = null; document.getElementById('modal-post').style.display = 'block'; }
function cerrarEditorPost() { document.getElementById('modal-post').style.display = 'none'; }
function verTabConfig(id) { document.querySelectorAll('.config-content').forEach(c => c.style.display = 'none'); document.getElementById(id).style.display = 'block'; }