// src/pages/Informacion.jsx
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const InfoRow = ({ label, value }) => (
  <div className="grid grid-cols-12 gap-3 items-start py-2">
    <dt className="col-span-12 sm:col-span-4 text-slate-300 font-semibold">{label}</dt>
    <dd className="col-span-12 sm:col-span-8 text-slate-100">{value}</dd>
  </div>
);

export default function Informacion() {
  return (
    <div className="min-h-screen w-full bg-slate-900/80 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-slate-700 bg-slate-800/60 shadow-2xl p-6 sm:p-10"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-4 text-center">
            PROYECTO MÉTODOS DE PROGRAMACIÓN LINEAL
          </h1>

          {/* Logo UAGRM (arriba de Desarrolladores) */}
          <div className="mt-2 mb-8 flex justify-center">
            <img
              src="/assets/uagrm.png" // o /assets/uagrm.svg
              alt="Universidad Autónoma Gabriel René Moreno (UAGRM)"
              className="w-24 h-auto md:w-32 opacity-90 drop-shadow"
              width={128}
              height={128}
              loading="eager"
              decoding="async"
            />
          </div>

          <dl className="divide-y divide-slate-700/40">
            <InfoRow
              label="DESARROLLADORES"
              value={
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    Banegas Zeballos Daniel Fabricio —{" "}
                    <span className="font-mono text-slate-300">223041785</span>
                  </li>
                  <li>
                    Lobo Gutiérrez Carlos Gabriel —{" "}
                    <span className="font-mono text-slate-300">223043117</span>
                  </li>
                  <li>
                    Serrate Basma Leonardo —{" "}
                    <span className="font-mono text-slate-300">223044377</span>
                  </li>
                  <li>
                    Vásquez Ardaya Brandon Líder —{" "}
                    <span className="font-mono text-slate-300">223044695</span>
                  </li>
                </ul>
              }
            />
            <InfoRow label="CATEDRÁTICO" value="Ramírez Arispe Jorge Félix" />
            <InfoRow label="ASIGNATURA" value="Investigación Operativa I" />
            <InfoRow label="GRUPO" value="SB" />
            <InfoRow label="UNIVERSIDAD" value="Universidad Autónoma Gabriel René Moreno" />
            <InfoRow
              label="FACULTAD"
              value="Facultad de Ingeniería en Ciencias de la Computación y Telecomunicaciones"
            />
          </dl>

          {/* Botón Volver */}
          <div className="mt-8 flex justify-center w-full">
            <Link
              to="/"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full shadow-lg transition"
            >
              🔄 Volver a Inicio
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
