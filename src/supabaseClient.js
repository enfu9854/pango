import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xeaskmhhuyptleufurcp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlYXNrbWhodXlwdGxldWZ1cmNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNjY1NzQsImV4cCI6MjA5ODk0MjU3NH0.dJ5OyiRrwUUMz9f0omaeAdhI8u94xc0xajREU7IoCeE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
