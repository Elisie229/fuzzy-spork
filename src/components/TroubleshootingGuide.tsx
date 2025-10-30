import { AlertCircle, CheckCircle, XCircle, RefreshCw, Bug, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TroubleshootingGuideProps {
  onNavigate: (page: string) => void;
}

export function TroubleshootingGuide({ onNavigate }: TroubleshootingGuideProps) {
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    setDebugMode(localStorage.getItem('DEBUG_MODE') === 'true');
  }, []);

  const handleClearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    alert('Cache vidé ! La page va se recharger.');
    window.location.reload();
  };

  const toggleDebugMode = () => {
    const newMode = !debugMode;
    if (newMode) {
      localStorage.setItem('DEBUG_MODE', 'true');
      alert('🐛 Mode debug activé ! Les erreurs filtrées seront affichées. Rechargez la page pour voir l\'effet.');
    } else {
      localStorage.removeItem('DEBUG_MODE');
      alert('🔇 Mode debug désactivé ! Les erreurs WASM sont masquées. Rechargez la page pour voir l\'effet.');
    }
    setDebugMode(newMode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <AlertCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl mb-4">Guide de Dépannage</h1>
          <p className="text-gray-600 text-lg">
            Solutions aux problèmes courants
          </p>
        </div>

        <div className="space-y-6">
          {/* Panneau de contrôle */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-xl border-2 border-blue-200 p-8">
            <div className="flex items-start space-x-4 mb-4">
              <Filter className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl mb-2 text-blue-900">Panneau de Contrôle</h2>
                <p className="text-blue-700 mb-4">
                  Options avancées pour le debugging et la maintenance.
                </p>
              </div>
            </div>

            <div className="ml-10 space-y-4">
              {/* Mode Debug */}
              <div className="bg-white rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Bug className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg text-blue-900">Mode Debug</h3>
                  </div>
                  <button
                    onClick={toggleDebugMode}
                    className={`px-4 py-2 rounded-lg transition ${
                      debugMode
                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {debugMode ? '🐛 Désactiver' : '🔇 Activer'}
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {debugMode ? (
                    <span className="text-orange-600">
                      ⚠️ Mode debug activé - Toutes les erreurs (y compris WASM de Figma) sont affichées.
                    </span>
                  ) : (
                    <span className="text-green-600">
                      ✅ Mode normal - Les erreurs WASM de Figma sont filtrées.
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  Le mode debug affiche toutes les erreurs dans la console, y compris celles de Figma DevTools.
                  Rechargez la page après changement.
                </p>
              </div>

              {/* Vider le cache */}
              <div className="bg-white rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <RefreshCw className="w-5 h-5 text-orange-600" />
                    <h3 className="text-lg text-blue-900">Vider le Cache</h3>
                  </div>
                  <button
                    onClick={handleClearCache}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                  >
                    🗑️ Vider
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  Supprime toutes les données en cache et recharge la page. Utile si vous rencontrez des problèmes persistants.
                </p>
              </div>
            </div>
          </div>

          {/* Erreurs WASM */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl border-2 border-purple-200 p-8">
            <div className="flex items-start space-x-4 mb-4">
              <AlertCircle className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl mb-2 text-purple-900">Erreurs WASM (WebAssembly)</h2>
                <p className="text-purple-700 mb-4">
                  Ces erreurs proviennent de Figma DevTools et n'affectent PAS votre application.
                </p>
              </div>
            </div>

            <div className="ml-10">
              <div className="bg-white rounded-xl p-6 border border-purple-200 mb-4">
                <h3 className="text-lg mb-3 text-purple-900">Exemples d'erreurs filtrées :</h3>
                <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto text-gray-600">
{`<?>.wasm-function[4314]@[wasm code]
<?>.wasm-function[4301]@[wasm code]
@https://www.figma.com/webpack-artifacts/...`}
                </pre>
              </div>

              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-purple-900">Origine :</strong>
                    <p className="text-gray-600 text-sm">
                      Ces erreurs sont générées par Figma Make (environnement d'exécution), pas par votre code.
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-purple-900">Impact :</strong>
                    <p className="text-gray-600 text-sm">
                      Aucun impact sur votre application. Tout fonctionne normalement.
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-purple-900">Solution :</strong>
                    <p className="text-gray-600 text-sm">
                      Un filtre automatique masque ces erreurs. Vous pouvez les voir en mode debug si nécessaire.
                    </p>
                  </div>
                </li>
              </ul>

              <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-xl">
                <p className="text-green-800 text-sm text-center">
                  ✅ <strong>Bonne nouvelle :</strong> Ces erreurs sont automatiquement filtrées !
                  Votre console est propre et seules les vraies erreurs sont affichées.
                </p>
              </div>
            </div>
          </div>

          {/* Problème 1 : Erreur de connexion */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8">
            <div className="flex items-start space-x-4 mb-4">
              <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl mb-2">Erreur : "Invalid login credentials"</h2>
                <p className="text-gray-600 mb-4">
                  Ce message apparaît quand l'email ou le mot de passe est incorrect.
                </p>
              </div>
            </div>

            <div className="ml-10">
              <h3 className="text-lg mb-3">Solutions :</h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Vérifiez vos identifiants :</strong>
                    <p className="text-gray-600 text-sm">
                      Assurez-vous que votre email et mot de passe sont corrects. Le mot de passe est sensible à la casse.
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Pas encore de compte ?</strong>
                    <p className="text-gray-600 text-sm mb-2">
                      Si vous n'avez pas encore créé de compte, inscrivez-vous d'abord.
                    </p>
                    <button
                      onClick={() => onNavigate('signup')}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm"
                    >
                      S'inscrire maintenant
                    </button>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Mot de passe oublié ?</strong>
                    <p className="text-gray-600 text-sm mb-2">
                      Réinitialisez votre mot de passe en cliquant sur le lien sur la page de connexion.
                    </p>
                    <button
                      onClick={() => onNavigate('forgot-password')}
                      className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition text-sm"
                    >
                      Réinitialiser le mot de passe
                    </button>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Problème 2 : Erreur de paiement */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8">
            <div className="flex items-start space-x-4 mb-4">
              <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl mb-2">Erreur : "Load failed" lors du paiement</h2>
                <p className="text-gray-600 mb-4">
                  Le paiement échoue car vous n'êtes pas connecté ou votre session a expiré.
                </p>
              </div>
            </div>

            <div className="ml-10">
              <h3 className="text-lg mb-3">Solutions :</h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Reconnectez-vous :</strong>
                    <p className="text-gray-600 text-sm mb-2">
                      Votre session a peut-être expiré. Déconnectez-vous et reconnectez-vous.
                    </p>
                    <button
                      onClick={() => onNavigate('login')}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm"
                    >
                      Se connecter
                    </button>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Vérifiez votre abonnement :</strong>
                    <p className="text-gray-600 text-sm">
                      Assurez-vous que votre abonnement annuel (5,99€) est actif avant d'acheter des services premium.
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Videz le cache :</strong>
                    <p className="text-gray-600 text-sm mb-2">
                      Si le problème persiste, videz le cache de votre navigateur.
                    </p>
                    <button
                      onClick={handleClearCache}
                      className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition text-sm flex items-center space-x-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Vider le cache</span>
                    </button>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Problème 3 : Session expirée */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8">
            <div className="flex items-start space-x-4 mb-4">
              <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl mb-2">Session expirée</h2>
                <p className="text-gray-600 mb-4">
                  Votre session a expiré ou vous avez été déconnecté.
                </p>
              </div>
            </div>

            <div className="ml-10">
              <h3 className="text-lg mb-3">Solutions :</h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Reconnectez-vous :</strong>
                    <p className="text-gray-600 text-sm mb-2">
                      Cliquez sur le bouton ci-dessous pour vous reconnecter.
                    </p>
                    <button
                      onClick={() => onNavigate('login')}
                      className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition"
                    >
                      Se reconnecter
                    </button>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Problème 4 : Profil non trouvé */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8">
            <div className="flex items-start space-x-4 mb-4">
              <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl mb-2">Profil non trouvé</h2>
                <p className="text-gray-600 mb-4">
                  Votre profil n'a pas pu être chargé.
                </p>
              </div>
            </div>

            <div className="ml-10">
              <h3 className="text-lg mb-3">Solutions :</h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Complétez votre inscription :</strong>
                    <p className="text-gray-600 text-sm">
                      Assurez-vous d'avoir complété toutes les étapes :
                      <ul className="list-disc ml-6 mt-2 space-y-1">
                        <li>Inscription initiale</li>
                        <li>Abonnement annuel (5,99€)</li>
                        <li>Questionnaire de classification</li>
                      </ul>
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Contactez le support :</strong>
                    <p className="text-gray-600 text-sm">
                      Si le problème persiste après avoir complété toutes les étapes, contactez-nous.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Étapes normales d'inscription */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-xl border-2 border-green-200 p-8">
            <div className="flex items-start space-x-4 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl mb-2 text-green-900">Processus d'inscription normal</h2>
                <p className="text-green-700 mb-4">
                  Voici les étapes à suivre pour une inscription complète :
                </p>
              </div>
            </div>

            <div className="ml-10 space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                  1
                </div>
                <div>
                  <strong className="text-green-900">Créez votre compte</strong>
                  <p className="text-green-700 text-sm">
                    Remplissez le formulaire d'inscription avec votre email, mot de passe, nom et pseudo.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                  2
                </div>
                <div>
                  <strong className="text-green-900">Payez l'abonnement annuel</strong>
                  <p className="text-green-700 text-sm">
                    5,99€/an pour accéder à toutes les fonctionnalités de la plateforme.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                  3
                </div>
                <div>
                  <strong className="text-green-900">Remplissez le questionnaire</strong>
                  <p className="text-green-700 text-sm">
                    Répondez aux questions pour obtenir votre badge de classification.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                  4
                </div>
                <div>
                  <strong className="text-green-900">Profitez de la plateforme !</strong>
                  <p className="text-green-700 text-sm">
                    Recherchez des artistes/pros, messagerie, services premium, et plus encore.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bouton retour */}
        <div className="text-center mt-12">
          <button
            onClick={() => onNavigate('home')}
            className="text-gray-600 hover:text-gray-900 transition"
          >
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}
