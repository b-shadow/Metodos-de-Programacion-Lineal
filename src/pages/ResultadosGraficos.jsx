// src/pages/ResultadosGraficos.jsx
import React, { useMemo } from "react";
import Plot from "react-plotly.js";
import { useLocation, Link } from "react-router-dom";

const ResultadosGraficos = () => {
  const {
    variables = 2,
    funcionObjetivo = [],           // [c1, c2]
    restriccionesData = [],         // [[a11,a12], [a21,a22], ...]
    operadores = [],                // ["≤","≥","=" ...]
    resultados = [],                // [b1,b2,...]
  } = useLocation().state || {};

  const maximize = true; // Cambia a false si quieres MIN

  const {
    c, restrictions, vertices, best, polygonPoints, bbox,
  } = useMemo(() => {
    const toNum = (v) => {
      const x = parseFloat(v);
      return Number.isFinite(x) ? x : 0;
    };
    const c = (funcionObjetivo || []).slice(0, 2).map(toNum);
    const A = (restriccionesData || []).map((row) => row.slice(0, 2).map(toNum));
    const b = (resultados || []).map(toNum);

    // ✅ aceptar ≤, ≥ y = (por defecto cae a ≤ si viene algo raro)
    const ops = (operadores || []).map((s) =>
      s === "≥" || s === "=" ? s : "≤"
    );

    // restricciones del usuario
    const base = A.map((row, i) => ({
      a: row[0], b: row[1], rhs: b[i], op: ops[i], label: `R${i + 1}`,
    }));
    // x≥0, y≥0
    const axes = [
      { a: 1, b: 0, rhs: 0, op: "≥", label: "x≥0" },
      { a: 0, b: 1, rhs: 0, op: "≥", label: "y≥0" },
    ];
    const all = [...base, ...axes];

    // Intersecciones de pares de rectas: a x + b y = rhs
    const lines = all.map((r) => ({ ...r }));
    const inters = [];
    for (let i = 0; i < lines.length; i++) {
      for (let j = i + 1; j < lines.length; j++) {
        const L1 = lines[i], L2 = lines[j];
        const det = L1.a * L2.b - L2.a * L1.b;
        if (Math.abs(det) < 1e-12) continue;
        const x = (L1.rhs * L2.b - L2.rhs * L1.b) / det;
        const y = (L1.a * L2.rhs - L2.a * L1.rhs) / det;
        if (Number.isFinite(x) && Number.isFinite(y)) inters.push({ x, y });
      }
    }

    // ✅ Cheque de factibilidad con "=", "≤" y "≥"
    const ok = (p) => all.every((r) => {
      const lhs = r.a * p.x + r.b * p.y;
      if (r.op === "≤") return lhs <= r.rhs + 1e-9;
      if (r.op === "≥") return lhs + 1e-9 >= r.rhs;
      // "="
      return Math.abs(lhs - r.rhs) <= 1e-9;
    });

    // Vértices únicos factibles
    const feas = inters.filter(ok);
    const uniq = [];
    const seen = new Set();
    for (const p of feas) {
      const k = `${Math.round(p.x * 1e6)}_${Math.round(p.y * 1e6)}`;
      if (!seen.has(k)) { seen.add(k); uniq.push(p); }
    }

    // Si no hay región: bbox por defecto
    if (uniq.length === 0) {
      return {
        c, restrictions: all, vertices: [], best: null, polygonPoints: [],
        bbox: { minX: 0, maxX: 10, minY: 0, maxY: 10 },
      };
    }

    // Ordenar polígono por ángulo
    const cx = uniq.reduce((s, p) => s + p.x, 0) / uniq.length;
    const cy = uniq.reduce((s, p) => s + p.y, 0) / uniq.length;
    const poly = uniq
      .slice()
      .sort((p, q) => Math.atan2(p.y - cy, p.x - cx) - Math.atan2(q.y - cy, q.x - cx));

    // Evaluar Z
    const verts = poly.map((p) => ({ ...p, z: c[0] * p.x + c[1] * p.y }));
    let best = verts[0];
    for (const v of verts) if (maximize ? v.z > best.z : v.z < best.z) best = v;

    // BBox con padding
    const xs = verts.map((p) => p.x).concat([0]);
    const ys = verts.map((p) => p.y).concat([0]);
    const minX = Math.min(...xs, 0), maxX = Math.max(...xs, 1);
    const minY = Math.min(...ys, 0), maxY = Math.max(...ys, 1);
    const padX = (maxX - minX) * 0.2 || 1, padY = (maxY - minY) * 0.2 || 1;

    return {
      c,
      restrictions: all,
      vertices: verts,
      best,
      polygonPoints: verts, // ordenados
      bbox: {
        minX: Math.min(0, minX - padX), maxX: maxX + padX,
        minY: Math.min(0, minY - padY), maxY: maxY + padY,
      },
    };
  }, [variables, funcionObjetivo, restriccionesData, operadores, resultados, maximize]);

  // Trazas Plotly
  const polygonTrace =
    polygonPoints.length >= 3
      ? {
        type: "scatter",
        mode: "lines",
        x: [...polygonPoints.map((p) => p.x), polygonPoints[0].x],
        y: [...polygonPoints.map((p) => p.y), polygonPoints[0].y],
        fill: "toself",
        fillcolor: "rgba(34,197,94,0.2)", // verde translúcido
        line: { width: 2, color: "rgba(34,197,94,0.8)" },
        name: "Región factible",
        hoverinfo: "skip",
      }
      : null;

  const vertexTrace = {
    type: "scatter",
    mode: "markers",
    x: vertices.map((v) => v.x),
    y: vertices.map((v) => v.y),
    marker: { size: 8, color: "#111" },
    name: "Vértices",
    text: vertices.map((v) => `x1=${v.x.toFixed(3)}<br>x2=${v.y.toFixed(3)}<br>Z=${v.z.toFixed(3)}`),
    hoverinfo: "text",
  };

  const bestTrace =
    best
      ? {
        type: "scatter",
        mode: "markers",
        x: [best.x],
        y: [best.y],
        marker: { size: 12, color: "#16a34a", symbol: "star" },
        name: "Óptimo",
        text: [`Óptimo<br>x1=${best.x.toFixed(3)}<br>x2=${best.y.toFixed(3)}<br>Z=${best.z.toFixed(3)}`],
        hoverinfo: "text",
      }
      : null;

  // Líneas de restricciones (acotadas al bbox)
  const buildSeg = (r) => {
    // a x + b y = rhs, cortar con caja
    const tryX = (x) => (Math.abs(r.b) < 1e-12 ? null : { x, y: (r.rhs - r.a * x) / r.b });
    const tryY = (y) => (Math.abs(r.a) < 1e-12 ? null : { x: (r.rhs - r.b * y) / r.a, y });
    const cands = [
      tryX(bbox.minX),
      tryX(bbox.maxX),
      tryY(bbox.minY),
      tryY(bbox.maxY),
    ].filter(
      (p) =>
        p &&
        Number.isFinite(p.x) &&
        Number.isFinite(p.y) &&
        p.x >= bbox.minX - 1e-9 &&
        p.x <= bbox.maxX + 1e-9 &&
        p.y >= bbox.minY - 1e-9 &&
        p.y <= bbox.maxY + 1e-9
    );
    if (cands.length < 2) return null;
    cands.sort((p, q) => p.x + p.y - (q.x + q.y));
    return [cands[0], cands[cands.length - 1]];
  };

  const lineTraces = restrictions.map((r, idx) => {
    const seg = buildSeg(r);
    if (!seg) return null;
    const [p, q] = seg;
    return {
      type: "scatter",
      mode: "lines",
      x: [p.x, q.x],
      y: [p.y, q.y],
      line: { width: 2 },
      name: `${r.label}: ${r.a}x1 + ${r.b}x2 ${r.op} ${r.rhs}`,
      hoverinfo: "name",
    };
  }).filter(Boolean);

  const data = [
    polygonTrace,
    ...lineTraces,
    vertexTrace,
    bestTrace,
  ].filter(Boolean);

  return (
    <div className="relative z-10 min-h-screen flex flex-col justify-center items-center text-center px-6 py-12">
      <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
        🧠Visualización<br />
        Método Gráfico
      </h1>

      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* IZQUIERDA: resumen/tabla */}
        <div className="bg-white rounded-xl shadow-md p-5 overflow-x-auto">
          <h2 className="text-xl font-semibold mb-3 text-left">Resumen</h2>

          <div className="text-left mb-3">
            <div className="font-medium">
              {maximize ? "Maximizar" : "Minimizar"}: Z = {c?.[0] ?? 0}·x₁ + {c?.[1] ?? 0}·x₂
            </div>
          </div>

          <div className="text-left mb-4">
            <div className="font-medium mb-1">Restricciones:</div>
            <ul className="list-disc ml-6">
              {restrictions.map((r, i) => (
                <li key={i}>
                  {r.a}·x₁ + {r.b}·x₂ {r.op} {r.rhs} <span className="text-gray-500">({r.label})</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-left">
            <div className="font-medium mb-1">Vértices factibles:</div>
            {vertices.length === 0 ? (
              <div className="text-red-600 font-semibold">⚠️ Región factible vacía.</div>
            ) : (
              <table className="min-w-max table-auto border-collapse">
                <thead>
                  <tr>
                    <th className="border px-3 py-1">#</th>
                    <th className="border px-3 py-1">x₁</th>
                    <th className="border px-3 py-1">x₂</th>
                    <th className="border px-3 py-1">Z</th>
                  </tr>
                </thead>
                <tbody>
                  {vertices.map((v, idx) => {
                    const isBest = best && Math.abs(v.x - best.x) < 1e-9 && Math.abs(v.y - best.y) < 1e-9;
                    return (
                      <tr key={idx} className={isBest ? "bg-green-50" : ""}>
                        <td className="border px-3 py-1">{idx + 1}</td>
                        <td className="border px-3 py-1">{v.x.toFixed(2)}</td>
                        <td className="border px-3 py-1">{v.y.toFixed(2)}</td>
                        <td className="border px-3 py-1">{v.z.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {best && (
              <div className="mt-3 p-3 rounded-lg bg-green-100 border border-green-300">
                <div className="font-semibold">Óptimo ({maximize ? "Max" : "Min"})</div>
                <div>
                  x₁ = {best.x.toFixed(2)}, x₂ = {best.y.toFixed(2)}, <strong>Z = {best.z.toFixed(2)}</strong>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* DERECHA: gráfico interactivo */}
        <div className="bg-white rounded-xl shadow-md p-3">
          <Plot
            data={data}
            layout={{
              autosize: true,
              height: 560,                // más alto
              margin: { l: 50, r: 10, t: 10, b: 50 }, // márgenes pequeños
              xaxis: {
                title: "x₁",
                range: [bbox.minX, bbox.maxX],
                zeroline: true,
                showgrid: true,
                gridcolor: "rgba(0,0,0,0.1)",
              },
              yaxis: {
                title: "x₂",
                range: [bbox.minY, bbox.maxY],
                zeroline: true,
                showgrid: true,
                gridcolor: "rgba(0,0,0,0.1)",
              },
              showlegend: false,          // 👈 oculta la leyenda
              dragmode: "pan",
              paper_bgcolor: "#ffffff",
              plot_bgcolor: "#ffffff",
            }}
            config={{
              displaylogo: false,
              responsive: true,
              scrollZoom: true,
              toImageButtonOptions: { filename: "metodo-grafico" },
              modeBarButtonsToRemove: ["select2d", "lasso2d"],
            }}
            useResizeHandler={true}        // 👈 se adapta al contenedor
            style={{ width: "100%", height: "560px" }} // ocupa todo el ancho
          />
        </div>
      </div>
      <div className="mt-8 flex justify-center w-full">
        <Link
          to="/configurar2"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full shadow-lg transition duration-300"
        >
          🔄 Volver a Configuración
        </Link>
      </div>
    </div>
  );
};

export default ResultadosGraficos;
