import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ClassificationBadge } from './ClassificationBadge';
import { api } from '../utils/api';

interface ArtistListingPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function ArtistListingPage({ onNavigate }: ArtistListingPageProps) {
  const [filters, setFilters] = useState({
    classification: '',
    genre: '',
    city: '',
    searchQuery: '',
  });
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArtists();
  }, []);

  const loadArtists = async () => {
    try {
      setLoading(true);
      const response = await api.searchProfiles({
        userType: 'artist',
        classification: '',
        city: '',
        category: '',
      });
      setArtists(response.profiles || []);
    } catch (error) {
      console.error('Error loading artists:', error);
      // Fallback to demo data if API fails
      setArtists(demoArtists);
    } finally {
      setLoading(false);
    }
  };

  const demoArtists = [
    {
      id: 1,
      name: 'Emma Laurent',
      classification: 'confirme',
      genre: 'Pop / R&B',
      city: 'Paris',
      img: 'https://images.unsplash.com/photo-1602026084040-78e6134b2661?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjBzaW5nZXIlMjBwZXJmb3JtZXJ8ZW58MXx8fHwxNzU5NDA4MzIyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      id: 2,
      name: 'Lucas Dubois',
      classification: 'developpement',
      genre: 'Hip-Hop / Rap',
      city: 'Lyon',
      img: 'https://images.unsplash.com/photo-1595963202332-e837eb8e466c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYXAlMjBhcnRpc3QlMjBzdHVkaW98ZW58MXx8fHwxNzU5NDA4MzIyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      id: 3,
      name: 'Sophie Martin',
      classification: 'emergent',
      genre: 'Indie / Folk',
      city: 'Bordeaux',
      img: 'https://images.unsplash.com/photo-1512153129600-528cae82b06a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpZSUyMG11c2ljaWFuJTIwZ3VpdGFyfGVufDF8fHx8MTc1OTM1ODAzNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      id: 4,
      name: 'Marc Durand',
      classification: 'confirme',
      genre: 'Électro / House',
      city: 'Paris',
      img: 'https://images.unsplash.com/photo-1523198421516-973dc001a953?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3AlMjBhcnRpc3QlMjBzdGFnZXxlbnwxfHx8fDE3NTk0MDgzMjN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      id: 5,
      name: 'Léa Petit',
      classification: 'developpement',
      genre: 'Jazz / Soul',
      city: 'Marseille',
      img: 'https://images.unsplash.com/photo-1602026084040-78e6134b2661?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjBzaW5nZXIlMjBwZXJmb3JtZXJ8ZW58MXx8fHwxNzU5NDA4MzIyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      id: 6,
      name: 'Thomas Roux',
      classification: 'emergent',
      genre: 'Rock / Alternative',
      city: 'Toulouse',
      img: 'https://images.unsplash.com/photo-1595963202332-e837eb8e466c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYXAlMjBhcnRpc3QlMjBzdHVkaW98ZW58MXx8fHwxNzU5NDA4MzIyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
  ];

  // Combine real artists with demo artists
  const allArtists = [...artists, ...demoArtists];

  const filteredArtists = allArtists.filter((artist) => {
    const matchesClassification =
      !filters.classification || artist.classification === filters.classification;
    const matchesGenre =
      !filters.genre ||
      artist.genre.toLowerCase().includes(filters.genre.toLowerCase());
    const matchesCity =
      !filters.city || artist.city.toLowerCase().includes(filters.city.toLowerCase());
    const matchesSearch =
      !filters.searchQuery ||
      artist.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      artist.genre.toLowerCase().includes(filters.searchQuery.toLowerCase());

    return matchesClassification && matchesGenre && matchesCity && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-black via-gray-900 to-black py-20 border-b border-purple-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl text-center mb-6 text-white">
            Découvrez nos artistes
          </h1>
          <p className="text-xl text-center text-gray-400 mb-4">
            Trouvez l'artiste parfait pour votre projet musical
          </p>
          <div className="text-center mb-8">
            <span className="inline-block bg-purple-600/20 border border-purple-500/50 text-purple-300 px-4 py-2 rounded-lg text-sm">
              Profils d'exemple - Inscrivez-vous pour voir de vrais artistes
            </span>
          </div>

          {/* Search and Filters */}
          <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-gray-800">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div>
                <label className="block text-sm mb-2 text-gray-400">
                  Rechercher
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Nom, genre..."
                    value={filters.searchQuery}
                    onChange={(e) =>
                      setFilters({ ...filters, searchQuery: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-black border border-gray-700 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-400">
                  Classification
                </label>
                <select
                  value={filters.classification}
                  onChange={(e) =>
                    setFilters({ ...filters, classification: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-black border border-gray-700 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Tous</option>
                  <option value="emergent">Émergent</option>
                  <option value="developpement">Développement</option>
                  <option value="confirme">Confirmé</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-400">Genre</label>
                <input
                  type="text"
                  placeholder="Pop, Hip-Hop..."
                  value={filters.genre}
                  onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-black border border-gray-700 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-400">Ville</label>
                <input
                  type="text"
                  placeholder="Paris, Lyon..."
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-black border border-gray-700 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-gray-400">
                <span className="text-white">{filteredArtists.length}</span> artiste
                {filteredArtists.length > 1 ? 's' : ''} trouvé
                {filteredArtists.length > 1 ? 's' : ''}
              </p>
              <button
                onClick={() =>
                  setFilters({
                    classification: '',
                    genre: '',
                    city: '',
                    searchQuery: '',
                  })
                }
                className="text-purple-400 hover:text-purple-300 transition flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Réinitialiser</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Artists Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Chargement des artistes...</p>
            </div>
          ) : filteredArtists.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArtists.map((artist, index) => (
                <div
                  key={artist.id || index}
                  className="bg-[#1a1a1a] rounded-2xl overflow-hidden border border-gray-800 hover:border-purple-500/50 transition-all duration-300 group cursor-pointer"
                  onClick={() => {
                    if (artist.id && !artist.img) {
                      // Real artist - navigate to profile
                      onNavigate('profile-view', { userId: artist.id });
                    } else {
                      // Demo artist
                      alert('Inscrivez-vous pour voir le profil complet et contacter cet artiste!');
                    }
                  }}
                >
                  <div className="h-80 overflow-hidden relative">
                    <ImageWithFallback
                      src={artist.profileImageUrl || artist.img || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400'}
                      alt={artist.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      {artist.img ? (
                        <span className="bg-black/70 backdrop-blur-sm border border-purple-500/50 text-purple-300 px-3 py-1 rounded-full text-xs">
                          Démo
                        </span>
                      ) : (
                        <span className="bg-green-600/70 backdrop-blur-sm border border-green-400/50 text-white px-3 py-1 rounded-full text-xs">
                          Artiste réel
                        </span>
                      )}
                    </div>
                    {artist.classification && (
                      <div className="absolute top-4 right-4">
                        <ClassificationBadge
                          classification={artist.classification}
                          userType="artist"
                          size="sm"
                        />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="mb-3">
                      <h3 className="text-2xl text-white mb-1">{artist.name || 'Sans nom'}</h3>
                      {artist.pseudo && (
                        <p className="text-purple-400 text-sm">@{artist.pseudo}</p>
                      )}
                    </div>
                    <p className="text-gray-400 mb-2">{artist.genre || 'Non spécifié'}</p>
                    <p className="text-gray-500 text-sm mb-4">{artist.city || 'Ville non spécifiée'}</p>
                    <button
                      className="w-full bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
                    >
                      Voir le profil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-400 text-xl">
                Aucun artiste ne correspond à vos critères
              </p>
              <button
                onClick={() =>
                  setFilters({
                    classification: '',
                    genre: '',
                    city: '',
                    searchQuery: '',
                  })
                }
                className="mt-6 text-purple-400 hover:text-purple-300 transition"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
