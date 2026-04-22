/**
 * ============================================================
 * GUÍA PARA EL EQUIPO
 * ============================================================
 * 1. INTEGRACIÓN DE VUE: El Array 'mensajesProcesados' es el que 
 * deben vincular al 'data' de la instancia de Vue.
 * 2. BOOTSTRAP: Pueden cambiar las clases en index.html sin miedo, 
 * siempre que mantengan los ID 'chatFile' y 'status'.
 * 3. EXTENSIÓN: Si necesitan métricas nuevas, solicitarlas a Diego
 * para modificar el parser.js sin romper la lógica actual.
 * ============================================================
 */

/**
 * @file app.js
 * @description Controlador principal de la interfaz de usuario. 
 * Gestiona la carga de archivos y coordina con el módulo parser.
 */

import { parsearArchivo } from './modules/parser.js';

// Referencias a elementos del DOM
const fileInput = document.getElementById('chatFile');
const statusDisplay = document.getElementById('status');

/**
 * Evento que se dispara al seleccionar un archivo.
 * Utiliza FileReader para leer el .txt de forma asíncrona.
 */
fileInput.addEventListener('change', async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    const lector = new FileReader();
    
    lector.onload = (evento) => {
        try {
            const contenido = evento.target.result;
            // Ejecución de la lógica de negocio
            const mensajesProcesados = parsearArchivo(contenido);
            
            console.log("Estructura de datos generada:", mensajesProcesados);
            statusDisplay.innerText = `¡Éxito! Se procesaron ${mensajesProcesados.length} mensajes.`;
        } catch (error) {
            console.error("Error al procesar:", error);
            statusDisplay.innerText = "Error crítico al procesar el archivo.";
        }
    };

    lector.readAsText(archivo, 'UTF-8');
});