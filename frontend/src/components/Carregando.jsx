// Indicador de carregamento (girando) com texto para leitores de tela.
export default function Carregando({ texto = 'Carregando...' }) {
  return (
    <div className="carregando" role="status">
      <span className="spinner" aria-hidden="true"></span>
      <span>{texto}</span>
    </div>
  );
}
