import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function getUsuarioActual() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: perfil } = await supabaseAdmin
    .from("perfiles")
    .select("nombre, rol")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email,
    nombre: perfil?.nombre ?? "",
    rol: (perfil?.rol ?? "usuario") as "admin" | "usuario",
  };
}