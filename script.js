// === VARIABLES GLOBALES ===
let cancionSonandoId = null;

// === INICIALIZACIÓN DEL REPRODUCTOR DE AUDIO ===
document.addEventListener('DOMContentLoaded', () => {
    const volumeSlider = document.querySelector('.volume-slider');
    if (volumeSlider) {
        volumeSlider.addEventListener('input', function (e) {
            const volumen = e.target.value / 100;
            document.querySelectorAll('audio').forEach(audio => {
                audio.volume = volumen;
            });
        });
    }

    document.querySelectorAll('audio').forEach(audio => {
        audio.addEventListener('loadedmetadata', function () {
            const id = this.id.replace('audio', '');
            const card = document.getElementById('cancion' + id);
            if (card && !isNaN(this.duration)) {
                const timeText = card.querySelector('.time-text');
                const totalMins = Math.floor(this.duration / 60);
                const totalSecs = Math.floor(this.duration % 60).toString().padStart(2, '0');
                if (timeText) timeText.innerText = `0:00 / ${totalMins}:${totalSecs}`;
            }
        });

        audio.addEventListener('timeupdate', function () {
            const id = this.id.replace('audio', '');
            const card = document.getElementById('cancion' + id);
            if (card && this.duration) {
                const progressBar = card.querySelector('.timeline-progress');
                const timeText = card.querySelector('.time-text');

                const progressPercent = (this.currentTime / this.duration) * 100;
                if (progressBar) progressBar.style.width = progressPercent + '%';

                const currentMins = Math.floor(this.currentTime / 60);
                const currentSecs = Math.floor(this.currentTime % 60).toString().padStart(2, '0');
                const totalMins = Math.floor(this.duration / 60);
                const totalSecs = Math.floor(this.duration % 60).toString().padStart(2, '0');

                if (timeText) timeText.innerText = `${currentMins}:${currentSecs} / ${totalMins}:${totalSecs}`;
            }
        });

        audio.addEventListener('ended', function () {
            const id = this.id.replace('audio', '');
            const card = document.getElementById('cancion' + id);
            const iconoActual = document.getElementById('playIcon' + id);
            if (card) {
                card.classList.remove('playing');
                const progressBar = card.querySelector('.timeline-progress');
                if (progressBar) progressBar.style.width = '0%';
            }
            if (iconoActual) {
                iconoActual.classList.remove('fa-pause');
                iconoActual.classList.add('fa-play');
            }
            cancionSonandoId = null;
        });
    });

    document.querySelectorAll('.timeline').forEach(timeline => {
        timeline.addEventListener('click', function (e) {
            const card = this.closest('.card');
            const id = card.id.replace('cancion', '');
            const audio = document.getElementById('audio' + id);
            if (audio && audio.duration) {
                const rect = this.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const percentage = clickX / rect.width;
                audio.currentTime = percentage * audio.duration;
            }
        });
    });
});


// === FUNCIONES DE LAS CARTAS ===
function revelarCancion(id) {
    // 1. Ocultamos la portada con el icono musical
    document.getElementById('hidden' + id).style.display = 'none';

    // 2. Seleccionamos la parte revelada de la carta
    let cartaRevelada = document.getElementById('revealed' + id);

    // 3. La mostramos en pantalla
    cartaRevelada.style.display = 'flex';

    // 4. Le aplicamos la clase CSS que hace la animación lenta
    cartaRevelada.classList.add('animacion-revelar');

    // 5. Reproducimos el sonido épico
    let sonidoEfecto = document.getElementById('sonidoRevelar');
    if (sonidoEfecto) {
        sonidoEfecto.currentTime = 0; // Lo reinicia por si pulsas otra carta muy rápido
        sonidoEfecto.play().catch(e => console.log("Esperando a que añadas el archivo revelar.mp3"));
    }
}

function reproducir(id) {
    const audioActual = document.getElementById('audio' + id);
    const iconoActual = document.getElementById('playIcon' + id);
    const cartaActual = document.getElementById('cancion' + id);

    if (!audioActual || !audioActual.src || audioActual.src.endsWith("html")) {
        alert("Añade una canción .mp3 en el HTML para que suene.");
        return;
    }

    if (cancionSonandoId === id) {
        if (audioActual.paused) {
            audioActual.play();
            cartaActual.classList.add('playing');
            iconoActual.classList.remove('fa-play');
            iconoActual.classList.add('fa-pause');
        } else {
            audioActual.pause();
            cartaActual.classList.remove('playing');
            iconoActual.classList.remove('fa-pause');
            iconoActual.classList.add('fa-play');
        }
        return;
    }

    if (cancionSonandoId !== null) {
        const audioPrevio = document.getElementById('audio' + cancionSonandoId);
        const iconoPrevio = document.getElementById('playIcon' + cancionSonandoId);
        const cartaPrevia = document.getElementById('cancion' + cancionSonandoId);
        if (audioPrevio) audioPrevio.pause();
        if (cartaPrevia) cartaPrevia.classList.remove('playing');
        if (iconoPrevio) {
            iconoPrevio.classList.remove('fa-pause');
            iconoPrevio.classList.add('fa-play');
        }
    }

    audioActual.play();
    cartaActual.classList.add('playing');
    iconoActual.classList.remove('fa-play');
    iconoActual.classList.add('fa-pause');
    cancionSonandoId = id;
}

