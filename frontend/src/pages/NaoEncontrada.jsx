import { Link } from 'react-router-dom';

// Mostrada quando o endereço digitado não existe.
export default function NaoEncontrada() {
  return (
    <div className="estado-vazio">
      <h1>Página não encontrada</h1>
      <p>O endereço que você abriu não existe.</p>
      <Link to="/" className="botao botao-primario">Ir para a página inicial</Link>
    </div>
  );
}
