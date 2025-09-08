import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Inicio from "./pages/Inicio"; // Página de inicio
import Configurar from "./pages/Configurar"; // Página de configuración Sipmplex
import Configurar2 from "./pages/Configurar2"; // Página de configuración Gráfico
import Simulador from "./pages/Simulador"; // Página del simulador Simplex
import Simulador2 from "./pages/Simulador2"; // Página del simulador Gráfico
import PasoAPaso from "./pages/PasoAPaso"; // Página de pasos del Simplex
import ResultadosGraficos from "./pages/ResultadosGraficos"; // Página de Metodo Gráfico

function App() {
  return (
    <Router>
      <Routes>
        {/* Página de inicio */}
        <Route path="/" element={<Inicio />} />

        {/* Configuración Método Simplex*/}
        <Route path="/configurar" element={<Configurar />} />

        {/* Configuración Método Gráfico */}
        <Route path="/configurar2" element={<Configurar2 />} />

        {/* Página del simulador Simplex */}
        <Route path="/simulador" element={<Simulador />} />

        {/* Página del simulador Gráfico */}
        <Route path="/simulador2" element={<Simulador2 />} />

        {/* Página de pasos del Simplex */}
        <Route path="/paso-a-paso" element={<PasoAPaso />} />

        {/* Página de pasos del Grafico */}
        <Route path="/resultados-graficos" element={<ResultadosGraficos />} />
      </Routes>
    </Router>
  );
}

export default App;
