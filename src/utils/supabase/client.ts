import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

let supabaseInstance: any = null;

// Create a lazy-loaded singleton Supabase client instance
export const supabase = new Proxy({} as any, {
  get(_target, prop) {
    if (!supabaseInstance) {
      supabaseInstance = createClient(
        `https://${projectId}.supabase.co`,
        publicAnonKey
      );
    }
    return supabaseInstance[prop];
  }
});
