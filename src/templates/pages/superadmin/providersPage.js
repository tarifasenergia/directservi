// /src/templates/pages/superadmin/providersPage.js

import { escapeHTML } from '../../../utils.js';

const renderPagination = (currentPage, totalItems, pageSize, searchQuery) => {
    if (totalItems <= pageSize) return '';
    const totalPages = Math.ceil(totalItems / pageSize);
    let html = '<nav><ul class="pagination pagination-sm justify-content-end">';

    for (let i = 1; i <= totalPages; i++) {
        const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
        html += `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" href="?page=${i}${searchParam}">${i}</a></li>`;
    }

    html += '</ul></nav>';
    return html;
};

export const SuperAdminProvidersPage = (props) => {
    const { providers, message, currentPage, searchQuery, pageSize } = props;

    const messageHtml = message ? `<div class="alert alert-info alert-dismissible fade show" role="alert">${escapeHTML(message)}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>` : '';

    const providerRows = providers.data.map(p => `
        <tr>
            <td>
                ${p.logo_b64 ? `<img src="${p.logo_b64}" alt="Logo ${escapeHTML(p.name)}" style="max-height: 40px; max-width: 120px; object-fit: contain; background-color: #f8f9fa; padding: 2px; border-radius: 4px;">` : ''}
            </td>
            <td><strong>${escapeHTML(p.name)}</strong></td>
            <td><small class="text-muted">${escapeHTML(p.notes || '')}</small></td>
            <td class="d-flex gap-1">
                <button type="button" class="btn btn-sm btn-warning edit-provider-btn"
                        data-bs-toggle="modal" data-bs-target="#providerModal"
                        data-id="${p.id}"
                        data-name="${escapeHTML(p.name)}"
                        data-notes="${escapeHTML(p.notes || '')}"
                        data-logo="${p.logo_b64 || ''}">
                    Editar
                </button>
                <form action="/superadmin/providers?action=delete_provider" method="POST" class="d-inline" onsubmit="return confirm('¿Estás seguro de que quieres eliminar este proveedor?')">
                    <input type="hidden" name="id" value="${p.id}">
                    <button type="submit" class="btn btn-sm btn-danger">Eliminar</button>
                </form>
            </td>
        </tr>
    `).join('');

    return `
        ${messageHtml}
        <div class="card shadow-sm">
            <div class="card-header bg-light d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Lista Maestra de Proveedores</h5>
                <button class="btn btn-primary btn-sm" id="createProviderBtn" data-bs-toggle="modal" data-bs-target="#providerModal">
                    + Añadir Proveedor
                </button>
            </div>
            <div class="card-body">
                <form method="GET" action="/superadmin/providers" class="mb-3">
                    <div class="input-group">
                        <input type="text" name="search" class="form-control" placeholder="Buscar por nombre..." value="${escapeHTML(searchQuery)}">
                        <button class="btn btn-outline-secondary" type="submit">Buscar</button>
                    </div>
                </form>
                <div class="table-responsive">
                    <table class="table table-striped table-hover align-middle">
                        <thead>
                            <tr><th>Logo</th><th>Nombre</th><th>Observaciones</th><th>Acciones</th></tr>
                        </thead>
                        <tbody>
                            ${providerRows.length > 0 ? providerRows : `<tr><td colspan="4" class="text-center text-muted">No hay proveedores registrados.</td></tr>`}
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="card-footer bg-light">
                ${renderPagination(currentPage, providers.count || 0, pageSize, searchQuery)}
            </div>
        </div>

        <!-- Modal para Crear/Editar Proveedor -->
        <div class="modal fade" id="providerModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <form id="providerForm" method="POST">
                        <div class="modal-header">
                            <h5 class="modal-title" id="providerModalLabel"></h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <input type="hidden" id="provider_id_input" name="id">
                            <div class="mb-3">
                                <label for="provider_name_input" class="form-label">Nombre del Proveedor</label>
                                <input type="text" class="form-control" id="provider_name_input" name="name" required>
                            </div>
                            <div class="mb-3">
                                <label for="provider_notes_input" class="form-label">Observaciones (Opcional)</label>
                                <textarea class="form-control" id="provider_notes_input" name="notes" rows="3"></textarea>
                            </div>
                            <div class="mb-3">
                                <label for="logo_file_input" class="form-label">Logotipo</label>
                                <input type="file" class="form-control logo-file-input" id="logo_file_input" accept="image/*" onchange="previewLogo(event)">
                                <input type="hidden" name="logo_b64" class="logo-b64-hidden" id="logo_b64_hidden">
                                <img id="logo_preview_img" src="#" alt="Previsualización" class="img-fluid rounded mt-2 d-none logo-preview-img" style="max-height: 75px;"/>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="submit" class="btn btn-primary" id="providerSubmitBtn"></button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
};