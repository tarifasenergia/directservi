// /templates/layout.js

import { ClientSideScripts } from '../client-scripts.js';
import { escapeHTML } from '../utils.js';

const BOOTSTRAP_CSS_CDN = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css";
const BOOTSTRAP_JS_CDN = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js";
const JSPDF_CDN = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
const JSPDF_AUTOTABLE_CDN = "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.1/jspdf.plugin.autotable.min.js";

const renderNavLinks = (roleName) => {
    switch (roleName) {
        case 'superadmin':
            return `
                <li class="nav-item"><a class="nav-link" href="/superadmin/dashboard">Dashboard</a></li>
                <li class="nav-item"><a class="nav-link" href="/superadmin/businesses">Negocios</a></li>
                <li class="nav-item"><a class="nav-link" href="/superadmin/users">Usuarios</a></li>
                <li class="nav-item"><a class="nav-link" href="/superadmin/providers">Proveedores</a></li> 
            `;
        case 'admin':
            return `
                <li class="nav-item"><a class="nav-link" href="/admin/dashboard">Dashboard</a></li>
                <li class="nav-item"><a class="nav-link" href="/admin/users">Equipo</a></li>
                <li class="nav-item"><a class="nav-link" href="/admin/rates">Tarifas</a></li>
                <li class="nav-item"><a class="nav-link" href="/admin/styles">Apariencia</a></li>
            `;
        case 'vendedor':
            return `
                <li class="nav-item"><a class="nav-link" href="/vendedor/comparator">Nuevo Comparador</a></li>
                <li class="nav-item"><a class="nav-link" href="/vendedor/proposals">Mis Propuestas</a></li>
            `;
        case 'tramitador':
             return `
                <li class="nav-item"><a class="nav-link" href="/tramitador/contracts">Contratos</a></li>
            `;
        default:
            return '';
    }
};

const renderCustomStyles = (style) => {
    if (!style) return '';
    return `
        :root {
            --bs-primary: ${escapeHTML(style.primary_color)};
            --bs-secondary: ${escapeHTML(style.secondary_color)};
            --primary-color: ${escapeHTML(style.primary_color)};
            --secondary-color: ${escapeHTML(style.secondary_color)};
        }
        body { background-color: ${escapeHTML(style.background_color)} !important; }
        .app-navbar { background-color: ${escapeHTML(style.secondary_color)} !important; }
        .btn-primary { 
            background-color: var(--primary-color);
            border-color: var(--primary-color);
            color: white;
        }
        .btn-primary:hover {
            opacity: 0.9;
            background-color: var(--primary-color);
            border-color: var(--primary-color);
        }
        .page-title {
            color: var(--primary-color);
            font-weight: 600;
        }
    `;
};

export const Layout = (title, content, userProfile = null) => {
  const user = userProfile;
  const business = userProfile?.business;
  const businessStyle = business?.style;

  const logoUrl = businessStyle?.logo_base64 || "https://res.cloudinary.com/dvo5crvec/image/upload/v1750783138/LogoDirectservi_crfjot_e_background_removal_f_png_wpxyfs.png";
  const appName = business?.name || 'DirectServi App';

  const navLinks = user ? renderNavLinks(user.role_name) : '';
  const userNav = user ? `
    <span class="navbar-text me-3 text-white">
      ${escapeHTML(user.full_name || user.id)} (${escapeHTML(user.role_name)})
    </span>
    <form id="logout-form" action="/logout" method="POST" style="display: inline;">
        <button class="btn btn-outline-light btn-sm" type="submit">Logout</button>
    </form>
  ` : `<a class="btn btn-outline-light btn-sm" href="/login">Login</a>`;
  
  const customStyles = renderCustomStyles(businessStyle);

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${escapeHTML(title)} | ${escapeHTML(appName)}</title>
      <link href="${BOOTSTRAP_CSS_CDN}" rel="stylesheet">
      <style>
        body { padding-top: 80px; background-color: #f8f9fa; display: flex; flex-direction: column; min-height: 100vh; }
        main { flex: 1; }
        .app-logo { height: 45px; max-width: 150px; object-fit: contain; }
        .app-navbar { background-color: #212529; }
        .footer { background-color: #212529; }
        ${customStyles}
      </style>
    </head>
    <body>
      <nav class="navbar navbar-expand-lg navbar-dark fixed-top app-navbar">
        <div class="container-fluid">
          <a class="navbar-brand" href="/">
            <img src="${logoUrl}" alt="Logo ${escapeHTML(appName)}" class="app-logo">
          </a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              ${navLinks}
            </ul>
            <div class="d-flex align-items-center">
                ${userNav}
            </div>
          </div>
        </div>
      </nav>
      <main class="container my-5">
        <h1 class="mb-4 page-title">${escapeHTML(title)}</h1>
        ${content}
      </main>
      <footer class="mt-auto py-3 text-white text-center footer">
        <div class="container">
          &copy; ${new Date().getFullYear()} ${escapeHTML(appName)}
        </div>
      </footer>
      <script src="${BOOTSTRAP_JS_CDN}"></script>
      <script src="${JSPDF_CDN}"></script>
      <script src="${JSPDF_AUTOTABLE_CDN}"></script>
      <script>
        ${ClientSideScripts()}
      </script>
    </body>
    </html>
  `;
};