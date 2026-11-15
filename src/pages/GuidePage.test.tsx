import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { guides } from '../guides/guides';
import GuidePage from './GuidePage';

function renderGuide(slug: string) {
  render(
    <MemoryRouter initialEntries={[`/guias/${slug}`]}>
      <Routes>
        <Route path="/guias/:slug" element={<GuidePage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('GuidePage', () => {
  it.each(guides.map((guide) => [guide.slug, guide] as const))(
    '%s muestra título, secciones obligatorias y ayuda profesional',
    (slug, guide) => {
      renderGuide(slug);
      expect(screen.getByRole('heading', { level: 1, name: guide.title })).toBeInTheDocument();
      for (const name of [
        'Qué necesitas',
        'Pasos',
        'Errores comunes',
        'Cuándo pedir ayuda profesional',
      ]) {
        expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
      }
      expect(screen.getAllByRole('list').some((list) => list.tagName === 'OL')).toBe(true);
    },
  );

  it.each(guides.filter((g) => g.safetyWarning).map((g) => [g.slug]))(
    '%s muestra la advertencia de seguridad (criterio de aceptación del MVP)',
    (slug) => {
      renderGuide(slug);
      expect(screen.getByRole('note')).toHaveTextContent('Advertencia de seguridad');
    },
  );

  it('no muestra la advertencia si safetyWarning es false', () => {
    const guide = guides[0];
    const original = guide.safetyWarning;
    guide.safetyWarning = false;
    try {
      renderGuide(guide.slug);
      expect(screen.queryByRole('note')).not.toBeInTheDocument();
    } finally {
      guide.safetyWarning = original;
    }
  });

  it('lista los componentes relacionados', () => {
    renderGuide('cableado-basico');
    expect(screen.getByRole('heading', { name: 'Componentes relacionados' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Tarjeta gráfica (GPU)' })).toBeInTheDocument();
  });

  it('muestra "no encontrada" para un slug inexistente', () => {
    renderGuide('no-existe');
    expect(screen.getByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument();
  });
});
