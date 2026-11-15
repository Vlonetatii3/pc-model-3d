import { Link, useParams } from 'react-router';
import SafetyNotice from '../components/SafetyNotice';
import { getComponentById } from '../data/components';
import { getGuide } from '../guides/guides';
import NotFoundPage from './NotFoundPage';
import './GuidePage.css';

export default function GuidePage() {
  const { slug = '' } = useParams();
  const guide = getGuide(slug);
  if (!guide) return <NotFoundPage />;

  const related = guide.relatedComponents
    .map((id) => getComponentById(id))
    .filter((component) => component !== undefined);

  return (
    <article className="guide">
      <h1>{guide.title}</h1>
      <p className="guide-meta">
        Nivel {guide.level} · Tiempo estimado: {guide.estimatedTime}
      </p>

      {guide.safetyWarning && <SafetyNotice />}

      {/* HTML generado en build desde content/guides/ (contenido del repo, no de usuarios). */}
      <div className="guide-body" dangerouslySetInnerHTML={{ __html: guide.html }} />

      {related.length > 0 && (
        <section aria-labelledby="guide-related">
          <h2 id="guide-related">Componentes relacionados</h2>
          <ul>
            {related.map((component) => (
              <li key={component.id}>
                <Link to="/visor">{component.name}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p>
        <Link to="/guias">Volver a las guías</Link>
      </p>
    </article>
  );
}
