"use client";

import { useState } from "react";
import ClienteForm from "./ClienteForm";
import { eliminarCliente } from "./actions";

type Cliente = {
  id: number;
  nombre: string;
  empresa?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  rfc?: string;
  notas?: string;
  saldo?: number;
};

export default function ClientesTabla({ clientes }: { clientes: Cliente[] }) {
  const [busqueda, setBusqueda] = useState("");
  const [formAbierto, setFormAbierto] = useState(false);
  const [editando, setEditando] = useState<Cliente | undefined>();

  const filtrados = clientes.filter((c) =>
    [c.nombre, c.empresa, c.telefono, c.rfc]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  async function borrar(c: Cliente) {
    if (!confirm(`Eliminar a "${c.nombre}"?`)) return;
    await eliminarCliente(c.id);
  }

  function abrirNuevo() {
    setEditando(undefined);
    setFormAbierto(true);
  }

  function abrirEditar(c: Cliente) {
    setEditando(c);
    setFormAbierto(true);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <input
          placeholder="Buscar por nombre, empresa, telefono o RFC..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full max-w-md rounded-md border border-[var(--peja-gris)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--peja-azul)]"
        />
        <button
          onClick={abrirNuevo}
          className="shrink-0 rounded-md bg-[var(--peja-azul)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--peja-azul-hover)]"
        >
          + Nuevo cliente
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--peja-gris)] bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[var(--peja-neutro)] text-left text-xs uppercase text-[var(--peja-pizarra)]">
            <tr>
              <th className="px-4 py-3 font-semibold">Nombre</th>
              <th className="px-4 py-3 font-semibold">Empresa</th>
              <th className="px-4 py-3 font-semibold">Telefono</th>
              <th className="px-4 py-3 font-semibold">Ciudad</th>
              <th className="px-4 py-3 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[var(--peja-pizarra)]">
                  Sin clientes que mostrar
                </td>
              </tr>
            ) : (
              filtrados.map((c) => (
                <tr key={c.id} className="border-t border-[var(--peja-gris)]">
                  <td className="px-4 py-3 font-medium">{c.nombre}</td>
                  <td className="px-4 py-3 text-[var(--peja-pizarra)]">{c.empresa || "-"}</td>
                  <td className="px-4 py-3 text-[var(--peja-pizarra)]">{c.telefono || "-"}</td>
                  <td className="px-4 py-3 text-[var(--peja-pizarra)]">{c.ciudad || "-"}</td>
                <td className="px-4 py-3 text-right font-medium">
                    {c.saldo && c.saldo > 0 ? (
                      <span className="text-red-600">
                        {c.saldo.toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
                      </span>
                    ) : (
                      <span className="text-green-600">Al dia</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => abrirEditar(c)}
                      className="mr-2 rounded px-2 py-1 text-xs font-medium text-[var(--peja-azul)] hover:bg-[var(--peja-neutro)]"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => borrar(c)}
                      className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {formAbierto && (
        <ClienteForm
          cliente={editando}
          onClose={() => setFormAbierto(false)}
        />
      )}
    </div>
  );
}