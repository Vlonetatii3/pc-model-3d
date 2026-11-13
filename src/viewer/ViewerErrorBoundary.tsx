import { Component, type ReactNode } from 'react';

interface Props {
  fallback: ReactNode;
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Atrapa fallos del visor (WebGL que falla al crear el contexto, código del
 * visor que no se pudo descargar, etc.) para que no rompan la página.
 */
export default class ViewerErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn('[visor] El visor 3D falló; se muestra la imagen de respaldo.', error);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
