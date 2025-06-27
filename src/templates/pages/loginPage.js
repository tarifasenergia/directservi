// /templates/pages/loginPage.js

import { escapeHTML } from '../../utils.js';

/**
 * Renderiza el formulario de inicio de sesión.
 * @param {string | null} error - Un mensaje de error para mostrar, si lo hay.
 * @returns {string} El HTML del formulario de login.
 */
export const LoginPage = (error = null) => {
  const errorHtml = error ? `<div class="alert alert-danger" role="alert">${escapeHTML(error)}</div>` : '';

  return `
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-4">
        <div class="card shadow-sm">
          <div class="card-body p-4">
            <h2 class="card-title text-center mb-4">Iniciar Sesión</h2>
            ${errorHtml}
            <form method="POST" action="/login">
              <div class="mb-3">
                <label for="email" class="form-label">Correo Electrónico:</label>
                <input type="email" class="form-control" id="email" name="email" required>
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Contraseña:</label>
                <input type="password" class="form-control" id="password" name="password" required>
              </div>
              <button type="submit" class="btn btn-primary w-100">Acceder</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;
};