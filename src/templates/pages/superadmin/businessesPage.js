// /src/templates/pages/superadmin/businessesPage.js

import { escapeHTML } from '../../../utils.js';

const renderPagination = (currentPage, totalItems, pageSize, searchQuery, entity) => {
    if (totalItems <= pageSize) return '';
    const totalPages = Math.ceil(totalItems / pageSize);
    let html = '<nav aria-label="Page navigation"><ul class="pagination pagination-sm justify-content-end">';

    for (let i = 1; i <= totalPages; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
        html += `<li class="page-item ${activeClass}"><a class="page-link" href="?entity=${entity}&page=${i}${searchParam}">${i}</a></li>`;
    }

    html += '</ul></nav>';
    return html;
};

export const SuperAdminBusinessesPage = (props) => {
    const { businesses, companies, allCompaniesForForm, message, currentPage, searchQuery, activeTab, pageSize } = props;
    
    const messageHtml = message ? `<div class="alert alert-info alert-dismissible fade show" role="alert">${escapeHTML(message)}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>` : '';

    const companyOptionsForForm = allCompaniesForForm.map(c =>
        `<option value="${c.id}">${escapeHTML(c.name)}</option>`
    ).join('');

    const businessRows = businesses.data.map(b => {
        const createdDate = b.created_at ? new Date(b.created_at).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }) : 'N/A';
        
        return `
        <tr>
            <td><strong>${escapeHTML(b.name)}</strong></td>
            <td>
                ${b.company?.name ? 
                    `<span class="badge bg-info text-white company-link" 
                           style="cursor: pointer; text-decoration: none;" 
                           data-company-id="${b.company.id}" 
                           data-company-name="${escapeHTML(b.company.name)}" 
                           data-company-cif="${escapeHTML(b.company.cif || '')}" 
                           data-company-address="${escapeHTML(b.company.address || '')}">
                        ${escapeHTML(b.company.name)}
                    </span>` 
                    : 'N/A'
                }
            </td>
            <td><span class="badge bg-secondary text-capitalize">${escapeHTML(b.status.replace('_', ' '))}</span></td>
            <td><small class="text-muted">${createdDate}</small></td>
            <td>
                <button type="button" class="btn btn-sm btn-warning edit-business-btn"
                        data-bs-toggle="modal" data-bs-target="#businessModal"
                        data-id="${b.id}">
                    Editar
                </button>
                <form action="/superadmin/businesses?action=delete_business" method="POST" class="d-inline" onsubmit="return confirm('¿Estás seguro de que quieres eliminar este negocio? Esta acción no se puede deshacer y borrará sus usuarios y tarifas asociadas.')">
                    <input type="hidden" name="id" value="${b.id}">
                    <button type="submit" class="btn btn-sm btn-danger">Eliminar</button>
                </form>
            </td>
        </tr>
        `;
    }).join('');

    const companyRows = companies.data.map(c => {
        const businessesList = c.businesses && c.businesses.length > 0 
            ? c.businesses.map(b => `<span class="badge bg-primary text-white me-1 mb-1">${escapeHTML(b.name || 'Negocio sin nombre')}</span>`).join('')
            : '<span class="text-muted fst-italic">Sin negocios</span>';
        
        const createdDate = c.created_at ? new Date(c.created_at).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }) : 'N/A';
        
        return `
        <tr>
            <td><strong>${escapeHTML(c.name)}</strong></td>
            <td>${escapeHTML(c.cif)}</td>
            <td><span class="badge bg-${c.is_approved ? 'success' : 'warning'}">${c.is_approved ? 'Aprobada' : 'Pendiente'}</span></td>
            <td>
                <div class="d-flex align-items-center flex-wrap">
                    <button type="button" class="btn btn-sm btn-outline-primary me-2 mb-1" 
                            data-bs-toggle="modal" data-bs-target="#addBusinessModal"
                            data-company-id="${c.id}" data-company-name="${escapeHTML(c.name)}">
                        + Agregar
                    </button>
                    ${businessesList}
                </div>
            </td>
            <td><small class="text-muted">${createdDate}</small></td>
            <td>
                <button type="button" class="btn btn-sm btn-warning edit-company-btn"
                        data-bs-toggle="modal" data-bs-target="#companyModal"
                        data-id="${c.id}" data-name="${escapeHTML(c.name)}" data-cif="${escapeHTML(c.cif)}" data-address="${escapeHTML(c.address || '')}">
                    Editar
                </button>
                <form action="/superadmin/businesses?action=delete_company" method="POST" class="d-inline" onsubmit="return confirm('¿Estás seguro de que quieres eliminar esta compañía? Se borrarán todos los negocios asociados.')">
                    <input type="hidden" name="id" value="${c.id}">
                    <button type="submit" class="btn btn-sm btn-danger">Eliminar</button>
                </form>
            </td>
        </tr>
        `;
    }).join('');

    return `
        ${messageHtml}

        <ul class="nav nav-tabs mb-4" id="businessManagementTabs" role="tablist">
            <li class="nav-item" role="presentation">
                <a class="nav-link ${activeTab === 'businesses' ? 'active' : ''}" href="/superadmin/businesses?entity=businesses">Negocios (Canales)</a>
            </li>
            <li class="nav-item" role="presentation">
                <a class="nav-link ${activeTab === 'companies' ? 'active' : ''}" href="/superadmin/businesses?entity=companies">Compañías (Sociedades)</a>
            </li>
        </ul>

        <div class="tab-content" id="businessManagementTabsContent">
            <div class="tab-pane fade ${activeTab === 'businesses' ? 'show active' : ''}" id="businesses-content" role="tabpanel">
                <div class="card shadow-sm">
                    <div class="card-header d-flex justify-content-between align-items-center bg-light">
                        <h5 class="mb-0">Listado de Negocios (${businesses.count || 0})</h5>
                        <button class="btn btn-primary btn-sm" id="createBusinessBtn" data-bs-toggle="modal" data-bs-target="#businessModal">
                            + Crear Nuevo Negocio
                        </button>
                    </div>
                    <div class="card-body">
                        <form method="GET" action="/superadmin/businesses" class="mb-3">
                            <input type="hidden" name="entity" value="businesses">
                            <div class="input-group">
                                <input type="text" name="search" class="form-control" placeholder="Buscar por nombre de negocio..." value="${escapeHTML(searchQuery)}">
                                <button class="btn btn-outline-secondary" type="submit">Buscar</button>
                            </div>
                        </form>
                        <div class="table-responsive">
                            <table class="table table-striped table-hover">
                                <thead><tr><th>Nombre del Negocio</th><th>Compañía Matriz</th><th>Estado</th><th>Fecha de Creación</th><th>Acciones</th></tr></thead>
                                <tbody>${businessRows.length > 0 ? businessRows : `<tr><td colspan="5" class="text-center text-muted fst-italic py-3">No se encontraron negocios.</td></tr>`}</tbody>
                            </table>
                        </div>
                    </div>
                    <div class="card-footer bg-light">${renderPagination(currentPage, businesses.count || 0, pageSize, searchQuery, 'businesses')}</div>
                </div>
            </div>

            <div class="tab-pane fade ${activeTab === 'companies' ? 'show active' : ''}" id="companies-content" role="tabpanel">
                <div class="card shadow-sm">
                    <div class="card-header d-flex justify-content-between align-items-center bg-light">
                        <h5 class="mb-0">Listado de Compañías (${companies.count || 0})</h5>
                        <button class="btn btn-primary btn-sm" id="createCompanyBtn" data-bs-toggle="modal" data-bs-target="#companyModal">
                            + Crear Nueva Compañía
                        </button>
                    </div>
                     <div class="card-body">
                        <form method="GET" action="/superadmin/businesses" class="mb-3">
                            <input type="hidden" name="entity" value="companies">
                            <div class="input-group">
                                <input type="text" name="search" class="form-control" placeholder="Buscar por nombre o CIF..." value="${escapeHTML(searchQuery)}">
                                <button class="btn btn-outline-secondary" type="submit">Buscar</button>
                            </div>
                        </form>
                        <div class="table-responsive">
                            <table class="table table-striped table-hover">
                                <thead><tr><th>Nombre Legal</th><th>CIF</th><th>Estado</th><th>Negocios Asociados</th><th>Fecha de Creación</th><th>Acciones</th></tr></thead>
                                <tbody>${companyRows.length > 0 ? companyRows : `<tr><td colspan="6" class="text-center text-muted fst-italic py-3">No se encontraron compañías.</td></tr>`}</tbody>
                            </table>
                        </div>
                    </div>
                    <div class="card-footer bg-light">${renderPagination(currentPage, companies.count || 0, pageSize, searchQuery, 'companies')}</div>
                </div>
            </div>
        </div>

        <!-- Modal para Crear/Editar Compañía -->
        <div class="modal fade" id="companyModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <form id="companyForm" method="POST">
                        <div class="modal-header">
                            <h5 class="modal-title" id="companyModalLabel"></h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <input type="hidden" id="company_id_input" name="id">
                            <div class="mb-3"><label for="company_name_input" class="form-label">Nombre Legal</label><input type="text" class="form-control" id="company_name_input" name="name" required></div>
                            <div class="mb-3"><label for="company_cif_input" class="form-label">CIF</label><input type="text" class="form-control" id="company_cif_input" name="cif" required></div>
                            <div class="mb-3"><label for="company_description_input" class="form-label">Descripción</label><textarea class="form-control" id="company_description_input" name="description" rows="2" placeholder="Descripción de la empresa (opcional)"></textarea></div>
                            <div class="mb-3"><label for="company_address_input" class="form-label">Dirección Fiscal</label><textarea class="form-control" id="company_address_input" name="address" rows="3"></textarea></div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="submit" class="btn btn-primary" id="companySubmitBtn"></button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Modal para Crear/Editar Negocio -->
        <div class="modal fade" id="businessModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                     <form id="businessForm" method="POST">
                        <div class="modal-header">
                            <h5 class="modal-title" id="businessModalLabel"></h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <input type="hidden" id="business_id_input" name="id">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="business_name_input" class="form-label">Nombre del Negocio (Marca)</label>
                                    <input type="text" class="form-control" id="business_name_input" name="name" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="business_company_select" class="form-label">Asignar a Compañía</label>
                                    <select class="form-select" id="business_company_select" name="company_id" required><option value="">Seleccione...</option>${companyOptionsForForm}</select>
                                </div>
                            </div>
                             <div class="mb-3">
                                <label for="business_status_select" class="form-label">Estado del Negocio</label>
                                <select class="form-select" id="business_status_select" name="status" required>
                                    <option value="active">Activo</option>
                                    <option value="pending_verification">Pendiente Verificación</option>
                                    <option value="suspended">Suspendido</option>
                                </select>
                            </div>
                            <hr>
                            <h6 class="mb-3">Estilos del Negocio (Opcional)</h6>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="logo_file_input" class="form-label">Logotipo</label>
                                    <input type="file" class="form-control" id="logo_file_input" accept="image/*" onchange="previewLogo(event)">
                                    <input type="hidden" name="logo_base64" id="logo_b64_hidden">
                                    <img id="logo_preview_img" src="#" alt="Previsualización" class="img-fluid rounded mt-2 d-none" style="max-height: 75px;"/>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label for="primary_color_input" class="form-label">Color Primario</label>
                                    <input type="color" class="form-control form-control-color" id="primary_color_input" name="primary_color" value="#399f82">
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label for="secondary_color_input" class="form-label">Color Secundario</label>
                                    <input type="color" class="form-control form-control-color" id="secondary_color_input" name="secondary_color" value="#4a4548">
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="submit" class="btn btn-primary" id="businessSubmitBtn"></button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Modal para Agregar Negocio a Compañía Específica -->
        <div class="modal fade" id="addBusinessModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                     <form id="addBusinessForm" method="POST" action="/superadmin/businesses?action=add_business_to_company">
                        <div class="modal-header">
                            <h5 class="modal-title" id="addBusinessModalLabel">Agregar Nuevo Negocio</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <input type="hidden" id="add_business_company_id" name="company_id">
                            <div class="alert alert-info">
                                <strong>Compañía seleccionada:</strong> <span id="selected_company_name"></span>
                            </div>
                            <div class="row">
                                <div class="col-md-12 mb-3">
                                    <label for="add_business_name_input" class="form-label">Nombre del Negocio (Marca)</label>
                                    <input type="text" class="form-control" id="add_business_name_input" name="name" required>
                                </div>
                            </div>
                             <div class="mb-3">
                                <label for="add_business_status_select" class="form-label">Estado del Negocio</label>
                                <select class="form-select" id="add_business_status_select" name="status" required>
                                    <option value="active">Activo</option>
                                    <option value="pending_verification">Pendiente Verificación</option>
                                    <option value="suspended">Suspendido</option>
                                </select>
                            </div>
                            <hr>
                            <h6 class="mb-3">Estilos del Negocio (Opcional)</h6>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="add_logo_file_input" class="form-label">Logotipo</label>
                                    <input type="file" class="form-control" id="add_logo_file_input" accept="image/*" onchange="previewAddLogo(event)">
                                    <input type="hidden" name="logo_base64" id="add_logo_b64_hidden">
                                    <img id="add_logo_preview_img" src="#" alt="Previsualización" class="img-fluid rounded mt-2 d-none" style="max-height: 75px;"/>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label for="add_primary_color_input" class="form-label">Color Primario</label>
                                    <input type="color" class="form-control form-control-color" id="add_primary_color_input" name="primary_color" value="#399f82">
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label for="add_secondary_color_input" class="form-label">Color Secundario</label>
                                    <input type="color" class="form-control form-control-color" id="add_secondary_color_input" name="secondary_color" value="#4a4548">
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="submit" class="btn btn-primary">Crear Negocio</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
};