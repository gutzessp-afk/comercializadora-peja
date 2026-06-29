"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type ProveedorInput = {
  nombre: string;
  empresa?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  rfc?: string;
  notas?: string;
};

export async function crearProveedor(data: ProveedorInput) {
  const { error } = await supabaseAdmin.from("proveedores").insert(data);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/proveedores");
  return { ok: true };
}

export async function actualizarProveedor(id: number, data: ProveedorInput) {
  const { error } = await supabaseAdmin.from("proveedores").update(data).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/proveedores");
  return { ok: true };
}

export async function eliminarProveedor(id: number) {
  const { error } = await supabaseAdmin.from("proveedores").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/proveedores");
  return { ok: true };
}

// Registrar una compra (lo que le debes)
export async function crearCompra(data: {
  proveedor_id: number;
  folio: string;
  descripcion: string;
  total: number;
  fecha_vencimiento: string | null;
  pdf_url: string | null;
}) {
  const { error } = await supabaseAdmin.from("compras").insert({
    proveedor_id: data.proveedor_id,
    folio: data.folio || null,
    descripcion: data.descripcion || null,
    total: data.total,
    fecha_vencimiento: data.fecha_vencimiento,
    pdf_url: data.pdf_url,
    estado: "pendiente",
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/proveedores");
  return { ok: true };
}

// Registrar un pago a proveedor (abono)
export async function registrarPagoProveedor(
  compraId: number,
  monto: number,
  metodo: string,
  notas?: string
) {
  if (monto <= 0) return { ok: false, error: "Monto invalido" };

  const { data: compra } = await supabaseAdmin
    .from("compras")
    .select("total")
    .eq("id", compraId)
    .single();
  if (!compra) return { ok: false, error: "Compra no encontrada" };

  const { error: errPago } = await supabaseAdmin.from("pagos_proveedor").insert({
    compra_id: compraId,
    monto,
    metodo,
    notas: notas ?? null,
  });
  if (errPago) return { ok: false, error: errPago.message };

  // Recalcular cuanto se ha pagado
  const { data: pagos } = await supabaseAdmin
    .from("pagos_proveedor")
    .select("monto")
    .eq("compra_id", compraId);
  const pagado = (pagos ?? []).reduce((s, p) => s + Number(p.monto), 0);

  let estado: "pendiente" | "parcial" | "pagada" = "pendiente";
  if (pagado >= Number(compra.total)) estado = "pagada";
  else if (pagado > 0) estado = "parcial";

  await supabaseAdmin.from("compras").update({ estado }).eq("id", compraId);

  revalidatePath("/proveedores");
  return { ok: true };
}