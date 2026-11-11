import { useEffect, useRef } from 'react';

// Janela de confirmação (usada antes de excluir). Fecha com o botão Cancelar ou com a tecla Esc.
export default function ModalConfirmacao({
  titulo,
  texto,
  textoConfirmar = 'Confirmar',
  processando = false,
  onConfirmar,
  onCancelar
}) {
  const botaoCancelar = useRef(null);

  useEffect(() => {
    // Foco no "Cancelar": é a opção mais segura se a pessoa apertar Enter sem querer
    botaoCancelar.current?.focus();

    function aoApertarTecla(e) {
      if (e.key === 'Escape' && !processando) {
        onCancelar();
      }
    }
    document.addEventListener('keydown', aoApertarTecla);
    return () => document.removeEventListener('keydown', aoApertarTecla);
  }, [onCancelar, processando]);

  return (
    <div className="modal-fundo" onClick={() => !processando && onCancelar()}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="modal-titulo">{titulo}</h2>
        <p>{texto}</p>
        <div className="modal-acoes">
          <button type="button" className="botao botao-secundario" ref={botaoCancelar} onClick={onCancelar} disabled={processando}>
            Cancelar
          </button>
          <button type="button" className="botao botao-perigo" onClick={onConfirmar} disabled={processando}>
            {processando ? 'Excluindo...' : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
