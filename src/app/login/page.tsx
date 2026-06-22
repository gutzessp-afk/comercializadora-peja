"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function entrar() {
    if (!email || !password) {
      setError("Ingresa correo y contraseña");
      return;
    }
    setCargando(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setCargando(false);
    if (error) {
      setError("Correo o contraseña incorrectos");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* LADO IZQUIERDO - imagen y mensaje */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[var(--peja-azul)] p-12 text-white lg:flex">
        {/* Patron decorativo */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, white 2px, transparent 2px), radial-gradient(circle at 70% 60%, white 2px, transparent 2px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative z-10 flex items-center gap-3">
          <div className="rounded-xl bg-white/15 p-2">
            <Logo size={40} />
          </div>
          <span className="text-sm font-bold tracking-wide">COMERCIALIZADORA PEJA</span>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold leading-tight">
            Plomería, Tlapalería
            <br />y Ferretería
          </h1>
          <p className="mt-4 max-w-md text-blue-100">
            Sistema integral de inventario, cotizaciones y control de ventas.
            Administra tu negocio desde cualquier lugar.
          </p>
        </div>

        <div className="relative z-10 text-xs text-blue-200">
          Comercializadora Peja © 2026 · Chalco, Estado de México
        </div>
      </div>

      {/* LADO DERECHO - formulario */}
      <div className="flex w-full items-center justify-center bg-[var(--peja-neutro)] p-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          {/* Logo solo en movil */}
          <div className="mb-6 flex flex-col items-center lg:hidden">
            <Logo size={50} />
            <span className="mt-2 text-sm font-bold text-[var(--peja-azul)]">
              COMERCIALIZADORA PEJA
            </span>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <div className="mb-1 h-1 w-full rounded-full bg-[var(--peja-azul)]" />
            <h2 className="mt-5 text-center text-2xl font-bold text-[#1a2227]">
              Bienvenido de vuelta
            </h2>
            <p className="mb-6 mt-1 text-center text-sm text-[var(--peja-pizarra)]">
              Ingresa tus credenciales para acceder
            </p>

            <label className="mb-1 block text-xs font-semibold text-[var(--peja-pizarra)]">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && entrar()}
              placeholder="correo@ejemplo.com"
              className="mb-4 w-full rounded-lg border border-[var(--peja-gris)] bg-[var(--peja-neutro)] px-4 py-2.5 text-sm outline-none focus:border-[var(--peja-azul)] focus:bg-white"
            />

            <label className="mb-1 block text-xs font-semibold text-[var(--peja-pizarra)]">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && entrar()}
              placeholder="••••••••"
              className="mb-5 w-full rounded-lg border border-[var(--peja-gris)] bg-[var(--peja-neutro)] px-4 py-2.5 text-sm outline-none focus:border-[var(--peja-azul)] focus:bg-white"
            />

            {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

            <button
              onClick={entrar}
              disabled={cargando}
              className="w-full rounded-lg bg-[var(--peja-azul)] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--peja-azul-hover)] disabled:opacity-50"
            >
              {cargando ? "Entrando..." : "Iniciar sesión →"}
            </button>

            <p className="mt-6 text-center text-xs text-[var(--peja-pizarra)]">
              Protegido por Comercializadora Peja © 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}