// /index.js

import { createSupabaseClient, getUserProfile, getCompanies, getBusinesses, getRoles } from './services/supabase.js';
import { Layout } from './templates/layout.js';
import { LoginPage } from './templates/pages/loginPage.js';
import { SuperAdminDashboardPage } from './templates/pages/superadmin/dashboardPage.js';
import { SuperAdminBusinessesPage } from './templates/pages/superadmin/businessesPage.js';
import { SuperAdminUsersPage } from './templates/pages/superadmin/usersPage.js';
import { AdminDashboardPage } from './templates/pages/admin/dashboardPage.js';
import { VendedorProposalsPage } from './templates/pages/vendedor/proposalsPage.js';
import { TramitadorContractsPage } from './templates/pages/tramitador/contractsPage.js';

// Mapa de rutas para redirecciones
const ROLE_DASHBOARDS = {
  superadmin: '/superadmin/dashboard',
  admin: '/admin/dashboard',
  vendedor: '/vendedor/proposals',
  tramitador: '/tramitador/contracts',
};

// Mapa de configuración de rutas
const ROUTE_CONFIG = {
  '/superadmin/dashboard': { roles: ['superadmin'], Cmp: SuperAdminDashboardPage, title: 'Superadmin Dashboard' },
  '/superadmin/businesses': { roles: ['superadmin'], Cmp: SuperAdminBusinessesPage, title: 'Gestión de Negocios' },
  '/superadmin/users': { roles: ['superadmin'], Cmp: SuperAdminUsersPage, title: 'Gestión de Admins' },
  '/admin/dashboard': { roles: ['admin'], Cmp: AdminDashboardPage, title: 'Admin Dashboard' },
  '/vendedor/proposals': { roles: ['vendedor'], Cmp: VendedorProposalsPage, title: 'Mis Propuestas' },
  '/vendedor/comparator': { roles: ['vendedor'], Cmp: () => ``, title: 'Nuevo Comparador' },
  '/tramitador/contracts': { roles: ['tramitador'], Cmp: TramitadorContractsPage, title: 'Gestión de Contratos' },
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = new Headers();
    const supabase = createSupabaseClient(request, headers, env);

    const { data: { user } } = await supabase.auth.getUser();
    let userProfile = null;
    if (user) {
      userProfile = await getUserProfile(supabase, user.id);
    }
    
    const redirectToDashboard = () => {
        const defaultDashboard = ROLE_DASHBOARDS[userProfile?.role_name] || '/login';
        headers.set('Location', defaultDashboard);
        return new Response(null, { status: 303, headers });
    };

    // --- RUTAS DE AUTENTICACIÓN ---
    if (url.pathname === '/login') {
      if (request.method === 'POST') {
        const formData = await request.formData();
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.get('email'),
          password: formData.get('password'),
        });
        if (error) {
          const content = LoginPage(error.message);
          headers.set('Content-Type', 'text/html; charset=utf-8');
          return new Response(Layout('Error de Login', content), { status: 401, headers });
        }
        const loggedInUserProfile = await getUserProfile(supabase, data.user.id);
        const dashboardUrl = ROLE_DASHBOARDS[loggedInUserProfile?.role_name] || '/login';
        headers.set('Location', dashboardUrl);
        return new Response(null, { status: 303, headers });
      }
      if (user) return redirectToDashboard();
      const content = LoginPage(url.searchParams.get('error'));
      headers.set('Content-Type', 'text/html; charset=utf-8');
      return new Response(Layout('Iniciar Sesión', content, null), { headers });
    }

    if (url.pathname === '/logout' && request.method === 'POST') {
      await supabase.auth.signOut();
      headers.set('Location', '/login');
      return new Response(null, { status: 303, headers });
    }

    if (url.pathname === '/') {
        if (!user) {
            headers.set('Location', '/login');
        } else {
            headers.set('Location', ROLE_DASHBOARDS[userProfile?.role_name] || '/login');
        }
        return new Response(null, { status: 303, headers });
    }
    
    if (!user || !userProfile) {
      headers.set('Location', `/login?error=Debes+iniciar+sesión.`);
      return new Response(null, { status: 303, headers });
    }

    // --- ENRUTADOR PRINCIPAL ---
    const route = ROUTE_CONFIG[url.pathname];
    if (!route || !route.roles.includes(userProfile.role_name)) {
        return redirectToDashboard();
    }

    // --- LÓGICA POST (MANEJO DE FORMULARIOS) ---
    if (request.method === 'POST') {
        const formData = await request.formData();
        const action = url.searchParams.get('action');
        let message = '';

        if (url.pathname === '/superadmin/businesses') {
            if (action === 'create_company') {
                const { error } = await supabase.from('companies').insert({ 
                    name: formData.get('name'), 
                    cif: formData.get('cif'),
                    address: formData.get('address') 
                });
                message = error ? `Error: ${error.message}` : 'Compañía creada con éxito.';
            } else if (action === 'create_business') {
                const { error } = await supabase.from('businesses').insert({ 
                    name: formData.get('name'), 
                    company_id: formData.get('company_id') 
                });
                message = error ? `Error: ${error.message}` : 'Negocio creado con éxito.';
            }
        } else if (url.pathname === '/superadmin/users') {
            if (action === 'create_admin') {
                const email = formData.get('email');
                const password = formData.get('password');
                const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });

                if (authError) {
                    message = `Error creando usuario: ${authError.message}`;
                } else {
                    const roles = await getRoles(supabase);
                    const adminRole = roles.find(r => r.name === 'admin');
                    const { error: profileError } = await supabase.from('user_profiles').insert({
                        id: authData.user.id,
                        business_id: formData.get('business_id'),
                        role_id: adminRole.id,
                        full_name: formData.get('full_name'),
                    });
                    message = profileError ? `Error creando perfil: ${profileError.message}` : 'Administrador creado con éxito.';
                }
            }
        }
        headers.set('Location', `${url.pathname}?message=${encodeURIComponent(message)}`);
        return new Response(null, { status: 303, headers });
    }

    // --- LÓGICA GET (RENDERIZADO DE PÁGINAS) ---
    let pageContent;
    const messageFromRedirect = url.searchParams.get('message');

    if (url.pathname === '/superadmin/businesses') {
        const companies = await getCompanies(supabase);
        const businesses = await getBusinesses(supabase);
        pageContent = route.Cmp(companies, businesses, messageFromRedirect);
    } else if (url.pathname === '/superadmin/users') {
        const businesses = await getBusinesses(supabase);
        pageContent = route.Cmp(businesses, messageFromRedirect);
    }
    else {
        pageContent = route.Cmp(userProfile);
    }
    
    headers.set('Content-Type', 'text/html; charset=utf-8');
    return new Response(Layout(route.title, pageContent, userProfile), { headers });
  },
};