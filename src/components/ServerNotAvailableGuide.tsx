import { useState } from 'react';
import { AlertCircle, Terminal, CheckCircle, XCircle, RefreshCw, ExternalLink, Copy } from 'lucide-react';

interface ServerNotAvailableGuideProps {
  onRetry: () => void;
  onClose?: () => void;
}

export function ServerNotAvailableGuide({ onRetry, onClose }: ServerNotAvailableGuideProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const commands = [
    {
      id: '1',
      title: 'Étape 1 : Vérifier Supabase CLI',
      description: 'Assurez-vous que Supabase CLI est installé',
      command: 'supabase --version',
      expected: 'supabase 1.x.x',
    },
    {
      id: '2',
      title: 'Étape 2 : Se connecter à Supabase',
      description: 'Connectez-vous avec votre compte Supabase',
      command: 'supabase login',
      expected: 'Vous serez redirigé vers votre navigateur pour vous connecter',
    },
    {
      id: '3',
      title: 'Étape 3 : Lier le projet',
      description: 'Liez votre projet local au projet Supabase',
      command: 'supabase link --project-ref pwmxkcijsrykjvxnzxnt',
      expected: 'Finished supabase link',
    },
    {
      id: '4',
      title: 'Étape 4 : Déployer les Edge Functions',
      description: 'Déployez le serveur sur Supabase',
      command: 'supabase functions deploy server',
      expected: 'Deployed Function server',
    },
    {
      id: '5',
      title: 'Étape 5 : Tester',
      description: 'Vérifiez que le serveur répond',
      command: 'curl https://pwmxkcijsrykjvxnzxnt.supabase.co/functions/v1/make-server-b90be4d1/health',
      expected: '{"status":"ok","timestamp":"..."}',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 rounded-t-2xl">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-white text-3xl mb-2">
                  🚨 Serveur Non Disponible
                </h1>
                <p className="text-white/90">
                  Les Edge Functions Supabase ne sont pas déployées
                </p>
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white transition"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Quick explanation */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
              <h2 className="text-blue-900 text-xl mb-3">
                💡 Pourquoi cette erreur ?
              </h2>
              <p className="text-blue-800 mb-4">
                Le panel admin a besoin d'un serveur backend pour fonctionner. Ce serveur s'appelle 
                une "Edge Function" et doit être déployé sur Supabase.
              </p>
              <p className="text-blue-800">
                <strong>Temps de résolution : 5 minutes</strong>
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-6">
              <h2 className="text-2xl mb-4">
                🎯 Solution en 5 étapes
              </h2>

              {commands.map((step, index) => (
                <div key={step.id} className="border-2 border-gray-200 rounded-xl overflow-hidden">
                  {/* Step header */}
                  <div className="bg-gray-50 px-6 py-4 border-b-2 border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg">{step.title}</h3>
                        <p className="text-gray-600 text-sm">{step.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Command */}
                  <div className="p-6">
                    <div className="bg-gray-900 rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                        <div className="flex items-center space-x-2 text-gray-400 text-sm">
                          <Terminal className="w-4 h-4" />
                          <span>Terminal</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(step.command, step.id)}
                          className="flex items-center space-x-2 text-gray-400 hover:text-white transition text-sm"
                        >
                          {copied === step.id ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span className="text-green-400">Copié !</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>Copier</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="p-4">
                        <code className="text-green-400 text-sm">{step.command}</code>
                      </div>
                    </div>

                    {/* Expected result */}
                    <div className="mt-4 bg-green-50 border-2 border-green-200 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-green-800 text-sm mb-1">
                            <strong>Résultat attendu :</strong>
                          </p>
                          <code className="text-green-700 text-sm">{step.expected}</code>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Troubleshooting */}
            <div className="mt-8 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
              <h3 className="text-yellow-900 text-lg mb-4">
                🔧 Problèmes courants
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-yellow-800 mb-2">
                    <strong>❌ "supabase: command not found"</strong>
                  </p>
                  <div className="bg-white rounded-lg p-3 mb-2">
                    <code className="text-sm">npm install -g supabase</code>
                  </div>
                </div>

                <div>
                  <p className="text-yellow-800 mb-2">
                    <strong>❌ "Failed to deploy function"</strong>
                  </p>
                  <ul className="text-yellow-700 text-sm space-y-1 ml-4">
                    <li>• Vérifiez que vous êtes connecté : <code>supabase login</code></li>
                    <li>• Vérifiez que le projet est lié : <code>supabase link --project-ref pwmxkcijsrykjvxnzxnt</code></li>
                    <li>• Attendez 30 secondes après le déploiement (cold start)</li>
                  </ul>
                </div>

                <div>
                  <p className="text-yellow-800 mb-2">
                    <strong>❌ "Load failed" persiste après déploiement</strong>
                  </p>
                  <ul className="text-yellow-700 text-sm space-y-1 ml-4">
                    <li>• Attendez 1-2 minutes (cold start)</li>
                    <li>• Vérifiez les logs : <code>supabase functions logs server</code></li>
                    <li>• Testez manuellement avec curl (voir étape 5)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={onRetry}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl hover:from-purple-700 hover:to-blue-700 transition text-lg flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-6 h-6" />
                <span>Retester la connexion</span>
              </button>

              <a
                href="/DEMARRAGE_RAPIDE_ADMIN.md"
                target="_blank"
                className="flex-1 bg-white border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl hover:bg-gray-50 transition text-lg flex items-center justify-center space-x-2"
              >
                <ExternalLink className="w-6 h-6" />
                <span>Guide complet</span>
              </a>
            </div>

            {/* Quick links */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <a
                href="https://supabase.com/dashboard/project/pwmxkcijsrykjvxnzxnt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-sm"
              >
                <div className="text-purple-600 mb-1">Supabase Dashboard</div>
                <div className="text-gray-500 text-xs">Voir le projet</div>
              </a>
              
              <a
                href="/ERREUR_SERVEUR_NON_DISPONIBLE.md"
                target="_blank"
                className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-sm"
              >
                <div className="text-purple-600 mb-1">Guide serveur</div>
                <div className="text-gray-500 text-xs">Documentation</div>
              </a>
              
              <a
                href="/GUIDE_DEPLOYER_EDGE_FUNCTIONS.md"
                target="_blank"
                className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-sm"
              >
                <div className="text-purple-600 mb-1">Guide déploiement</div>
                <div className="text-gray-500 text-xs">Tutoriel détaillé</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
