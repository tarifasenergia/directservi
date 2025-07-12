// /src/services/supabase.js

import { createServerClient } from '@supabase/ssr';

/**
 * Crea un cliente de Supabase para un entorno Server-Side.
 */
export const createSupabaseClient = (request, headers, env) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    throw new Error('Supabase URL and Anon Key must be provided.');
  }

  return createServerClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (key) => {
          const cookies = request.headers.get('Cookie');
          const cookieMap = {};
          if (cookies) {
            cookies.split(';').forEach(cookie => {
              const parts = cookie.trim().split('=');
              cookieMap[parts[0]] = parts[1];
            });
          }
          return cookieMap[key];
        },
        set: (key, value, options) => {
          let cookieString = `${key}=${value}`;
          for (const [k, v] of Object.entries(options)) {
            if (k === 'expires') {
              cookieString += `; Expires=${new Date(v).toUTCString()}`;
            } else if (typeof v === 'boolean') {
                if (v) cookieString += `; ${k}`;
            }
            else {
              cookieString += `; ${k}=${v}`;
            }
          }
          headers.append('Set-Cookie', cookieString);
        },
        remove: (key, options) => {
           let cookieString = `${key}=; Max-Age=-1`;
           for (const [k, v] of Object.entries(options)) {
             cookieString += `; ${k}=${v}`;
           }
           headers.append('Set-Cookie', cookieString);
        },
      },
    }
  );
};


// --- SERVICIOS DE DATOS ---

export async function getSuperAdminDashboardStats(supabase) {
    const { data, error } = await supabase.rpc('get_superadmin_dashboard_stats');
    if (error) {
        console.error('Error fetching superadmin dashboard stats:', error);
        return {
            companies_count: 0, businesses_count: 0, businesses_pending_count: 0,
            businesses_active_count: 0, users_count: 0, admins_count: 0,
            sellers_count: 0, base_rates_count: 0, total_proposals_count: 0
        };
    }
    return data;
}

export async function getUserProfile(supabase, userId) {
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*, role:roles(name)')
    .eq('id', userId)
    .single();

  if (profileError) {
    if (profileError.code !== 'PGRST116') {
        console.error('Error fetching user profile:', profileError);
    }
    return null;
  }
  
  if (!profile) return null;

  const userProfile = {
      ...profile,
      role_name: profile.role ? profile.role.name : null,
      business: null
  };

  if (profile.business_id) {
    const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select('*, style:business_styles(*)')
        .eq('id', profile.business_id)
        .single();
    
    if (businessError) {
        console.error(`Error fetching business details for business_id ${profile.business_id}:`, businessError);
    } else {
        const styleData = Array.isArray(business.style) ? business.style[0] : business.style;
        userProfile.business = { ...business, style: styleData };
    }
  }
  
  return userProfile;
}

// --- Funciones para Superadmin Users ---

export async function getAllUsersDetailed(supabase, { page = 1, pageSize = 10, searchQuery = '', roleFilter = '', companyFilter = '' } = {}) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
        .from('detailed_user_profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

    if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,business_name.ilike.%${searchQuery}%`);
    }
    if (roleFilter) {
        query = query.eq('role_name', roleFilter);
    }
    if (companyFilter) {
        query = query.eq('company_id', companyFilter);
    }
    
    const { data, error, count } = await query;
    if (error) console.error('Error fetching all users detailed:', error);
    return { data: data || [], count: count || 0, error };
}

export async function getSingleUserDetailed(supabase, userId) {
    const { data, error } = await supabase
        .from('detailed_user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
    if (error) console.error(`Error fetching single user ${userId}:`, error);
    return { data, error };
}

// --- Funciones para Superadmin Businesses/Companies ---

export async function getCompanies(supabase, { page = 1, pageSize = 10, searchQuery = '' } = {}) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
        .from('companies')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

    if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,cif.ilike.%${searchQuery}%`);
    }

    const { data, error, count } = await query;
    if (error) console.error('Error fetching companies:', error);
    return { data: data || [], count: count || 0, error };
}

export async function getBusinesses(supabase, { page = 1, pageSize = 10, searchQuery = '' } = {}) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
        .from('businesses')
        .select('*, company:companies(name)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);
        
    if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
    }

    const { data, error, count } = await query;
    if (error) console.error('Error fetching businesses:', error);
    return { data: data || [], count: count || 0, error };
}

export async function getBusinessWithStyle(supabase, businessId) {
    const { data, error } = await supabase
        .from('businesses')
        .select('*, company:companies(name), style:business_styles(*)')
        .eq('id', businessId)
        .single();
    
    if (error) {
        console.error('Error fetching business with style:', error);
        return { data: null, error };
    }
    
    const styleData = Array.isArray(data.style) ? data.style[0] : data.style;
    const finalData = { ...data, style: styleData };

    return { data: finalData, error: null };
}

export async function getAllCompanies(supabase) {
    const { data, error } = await supabase.from('companies').select('id, name').order('name', {ascending: true});
    if (error) console.error('Error fetching all companies:', error);
    return data || [];
}

export async function getAllBusinesses(supabase) {
    const { data, error } = await supabase.from('businesses').select('id, name').order('name', {ascending: true});
    if (error) console.error('Error fetching all businesses:', error);
    return data || [];
}

// --- Funciones generales y reutilizables ---

export async function deleteEntity(supabase, { tableName, id, isAdminDelete = false, adminSupabase = null }) {
    if (isAdminDelete && tableName === 'users') {
        if (!adminSupabase) throw new Error('Admin Supabase client is required for deleting users.');
        const { error } = await adminSupabase.auth.admin.deleteUser(id);
        if (error) console.error(`Error deleting user from auth with id ${id}:`, error);
        return { error };
    }
    
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) console.error(`Error deleting from ${tableName} with id ${id}:`, error);
    return { error };
}

export async function getUsersByBusiness(supabase, businessId) {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*, role:roles(name), auth_user:users(email)')
        .eq('business_id', businessId);

    if (error) {
        console.error('Error fetching users by business:', error);
        return [];
    }
    return data.map(u => ({ ...u, email: u.auth_user?.email || 'N/A' }));
}

export async function getProviders(supabase, { page = 1, pageSize = 10, searchQuery = '' } = {}) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
        .from('providers')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

    if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
    }

    const { data, error, count } = await query;
    if (error) console.error('Error fetching providers:', error);
    return { data: data || [], count: count || 0, error };
}

export async function getRoles(supabase) {
    const { data, error } = await supabase.from('roles').select('*');
    if (error) console.error('Error fetching roles:', error);
    return data || [];
}