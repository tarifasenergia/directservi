// /client-scripts.js

/**
 * Contiene todo el código JavaScript que se ejecutará en el lado del cliente.
 * Se exporta como una función que devuelve un string para poder ser inyectado
 * fácilmente en la plantilla del layout.
 * @returns {string} Un string con todo el código JS para el cliente.
 */
export const ClientSideScripts = () => `
  /**
   * Maneja el proceso de logout del usuario.
   * Envía una petición al endpoint /logout del worker y, si tiene éxito,
   * redirige al usuario a la página de inicio de sesión.
   */
  async function logout() {
    try {
      const response = await fetch('/logout', {
        method: 'POST',
      });

      if (response.ok) {
        // Redirige a la página de login una vez que el servidor
        // ha limpiado la cookie de sesión.
        window.location.href = '/login';
      } else {
        console.error('Falló la petición de logout. Estado:', response.status);
        // Incluso si falla, intentamos redirigir por si el problema es de red
        // y la sesión ya no es válida.
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error durante la petición de logout:', error);
      alert('Hubo un problema al cerrar la sesión. Por favor, intente de nuevo.');
    }
  }
`;