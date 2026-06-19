"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type ClienteInput = {
  nombre: string;
  empresa?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  rfc?: string;
  notas?: string;
};

export async function crearCliente(data: ClienteInput) {
  const { error } = await supabaseAdmin.from("clientes").insert(data);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/clientes");
  return { ok: true };
}

export async function actualizarCliente(id: number, data: ClienteInput) {
  const { error } = await supabaseAdmin
    .from("clientes")
    .update(data)
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/clientes");
  return { ok: true };
}

export async function eliminarCliente(id: number) {
  const { error } = await supabaseAdmin.from("clientes").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/clientes");
  return { ok: true };
}