/**
 * Variable para recordar qué canción está sonando en este momento.
 * @type {string|null}
 */
let cancionSonandoId = null;

/**
 * Oculta la cubierta (icono gigante) y muestra los detalles interactivos de la canción.
 * @param {string} id - El identificador numérico de la canción.
 */
function revelarCancion(id) {
    document.getElementById('hidden' + id).style.display = 'none';
    document.getElementById('revealed' + id).style.display = 'flex';
}

/**
 * Función principal del reproductor. Reproduce, pausa y alterna entre las canciones,
 * gestionando los cambios visuales de las tarjetas.
 * @param {string} id - El identificador numérico de la canción a reproducir.
 */
function reproducir(id) {
    const audioActual = document.getElementById('audio' + id);
    const iconoActual = document.getElementById('playIcon' + id);
    const cartaActual = document.getElementById('cancion' + id);

    // 1. Si el usuario hace clic en la misma canción que ya está seleccionada
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

    // 2. Si hay otra canción sonando, la paramos primero
    if (cancionSonandoId !== null) {
        const audioPrevio = document.getElementById('audio' + cancionSonandoId);
        const iconoPrevio = document.getElementById('playIcon' + cancionSonandoId);
        const cartaPrevia = document.getElementById('cancion' + cancionSonandoId);

        if (audioPrevio) {
            audioPrevio.pause();
            audioPrevio.currentTime = 0;
        }
        if (cartaPrevia) cartaPrevia.classList.remove('playing');
        if (iconoPrevio) {
            iconoPrevio.classList.remove('fa-pause');
            iconoPrevio.classList.add('fa-play');
        }
    }

    // 3. Reproducimos la NUEVA canción
    audioActual.play();
    cartaActual.classList.add('playing');
    iconoActual.classList.remove('fa-play');
    iconoActual.classList.add('fa-pause');

    cancionSonandoId = id;
}

/**
 * Activa o desactiva el estilo visual del Ticket Dorado (Pase de Oro).
 * @param {HTMLElement} boton - El elemento botón del DOM que ha sido pulsado.
 */
function togglePaseOro(boton) {
    boton.classList.toggle('active');
}

/**
 * Abre la ventana modal para mostrar la letra de la canción.
 * @param {string} titulo - El título de la canción.
 * @param {string} letraHTML - El contenido de la letra en formato HTML.
 */
function abrirLetra(titulo, letraHTML) {
    document.getElementById('modalTitle').innerText = titulo;
    document.getElementById('modalLyrics').innerHTML = letraHTML;
    document.getElementById('lyricsModal').style.display = 'flex';
}

/**
 * Cierra la ventana modal de la letra de la canción.
 */
function cerrarLetra() {
    document.getElementById('lyricsModal').style.display = 'none';
}

/**
 * Evento global para cerrar la ventana modal si el usuario hace clic fuera de la caja de contenido.
 * @param {Event} event - El evento de clic del ratón.
 */
window.onclick = function (event) {
    let modal = document.getElementById('lyricsModal');
    if (event.target == modal) {
        cerrarLetra();
    }
}

/**
 * Inicializadores y Listeners que se ejecutan una vez que el DOM está completamente cargado.
 */
document.addEventListener('DOMContentLoaded', () => {

    // Control de Volumen General
    const volumeSlider = document.querySelector('.volume-slider');
    if (volumeSlider) {
        volumeSlider.addEventListener('input', function (e) {
            const volumen = e.target.value / 100;
            document.querySelectorAll('audio').forEach(audio => {
                audio.volume = volumen;
            });
        });
    }

    // Calculo automático de notas (50% Ari + 25% Luismi)
    document.addEventListener('input', function (e) {
        if (e.target.classList.contains('score-input')) {
            const card = e.target.closest('.card');
            const inputs = card.querySelectorAll('.score-input');
            const ari = parseFloat(inputs[0].value) || 0;
            const luismi = parseFloat(inputs[1].value) || 0;

            const final = ((ari * 0.5) + (luismi * 0.25)).toFixed(1);
            card.querySelector('.final-score').innerText = final;
        }
    });

    // === NUEVO: Actualización de la barra de progreso y el tiempo ===
    document.querySelectorAll('audio').forEach(audio => {

        // Listener que se dispara continuamente mientras el audio avanza
        audio.addEventListener('timeupdate', function () {
            const id = this.id.replace('audio', '');
            const card = document.getElementById('cancion' + id);

            if (card && this.duration) {
                const progressBar = card.querySelector('.timeline-progress');
                const timeText = card.querySelector('.time-text');

                // 1. Mover la barra verde
                const progressPercent = (this.currentTime / this.duration) * 100;
                progressBar.style.width = progressPercent + '%';

                // 2. Formatear minutos y segundos
                const currentMins = Math.floor(this.currentTime / 60);
                const currentSecs = Math.floor(this.currentTime % 60).toString().padStart(2, '0');
                const totalMins = Math.floor(this.duration / 60);
                const totalSecs = Math.floor(this.duration % 60).toString().padStart(2, '0');

                // 3. Actualizar el texto
                timeText.innerText = `${currentMins}:${currentSecs} / ${totalMins}:${totalSecs}`;
            }
        });

        // Listener que se dispara cuando la canción termina por completo
        audio.addEventListener('ended', function () {
            const id = this.id.replace('audio', '');
            const card = document.getElementById('cancion' + id);
            const iconoActual = document.getElementById('playIcon' + id);
            const progressBar = card.querySelector('.timeline-progress');
            const timeText = card.querySelector('.time-text');

            // Devolver la tarjeta a su estado original apagado
            card.classList.remove('playing');
            iconoActual.classList.remove('fa-pause');
            iconoActual.classList.add('fa-play');
            if (progressBar) progressBar.style.width = '0%';

            const totalMins = Math.floor(this.duration / 60);
            const totalSecs = Math.floor(this.duration % 60).toString().padStart(2, '0');
            if (timeText) timeText.innerText = `0:00 / ${totalMins}:${totalSecs}`;

            cancionSonandoId = null;
        });

        // Listener para cargar el tiempo total correcto en cuanto los metadatos del audio estén listos
        audio.addEventListener('loadedmetadata', function () {
            const id = this.id.replace('audio', '');
            const card = document.getElementById('cancion' + id);
            if (card) {
                const timeText = card.querySelector('.time-text');
                const totalMins = Math.floor(this.duration / 60);
                const totalSecs = Math.floor(this.duration % 60).toString().padStart(2, '0');
                timeText.innerText = `0:00 / ${totalMins}:${totalSecs}`;
            }
        });
    });

});

