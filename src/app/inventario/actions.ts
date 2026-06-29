"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type ProductoInput = {
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria_id: number | null;
  marca?: string;
  unidad: string;
  precio_compra: number;
  precio_venta: number;
  stock: number;
  stock_minimo: number;
  ubicacion?: string;
  activo: boolean;
};

export async function crearProducto(data: ProductoInput) {
  const { data: nuevo, error } = await supabaseAdmin
    .from("productos")
    .insert(data)
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/inventario");
  return { ok: true, id: nuevo.id };
}

export async function actualizarProducto(id: number, data: Partial<ProductoInput>) {
  const { error } = await supabaseAdmin
    .from("productos")
    .update(data)
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/inventario");
  return { ok: true };
}

export async function eliminarProducto(id: number) {
  const { error } = await supabaseAdmin.from("productos").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/inventario");
  return { ok: true };
}