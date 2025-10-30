import { useState } from 'react';
import { Mail, Send, CheckCircle, HelpCircle, MessageSquare, Phone } from 'lucide-react';

interface HelpPageProps {
  currentUser: any;
  onNavigate: (page: string) => void;
}

export function HelpPage({ currentUser, onNavigate }: HelpPageProps) {
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulation d'envoi (à remplacer par votre backend email)
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log('Message d\'aide envoyé:', formData);

      setSuccess(true);
      setFormData({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        subject: '',
        message: '',
      });

      // Réinitialiser le succès après 5 secondes
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi du message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-cyan-500/30">
            <HelpCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl mb-4">Centre d'Aide</h1>
          <p className="text-xl text-gray-600">
            Besoin d'assistance ? Nous sommes là pour vous aider !
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Formulaire de contact */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <div className="flex items-center space-x-3 mb-6">
              <MessageSquare className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl">Nous Contacter</h2>
            </div>

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <p>Votre message a été envoyé avec succès ! Nous vous répondrons sous 24-48h.</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm mb-2">Nom</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Votre nom"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Sujet</label>
                <select
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Sélectionnez un sujet</option>
                  <option value="technical">Problème technique</option>
                  <option value="account">Question sur mon compte</option>
                  <option value="payment">Problème de paiement</option>
                  <option value="subscription">Question sur l'abonnement</option>
                  <option value="services">Services premium</option>
                  <option value="booking">Réservation de service</option>
                  <option value="messages">Messagerie</option>
                  <option value="profile">Mon profil</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">Message</label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[150px]"
                  placeholder="Décrivez votre problème ou votre question en détail..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white px-6 py-4 rounded-xl hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span>{loading ? 'Envoi en cours...' : 'Envoyer le message'}</span>
              </button>
            </form>
          </div>

          {/* Informations et FAQ */}
          <div className="space-y-6">
            {/* Contact rapide */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
              <h3 className="text-xl mb-4">Contact Direct</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-purple-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <a
                      href="mailto:support@opportunity-artist.com"
                      className="text-purple-600 hover:underline"
                    >
                      support@opportunity-artist.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-purple-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Téléphone</p>
                    <p>+33 (0)1 XX XX XX XX</p>
                    <p className="text-xs text-gray-500 mt-1">Lun-Ven : 9h-18h</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ rapide */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
              <h3 className="text-xl mb-4">Questions Fréquentes</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm mb-2">❓ <strong>Comment réinitialiser mon mot de passe ?</strong></p>
                  <p className="text-sm text-gray-600 ml-6">
                    Cliquez sur "Mot de passe oublié ?" sur la page de connexion.
                  </p>
                </div>
                <div>
                  <p className="text-sm mb-2">❓ <strong>Comment modifier mon abonnement ?</strong></p>
                  <p className="text-sm text-gray-600 ml-6">
                    Rendez-vous dans votre profil, section "Abonnement".
                  </p>
                </div>
                <div>
                  <p className="text-sm mb-2">❓ <strong>Les services premium sont-ils remboursables ?</strong></p>
                  <p className="text-sm text-gray-600 ml-6">
                    Consultez nos CGV dans les mentions légales pour plus d'informations.
                  </p>
                </div>
                <div>
                  <p className="text-sm mb-2">❓ <strong>Comment réserver un service pro ?</strong></p>
                  <p className="text-sm text-gray-600 ml-6">
                    Recherchez un professionnel, consultez ses services et cliquez sur "Réserver".
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('legal')}
                className="mt-6 w-full text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg border border-purple-200 transition"
              >
                Consulter les Mentions Légales
              </button>
            </div>

            {/* Temps de réponse */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-lg mb-3">⏱️ Délai de réponse</h3>
              <p className="text-sm text-gray-700">
                Notre équipe s'engage à répondre à votre demande dans un délai de <strong>24 à 48 heures</strong> ouvrées.
              </p>
              <p className="text-sm text-gray-700 mt-2">
                Pour les urgences techniques, nous traitons les demandes en priorité.
              </p>
            </div>
          </div>
        </div>

        {/* Bouton retour */}
        <div className="text-center">
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