function togglePaseOro(boton) {
    boton.classList.toggle('active');
}

// === FUNCIONES DE MODALES ===
function abrirLetra(titulo, letraHTML) {
    document.getElementById('modalTitle').innerText = titulo;
    document.getElementById('modalLyrics').innerHTML = letraHTML;
    document.getElementById('lyricsModal').style.display = 'flex';
}

function cerrarLetra() {
    document.getElementById('lyricsModal').style.display = 'none';
}

window.onclick = function (event) {
    let modalLetra = document.getElementById('lyricsModal');
    let modalBatalla = document.getElementById('batallaModal');
    let modalGanador = document.getElementById('winnerModal');
    if (event.target == modalLetra) cerrarLetra();
    if (event.target == modalBatalla) cerrarBatalla();
    if (event.target == modalGanador) cerrarGanador();
}

// === ACTUALIZAR NOTAS (50% Ari / 50% Luismi) ===
function actualizarNotaMedia(id) {
    const card = document.getElementById('cancion' + id);
    if (card) {
        const inputs = card.querySelectorAll('.score-input');
        const ari = parseFloat(inputs[0].value) || 0;
        const luismi = parseFloat(inputs[1].value) || 0;

        // Nueva fórmula: 50% para cada uno
        const final = ((ari * 0.5) + (luismi * 0.5)).toFixed(1);
        card.querySelector('.final-score').innerText = final;
    }
}


// === LÓGICA DEL TORNEO (FASE FINAL) ===
let clasificados = [];

