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
 * 
 * 6. CAPA DE RED Y PERSISTENCIA (API):
 *    - Actividad 16 & 17: Centralizadas en 'api.js'. Manejan la conexión asíncrona 
 *    inicial (simulada) y la serialización de los POJOs procesados a formato JSON.
 *    - Infraestructura Futura: 'api.js' ya incluye el CRUD completo (POST, GET, PUT, 
 *    DELETE) bajo arquitectura REST. 
 *    - Regla de Arquitectura: Ningún script de la interfaz debe realizar peticiones 
 *    'fetch' directas; toda comunicación con el exterior se debe canalizar 
 *    importando los métodos de 'api.js'.
 * ============================================================
 */

/**
 * @file app.js
 * @description Controlador principal de la interfaz de usuario. 
 * Gestiona la carga de archivos y coordina con el módulo parser.
 */

// 1. IMPORTACIÓN: funciones
import { parsearArchivo } from './modules/parser.js';
import { validarArchivoChat } from './modules/validator.js';
import { connectToBackend, convertPojoToJson } from './modules/api.js';
import { getParticipants, getMessageCountByUser, getMessageCountByHour, getPeakHour, getTop5DaysByDate, getMessageCountByWeekday, getPeakWeekday, getWordCloudData, getEmojiRanking, getTopEmoji } from './modules/metrics.js';

// 2. Referencias a elementos del DOM
const fileInput = document.getElementById('chatFile');
const statusDisplay = document.getElementById('status');
const ulParticipantes = document.getElementById('list-participantes'); // Nueva
const tablaBody = document.querySelector('#tabla-ranking tbody'); // Nueva
const tbodyHoras = document.getElementById('tbody-horas'); // Nueva referencia para métricas de horas
const tbodyTop5Dias = document.getElementById('tbody-top5-dias'); // Nueva referencia para top 5 días
const tbodyDiasSemana = document.getElementById('tbody-dias-semana'); // Nueva referencia para actividad por día de la semana
const tbodyEmojis = document.getElementById('tbody-emojis');
const emojiTopDiv = document.getElementById('emoji-top');

// Variable global o de control para almacenar si el Backend está disponible
let backendDisponible = false;

