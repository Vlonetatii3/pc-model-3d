import { Link } from 'react-router';
import type { PcComponent } from '../data/schema';
import { getGuideSummary } from '../guides/catalog';
import './ComponentDetail.css';

const PENDING = 'pendiente de verificar';

interface ComponentDetailProps {
  component: PcComponent;
  onClose: () => void;
}

export default function ComponentDetail({ component, onClose }: ComponentDetailProps) {
  const headingId = `detalle-${component.id}`;
  const guides = component.relatedGuides.map((slug) => ({
    slug,
    title: getGuideSummary(slug)?.title ?? slug,
  }));

  return (
    <section className="component-detail" aria-labelledby={headingId}>
      <div className="component-detail-header">
        <h2 id={headingId}>{component.name}</h2>
        <button type="button" className="component-detail-close" onClick={onClose}>
          Cerrar
        </button>
      </div>
      <p className="component-detail-summary">{component.summary}</p>

      <h3>Qué hace</h3>
      <p>{component.function}</p>

      {component.keySpecs.length > 0 && (
        <>
          <h3>Especificaciones clave</h3>
          <dl className="component-detail-specs">
            {component.keySpecs.map((spec) => (
              <div key={spec.label}>
                <dt>{spec.label}</dt>
                <dd className={spec.value === PENDING ? 'is-pending' : undefined}>{spec.value}</dd>
              </div>
            ))}
          </dl>
        </>
      )}

      {guides.length > 0 && (
        <>
          <h3>Guías relacionadas</h3>
          <ul className="component-detail-guides">
            {guides.map((guide) => (
              <li key={guide.slug}>
                <Link to={`/guias/${guide.slug}`}>{guide.title}</Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
