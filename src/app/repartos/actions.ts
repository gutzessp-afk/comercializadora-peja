"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function crearReparto(fecha: string, destino: string, chofer: string) {
  const { data, error } = await supabaseAdmin
    .from("repartos")
    .insert({ fecha, destino: destino || "Chimalhuacan", chofer: chofer || null })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/repartos");
  return { ok: true, id: data.id };
}

export async function asignarDocumento(documentoId: number, repartoId: number) {
  const { error } = await supabaseAdmin
    .from("documentos")
    .update({ reparto_id: repartoId })
    .eq("id", documentoId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/repartos/${repartoId}`);
  return { ok: true };
}

export async function quitarDocumento(documentoId: number, repartoId: number) {
  const { error } = await supabaseAdmin
    .from("documentos")
    .update({ reparto_id: null })
    .eq("id", documentoId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/repartos/${repartoId}`);
  return { ok: true };
}

export async function cambiarEstadoReparto(repartoId: number, estado: string) {
  const { error } = await supabaseAdmin
    .from("repartos")
    .update({ estado })
    .eq("id", repartoId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/repartos/${repartoId}`);
  revalidatePath("/repartos");
  return { ok: true };
}

export async function eliminarReparto(repartoId: number) {
  await supabaseAdmin
    .from("documentos")
    .update({ reparto_id: null })
    .eq("reparto_id", repartoId);
  const { error } = await supabaseAdmin
    .from("repartos")
    .delete()
    .eq("id", repartoId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/repartos");
  return { ok: true };
}