document.addEventListener("DOMContentLoaded", () => {
    const currentPage = document.body.dataset.page;
    let currentLetterWrapper;
    const audio = document.getElementById("bg-music");

    // --- Audio Autoplay Workaround Reforzado ---
    let audioReadyToPlay = false;

    // Función para intentar reproducir el audio
    const tryPlayAudio = () => {
        if (audio && audio.paused && audioReadyToPlay) {
            audio.volume = 0.5; // Ajusta el volumen si es necesario
            audio.play()
                .then(() => {
                    console.log("Audio reproducido exitosamente.");
                    // Si se reproduce, podemos ser más agresivos en quitar los listeners
                    // ya que la interacción inicial fue exitosa.
                    document.removeEventListener('click', tryPlayAudio, { capture: true });
                    document.removeEventListener('keydown', tryPlayAudio, { capture: true });
                })
                .catch(error => {
                    console.error("Fallo al reproducir audio:", error.name, error.message);
                    // Si falla, el audioReadyToPlay seguirá siendo true y los listeners
                    // seguirán activos para futuras interacciones.
                });
        }
    };

    // La promesa del audio se resuelve cuando los metadatos están cargados,
    // lo cual es un buen momento para marcarlo como 'listo para intentar reproducir'.
    if (audio) {
        audio.oncanplaythrough = () => {
            audioReadyToPlay = true;
            tryPlayAudio(); // Intenta reproducir tan pronto como esté listo
        };
        // También manejar posibles errores de carga del audio
        audio.onerror = (e) => {
            console.error("Error cargando el audio:", e);
        };
    }

    // Añadir listeners globales para cualquier interacción del usuario que pueda activar el audio
    // Usamos 'capture: true' para que el evento se capture en la fase inicial y tenga más prioridad.
    document.addEventListener('click', tryPlayAudio, { capture: true });
    document.addEventListener('keydown', tryPlayAudio, { capture: true });

    // --- Lógica de Animación Reforzada ---

    // Función genérica para abrir la carta
    const openLetter = (wrapper) => {
        if (!wrapper) return;

        // Aseguramos que la clase de cierre no esté presente y que la clase de apertura no esté ya allí
        wrapper.classList.remove("is-closing");
        // Forzamos un reflow/repaint para que el navegador "vea" el estado inicial (scaleY(0))
        // antes de aplicar la clase is-open. Esto es CRUCIAL.
        wrapper.offsetWidth; // leer una propiedad que fuerce el reflow

        // Aplicamos la clase de apertura en el siguiente frame de animación
        requestAnimationFrame(() => {
            wrapper.classList.add("is-open");
        });
    };

    // Lógica para la página principal (index.html)
    if (currentPage === 'index') {
        currentLetterWrapper = document.getElementById("mainLetterWrapper");
        const readMoreBtn = document.getElementById("readMoreBtn");

        // Abrir la carta al cargar la página
        openLetter(currentLetterWrapper);

        // Evento para el botón "SEGUIR LEYENDO"
        if (readMoreBtn && currentLetterWrapper) {
            readMoreBtn.addEventListener("click", (event) => {
                event.preventDefault(); // Prevenir la navegación inmediata

                // Asegurar que la carta esté en estado abierto antes de intentar cerrar
                if (!currentLetterWrapper.classList.contains("is-open")) {
                    console.warn("La carta no está abierta, no se puede cerrar.");
                    return; // No intentar cerrar si no está abierta
                }

                currentLetterWrapper.classList.remove("is-open");
                currentLetterWrapper.classList.add("is-closing");

                // Escuchar el evento 'transitionend' para saber cuándo la animación de cierre ha terminado
                const handleCloseTransitionEnd = (e) => {
                    // Asegúrate de que la transición que terminó es la del propio wrapper
                    // y que es una de las propiedades clave (transform o opacity)
                    if (e.target === currentLetterWrapper && (e.propertyName === 'transform' || e.propertyName === 'opacity')) {
                        currentLetterWrapper.removeEventListener('transitionend', handleCloseTransitionEnd); // Limpiar el listener
                        // Un pequeño retraso final para asegurar que la animación es visualmente completa antes de la redirección
                        setTimeout(() => {
                            window.location.href = "segunda.html"; // Redirigir a la segunda página
                        }, 100); // Pequeño retraso de 100ms
                    }
                };
                currentLetterWrapper.addEventListener('transitionend', handleCloseTransitionEnd);
            });
        }
    }
    // Lógica para la segunda página (segunda.html)
    else if (currentPage === 'segunda') {
        currentLetterWrapper = document.getElementById("secondLetterWrapper");
        // Abrir la carta al cargar la página
        openLetter(currentLetterWrapper);
    }
});