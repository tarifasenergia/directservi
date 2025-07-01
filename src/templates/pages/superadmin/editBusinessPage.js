// /templates/pages/superadmin/editBusinessPage.js

import { escapeHTML } from '../../../utils.js';

/**
 * Renderiza la página para editar un negocio específico.
 * @param {object} business - El objeto del negocio a editar, con datos de su compañía.
 * @param {string|null} message - Un mensaje de éxito o error.
 * @returns {string} El HTML de la página de edición.
 */
export const SuperAdminEditBusinessPage = (business, message = null) => {
    if (!business) {
        return `<div class="alert alert-danger">No se encontró el negocio solicitado.</div>`;
    }

    const messageHtml = message ? `<div class="alert alert-info">${escapeHTML(message)}</div>` : '';

    const statusOptions = ['pending_verification', 'active', 'suspended', 'archived']
        .map(status =>
            `<option value="${status}" ${business.status === status ? 'selected' : ''}>
                ${escapeHTML(status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()))}
            </option>`
        ).join('');

    return `
        <div class="row justify-content-center">
            <div class="col-lg-8">
                ${messageHtml}
                <div class="card shadow-sm">
                    <div class="card-header">
                        <h5 class="mb-0">Editando Negocio: ${escapeHTML(business.name)}</h5>
                    </div>
                    <div class="card-body">
                        <form method="POST" action="/superadmin/businesses/edit?id=${business.id}">
                            <div class="mb-3">
                                <label for="business_name" class="form-label">Nombre del Negocio (Marca)</label>
                                <input type="text" id="business_name" name="name" class="form-control" value="${escapeHTML(business.name)}" required>
                            </div>
                            <div class="mb-3">
                                <label for="business_company" class="form-label">Compañía Matriz</label>
                                <input type="text" id="business_company" class="form-control" value="${escapeHTML(business.company?.name || 'N/A')}" disabled readonly>
                            </div>
                            <div class="mb-3">
                                <label for="business_status" class="form-label">Estado del Negocio</label>
                                <select id="business_status" name="status" class="form-select" required>
                                    ${statusOptions}
                                </select>
                                <div class="form-text">
                                    Selecciona 'Active' para que el negocio aparezca en la lista de asignación de administradores.
                                </div>
                            </div>
                             <div class="mb-3">
                                <label for="website_url" class="form-label">URL del Sitio Web (Opcional)</label>
                                <input type="url" id="website_url" name="website_url" class="form-control" value="${escapeHTML(business.website_url || '')}">
                            </div>
                            <div class="d-flex justify-content-between">
                                <a href="/superadmin/businesses" class="btn btn-secondary">Volver al listado</a>
                                <button type="submit" class="btn btn-primary">Guardar Cambios</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
};