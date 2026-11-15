import type { MouseEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import SafetyNotice from '../components/SafetyNotice';
import { getComponentById } from '../data/components';
import { getGuide } from '../guides/guides';
import NotFoundPage from './NotFoundPage';
import './GuidePage.css';

export default function GuidePage() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const guide = getGuide(slug);
  if (!guide) return <NotFoundPage />;

  // Los enlaces internos del Markdown navegan con el router, sin recargar la página.
  const handleBodyClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as HTMLElement).closest('a');
    const href = link?.getAttribute('href');
    if (!href?.startsWith('/') || href.startsWith('//')) return;
    event.preventDefault();
    navigate(href);
  };

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
      <div
        className="guide-body"
        onClick={handleBodyClick}
        dangerouslySetInnerHTML={{ __html: guide.html }}
      />

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
