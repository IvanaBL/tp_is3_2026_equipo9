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

// --- Espacio para futuras métricas de tiempo ---
// Agrupación por hora (Pending)
// Agrupación por día (Pending)