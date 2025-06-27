// /services/supabase.js

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

/**
 * Obtiene el perfil completo de un usuario.
 * Esta nueva versión separa las consultas para evitar errores de RLS con joins anidados.
 * @param {object} supabase - Cliente de Supabase.
 * @param {string} userId - El ID del usuario.
 * @returns {Promise<object|null>} El perfil del usuario o null si no se encuentra.
 */
export async function getUserProfile(supabase, userId) {
  // --- PASO 1: Obtener el perfil base y el rol ---
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*, role:roles(name)')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error('Error fetching user profile (step 1):', profileError);
    return null;
  }
  
  if (!profile) return null;

  // Aplanar el rol para fácil acceso
  const userProfile = {
      ...profile,
      role_name: profile.role ? profile.role.name : null,
      business: null // Inicializar business como null
  };

  // --- PASO 2: Si el usuario tiene un business_id, obtener los datos de ese negocio ---
  if (profile.business_id) {
    const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select('*, style:business_styles(*)')
        .eq('id', profile.business_id)
        .single();
    
    if (businessError) {
        console.error(`Error fetching business details for business_id ${profile.business_id}:`, businessError);
        // Devolvemos el perfil sin los datos del negocio si falla, para no romper la app
        return userProfile;
    }

    // Adjuntar los datos del negocio y sus estilos al perfil del usuario
    userProfile.business = business;
  }
  
  return userProfile;
}


// --- El resto de las funciones de servicio permanecen igual ---

export async function getCompanies(supabase) {
    const { data, error } = await supabase.from('companies').select('*');
    if (error) console.error('Error fetching companies:', error);
    return data || [];
}

export async function getBusinesses(supabase) {
    const { data, error } = await supabase
        .from('businesses')
        .select('*, company:companies(name)');
    if (error) console.error('Error fetching businesses:', error);
    return data || [];
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
    return data.map(u => ({ ...u, email: u.auth_user.email }));
}

export async function getRatesByBusiness(supabase, businessId) {
    const { data, error } = await supabase
        .from('rates')
        .select('*, provider:providers(name, logo_url)')
        .eq('business_id', businessId)
        .eq('is_active', true);

    if (error) {
        console.error('Error fetching rates by business:', error);
        return [];
    }
    return data;
}

export async function getProviders(supabase) {
    const { data, error } = await supabase.from('providers').select('*');
    if (error) console.error('Error fetching providers:', error);
    return data || [];
}

export async function getProposalsByUser(supabase, userId) {
    const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('created_by_user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching proposals by user:', error);
        return [];
    }
    return data;
}

export async function getRoles(supabase) {
    const { data, error } = await supabase.from('roles').select('*');
    if (error) console.error('Error fetching roles:', error);
    return data || [];
}