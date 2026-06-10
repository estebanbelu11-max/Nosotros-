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
   ===== GESTIÓN DE MOMENTOS (RECUERDOS CON COMPRESIÓN) =====
   ============================================================= */
document.addEventListener("DOMContentLoaded", () => {
    const btnAnadirMomento = document.getElementById("btnAnadirMomento");
    const contenedorCard = document.querySelector(".pagina.fade .card");
    const formMomento = document.querySelector(".nuevo-recuerdo-form");

    if (contenedorCard && formMomento) {
        // 1. Cargar momentos guardados
        let momentosGuardados = JSON.parse(localStorage.getItem("momentosCreados")) || [];
        
        momentosGuardados.forEach(momento => {
            crearElementoMomento(momento, false);
        });

        // 2. Evento para capturar el nuevo momento con compresión en Canvas
        btnAnadirMomento.addEventListener("click", async () => {
            const titulo = document.getElementById("tituloMomento").value.trim();
            const fechaInput = document.getElementById("fechaMomento").value;
            const inputFotos = document.getElementById("fotosMomento");
            const desc = document.getElementById("descMomento").value.trim();

            if (!titulo || !fechaInput || !desc) {
                alert("Por favor, completa el título, la fecha y la descripción. ✨");
                return;
            }

            // Formatear la fecha a un estilo lindo
            const opcionesFecha = { day: '2-digit', month: 'long', year: 'numeric' };
            const fechaFormateada = new Date(fechaInput + "T00:00:00").toLocaleDateString('es-ES', opcionesFecha);

            // Función interna para achicar la imagen de peso pesado
            const comprimirImagen = (archivo) => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(archivo);
                    reader.onload = (event) => {
                        const img = new Image();
                        img.src = event.target.result;
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            
                            // Tamaño máximo óptimo para pantalla web
                            const MAX_WIDTH = 800;
                            const MAX_HEIGHT = 800;
                            let width = img.width;
                            let height = img.height;

                            if (width > height) {
                                if (width > MAX_WIDTH) {
                                    height *= MAX_WIDTH / width;
                                    width = MAX_WIDTH;
                                }
                            } else {
                                if (height > MAX_HEIGHT) {
                                    width *= MAX_HEIGHT / height;
                                    height = MAX_HEIGHT;
                                }
                            }

                            canvas.width = width;
                            canvas.height = height;
                            
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, width, height);
                            
                            // Comprimir a JPEG con calidad equilibrada (70%)
                            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                            resolve(dataUrl);
                        };
                    };
                });
            };

            // Procesar todas las fotos seleccionadas consecutivamente
            const archivos = Array.from(inputFotos.files);
            const arrayFotosBase64 = [];
            
            for (const archivo of archivos) {
                const fotoComprimida = await comprimirImagen(archivo);
                arrayFotosBase64.push(fotoComprimida);
            }

            const nuevoMomento = {
                id: "momento_" + Date.now(),
                titulo: titulo,
                fecha: "📅 " + fechaFormateada,
                fotos: arrayFotosBase64,
                descripcion: desc
            };

            try {
                // Intentar guardar primero en el arreglo de la memoria
                momentosGuardados.push(nuevoMomento);
                localStorage.setItem("momentosCreados", JSON.stringify(momentosGuardados));
                
                // Pintar en pantalla si no dio error de espacio excedido
                crearElementoMomento(nuevoMomento, true);

                // Limpiar el formulario de texto
                document.getElementById("tituloMomento").value = "";
                document.getElementById("fechaMomento").value = "";
                document.getElementById("descMomento").value = "";
                inputFotos.value = "";

                reproducirSonido();
            } catch (error) {
                console.error(error);
                alert("¡Ups! Las fotos seleccionadas superan el almacenamiento disponible. Intenta subir menos imágenes a la vez. 🌌");
                momentosGuardados.pop(); // Revertir datos
            }
        });

        // 3. Función constructora del bloque del recuerdo
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

            // Insertar ordenadamente antes del bloque del formulario
            formMomento.parentNode.insertBefore(hrSeparador, formMomento);
            formMomento.parentNode.insertBefore(divRecuerdo, hrSeparador);

            if (esNuevo) {
                divRecuerdo.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }
});


/* =============================================================
   ===== GESTIÓN DE AVENTURAS (CON FUNCIÓN DE EDICIÓN) ======
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