import { useState } from 'react';
import { supabase } from '../utils/supabase/client';
import { api } from '../utils/api';

interface AuthPageProps {
  mode: 'login' | 'signup';
  onSuccess: (user: any, accessToken: string) => void;
  onNavigate: (page: string) => void;
}

export function AuthPage({ mode, onSuccess, onNavigate }: AuthPageProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    pseudo: '',
    userType: 'artist',
    profileImage: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, profileImage: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        // Sign up
        const result = await api.signup({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          pseudo: formData.pseudo,
          userType: formData.userType,
          profileImage: formData.profileImage,
        });

        if (!result || !result.userId) {
          throw new Error('Erreur lors de la création du compte');
        }

        // Then sign in
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) {
          console.error('Sign in error:', signInError);
          throw new Error(signInError.message || 'Erreur de connexion');
        }

        if (!data.session) {
          throw new Error('Session non créée');
        }

        const accessToken = data.session.access_token;
        const userId = data.user.id;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('userId', userId);

        // Get user profile with retry
        let profile;
        try {
          profile = await api.getProfile(userId);
        } catch (profileError) {
          console.error('Error getting profile, will retry:', profileError);
          // Wait a bit and retry
          await new Promise(resolve => setTimeout(resolve, 500));
          profile = await api.getProfile(userId);
        }

        if (!profile || !profile.profile) {
          throw new Error('Profil non trouvé');
        }

        onSuccess(profile.profile, accessToken);
      } else {
        // Sign in
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) {
          console.error('Sign in error:', signInError);
          
          // Message d'erreur plus clair
          let errorMsg = 'Identifiants incorrects';
          if (signInError.message.includes('Invalid login credentials')) {
            errorMsg = 'Email ou mot de passe incorrect. Si vous n\'avez pas encore de compte, cliquez sur "S\'inscrire".';
          } else if (signInError.message.includes('Email not confirmed')) {
            errorMsg = 'Veuillez confirmer votre email avant de vous connecter.';
          }
          
          throw new Error(errorMsg);
        }

        if (!data.session || !data.user) {
          throw new Error('Session non créée');
        }

        const accessToken = data.session.access_token;
        const userId = data.user.id;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('userId', userId);

        // Get user profile
        const profile = await api.getProfile(userId);
        
        if (!profile || !profile.profile) {
          throw new Error('Profil non trouvé');
        }

        onSuccess(profile.profile, accessToken);
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-cyan-500/50">
            <span className="text-white text-2xl">O</span>
          </div>
          <h1 className="text-3xl mb-2">
            {mode === 'login' ? 'Connexion' : 'Inscription'}
          </h1>
          <p className="text-gray-600">
            {mode === 'login'
              ? 'Bienvenue sur Opportunity'
              : 'Créez votre compte Opportunity'}
          </p>
        </div>

        {error && (
          <div className="bg-blue-50 border border-blue-300 rounded-lg mb-6 overflow-hidden">
            <div className="px-4 py-3">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  {error.includes('Email ou mot de passe incorrect') && mode === 'login' ? (
                    <div className="space-y-3">
                      <p className="text-blue-900 font-medium">Ce compte n'existe pas encore</p>
                      <p className="text-sm text-blue-800">
                        Vous n'avez pas encore créé de compte Opportunity. Veuillez vous inscrire pour accéder à la plateforme.
                      </p>
                      <button
                        type="button"
                        onClick={() => onNavigate('signup')}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg hover:shadow-lg transition text-sm font-medium"
                      >
                        ✨ Créer mon compte gratuitement
                      </button>
                      <p className="text-xs text-blue-700 text-center">
                        L'inscription ne prend que 2 minutes • Abonnement : 5,99€/an
                      </p>
                    </div>
                  ) : (
                    <p className="text-blue-900">{error}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-sm mb-2">Nom complet</label>
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
                <label className="block text-sm mb-2">Pseudo</label>
                <input
                  type="text"
                  required
                  value={formData.pseudo}
                  onChange={(e) => setFormData({ ...formData, pseudo: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Votre pseudo"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Photo de profil (optionnelle)</label>
                <div className="flex items-center space-x-4">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Prévisualisation"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                    />
                  )}
                  <label className="flex-1 cursor-pointer">
                    <div className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-500 text-center transition">
                      <span className="text-gray-600 text-sm">
                        {formData.profileImage ? formData.profileImage.name : 'Choisir une image'}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2">Type de compte</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, userType: 'artist' })}
                    className={`px-4 py-3 rounded-lg border-2 transition ${
                      formData.userType === 'artist'
                        ? 'border-purple-600 bg-gray-100'
                        : 'border-gray-300'
                    }`}
                  >
                    Artiste
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, userType: 'pro' })}
                    className={`px-4 py-3 rounded-lg border-2 transition ${
                      formData.userType === 'pro'
                        ? 'border-purple-600 bg-gray-100'
                        : 'border-gray-300'
                    }`}
                  >
                    Professionnel
                  </button>
                </div>
              </div>
            </>
          )}

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
            <label className="block text-sm mb-2">Mot de passe</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="••••••••"
              minLength={6}
            />
            {mode === 'login' && (
              <div className="text-right mt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('forgot-password')}
                  className="text-purple-600 hover:underline text-sm"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white px-6 py-4 rounded-xl hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 disabled:opacity-50 transform hover:scale-[1.02]"
          >
            {loading
              ? 'Chargement...'
              : mode === 'login'
              ? 'Se connecter'
              : "S'inscrire"}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          {mode === 'login' ? (
            <>
              <p className="text-gray-600">
                Pas encore de compte ?{' '}
                <button
                  onClick={() => onNavigate('signup')}
                  className="text-purple-600 hover:underline font-medium"
                >
                  S'inscrire gratuitement
                </button>
              </p>
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Vous devez créer un compte avant de pouvoir vous connecter
                </p>
              </div>
            </>
          ) : (
            <p className="text-gray-600">
              Déjà inscrit ?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-purple-600 hover:underline font-medium"
              >
                Se connecter
              </button>
            </p>
          )}
        </div>

        {mode === 'signup' && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700">
              En vous inscrivant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
              Abonnement : <strong>5,99 €/an</strong> requis pour accéder à la plateforme.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
