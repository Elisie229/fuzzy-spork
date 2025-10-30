import { useState, useEffect } from 'react';
import { Search, MapPin, MessageCircle } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ClassificationBadge } from './ClassificationBadge';
import { api } from '../utils/api';

interface ProfessionalListingPageProps {
  category?: string;
  onNavigate: (page: string, data?: any) => void;
}

const categoryNames: Record<string, string> = {
  videaste: 'Vidéaste',
  media: 'Média',
  management: 'Management',
  evenementiel: 'Événementiel',
  recording_studio: 'Recording Studio',
  mixage_mastering: 'Mixage/Mastering',
  photographe: 'Photographe',
  ghost_writer: 'Ghost Writer',
};

export function ProfessionalListingPage({ category, onNavigate }: ProfessionalListingPageProps) {
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [filteredPros, setFilteredPros] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassification, setSelectedClassification] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });

  useEffect(() => {
    loadProfessionals();
  }, [category]);

  useEffect(() => {
    filterProfessionals();
  }, [professionals, searchTerm, selectedClassification, priceRange]);

  const loadProfessionals = async () => {
    setIsLoading(true);
    try {
      const response = await api.searchProfiles({
        userType: 'pro',
        category: category || '',
      });

      if (response?.profiles) {
        setProfessionals(response.profiles);
      }
    } catch (error) {
      console.error('Error loading professionals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProfessionals = () => {
    let filtered = [...professionals];

    if (searchTerm) {
      filtered = filtered.filter(
        (pro) =>
          pro.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pro.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pro.bio?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedClassification) {
      filtered = filtered.filter((pro) => pro.classification === selectedClassification);
    }

    // Filter by price range
    if (priceRange.min > 0 || priceRange.max < 1000) {
      filtered = filtered.filter((pro) => {
        if (!pro.pricePerHour) return false;
        return pro.pricePerHour >= priceRange.min && pro.pricePerHour <= priceRange.max;
      });
    }

    setFilteredPros(filtered);
  };

  const handleContact = (pro: any) => {
    const initialMessage = `Bonjour ${pro.name}, je serais intéressé(e) par vos services professionnels. Pourriez-vous me donner plus d'informations ?`;
    onNavigate('messages', {
      selectedUserId: pro.id,
      initialMessage,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse shadow-2xl shadow-cyan-500/50">
            <span className="text-white text-2xl">O</span>
          </div>
          <p className="text-gray-600">Chargement des professionnels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-black via-gray-900 to-black py-16 border-b border-purple-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl mb-4 text-white">
              {category ? categoryNames[category] : 'Tous les Professionnels'}
            </h1>
            <p className="text-xl text-gray-300">
              Trouvez le professionnel parfait pour votre projet musical
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4">
            {/* Search and Classification Row */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom, ville..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="w-full md:w-64">
                <select
                  value={selectedClassification}
                  onChange={(e) => setSelectedClassification(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Toutes les classifications</option>
                  <option value="debutant">Débutant</option>
                  <option value="intermediaire">Intermédiaire</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>

            {/* Price Range Row */}
            <div className="bg-white rounded-lg border border-gray-300 p-4">
              <label className="block text-sm mb-3">Tarif horaire (€/h)</label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max="500"
                    step="10"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-600 mt-1">Min: {priceRange.min}€</div>
                </div>
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-600 mt-1">Max: {priceRange.max}€</div>
                </div>
                <button
                  onClick={() => setPriceRange({ min: 0, max: 1000 })}
                  className="px-4 py-2 text-sm text-purple-600 hover:text-purple-700 whitespace-nowrap"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professionals Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredPros.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg mb-4">
                Aucun professionnel trouvé pour cette recherche
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedClassification('');
                  setPriceRange({ min: 0, max: 1000 });
                }}
                className="text-purple-600 hover:underline"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPros.map((pro) => (
                <div
                  key={pro.id}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-purple-500/50 transition-all duration-300 shadow-lg hover:shadow-xl group"
                >
                  {/* Image */}
                  <div className="h-64 overflow-hidden relative bg-gradient-to-br from-gray-800 to-black">
                    {pro.profileImage ? (
                      <ImageWithFallback
                        src={pro.profileImage}
                        alt={pro.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-4xl">
                            {pro.name?.charAt(0) || 'P'}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    
                    {/* Classification Badge */}
                    {pro.classification && (
                      <div className="absolute top-4 right-4">
                        <ClassificationBadge
                          classification={pro.classification}
                          userType="pro"
                          size="sm"
                        />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="mb-4">
                      <h3
                        className="text-2xl mb-2 cursor-pointer hover:text-purple-600 transition"
                        onClick={() => onNavigate('profile-view', { userId: pro.id })}
                      >
                        {pro.name}
                      </h3>
                      {pro.category && (
                        <p className="text-purple-600 mb-2">
                          {categoryNames[pro.category] || pro.category}
                        </p>
                      )}
                      {pro.city && (
                        <div className="flex items-center text-gray-500 text-sm">
                          <MapPin className="w-4 h-4 mr-1" />
                          {pro.city}
                        </div>
                      )}
                      {pro.pricePerHour && (
                        <div className="flex items-center text-gray-500 text-sm mt-1">
                          <span className="mr-1">💰</span>
                          {pro.pricePerHour}€/h
                        </div>
                      )}
                    </div>

                    {pro.bio && (
                      <p className="text-gray-600 mb-4 line-clamp-3">{pro.bio}</p>
                    )}

                    {/* Services Preview */}
                    {pro.services && pro.services.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-2">Services proposés :</p>
                        <div className="flex flex-wrap gap-2">
                          {pro.services.slice(0, 2).map((service: any, idx: number) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs"
                            >
                              {service.name}
                            </span>
                          ))}
                          {pro.services.length > 2 && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                              +{pro.services.length - 2} autres
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => onNavigate('profile-view', { userId: pro.id })}
                        className="flex-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white px-4 py-3 rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
                      >
                        Voir le profil
                      </button>
                      <button
                        onClick={() => handleContact(pro)}
                        className="px-4 py-3 border-2 border-purple-600 text-purple-600 rounded-xl hover:bg-purple-50 transition-all duration-300"
                      >
                        <MessageCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
