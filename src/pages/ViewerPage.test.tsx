import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import ViewerPage from './ViewerPage';

// El visor 3D necesita WebGL, que jsdom no tiene. Aquí se prueba la página sin él.
vi.mock('../viewer/Viewer', () => ({
  default: ({ selectedNode }: { selectedNode: string | null }) => (
    <div data-testid="visor">{selectedNode ?? 'sin selección'}</div>
  ),
}));

function renderPage() {
  render(
    <MemoryRouter>
      <ViewerPage />
    </MemoryRouter>,
  );
}

describe('ViewerPage', () => {
  it('sincroniza la lista con el visor y el panel', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Tarjeta gráfica (GPU)' }));
    expect(await screen.findByTestId('visor')).toHaveTextContent('GPU');
    expect(screen.getByRole('heading', { level: 2, name: 'Tarjeta gráfica (GPU)' })).toBeVisible();
  });

  it('Escape cierra la selección', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Memoria RAM' }));
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('heading', { level: 2, name: 'Memoria RAM' })).toBeNull();
  });

  it('al cerrar el panel el foco vuelve a la lista', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Fuente de poder' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(screen.getByRole('button', { name: 'Fuente de poder' })).toHaveFocus();
  });
});
