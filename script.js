const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const clickSound = document.getElementById("clickSound");

/* SONIDO */

function reproducirSonido(){

    if(clickSound){

        clickSound.currentTime = 0;

        clickSound.play().catch(() => {});
    }
}

/* ABRIR / CERRAR MENU */

function toggleMenu(){

    sidebar.classList.toggle("active");

    overlay.classList.toggle("active");

    reproducirSonido();
}

/* BOTON MENU */

if(menuBtn){

    menuBtn.addEventListener("click", toggleMenu);
}

/* CERRAR TOCANDO AFUERA */

if(overlay){

    overlay.addEventListener("click", () => {

        sidebar.classList.remove("active");

        overlay.classList.remove("active");

    });
}

/* CERRAR AL TOCAR OPCION */

document.querySelectorAll(".sidebar a").forEach(link => {

    link.addEventListener("click", () => {

        reproducirSonido();

        sidebar.classList.remove("active");

        overlay.classList.remove("active");
    });

});

/* TECLA ESC */

document.addEventListener("keydown", (e) => {

    if(e.key === "Escape"){

        sidebar.classList.remove("active");

        overlay.classList.remove("active");
    }

});

/* EFECTO APARICION */

window.addEventListener("load", () => {

    document.body.classList.add("loaded");

});
document.addEventListener("DOMContentLoaded", () => {

    const checks = document.querySelectorAll(
        '.aventuras-lista input[type="checkbox"]'
    );

    checks.forEach(check => {

        const estadoGuardado =
            localStorage.getItem(check.id);

        if (estadoGuardado === "true") {
            check.checked = true;
        }

        check.addEventListener("change", () => {

            localStorage.setItem(
                check.id,
                check.checked
            );

        });

    });

});
document.addEventListener("DOMContentLoaded", () => {

    const checks = document.querySelectorAll(
        '.aventuras-lista input[type="checkbox"]'
    );

    checks.forEach(check => {

        const estadoGuardado =
            localStorage.getItem(check.id);

        if (estadoGuardado === "true") {
            check.checked = true;
        }

        check.addEventListener("change", () => {

            localStorage.setItem(
                check.id,
                check.checked
            );

        });

    });

});
const checks = document.querySelectorAll(
'.aventuras-lista input[type="checkbox"]'
);

checks.forEach(check => {

const estado = localStorage.getItem(check.id);

if(estado === "true"){
    check.checked = true;
    check.parentElement.classList.add("completada");
}

check.addEventListener("change", () => {

    localStorage.setItem(
        check.id,
        check.checked
    );

    check.parentElement.classList.toggle(
        "completada",
        check.checked
    );

});

});
