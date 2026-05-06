/**
 * @module Metrics
 * @description 
 * Este módulo centraliza la lógica de análisis estadístico del chat.
 * Se utiliza una arquitectura basada en POJOs (Plain Old JavaScript Objects) 
 * para garantizar la escalabilidad y facilitar el manejo de datos estructurados.
 */

/**
 * Identificación de usuarios.
 * Extrae una lista única de todos los participantes que aparecen en el chat.
 * @param {Array<Object>} messages - Array de mensajes proveniente del parser.
 * @returns {Array<string>} Lista de nombres o números de los participantes.
 */
export const getParticipants = (messages) => {
    // Usamos Set para obtener valores únicos de forma eficiente
    return [...new Set(messages.map(m => m.remitente))];
};

/**
 * Conteo de mensajes.
 * Calcula la cantidad de mensajes enviados por cada usuario y genera un ranking.
 * @param {Array<Object>} messages - Array de mensajes proveniente del parser.
 * @returns {Array<Object>} Ranking ordenado: { name: string, count: number }
 */
export const getMessageCountByUser = (messages) => {
    const userMap = {};

    messages.forEach(msg => {
        const user = msg.remitente;
        userMap[user] = (userMap[user] || 0) + 1;
    });

    return Object.keys(userMap).map(userName => ({
        name: userName,
        count: userMap[userName]
    })).sort((a, b) => b.count - a.count);
};

// --- métricas de tiempo ---
/**
 * Cantidad de mensajes por hora del día.
 * Agrupa los mensajes por hora del día (0 a 23) y cuenta cuántos hay en cada franja.
 * @param {Array<Object>} messages - Array de mensajes proveniente del parser.
 * @returns {Array<Object>} Array de 24 elementos ordenados de 0 a 23: { hora: number, count: number }
 */
export const getMessageCountByHour = (messages) => {
    // Inicializamos las 24 horas en 0 para garantizar que todas estén presentes en el resultado
    const hourMap = {};
    for (let h = 0; h < 24; h++) {
        hourMap[h] = 0;
    }
 
    messages.forEach(msg => {
        
        const hora = msg.timestamp.getHours();
        hourMap[hora] += 1;
    });
 
    return Array.from({ length: 24 }, (_, h) => ({
        hora: h,
        count: hourMap[h]
    }));
};
 
/**
 * Hora con mayor actividad del chat.
 * Devuelve la franja horaria con más mensajes. Depende de getMessageCountByHour.
 * @param {Array<Object>} messages - Array de mensajes proveniente del parser.
 * @returns {Object} El elemento con mayor actividad: { hora: number, count: number }
 */
export const getPeakHour = (messages) => {
    const actividadPorHora = getMessageCountByHour(messages);
    return actividadPorHora.reduce((pico, actual) => actual.count > pico.count ? actual : pico);
};