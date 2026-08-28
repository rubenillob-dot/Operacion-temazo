# 🎵 Operación Temazo 2 - Panel Interactivo

Panel web interactivo y dinámico desarrollado a medida para el evento y concurso musical **"Operación Temazo 2"** del canal de Twitch de **Arixu** ([@imarixu](https://www.twitch.tv/imarixu)).

Esta aplicación permite gestionar en directo las canciones participantes, escuchar los temas, mostrar letras, registrar las puntuaciones del jurado, capturar votos en tiempo real directamente desde el chat de Twitch vía WebSocket y disputar un torneo de eliminatorias (bracket) hasta coronar a la canción ganadora.

---

## 📋 Índice

- [🌟 ¿En qué consiste esta página?](#-en-qué-consiste-esta-página)
- [✨ Características Principales](#-características-principales)
  - [1. Salón de la Fama (Edición 1)](#1-salón-de-la-fama-edición-1)
  - [2. Primera Fase: Cartas y Reproductor](#2-primera-fase-cartas-y-reproductor)
  - [3. Sistema de Votación Híbrido en Vivo](#3-sistema-de-votación-híbrido-en-vivo)
  - [4. Integración en Tiempo Real con Twitch Chat (IRC / WebSocket)](#4-integración-en-tiempo-real-con-twitch-chat-irc--websocket)
  - [5. Fase Final: Cuadro de Eliminatorias (Bracket 1vs1)](#5-fase-final-cuadro-de-eliminatorias-bracket-1vs1)
  - [6. Pantalla de Campeón / Ganador Final](#6-pantalla-de-campeón--ganador-final)
- [📐 Reglas y Ponderación del Concurso](#-reglas-y-ponderación-del-concurso)
- [🛠️ Tecnologías Utilizadas](#️-tecnologías-utilizadas)
- [📂 Estructura del Proyecto](#-estructura-del-proyecto)
- [🚀 Cómo Ejecutar el Proyecto](#-cómo-ejecutar-el-proyecto)
- [👥 Créditos](#-créditos)

---

## 🌟 ¿En qué consiste esta página?

La web funciona como una **plataforma interactiva de retransmisión y panel de control para streaming**. Está diseñada para ambientar y automatizar las dos fases del concurso musical de la comunidad:

1. **Fase 1 (Audición y Calificación):** Presentación individual con cartas misteriosas que se revelan con animaciones 3D y efectos de sonido. Se reproduce cada canción, se consultan sus letras y se califica combinando la nota del jurado (Ari) con la votación en tiempo real del chat de Twitch.
2. **Fase 2 (Torneo Final):** Las 8 mejores canciones (5 por nota + 3 por Pase de Oro) se ordenan y barajan en un cuadro de eliminatorias estilo torneo (cuartos, semifinales y gran final) con batallas cara a cara (1vs1) hasta obtener a la canción campeona.

---

## ✨ Características Principales

### 1. Salón de la Fama (Edición 1)
- Podio interactivo con el top 3 de la edición anterior:
  - 🥇 **1º Puesto:** *La vida del stream* (Rurru_Arxu)
  - 🥈 **2º Puesto:** *Arixu en la casa* (Neeusgoomiiis)
  - 🥉 **3º Puesto:** *Ticket dorado* (aandreiiiitaaaa)
- Reproductores integrados en cada tarjeta del podio para escuchar los temas clásicos.

### 2. Primera Fase: Cartas y Reproductor
- **Modo Oculto / Revelación:** Cada canción inicia con diseño incógnito y se revela con giro 3D, destello neón y efecto de audio.
- **Reproductor Personalizado:** Barra de progreso interactiva (con posibilidad de clicar para avanzar la pista), tiempo transcurrido / duración total y control de volumen general.
- **Modal de Letras:** Ventana emergente para leer la letra completa de cada tema sin salir del panel.
- **Pase de Oro (Golden Ticket):** Botón especial con forma de ticket dorado que clasifica automáticamente una canción a la Fase Final.

### 3. Sistema de Votación Híbrido en Vivo
- **Modal de Calificación de Ari:** Al hacer clic en el emote de Ari, se despliega un deslizador interactivo horizontal para puntuar del `0.0` al `10.0` (con decimales).
- **Cálculo Ponderado Automático:**
  $$\text{Nota Final} = (\text{Nota Ari} \times 0.75) + (\text{Nota Chat Twitch} \times 0.25)$$

### 4. Integración en Tiempo Real con Twitch Chat (IRC / WebSocket)
- Conexión directa y nativa por WebSocket (`wss://irc-ws.chat.twitch.tv:443`) al canal `#imarixu`.
- **Temporizador Circular de 30 Segundos:** Animación SVG que descuenta el tiempo límite para votar en el chat.
- **Detección y Validación de Votos:** Reconoce números del `0` al `10` (admite coma y punto decimal, ej. `8.5` o `9,2`), garantizando **1 voto único por usuario**.
- **Animaciones en Pantalla (Estilo IlloJuan):**
  - **Feed de votos en directo:** Lista con los últimos votos recibidos y contador total.
  - **Caja del último votante:** Muestra al espectador más reciente y su puntuación.
  - **Tickets flotantes:** Animación emergente con el nombre del usuario votante.
- **Cálculo de Media Instantáneo:** Al terminar la cuenta atrás, promedia todos los votos del chat y actualiza la tarjeta.

### 5. Fase Final: Cuadro de Eliminatorias (Bracket 1vs1)
- Al pulsar **"EMPEZAR FASE FINAL"**, el sistema reúne los 3 pases de oro y las 5 canciones con mejor nota media.
- Barajeo aleatorio mediante el algoritmo *Fisher-Yates* y distribución animada con sonido de redoble de tambor en el árbol de torneo (Cuartos -> Semis -> Final).
- **Modal de Batalla 1vs1:**
  - Dos reproductores independientes enfrentados (Contendiente A vs Contendiente B).
  - Indicador para votaciones rápidas en Twitch (A o B).
  - Botón **"VENCEDOR"** que clasifica al ganador automáticamente a la siguiente ronda.

### 6. Pantalla de Campeón / Ganador Final
- Al definir la batalla de la gran final, se abre automáticamente el modal de la victoria con trofeos dorados, datos del autor y reproducción del tema campeón.

---

## 📐 Reglas y Ponderación del Concurso

| Concepto | Peso / Condición | Detalle |
|---|:---:|---|
| **Voto Jurado (Ari)** | **75%** | Puntuación del 0 al 10 con decimales. |
| **Voto Chat de Twitch** | **25%** | Votación abierta durante 30s en directo en `#imarixu`. |
| **Pase de Oro** | **Clasificación Directa** | 3 pases disponibles para pasar directo a la fase final. |
| **Clasificados a Fase Final** | **8 canciones** | 3 Pases de Oro + 5 canciones con mayor nota final. |
| **Fase Final** | **Eliminatoria Directa** | Enfrentamientos 1vs1 decididos por Ari y el chat (A/B). |

---

## 🛠️ Tecnologías Utilizadas

- **HTML5:** Estructura semántica, audio nativo y modales accesibles.
- **CSS3:** Diseño responsivo con temas oscuros neón, gradientes, efectos *glassmorphism*, animaciones 3D (`transform`, `rotateY`, `keyframes`) y layout con Flexbox y CSS Grid.
- **JavaScript (Vanilla ES6+):** Lógica del reproductor de audio, algoritmos de cálculo, manipulación del DOM y gestión de estados.
- **Twitch IRC / WebSocket:** Comunicación bidireccional en tiempo real con los servidores de chat de Twitch.
- **FontAwesome 6 & Google Fonts (Inter):** Iconografía y tipografía moderna.

---

## 📂 Estructura del Proyecto

```text
Operacion-temazo/
├── index.html           # Estructura principal, modales y bracket del torneo
├── style.css            # Estilos, efectos visuales, animaciones y diseño responsivo
├── script.js           # Lógica, datos de canciones, conexión a Twitch y torneo
├── LICENSE              # Licencia del proyecto
├── README.md            # Documentación del proyecto
├── efectos/             # Efectos de sonido (revelación, tambores)
│   ├── audiorevelacion.mp3
│   └── redobletambor.mp3
├── emotes/              # Emotes del canal utilizados en el panel
│   ├── EmoteAri.png
│   └── EmoteLuismi.png
├── imagen/              # Carátulas de las canciones participantes
│   ├── La vida del stream.png
│   ├── perdonalo.png
│   ├── Arixu cortar Papas.jpeg
│   ├── Xenodeformo Arixu.png
│   └── ...
└── musica/              # Archivos de audio (.mp3) de las canciones
    ├── La vida del stream.mp3
    ├── Perdonalo.mp3
    ├── Arixu Cortar Papas.mp3
    └── ...
```

---

## 🚀 Cómo Ejecutar el Proyecto

1. Clona o descarga este repositorio en tu equipo.
2. Abre el archivo `index.html` directamente en cualquier navegador web moderno (Google Chrome, Mozilla Firefox, Microsoft Edge, etc.) o utilízalo mediante una extensión de servidor local como **Live Server** en Visual Studio Code.
3. Para habilitar la votación del chat de Twitch en directo, asegúrate de tener conexión a Internet para que el WebSocket conecte con `wss://irc-ws.chat.twitch.tv:443`.

---

## 👥 Créditos

- **Revisión General:** Noopo, Neus, Ruben
- **Selección Final:** Noopo, Neus, Ruben
- **Diseño y Animaciones:** [@rubencillo.04](https://www.instagram.com/rubencillo.04)
- **Jurado:** Ari ([@imarixu](https://www.twitch.tv/imarixu)) y el chat de Twitch
- **Desarrollo:** Ruben