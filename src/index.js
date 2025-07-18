// /src/index.js

import { createSupabaseClient, getUserProfile, getCompanies, getBusinesses, getRoles, getUsersByBusiness, getProviders, getSuperAdminDashboardStats, getAllCompanies, deleteEntity, getBusinessWithStyle, getAllUsersDetailed, getSingleUserDetailed, getAllBusinesses } from './services/supabase.js';
import { Layout } from './templates/layout.js';
import { LoginPage } from './templates/pages/loginPage.js';
import { SuperAdminDashboardPage } from './templates/pages/superadmin/dashboardPage.js';
import { SuperAdminBusinessesPage } from './templates/pages/superadmin/businessesPage.js';
import { SuperAdminUsersPage } from './templates/pages/superadmin/usersPage.js';
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
  '/superadmin/businesses': { roles: ['superadmin'], Cmp: SuperAdminBusinessesPage, title: 'Gestión de Negocios y Compañías' },
  '/superadmin/users': { roles: ['superadmin'], Cmp: SuperAdminUsersPage, title: 'Gestión de Usuarios' },
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
        const action = url.searchParams.get('action');

        if (userProfile.role_name === 'superadmin') {
            if (url.pathname === '/superadmin/businesses') {
                if (action === 'create_company') {
                    const { error } = await supabase.from('companies').insert({ name: formData.get('name'), cif: formData.get('cif'), address: formData.get('address'), is_approved: true });
                    message = error ? `Error: ${error.message}` : 'Compañía creada con éxito.';
                    url.searchParams.set('entity', 'companies');
                } else if (action === 'update_company') {
                    const id = formData.get('id');
                    const { error } = await supabase.from('companies').update({ name: formData.get('name'), cif: formData.get('cif'), address: formData.get('address') }).eq('id', id);
                    message = error ? `Error: ${error.message}` : 'Compañía actualizada con éxito.';
                    url.searchParams.set('entity', 'companies');
                } else if (action === 'toggle_company_approval') {
                    const id = formData.get('id');
                    const currentStatus = formData.get('current_status') === 'true';
                    const { error } = await supabase.from('companies').update({ is_approved: !currentStatus }).eq('id', id);
                    message = error ? `Error al cambiar estado: ${error.message}` : 'Estado de la compañía cambiado con éxito.';
                    url.searchParams.set('entity', 'companies');
                } else if (action === 'delete_company') {
                    const { error } = await deleteEntity(supabase, { tableName: 'companies', id: formData.get('id') });
                    message = error ? `Error: ${error.details || error.message}` : 'Compañía eliminada con éxito.';
                    url.searchParams.set('entity', 'companies');
                } else if (action === 'create_business') {
                    const { data: busData, error: busError } = await supabase.from('businesses').insert({ name: formData.get('name'), company_id: formData.get('company_id'), status: 'active' }).select().single();
                    if(busError) {
                        message = `Error creando negocio: ${busError.message}`;
                    } else {
                        message = 'Negocio creado con éxito.';
                        const styleData = {
                            business_id: busData.id,
                            logo_base64: formData.get('logo_base64') || null,
                            primary_color: formData.get('primary_color') || '#399f82',
                            secondary_color: formData.get('secondary_color') || '#4a4548'
                        };
                        const { error: styleError } = await supabase.from('business_styles').upsert(styleData);
                        if(styleError) message += ` Pero hubo un error al guardar el estilo: ${styleError.message}`;
                    }
                    url.searchParams.set('entity', 'businesses');
                } else if (action === 'add_business_to_company') {
                    const { data: busData, error: busError } = await supabase.from('businesses').insert({ name: formData.get('name'), company_id: formData.get('company_id'), status: formData.get('status') || 'active' }).select().single();
                    if(busError) {
                        message = `Error creando negocio: ${busError.message}`;
                    } else {
                        message = 'Negocio creado con éxito.';
                        const styleData = {
                            business_id: busData.id,
                            logo_base64: formData.get('logo_base64') || null,
                            primary_color: formData.get('primary_color') || '#399f82',
                            secondary_color: formData.get('secondary_color') || '#4a4548'
                        };
                        const { error: styleError } = await supabase.from('business_styles').upsert(styleData);
                        if(styleError) message += ` Pero hubo un error al guardar el estilo: ${styleError.message}`;
                    }
                    url.searchParams.set('entity', 'companies');
                } else if (action === 'update_business') {
                    const id = formData.get('id');
                    const { error: busError } = await supabase.from('businesses').update({ name: formData.get('name'), company_id: formData.get('company_id'), status: formData.get('status') }).eq('id', id);
                    if(busError) {
                         message = `Error actualizando negocio: ${busError.message}`;
                    } else {
                        message = 'Negocio actualizado con éxito.';
                        const styleData = {
                            business_id: id,
                            logo_base64: formData.get('logo_base64') || null,
                            primary_color: formData.get('primary_color') || '#399f82',
                            secondary_color: formData.get('secondary_color') || '#4a4548'
                        };
                        const { error: styleError } = await supabase.from('business_styles').upsert(styleData);
                        if(styleError) message += ` Pero hubo un error al actualizar el estilo: ${styleError.message}`;
                    }
                    url.searchParams.set('entity', 'businesses');
                } else if (action === 'delete_business') {
                    const { error } = await deleteEntity(supabase, { tableName: 'businesses', id: formData.get('id') });
                    message = error ? `Error: ${error.details || error.message}` : 'Negocio eliminado con éxito.';
                    url.searchParams.set('entity', 'businesses');
                }
            } else if (url.pathname === '/superadmin/users') {
                if (action === 'create_user') {
                    const { data: authData, error: authError } = await supabase.auth.signUp({ email: formData.get('email'), password: formData.get('password') });
                    if (authError) {
                        message = `Error creando usuario Auth: ${authError.message}`;
                    } else {
                        const profilePayload = { id: authData.user.id, role_id: formData.get('role_id'), full_name: formData.get('full_name'), business_id: formData.get('business_id') || null };
                        const { error: profileError } = await supabase.from('user_profiles').insert(profilePayload);
                        message = profileError ? `Error creando perfil: ${profileError.message}` : 'Usuario creado con éxito.';
                    }
                } else if (action === 'update_user') {
                    const userId = formData.get('id');
                    const { error: profileError } = await supabase.from('user_profiles').update({ full_name: formData.get('full_name'), role_id: formData.get('role_id'), business_id: formData.get('business_id') || null, is_active: formData.get('is_active') === 'true' }).eq('id', userId);
                    if (profileError) {
                        message = `Error actualizando perfil: ${profileError.message}`;
                    } else {
                        const newPassword = formData.get('password');
                        if (newPassword) {
                            const adminSupabase = createSupabaseClient(request, new Headers(), { ...env, cookies: {} });
                            const { error: passError } = await adminSupabase.auth.admin.updateUserById(userId, { password: newPassword });
                            message = passError ? `Perfil actualizado, pero falló el cambio de contraseña: ${passError.message}` : 'Usuario y contraseña actualizados con éxito.';
                        } else {
                            message = 'Usuario actualizado con éxito.';
                        }
                    }
                } else if (action === 'delete_user') {
                    const adminSupabase = createSupabaseClient(request, new Headers(), { ...env, cookies: {} });
                    const { error } = await deleteEntity(supabase, { tableName: 'users', id: formData.get('id'), isAdminDelete: true, adminSupabase });
                    message = error ? `Error: ${error.message}` : 'Usuario eliminado con éxito.';
                }
            } else if (url.pathname === '/superadmin/providers') {
                if (action === 'create_provider') {
                    const { error } = await supabase.from('providers').insert({ name: formData.get('name'), logo_b64: formData.get('logo_b64') || null, notes: formData.get('notes') || null });
                    message = error ? `Error: ${error.message}` : 'Proveedor creado con éxito.';
                } else if (action === 'update_provider') {
                    const id = formData.get('id');
                    const { error } = await supabase.from('providers').update({ name: formData.get('name'), logo_b64: formData.get('logo_b64') || null, notes: formData.get('notes') || null }).eq('id', id);
                    message = error ? `Error: ${error.message}` : 'Proveedor actualizado con éxito.';
                } else if (action === 'delete_provider') {
                    const { error } = await deleteEntity(supabase, { tableName: 'providers', id: formData.get('id') });
                    message = error ? `Error: ${error.message}` : 'Proveedor eliminado con éxito.';
                }
            }
        }
        
        url.searchParams.delete('action');
        url.searchParams.set('message', message);
        headers.set('Location', url.toString());
        return new Response(null, { status: 303, headers });
    }

    // --- LÓGICA GET (RENDERIZADO) ---
    let pageContent;
    const messageFromRedirect = url.searchParams.get('message');
    
    if (userProfile.role_name === 'superadmin') {
        if (url.pathname === '/superadmin/dashboard') {
            const stats = await getSuperAdminDashboardStats(supabase);
            pageContent = route.Cmp(stats);
        } else if (url.pathname === '/superadmin/businesses') {
            const editBusinessId = url.searchParams.get('edit_business_id');
            if (editBusinessId) {
                const { data, error } = await getBusinessWithStyle(supabase, editBusinessId);
                if (error) return new Response(JSON.stringify({ error: error.message }), { status: 404, headers: { 'Content-Type': 'application/json' } });
                return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
            }

            const page = parseInt(url.searchParams.get('page') || '1', 10);
            const searchQuery = url.searchParams.get('search') || '';
            const activeTab = url.searchParams.get('entity') || 'businesses';
            const pageSize = 10;

            const [businessesResult, companiesResult, allCompaniesForForm] = await Promise.all([
                getBusinesses(supabase, { page, pageSize, searchQuery }),
                getCompanies(supabase, { page, pageSize, searchQuery }),
                getAllCompanies(supabase)
            ]);
            
            pageContent = route.Cmp({
                businesses: businessesResult,
                companies: companiesResult,
                allCompaniesForForm,
                message: messageFromRedirect,
                currentPage: page,
                searchQuery,
                activeTab,
                pageSize
            });
        } else if (url.pathname === '/superadmin/users') {
             const editUserId = url.searchParams.get('edit_user_id');
             if (editUserId) {
                const { data, error } = await getSingleUserDetailed(supabase, editUserId);
                if (error) return new Response(JSON.stringify({ error: error.message }), { status: 404, headers: { 'Content-Type': 'application/json' } });
                return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
            }

            const page = parseInt(url.searchParams.get('page') || '1', 10);
            const searchQuery = url.searchParams.get('search') || '';
            const roleFilter = url.searchParams.get('role') || '';
            const companyFilter = url.searchParams.get('company') || '';
            const pageSize = 10;

            const [usersResult, roles, companies, businesses] = await Promise.all([
                getAllUsersDetailed(supabase, { page, pageSize, searchQuery, roleFilter, companyFilter }),
                getRoles(supabase),
                getAllCompanies(supabase),
                getAllBusinesses(supabase)
            ]);

            pageContent = route.Cmp({
                users: usersResult,
                roles,
                companiesForFilter: companies,
                businessesForForm: businesses,
                message: messageFromRedirect,
                currentPage: page,
                searchQuery,
                roleFilter,
                companyFilter,
                pageSize
            });
        } else if (url.pathname === '/superadmin/providers') {
            const page = parseInt(url.searchParams.get('page') || '1', 10);
            const searchQuery = url.searchParams.get('search') || '';
            const pageSize = 10;
            const providers = await getProviders(supabase, { page, pageSize, searchQuery });
            pageContent = route.Cmp({ providers, message: messageFromRedirect, currentPage: page, searchQuery, pageSize });
        } else {
            pageContent = route.Cmp(userProfile);
        }
    }
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
    else {
        pageContent = route.Cmp(userProfile);
    }
    
    headers.set('Content-Type', 'text/html; charset=utf-8');
    return new Response(Layout(route.title, pageContent, userProfile), { headers });
  },
};