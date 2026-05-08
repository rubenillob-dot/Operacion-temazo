/**
 * @file script.js
 * Archivo principal de lógica para Operación Temazo 1.
 * Incluye el reproductor de audio, cálculo de notas y conexión a Twitch.
 */

/**
 * Almacena el ID de la canción que está sonando actualmente.
 * @type {string|null}
 */
let cancionSonandoId = null;

/**
 * Oculta la cubierta de la canción y muestra los controles interactivos.
 * @param {string} id - Identificador de la canción.
 */
function revelarCancion(id) {
    document.getElementById('hidden' + id).style.display = 'none';
    document.getElementById('revealed' + id).style.display = 'flex';
}

/**
 * Reproduce o pausa la canción seleccionada, deteniendo cualquier otra que estuviera sonando.
 * @param {string} id - Identificador de la canción.
 */
function reproducir(id) {
    const audioActual = document.getElementById('audio' + id);
    const iconoActual = document.getElementById('playIcon' + id);
    const cartaActual = document.getElementById('cancion' + id);

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

    audioActual.play();
    cartaActual.classList.add('playing');
    iconoActual.classList.remove('fa-play');
    iconoActual.classList.add('fa-pause');

    cancionSonandoId = id;
}

/**
 * Alterna el estado visual del botón de Pase de Oro.
 * @param {HTMLElement} boton - El elemento botón del DOM.
 */
function togglePaseOro(boton) {
    boton.classList.toggle('active');
}

/**
 * Abre el modal para visualizar la letra de la canción.
 * @param {string} titulo - Título de la canción.
 * @param {string} letraHTML - Contenido de la letra en HTML.
 */
function abrirLetra(titulo, letraHTML) {
    document.getElementById('modalTitle').innerText = titulo;
    document.getElementById('modalLyrics').innerHTML = letraHTML;
    document.getElementById('lyricsModal').style.display = 'flex';
}

/**
 * Cierra el modal de la letra de la canción.
 */
function cerrarLetra() {
    document.getElementById('lyricsModal').style.display = 'none';
}

