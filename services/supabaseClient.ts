
import { createClient } from '@supabase/supabase-js';

// هاته المتغيرات يجب أن تكون متوفرة في البيئة، نفترض وجودها كما هو الحال مع API_KEY
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
