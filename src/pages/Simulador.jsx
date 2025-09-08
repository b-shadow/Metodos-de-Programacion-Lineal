import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const Simulador = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { variables, restricciones } = location.state || {
    variables: 1,
    restricciones: 1,
  };

  const [formData, setFormData] = useState({
    funcionObjetivo: Array(variables).fill(""),
    restricciones: Array(restricciones).fill(Array(variables).fill("")),
    resultados: Array(restricciones).fill(""),
  });

  const handleChange = (e, restriccionIndex, variableIndex) => {
    const { value } = e.target;
    const newRestrictions = formData.restricciones.map((restriccion, idx) => {
      if (idx === restriccionIndex) {
        const newRestriccion = [...restriccion];
        newRestriccion[variableIndex] = value;
        return newRestriccion;
      }
      return restriccion;
    });

    setFormData((prevData) => ({
      ...prevData,
      restricciones: newRestrictions,
    }));
  };

  const handleFuncObjetivoChange = (e, variableIndex) => {
    const { value } = e.target;
    const newFuncObjetivo = [...formData.funcionObjetivo];
    newFuncObjetivo[variableIndex] = value;
    setFormData((prevData) => ({
      ...prevData,
      funcionObjetivo: newFuncObjetivo,
    }));
  };

  const handleResultChange = (e, restriccionIndex) => {
    const { value } = e.target;
    const newResults = [...formData.resultados];
    newResults[restriccionIndex] = value;
    setFormData((prevData) => ({
      ...prevData,
      resultados: newResults,
    }));
  };

  const regex = /^-?\d*(\.\d*)?$/;

  const handleSubmit = (e) => {
    e.preventDefault();

    const todosValidos = [
      ...formData.funcionObjetivo,
      ...formData.resultados,
      ...formData.restricciones.flat(),
    ].every((val) => val === "" || regex.test(val));

    if (!todosValidos) {
      alert(
        "⚠️ Verifica que todos los campos contengan solo números.\n⚠️ Recuerda usar '.' para los decimales."
      );
      return;
    }

    const objetivoValido = formData.funcionObjetivo.some(
      (val) => val !== "" && parseFloat(val) !== 0
    );
    if (!objetivoValido) {
      alert("⚠️ En la función objetivo debe haber al menos un coeficiente ≠ 0.");
      return;
    }

    // Validación de restricciones
    const restriccionInvalida = formData.restricciones.some((fila, index) => {
      const coeficientesValidos = fila.some(
        (val) => val !== "" && parseFloat(val) !== 0
      );

      const rhsStr = String(formData.resultados[index]).trim();
      if (rhsStr === "") return true; // vacío = inválido

      const rhsNum = parseFloat(rhsStr);
      const rhsValido = !isNaN(rhsNum) && rhsNum >= 0;

      return !coeficientesValidos || !rhsValido;
    });

    if (restriccionInvalida) {
      alert(
        "⚠️ Cada restricción debe tener al menos un coeficiente distinto de cero y un resultado numérico mayor o igual a 0."
      );
      return;
    }

    navigate("/paso-a-paso", {
      state: {
        variables,
        restricciones,
        funcionObjetivo: formData.funcionObjetivo,
        restriccionesData: formData.restricciones,
        resultados: formData.resultados,
      },
    });
  };

  return (
    <div className="relative z-10 min-h-screen flex flex-col justify-center items-center text-center px-6 py-12">
      <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4">
        🚀Ingreso de Datos<br />
        Método Simplex
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
                  {formData.funcionObjetivo.map((_, index) => (
                    <th key={index} className="px-3 py-2 text-white">{`x${
                      index + 1
                    }`}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {formData.funcionObjetivo.map((_, index) => (
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
                  {formData.funcionObjetivo.map((_, index) => (
                    <th key={index} className="px-3 py-2 text-white">{`x${
                      index + 1
                    }`}</th>
                  ))}
                  <th className="px-3 py-2 text-white">Sol</th>
                </tr>
              </thead>
              <tbody>
                {formData.restricciones.map((restriccion, restriccionIndex) => (
                  <tr key={restriccionIndex}>
                    {restriccion.map((_, variableIndex) => (
                      <td key={variableIndex}>
                        <input
                          type="text"
                          value={restriccion[variableIndex]}
                          onChange={(e) =>
                            handleChange(e, restriccionIndex, variableIndex)
                          }
                          className="p-2 w-20 border border-gray-300 rounded-lg"
                        />
                      </td>
                    ))}
                    <td>
                      <input
                        type="text" // 👈 sin flechitas
                        value={formData.resultados[restriccionIndex]}
                        onChange={(e) => handleResultChange(e, restriccionIndex)}
                        className="p-2 w-20 border border-gray-300 rounded-lg"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full shadow-lg transition duration-300"
        >
          Resolver
        </button>

        <div className="mt-8 flex justify-center w-full">
          <Link
            to="/configurar"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full shadow-lg transition duration-300"
          >
            🔄 Volver a Configuración
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Simulador;