// Cierra modales al hacer clic fuera
window.onclick = function (event) {
    let modalLetra = document.getElementById('lyricsModal');
    if (event.target == modalLetra) {
        cerrarLetra();
    }
}

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

    document.querySelectorAll('audio').forEach(audio => {
        audio.addEventListener('timeupdate', function () {
            const id = this.id.replace('audio', '');
            const card = document.getElementById('cancion' + id);

            if (card && this.duration) {
                const progressBar = card.querySelector('.timeline-progress');
                const timeText = card.querySelector('.time-text');

                const progressPercent = (this.currentTime / this.duration) * 100;
                progressBar.style.width = progressPercent + '%';

                const currentMins = Math.floor(this.currentTime / 60);
                const currentSecs = Math.floor(this.currentTime % 60).toString().padStart(2, '0');
                const totalMins = Math.floor(this.duration / 60);
                const totalSecs = Math.floor(this.duration % 60).toString().padStart(2, '0');

                timeText.innerText = `${currentMins}:${currentSecs} / ${totalMins}:${totalSecs}`;
            }
        });

        audio.addEventListener('ended', function () {
            const id = this.id.replace('audio', '');
            const card = document.getElementById('cancion' + id);
            const iconoActual = document.getElementById('playIcon' + id);
            const progressBar = card.querySelector('.timeline-progress');
            const timeText = card.querySelector('.time-text');

            card.classList.remove('playing');
            iconoActual.classList.remove('fa-pause');
            iconoActual.classList.add('fa-play');
            if (progressBar) progressBar.style.width = '0%';

            const totalMins = Math.floor(this.duration / 60);
            const totalSecs = Math.floor(this.duration % 60).toString().padStart(2, '0');
            if (timeText) timeText.innerText = `0:00 / ${totalMins}:${totalSecs}`;

            cancionSonandoId = null;
        });

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

/* ========================================================================= */
/* === CONEXIÓN A TWITCH Y VOTACIONES ====================================== */
/* ========================================================================= */

/**
 * Almacena las notas medias finales del público de forma secreta.
 * @type {Object.<string, number>}
 */
let notasSecretasPublico = {};

/**
 * Indica si el temporizador de votación está actualmente activo.
 * @type {boolean}
 */
let isVotingActive = false;

/**
 * Almacena el ID de la canción que se está votando en este momento.
 * @type {string|null}
 */
let currentVotingSongId = null;

/**
 * Registro de votos de la ronda actual para evitar duplicados.
 * @type {Object.<string, number>}
 */
let currentVotes = {};

/**
 * Referencia al intervalo del temporizador.
 * @type {number|null}
 */
let votingTimer = null;

/**
 * Instancia del cliente tmi.js para conectar con el chat de Twitch.
 * IMPORTANTE: El canal debe estar estrictamente en minúsculas.
 */
const client = new tmi.Client({
    options: { debug: true }, // <--- Esto nos dará toda la info interna
    connection: {
        reconnect: true,
        secure: true // <--- Obliga al navegador a no bloquear la conexión
    },
    channels: ['imarixu']
});

// Evento que avisa por consola cuando se ha conectado correctamente al chat
client.on('connected', (addr, port) => {
    console.log(`[TWITCH] Conectado a la sala: ${addr}:${port}`);
});

// Conexión inicial al chat
client.connect().catch(error => {
    console.error(`[ERROR CRÍTICO TWITCH] No se pudo conectar:`, error);
});

/**
 * Listener principal que procesa cada mensaje enviado al chat de Twitch.
 * Extrae números y registra el voto si la votación está activa.
 */
client.on('message', (channel, tags, message, self) => {
    // Chivato en la consola para ver qué está leyendo realmente
    console.log(`[TWITCH] Mensaje de ${tags.username}: ${message}`);

    // Si el mensaje es nuestro o no estamos votando, lo ignoramos
    if (self || !isVotingActive) return;

    // Buscamos cualquier número en el mensaje (ej: "8", "8.5", "10")
    const match = message.match(/[0-9]+([.,][0-9]+)?/);
    
    if (match) {
        const voto = parseFloat(match[0].replace(',', '.'));
        
        // Verificamos que la nota esté entre 0 y 10
        if (voto >= 0 && voto <= 10) {
            const username = tags['display-name'] || tags.username;
            
            // Verificación segura de si es Sub, Mod o VIP
            let isSub = false;
            if (tags.subscriber || tags.mod) {
                isSub = true;
            } else if (tags.badges && tags.badges.founder) {
                isSub = true;
            }
            
            // Si el usuario no ha votado aún en esta ronda
            if (currentVotes[username] === undefined) {
                currentVotes[username] = voto;
                console.log(`[VOTO ACEPTADO] ${username} ha votado un ${voto}`);
                mostrarVotoEnPantalla(username, voto, isSub);
            }
        }
    }
});

/**
 * Inicia el proceso de votación de Twitch y muestra el modal.
 * @param {string} id - Identificador numérico de la canción.
 */
function abrirVotacionTwitch(id) {
    console.log(`[SISTEMA] Abriendo votación para la canción ${id}`);
    
    document.getElementById('twitchModal').style.display = 'flex';
    document.getElementById('showcaseUser').innerText = 'Esperando chat...';
    document.getElementById('showcaseScore').innerText = '-';
    document.getElementById('totalVotes').innerText = '0';
    document.getElementById('badgeSub').style.display = 'none';
    document.getElementById('twitchTimer').innerText = '30';
    
    currentVotingSongId = id;
    currentVotes = {};
    isVotingActive = true;
    
    let tiempoRestante = 30;
    
    if (votingTimer) clearInterval(votingTimer);
    
    votingTimer = setInterval(() => {
        tiempoRestante--;
        document.getElementById('twitchTimer').innerText = tiempoRestante;
        
        if (tiempoRestante <= 0) {
            finalizarVotacion();
        }
    }, 1000);
}

/**
 * Actualiza la interfaz gráfica con el último voto recibido.
 * @param {string} username - Nombre del usuario que ha votado.
 * @param {number} voto - Nota otorgada.
 * @param {boolean} isSub - Indica si el usuario tiene estado de suscripción.
 */
function mostrarVotoEnPantalla(username, voto, isSub) {
    document.getElementById('showcaseUser').innerText = username;
    document.getElementById('showcaseScore').innerText = voto;
    document.getElementById('badgeSub').style.display = isSub ? 'inline-block' : 'none';
    
    const total = Object.keys(currentVotes).length;
    document.getElementById('totalVotes').innerText = total;
}

/**
 * Finaliza el temporizador, calcula la media y la almacena en secreto.
 */
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
    
    console.log(`[SISTEMA] Votación finalizada. Media: ${media} (guardada en secreto)`);
    notasSecretasPublico[currentVotingSongId] = parseFloat(media);
    
    document.getElementById('showcaseUser').innerText = 'Votación Cerrada';
    document.getElementById('showcaseScore').innerText = '🔒';
    document.getElementById('badgeSub').style.display = 'none';
    
    setTimeout(() => {
        cerrarTwitch();
        const botonTwitch = document.querySelector(`#cancion${currentVotingSongId} .btn-twitch`);
        if(botonTwitch) botonTwitch.style.backgroundColor = '#1ed760';
    }, 3000);
}

/**
 * Cierra manualmente la interfaz del modal de Twitch.
 */
function cerrarTwitch() {
    document.getElementById('twitchModal').style.display = 'none';
    clearInterval(votingTimer);
    isVotingActive = false;
}
