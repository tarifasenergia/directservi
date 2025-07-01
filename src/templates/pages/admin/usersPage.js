// /templates/pages/admin/usersPage.js

import { escapeHTML } from '../../../utils.js';

/**
 * Renderiza la página de gestión de usuarios para el Administrador del negocio.
 * @param {Array} users - Lista de usuarios que pertenecen al negocio del admin.
 * @param {Array} roles - Lista de roles disponibles que el admin puede asignar (ej. vendedor, tramitador).
 * @param {string|null} message - Un mensaje de éxito o error.
 * @returns {string} El HTML de la página.
 */
export const AdminUsersPage = (users = [], roles = [], message = null) => {
    const messageHtml = message ? `<div class="alert alert-info">${escapeHTML(message)}</div>` : '';

    // Filtramos los roles para que un admin no pueda crear superadmins o a sí mismo.
    const roleOptions = roles
        .filter(r => r.name === 'vendedor' || r.name === 'tramitador')
        .map(r => `<option value="${r.id}">${escapeHTML(r.name.charAt(0).toUpperCase() + r.name.slice(1))}</option>`)
        .join('');

    const userRows = users.map(user => `
        <tr>
            <td>${escapeHTML(user.full_name || 'N/A')}</td>
            <td>${escapeHTML(user.email)}</td>
            <td><span class="badge bg-primary">${escapeHTML(user.role.name)}</span></td>
            <td>
                <span class="badge bg-${user.is_active ? 'success' : 'danger'}">
                    ${user.is_active ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td>
                <a href="/admin/users/edit?id=${user.id}" class="btn btn-sm btn-warning">Editar</a>
            </td>
        </tr>
    `).join('');

    return `
        ${messageHtml}
        <div class="row">
            <div class="col-lg-4">
                <div class="card shadow-sm mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">Crear Nuevo Usuario de Equipo</h5>
                    </div>
                    <div class="card-body">
                        <form method="POST" action="/admin/users?action=create_user">
                            <div class="mb-3">
                                <label for="role_id" class="form-label">Rol del Usuario</label>
                                <select id="role_id" name="role_id" class="form-select" required>
                                    <option value="">Selecciona un rol...</option>
                                    ${roleOptions}
                                </select>
                            </div>
                             <div class="mb-3">
                                <label for="full_name" class="form-label">Nombre Completo</label>
                                <input type="text" id="full_name" name="full_name" class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label for="email" class="form-label">Email (Login)</label>
                                <input type="email" id="email" name="email" class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label for="password" class="form-label">Contraseña Temporal</label>
                                <input type="password" id="password" name="password" class="form-control" required>
                            </div>
                            <button type="submit" class="btn btn-primary w-100">Crear Usuario</button>
                        </form>
                    </div>
                </div>
            </div>

            <div class="col-lg-8">
                <div class="card shadow-sm">
                    <div class="card-header">
                        <h5 class="mb-0">Mi Equipo</h5>
                    </div>
                    <div class="card-body">
                         <div class="table-responsive">
                            <table class="table table-striped table-hover">
                                <thead>
                                    <tr>
                                        <th>Nombre Completo</th>
                                        <th>Email</th>
                                        <th>Rol</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${userRows.length > 0 ? userRows : `<tr><td colspan="5" class="text-center text-muted">No has creado ningún usuario para tu equipo.</td></tr>`}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};