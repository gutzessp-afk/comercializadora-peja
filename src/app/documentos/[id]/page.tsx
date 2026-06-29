import { supabaseAdmin } from "@/lib/supabase/admin";
import { NEGOCIO } from "@/lib/negocio";
import Logo from "@/components/Logo";
import BotonImprimir from "./BotonImprimir";
import QrFacturacion from "./QrFacturacion";
import Link from "next/link";
import { notFound } from "next/navigation";

const TIPO_TITULO: Record<string, string> = {
  cotizacion: "COTIZACIÓN",
  nota: "NOTA DE VENTA",
  remision: "REMISIÓN",
};

const FILAS_FIJAS = 16;

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
    Number(n).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const fecha = new Date(doc.fecha).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const partidas = items ?? [];
  const vacias = Math.max(0, FILAS_FIJAS - partidas.length);
  const esCotizacion = doc.tipo === "cotizacion";
  const nombreCliente = cliente?.nombre || "Público general";

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

      {/* HOJA */}
      <div className="doc-hoja mx-auto max-w-3xl bg-white p-8 shadow-sm print:max-w-none print:p-0 print:shadow-none">
        {/* ENCABEZADO */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Logo size={60} />
            <div>
              <div className="text-2xl font-bold leading-tight">
                <span className="text-[var(--peja-azul)]">COMERCIALIZADORA</span>{" "}
                <span className="text-[var(--peja-pizarra)]">PEJA</span>
              </div>
              <div className="text-[10px] font-bold tracking-wider text-[#78909C]">
                PLOMERÍA · TLAPALERÍA · FERRETERÍA
              </div>
              <div className="mt-1 max-w-xs text-[10px] text-gray-500">
                Compra, venta y distribución de material y accesorios de tlapalería y
                plomería en general.
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="rounded bg-[var(--peja-azul)] px-5 py-2 text-sm font-bold text-white">
              {TIPO_TITULO[doc.tipo] ?? doc.tipo}
            </div>
            <div className="mt-2 text-xs text-[var(--peja-pizarra)]">
              Folio <span className="font-bold text-[var(--peja-azul)]">{doc.folio}</span>
            </div>
          </div>
        </div>

        {/* Direccion */}
        <div className="my-3 border-t-2 border-[var(--peja-azul)] pt-2 text-center text-[10px] text-gray-500">
          {NEGOCIO.direccion}, Col. Casco de San Juan · C.P. 56600 · Chalco, Estado de México
        </div>

        {/* CLIENTE + FECHA */}
        <div className="mt-2 grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-md border border-[var(--peja-gris)] p-3">
            <div className="mb-1">
              <span className="font-bold text-[var(--peja-pizarra)]">CLIENTE: </span>
              <span>{nombreCliente}</span>
            </div>
            <div>
              <span className="font-bold text-[var(--peja-pizarra)]">TEL/CONTACTO: </span>
              <span>{cliente?.telefono || ""}</span>
            </div>
          </div>
          <div className="rounded-md border border-[var(--peja-gris)] p-3">
            <div className="mb-1 flex justify-between">
              <span className="font-bold text-[var(--peja-pizarra)]">FECHA:</span>
              <span>{fecha}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-[var(--peja-pizarra)]">VIGENCIA:</span>
              <span>15 DÍAS HÁB.</span>
            </div>
          </div>
        </div>

        {/* TABLA */}
        <table className="mt-3 w-full border-collapse text-xs">
          <thead>
            <tr className="bg-[var(--peja-azul)] text-white">
              <th className="border border-[var(--peja-azul)] px-1 py-1.5 text-center font-bold" style={{ width: "6%" }}>No.</th>
              <th className="border border-[var(--peja-azul)] px-1 py-1.5 text-center font-bold" style={{ width: "12%" }}>CANTIDAD</th>
              <th className="border border-[var(--peja-azul)] px-2 py-1.5 text-left font-bold">DESCRIPCIÓN DEL ARTÍCULO</th>
              <th className="border border-[var(--peja-azul)] px-1 py-1.5 text-center font-bold" style={{ width: "15%" }}>P. UNITARIO</th>
              <th className="border border-[var(--peja-azul)] px-1 py-1.5 text-center font-bold" style={{ width: "16%" }}>IMPORTE</th>
            </tr>
          </thead>
          <tbody>
            {partidas.map((it, i) => (
              <tr key={it.id}>
                <td className="border border-[var(--peja-gris)] px-1 py-1.5 text-center text-gray-500">{i + 1}</td>
                <td className="border border-[var(--peja-gris)] px-1 py-1.5 text-center">{Number(it.cantidad)}</td>
                <td className="border border-[var(--peja-gris)] px-2 py-1.5">{it.descripcion}</td>
                <td className="border border-[var(--peja-gris)] px-2 py-1.5 text-right">{fmt(it.precio_unitario)}</td>
                <td className="border border-[var(--peja-gris)] px-2 py-1.5 text-right">{fmt(it.importe)}</td>
              </tr>
            ))}
            {Array.from({ length: vacias }).map((_, i) => (
              <tr key={`v${i}`}>
                <td className="border border-[var(--peja-gris)] px-1 py-1.5 text-center text-gray-400">{partidas.length + i + 1}</td>
                <td className="border border-[var(--peja-gris)] px-1 py-1.5">&nbsp;</td>
                <td className="border border-[var(--peja-gris)] px-2 py-1.5 text-gray-300">—</td>
                <td className="border border-[var(--peja-gris)] px-2 py-1.5"></td>
                <td className="border border-[var(--peja-gris)] px-2 py-1.5"></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* OBSERVACIONES + TOTALES */}
        <div className="mt-3 flex gap-3">
          <div className="flex-1">
            <div className="mb-1 text-[11px] font-bold text-[var(--peja-azul)]">OBSERVACIONES:</div>
            <div className="whitespace-pre-line rounded-md border border-[var(--peja-gris)] p-3 text-[10px] text-gray-600">
              {doc.notas || ""}
            </div>
            {/* QR de facturacion */}
            <div className="mt-3">
              <QrFacturacion folio={doc.folio} total={Number(doc.total)} cliente={nombreCliente} />
            </div>
          </div>
          <div className="w-60 text-xs">
            <div className="flex justify-between border-b border-gray-200 px-2 py-1.5">
              <span className="font-semibold text-[var(--peja-pizarra)]">SUBTOTAL</span>
              <span>${fmt(doc.subtotal)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 px-2 py-1.5">
              <span className="font-semibold text-[var(--peja-pizarra)]">
                DESCUENTO {Number(doc.descuento_pct) > 0 ? `(${Number(doc.descuento_pct)}%)` : ""}
              </span>
              <span className="text-red-600">-${fmt(doc.descuento_monto || 0)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 px-2 py-1.5">
              <span className="font-semibold text-[var(--peja-pizarra)]">IVA (16%)</span>
              <span>${fmt(doc.iva)}</span>
            </div>
            <div className="flex justify-between bg-[var(--peja-azul)] px-2 py-2 text-sm font-bold text-white">
              <span>TOTAL</span>
              <span>${fmt(doc.total)}</span>
            </div>
            {!esCotizacion && (
              <>
                <div className="flex justify-between px-2 py-1 text-green-700">
                  <span>PAGADO</span>
                  <span>${fmt(doc.monto_pagado)}</span>
                </div>
                <div className="flex justify-between px-2 py-1 font-semibold text-red-600">
                  <span>SALDO</span>
                  <span>${fmt(Number(doc.total) - Number(doc.monto_pagado))}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* FIRMAS */}
        <div className="mt-10 grid grid-cols-2 gap-10 text-center text-[10px] text-[#78909C]">
          <div>
            <div className="mx-8 border-t border-gray-400 pt-1">ATENDIÓ</div>
          </div>
          <div>
            <div className="mx-8 border-t border-gray-400 pt-1">AUTORIZADO POR</div>
          </div>
        </div>

        {/* PIE */}
        <div className="mt-6 text-center text-[9px] text-gray-400">
          COMERCIALIZADORA PEJA · Tel: {NEGOCIO.telefono} · Chalco, Estado de México
        </div>
      </div>
    </div>
  );
}