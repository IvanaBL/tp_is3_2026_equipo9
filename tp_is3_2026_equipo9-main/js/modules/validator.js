/**
 * @file validator.js
 * @description Módulo para validación de archivos de entrada.
 */

export const validarArchivoChat = (archivo, contenido) => {
    // 1. Validar extensión
    if (!archivo.name.toLowerCase().endsWith('.txt')) {
        throw new Error("El archivo debe ser un formato de texto (.txt).");
    }

    // 2. Validar que no esté vacío
    if (!contenido || contenido.trim().length === 0) {
        throw new Error("El archivo seleccionado está vacío.");
    }

    // 3. Validar formato mínimo de WhatsApp
    const regexWhatsapp = /^\d{1,2}\/\d{1,2}\/\d{2,4}/;
    if (!regexWhatsapp.test(contenido.trim())) {
        throw new Error("El formato no parece ser un chat de WhatsApp válido.");
    }

    return true; // Si llega acá, todo está OK
};