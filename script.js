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
   ===== GESTIÓN DE MOMENTOS (RECUERDOS CON ENVÍO A DRIVE) =====
   ============================================================= */
document.addEventListener("DOMContentLoaded", () => {
    const btnAnadirMomento = document.getElementById("btnAnadirMomento");
    const contenedorCard = document.querySelector(".pagina.fade .card");
    const formMomento = document.querySelector(".nuevo-recuerdo-form");

    if (contenedorCard && formMomento) {
        // 1. Cargar momentos guardados localmente para visualización rápida
        let momentosGuardados = JSON.parse(localStorage.getItem("momentosCreados")) || [];
        
        momentosGuardados.forEach(momento => {
            crearElementoMomento(momento, false);
        });

        // 2. Evento para capturar el nuevo momento y subirlo a Google Drive
        btnAnadirMomento.addEventListener("click", async () => {
            const titulo = document.getElementById("tituloMomento").value.trim();
            const fechaInput = document.getElementById("fechaMomento").value;
            const inputFotos = document.getElementById("fotosMomento");
            const desc = document.getElementById("descMomento").value.trim();

            if (!titulo || !fechaInput || !desc) {
                alert("Por favor, completa el título, la fecha y la descripción. ✨");
                return;
            }

            // Cambiar el estado estético del botón durante la subida
            btnAnadirMomento.disabled = true;
            btnAnadirMomento.textContent = "Subiendo momento al Drive... ☁️";

            // Formatear la fecha
            const opcionesFecha = { day: '2-digit', month: 'long', year: 'numeric' };
            const fechaFormateada = new Date(fechaInput + "T00:00:00").toLocaleDateString('es-ES', opcionesFecha);

            // Función interna para optimizar el tamaño de las fotos para el Drive (máx 1024px)
            const comprimirImagen = (archivo) => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(archivo);
                    reader.onload = (event) => {
                        const img = new Image();
                        img.src = event.target.result;
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            const MAX_WIDTH = 1024; 
                            let width = img.width;
                            let height = img.height;

                            if (width > MAX_WIDTH) {
                                height *= MAX_WIDTH / width;
                                width = MAX_WIDTH;
                            }
                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, width, height);
                            resolve(canvas.toDataURL('image/jpeg', 0.75));
                        };
                    };
                });
            };

            // Procesar las imágenes cargadas por el usuario
            const archivos = Array.from(inputFotos.files);
            const arrayFotosBase64 = [];
            for (const archivo of archivos) {
                const fotoComprimida = await comprimirImagen(archivo);
                arrayFotosBase64.push(fotoComprimida);
            }

            // Datos estructurados para enviar al script de Google
            const datosParaEnviar = {
                titulo: titulo,
                fotos: arrayFotosBase64
            };

            // URL única que obtuviste de Google Apps Script
            const URL_GOOGLE_SCRIPT = "https://script.google.com/macros/s/AKfycbxi6lJqcftvkTLF9Rt2kyWEU9uORgx1slbU9fArOLWrM4LrqYnaFabtlfIIU8lZ7Y3l/exec";

            try {
                // Enviar datos al "puente" de Google
                await fetch(URL_GOOGLE_SCRIPT, {
                    method: "POST",
                    mode: "no-cors", // Evita bloqueos de seguridad en redes móviles
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(datosParaEnviar)
                });

                const nuevoMomento = {
                    id: "momento_" + Date.now(),
                    titulo: titulo,
                    fecha: "📅 " + fechaFormateada,
                    fotos: arrayFotosBase64, // Mostramos la vista previa en pantalla al instante
                    descripcion: desc
                };

                // Guardar la estructura de textos de forma ligera en el navegador
                momentosGuardados.push(nuevoMomento);
                localStorage.setItem("momentosCreados", JSON.stringify(momentosGuardados));
                
                crearElementoMomento(nuevoMomento, true);

                // Limpiar campos del formulario
                document.getElementById("tituloMomento").value = "";
                document.getElementById("fechaMomento").value = "";
                document.getElementById("descMomento").value = "";
                inputFotos.value = "";
                
                reproducirSonido();
                alert("¡Momento guardado con éxito en tu Google Drive! 💙");

            } catch (error) {
                console.error(error);
                alert("Hubo un error al conectar con Google Drive. Revisa tu conexión. 🪐");
            } finally {
                // Restaurar el botón original
                btnAnadirMomento.disabled = false;
                btnAnadirMomento.textContent = "Guardar momento mágico 💙";
            }
        });

        // 3. Función constructora del bloque del recuerdo en el HTML
        function crearElementoMomento(momento, esNuevo) {
            const divRecuerdo = document.createElement("div");
            divRecuerdo.className = "recuerdo";
            
            let claseGaleria = "galeria-fotos";
            if (momento.fotos.length === 1) {
                claseGaleria += " una-foto";
            }

            let htmlFotos = "";
            momento.fotos.forEach(srcFoto => {
                htmlFotos += `<img src="${srcFoto}" alt="Foto de recuerdo">`;
            });

            if (momento.fotos.length === 0) {
                htmlFotos = `<p style="font-style: italic; opacity: 0.6; text-align: center; width: 100%;">(Momento guardado sin fotos adjuntas 🪐)</p>`;
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

            const hrSeparador = document.createElement("hr");
            hrSeparador.className = "separador";

            // Insertar ordenadamente antes del formulario
            formMomento.parentNode.insertBefore(hrSeparador, formMomento);
            formMomento.parentNode.insertBefore(divRecuerdo, hrSeparador);

            if (esNuevo) {
                divRecuerdo.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }
});


/* =============================================================
   ===== GESTIÓN DE AVENTURAS (MANTIENE LA FUNCIÓN EDICIÓN) =====
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