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
    document.getElementById('hidden' + id).style.display = 'none';
    document.getElementById('revealed' + id).style.display = 'flex';
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
    if(card) {
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

    for(let i=1; i<=15; i++) {
        let card = document.getElementById('cancion'+i);
        if(!card) continue;

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
        
        // Nueva fórmula: 50% Ari + 50% Luismi
        let notaFinal = (notaAri * 0.5) + (notaLuismi * 0.5);

        let datosCancion = { titulo, autor, imagenSrc, audioSrc, nota: notaFinal, id: i };

        if(esPaseOro) {
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

    for(let j=0; j<8; j++) {
        let box = document.getElementById('caja'+(j+1));
        if(box && clasificados[j]) {
            generarContenidoCaja(box, clasificados[j]);
        }
    }

    const bracketSection = document.getElementById('bracket-section');
    if(bracketSection) {
        bracketSection.style.display = 'flex';
        bracketSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
function abrirBatalla(idCajaA, idCajaB, idCajaGanadorDestino) {
    let cajaA = document.getElementById(idCajaA);
    let cajaB = document.getElementById(idCajaB);

    if(!cajaA || !cajaB) return;
    if(cajaA.classList.contains('empty') || cajaA.classList.contains('unknown') ||
       cajaB.classList.contains('empty') || cajaB.classList.contains('unknown')) {
        alert("Aún no se han decidido los contendientes de este cruce.");
        return;
    }

    let datosA = cajaA.querySelector('.bracket-content');
    let datosB = cajaB.querySelector('.bracket-content');

    document.getElementById('imgA').src = datosA.getAttribute('data-img');
    document.getElementById('tituloA').innerText = datosA.getAttribute('data-titulo');
    
    document.getElementById('imgB').src = datosB.getAttribute('data-img');
    document.getElementById('tituloB').innerText = datosB.getAttribute('data-titulo');

    let btnA = document.getElementById('btnGanadorA');
    let btnB = document.getElementById('btnGanadorB');

    btnA.onclick = () => declararVencedor(datosA, idCajaGanadorDestino);
    btnB.onclick = () => declararVencedor(datosB, idCajaGanadorDestino);

    document.getElementById('batallaModal').style.display = 'flex';
}

function cerrarBatalla() {
    document.getElementById('batallaModal').style.display = 'none';
}

function declararVencedor(datosHtmlNode, idCajaDestino) {
    let cajaDestino = document.getElementById(idCajaDestino);
    
    let datosParaPintar = {
        imagenSrc: datosHtmlNode.getAttribute('data-img'),
        titulo: datosHtmlNode.getAttribute('data-titulo'),
        audioSrc: datosHtmlNode.getAttribute('data-audio'),
        autor: datosHtmlNode.querySelector('p') ? datosHtmlNode.querySelector('p').innerText : 'Artista'
    };

    generarContenidoCaja(cajaDestino, datosParaPintar);
    
    if(idCajaDestino === 'campeon') {
        cajaDestino.classList.add('winner-box');
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