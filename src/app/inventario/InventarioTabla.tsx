"use client";

import { useState, useMemo } from "react";
import ProductoModal from "./ProductoModal";

type Categoria = { id: number; nombre: string };

type Producto = {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria_id: number | null;
  categoria_nombre?: string;
  marca?: string;
  unidad: string;
  precio_compra: number;
  precio_venta: number;
  stock: number;
  stock_minimo: number;
  ubicacion?: string;
  activo: boolean;
};

function Semaforo({ stock, minimo }: { stock: number; minimo: number }) {
  let color = "bg-green-500";
  let label = "OK";
  if (stock <= 0) {
    color = "bg-red-500";
    label = "Agotado";
  } else if (stock <= minimo) {
    color = "bg-amber-500";
    label = "Bajo";
  }
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span className="text-xs text-[var(--peja-pizarra)]">{label}</span>
    </span>
  );
}

export default function InventarioTabla({
  productos,
  categorias,
  marcas,
}: {
  productos: Producto[];
  categorias: Categoria[];
  marcas: string[];
}) {
  const [busqueda, setBusqueda] = useState("");
  const [catFiltro, setCatFiltro] = useState<number | "">("");
  const [marcaFiltro, setMarcaFiltro] = useState("");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Producto | undefined>();

  const fmt = (n: number) =>
    Number(n).toLocaleString("es-MX", { style: "currency", currency: "MXN" });

  const filtrados = useMemo(() => {
    return productos.filter((p) => {
      if (busqueda) {
        const txt = [p.codigo, p.nombre, p.marca].filter(Boolean).join(" ").toLowerCase();
        if (!txt.includes(busqueda.toLowerCase())) return false;
      }
      if (catFiltro !== "" && p.categoria_id !== catFiltro) return false;
      if (marcaFiltro && p.marca !== marcaFiltro) return false;
      if (precioMin && Number(p.precio_venta) < parseFloat(precioMin)) return false;
      if (precioMax && Number(p.precio_venta) > parseFloat(precioMax)) return false;
      return true;
    });
  }, [productos, busqueda, catFiltro, marcaFiltro, precioMin, precioMax]);

  const valorInventario = filtrados.reduce(
    (s, p) => s + Number(p.precio_venta) * Number(p.stock),
    0
  );

  function limpiar() {
    setBusqueda("");
    setCatFiltro("");
    setMarcaFiltro("");
    setPrecioMin("");
    setPrecioMax("");
  }

  function nuevo() {
    setEditando(undefined);
    setModal(true);
  }
  function editar(p: Producto) {
    setEditando(p);
    setModal(true);
  }

  return (
    <div>
      {/* Filtros */}
      <div className="mb-4 grid grid-cols-1 gap-3 rounded-xl border border-[var(--peja-gris)] bg-white p-4 md:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-[var(--peja-pizarra)]">Categoria</label>
          <select
            value={catFiltro}
            onChange={(e) => setCatFiltro(e.target.value ? Number(e.target.value) : "")}
            className="w-full rounded-md border border-[var(--peja-gris)] px-3 py-2 text-sm outline-none focus:border-[var(--peja-azul)]"
          >
            <option value="">Todas las categorias</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-[var(--peja-pizarra)]">Marca</label>
          <select
            value={marcaFiltro}
            onChange={(e) => setMarcaFiltro(e.target.value)}
            className="w-full rounded-md border border-[var(--peja-gris)] px-3 py-2 text-sm outline-none focus:border-[var(--peja-azul)]"
          >
            <option value="">Todas las marcas</option>
            {marcas.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-[var(--peja-pizarra)]">Rango de precio</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={precioMin}
              onChange={(e) => setPrecioMin(e.target.value)}
              className="w-full rounded-md border border-[var(--peja-gris)] px-2 py-2 text-sm outline-none focus:border-[var(--peja-azul)]"
            />
            <span className="text-[var(--peja-pizarra)]">-</span>
            <input
              type="number"
              placeholder="Max"
              value={precioMax}
              onChange={(e) => setPrecioMax(e.target.value)}
              className="w-full rounded-md border border-[var(--peja-gris)] px-2 py-2 text-sm outline-none focus:border-[var(--peja-azul)]"
            />
          </div>
        </div>
        <div className="flex items-end gap-2">
          <button
            onClick={limpiar}
            className="rounded-md border border-[var(--peja-gris)] px-4 py-2 text-sm font-medium text-[var(--peja-pizarra)] hover:bg-[var(--peja-neutro)]"
          >
            Limpiar
          </button>
          <button
            onClick={nuevo}
            className="flex-1 rounded-md bg-[var(--peja-azul)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--peja-azul-hover)]"
          >
            + Producto
          </button>
        </div>
      </div>

      {/* Buscador + resumen */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <input
          placeholder="Buscar codigo, nombre o marca..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full max-w-md rounded-md border border-[var(--peja-gris)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--peja-azul)]"
        />
        <div className="shrink-0 text-sm text-[var(--peja-pizarra)]">
          <span className="font-bold text-[var(--peja-azul)]">{filtrados.length}</span> productos · Valor:{" "}
          <span className="font-bold text-[var(--peja-azul)]">{fmt(valorInventario)}</span>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-xl border border-[var(--peja-gris)] bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[var(--peja-neutro)] text-left text-xs uppercase text-[var(--peja-pizarra)]">
            <tr>
              <th className="px-4 py-3 font-semibold">Codigo</th>
              <th className="px-4 py-3 font-semibold">Descripcion</th>
              <th className="px-4 py-3 font-semibold">Categoria</th>
              <th className="px-4 py-3 font-semibold">Marca</th>
              <th className="px-4 py-3 text-center font-semibold">Stock</th>
              <th className="px-4 py-3 text-right font-semibold">P. Venta</th>
              <th className="px-4 py-3 text-right font-semibold">Accion</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[var(--peja-pizarra)]">
                  Sin productos con esos filtros
                </td>
              </tr>
            ) : (
              filtrados.slice(0, 200).map((p) => (
                <tr key={p.id} className="border-t border-[var(--peja-gris)]">
                  <td className="px-4 py-2.5 font-semibold text-[var(--peja-azul)]">{p.codigo}</td>
                  <td className="px-4 py-2.5">{p.nombre}</td>
                  <td className="px-4 py-2.5 text-[var(--peja-pizarra)]">{p.categoria_nombre || "-"}</td>
                  <td className="px-4 py-2.5 text-[var(--peja-pizarra)]">{p.marca || "-"}</td>
                  <td className="px-4 py-2.5 text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-medium">{Number(p.stock)}</span>
                      <Semaforo stock={Number(p.stock)} minimo={Number(p.stock_minimo)} />
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium">{fmt(p.precio_venta)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => editar(p)}
                      className="rounded px-2 py-1 text-xs font-medium text-[var(--peja-azul)] hover:bg-[var(--peja-neutro)]"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {filtrados.length > 200 && (
        <p className="mt-2 text-center text-xs text-[var(--peja-pizarra)]">
          Mostrando primeros 200. Usa los filtros o el buscador para afinar.
        </p>
      )}

      {modal && (
        <ProductoModal
          producto={editando}
          categorias={categorias}
          onClose={() => setModal(false)}
        />
      )}
    </div>
  );
}