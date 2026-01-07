import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          backgroundColor: '#0f172a',
          color: 'white',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            maxWidth: '500px',
            backgroundColor: '#1e293b',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
          }}>
            <h1 style={{ fontSize: '24px', marginBottom: '16px', color: '#ef4444' }}>
              ⚠️ Error en la aplicación
            </h1>
            <p style={{ marginBottom: '20px', color: '#cbd5e1' }}>
              La aplicación encontró un error. Por favor, intenta lo siguiente:
            </p>
            <ol style={{ marginBottom: '20px', paddingLeft: '20px', color: '#cbd5e1', lineHeight: '1.6' }}>
              <li>Recarga la página (desliza hacia abajo o presiona F5)</li>
              <li>Limpia el caché del navegador</li>
              <li>Abre en modo incógnito</li>
            </ol>
            <details style={{ marginTop: '20px', color: '#94a3b8', fontSize: '14px' }}>
              <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>
                Detalles técnicos
              </summary>
              <pre style={{
                backgroundColor: '#0f172a',
                padding: '10px',
                borderRadius: '6px',
                overflow: 'auto',
                fontSize: '12px'
              }}>
                {this.state.error?.toString()}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                width: '100%'
              }}
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
