import { supabaseAdmin } from "@/lib/supabase/admin";
import { NEGOCIO } from "@/lib/negocio";
import Logo from "@/components/Logo";
import BotonImprimir from "./BotonImprimir";
import Link from "next/link";
import { notFound } from "next/navigation";

const TIPO_TITULO: Record<string, string> = {
  cotizacion: "COTIZACION",
  nota: "NOTA DE VENTA",
  remision: "REMISION",
};

export default async function DocumentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: doc } = await supabaseAdmin
    .from("documentos")
    .select("*, clientes(nombre, empresa, rfc, telefono, direccion, ciudad)")
    .eq("id", id)
    .single();

  if (!doc) notFound();

  const { data: items } = await supabaseAdmin
    .from("documento_items")
    .select("*")
    .eq("documento_id", id)
    .order("id");

  const cliente = Array.isArray(doc.clientes) ? doc.clientes[0] : doc.clientes;

  const fmt = (n: number) =>
    Number(n).toLocaleString("es-MX", { style: "currency", currency: "MXN" });

  const fecha = new Date(doc.fecha).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const saldo = Number(doc.total) - Number(doc.monto_pagado);
  const esCotizacion = doc.tipo === "cotizacion";

  return (
    <div>
      {/* Barra de acciones (no se imprime) */}
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link
          href="/documentos"
          className="text-sm font-medium text-[var(--peja-pizarra)] hover:text-[var(--peja-azul)]"
        >
          &larr; Volver a documentos
        </Link>
        <BotonImprimir />
      </div>

      {/* HOJA DEL DOCUMENTO */}
      <div className="mx-auto max-w-3xl bg-white p-10 shadow-sm print:max-w-none print:p-0 print:shadow-none">
        {/* Encabezado */}
        <div className="flex items-start justify-between border-b-2 border-[var(--peja-azul)] pb-5">
          <div className="flex items-center gap-3">
            <Logo size={56} />
            <div>
              <div className="text-xl font-bold text-[var(--peja-azul)]">
                {NEGOCIO.razonSocial}
              </div>
              <div className="text-xs text-[var(--peja-pizarra)]">Tlapaleria y Ferreteria</div>
              <div className="mt-1 text-xs text-gray-600">{NEGOCIO.direccion}</div>
              <div className="text-xs text-gray-600">
                Tel: {NEGOCIO.telefono} · {NEGOCIO.correo}
              </div>
              <div className="text-xs text-gray-600">RFC: {NEGOCIO.rfc}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-[var(--peja-azul)]">
              {TIPO_TITULO[doc.tipo] ?? doc.tipo}
            </div>
            <div className="mt-1 text-sm font-semibold">{doc.folio}</div>
            <div className="text-xs text-gray-600">{fecha}</div>
          </div>
        </div>

        {/* Cliente */}
        <div className="mt-5 rounded-md bg-[var(--peja-neutro)] p-4 text-sm print:bg-gray-50">
          <div className="mb-1 text-xs font-semibold uppercase text-[var(--peja-pizarra)]">
            Cliente
          </div>
          {cliente ? (
            <div>
              <div className="font-semibold">{cliente.nombre}</div>
              {cliente.empresa && <div className="text-gray-600">{cliente.empresa}</div>}
              <div className="text-gray-600">
                {[cliente.rfc && `RFC: ${cliente.rfc}`, cliente.telefono, cliente.ciudad]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            </div>
          ) : (
            <div className="font-semibold">Publico general</div>
          )}
        </div>

        {/* Partidas */}
        <table className="mt-5 w-full text-sm">
          <thead>
            <tr className="border-b border-gray-300 text-left text-xs uppercase text-[var(--peja-pizarra)]">
              <th className="py-2">Descripcion</th>
              <th className="w-16 py-2 text-right">Cant.</th>
              <th className="w-28 py-2 text-right">P. Unit.</th>
              <th className="w-28 py-2 text-right">Importe</th>
            </tr>
          </thead>
          <tbody>
            {(items ?? []).map((it) => (
              <tr key={it.id} className="border-b border-gray-100">
                <td className="py-2">{it.descripcion}</td>
                <td className="py-2 text-right">{Number(it.cantidad)}</td>
                <td className="py-2 text-right">{fmt(it.precio_unitario)}</td>
                <td className="py-2 text-right">{fmt(it.importe)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totales */}
        <div className="mt-4 flex justify-end">
          <div className="w-64 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Subtotal</span>
              <span>{fmt(doc.subtotal)}</span>
            </div>
            {doc.aplica_iva && (
              <div className="flex justify-between py-1">
                <span className="text-gray-600">IVA 16%</span>
                <span>{fmt(doc.iva)}</span>
              </div>
            )}
            <div className="mt-1 flex justify-between border-t-2 border-[var(--peja-azul)] py-2 text-base font-bold text-[var(--peja-azul)]">
              <span>TOTAL</span>
              <span>{fmt(doc.total)}</span>
            </div>
            {!esCotizacion && (
              <>
                <div className="flex justify-between py-1 text-green-700">
                  <span>Pagado</span>
                  <span>{fmt(doc.monto_pagado)}</span>
                </div>
                <div className="flex justify-between py-1 font-semibold text-red-600">
                  <span>Saldo</span>
                  <span>{fmt(saldo)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Notas / vigencia */}
        {doc.notas && (
          <div className="mt-5 text-xs text-gray-600">
            <span className="font-semibold">Notas: </span>
            {doc.notas}
          </div>
        )}
        {esCotizacion && (
          <div className="mt-2 text-xs italic text-gray-500">
            Cotizacion valida por 15 dias. Precios sujetos a cambio sin previo aviso.
          </div>
        )}

        {/* Pie */}
        <div className="mt-10 border-t border-gray-200 pt-4 text-center text-xs text-gray-400">
          {NEGOCIO.razonSocial} · Gracias por su preferencia
        </div>
      </div>
    </div>
  );
}