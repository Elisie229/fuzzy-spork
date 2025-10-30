import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Ignorer les erreurs WASM de Figma DevTools
    const errorString = error.toString() + (error.stack || '');
    const isFigmaError = /wasm-function|devtools_worker|webpack-artifacts/i.test(errorString);
    
    if (isFigmaError) {
      // Ne pas afficher l'écran d'erreur pour les erreurs Figma
      return { hasError: false, error: null };
    }
    
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Ignorer les erreurs WASM de Figma DevTools
    const errorString = error.toString() + (error.stack || '');
    const isFigmaError = /wasm-function|devtools_worker|webpack-artifacts/i.test(errorString);
    
    if (isFigmaError) {
      // Log en mode silencieux pour les erreurs Figma
      if (localStorage.getItem('DEBUG_MODE') === 'true') {
        console.log('[ErrorBoundary] Figma error filtered:', error);
      }
      return;
    }
    
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <h2 className="text-2xl mb-2 text-gray-900">Oups ! Une erreur est survenue</h2>
            <p className="text-gray-600 mb-4">
              Une erreur inattendue s'est produite. Veuillez rafraîchir la page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
            >
              Rafraîchir la page
            </button>
            {this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                  Détails techniques
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto text-red-600">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}