///GRAFICOS
let chartHoras = null;
let chartDias = null;

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
            const actividadPorHora = getMessageCountByHour(mensajesProcesados);
            const horaPico = getPeakHour(mensajesProcesados);
            const top5Dias = getTop5DaysByDate(mensajesProcesados);
            const actividadPorDiaSemana = getMessageCountByWeekday(mensajesProcesados);
            const diaPico = getPeakWeekday(mensajesProcesados);
            renderHourChart(actividadPorHora);
            renderWeekdayChart(actividadPorDiaSemana);

            //FASE 4:  NUEVO: M5 - Word Cloud
            const stopwordsList = [
                'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'lo',
                'a', 'ante', 'bajo', 'con', 'contra', 'de', 'desde', 'durante', 'en',
                'entre', 'hacia', 'hasta', 'mediante', 'para', 'por', 'según', 'sin',
                'sobre', 'tras', 'que', 'y', 'e', 'ni', 'o', 'u', 'pero', 'sino',
                'aunque', 'porque', 'pues', 'si', 'como', 'cuando', 'donde', 'mientras',
                'yo', 'tu', 'vos', 'él', 'ella', 'nosotros', 'nosotras', 'ustedes',
                'ellos', 'ellas', 'me', 'te', 'se', 'nos', 'le', 'les', 'mi', 'mis',
                'tus', 'su', 'sus', 'es', 'era', 'son', 'eran', 'fue', 'fueron', 'ser',
                'estar', 'estoy', 'estás', 'está', 'estamos', 'están', 'estaba', 'estaban',
                'ha', 'han', 'he', 'haber', 'hay', 'tiene', 'tienen', 'tengo', 'tener',
                'no', 'si', 'sí', 'también', 'tampoco', 'ya', 'muy', 'más', 'menos',
                'ok', 'dale', 'bueno', 'nada', 'todo', 'todos', 'una', 'cada', 'mucho',
                'otro', 'mismo', 'tipo', 'hacer', 'hago', 'hace', 'hacen', 'poder',
                'puedo', 'puede', 'pueden', 'querer', 'quiero', 'quiere'
            ];

            const wordCloudData = getWordCloudData(mensajesProcesados, stopwordsList);
            const wordCloudContainer = document.getElementById('word-cloud');
            const emojiRanking = getEmojiRanking(mensajesProcesados);
            const emojiTop = getTopEmoji(mensajesProcesados);



            // FASE 3: Presentación de datos (Renderizado en el navegador)
            renderUserMetrics(listaParticipantes, rankingUsuarios);
            renderHourMetrics(actividadPorHora, horaPico);
            renderDayMetrics(top5Dias, actividadPorDiaSemana, diaPico);
            renderEmojiMetrics(emojiRanking, emojiTop);

            //FASE 4: STOPWORDS 
            renderWordCloud(wordCloudData);

            // FASE 4: Debugging - Verificación de estructura de datos en consola
            console.log("=== DATOS ESTRUCTURADOS (POJO) ===");
            console.log("Mensajes totales:", mensajesProcesados.length);

            console.log("=== ACT 9: IDENTIFICAR USUARIOS ===");
            console.table(listaParticipantes);

            console.log("=== ACT 10: CONTEO DE MENSAJES (M1) ===");
            console.table(rankingUsuarios);

            console.log("=== ACT 11: MENSAJES POR HORA ===");
            console.table(actividadPorHora);
            console.log("Hora pico:", horaPico);

            console.log("=== ACT 12: TOP 5 DÍAS CON MÁS MENSAJES ===");
            console.table(top5Dias);

            console.log("=== ACT 12: ACTIVIDAD POR DÍA DE SEMANA ===");
            console.table(actividadPorDiaSemana);
            console.log("Día pico:", diaPico);

            console.log("=== ACT 14: STOPWORDS ===");
            console.table(wordCloudData);

            console.log("=== RANKING EMOJIS ===");
            console.table(emojiRanking);

            console.log("=== ACT 17: MANEJO DE JSON (SERIALIZACIÓN) ==="); // ACTIVIDAD 17: Conversión real y dinámica de POJOs a JSON
            const resultadoJsonString = convertPojoToJson(mensajesProcesados);

            if (resultadoJsonString !== null) {
                console.log(resultadoJsonString); // Imprime el JSON completo y formateado
                console.log("Tipo de dato final generado:", typeof resultadoJsonString);
            }

            // Actualización del estado visual para el usuario
            statusDisplay.innerText = `¡Éxito! Se detectaron ${listaParticipantes.length} usuarios y ${mensajesProcesados.length} mensajes.`;
        } catch (error) {
            // 1. Limpieza total de la interfaz
            renderUserMetrics([], []);
            renderHourMetrics([], null);
            renderDayMetrics([], [], null);

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

/**
 * @function renderHourMetrics
 * @param {Array<Object>} actividadPorHora - Objetos con estructura { hora: number, count: number }.
 * @param {Object|null} horaPico - El objeto de hora pico devuelto por getPeakHour().
 * @description Renderiza la tabla de actividad horaria. Recibe la hora pico desde metrics.js y la usa para destacar la fila correspondiente.
 */
const renderHourMetrics = (actividadPorHora, horaPico) => {
    tbodyHoras.innerHTML = '';

    if (actividadPorHora.length === 0) return;

    actividadPorHora.forEach(item => {
        const row = tbodyHoras.insertRow();

        const esPico = horaPico && item.hora === horaPico.hora;

        const horaFormateada = `${String(item.hora).padStart(2, '0')}:00 - ${String(item.hora).padStart(2, '0')}:59`;
        row.insertCell(0).textContent = esPico ? `${horaFormateada}` : horaFormateada;
        row.insertCell(1).textContent = item.count;

        if (esPico) row.style.fontWeight = 'bold';
    });
};
/**
 * @function renderDayMetrics
 * @param {Array<Object>} top5Dias - Objetos con estructura { fecha: string, count: number }.
 * @param {Array<Object>} actividadPorDiaSemana - Objetos con estructura { diaSemana: string, count: number }.
 * @param {Object|null} diaPico - El objeto de día pico devuelto por getPeakWeekday().
 * @description Renderiza las dos tablas de metricas de días. Recibe el día pico desde metrics.js y lo usa para destacar la fila correspondiente.
 */
const renderDayMetrics = (top5Dias, actividadPorDiaSemana, diaPico) => {
    tbodyTop5Dias.innerHTML = '';
    tbodyDiasSemana.innerHTML = '';

    // --- Top 5 fechas  ---
    top5Dias.forEach((item, index) => {
        const row = tbodyTop5Dias.insertRow();
        row.insertCell(0).textContent = item.fecha;
        row.insertCell(1).textContent = item.count;
    });

    // --- Actividad por día de semana ---
    actividadPorDiaSemana.forEach(item => {
        const row = tbodyDiasSemana.insertRow();

        const esPico = diaPico && item.diaSemana === diaPico.diaSemana;

        row.insertCell(0).textContent = esPico ? `${item.diaSemana}` : item.diaSemana;
        row.insertCell(1).textContent = item.count;

        if (esPico) row.style.fontWeight = 'bold';
    });
};
//FUNCIÓN renderWordCloud ⬇️⬇️⬇️

/**
 * @function renderWordCloud
 * @param {Array<Object>} wordCloudData - Array con { word, count }
 */
const renderWordCloud = (wordCloudData) => {
    const container = document.getElementById('word-cloud');
    if (!container) {
        console.warn('No se encontró el contenedor #word-cloud');
        return;
    }

    container.innerHTML = '';

    if (wordCloudData.length === 0) {
        container.innerHTML = '<p>No hay palabras para mostrar</p>';
        return;
    }

    // Encontrar max count para escalar tamaños
    const maxCount = Math.max(...wordCloudData.map(w => w.count));

    wordCloudData.forEach(item => {
        const span = document.createElement('span');
        span.textContent = item.word;
        span.className = 'word-cloud-item';

        // Tamaño entre 12px y 40px según frecuencia
        const minSize = 12;
        const maxSize = 40;
        const size = minSize + (item.count / maxCount) * (maxSize - minSize);
        span.style.fontSize = `${size}px`;
        span.style.margin = '5px';
        span.style.display = 'inline-block';

        // Título con el conteo exacto
        span.title = `${item.word}: ${item.count} veces`;

        container.appendChild(span);
    });
};

/**
 * SECUENCIA DE INICIO AUTOMÁTICO (ACTIVIDAD 16)
 * Se ejecuta apenas carga el navegador para verificar la salud del backend.
 */
const initApplication = async () => {
    console.log("[SISTEMA] Verificando entorno de red...");
    const response = await connectToBackend();

    if (response !== null) {
        backendDisponible = true;
        console.log("[SISTEMA - READY] Servidor activo. El sistema está listo para recibir el archivo .txt.");
    } else {
        console.warn("[SISTEMA - ADVERTENCIA] No se pudo conectar con el servidor simulado. Las funciones locales de análisis funcionarán pero el backend está offline.");
    }
};

// Arrancamos el control de la Actividad 16 al iniciar la página
document.addEventListener('DOMContentLoaded', initApplication);

const renderEmojiMetrics = (emojiRanking, emojiTop) => {
    tbodyEmojis.innerHTML = '';
    if (!emojiRanking.length) {
        emojiTopDiv.innerHTML =
            '<p>No se detectaron emojis.</p>';
        return;
    }


    emojiRanking.forEach(item => {
        const row = tbodyEmojis.insertRow();

        row.insertCell(0).textContent =
            item.emoji;

        row.insertCell(1).textContent =
            item.count;

        if (item.emoji === emojiTop.emoji) {
            row.style.fontWeight = 'bold';
        }
    });
};



const renderHourChart = (actividadPorHora) => {

    const ctx = document
        .getElementById('chartHoras')
        .getContext('2d');

    if (chartHoras) {
        chartHoras.destroy();
    }

    chartHoras = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: actividadPorHora.map(h =>
                `${String(h.hora).padStart(2, '0')}:00`
            ),
            datasets: [{
                label: 'Mensajes',
                data: actividadPorHora.map(h => h.count)
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Cantidad de mensajes por hora'
                }
            }
        }
    });
};

const renderWeekdayChart = (actividadPorDiaSemana) => {

    const ctx = document
        .getElementById('chartDias')
        .getContext('2d');

    if (chartDias) {
        chartDias.destroy();
    }

    chartDias = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: actividadPorDiaSemana.map(
                d => d.diaSemana
            ),
            datasets: [{
                label: 'Mensajes',
                data: actividadPorDiaSemana.map(
                    d => d.count
                )
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Cantidad de mensajes por día'
                }
            }
        }
    });
};
