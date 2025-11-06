import { createClient, SupabaseClient } from '@supabase/supabase-js';

// The Vite bundler will replace import.meta.env with the actual environment variables at build time.
// This is the standard way to handle environment variables in Vite projects.
// FIX: Safely access import.meta.env to prevent crashes when not in a Vite environment.
const env = (import.meta as any).env;
const supabaseUrl = env?.VITE_SUPABASE_URL;
const supabaseAnonKey = env?.VITE_SUPABASE_ANON_KEY;


// FIX: Export `supabase` as a mutable `let` variable to allow it to be re-initialized at runtime.
export let supabase: SupabaseClient;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn("Supabase URL or Anon Key is missing. The app will require configuration via the setup UI.");
  // Create a dummy client to prevent crashes on import; it will fail on any actual API call.
  supabase = createClient('http://localhost:54321', 'dummy-key');
}


/**
 * FIX: Implement and export setSupabaseCredentials to resolve the import error in Database.tsx.
 * This function allows setting Supabase credentials at runtime, tests the connection,
 * and re-initializes the shared Supabase client instance used throughout the app.
 * @param url The Supabase project URL.
 * @param key The Supabase anon (public) key.
 * @returns A promise that resolves to true if the connection is successful, false otherwise.
 */
export const setSupabaseCredentials = async (url: string, key: string): Promise<boolean> => {
    try {
        const testClient = createClient(url, key);
        // Test connection by making a simple request.
        // A "table not found" error is acceptable and indicates a successful connection.
        // A network or auth key error indicates failure.
        const { error } = await testClient.from('accounts').select('id', { count: 'exact', head: true });

        if (error && error.message.includes('Invalid API key')) {
            console.error("Supabase connection test failed: Invalid API key.");
            return false;
        }
        if (error && (error.message.includes('fetch') || error.message.includes('NetworkError'))) {
            console.error("Supabase connection test failed: Network error or invalid URL.", error);
            return false;
        }

        // Credentials seem valid. Re-initialize the main client.
        // The `let` export allows this reassignment to be visible to other modules.
        supabase = createClient(url, key);
        return true;
    } catch (e) {
        console.error("Error setting Supabase credentials:", e);
        return false;
    }
};