import {createClient} from '@supabase/supabase-js';
export const sb=createClient(import.meta.env.VITE_SUPABASE_URL,import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
export const asset=u=>u&&u.startsWith('/')?import.meta.env.BASE_URL+u.slice(1):u;
