import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Configurar = () => {
  const navigate = useNavigate();
  const [variables, setVariables] = useState(1);
  const [restricciones, setRestricciones] = useState(1);
  const [hablando, setHablando] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/simulador", { state: { variables, restricciones } });
  };

  const handleHover = () => {
    if (!hablando) {
      setHablando(true);
      setTimeout(() => setHablando(false), 5000);
    }
  };

  return (
    <div className="relative z-10 min-h-screen flex flex-col justify-center items-center text-center px-6 py-12">
      {/* Título fijo arriba */}
      <h1 className="mt-6 mb-8 text-6xl md:text-6xl font-bold text-white tracking-tight flex items-center gap-3">
        ⚙️ Configurar Simulación<br />
        Metodo Simplex
      </h1>

      {/* Contenedor principal separado */}
      <div className="flex flex-col items-center gap-10 mt-20">
        {/* 🦉 Búho con globo */}
        <div className="relative flex flex-col items-center justify-center">
          {hablando && (
            <motion.div
              className="absolute -top-24 bg-white border border-gray-300 px-4 py-2 rounded-xl shadow-md text-base text-gray-800 z-10 w-64 text-left"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              🦉 Recuerda que puedes elegir:
              <br />• Entre <strong>1 a 10 variables</strong>
              <br />• Entre <strong>1 a 20 restricciones</strong>
            </motion.div>
          )}

          <motion.div
            onMouseEnter={handleHover}
            className="relative flex flex-col items-center"
            animate={
              hablando
                ? { y: 0 }
                : {
                  y: [0, -10, 0],
                  transition: {
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }
            }
          >
            <img src="/assets/buho.png" alt="Búho" className="w-28 md:w-36" />
            {hablando && (
              <motion.div
                className="absolute top-[48%] left-[47%] -translate-x-1/2 w-3 h-3 bg-black rounded-full z-10"
                animate={{
                  scaleY: [1, 0.3, 1],
                }}
                transition={{
                  duration: 0.25,
                  repeat: Infinity,
                }}
              />
            )}
          </motion.div>
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg space-y-6"
        >
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Número de variables
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={variables}
              onChange={(e) => setVariables(Number(e.target.value))}
              className="w-24 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Número de restricciones
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={restricciones}
              onChange={(e) => setRestricciones(Number(e.target.value))}
              className="w-24 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-semibold shadow-md transition"
          >
            Iniciar Simulación <ArrowRight size={20} />
          </button>
          {/* Botón Volver */}
          <div className="mt-8 flex justify-center w-full">
            <Link
              to="/"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full shadow-lg transition duration-300"
            >
              🔄 Volver a Inicio
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Configurar;
