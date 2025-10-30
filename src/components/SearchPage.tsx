import { useState, useEffect } from 'react';
import { MapPin, Star, MessageSquare, Search, Filter, X } from 'lucide-react';
import { api } from '../utils/api';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ClassificationBadge } from './ClassificationBadge';

interface SearchPageProps {
  searchCriteria: any;
  currentUser: any;
  onNavigate: (page: string, data?: any) => void;
}

const professionalCategories = [
  { value: 'videaste', label: 'Vidéaste' },
  { value: 'media', label: 'Média' },
  { value: 'management', label: 'Management' },
  { value: 'evenementiel', label: 'Événementiel' },
  { value: 'recording_studio', label: 'Recording Studio' },
  { value: 'mixage_mastering', label: 'Mixage/Mastering' },
  { value: 'photographe', label: 'Photographe' },
  { value: 'ghost_writer', label: 'Ghost Writer' },
];

const musicGenres = [
  { value: 'rap_hiphop', label: 'Rap/Hip-Hop' },
  { value: 'rnb_soul', label: 'R&B/Soul' },
  { value: 'pop', label: 'Pop' },
  { value: 'rock', label: 'Rock' },
  { value: 'electro', label: 'Électro' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'reggae_dancehall', label: 'Reggae/Dancehall' },
  { value: 'afrobeat', label: 'Afrobeat' },
  { value: 'variete_francaise', label: 'Variété française' },
  { value: 'classique', label: 'Classique' },
  { value: 'metal', label: 'Metal' },
  { value: 'folk_acoustique', label: 'Folk/Acoustique' },
  { value: 'autre', label: 'Autre' },
];

