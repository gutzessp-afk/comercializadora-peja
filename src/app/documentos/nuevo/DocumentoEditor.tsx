"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearDocumento, type Partida } from "../actions";

type Cliente = { id: number; nombre: string; empresa?: string };
type Producto = { id: number; codigo: string; nombre: string; precio_venta: number };

const TIPOS = [
  { v: "cotizacion", label: "Cotizacion" },
  { v: "nota", label: "Nota" },
  { v: "remision", label: "Remision" },
] as const;

const OBS_DEFAULT =
  "Entrega de material de 2 a 3 dias habiles.\nAnticipo del 50% al hacer el pedido, 50% restante a la entrega del material.\nPrecios sujetos a cambio sin previo aviso.";

export default function DocumentoEditor({
  clientes,
  productos,
}: {
  clientes: Cliente[];
  productos: Producto[];
}) {
  const router = useRouter();
  const [tipo, setTipo] = useState<"cotizacion" | "nota" | "remision">("cotizacion");
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [aplicaIva, setAplicaIva] = useState(true);
  const [descuentoPct, setDescuentoPct] = useState(0);
  const [notas, setNotas] = useState(OBS_DEFAULT);
  const [partidas, setPartidas] = useState<Partida[]>([
    { descripcion: "", cantidad: 1, precio_unitario: 0, importe: 0 },
  ]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  // que fila tiene el buscador abierto
  const [buscando, setBuscando] = useState<number | null>(null);

  function actualizarPartida(i: number, campo: keyof Partida, valor: string) {
    setPartidas((prev) => {
      const copia = [...prev];
      const p = { ...copia[i] };
      if (campo === "descripcion") p.descripcion = valor;
      else if (campo === "cantidad") p.cantidad = parseFloat(valor) || 0;
      else if (campo === "precio_unitario") p.precio_unitario = parseFloat(valor) || 0;
      p.importe = p.cantidad * p.precio_unitario;
      copia[i] = p;
      return copia;
    });
  }

  function elegirProducto(i: number, prod: Producto) {
    setPartidas((prev) => {
      const copia = [...prev];
      const p = { ...copia[i] };
      p.descripcion = prod.nombre;
      p.precio_unitario = Number(prod.precio_venta);
      p.importe = p.cantidad * p.precio_unitario;
      copia[i] = p;
      return copia;
    });
    setBuscando(null);
  }

  function agregarLinea() {
    setPartidas((p) => [...p, { descripcion: "", cantidad: 1, precio_unitario: 0, importe: 0 }]);
  }
  function quitarLinea(i: number) {
    setPartidas((p) => p.filter((_, idx) => idx !== i));
  }

  const subtotal = partidas.reduce((s, p) => s + p.importe, 0);
  const descuentoMonto = subtotal * (descuentoPct / 100);
  const base = subtotal - descuentoMonto;
  const iva = aplicaIva ? base * 0.16 : 0;
  const total = base + iva;

  const fmt = (n: number) => n.toLocaleString("es-MX", { style: "currency", currency: "MXN" });

  async function guardar() {
    const validas = partidas.filter((p) => p.descripcion.trim() && p.importe > 0);
    if (validas.length === 0) {
      setError("Agrega al menos una partida con descripcion y precio");
      return;
    }
    setGuardando(true);
    setError("");
    const res = await crearDocumento({
      tipo,
      cliente_id: clienteId,
      aplica_iva: aplicaIva,
      descuento_pct: descuentoPct,
      notas,
      partidas: validas,
    });
    setGuardando(false);
    if (res.ok) router.push("/documentos");
    else setError(res.error ?? "Error al guardar");
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6 rounded-xl border border-[var(--peja-gris)] bg-white p-5">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--peja-pizarra)]">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as typeof tipo)}
              className="w-full rounded-md border border-[var(--peja-gris)] px-3 py-2 text-sm outline-none focus:border-[var(--peja-azul)]"
            >
              {TIPOS.map((t) => (
                <option key={t.v} value={t.v}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-xs font-medium text-[var(--peja-pizarra)]">Cliente</label>
            <select
              value={clienteId ?? ""}
              onChange={(e) => setClienteId(e.target.value ? Number(e.target.value) : null)}
              className="w-full rounded-md border border-[var(--peja-gris)] px-3 py-2 text-sm outline-none focus:border-[var(--peja-azul)]"
            >
              <option value="">Sin cliente / publico general</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}{c.empresa ? ` - ${c.empresa}` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mb-6 overflow-visible rounded-xl border border-[var(--peja-gris)] bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[var(--peja-neutro)] text-left text-xs uppercase text-[var(--peja-pizarra)]">
            <tr>
              <th className="px-4 py-3 font-semibold">Descripcion</th>
              <th className="w-24 px-4 py-3 font-semibold">Cant.</th>
              <th className="w-32 px-4 py-3 font-semibold">P. Unitario</th>
              <th className="w-32 px-4 py-3 text-right font-semibold">Importe</th>
              <th className="w-12 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {partidas.map((p, i) => {
              const coincidencias =
                buscando === i && p.descripcion.trim().length >= 2
                  ? productos
                      .filter((pr) =>
                        `${pr.codigo} ${pr.nombre}`
                          .toLowerCase()
                          .includes(p.descripcion.toLowerCase())
                      )
                      .slice(0, 6)
                  : [];
              return (
                <tr key={i} className="border-t border-[var(--peja-gris)]">
                  <td className="relative px-2 py-2">
                    <input
                      value={p.descripcion}
                      onChange={(e) => {
                        actualizarPartida(i, "descripcion", e.target.value);
                        setBuscando(i);
                      }}
                      onFocus={() => setBuscando(i)}
                      placeholder="Buscar producto o escribir libre..."
                      className="w-full rounded border border-transparent px-2 py-1.5 outline-none focus:border-[var(--peja-azul)]"
                    />
                    {coincidencias.length > 0 && (
                      <div className="absolute left-2 right-2 top-full z-20 mt-1 max-h-52 overflow-y-auto rounded-md border border-[var(--peja-gris)] bg-white shadow-lg">
                        {coincidencias.map((pr) => (
                          <button
                            key={pr.id}
                            onClick={() => elegirProducto(i, pr)}
                            className="flex w-full items-center justify-between px-3 py-2 text-left text-xs hover:bg-[var(--peja-neutro)]"
                          >
                            <span>
                              <span className="font-semibold text-[var(--peja-azul)]">{pr.codigo}</span>{" "}
                              {pr.nombre}
                            </span>
                            <span className="text-[var(--peja-pizarra)]">{fmt(Number(pr.precio_venta))}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      value={p.cantidad}
                      onChange={(e) => actualizarPartida(i, "cantidad", e.target.value)}
                      className="w-full rounded border border-transparent px-2 py-1.5 text-right outline-none focus:border-[var(--peja-azul)]"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      value={p.precio_unitario}
                      onChange={(e) => actualizarPartida(i, "precio_unitario", e.target.value)}
                      className="w-full rounded border border-transparent px-2 py-1.5 text-right outline-none focus:border-[var(--peja-azul)]"
                    />
                  </td>
                  <td className="px-4 py-2 text-right font-medium">{fmt(p.importe)}</td>
                  <td className="px-2 py-2 text-center">
                    <button onClick={() => quitarLinea(i)} className="text-red-500 hover:text-red-700">✕</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="border-t border-[var(--peja-gris)] p-3">
          <button
            onClick={agregarLinea}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-[var(--peja-azul)] hover:bg-[var(--peja-neutro)]"
          >
            + Agregar linea
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-[var(--peja-pizarra)]">Observaciones</label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={5}
            className="w-full rounded-md border border-[var(--peja-gris)] px-3 py-2 text-sm outline-none focus:border-[var(--peja-azul)]"
          />
        </div>
        <div className="w-72 rounded-xl border border-[var(--peja-gris)] bg-white p-4">
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-[var(--peja-pizarra)]">Subtotal</span>
            <span className="font-medium">{fmt(subtotal)}</span>
          </div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-[var(--peja-pizarra)]">
              Descuento
              <input
                type="number"
                value={descuentoPct}
                onChange={(e) => setDescuentoPct(parseFloat(e.target.value) || 0)}
                className="w-14 rounded border border-[var(--peja-gris)] px-1 py-0.5 text-right text-xs"
              />
              %
            </span>
            <span className="font-medium text-red-600">-{fmt(descuentoMonto)}</span>
          </div>
          <label className="mb-2 flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-[var(--peja-pizarra)]">
              <input type="checkbox" checked={aplicaIva} onChange={(e) => setAplicaIva(e.target.checked)} />
              IVA 16%
            </span>
            <span className="font-medium">{fmt(iva)}</span>
          </label>
          <div className="mt-2 flex justify-between border-t border-[var(--peja-gris)] pt-2 text-base font-bold text-[var(--peja-azul)]">
            <span>Total</span>
            <span>{fmt(total)}</span>
          </div>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 flex justify-end gap-2">
        <button
          onClick={() => router.push("/documentos")}
          className="rounded-md border border-[var(--peja-gris)] px-4 py-2 text-sm font-medium text-[var(--peja-pizarra)] hover:bg-[var(--peja-neutro)]"
        >
          Cancelar
        </button>
        <button
          onClick={guardar}
          disabled={guardando}
          className="rounded-md bg-[var(--peja-azul)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--peja-azul-hover)] disabled:opacity-50"
        >
          {guardando ? "Guardando..." : "Guardar documento"}
        </button>
      </div>
    </div>
  );
}