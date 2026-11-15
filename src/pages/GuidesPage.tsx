import { Link } from 'react-router';
import { guides } from '../guides/guides';

export default function GuidesPage() {
  return (
    <>
      <h1>Guías</h1>
      <p>Guías paso a paso de armado, cableado y diagnóstico.</p>
      <ul>
        {guides.map((guide) => (
          <li key={guide.slug}>
            <Link to={`/guias/${guide.slug}`}>{guide.title}</Link>
            <p>
              Nivel {guide.level} · Tiempo estimado: {guide.estimatedTime}
              {guide.safetyWarning && ' · Incluye advertencia de seguridad'}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}
