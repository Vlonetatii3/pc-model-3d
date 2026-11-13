import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { components } from '../data/components';
import ComponentList from './ComponentList';

describe('ComponentList', () => {
  it('muestra un botón por componente', () => {
    render(<ComponentList components={components} selectedId={null} onSelect={vi.fn()} />);
    expect(screen.getAllByRole('button')).toHaveLength(components.length);
  });

  it('marca la pieza seleccionada con aria-pressed', () => {
    render(<ComponentList components={components} selectedId="gpu" onSelect={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Tarjeta gráfica (GPU)' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Fuente de poder' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('selecciona con el mouse y deselecciona con un segundo clic', async () => {
    const onSelect = vi.fn();
    const { rerender } = render(
      <ComponentList components={components} selectedId={null} onSelect={onSelect} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Memoria RAM' }));
    expect(onSelect).toHaveBeenLastCalledWith('ram');

    rerender(<ComponentList components={components} selectedId="ram" onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: 'Memoria RAM' }));
    expect(onSelect).toHaveBeenLastCalledWith(null);
  });

  it('se puede usar solo con el teclado', async () => {
    const onSelect = vi.fn();
    render(<ComponentList components={components} selectedId={null} onSelect={onSelect} />);
    await userEvent.tab();
    expect(screen.getByRole('button', { name: components[0].name })).toHaveFocus();
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    expect(onSelect).toHaveBeenLastCalledWith(components[1].id);
    await userEvent.tab();
    await userEvent.keyboard(' ');
    expect(onSelect).toHaveBeenLastCalledWith(components[2].id);
  });
});
