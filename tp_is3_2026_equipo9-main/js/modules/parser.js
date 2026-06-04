/**
 * @module Parser
 * @description Módulo encargado de procesar archivos de texto plano exportados de WhatsApp.
 */

/**
 * Procesa el contenido de un chat de WhatsApp y lo convierte en una estructura de objetos.
 * @param {string} contenidoTexto - El contenido bruto del archivo .txt.
 * @returns {Array<Object>} Lista de mensajes procesados con formato: 
 * {fecha, hora, remitente, contenido, esMultimedia, esEliminado, timestamp}
 */
export const parsearArchivo = (contenidoTexto) => {
    const lineas = contenidoTexto.split('\n');
    const mensajes = [];
    
    // Regex: Define el patrón D/M/YYYY, HH:MM - Nombre: Mensaje
    const regexMensaje = /^(\d{1,2}\/\d{1,2}\/\d{4}),\s(\d{2}:\d{2})\s-\s([^:]+):\s(.*)/;

    // MODIFICACIÓN ACT 9: Regex para identificar mensajes de sistema
    const regexSistema = /^(\d{1,2}\/\d{1,2}\/\d{4}),\s(\d{2}:\d{2})\s-\s/;

    let saltarSiguientesLineas = false;

    lineas.forEach(linea => {
        const match = linea.match(regexMensaje);
        
        if (match) {
            const [ , fecha, hora, remitente, contenido] = match;
            
            // Reset de bandera al encontrar un mensaje de usuario válido
            saltarSiguientesLineas = false;

            // Regla M5: Limpieza de etiquetas de edición
            const contenidoLimpio = contenido.replace(' <Se editó este mensaje.>', '');

            mensajes.push({
                fecha,
                hora,
                remitente,
                contenido: contenidoLimpio,
                esMultimedia: contenido.includes("<Multimedia omitido>"),
                esEliminado: contenido.includes("Se eliminó este mensaje."),
                timestamp: generarDate(fecha, hora)
            });
        } 
        // MODIFICACIÓN ACT 9: Descarte de mensajes de sistema
        else if (regexSistema.test(linea)) {
            saltarSiguientesLineas = true;
        }
        else {
            // Soporte para mensajes multilínea optimizado
            if (mensajes.length > 0 && linea.trim() !== "" && !saltarSiguientesLineas) {
                // Usamos \n para mantener el formato original del mensaje
                mensajes[mensajes.length - 1].contenido += "\n" + linea.trim();
            }
        }
    });

    return mensajes;
};

/**
 * Convierte strings de fecha y hora en un objeto Date de JavaScript.
 * @private
 * @param {string} fecha - Formato D/M/YYYY
 * @param {string} hora - Formato HH:MM
 * @returns {Date} Objeto de fecha nativo.
 */
const generarDate = (fecha, hora) => {
    const [dia, mes, anio] = fecha.split('/').map(Number); // Actualizacion para conversion explicita
    const [hrs, min] = hora.split(':').map(Number); // Actualizacion para conversion explicita
    return new Date(anio, mes - 1, dia, hrs, min);
};