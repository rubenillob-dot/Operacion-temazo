// Función para ocultar la cubierta y mostrar la canción
function revelarCancion(id) {
    document.getElementById('hidden' + id).style.display = 'none';
    document.getElementById('revealed' + id).style.display = 'flex';
}

// Función para simular que una canción está sonando (sombreado morado)
function reproducir(id) {
    // 1. Quitamos el estado "playing" y restauramos el icono de play a TODAS las cartas
    const todasLasCartas = document.querySelectorAll('.card');
    const todosLosIconos = document.querySelectorAll('.play-btn i');
    
    todasLasCartas.forEach(carta => {
        carta.classList.remove('playing');
    });
    
    todosLosIconos.forEach(icono => {
        icono.classList.remove('fa-pause');
        icono.classList.add('fa-play');
    });

    // 2. Seleccionamos la carta específica y su icono
    const cartaActual = document.getElementById('cancion' + id);
    const iconoActual = document.getElementById('playIcon' + id);

    // 3. Le aplicamos el efecto visual de "reproduciendo"
    cartaActual.classList.add('playing');
    iconoActual.classList.remove('fa-play');
    iconoActual.classList.add('fa-pause');
}

// === NUEVO: Función para activar/desactivar el Ticket Dorado ===
function togglePaseOro(boton) {
    // Alterna la clase 'active' que cambia los colores en CSS
    boton.classList.toggle('active');
}

// === NUEVO: Funciones para la Ventana de la Letra ===
function abrirLetra(titulo, letraHTML) {
    // Rellenamos el modal con los datos de la canción elegida
    document.getElementById('modalTitle').innerText = titulo;
    document.getElementById('modalLyrics').innerHTML = letraHTML;
    
    // Mostramos el modal
    document.getElementById('lyricsModal').style.display = 'flex';
}

function cerrarLetra() {
    // Ocultamos el modal
    document.getElementById('lyricsModal').style.display = 'none';
}

// Extra: Si el usuario hace clic fuera de la caja de la letra, también se cierra
window.onclick = function(event) {
    let modal = document.getElementById('lyricsModal');
    if (event.target == modal) {
        cerrarLetra();
    }
}