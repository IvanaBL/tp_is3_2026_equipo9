/**
 * ============================================================
 * GUÍA PARA EL EQUIPO
 * ============================================================
 * 1. INTEGRACIÓN DE VUE: El Array 'mensajesProcesados' es el que 
 * deben vincular al 'data' de la instancia de Vue.
 * 2. BOOTSTRAP: Pueden cambiar las clases en index.html sin miedo, 
 * siempre que mantengan los ID 'chatFile' y 'status'.
 * 3. MÓDULO DE MÉTRICAS: Se utiliza el archivo 'metrics.js'. 
 * Toda lógica de cálculo sobre los datos debe ir allí.
 * 4. EXTENSIÓN: 
 * - Para capturar nuevos datos del texto: parser.js
 * - Para nuevas métricas o agrupamientos: metrics.js
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
            // Captura de errores para evitar que la aplicación se bloquee si el .txt tiene formato inválido
            console.error("Error al procesar:", error);
            statusDisplay.innerText = "Error crítico al procesar el archivo.";
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