export function SearchPage({ searchCriteria: initialSearchCriteria, currentUser, onNavigate }: SearchPageProps) {
  const [searchCriteria, setSearchCriteria] = useState(initialSearchCriteria || {
    userType: 'artist',
    classification: '',
    city: '',
    category: '',
    name: '',
    musicGenre: '',
    priceRange: { min: 0, max: 1000 },
  });
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialSearchCriteria) {
      setSearchCriteria(initialSearchCriteria);
      performSearch(initialSearchCriteria);
      setHasSearched(true);
    }
  }, [initialSearchCriteria]);

  const performSearch = async (criteria = searchCriteria) => {
    try {
      setLoading(true);
      const response = await api.search(criteria);
      setResults(response.results || []);
      setHasSearched(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    performSearch();
  };

  const resetFilters = () => {
    const resetCriteria = {
      userType: searchCriteria.userType,
      classification: '',
      city: '',
      category: '',
      name: '',
      musicGenre: '',
      priceRange: { min: 0, max: 1000 },
    };
    setSearchCriteria(resetCriteria);
    performSearch(resetCriteria);
  };



  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl mb-2">Recherche</h1>
              <p className="text-gray-600">
                Trouvez des {searchCriteria.userType === 'artist' ? 'artistes' : 'professionnels de la musique'}
              </p>
            </div>
            <div className="hidden md:block">
              <div className={`px-6 py-3 rounded-xl border-2 ${
                searchCriteria.userType === 'artist'
                  ? 'border-purple-200 bg-purple-50 text-purple-700'
                  : 'border-blue-200 bg-blue-50 text-blue-700'
              }`}>
                <p className="text-sm">Recherche en cours :</p>
                <p className="text-lg">
                  {searchCriteria.userType === 'artist' ? '🎤 Artistes' : '💼 Professionnels'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Search className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl">Critères de recherche</h2>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition"
            >
              <Filter className="w-5 h-5" />
              <span>{showFilters ? 'Masquer' : 'Afficher'} les filtres</span>
            </button>
          </div>

          {showFilters && (
            <div className="space-y-6">
              {/* User Type Selection */}
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => setSearchCriteria({ ...searchCriteria, userType: 'artist', classification: '', category: '', musicGenre: '' })}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    searchCriteria.userType === 'artist'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <h3 className="text-lg mb-2">Artistes</h3>
                  <p className="text-sm text-gray-600">
                    Chanteurs, rappeurs, musiciens...
                  </p>
                </button>
                <button
                  onClick={() => setSearchCriteria({ ...searchCriteria, userType: 'pro', classification: '', category: '', musicGenre: '' })}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    searchCriteria.userType === 'pro'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <h3 className="text-lg mb-2">Professionnels</h3>
                  <p className="text-sm text-gray-600">
                    Vidéastes, photographes, studios...
                  </p>
                </button>
              </div>

              {/* Filters Grid */}
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm mb-2">Nom</label>
                    <input
                      type="text"
                      placeholder="Nom de l'artiste ou du professionnel..."
                      value={searchCriteria.name}
                      onChange={(e) =>
                        setSearchCriteria({ ...searchCriteria, name: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* Classification */}
                  <div>
                    <label className="block text-sm mb-2">Classification</label>
                    <select
                      value={searchCriteria.classification}
                      onChange={(e) =>
                        setSearchCriteria({ ...searchCriteria, classification: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                    >
                      <option value="">Tous</option>
                      {searchCriteria.userType === 'artist' ? (
                        <>
                          <option value="emergent">Émergent</option>
                          <option value="developpement">Développement</option>
                          <option value="confirme">Confirmé</option>
                        </>
                      ) : (
                        <>
                          <option value="debutant">Débutant</option>
                          <option value="intermediaire">Intermédiaire</option>
                          <option value="expert">Expert</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* City */}
                  <div>
                    <label className="block text-sm mb-2">Ville</label>
                    <input
                      type="text"
                      placeholder="Paris, Lyon..."
                      value={searchCriteria.city}
                      onChange={(e) =>
                        setSearchCriteria({ ...searchCriteria, city: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* Music Genre (for artists only) */}
                  {searchCriteria.userType === 'artist' && (
                    <div>
                      <label className="block text-sm mb-2">Genre musical</label>
                      <select
                        value={searchCriteria.musicGenre}
                        onChange={(e) =>
                          setSearchCriteria({ ...searchCriteria, musicGenre: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                      >
                        <option value="">Tous les genres</option>
                        {musicGenres.map((genre) => (
                          <option key={genre.value} value={genre.value}>
                            {genre.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Category (for professionals only) */}
                  {searchCriteria.userType === 'pro' && (
                    <div>
                      <label className="block text-sm mb-2">Catégorie</label>
                      <select
                        value={searchCriteria.category}
                        onChange={(e) =>
                          setSearchCriteria({ ...searchCriteria, category: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                      >
                        <option value="">Toutes</option>
                        {professionalCategories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Price Range (for professionals only) */}
                  {searchCriteria.userType === 'pro' && (
                    <div>
                      <label className="block text-sm mb-2">Prix max (€/h)</label>
                      <input
                        type="number"
                        placeholder="1000"
                        value={searchCriteria.priceRange.max}
                        onChange={(e) =>
                          setSearchCriteria({
                            ...searchCriteria,
                            priceRange: { ...searchCriteria.priceRange, max: Number(e.target.value) },
                          })
                        }
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={handleSearch}
                  className="flex-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white px-6 py-4 rounded-xl hover:shadow-xl hover:shadow-cyan-500/50 transition-all duration-300 flex items-center justify-center space-x-2 transform hover:scale-[1.02]"
                >
                  <Search className="w-5 h-5" />
                  <span>Rechercher</span>
                </button>
                <button
                  onClick={resetFilters}
                  className="px-6 py-4 rounded-xl border-2 border-gray-300 hover:border-purple-400 hover:bg-gray-50 transition-all flex items-center justify-center space-x-2"
                >
                  <X className="w-5 h-5" />
                  <span>Réinitialiser</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        {hasSearched && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-gray-600">
              {loading ? (
                'Recherche en cours...'
              ) : (
                <>
                  {results.length} {searchCriteria.userType === 'artist' ? 'artiste(s)' : 'professionnel(s)'} trouvé(s)
                </>
              )}
            </p>
          </div>
        )}

        {!hasSearched ? (
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-12 text-center border-2 border-purple-200">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl mb-3">Commencez votre recherche</h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Utilisez les filtres ci-dessus pour trouver des artistes ou des professionnels qui correspondent à vos besoins.
              Vous pouvez filtrer par classification, ville, catégorie et budget.
            </p>
            <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="bg-white p-4 rounded-xl border border-purple-200">
                <h4 className="mb-2">🎤 Artistes</h4>
                <p className="text-sm text-gray-600">
                  Trouvez des chanteurs, rappeurs, et musiciens talentueux
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-purple-200">
                <h4 className="mb-2">💼 Professionnels</h4>
                <p className="text-sm text-gray-600">
                  Trouvez des vidéastes, photographes, studios et plus
                </p>
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="bg-white rounded-xl p-12 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Recherche en cours...</p>
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl mb-2">Aucun résultat trouvé</h3>
            <p className="text-gray-600 mb-6">
              Essayez de modifier vos critères de recherche pour obtenir plus de résultats.
            </p>
            <button
              onClick={resetFilters}
              className="text-purple-600 hover:text-purple-700 transition"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden"
              >
                <div className="h-48 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center">
                  {user.avatar ? (
                    <ImageWithFallback
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-purple-600 text-3xl">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl mb-1">{user.name}</h3>
                      {user.userType === 'artist' && user.musicGenre && (
                        <div className="mb-1">
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            🎵 {musicGenres.find(g => g.value === user.musicGenre)?.label || user.musicGenre}
                          </span>
                        </div>
                      )}
                      {user.userType === 'pro' && user.category && (
                        <div className="mb-1">
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            {professionalCategories.find(c => c.value === user.category)?.label || user.category}
                          </span>
                        </div>
                      )}
                      {user.city && (
                        <div className="flex items-center text-gray-600 text-sm mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          {user.city}
                        </div>
                      )}
                    </div>
                    {user.classification && (
                      <ClassificationBadge
                        classification={user.classification}
                        userType={user.userType}
                        size="sm"
                      />
                    )}
                  </div>

                  {user.bio && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{user.bio}</p>
                  )}

                  {user.pricePerHour && (
                    <div className="mb-4 flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-purple-600">{user.pricePerHour} €/h</span>
                    </div>
                  )}

                  {user.services && user.services.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {user.services.slice(0, 3).map((service: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-xs bg-gray-100 px-2 py-1 rounded"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <button
                      onClick={() => onNavigate('profile-view', { userId: user.id })}
                      className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm"
                    >
                      Voir profil
                    </button>
                    {currentUser && (
                      <button
                        onClick={() => {
                          if (!currentUser.name || !user.name) {
                            alert('Impossible de charger les informations nécessaires');
                            return;
                          }
                          onNavigate('messages', { 
                            selectedUserId: user.id,
                            initialMessage: `Bonjour ${user.name},\n\nJe serais intéressé(e) par une collaboration avec vous. Seriez-vous disponible pour en discuter ?\n\nCordialement,\n${currentUser.name}`
                          });
                        }}
                        className="bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition"
                        title="Contacter"
                      >
                        <MessageSquare className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