/**
 * Almacena las notas finales del público (en secreto) hasta que empiece la Fase Final.
 * @type {Object.<string, number>}
 */
let notasSecretasPublico = {};

/**
 * Variables de control para el estado de la votación actual.
 */
let isVotingActive = false;
let currentVotingSongId = null;
let currentVotes = {}; // Para evitar que una misma persona vote dos veces
let votingTimer;

/**
 * Configuración del cliente de Twitch usando tmi.js
 */
const client = new tmi.Client({
    channels: ['imarixu'] // <-- ¡CAMBIA ESTO POR TU CANAL!
});

// Conecta al chat de Twitch
client.connect().catch(console.error);

client.on('message', (channel, tags, message, self) => {
    if (self || !isVotingActive) return;

    // Busca un número (entero o decimal) en el mensaje del usuario
    const match = message.match(/\b([0-9]|10)(?:[.,][0-9])?\b/);
    
    if (match) {
        const voto = parseFloat(match[0].replace(',', '.'));
        
        // Verifica que la nota es válida (0 al 10)
        if (voto >= 0 && voto <= 10) {
            const username = tags['display-name'] || tags.username;
            
            // Verificamos si es suscriptor (Twitch envía esto en los tags)
            const isSub = tags.subscriber || tags.mod || tags.badges?.founder;
            
            // Si no ha votado, lo registramos y actualizamos el pantallón
            if (currentVotes[username] === undefined) {
                currentVotes[username] = voto;
                mostrarVotoEnPantalla(username, voto, isSub);
            }
        }
    }
});

function abrirVotacionTwitch(id) {
    document.getElementById('twitchModal').style.display = 'flex';
    
    // Reseteamos el panel visual
    document.getElementById('showcaseUser').innerText = 'Esperando chat...';
    document.getElementById('showcaseScore').innerText = '-';
    document.getElementById('totalVotes').innerText = '0';
    document.getElementById('badgeSub').style.display = 'none';
    document.getElementById('twitchTimer').innerText = '30';
    
    currentVotingSongId = id;
    currentVotes = {};
    isVotingActive = true;
    
    let tiempoRestante = 30;
    
    votingTimer = setInterval(() => {
        tiempoRestante--;
        document.getElementById('twitchTimer').innerText = tiempoRestante;
        
        if (tiempoRestante <= 0) {
            finalizarVotacion();
        }
    }, 1000);
}

function mostrarVotoEnPantalla(username, voto, isSub) {
    // Actualiza el nombre y la nota gigante
    document.getElementById('showcaseUser').innerText = username;
    document.getElementById('showcaseScore').innerText = voto;
    
    // Muestra u oculta la etiqueta de "Sub"
    document.getElementById('badgeSub').style.display = isSub ? 'inline-block' : 'none';
    
    // Actualiza el contador total
    const total = Object.keys(currentVotes).length;
    document.getElementById('totalVotes').innerText = total;
}

function finalizarVotacion() {
    clearInterval(votingTimer);
    isVotingActive = false;
    document.getElementById('twitchTimer').innerText = '0';
    
    const arrayVotos = Object.values(currentVotes);
    let media = 0;
    
    if (arrayVotos.length > 0) {
        const suma = arrayVotos.reduce((a, b) => a + b, 0);
        media = (suma / arrayVotos.length).toFixed(1);
    }
    
    notasSecretasPublico[currentVotingSongId] = parseFloat(media);
    
    // Mensaje de cierre en el panel
    document.getElementById('showcaseUser').innerText = 'Votación Cerrada';
    document.getElementById('showcaseScore').innerText = '🔒';
    document.getElementById('badgeSub').style.display = 'none';
    
    setTimeout(() => {
        cerrarTwitch();
        document.querySelector(`#cancion${currentVotingSongId} .btn-twitch`).style.backgroundColor = '#1ed760';
    }, 3000);
}

function cerrarTwitch() {
    document.getElementById('twitchModal').style.display = 'none';
    clearInterval(votingTimer);
    isVotingActive = false;
}