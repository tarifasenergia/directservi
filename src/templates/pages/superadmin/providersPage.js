// /templates/pages/superadmin/providersPage.js

import { escapeHTML } from '../../../utils.js';

/**
 * Renderiza la página de gestión de proveedores de energía para el Superadministrador.
 * @param {Array} providers - Lista de todos los proveedores globales.
 * @param {string|null} message - Un mensaje de éxito o error.
 * @returns {string} El HTML de la página.
 */
export const SuperAdminProvidersPage = (providers = [], message = null) => {
    const messageHtml = message ? `<div class="alert alert-info">${escapeHTML(message)}</div>` : '';

    const providerRows = providers.map(p => `
        <tr>
            <td>${escapeHTML(p.id)}</td>
            <td>
                ${p.logo_url ? `<img src="${escapeHTML(p.logo_url)}" alt="Logo ${escapeHTML(p.name)}" style="max-height: 40px; max-width: 120px; object-fit: contain;">` : ''}
            </td>
            <td><strong>${escapeHTML(p.name)}</strong></td>
            <td>
                <a href="#" class="btn btn-sm btn-warning">Editar</a>
            </td>
        </tr>
    `).join('');

    return `
        ${messageHtml}
        <div class="row">
            <div class="col-lg-4">
                <div class="card shadow-sm mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">Añadir Nuevo Proveedor Global</h5>
                    </div>
                    <div class="card-body">
                        <form method="POST" action="/superadmin/providers?action=create_provider">
                            <div class="mb-3">
                                <label for="provider_name" class="form-label">Nombre del Proveedor</label>
                                <input type="text" id="provider_name" name="name" class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label for="logo_url" class="form-label">URL del Logotipo (Opcional)</label>
                                <input type="url" id="logo_url" name="logo_url" class="form-control">
                                <div class="form-text">Pega la URL completa de una imagen del logo.</div>
                            </div>
                            <button type="submit" class="btn btn-primary w-100">Guardar Proveedor</button>
                        </form>
                    </div>
                </div>
            </div>

            <div class="col-lg-8">
                <div class="card shadow-sm">
                    <div class="card-header">
                        <h5 class="mb-0">Lista Maestra de Proveedores</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-striped table-hover">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Logo</th>
                                        <th>Nombre</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${providerRows.length > 0 ? providerRows : `<tr><td colspan="4" class="text-center text-muted">No hay proveedores registrados.</td></tr>`}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};