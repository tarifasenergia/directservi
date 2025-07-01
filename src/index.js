// /index.js (Versión completa y actualizada)

import { createSupabaseClient, getUserProfile, getCompanies, getBusinesses, getRoles, getUsersByBusiness, getProviders } from './services/supabase.js';
import { Layout } from './templates/layout.js';
import { LoginPage } from './templates/pages/loginPage.js';
import { SuperAdminDashboardPage } from './templates/pages/superadmin/dashboardPage.js';
import { SuperAdminBusinessesPage } from './templates/pages/superadmin/businessesPage.js';
import { SuperAdminUsersPage } from './templates/pages/superadmin/usersPage.js';
import { SuperAdminEditBusinessPage } from './templates/pages/superadmin/editBusinessPage.js';
import { SuperAdminProvidersPage } from './templates/pages/superadmin/providersPage.js';
import { AdminDashboardPage } from './templates/pages/admin/dashboardPage.js';
import { AdminUsersPage } from './templates/pages/admin/usersPage.js';
import { VendedorProposalsPage } from './templates/pages/vendedor/proposalsPage.js';
import { TramitadorContractsPage } from './templates/pages/tramitador/contractsPage.js';

const ROLE_DASHBOARDS = {
  superadmin: '/superadmin/dashboard',
  admin: '/admin/dashboard',
  vendedor: '/vendedor/proposals',
  tramitador: '/tramitador/contracts',
};