function empezarFaseFinal() {
    let pasesDeOro = [];
    let restoCanciones = [];

    // Recoger las 15 tarjetas
    for (let i = 1; i <= 15; i++) {
        let card = document.getElementById('cancion' + i);
        if (!card) continue;

        let tituloEl = card.querySelector('.song-title');
        let autorEl = card.querySelector('.author-row');
        let imgEl = card.querySelector('.caratula');
        let audioEl = card.querySelector('audio');

        let titulo = tituloEl ? tituloEl.innerText : 'Canción ' + i;
        let autor = autorEl ? autorEl.innerText.trim() : 'Artista ' + i;
        let imagenSrc = (imgEl && imgEl.getAttribute('src')) ? imgEl.getAttribute('src') : '';
        let audioSrc = (audioEl && audioEl.getAttribute('src')) ? audioEl.getAttribute('src') : '';

        let botonOro = card.querySelector('.btn-golden-ticket');
        let esPaseOro = botonOro ? botonOro.classList.contains('active') : false;

        let inputs = card.querySelectorAll('.score-input');
        let notaAri = inputs[0] ? (parseFloat(inputs[0].value) || 0) : 0;
        let notaLuismi = inputs[1] ? (parseFloat(inputs[1].value) || 0) : 0;

        // 50% Ari + 50% Luismi
        let notaFinal = (notaAri * 0.5) + (notaLuismi * 0.5);

        let datosCancion = { titulo, autor, imagenSrc, audioSrc, nota: notaFinal, id: i };

        if (esPaseOro) {
            pasesDeOro.push(datosCancion);
        } else {
            restoCanciones.push(datosCancion);
        }
    }

    restoCanciones.sort((a, b) => b.nota - a.nota);

    clasificados = [...pasesDeOro];
    let puestosRestantes = 8 - clasificados.length;
    if (puestosRestantes > 0) {
        clasificados = clasificados.concat(restoCanciones.slice(0, puestosRestantes));
    }

    // 1. Mostrar el bracket y bajar la pantalla PRIMERO
    const bracketSection = document.getElementById('bracket-section');
    if (bracketSection) {
        bracketSection.style.display = 'flex';
        bracketSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // 2. Reproducir el sonido de tambores (se ajustará con la barra de volumen general)
    let sonidoTambores = document.getElementById('sonidoTambores');
    if (sonidoTambores) {
        sonidoTambores.currentTime = 0;
        sonidoTambores.play().catch(e => console.log("Añade tambores.mp3 en la carpeta musica"));
    }

    // 3. Rellenar las cajas con la animación escalonada
    for (let j = 0; j < 8; j++) {
        let box = document.getElementById('caja' + (j + 1));
        if (box) {
            // Ocultamos la caja para que no se vea antes de la animación
            box.style.opacity = '0';
            box.classList.remove('animacion-finalista');

            if (clasificados[j]) {
                generarContenidoCaja(box, clasificados[j]);

                // Efecto "cascada": Cada caja tarda 400ms más que la anterior en salir
                // Empiezan a salir medio segundo (500ms) después de que la cámara empiece a bajar
                setTimeout(() => {
                    box.classList.add('animacion-finalista');
                    box.style.opacity = '1';
                }, (j * 400) + 500);
            }
        }
    }
}

function generarContenidoCaja(elementoCaja, datos) {
    elementoCaja.className = 'bracket-box filled';
    elementoCaja.innerHTML = `
        <div class="bracket-content" data-img="${datos.imagenSrc}" data-titulo="${datos.titulo}" data-audio="${datos.audioSrc}">
            <img src="${datos.imagenSrc}">
            <div class="info">
                <h4>${datos.titulo}</h4>
                <p>${datos.autor}</p>
            </div>
        </div>
    `;
}

// === LÓGICA DE BATALLAS ===
// === LÓGICA DE BATALLAS ===
function abrirBatalla(idCajaA, idCajaB, idCajaGanadorDestino) {
    let cajaA = document.getElementById(idCajaA);
    let cajaB = document.getElementById(idCajaB);

    if (!cajaA || !cajaB) return;
    if (cajaA.classList.contains('empty') || cajaA.classList.contains('unknown') ||
        cajaB.classList.contains('empty') || cajaB.classList.contains('unknown')) {
        alert("Aún no se han decidido los contendientes de este cruce.");
        return;
    }

    let datosA = cajaA.querySelector('.bracket-content');
    let datosB = cajaB.querySelector('.bracket-content');

    let tituloA = datosA.getAttribute('data-titulo');
    let tituloB = datosB.getAttribute('data-titulo');

    // 1. Pintar Textos e Imágenes
    document.getElementById('imgA').src = datosA.getAttribute('data-img');
    document.getElementById('tituloA').innerText = tituloA;

    document.getElementById('imgB').src = datosB.getAttribute('data-img');
    document.getElementById('tituloB').innerText = tituloB;

    document.getElementById('nombreVotaA').innerText = tituloA;
    document.getElementById('nombreVotaB').innerText = tituloB;

    // 2. Cargar los audios correspondientes en los reproductores
    let audioSrcA = datosA.getAttribute('data-audio');
    let audioSrcB = datosB.getAttribute('data-audio');

    document.getElementById('audioBatallaA').src = audioSrcA || '';
    document.getElementById('audioBatallaB').src = audioSrcB || '';

    // 3. Resetear las barras visuales
    document.getElementById('playIconBatallaA').className = 'fa-solid fa-play';
    document.getElementById('playIconBatallaB').className = 'fa-solid fa-play';
    document.getElementById('progressBatallaA').style.width = '0%';
    document.getElementById('progressBatallaB').style.width = '0%';
    document.getElementById('timeBatallaA').innerText = '0:00 / 0:00';
    document.getElementById('timeBatallaB').innerText = '0:00 / 0:00';

    // 4. Configurar botones
    document.getElementById('btnGanadorA').onclick = () => declararVencedor(datosA, idCajaGanadorDestino);
    document.getElementById('btnGanadorB').onclick = () => declararVencedor(datosB, idCajaGanadorDestino);

    document.getElementById('batallaModal').style.display = 'flex';
}

function cerrarBatalla() {
    document.getElementById('batallaModal').style.display = 'none';
    // Al cerrar la ventana, paramos cualquier audio de batalla que estuviera sonando
    let audioA = document.getElementById('audioBatallaA');
    let audioB = document.getElementById('audioBatallaB');
    if (audioA) { audioA.pause(); audioA.currentTime = 0; }
    if (audioB) { audioB.pause(); audioB.currentTime = 0; }
}

function reproducirBatalla(lado) {
    // Si estaba sonando una canción del fondo (la principal), la pausamos
    if (cancionSonandoId !== null) {
        let audioFondo = document.getElementById('audio' + cancionSonandoId);
        let iconoFondo = document.getElementById('playIcon' + cancionSonandoId);
        if (audioFondo) audioFondo.pause();
        if (iconoFondo) {
            iconoFondo.classList.remove('fa-pause');
            iconoFondo.classList.add('fa-play');
        }
    }

    const audioA = document.getElementById('audioBatallaA');
    const audioB = document.getElementById('audioBatallaB');
    const iconA = document.getElementById('playIconBatallaA');
    const iconB = document.getElementById('playIconBatallaB');

    const audioActual = (lado === 'A') ? audioA : audioB;
    const iconoActual = (lado === 'A') ? iconA : iconB;
    const audioRival = (lado === 'A') ? audioB : audioA;
    const iconoRival = (lado === 'A') ? iconB : iconA;

    if (!audioActual.src || audioActual.src.endsWith("html")) {
        alert("No hay canción añadida a este participante.");
        return;
    }

    // El volumen hereda el de la barra general de arriba a la derecha
    const volumeSlider = document.querySelector('.volume-slider');
    if (volumeSlider) audioActual.volume = volumeSlider.value / 100;

    if (audioActual.paused) {
        // Pausar al rival si estaba sonando
        audioRival.pause();
        iconoRival.className = 'fa-solid fa-play';
        // Reproducir
        audioActual.play();
        iconoActual.className = 'fa-solid fa-pause';
    } else {
        audioActual.pause();
        iconoActual.className = 'fa-solid fa-play';
    }
}

// === MOTOR DE BARRAS DE PROGRESO DE LA BATALLA ===
// (Esto asegúrate de pegarlo fuera de otras funciones, por ejemplo debajo de reproducirBatalla)
document.addEventListener('DOMContentLoaded', () => {
    ['A', 'B'].forEach(lado => {
        const audio = document.getElementById('audioBatalla' + lado);
        if (audio) {
            audio.addEventListener('timeupdate', function () {
                const progress = document.getElementById('progressBatalla' + lado);
                const timeText = document.getElementById('timeBatalla' + lado);
                if (this.duration) {
                    progress.style.width = (this.currentTime / this.duration) * 100 + '%';
                    const currentMins = Math.floor(this.currentTime / 60);
                    const currentSecs = Math.floor(this.currentTime % 60).toString().padStart(2, '0');
                    const totalMins = Math.floor(this.duration / 60);
                    const totalSecs = Math.floor(this.duration % 60).toString().padStart(2, '0');
                    timeText.innerText = `${currentMins}:${currentSecs} / ${totalMins}:${totalSecs}`;
                }
            });
            audio.addEventListener('ended', function () {
                document.getElementById('playIconBatalla' + lado).className = 'fa-solid fa-play';
                document.getElementById('progressBatalla' + lado).style.width = '0%';
            });

            // Permitir clic para avanzar
            const timeline = document.getElementById('timelineBatalla' + lado);
            if (timeline) {
                timeline.addEventListener('click', function (e) {
                    if (audio.duration) {
                        const rect = this.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        audio.currentTime = (clickX / rect.width) * audio.duration;
                    }
                });
            }
        }
    });
});

function declararVencedor(datosHtmlNode, idCajaDestino) {
    let cajaDestino = document.getElementById(idCajaDestino);

    let datosParaPintar = {
        imagenSrc: datosHtmlNode.getAttribute('data-img'),
        titulo: datosHtmlNode.getAttribute('data-titulo'),
        audioSrc: datosHtmlNode.getAttribute('data-audio'),
        autor: datosHtmlNode.querySelector('p') ? datosHtmlNode.querySelector('p').innerText : 'Artista'
    };

    generarContenidoCaja(cajaDestino, datosParaPintar);

    if (idCajaDestino === 'campeon') {
        cajaDestino.classList.add('winner-box');

        // === NUEVO: Hacemos que el cuadro del campeón se pueda clicar ===
        cajaDestino.style.cursor = 'pointer';
        cajaDestino.onclick = () => abrirGanador(datosParaPintar);

        setTimeout(() => {
            abrirGanador(datosParaPintar);
        }, 1000);
    }

    cerrarBatalla();
}

// === LÓGICA DE PANTALLA GANADOR FINAL ===
function abrirGanador(datos) {
    if (cancionSonandoId !== null) {
        let audioFondo = document.getElementById('audio' + cancionSonandoId);
        if (audioFondo) audioFondo.pause();
        cancionSonandoId = null;
    }

    document.getElementById('winnerImg').src = datos.imagenSrc;
    document.getElementById('winnerTitle').innerText = datos.titulo;
    document.getElementById('winnerAuthor').innerText = datos.autor;

    let audioGanador = document.getElementById('winnerAudio');
    if (datos.audioSrc) {
        audioGanador.src = datos.audioSrc;
        audioGanador.play();
    } else {
        audioGanador.removeAttribute('src');
    }

    document.getElementById('winnerModal').style.display = 'flex';
}

function cerrarGanador() {
    document.getElementById('winnerModal').style.display = 'none';
    let audioGanador = document.getElementById('winnerAudio');
    audioGanador.pause();
    audioGanador.currentTime = 0;
}