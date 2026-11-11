// Caixa de aviso. tipo: "sucesso" | "erro" | "info"
// Se receber onFechar, mostra o botão "×" para dispensar o aviso.
export default function Alerta({ tipo = 'info', children, onFechar }) {
  return (
    <div className={`alerta alerta-${tipo}`} role={tipo === 'erro' ? 'alert' : 'status'}>
      <span>{children}</span>
      {onFechar && (
        <button type="button" className="alerta-fechar" onClick={onFechar} aria-label="Fechar aviso">
          ×
        </button>
      )}
    </div>
  );
}
