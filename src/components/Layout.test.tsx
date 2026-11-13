import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { routes } from '../routes';

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

describe('Layout', () => {
  it('muestra la navegación principal con todas las secciones', () => {
    renderAt('/');
    const nav = screen.getByRole('navigation', { name: 'Navegación principal' });
    const labels = within(nav)
      .getAllByRole('link')
      .map((link) => link.textContent);
    expect(labels).toEqual(['Inicio', 'Visor', 'Guías', 'Glosario', 'Apoyar', 'Legal']);
  });

  it('marca la sección activa con aria-current', () => {
    renderAt('/guias');
    const nav = screen.getByRole('navigation', { name: 'Navegación principal' });
    expect(within(nav).getByRole('link', { name: 'Guías' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(nav).getByRole('link', { name: 'Inicio' })).not.toHaveAttribute('aria-current');
  });

  it('navega entre secciones', async () => {
    renderAt('/');
    const nav = screen.getByRole('navigation', { name: 'Navegación principal' });
    await userEvent.click(within(nav).getByRole('link', { name: 'Glosario' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Glosario' })).toBeInTheDocument();
  });

  it('muestra una página 404 para rutas desconocidas', () => {
    renderAt('/no-existe');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Página no encontrada' }),
    ).toBeInTheDocument();
  });
});
