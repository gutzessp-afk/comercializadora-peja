import { supabaseAdmin } from "@/lib/supabase/admin";
import ProveedoresVista from "./ProveedoresVista";

export default async function ProveedoresPage() {
  const { data: proveedores } = await supabaseAdmin
    .from("proveedores")
    .select("*")
    .order("nombre");

  const { data: compras } = await supabaseAdmin
    .from("compras")
    .select("id, proveedor_id, folio, descripcion, total, estado, fecha_vencimiento, pdf_url");

  const { data: pagos } = await supabaseAdmin
    .from("pagos_proveedor")
    .select("compra_id, monto");

  // Sumar pagos por compra
  const pagadoPorCompra: Record<number, number> = {};
  (pagos ?? []).forEach((pg) => {
    pagadoPorCompra[pg.compra_id] = (pagadoPorCompra[pg.compra_id] ?? 0) + Number(pg.monto);
  });

  const lista = (proveedores ?? []).map((p) => {
    const comprasProv = (compras ?? [])
      .filter((c) => c.proveedor_id === p.id)
      .map((c) => ({
        ...c,
        pagado: pagadoPorCompra[c.id] ?? 0,
      }));
    const deudaTotal = comprasProv.reduce(
      (s, c) => s + (Number(c.total) - Number(c.pagado)),
      0
    );
    return { ...p, compras: comprasProv, deudaTotal };
  });

  return <ProveedoresVista proveedores={lista} />;
}