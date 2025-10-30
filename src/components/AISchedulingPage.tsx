import { useState } from 'react';
import { Calendar, MapPin, Music, Sparkles, Clock, User, FileText } from 'lucide-react';
import { api } from '../utils/api';

interface AISchedulingPageProps {
  currentUser: any;
  onNavigate: (page: string, data?: any) => void;
}

const MUSIC_STYLES = [
  'Hip-hop',
  'Rock',
  'R&B',
  'Reggae',
  'Jazz',
  'Électro',
  'Pop',
  'Classique',
];

const PRO_CATEGORIES = [
  'Vidéaste',
  'Photographe',
  'Recording Studio',
  'Mixage/Mastering',
  'Management',
  'Média',
  'Événementiel',
  'Ghost Writer',
];

export function AISchedulingPage({ currentUser, onNavigate }: AISchedulingPageProps) {
  const [searchType, setSearchType] = useState<'artist' | 'pro'>('artist');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [city, setCity] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedSchedule, setGeneratedSchedule] = useState<any>(null);

  const toggleStyle = (style: string) => {
    if (selectedStyles.includes(style)) {
      setSelectedStyles(selectedStyles.filter((s) => s !== style));
    } else {
      setSelectedStyles([...selectedStyles, style]);
    }
  };

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleGenerateSchedule = async () => {
    if (!currentUser) {
      onNavigate('login');
      return;
    }

    if (!projectDescription.trim()) {
      alert('Veuillez décrire votre projet.');
      return;
    }

    if (!startDate || !endDate) {
      alert('Veuillez sélectionner une période.');
      return;
    }

    try {
      setLoading(true);
      
      const criteria = {
        userType: searchType,
        styles: selectedStyles,
        categories: selectedCategories,
        city,
        projectDescription,
        startDate,
        endDate,
      };

      // Appel à l'API pour générer le planning
      const result = await api.generateAISchedule(currentUser.id, criteria);
      setGeneratedSchedule(result);
    } catch (error: any) {
      console.error('Error generating schedule:', error);
      alert('Erreur lors de la génération du planning : ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBookProfessional = (proId: string) => {
    onNavigate('calendar', { selectedProId: proId });
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Veuillez vous connecter pour accéder à la planification IA</p>
          <button
            onClick={() => onNavigate('login')}
            className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="bg-gradient-to-r from-cyan-400 via-purple-500 to-purple-600 bg-clip-text text-transparent mb-4">
            Planification IA Personnalisée
          </h1>
          <p className="text-gray-600 text-xl">
            Trouvez les artistes et pros parfaits pour votre projet.
          </p>
        </div>

        {/* Main Form */}
        <div className="bg-gray-50 rounded-3xl p-8 md:p-12 shadow-lg mb-12">
          <h2 className="mb-8">Créez votre planning</h2>

          {/* User Type Selection */}
          <div className="mb-8">
            <label className="block mb-4">Je trouve un(e)</label>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => setSearchType('artist')}
                className={`p-6 rounded-2xl transition ${
                  searchType === 'artist'
                    ? 'bg-gradient-to-r from-cyan-400 via-purple-500 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                <User className="w-6 h-6 mx-auto mb-2" />
                <span>Artiste</span>
              </button>
              <button
                onClick={() => setSearchType('pro')}
                className={`p-6 rounded-2xl transition ${
                  searchType === 'pro'
                    ? 'bg-gradient-to-r from-cyan-400 via-purple-500 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                <Sparkles className="w-6 h-6 mx-auto mb-2" />
                <span>Pro</span>
              </button>
            </div>
          </div>

          {/* Project Description */}
          <div className="mb-8">
            <label className="block mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-purple-600" />
              Décrivez votre projet en détail
            </label>
            <textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Ex: Je cherche à organiser une tournée de 10 dates en France. J'ai besoin d'un vidéaste pour capturer les concerts, d'un photographe pour les visuels promotionnels, et d'un ingénieur son pour le mixage live..."
              className="w-full h-40 px-4 py-3 bg-white border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Music Styles */}
          {searchType === 'artist' && (
            <div className="mb-8">
              <label className="block mb-4 flex items-center">
                <Music className="w-5 h-5 mr-2 text-purple-600" />
                Styles musicaux recherchés
              </label>
              <div className="grid md:grid-cols-4 gap-3">
                {MUSIC_STYLES.map((style) => (
                  <label
                    key={style}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStyles.includes(style)}
                      onChange={() => toggleStyle(style)}
                      className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-gray-700">{style}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Professional Categories */}
          {searchType === 'pro' && (
            <div className="mb-8">
              <label className="block mb-4 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                Catégories de professionnels
              </label>
              <div className="grid md:grid-cols-2 gap-3">
                {PRO_CATEGORIES.map((category) => (
                  <label
                    key={category}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleCategory(category)}
                      className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* City / Region */}
          <div className="mb-8">
            <label className="block mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-purple-600" />
              Ville / Région
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ex: Paris, Lyon, Marseille..."
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Date Range */}
          <div className="mb-8">
            <label className="block mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-purple-600" />
              Période souhaitée
            </label>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Date de début</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Date de fin</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateSchedule}
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Génération du planning en cours...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Générer mon planning avec l&apos;IA</span>
              </>
            )}
          </button>
        </div>

        {/* Generated Schedule */}
        {generatedSchedule && (
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-gray-200">
            <div className="flex items-center mb-8">
              <Calendar className="w-8 h-8 text-purple-600 mr-3" />
              <h2>Votre planning personnalisé</h2>
            </div>

            {/* AI Recommendations */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-8">
              <div className="flex items-start">
                <Sparkles className="w-6 h-6 text-purple-600 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="mb-2 text-purple-900">Recommandations de l&apos;IA</h3>
                  <p className="text-gray-700">
                    {generatedSchedule.recommendations || 
                      "Basé sur votre description et vos critères, nous avons sélectionné les meilleurs professionnels disponibles pour votre projet."}
                  </p>
                </div>
              </div>
            </div>

            {/* Schedule Items */}
            <div className="space-y-6">
              {generatedSchedule.schedule?.map((item: any, index: number) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-2xl p-6 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="mb-2">{item.professionalName}</h3>
                      <p className="text-gray-600 text-sm mb-2">{item.category}</p>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{item.date}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>{item.city}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-purple-600 mb-2">{item.price} €</div>
                      <button
                        onClick={() => handleBookProfessional(item.professionalId)}
                        className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition text-sm"
                      >
                        Réserver
                      </button>
                    </div>
                  </div>
                  
                  {item.availableSlots && item.availableSlots.length > 0 && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <p className="text-sm text-gray-600 mb-2">Créneaux disponibles :</p>
                      <div className="flex flex-wrap gap-2">
                        {item.availableSlots.map((slot: string, idx: number) => (
                          <span
                            key={idx}
                            className="bg-white px-3 py-1 rounded-lg text-sm border border-gray-200"
                          >
                            {slot}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Total */}
            {generatedSchedule.totalPrice && (
              <div className="border-t border-gray-200 pt-6 mt-8">
                <div className="flex justify-between items-center">
                  <span className="text-xl">Total estimé</span>
                  <span className="text-2xl text-purple-600">
                    {generatedSchedule.totalPrice} €
                  </span>
                </div>
              </div>
            )}

            {/* Export Button */}
            <div className="mt-8 flex gap-4">
              <button
                onClick={() => alert('Fonctionnalité d\'export à venir')}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
              >
                Exporter en PDF
              </button>
              <button
                onClick={() => onNavigate('calendar')}
                className="flex-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition"
              >
                Voir dans mon calendrier
              </button>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8">
          <h3 className="mb-4">Comment fonctionne la planification IA ?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white mb-3">
                1
              </div>
              <p className="text-gray-700">
                Décrivez votre projet et vos besoins en détail
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white mb-3">
                2
              </div>
              <p className="text-gray-700">
                L&apos;IA analyse les disponibilités des professionnels
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white mb-3">
                3
              </div>
              <p className="text-gray-700">
                Recevez un planning optimisé et réservez vos créneaux
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
