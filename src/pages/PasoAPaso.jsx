import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";

const PasoAPaso = () => {
  const {
    funcionObjetivo = [],
    restriccionesData = [],
    resultados = [],
  } = useLocation().state || {};

  const [initialTabla, setInitialTabla] = useState([]);
  const [finalTabla, setFinalTabla] = useState([]);
  const [rowNames, setRowNames] = useState([]);
  const [varNames, setVarNames] = useState([]);
  const [slackNames, setSlackNames] = useState([]);
  const [solucionOptima, setSolucionOptima] = useState(false);
  const [iteraciones, setIteraciones] = useState([]);
  const [mensajeBuhoPorIteracion, setMensajeBuhoPorIteracion] = useState({});
  const [cVec, setCVec] = useState([]); // para Cj y Cb

  useEffect(() => {
    // --- Preparación inicial numérica ---
    const c = funcionObjetivo.map((v) => parseFloat(v) || 0);
    const filas = restriccionesData.map((r) => r.map((v) => parseFloat(v) || 0));
    const A = filas.map((r) => r.slice(0, c.length));
    const b =
      resultados.length === filas.length
        ? resultados.map((v) => parseFloat(v) || 0)
        : filas.map((r) => r[r.length - 1]);

    // Nombres
    const vx = c.map((_, i) => `x${i + 1}`);
    const sx = A.map((_, i) => `s${i + 1}`);
    const rn = ["Z", ...sx.map((s) => s.toUpperCase())];

    setRowNames(rn);
    setVarNames(vx);
    setSlackNames(sx);
    setCVec(c);

    // --- Tableau inicial ---
    const m = A.length;
    const filaZ = [1, ...c.map((ci) => -ci), ...Array(m).fill(0), 0];
    let tablaLocal = [filaZ];
    for (let i = 0; i < m; i++) {
      const holg = Array(m).fill(0);
      holg[i] = 1;
      tablaLocal.push([0, ...A[i], ...holg, b[i]]);
    }
    setInitialTabla(tablaLocal);

    // --- Simplex ---
    let iter = 0;
    const maxIter = 20;
    const todasIteraciones = [];
    const buhoPorIter = {};
    let nombresFilasActuales = [...rn];

    const n = c.length;

    while (iter++ < maxIter) {
      // Columna pivote (más negativo entre x1..xn)
      const coefZ = tablaLocal[0].slice(1, 1 + n);
      let minValor = Infinity;
      let indCol = -1;
      coefZ.forEach((v, idx) => {
        if (v < 0 && v < minValor) {
          minValor = v;
          indCol = idx + 1;
        }
      });
      if (indCol === -1) {
        setSolucionOptima(true);
        break; // óptimo
      }
      const nombreCol = vx[indCol - 1];

      // Fila pivote (razón mínima)
      let mejorRatio = Infinity;
      let indFila = -1;
      for (let i = 1; i < tablaLocal.length; i++) {
        const a_ip = tablaLocal[i][indCol];
        const rhs = tablaLocal[i][tablaLocal[i].length - 1];
        if (a_ip > 0) {
          const ratio = rhs / a_ip;
          if (ratio < mejorRatio) {
            mejorRatio = ratio;
            indFila = i;
          }
        }
      }
      if (indFila === -1) break; // no acotado

      const nombreFila = nombresFilasActuales[indFila];
      nombresFilasActuales[indFila] = nombreCol;

      // Pivoteo (Gauss–Jordan)
      const piv = tablaLocal[indFila][indCol];
      const filaPiv = tablaLocal[indFila].map((x) => x / piv);
      const nuevaTabla = tablaLocal.map((fila, i) => {
        if (i === indFila) return filaPiv;
        const coef = fila[indCol];
        return fila.map((celda, j) => celda - coef * filaPiv[j]);
      });

      const iteracion = {
        numero: iter,
        tabla: nuevaTabla,
        fila: { nombre: nombreFila, ratio: mejorRatio },
        columna: { nombre: nombreCol },
        rowNames: [...nombresFilasActuales],
      };
      buhoPorIter[iter] = `📘 Columna: ${nombreCol}\n📘 Fila: ${nombreFila} → razón = ${mejorRatio.toFixed(2)}`;

      todasIteraciones.push(iteracion);
      tablaLocal = nuevaTabla;
      setFinalTabla(nuevaTabla);
    }

    setIteraciones(todasIteraciones);
    setMensajeBuhoPorIteracion(buhoPorIter);
  }, [funcionObjetivo, restriccionesData, resultados]);

  // -------- helpers de presentación Cj/Cb --------
  const getCb = (baseName) => {
    if (!baseName) return "";
    if (baseName === "Z") return "Z";
    if (baseName.toLowerCase().startsWith("x")) {
      const idx = parseInt(baseName.slice(1), 10) - 1;
      return Number.isFinite(cVec[idx]) ? cVec[idx] : 0;
    }
    return 0; // slacks
  };

  const renderTableau = (tabla, rowNamesLocal) => {
    if (!tabla?.length) return null;

    const m = slackNames.length;
    const cjRow = [
      "", "Cj",
      ...varNames.map((_, i) => Number(cVec?.[i] ?? 0).toFixed(2)),
      ...Array(m).fill("0.00"),
      "0.00",
    ];

    return (
      <table className="min-w-max table-auto border-collapse bg-white rounded-xl shadow-md">
        <thead>
          {/* Cj */}
          <tr className="bg-red-50">
            {cjRow.map((x, i) => (
              <th key={i} className="border px-3 py-2 text-gray-800">{x}</th>
            ))}
          </tr>
          {/* Encabezados */}
          <tr className="bg-gray-50">
            <th className="border px-3 py-2">Cb</th>
            <th className="border px-3 py-2">Base</th>
            {varNames.map((v, i) => (
              <th key={i} className="border px-3 py-2">{v.toUpperCase()}</th>
            ))}
            {slackNames.map((s, i) => (
              <th key={i} className="border px-3 py-2">{s.toUpperCase()}</th>
            ))}
            <th className="border px-3 py-2">R</th>
          </tr>
        </thead>
        <tbody>
          {/* Filas de restricciones */}
          {tabla.slice(1).map((fila, i) => {
            const base = rowNamesLocal[i + 1];
            const cb = getCb(base);
            const rowVals = fila.slice(1);
            return (
              <tr key={i}>
                <td className="border px-3 py-2">{typeof cb === "number" ? cb.toFixed(2) : cb}</td>
                <td className="border px-3 py-2 font-semibold">{base}</td>
                {rowVals.map((v, j) => (
                  <td key={j} className="border px-3 py-2">{Number(v).toFixed(2)}</td>
                ))}
              </tr>
            );
          })}
          {/* Fila Z */}
          <tr className="bg-green-50">
            <td className="border px-3 py-2 font-semibold">Z</td>
            <td className="border px-3 py-2 font-semibold">Z</td>
            {tabla[0].slice(1).map((v, j) => (
              <td key={j} className="border px-3 py-2">{Number(v).toFixed(2)}</td>
            ))}
          </tr>
        </tbody>
      </table>
    );
  };

  // -------- Soluciones finales (sin tablas) --------
  // Tomamos el último tableau mostrado (o el inicial si no hubo iteraciones)
  const last = iteraciones.length ? iteraciones.at(-1) : null;
  const baseNames = last ? last.rowNames : rowNames;
  const tableRef = last ? last.tabla : initialTabla;

  const valorDe = (name) => {
    const buscado = name.startsWith("s") ? name.toUpperCase() : name;
    const idx = baseNames.indexOf(buscado);
    if (idx === -1) return 0;
    const rhs = tableRef[idx].at(-1);
    return Number(rhs) || 0;
  };

  const soluciones = [
    ...varNames.map((v) => ({ name: v, value: valorDe(v) })),
    ...slackNames.map((s) => ({ name: s, value: valorDe(s) })),
  ];
  const valorZ = Number(tableRef?.[0]?.at(-1) ?? 0);

  return (
    <div className="relative z-10 min-h-screen flex flex-col justify-center items-center text-center px-6 py-12">
      <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
        🧠Visualización<br />
        Método Simplex
      </h1>

      {/* Tableau inicial con tu layout */}
      <div className="overflow-x-auto w-full px-2 mb-6">
        <div className="w-max mx-auto">
          {renderTableau(initialTabla, rowNames)}
        </div>
      </div>

      {/* Iteraciones (mismo layout) */}
      {iteraciones.length > 0 && (
        <div className="mt-6 w-full">
          {iteraciones.map((it) => (
            <div key={it.numero} className="mb-20 w-full">
              <div className="flex flex-col items-center mb-4 relative">
                <motion.div
                  className="mb-4 bg-white border border-gray-300 px-4 py-2 rounded-xl shadow-md text-sm text-gray-800 w-72 text-center whitespace-pre-line z-10"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {mensajeBuhoPorIteracion[it.numero]}
                </motion.div>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-green-700 mb-4">
                Iteración {it.numero}
              </h2>

              <div className="overflow-x-auto w-full px-2">
                <div className="w-max mx-auto">
                  {renderTableau(it.tabla, it.rowNames)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mensaje de óptimo */}
      {solucionOptima && (
        <div className="mt-4 text-2xl md:text-3xl font-bold text-green-600">
          ✅ ¡Solución óptima alcanzada!
        </div>
      )}

      {/* 📌Soluciones */}
      <div className="mt-10 w-full max-w-sm mx-auto">
        <div className="bg-white rounded-xl shadow-md p-6 text-left">
          <h3 className="text-xl font-bold mb-3">📌 Soluciones</h3>
          <div className="space-y-1 font-mono text-base">
            {soluciones.map(({ name, value }) => (
              <p key={name}>{name} = {value.toFixed(2)}</p>
            ))}
            <p className="mt-2 font-semibold">Z = {valorZ.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Volver */}
      <div className="mt-8 flex justify-center w-full">
        <Link
          to="/configurar"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full shadow-lg transition duration-300"
        >
          🔄 Volver a Configuración
        </Link>
      </div>
    </div>
  );
};

export default PasoAPaso;
