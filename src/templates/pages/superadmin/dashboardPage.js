// /templates/pages/superadmin/dashboardPage.js
import { escapeHTML } from '../../../utils.js';

const StatCard = ({ title, value, icon, color, description, link }) => `
    <div class="col-xl-3 col-md-6 mb-4">
        <div class="card h-100 py-2 border-start border-4 border-${color}">
            <div class="card-body">
                <div class="row no-gutters align-items-center">
                    <div class="col mr-2">
                        <div class="text-xs fw-bold text-${color} text-uppercase mb-1">${escapeHTML(title)}</div>
                        <div class="h5 mb-0 fw-bold text-gray-800">${escapeHTML(value)}</div>
                        ${description ? `<div class="text-muted small mt-1">${escapeHTML(description)}</div>` : ''}
                    </div>
                    <div class="col-auto">
                        <i class="fas ${icon} fa-2x text-gray-300"></i> </div>
                </div>
                ${link ? `<a href="${link}" class="stretched-link"></a>` : ''}
            </div>
        </div>
    </div>
`;


export const SuperAdminDashboardPage = (stats) => {
    if (!stats) {
        return `<div class="alert alert-warning">No se pudieron cargar las estadísticas del dashboard.</div>`;
    }

    return `
      <div>
        <p class="lead mb-4">Vista general del estado de la plataforma.</p>
        <div class="row">
            ${StatCard({
                title: "Canales (Negocios)",
                value: stats.businesses_count || 0,
                color: "primary",
                description: `${stats.businesses_pending_count || 0} pend. de verificación`,
                link: "/superadmin/businesses"
            })}
            ${StatCard({
                title: "Usuarios Totales",
                value: stats.users_count || 0,
                color: "success",
                description: `${stats.admins_count || 0} Admins, ${stats.sellers_count || 0} Vendedores`,
                link: "/superadmin/users"
            })}
            ${StatCard({
                title: "Compañías",
                value: stats.companies_count || 0,
                color: "info",
                description: "Entidades fiscales registradas",
                link: "/superadmin/businesses"
            })}
            ${StatCard({
                title: "Tarifas Base",
                value: stats.base_rates_count || 0,
                color: "warning",
                description: "Tarifas globales del sistema",
                link: "#" // Se cambiará cuando exista la página de tarifas
            })}
        </div>
      </div>
    `;
  };