/**
 * ============================================================
 * GUÍA PARA EL EQUIPO - ANALIZADOR DE CHATS
 * ============================================================
 * 1. FLUJO DE DATOS: 
 *    Input (.txt) -> validator.js -> parser.js -> metrics.js -> UI
 * 
 * 2. VALIDACIONES: 
 *    Cualquier regla de rechazo de archivos debe ir en 'validator.js'.
 * 
 * 3. MÓDULO DE MÉTRICAS: 
 *    Toda lógica estadística (rankings, conteos) reside en 'metrics.js'.
 * 
 * 4. INTEGRACIÓN VUE/CSS:
 *    - Vincular 'mensajesProcesados' al estado de Vue.
 *    - Se pueden usar clases de Bootstrap libremente en 'index.html'.
 * 
 * 5. EXTENSIBILIDAD:
 *    - Nuevos campos de texto: Modificar 'parser.js'.
 *    - Nuevos cálculos/filtros: Modificar 'metrics.js'.
 * ============================================================
 */

/**
 * @file app.js
 * @description Controlador principal de la interfaz de usuario. 
 * Gestiona la carga de archivos y coordina con el módulo parser.
 */

// 1. IMPORTACIÓN: funciones
import { parsearArchivo } from './modules/parser.js';
import { getParticipants, getMessageCountByUser } from './modules/metrics.js'; // Nueva
import { validarArchivoChat } from './modules/validator.js'; // Nueva importación

// 2. Referencias a elementos del DOM
const fileInput = document.getElementById('chatFile');
const statusDisplay = document.getElementById('status');
const ulParticipantes = document.getElementById('list-participantes'); // Nueva
const tablaBody = document.querySelector('#tabla-ranking tbody'); // Nueva

/**
 * Evento que se dispara al seleccionar un archivo.
 * Utiliza FileReader para leer el .txt de forma asíncrona.
 */
fileInput.addEventListener('change', async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return; // Validación: Si el usuario cancela la selección, salimos.

    const lector = new FileReader();

    // Se ejecuta cuando el archivo se ha leído completamente en memoria
    lector.onload = (evento) => {
        try {
            const contenido = evento.target.result;

            // VALIDACIÓN
            validarArchivoChat(archivo, contenido);

            // Si pasó las validaciones, el flujo continúa normalmente:

            // FASE 1: Transformación de texto plano a Objetos JavaScript (POJO)
            const mensajesProcesados = parsearArchivo(contenido);

            // FASE 2: Procesamiento estadístico (Cálculo de métricas Act 9 y 10))
            const listaParticipantes = getParticipants(mensajesProcesados);
            const rankingUsuarios = getMessageCountByUser(mensajesProcesados);

            // FASE 3: Presentación de datos (Renderizado en el navegador)
            renderUserMetrics(listaParticipantes, rankingUsuarios);

            // FASE 4: Debugging - Verificación de estructura de datos en consola
            console.log("=== DATOS ESTRUCTURADOS (POJO) ===");
            console.log("Mensajes totales:", mensajesProcesados.length);

            console.log("=== ACT 9: IDENTIFICAR USUARIOS ===");
            console.table(listaParticipantes);

            console.log("=== ACT 10: CONTEO DE MENSAJES (M1) ===");
            console.table(rankingUsuarios);

            // Actualización del estado visual para el usuario
            statusDisplay.innerText = `¡Éxito! Se detectaron ${listaParticipantes.length} usuarios y ${mensajesProcesados.length} mensajes.`;
        } catch (error) {
            // 1. Limpieza total de la interfaz
            renderUserMetrics([], []);

            // 2. Reseteo del input para permitir re-intentos
            fileInput.value = "";

            // 3. Registro técnico en consola para nosotros (los desarrolladores)
            console.error("Detalle técnico del error:", error);

            // 4. Feedback para el usuario:
            // Si el error tiene un mensaje (ej. de validator.js), lo mostramos.
            // Si no, ponemos un mensaje genérico por seguridad.
            statusDisplay.innerText = error.message || "Error inesperado al procesar el archivo.";
        }
    };

    // Iniciamos la lectura del archivo con codificación UTF-8 para soportar emojis y tildes
    lector.readAsText(archivo, 'UTF-8');

});


/**
 * @function renderUserMetrics
 * @param {Array} participantes - Lista de strings con nombres de usuarios.
 * @param {Array} ranking - Objetos con estructura {name, count}.
 * @description Inyecta los datos procesados en el HTML. Se mantiene simple 
 * para facilitar la posterior integración con Frameworks o estilos CSS.
 */
const renderUserMetrics = (participantes, ranking) => {
    // Limpieza de contenedores para permitir múltiples cargas sin duplicar datos
    ulParticipantes.innerHTML = '';
    tablaBody.innerHTML = '';

    // Renderizado de lista de participantes únicos
    participantes.forEach(p => {
        const li = document.createElement('li');
        li.textContent = p;
        ulParticipantes.appendChild(li);
    });

    // Renderizado de la tabla de ranking
    ranking.forEach(user => {
        const row = tablaBody.insertRow(); // Crea un <tr>
        row.insertCell(0).textContent = user.name; // Primera celda: Nombre
        row.insertCell(1).textContent = user.count; // Segunda celda: Cantidad
    });
};