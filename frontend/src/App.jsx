import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import RotaProtegida from './components/RotaProtegida';
import Home from './pages/Home';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Ferramentas from './pages/Ferramentas';
import FerramentaDetalhe from './pages/FerramentaDetalhe';
import FerramentaForm from './pages/FerramentaForm';
import NaoEncontrada from './pages/NaoEncontrada';

// Mapa de telas do sistema: cada <Route> liga um endereço a uma tela.
function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Telas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

        {/* Área privada: só entra quem estiver logado (veja RotaProtegida) */}
        <Route element={<RotaProtegida />}>
          <Route path="/ferramentas" element={<Ferramentas />} />
          <Route path="/ferramentas/nova" element={<FerramentaForm />} />
          <Route path="/ferramentas/:id" element={<FerramentaDetalhe />} />
          <Route path="/ferramentas/:id/editar" element={<FerramentaForm />} />
        </Route>

        <Route path="*" element={<NaoEncontrada />} />
      </Route>
    </Routes>
  );
}

export default App;
