import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { getComponentById } from '../data/components';
import ComponentDetail from './ComponentDetail';

const gpu = getComponentById('gpu')!;

function renderDetail(onClose = vi.fn()) {
  render(
    <MemoryRouter>
      <ComponentDetail component={gpu} onClose={onClose} />
    </MemoryRouter>,
  );
  return onClose;
}

describe('ComponentDetail', () => {
  it('muestra el nombre y la función de la GPU (criterio de aceptación del MVP)', () => {
    renderDetail();
    expect(screen.getByRole('heading', { level: 2, name: gpu.name })).toBeInTheDocument();
    expect(screen.getByText(gpu.function)).toBeInTheDocument();
  });

  it('lista las especificaciones clave', () => {
    renderDetail();
    for (const spec of gpu.keySpecs) {
      expect(screen.getByText(spec.label)).toBeInTheDocument();
    }
    expect(screen.getAllByText('pendiente de verificar')).toHaveLength(gpu.keySpecs.length);
  });

  it('enlaza a las guías relacionadas', () => {
    renderDetail();
    expect(screen.getByRole('link', { name: 'Cableado básico' })).toHaveAttribute(
      'href',
      '/guias/cableado-basico',
    );
  });

  it('llama a onClose al pulsar Cerrar', async () => {
    const onClose = renderDetail();
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
