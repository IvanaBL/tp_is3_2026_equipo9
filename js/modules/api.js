/**
 * @file api.js
 * @description Módulo de infraestructura de red y servicios de integración de datos.
 * @module modules/api
 * * @remarks
 * Este módulo centraliza la capa de comunicación externa (API) de la aplicación,
 * estructurado en dos grandes bloques de integración:
 * * 1. LOGÍSTICA DE LAS ACTIVIDADES 16 y 17
 * - ACTIVIDAD 16 (Conexión asincrónica HTTP): Establece y valida el canal de comunicación
 * inicial mediante una petición 'fetch'. En esta etapa de desarrollo local, opera como una
 * CONEXIÓN SIMULADA (Mocking) apuntando al recurso local 'mock_messages.json' mediante
 * el servidor de desarrollo (Live Server), garantizando un retorno Status 200 OK de red.
 * - ACTIVIDAD 17 (Serialización): Procesa las estructuras de datos vivas en memoria (POJOs) 
 * generadas por el parser local y las transforma dinámicamente en una cadena de texto
 * estructurada (JSON String).
 * * 2. INFRAESTRUCTURA CRUD DE PERSISTENCIA (Preparado para entorno real en la nube):
 * Define las plantillas de servicios asincrónicos completas bajo arquitectura RESTful
 * utilizando la constante global 'API_BASE_URL' para futuras integraciones de red:
 * - CREATE [POST]: Método preparado para empujar el JSON de la Act 17 hacia el servidor.
 * - READ [GET]: Métodos preparados para recuperar listados e historiales desde la base de datos.
 * - UPDATE [PUT]: Método preparado para modificar metadatos de análisis guardados.
 * - DELETE [DELETE]: Método preparado para remover historiales del servidor remoto de forma permanente.
 */

// URL Base del servidor real (Reemplazar cuando el Backend esté en la nube)
const API_BASE_URL = 'https://api.tuanalizadorchat.com/v1';

/**
 * ACTIVIDAD 16: Establece y valida el canal de comunicación asincrónico con el servidor.
 * (Actualmente apunta a una simulación local / Mock)
 */
export const connectToBackend = async () => {
    try {
        const response = await fetch('./data/mock_messages.json');

        if (!response.ok) {
            throw new Error(`Error de servidor. Status: ${response.status}`);
        }

        return response; // Retorna la respuesta exitosa
    } catch (error) {
        console.error("[FALLA CRÍTICA DE RED] No se pudo conectar con el servidor:", error.message);
        return null;
    }
};

/**
 * ACTIVIDAD 17: Serializa estructuras de datos en memoria (POJOs) al estándar JSON.
 */
export const convertPojoToJson = (dataObjects) => {
    try {
        if (!dataObjects || (Array.isArray(dataObjects) && dataObjects.length === 0)) {
            throw new Error("No hay datos válidos para transformar.");
        }
        // Retorna el String formateado con 2 espacios de indentación para legibilidad
        return JSON.stringify(dataObjects, null, 2);
    } catch (error) {
        console.error("[ERROR SERIALIZACIÓN] Falló la conversión a JSON:", error.message);
        return null;
    }
};

/* ====================================================================
   INFRAESTRUCTURA DE EXPORTACIÓN: CRUD (PREPARADO PARA EL FUTURO)
   ==================================================================== */

/**
 * [C]RUD - CREATE (POST): Envía el JSON al servidor.
 * @param {string} jsonString - Cadena JSON con los mensajes estructurados.
 */
export const guardarChatEnServidor = async (jsonString) => {
    try {
        console.log("[API - POST] Intentando guardar el historial en la nube...");

        const response = await fetch(`${API_BASE_URL}/chats`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
                // Aquí iría el token de seguridad si el usuario inició sesión:
                // 'Authorization': 'Bearer TOKEN_SECRETO'
            },
            body: jsonString // Mandamos el JSON que
        });

        if (!response.ok) throw new Error(`Error al guardar. Status: ${response.status}`);

        const data = await response.json();
        console.log("[API - ÉXITO] Historial respaldado en base de datos remoto.");
        return data; // Retorna la confirmación del servidor (ej: {id: 123, status: "saved"})
    } catch (error) {
        console.error("[API - ERROR POST] No se pudo enviar el JSON:", error.message);
        return null;
    }
};

/**
 * C[R]UD - READ (GET): Trae una lista de todos los chats guardados previamente.
 */
export const obtenerTodosLosChats = async () => {
    try {
        console.log("[API - GET] Solicitando lista de historiales guardados...");

        const response = await fetch(`${API_BASE_URL}/chats`);
        if (!response.ok) throw new Error(`Error al traer lista. Status: ${response.status}`);

        return await response.json(); // Retorna un array con el índice de chats guardados
    } catch (error) {
        console.error("[API - ERROR GET LIST] Falló la carga del historial:", error.message);
        return null;
    }
};

/**
 * C[R]UD - READ SINGLE (GET): Trae los mensajes de un chat específico por su ID.
 * @param {string} chatId - ID único del chat en la base de datos.
 */
export const obtenerDetalleDeChat = async (chatId) => {
    try {
        console.log(`[API - GET] Buscando mensajes del chat ID: ${chatId}...`);

        const response = await fetch(`${API_BASE_URL}/chats/${chatId}`);
        if (!response.ok) throw new Error(`Error al traer detalle. Status: ${response.status}`);

        return await response.json(); // Retorna el JSON original para volver a procesar métricas
    } catch (error) {
        console.error(`[API - ERROR GET ITEM] No se encontró el chat ${chatId}:`, error.message);
        return null;
    }
};

/**
 * CR[U]D - UPDATE (PUT): Modifica datos de un análisis (ej: cambiar el nombre asignado al chat).
 * @param {string} chatId - ID del chat a modificar.
 * @param {Object} nuevosDatos - Objeto con los campos a actualizar
 */
export const actualizarMetadatosChat = async (chatId, nuevosDatos) => {
    try {
        console.log(`[API - PUT] Actualizando información del chat ID: ${chatId}...`);

        const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevosDatos)
        });

        if (!response.ok) throw new Error(`Error al actualizar. Status: ${response.status}`);

        return await response.json();
    } catch (error) {
        console.error(`[API - ERROR PUT] No se pudo actualizar el chat ${chatId}:`, error.message);
        return null;
    }
};

/**
 * CRU[D] - DELETE (DELETE): Elimina permanentemente un chat de la base de datos remota.
 * @param {string} chatId - ID del chat a eliminar.
 */
export const eliminarChatDelServidor = async (chatId) => {
    try {
        console.log(`[API - DELETE] Solicitando eliminación del chat ID: ${chatId}...`);

        const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error(`Error al eliminar. Status: ${response.status}`);

        console.log(`[API - ÉXITO] El chat ${chatId} fue removido de la base de datos.`);
        return true;
    } catch (error) {
        console.error(`[API - ERROR DELETE] No se pudo borrar el chat ${chatId}:`, error.message);
        return false;
    }
};