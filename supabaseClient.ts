import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xzohvdsxlfoknbqwijlq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6b2h2ZHN4bGZva25icXdpamxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzOTE4OTgsImV4cCI6MjA2Nzk2Nzg5OH0.vJHpyKtS6wIqIZH9NkoCqq6zpz28VbxvTAPu-OIiMoQ';

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL or anonymous key is missing.');
}

// In a real app, you would define your database schema here for type safety
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
