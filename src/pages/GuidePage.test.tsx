import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { guides } from '../guides/guides';
import GuidePage from './GuidePage';

function renderGuide(slug: string) {
  render(
    <MemoryRouter initialEntries={[`/guias/${slug}`]}>
      <Routes>
        <Route path="/guias/:slug" element={<GuidePage />} />
        <Route path="/guias" element={<h1>Índice de guías</h1>} />
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

  it('los enlaces internos del contenido navegan dentro del sitio', async () => {
    renderGuide('armado-paso-a-paso');
    const [link] = screen.getAllByRole('link', { name: 'Cableado básico' });
    await userEvent.click(link);
    expect(screen.getByRole('heading', { level: 1, name: 'Cableado básico' })).toBeInTheDocument();
  });

  it('marca el contenido como pendiente de revisión técnica', () => {
    for (const guide of guides) {
      expect(guide.body, guide.slug).toMatch(/pendiente de revisión técnica/i);
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
