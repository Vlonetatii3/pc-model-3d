import type { RouteObject } from 'react-router';
import Layout from './components/Layout';
import GlossaryPage from './pages/GlossaryPage';
import GuidePage from './pages/GuidePage';
import GuidesPage from './pages/GuidesPage';
import HomePage from './pages/HomePage';
import LegalPage from './pages/LegalPage';
import NotFoundPage from './pages/NotFoundPage';
import SupportPage from './pages/SupportPage';
import ViewerPage from './pages/ViewerPage';

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'visor', element: <ViewerPage /> },
      { path: 'guias', element: <GuidesPage /> },
      { path: 'guias/:slug', element: <GuidePage /> },
      { path: 'glosario', element: <GlossaryPage /> },
      { path: 'apoyar', element: <SupportPage /> },
      { path: 'legal', element: <LegalPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
