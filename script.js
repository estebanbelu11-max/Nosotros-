// ===== ELEMENTOS DEL DOM GENERALES =====
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const clickSound = document.getElementById("clickSound");

/* ===== FUNCIÓN SONIDO ===== */
function reproducirSonido() {
    if (clickSound) {
        clickSound.currentTime = 0;
        clickSound.play().catch(() => {});
    }
}

/* ===== ABRIR / CERRAR MENÚ ===== */
function toggleMenu() {
    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");
    reproducirSonido();
}

if (menuBtn) menuBtn.addEventListener("click", toggleMenu);

if (overlay) {
    overlay.addEventListener("click", () => {
        sidebar.classList.remove("active");
        overlay.classList.remove("active");
    });
}

document.querySelectorAll(".sidebar a").forEach(link => {
    link.addEventListener("click", () => {
        reproducirSonido();
        sidebar.classList.remove("active");
        overlay.classList.remove("active");
    });
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        sidebar.classList.remove("active");
        overlay.classList.remove("active");
    }
});

window.addEventListener("load", () => {
    document.body.classList.add("loaded");
});


/* =============================================================
   ===== GESTIÓN DE MOMENTOS (NUEVA SECCIÓN DE RECUERDOS) =====
   ============================================================= */
document.addEventListener("DOMContentLoaded", () => {
    const btnAnadirMomento = document.getElementById("btnAnadirMomento");
    const contenedorCard = document.querySelector(".pagina.fade .card");
    const formMomento = document.querySelector(".nuevo-recuerdo-form");

    if (contenedorCard && formMomento) {
        // 1. Cargar momentos guardados
        let momentosGuardados = JSON.parse(localStorage.getItem("momentosCreados")) || [];
        
        momentosGuardados.forEach(momento => {
            crearElementoMomento(momento, false); // false significa que no va al final absoluto, va antes del form
        });

        // 2. Evento para capturar el nuevo momento
        btnAnadirMomento.addEventListener("click", async () => {
            const titulo = document.getElementById("tituloMomento").value.trim();
            const fechaInput = document.getElementById("fechaMomento").value;
            const inputFotos = document.getElementById("fotosMomento");
            const desc = document.getElementById("descMomento").value.trim();

            if (!titulo || !fechaInput || !desc) {
                alert("Por favor, completa el título, la fecha y la descripción. ✨");
                return;
            }

            // Formatear la fecha a un estilo lindo: 📅 DD de mes de AAAA
            const opcionesFecha = { day: '2-digit', month: 'long', year: 'numeric' };
            const fechaFormateada = new Date(fechaInput + "T00:00:00").toLocaleDateString('es-ES', opcionesFecha);

            // Convertir las imágenes seleccionadas a Base64 para guardarlas
            const archivos = Array.from(inputFotos.files);
            const promesasFotos = archivos.map(archivo => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(archivo);
                });
            });

            const arrayFotosBase64 = await Promise.all(promesasFotos);

            const nuevoMomento = {
                id: "momento_" + Date.now(),
                titulo: titulo,
                fecha: "📅 " + fechaFormateada,
                fotos: arrayFotosBase64,
                descripcion: desc
            };

            // Pintar en pantalla antes del formulario
            crearElementoMomento(nuevoMomento, true);

            // Guardar en localStorage
            momentosGuardados.push(nuevoMomento);
            localStorage.setItem("momentosCreados", JSON.stringify(momentosGuardados));

            // Limpiar el formulario
            document.getElementById("tituloMomento").value = "";
            document.getElementById("fechaMomento").value = "";
            document.getElementById("descMomento").value = "";
            inputFotos.value = "";

            reproducirSonido();
        });

        // 3. Función constructora del bloque del recuerdo
        function crearElementoMomento(momento, esNuevo) {
            // Contenedor principal del recuerdo
            const divRecuerdo = document.createElement("div");
            divRecuerdo.className = "recuerdo";
            
            // Determinar clases de la galería según el número de fotos
            let claseGaleria = "galeria-fotos";
            if (momento.fotos.length === 1) {
                claseGaleria += " una-foto";
            }

            // Generar las etiquetas <img> correspondientes
            let htmlFotos = "";
            momento.fotos.forEach(srcFoto => {
                htmlFotos += `<img src="${srcFoto}" alt="Foto de recuerdo">`;
            });

            // Si no subieron fotos, dejamos un aviso bonito
            if (momento.fotos.length === 0) {
                htmlFotos = `<p style="font-style: italic; opacity: 0.6; text-align: center; width: 100%;">(Momento guardado sin fotos del carrete 🪐)</p>`;
            }

            divRecuerdo.innerHTML = `
                <h2>${momento.titulo}</h2>
                <div class="fecha-recuerdo">${momento.fecha}</div>
                <div class="${claseGaleria}">
                    ${htmlFotos}
                </div>
                <div class="texto-recuerdo">
                    <p>${momento.descripcion}</p>
                </div>
            `;

            // Crear el separador decorativo <hr>
            const hrSeparador = document.createElement("hr");
            hrSeparador.className = "separador";

            // Insertar ordenadamente antes del formulario de ingreso
            formMomento.parentNode.insertBefore(hrSeparador, formMomento);
            formMomento.parentNode.insertBefore(divRecuerdo, hrSeparador);

            if (esNuevo) {
                divRecuerdo.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }
});


