import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function useUserRole(userId) {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setRole(null);
      setLoading(false);
      return;
    }

    const getRole = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Role fetch error:", error.message);
        setRole(null);
      } else {
        setRole(data?.role || null);
      }

      setLoading(false);
    };

    getRole();
  }, [userId]);

  return { role, loading };
}