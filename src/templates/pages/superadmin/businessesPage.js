// /templates/pages/superadmin/businessesPage.js

import { escapeHTML } from '../../../utils.js';

/**
 * Renderiza la página de gestión de Negocios y Compañías para el Superadministrador.
 * @param {Array} companies - Lista de todas las compañías disponibles.
 * @param {Array} businesses - Lista de todos los negocios existentes.
 * @param {string|null} message - Un mensaje de éxito o error para mostrar.
 * @returns {string} El HTML de la página.
 */
export const SuperAdminBusinessesPage = (companies = [], businesses = [], message = null) => {
    const messageHtml = message ? `<div class="alert alert-info">${escapeHTML(message)}</div>` : '';

    // Opciones del <select> para compañías
    const companyOptions = companies.map(c =>
        `<option value="${c.id}">${escapeHTML(c.name)} (${escapeHTML(c.cif)})</option>`
    ).join('');

    // Filas de la tabla para los negocios existentes
    const businessRows = businesses.map(b => `
        <tr>
            <td>${escapeHTML(b.id)}</td>
            <td><strong>${escapeHTML(b.name)}</strong></td>
            <td>${escapeHTML(b.company?.name || 'N/A')}</td>
            <td><span class="badge bg-secondary">${escapeHTML(b.status)}</span></td>
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
                        <h5 class="mb-0">1. Crear Nueva Compañía</h5>
                    </div>
                    <div class="card-body">
                        <p class="card-text small text-muted">Crea primero la entidad legal/fiscal (la compañía matriz).</p>
                        <form method="POST" action="/superadmin/businesses?action=create_company">
                            <div class="mb-3">
                                <label for="company_name" class="form-label">Nombre Legal de la Compañía</label>
                                <input type="text" id="company_name" name="name" class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label for="company_cif" class="form-label">CIF</label>
                                <input type="text" id="company_cif" name="cif" class="form-control" required>
                            </div>
                             <div class="mb-3">
                                <label for="company_address" class="form-label">Dirección Fiscal</label>
                                <textarea id="company_address" name="address" class="form-control" rows="2"></textarea>
                            </div>
                            <button type="submit" class="btn btn-secondary w-100">Guardar Compañía</button>
                        </form>
                    </div>
                </div>

                <div class="card shadow-sm">
                    <div class="card-header">
                        <h5 class="mb-0">2. Crear Nuevo Negocio (Canal)</h5>
                    </div>
                    <div class="card-body">
                        <p class="card-text small text-muted">Crea el "negocio" o canal de ventas y asígnalo a una compañía.</p>
                        <form method="POST" action="/superadmin/businesses?action=create_business">
                            <div class="mb-3">
                                <label for="business_company" class="form-label">Compañía a la que pertenece</label>
                                <select id="business_company" name="company_id" class="form-select" required>
                                    <option value="">Selecciona una compañía...</option>
                                    ${companyOptions}
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="business_name" class="form-label">Nombre del Negocio (Marca Comercial)</label>
                                <input type="text" id="business_name" name="name" class="form-control" required>
                            </div>
                            <button type="submit" class="btn btn-primary w-100">Guardar Negocio</button>
                        </form>
                    </div>
                </div>
            </div>

            <div class="col-lg-8">
                <div class="card shadow-sm">
                    <div class="card-header">
                        <h5 class="mb-0">Negocios Registrados</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-striped table-hover">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nombre del Negocio</th>
                                        <th>Compañía Matriz</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${businessRows.length > 0 ? businessRows : `<tr><td colspan="5" class="text-center text-muted">No hay negocios registrados.</td></tr>`}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};