const ROUTE_CONFIG = {
  // Superadmin
  '/superadmin/dashboard': { roles: ['superadmin'], Cmp: SuperAdminDashboardPage, title: 'Superadmin Dashboard' },
  '/superadmin/businesses': { roles: ['superadmin'], Cmp: SuperAdminBusinessesPage, title: 'Gestión de Negocios' },
  '/superadmin/users': { roles: ['superadmin'], Cmp: SuperAdminUsersPage, title: 'Gestión de Admins' },
  '/superadmin/businesses/edit': { roles: ['superadmin'], Cmp: SuperAdminEditBusinessPage, title: 'Editar Negocio' },
  '/superadmin/providers': { roles: ['superadmin'], Cmp: SuperAdminProvidersPage, title: 'Gestión de Proveedores' },
  // Admin
  '/admin/dashboard': { roles: ['admin'], Cmp: AdminDashboardPage, title: 'Admin Dashboard' },
  '/admin/users': { roles: ['admin'], Cmp: AdminUsersPage, title: 'Gestión de Equipo' },
  // Vendedor
  '/vendedor/proposals': { roles: ['vendedor'], Cmp: VendedorProposalsPage, title: 'Mis Propuestas' },
  '/vendedor/comparator': { roles: ['vendedor'], Cmp: () => ``, title: 'Nuevo Comparador' },
  // Tramitador
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
        headers.set('Location', userProfile ? ROLE_DASHBOARDS[userProfile.role_name] : '/login');
        return new Response(null, { status: 303, headers });
    };

    // --- RUTAS PÚBLICAS Y DE AUTENTICACIÓN ---
    if (url.pathname === '/login') {
      if (request.method === 'POST') {
        const formData = await request.formData();
        const { data, error } = await supabase.auth.signInWithPassword({ email: formData.get('email'), password: formData.get('password') });
        if (error) return new Response(Layout('Error de Login', LoginPage(error.message)), { status: 401, headers: {'Content-Type': 'text/html; charset=utf-8'} });
        
        const loggedInProfile = await getUserProfile(supabase, data.user.id);
        headers.set('Location', ROLE_DASHBOARDS[loggedInProfile.role_name] || '/login');
        return new Response(null, { status: 303, headers });
      }
      if (user) return redirectToDashboard();
      return new Response(Layout('Iniciar Sesión', LoginPage(url.searchParams.get('error'))), { headers: {'Content-Type': 'text/html; charset=utf-8'} });
    }
    if (url.pathname === '/logout' && request.method === 'POST') {
      await supabase.auth.signOut();
      headers.set('Location', '/login');
      return new Response(null, { status: 303, headers });
    }
    if (url.pathname === '/') {
        return redirectToDashboard();
    }
    if (!user || !userProfile) {
      headers.set('Location', `/login?error=Debes+iniciar+sesión.`);
      return new Response(null, { status: 303, headers });
    }

    // --- ENRUTADOR DE RUTAS PROTEGIDAS ---
    const route = ROUTE_CONFIG[url.pathname];
    if (!route || !route.roles.includes(userProfile.role_name)) {
        return redirectToDashboard();
    }

    // --- LÓGICA POST (FORMULARIOS) ---
    if (request.method === 'POST') {
        const formData = await request.formData();
        let message = '';
        let redirectUrl = url.pathname;

        // Lógica POST para Superadmin
        if (userProfile.role_name === 'superadmin') {
            const action = url.searchParams.get('action');
            if (url.pathname === '/superadmin/businesses') {
                if (action === 'create_company') {
                    const { error } = await supabase.from('companies').insert({ name: formData.get('name'), cif: formData.get('cif'), address: formData.get('address') });
                    message = error ? `Error: ${error.message}` : 'Compañía creada.';
                } else if (action === 'create_business') {
                    const { error } = await supabase.from('businesses').insert({ name: formData.get('name'), company_id: formData.get('company_id') });
                    message = error ? `Error: ${error.message}` : 'Negocio creado.';
                }
            } else if (url.pathname === '/superadmin/users' && action === 'create_admin') {
                const { data: authData, error: authError } = await supabase.auth.signUp({ email: formData.get('email'), password: formData.get('password') });
                if (authError) {
                    message = `Error creando usuario Auth: ${authError.message}`;
                } else {
                    const roles = await getRoles(supabase);
                    const adminRole = roles.find(r => r.name === 'admin');
                    const { error: profileError } = await supabase.from('user_profiles').insert({ id: authData.user.id, business_id: formData.get('business_id'), role_id: adminRole.id, full_name: formData.get('full_name') });
                    message = profileError ? `Error creando perfil: ${profileError.message}` : 'Admin creado con éxito.';
                }
            } else if (url.pathname === '/superadmin/businesses/edit') {
                const id = url.searchParams.get('id');
                const { error } = await supabase.from('businesses').update({ name: formData.get('name'), status: formData.get('status'), website_url: formData.get('website_url') }).eq('id', id);
                message = error ? `Error: ${error.message}` : 'Negocio actualizado.';
                redirectUrl = `${url.pathname}?id=${id}`;
            } else if (url.pathname === '/superadmin/providers' && action === 'create_provider') {
                const { error } = await supabase.from('providers').insert({ name: formData.get('name'), logo_url: formData.get('logo_url') || null });
                message = error ? `Error: ${error.message}` : 'Proveedor creado con éxito.';
            }
        }
        
        // Lógica POST para Admin
        if (userProfile.role_name === 'admin') {
            const action = url.searchParams.get('action');
            if (url.pathname === '/admin/users' && action === 'create_user') {
                const { data: authData, error: authError } = await supabase.auth.signUp({ email: formData.get('email'), password: formData.get('password') });
                if (authError) {
                    message = `Error creando usuario Auth: ${authError.message}`;
                } else {
                    const { error: profileError } = await supabase.from('user_profiles').insert({ id: authData.user.id, business_id: userProfile.business_id, role_id: formData.get('role_id'), full_name: formData.get('full_name') });
                    message = profileError ? `Error: ${profileError.message}` : 'Usuario de equipo creado.';
                }
            }
        }

        headers.set('Location', `${redirectUrl}?message=${encodeURIComponent(message)}`);
        return new Response(null, { status: 303, headers });
    }

    // --- LÓGICA GET (RENDERIZADO) ---
    let pageContent;
    const messageFromRedirect = url.searchParams.get('message');
    
    // Rutas Superadmin
    if (userProfile.role_name === 'superadmin') {
        if (url.pathname === '/superadmin/businesses') {
            const companies = await getCompanies(supabase);
            const businesses = await getBusinesses(supabase);
            pageContent = route.Cmp(companies, businesses, messageFromRedirect);
        } else if (url.pathname === '/superadmin/users') {
            const businesses = await getBusinesses(supabase);
            pageContent = route.Cmp(businesses, messageFromRedirect);
        } else if (url.pathname === '/superadmin/businesses/edit') {
            const id = url.searchParams.get('id');
            const { data: business } = await supabase.from('businesses').select('*, company:companies(name)').eq('id', id).single();
            pageContent = route.Cmp(business, messageFromRedirect);
        } else if (url.pathname === '/superadmin/providers') {
            const providers = await getProviders(supabase);
            pageContent = route.Cmp(providers, messageFromRedirect);
        } else {
            pageContent = route.Cmp(userProfile);
        }
    }
    // Rutas Admin
    else if (userProfile.role_name === 'admin') {
        if (url.pathname === '/admin/users') {
            if (!userProfile.business_id) {
                 pageContent = `<div class="alert alert-danger">Error: No estás asignado a ningún negocio.</div>`;
            } else {
                const users = await getUsersByBusiness(supabase, userProfile.business_id);
                const roles = await getRoles(supabase);
                pageContent = route.Cmp(users, roles, messageFromRedirect);
            }
        } else {
            pageContent = route.Cmp(userProfile);
        }
    }
    // Ruta por defecto para dashboards simples de otros roles
    else {
        pageContent = route.Cmp(userProfile);
    }
    
    headers.set('Content-Type', 'text/html; charset=utf-8');
    return new Response(Layout(route.title, pageContent, userProfile), { headers });
  },
};