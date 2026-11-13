import './ViewerFallback.css';

interface ViewerFallbackProps {
  reason: 'sin-webgl' | 'error';
}

const MESSAGES: Record<ViewerFallbackProps['reason'], string> = {
  'sin-webgl':
    'Tu navegador o dispositivo no puede mostrar el visor 3D porque WebGL no está disponible.',
  error: 'No se pudo cargar el visor 3D.',
};

/** Se muestra en lugar del visor cuando no hay WebGL o el visor falla. La lista sigue funcionando. */
export default function ViewerFallback({ reason }: ViewerFallbackProps) {
  return (
    <figure className="viewer-fallback">
      <img
        src="/images/pc-respaldo.webp"
        width={960}
        height={800}
        alt="PC de escritorio con el lateral abierto. Se ven la placa madre, el procesador, la memoria RAM, la tarjeta gráfica, la fuente de poder y el almacenamiento."
      />
      <figcaption>
        {MESSAGES[reason]} Puedes explorar las piezas con la lista de componentes.
      </figcaption>
    </figure>
  );
}
