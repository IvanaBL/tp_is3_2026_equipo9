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
import { getParticipants, getMessageCountByUser, getMessageCountByHour, getPeakHour, getTop5DaysByDate, getMessageCountByWeekday, getPeakWeekday, getWordCloudData, getEmojiRanking, getTopEmoji } from './modules/metrics.js';
import { validarArchivoChat } from './modules/validator.js'; // Nueva importación

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
            //const mensajesProcesados = parsearArchivo(contenido);

            const textoPrueba = `01/06/2026, 08:10 - Lucia: Buen día equipo 😊
01/06/2026, 08:11 - Martin: Buen día
01/06/2026, 08:12 - Sofia: Hola a todos
01/06/2026, 08:15 - Lucia: ¿Cómo viene el proyecto?
01/06/2026, 08:18 - Martin: Avanzando bastante
01/06/2026, 08:20 - Sofia: Ya terminé la documentación
01/06/2026, 09:05 - Lucia: Excelente 🚀
01/06/2026, 09:10 - Martin: Hoy sigo con el dashboard
01/06/2026, 09:15 - Sofia: Yo reviso los errores
01/06/2026, 09:30 - Lucia: Perfecto

02/06/2026, 10:00 - Martin: ¿Vieron el último commit?
02/06/2026, 10:02 - Sofia: Sí, quedó muy bien
02/06/2026, 10:05 - Lucia: Lo estoy probando ahora
02/06/2026, 10:08 - Martin: Encontré un bug pequeño
02/06/2026, 10:10 - Sofia: ¿Dónde aparece?
02/06/2026, 10:12 - Martin: En el ranking de mensajes
02/06/2026, 10:15 - Lucia: Lo reviso
02/06/2026, 10:20 - Sofia: Después pruebo la nube de palabras ☁️
02/06/2026, 10:25 - Martin: Buenísimo
02/06/2026, 10:30 - Lucia: Ya encontré la causa

03/06/2026, 14:00 - Sofia: Subí cambios al repositorio
03/06/2026, 14:05 - Lucia: Los veo ahora
03/06/2026, 14:10 - Martin: Voy a hacer pruebas
03/06/2026, 14:15 - Sofia: También agregué validaciones
03/06/2026, 14:20 - Lucia: Excelente trabajo 👏
03/06/2026, 14:25 - Martin: Todo compila correctamente
03/06/2026, 14:30 - Sofia: Perfecto
03/06/2026, 15:00 - Lucia: ¿Probamos con datos reales?
03/06/2026, 15:10 - Martin: Sí
03/06/2026, 15:15 - Sofia: Dale

04/06/2026, 18:00 - Lucia: Estoy cargando un chat grande
04/06/2026, 18:05 - Martin: ¿Cuántos mensajes tiene?
04/06/2026, 18:08 - Lucia: Más de mil
04/06/2026, 18:10 - Sofia: Va a servir para las métricas
04/06/2026, 18:15 - Martin: dashboard dashboard dashboard
04/06/2026, 18:20 - Lucia: html javascript html
04/06/2026, 18:25 - Sofia: css html javascript
04/06/2026, 18:30 - Martin: parser parser parser
04/06/2026, 18:35 - Lucia: metrics metrics
04/06/2026, 18:40 - Sofia: validator validator

05/06/2026, 11:00 - Martin: <Multimedia omitido>
05/06/2026, 11:05 - Lucia: Recibido 👍
05/06/2026, 11:10 - Sofia: Lo estoy mirando
05/06/2026, 11:15 - Martin: Se eliminó este mensaje.
05/06/2026, 11:20 - Lucia: ¿Todo bien?
05/06/2026, 11:22 - Sofia: Sí, sin problemas
05/06/2026, 11:25 - Martin: Perfecto 😄
05/06/2026, 11:30 - Lucia: Seguimos entonces
05/06/2026, 11:35 - Sofia: Vamos
05/06/2026, 11:40 - Martin: Excelente

06/06/2026, 20:00 - Sofia: Ya casi terminamos
06/06/2026, 20:05 - Lucia: Falta la presentación
06/06/2026, 20:10 - Martin: Yo hago las diapositivas
06/06/2026, 20:15 - Sofia: Gracias 😊
06/06/2026, 20:20 - Lucia: Después revisamos todo
06/06/2026, 20:25 - Martin: Perfecto
06/06/2026, 20:30 - Sofia: Buen trabajo equipo 🚀
06/06/2026, 20:35 - Lucia: Nos vemos mañana
06/06/2026, 20:40 - Martin: Hasta mañana
06/06/2026, 20:45 - Sofia: Chau 👋   `;
const mensajesProcesados = parsearArchivo(textoPrueba); 
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
            renderEmojiMetrics(emojiRanking,emojiTop);
			
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

const renderEmojiMetrics = (emojiRanking,emojiTop) => {
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




