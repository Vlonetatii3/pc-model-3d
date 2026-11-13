import type { PcComponent } from '../data/schema';
import { componentButtonId } from './componentButtonId';
import './ComponentList.css';

interface ComponentListProps {
  components: PcComponent[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

/** Lista de piezas equivalente al clic en el modelo. Cada botón alterna la selección. */
export default function ComponentList({ components, selectedId, onSelect }: ComponentListProps) {
  return (
    <nav className="component-list" aria-labelledby="lista-componentes">
      <h2 id="lista-componentes">Componentes</h2>
      <ul>
        {components.map((component) => {
          const isSelected = component.id === selectedId;
          return (
            <li key={component.id}>
              <button
                type="button"
                id={componentButtonId(component.id)}
                aria-pressed={isSelected}
                onClick={() => onSelect(isSelected ? null : component.id)}
              >
                {component.name}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
