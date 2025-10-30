import { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '../utils/supabase/client';

interface ForgotPasswordPageProps {
  onNavigate: (page: string) => void;
}

export function ForgotPasswordPage({ onNavigate }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        throw new Error(resetError.message);
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
          {/* Back Button */}
          <button
            onClick={() => onNavigate('login')}
            className="flex items-center text-gray-300 hover:text-white transition mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour à la connexion
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/50">
              <Mail className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl text-white mb-2">Mot de passe oublié</h1>
            <p className="text-gray-300 text-sm">
              Entrez votre email pour recevoir un lien de réinitialisation
            </p>
          </div>

          {success ? (
            <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-6 text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-white text-xl mb-2">Email envoyé !</h3>
              <p className="text-gray-300 text-sm mb-6">
                Vérifiez votre boîte mail <span className="text-green-400">{email}</span> pour réinitialiser votre mot de passe.
              </p>
              <p className="text-gray-400 text-xs mb-4">
                💡 Pensez à vérifier vos spams si vous ne recevez pas l'email dans quelques minutes.
              </p>
              <button
                onClick={() => onNavigate('login')}
                className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-cyan-600 hover:via-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg"
              >
                Retour à la connexion
              </button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="block text-gray-300 mb-2 text-sm">
                  Adresse email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-center">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white px-6 py-4 rounded-xl hover:from-cyan-600 hover:via-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? '⏳ Envoi en cours...' : '📧 Envoyer le lien de réinitialisation'}
              </button>
            </form>
          )}

          {/* Info Box */}
          <div className="mt-6 bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
            <p className="text-blue-300 text-xs text-center">
              ℹ️ Le lien de réinitialisation expire après 1 heure
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
