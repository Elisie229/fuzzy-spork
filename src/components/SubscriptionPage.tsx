import { Check, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { api } from '../utils/api';

interface SubscriptionPageProps {
  currentUser: any;
  onNavigate: (page: string) => void;
  onSubscribe: () => void;
}

export function SubscriptionPage({
  currentUser,
  onNavigate,
  onSubscribe,
}: SubscriptionPageProps) {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const handleSubscribe = async () => {
    if (!currentUser) {
      onNavigate('login');
      return;
    }

    try {
      setLoading(true);
      await api.activateSubscription(currentUser.id);
      alert('Abonnement activé avec succès ! Bienvenue sur Opportunity.');
      onSubscribe();
      onNavigate('questionnaire');
    } catch (error: any) {
      console.error('Subscription error:', error);
      alert('Erreur lors de l\'activation : ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl mb-4">Abonnement Opportunity</h1>
          <p className="text-xl text-gray-600 mb-4">
            Accédez à toutes les fonctionnalités de la plateforme
          </p>
          <div className="bg-cyan-100 border-2 border-cyan-400 rounded-xl p-4 max-w-2xl mx-auto">
            <p className="text-cyan-900">
              <strong>⚠️ Paiement obligatoire :</strong> L'abonnement annuel à <strong>5,99€</strong> est requis 
              pour accéder à la plateforme Opportunity et toutes ses fonctionnalités.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="md:grid md:grid-cols-2">
            {/* Left - Features */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white p-8">
              <h2 className="text-2xl mb-6">Inclus dans l'abonnement</h2>
              <ul className="space-y-4">
                {[
                  'Accès complet à la plateforme',
                  'Recherche IA personnalisée',
                  'Messagerie illimitée',
                  'Calendrier de réservation',
                  'Profil détaillé avec badge de classification',
                  'Visibilité auprès des professionnels',
                  'Notifications en temps réel',
                  'Support prioritaire',
                  'Accès aux événements exclusifs',
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <Check className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 p-4 bg-white/20 rounded-lg">
                <p className="text-sm">
                  Votre abonnement est valable <strong>1 an</strong> à partir de la date de souscription.
                  Renouvellement automatique sauf résiliation.
                </p>
              </div>
            </div>

            {/* Right - Payment */}
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="text-5xl mb-2">5,99 €</div>
                <p className="text-gray-600">par an</p>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg mb-4">Méthode de paiement</h3>
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition border-purple-600 bg-purple-50">
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <CreditCard className="w-5 h-5 mr-2" />
                      <span>Carte bancaire</span>
                    </label>
                  </div>
                </div>

                {paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm mb-2">Numéro de carte</label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-2">Date d'expiration</label>
                        <input
                          type="text"
                          placeholder="MM/AA"
                          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-2">CVV</label>
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                  <p className="text-yellow-900">
                    <strong>Note :</strong> Ceci est un prototype. Aucun paiement réel n'est effectué.
                  </p>
                </div>

                <button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white px-6 py-4 rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition disabled:opacity-50"
                >
                  {loading ? 'Traitement...' : 'Souscrire maintenant'}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  En souscrivant, vous acceptez nos{' '}
                  <button
                    onClick={() => onNavigate('legal')}
                    className="text-purple-600 hover:underline"
                  >
                    Conditions Générales
                  </button>{' '}
                  et notre{' '}
                  <button
                    onClick={() => onNavigate('legal')}
                    className="text-purple-600 hover:underline"
                  >
                    Politique de confidentialité
                  </button>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => onNavigate('home')}
            className="text-gray-600 hover:text-purple-600 transition"
          >
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}
