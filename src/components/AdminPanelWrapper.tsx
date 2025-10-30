import { useState, useEffect } from 'react';
import { AdminPanel } from './AdminPanel';
import { ServerNotAvailableGuide } from './ServerNotAvailableGuide';

interface AdminPanelWrapperProps {
  currentUser: any;
  onNavigate: (page: string) => void;
}

export function AdminPanelWrapper({ currentUser, onNavigate }: AdminPanelWrapperProps) {
  const [showGuide, setShowGuide] = useState(false);
  const [serverAvailable, setServerAvailable] = useState<boolean | null>(null);

  const testServer = async () => {
    try {
      console.log('[AdminWrapper] Testing server connection...');
      const projectId = 'pwmxkcijsrykjvxnzxnt';
      const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-b90be4d1`;
      
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('[AdminWrapper] ✅ Server is available');
        setServerAvailable(true);
        setShowGuide(false);
      } else {
        console.log('[AdminWrapper] ❌ Server returned:', response.status);
        setServerAvailable(false);
        setShowGuide(true);
      }
    } catch (error: any) {
      console.log('[AdminWrapper] ❌ Server is not reachable:', error?.message);
      setServerAvailable(false);
      setShowGuide(true);
    }
  };

  useEffect(() => {
    testServer();
  }, []);

  const handleRetry = async () => {
    setShowGuide(false);
    await testServer();
  };

  // Show loading while testing
  if (serverAvailable === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse shadow-2xl shadow-cyan-500/50">
            <span className="text-white text-2xl">O</span>
          </div>
          <p className="text-gray-600">Vérification du serveur...</p>
        </div>
      </div>
    );
  }

  // Show guide if server is not available
  if (showGuide && !serverAvailable) {
    return <ServerNotAvailableGuide onRetry={handleRetry} />;
  }

  // Show AdminPanel if server is available
  return <AdminPanel currentUser={currentUser} onNavigate={onNavigate} />;
}
