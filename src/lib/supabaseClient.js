import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ncvabifyzegmayrzvtfd.supabase.co";
const supabaseAnonKey = "sb_publishable_xFeuDca6_E9g4x-R_xH2ZA_8Gn2Jyb5";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);