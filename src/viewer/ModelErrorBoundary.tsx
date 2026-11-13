import { Component, type ReactNode } from 'react';

interface Props {
  fallback: ReactNode;
  onError: (error: Error) => void;
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/** Si el .glb existe pero no se puede leer (archivo dañado), muestra el placeholder. */
export default class ModelErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
