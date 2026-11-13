import { NavLink, Outlet } from 'react-router';
import { navItems } from './navItems';
import './Layout.css';

export default function Layout() {
  return (
    <div className="layout">
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <header className="site-header">
        <NavLink to="/" className="site-logo">
          ArmaTuPC
        </NavLink>
        <nav aria-label="Navegación principal">
          <ul className="site-nav">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.to === '/'}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main id="contenido" className="site-main" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <p>
          Contenido educativo gratuito. Antes de manipular hardware, lee el{' '}
          <NavLink to="/legal">aviso de responsabilidad</NavLink>.
        </p>
      </footer>
    </div>
  );
}
