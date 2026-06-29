"use client";

import { useState } from "react";
import ProveedorModal from "./ProveedorModal";
import CompraModal from "./CompraModal";
import PagoProvModal from "./PagoProvModal";

type Compra = {
  id: number;
  folio?: string;
  descripcion?: string;
  total: number;
  pagado: number;
  estado: string;
  fecha_vencimiento?: string;
  pdf_url?: string;
};

type Proveedor = {
  id: number;
  nombre: string;
  empresa?: string;
  telefono?: string;
  rfc?: string;
  email?: string;
  direccion?: string;
  notas?: string;
  compras: Compra[];
  deudaTotal: number;
};

const fmt = (n: number) =>
  Number(n).toLocaleString("es-MX", { style: "currency", currency: "MXN" });

function estadoVenc(fecha?: string, saldo?: number) {
  if (!saldo || saldo <= 0.01) return { label: "Pagada", clase: "bg-green-100 text-green-700" };
  if (!fecha) return { label: "Pendiente", clase: "bg-amber-100 text-amber-700" };
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const venc = new Date(fecha + "T00:00:00");
  if (venc < hoy) return { label: "Vencida", clase: "bg-red-100 text-red-700" };
  const dias = Math.ceil((venc.getTime() - hoy.getTime()) / 86400000);
  if (dias <= 3) return { label: `Vence en ${dias}d`, clase: "bg-orange-100 text-orange-700" };
  return { label: "Al dia", clase: "bg-blue-100 text-blue-700" };
}

export default function ProveedoresVista({ proveedores }: { proveedores: Proveedor[] }) {
  const [busqueda, setBusqueda] = useState("");
  const [provModal, setProvModal] = useState(false);
  const [editProv, setEditProv] = useState<Proveedor | undefined>();
  const [compraDe, setCompraDe] = useState<Proveedor | null>(null);
  const [pagoDe, setPagoDe] = useState<Compra | null>(null);
  const [expandido, setExpandido] = useState<number | null>(null);

  const deudaGlobal = proveedores.reduce((s, p) => s + p.deudaTotal, 0);

  const filtrados = proveedores.filter((p) =>
    [p.nombre, p.empresa].filter(Boolean).join(" ").toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--peja-azul)]">Proveedores</h1>
          <p className="text-sm text-[var(--peja-pizarra)]">
            Cuentas por pagar · Deuda total:{" "}
            <span className="font-bold text-red-600">{fmt(deudaGlobal)}</span>
          </p>
        </div>
        <button
          onClick={() => { setEditProv(undefined); setProvModal(true); }}
          className="rounded-md bg-[var(--peja-azul)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--peja-azul-hover)]"
        >
          + Nuevo proveedor
        </button>
      </div>

      <input
        placeholder="Buscar proveedor..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="mb-4 w-full max-w-md rounded-md border border-[var(--peja-gris)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--peja-azul)]"
      />

      <div className="space-y-3">
        {filtrados.length === 0 ? (
          <div className="rounded-xl border border-[var(--peja-gris)] bg-white p-8 text-center text-[var(--peja-pizarra)]">
            Sin proveedores. Agrega el primero.
          </div>
        ) : (
          filtrados.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-xl border border-[var(--peja-gris)] bg-white">
              <div className="flex items-center justify-between p-4">
                <div className="flex-1 cursor-pointer" onClick={() => setExpandido(expandido === p.id ? null : p.id)}>
                  <div className="font-semibold text-[var(--peja-azul)]">{p.nombre}</div>
                  <div className="text-xs text-[var(--peja-pizarra)]">
                    {p.empresa || "—"} {p.telefono ? `· ${p.telefono}` : ""}
                  </div>
                </div>
                <div className="text-right mr-4">
                  <div className="text-xs text-[var(--peja-pizarra)]">Le debes</div>
                  <div className={`font-bold ${p.deudaTotal > 0 ? "text-red-600" : "text-green-600"}`}>
                    {p.deudaTotal > 0 ? fmt(p.deudaTotal) : "Al dia"}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setCompraDe(p)} className="rounded bg-[var(--peja-azul)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--peja-azul-hover)]">
                    + Deuda
                  </button>
                  <button onClick={() => { setEditProv(p); setProvModal(true); }} className="rounded px-2 py-1.5 text-xs font-medium text-[var(--peja-pizarra)] hover:bg-[var(--peja-neutro)]">
                    Editar
                  </button>
                </div>
              </div>

              {expandido === p.id && (
                <div className="border-t border-[var(--peja-gris)] bg-[var(--peja-neutro)] p-4">
                  {p.compras.length === 0 ? (
                    <p className="text-sm text-[var(--peja-pizarra)]">Sin deudas registradas.</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="text-left text-xs uppercase text-[var(--peja-pizarra)]">
                        <tr>
                          <th className="py-2">Folio</th>
                          <th className="py-2">Descripcion</th>
                          <th className="py-2 text-right">Total</th>
                          <th className="py-2 text-right">Saldo</th>
                          <th className="py-2">Vence</th>
                          <th className="py-2">Estado</th>
                          <th className="py-2 text-right">Accion</th>
                        </tr>
                      </thead>
                      <tbody>
                        {p.compras.map((c) => {
                          const saldo = Number(c.total) - Number(c.pagado);
                          const est = estadoVenc(c.fecha_vencimiento, saldo);
                          return (
                            <tr key={c.id} className="border-t border-[var(--peja-gris)]">
                              <td className="py-2 font-medium">{c.folio || "—"}</td>
                              <td className="py-2 text-[var(--peja-pizarra)]">{c.descripcion || "—"}</td>
                              <td className="py-2 text-right">{fmt(c.total)}</td>
                              <td className="py-2 text-right font-medium text-red-600">{fmt(saldo)}</td>
                              <td className="py-2 text-xs">{c.fecha_vencimiento ? new Date(c.fecha_vencimiento + "T00:00:00").toLocaleDateString("es-MX") : "—"}</td>
                              <td className="py-2">
                                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${est.clase}`}>{est.label}</span>
                              </td>
                              <td className="py-2 text-right">
                                {c.pdf_url && (
                                  <a href={c.pdf_url} target="_blank" rel="noopener noreferrer" className="mr-2 text-xs text-[var(--peja-azul)] hover:underline">PDF</a>
                                )}
                                {saldo > 0.01 && (
                                  <button onClick={() => setPagoDe(c)} className="rounded bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700">
                                    Pagar
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {provModal && <ProveedorModal proveedor={editProv} onClose={() => setProvModal(false)} />}
      {compraDe && <CompraModal proveedorId={compraDe.id} proveedorNombre={compraDe.nombre} onClose={() => setCompraDe(null)} />}
      {pagoDe && (
        <PagoProvModal
          compraId={pagoDe.id}
          folio={pagoDe.folio || "Deuda"}
          total={Number(pagoDe.total)}
          pagado={Number(pagoDe.pagado)}
          onClose={() => setPagoDe(null)}
        />
      )}
    </div>
  );
}