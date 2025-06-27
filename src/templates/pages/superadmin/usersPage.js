// /templates/pages/superadmin/usersPage.js

import { escapeHTML } from '../../../utils.js';

/**
 * Renderiza la página de gestión de Administradores para el Superadministrador.
 * @param {Array} businesses - Lista de todos los negocios disponibles para asignar un admin.
 * @param {string|null} message - Un mensaje de éxito o error.
 * @returns {string} El HTML de la página.
 */
export const SuperAdminUsersPage = (businesses = [], message = null) => {
    const messageHtml = message ? `<div class="alert alert-info">${escapeHTML(message)}</div>` : '';

    const businessOptions = businesses
        .filter(b => b.status === 'active') // Asumimos que solo se pueden asignar admins a negocios activos
        .map(b => `<option value="${b.id}">${escapeHTML(b.name)}</option>`)
        .join('');

    return `
        ${messageHtml}
        <div class="row justify-content-center">
            <div class="col-lg-8">
                <div class="card shadow-sm">
                    <div class="card-header">
                        <h5 class="mb-0">Crear Nuevo Administrador de Negocio</h5>
                    </div>
                    <div class="card-body">
                        <p class="card-text small text-muted">
                            Este formulario crea un nuevo usuario en el sistema con el rol de "admin" y lo asigna
                            al negocio que selecciones. Este usuario podrá entonces acceder a su propio panel
                            para gestionar su equipo y tarifas.
                        </p>
                        <form method="POST" action="/superadmin/users?action=create_admin">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="business_id" class="form-label">Asignar al Negocio:</label>
                                    <select id="business_id" name="business_id" class="form-select" required>
                                        <option value="">Selecciona un negocio...</option>
                                        ${businessOptions}
                                    </select>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="full_name" class="form-label">Nombre Completo del Admin:</label>
                                    <input type="text" id="full_name" name="full_name" class="form-control" required>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="email" class="form-label">Email del Admin (será su login):</label>
                                    <input type="email" id="email" name="email" class="form-control" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="password" class="form-label">Contraseña Temporal:</label>
                                    <input type="password" id="password" name="password" class="form-control" required>
                                </div>
                            </div>
                            <button type="submit" class="btn btn-primary w-100">Crear Administrador</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
};