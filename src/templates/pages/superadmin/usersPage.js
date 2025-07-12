// /src/templates/pages/superadmin/usersPage.js

import { escapeHTML } from '../../../utils.js';

const renderPagination = (currentPage, totalItems, pageSize, params) => {
    if (totalItems <= pageSize) return '';
    const totalPages = Math.ceil(totalItems / pageSize);
    let html = '<nav><ul class="pagination pagination-sm justify-content-end">';

    const urlParams = new URLSearchParams(params);
    
    for (let i = 1; i <= totalPages; i++) {
        urlParams.set('page', i);
        const activeClass = i === currentPage ? 'active' : '';
        html += `<li class="page-item ${activeClass}"><a class="page-link" href="?${urlParams.toString()}">${i}</a></li>`;
    }

    html += '</ul></nav>';
    return html;
};

export const SuperAdminUsersPage = (props) => {
    const { users, roles, companiesForFilter, businessesForForm, message, currentPage, searchQuery, roleFilter, companyFilter, pageSize } = props;
    
    const messageHtml = message ? `<div class="alert alert-info alert-dismissible fade show" role="alert">${escapeHTML(message)}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>` : '';

    const roleOptions = roles.map(r => `<option value="${r.id}" data-name="${r.name}">${escapeHTML(r.name.charAt(0).toUpperCase() + r.name.slice(1))}</option>`).join('');
    const businessOptions = businessesForForm.map(b => `<option value="${b.id}">${escapeHTML(b.name)}</option>`).join('');
    
    const roleFilterOptions = roles.map(r => `<option value="${r.name}" ${roleFilter === r.name ? 'selected' : ''}>${escapeHTML(r.name.charAt(0).toUpperCase() + r.name.slice(1))}</option>`).join('');
    const companyFilterOptions = companiesForFilter.map(c => `<option value="${c.id}" ${companyFilter == c.id ? 'selected' : ''}>${escapeHTML(c.name)}</option>`).join('');

    const userRows = users.data.map(u => `
        <tr>
            <td>
                <strong>${escapeHTML(u.full_name || 'N/A')}</strong><br>
                <small class="text-muted">${escapeHTML(u.email)}</small>
            </td>
            <td>${escapeHTML(u.role_name)}</td>
            <td>${escapeHTML(u.business_name || 'N/A')}</td>
            <td>${escapeHTML(u.company_name || 'N/A')}</td>
            <td><span class="badge bg-${u.is_active ? 'success' : 'danger'}">${u.is_active ? 'Activo' : 'Inactivo'}</span></td>
            <td class="d-flex gap-1">
                <button type="button" class="btn btn-sm btn-warning" data-bs-toggle="modal" data-bs-target="#userModal" data-id="${u.id}">
                    Editar
                </button>
                <form action="/superadmin/users?action=delete_user" method="POST" class="d-inline" onsubmit="return confirm('¿Estás seguro de que quieres eliminar a este usuario permanentemente?')">
                    <input type="hidden" name="id" value="${u.id}">
                    <button type="submit" class="btn btn-sm btn-danger">Eliminar</button>
                </form>
            </td>
        </tr>
    `).join('');

    return `
        ${messageHtml}

        <div class="card shadow-sm">
            <div class="card-header bg-light d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Gestión de todos los Usuarios</h5>
                <button class="btn btn-primary btn-sm" id="createUserBtn" data-bs-toggle="modal" data-bs-target="#userModal">
                    + Crear Usuario
                </button>
            </div>
            <div class="card-body">
                <form method="GET" action="/superadmin/users" class="mb-3">
                    <div class="row g-2">
                        <div class="col-md-5"><input type="text" name="search" class="form-control" placeholder="Buscar por nombre, email, negocio..." value="${escapeHTML(searchQuery)}"></div>
                        <div class="col-md-2"><select name="role" class="form-select"><option value="">Todos los roles</option>${roleFilterOptions}</select></div>
                        <div class="col-md-3"><select name="company" class="form-select"><option value="">Todas las compañías</option>${companyFilterOptions}</select></div>
                        <div class="col-md-2"><button class="btn btn-outline-secondary w-100" type="submit">Filtrar</button></div>
                    </div>
                </form>
                <div class="table-responsive">
                    <table class="table table-striped table-hover align-middle">
                        <thead><tr><th>Usuario</th><th>Rol</th><th>Negocio</th><th>Compañía</th><th>Estado</th><th>Acciones</th></tr></thead>
                        <tbody>${userRows.length > 0 ? userRows : `<tr><td colspan="6" class="text-center text-muted fst-italic py-3">No se encontraron usuarios.</td></tr>`}</tbody>
                    </table>
                </div>
            </div>
            <div class="card-footer bg-light">
                ${renderPagination(currentPage, users.count || 0, pageSize, { search: searchQuery, role: roleFilter, company: companyFilter })}
            </div>
        </div>
        
        <!-- Modal para Crear/Editar Usuario -->
        <div class="modal fade" id="userModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <form id="userForm" method="POST">
                        <div class="modal-header"><h5 class="modal-title" id="userModalLabel"></h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
                        <div class="modal-body">
                            <input type="hidden" id="user_id_input" name="id">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="full_name_input" class="form-label">Nombre Completo</label>
                                    <input type="text" class="form-control" id="full_name_input" name="full_name" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="email_input" class="form-label">Email (Login)</label>
                                    <input type="email" class="form-control" id="email_input" name="email" required>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="role_id_select" class="form-label">Rol</label>
                                    <select class="form-select" id="role_id_select" name="role_id" required><option value="">Seleccione...</option>${roleOptions}</select>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="business_id_select" class="form-label">Negocio (Canal)</label>
                                    <select class="form-select" id="business_id_select" name="business_id"><option value="">Ninguno (Superadmin)</option>${businessOptions}</select>
                                    <div class="form-text">Solo asignar negocio a roles de Admin, Vendedor o Tramitador.</div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="password_input" class="form-label">Nueva Contraseña</label>
                                    <input type="password" class="form-control" id="password_input" name="password" placeholder="Dejar en blanco para no cambiar">
                                </div>
                                <div class="col-md-6 mb-3">
                                     <label class="form-label">Estado</label>
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" role="switch" id="is_active_check" name="is_active" value="true">
                                        <label class="form-check-label" for="is_active_check">Activo</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button><button type="submit" class="btn btn-primary" id="userSubmitBtn"></button></div>
                    </form>
                </div>
            </div>
        </div>
    `;
};