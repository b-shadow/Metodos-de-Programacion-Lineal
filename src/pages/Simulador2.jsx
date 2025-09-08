import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

const Simulador2 = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { variables, restricciones } = location.state || {
    variables: 2,
    restricciones: 1,
  };

  // Helpers (evita .fill con arrays anidados)
  const makeArray = (n, fill = "") => Array.from({ length: n }, () => fill);
  const makeMatrix = (r, c) =>
    Array.from({ length: r }, () => Array.from({ length: c }, () => ""));

  // Estado
  const [formData, setFormData] = useState({
    funcionObjetivo: makeArray(variables, ""),
    restricciones: makeMatrix(restricciones, variables),
    operadores: makeArray(restricciones, "≤"), // "≤" | "=" | "≥"
    resultados: makeArray(restricciones, ""), // vacío permitido en UI, pero inválido al validar
  });

  // Handlers
  const handleChange = (e, iRestr, iVar) => {
    const { value } = e.target;
    setFormData((prev) => {
      const copy = prev.restricciones.map((row) => row.slice());
      copy[iRestr][iVar] = value;
      return { ...prev, restricciones: copy };
    });
  };

  const handleFuncObjetivoChange = (e, iVar) => {
    const { value } = e.target;
    setFormData((prev) => {
      const copy = prev.funcionObjetivo.slice();
      copy[iVar] = value;
      return { ...prev, funcionObjetivo: copy };
    });
  };

  const handleOperadorChange = (e, iRestr) => {
    const { value } = e.target; // "≤" | "=" | "≥"
    setFormData((prev) => {
      const ops = prev.operadores.slice();
      ops[iRestr] = value;
      return { ...prev, operadores: ops };
    });
  };

  const handleResultChange = (e, iRestr) => {
    const { value } = e.target;
    setFormData((prev) => {
      const res = prev.resultados.slice();
      res[iRestr] = value;
      return { ...prev, resultados: res };
    });
  };

  const NUM_RE = /^[+-]?\d*(?:\.\d*)?$/;

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validar formato numérico (permite vacío durante edición, pero se controla más abajo)
    const flat = [
      ...formData.funcionObjetivo,
      ...formData.resultados,
      ...formData.restricciones.flat(),
    ];
    const todosValidos = flat.every(
      (v) => (v ?? "") === "" || NUM_RE.test(String(v).trim())
    );
    if (!todosValidos) {
      alert("⚠️ Solo números (usa '.' para decimales).");
      return;
    }

    // Al menos un coeficiente de la función objetivo distinto de cero
    const objetivoValido = formData.funcionObjetivo.some(
      (v) => String(v).trim() !== "" && parseFloat(v) !== 0
    );
    if (!objetivoValido) {
      alert("⚠️ En la función objetivo debe haber al menos un coeficiente ≠ 0.");
      return;
    }

    // Cada restricción: algún coeficiente ≠ 0 y RHS numérico ≥ 0, y NO vacío
    const restriccionInvalida = formData.restricciones.some((fila, i) => {
      const coefOK = fila.some(
        (v) => String(v).trim() !== "" && parseFloat(v) !== 0
      );

      const rhsStr = String(formData.resultados[i]).trim();
      if (rhsStr === "") return true; // vacío = inválido

      const rhsNum = parseFloat(rhsStr);
      const rhsOK = !isNaN(rhsNum) && rhsNum >= 0; // no negativos

      return !coefOK || !rhsOK;
    });
    if (restriccionInvalida) {
      alert(
        "⚠️ Cada restricción debe tener algún coeficiente ≠ 0 y un resultado numérico mayor o igual a 0 (no puede estar vacío)."
      );
      return;
    }

    // Navegar con estado completo
    navigate("/resultados-graficos", {
      state: {
        variables,
        restricciones,
        funcionObjetivo: formData.funcionObjetivo,
        restriccionesData: formData.restricciones,
        operadores: formData.operadores, // incluye "=" si lo eligieron
        resultados: formData.resultados,
      },
    });
  };

  return (
    <div className="relative z-10 min-h-screen flex flex-col justify-center items-center text-center px-6 py-12">
      <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4">
        📊Ingreso de Datos<br />
        Método Gráfico
      </h1>

      <form onSubmit={handleSubmit} className="w-full max-w-6xl">
        {/* Función Objetivo */}
        <div className="mb-8">
          <label className="block text-2xl font-bold text-white mb-4 text-left">
            Función Objetivo:
          </label>
          <div className="overflow-x-auto">
            <table className="min-w-max table-auto border-collapse mx-auto text-center">
              <thead>
                <tr>
                  {Array.from({ length: variables }).map((_, index) => (
                    <th key={index} className="px-3 py-2 text-white">{`x${index + 1}`}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {Array.from({ length: variables }).map((_, index) => (
                    <td key={index}>
                      <input
                        type="text"
                        value={formData.funcionObjetivo[index]}
                        onChange={(e) => handleFuncObjetivoChange(e, index)}
                        className="p-2 w-20 border border-gray-300 rounded-lg"
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Restricciones */}
        <div className="mb-8">
          <label className="block text-2xl font-bold text-white mb-4 text-left">
            Restricciones:
          </label>
          <div className="overflow-x-auto">
            <table className="min-w-max table-auto border-collapse mx-auto text-center">
              <thead>
                <tr>
                  {Array.from({ length: variables }).map((_, index) => (
                    <th key={index} className="px-3 py-2 text-white">{`x${index + 1}`}</th>
                  ))}
                  <th className="px-3 py-2 text-white">≤ / = / ≥</th>
                  <th className="px-3 py-2 text-white">Sol</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: restricciones }).map((_, iRow) => (
                  <tr key={iRow}>
                    {/* coeficientes */}
                    {Array.from({ length: variables }).map((_, j) => (
                      <td key={j}>
                        <input
                          type="text"
                          value={formData.restricciones[iRow][j]}
                          onChange={(e) => handleChange(e, iRow, j)}
                          className="p-2 w-20 border border-gray-300 rounded-lg"
                        />
                      </td>
                    ))}

                    {/* operador */}
                    <td>
                      <select
                        value={formData.operadores[iRow]}
                        onChange={(e) => handleOperadorChange(e, iRow)}
                        className="p-2 w-20 border border-gray-300 rounded-lg bg-white"
                      >
                        <option value="≤">≤</option>
                        <option value="=">=</option>
                        <option value="≥">≥</option>
                      </select>
                    </td>

                    {/* RHS (sin flechitas, vacío = inválido, ≥ 0) */}
                    <td>
                      <input
                        type="text" // sin flechitas
                        value={formData.resultados[iRow]}
                        onChange={(e) => handleResultChange(e, iRow)}
                        className="p-2 w-20 border border-gray-300 rounded-lg"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Botón */}
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full shadow-lg transition duration-300"
        >
          Resolver
        </button>

        <div className="mt-8 flex justify-center w-full">
          <Link
            to="/configurar2"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full shadow-lg transition duration-300"
          >
            🔄 Volver a Configuración
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Simulador2;
