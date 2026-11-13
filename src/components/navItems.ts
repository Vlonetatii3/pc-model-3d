export interface NavItem {
  to: string;
  label: string;
}

export const navItems: NavItem[] = [
  { to: '/', label: 'Inicio' },
  { to: '/visor', label: 'Visor' },
  { to: '/guias', label: 'Guías' },
  { to: '/glosario', label: 'Glosario' },
  { to: '/apoyar', label: 'Apoyar' },
  { to: '/legal', label: 'Legal' },
];
