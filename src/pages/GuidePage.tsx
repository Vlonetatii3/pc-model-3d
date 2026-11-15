import { Link, useParams } from 'react-router';
import { getGuide } from '../guides/guides';
import NotFoundPage from './NotFoundPage';

/** Provisional hasta T13: muestra el título de la guía y avisa que está en preparación. */
export default function GuidePage() {
  const { slug = '' } = useParams();
  const guide = getGuide(slug);
  if (!guide) return <NotFoundPage />;

  return (
    <>
      <h1>{guide.title}</h1>
      <p>Esta guía está en preparación.</p>
      <p>
        <Link to="/guias">Volver a las guías</Link>
      </p>
    </>
  );
}