/* =============================================================
   ===== GESTIÓN DE AVENTURAS (MANTIENE LA EDICIÓN ANTERIOR) ====
   ============================================================= */
document.addEventListener("DOMContentLoaded", () => {
    const listaAventuras = document.querySelector(".aventuras-lista");
    const inputNueva = document.getElementById("nuevaAventuraInput");
    const btnAnadir = document.getElementById("btnAnadirAventura");

    if (listaAventuras) {
        let aventurasGuardadas = JSON.parse(localStorage.getItem("aventurasCreadas")) || [];
        
        aventurasGuardadas.forEach(aventura => {
            crearElementoAventura(aventura.id, aventura.texto);
        });

        function inicializarCheckboxes() {
            const checks = document.querySelectorAll('.aventuras-lista input[type="checkbox"]');
            checks.forEach(check => {
                check.removeEventListener("change", manejarCambioCheckbox);
                const estado = localStorage.getItem(check.id);
                if (estado === "true") {
                    check.checked = true;
                    check.parentElement.classList.add("completada");
                } else {
                    check.checked = false;
                    check.parentElement.classList.remove("completada");
                }
                check.addEventListener("change", manejarCambioCheckbox);
            });
        }

        function manejarCambioCheckbox(e) {
            const check = e.target;
            localStorage.setItem(check.id, check.checked);
            check.parentElement.classList.toggle("completada", check.checked);
            reproducirSonido();
        }

        function crearElementoAventura(id, texto) {
            const contenedor = document.createElement("div");
            contenedor.className = "aventura-contenedor";
            contenedor.id = "container_" + id;
            
            contenedor.innerHTML = `
                <label class="aventura">
                    <input type="checkbox" id="${id}">
                    <span class="texto-aventura">${texto}</span>
                </label>
                <button class="btn-editar" title="Editar aventura">✏️</button>
            `;
            
            const btnEditar = contenedor.querySelector(".btn-editar");
            btnEditar.addEventListener("click", () => {
                const spanTexto = contenedor.querySelector(".texto-aventura");
                const nuevoTexto = prompt("Editar aventura:", spanTexto.textContent);
                if (nuevoTexto !== null && nuevoTexto.trim() !== "") {
                    const textoLimpio = nuevoTexto.trim();
                    spanTexto.textContent = textoLimpio;
                    aventurasGuardadas = aventurasGuardadas.map(act => {
                        if (act.id === id) return { ...act, texto: textoLimpio };
                        return act;
                    });
                    localStorage.setItem("aventurasCreadas", JSON.stringify(aventurasGuardadas));
                    reproducirSonido();
                }
            });

            listaAventuras.appendChild(contenedor);
        }

        if (btnAnadir && inputNueva) {
            btnAnadir.addEventListener("click", () => {
                const textoAventura = inputNueva.value.trim();
                if (textoAventura !== "") {
                    const nuevoId = "aventura_custom_" + Date.now(); 
                    crearElementoAventura(nuevoId, textoAventura);
                    aventurasGuardadas.push({ id: nuevoId, texto: textoAventura });
                    localStorage.setItem("aventurasCreadas", JSON.stringify(aventurasGuardadas));
                    inputNueva.value = "";
                    inicializarCheckboxes();
                    reproducirSonido();
                }
            });

            inputNueva.addEventListener("keydown", (e) => {
                if (e.key === "Enter") btnAnadir.click();
            });
        }

        inicializarCheckboxes();
    }
});