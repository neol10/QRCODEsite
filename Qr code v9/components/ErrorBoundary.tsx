
import React, { ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCcw, AlertTriangle } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * ErrorBoundary catches JavaScript errors anywhere in their child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */
// Fix: Use React.Component explicitly with Props and State generics to ensure inheritance of state and props
class ErrorBoundary extends React.Component<Props, State> {
  // Fix: Initialize state as a class property to ensure it is correctly defined on the instance
  public state: State = {
    hasError: false,
    error: undefined
  };

  // Fix: Removed the constructor to rely on property initializers and React.Component default behavior, 
  // resolving potential 'this.state' initialization issues in strict environments.

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to an error reporting service
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    // Fix: Access state and props from this, which are now correctly identified as inherited from React.Component
    const { hasError, error } = this.state;
    const { children } = this.props;

    // Access hasError state to check for error presence
    if (hasError) {
      // Fallback UI when an error is caught
      return (
        <div className="min-h-screen bg-[#060E0D] flex flex-col items-center justify-center p-8 text-center">
          <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/10 blur-[60px] rounded-full"></div>
              <div className="relative bg-red-500/10 border border-red-500/20 p-8 rounded-[40px] flex flex-col items-center gap-6">
                <ShieldAlert size={64} className="text-red-500" />
                <div className="space-y-2">
                  <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter">Erro de Sistema</h1>
                  <p className="text-zinc-500 text-sm font-medium">
                    Ocorreu uma falha crítica nos protocolos do NeoQrC. 
                    Por favor, reinicie a interface.
                  </p>
                </div>
                
                <div className="w-full p-4 bg-black/40 rounded-2xl border border-red-500/10 text-left">
                  <div className="flex items-center gap-2 text-red-400 mb-2">
                    <AlertTriangle size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Stack Trace</span>
                  </div>
                  <p className="text-[10px] font-mono text-zinc-600 break-all">
                    {/* Safely access the error message from the destructured state object */}
                    {error?.message || 'Unknown kernel panic'}
                  </p>
                </div>

                <button 
                  onClick={() => window.location.reload()}
                  className="w-full bg-red-500 text-white font-black py-4 rounded-2xl text-lg flex items-center justify-center gap-3 hover:bg-red-400 active:scale-95 transition-all shadow-[0_0_30px_rgba(239,68,68,0.2)]"
                >
                  <RefreshCcw size={20} />
                  Reiniciar Sistema
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Correctly return the children property from inherited props
    return children;
  }
}

export default ErrorBoundary;
