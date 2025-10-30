import { useState, useEffect } from 'react';
import { Calendar, Video, Music, TrendingUp, CheckCircle, Clock, ChevronLeft, ChevronRight, Star, Film } from 'lucide-react';
import { api } from '../utils/api';

interface AppointmentBookingPageProps {
  currentUser: any;
  onNavigate: (page: string) => void;
  onComplete: () => void;
}

export function AppointmentBookingPage({
  currentUser,
  onNavigate,
  onComplete,
}: AppointmentBookingPageProps) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(1); // 1, 2, ou 3

  // Vérifier si l'utilisateur a le pack complet (3 services)
  const hasCompletePackage = currentUser?.premiumServices?.length === 3;

  // États pour les RDV
  // Service unique : 3 RDV
  // Pack complet : 9 RDV (3 RDV par mois sur 3 mois)
  const [selectedSlots, setSelectedSlots] = useState<any>(
    hasCompletePackage
      ? {
          // Mois 1
          rdv1_1: null, // Visio explicative
          rdv1_2: null, // Préparation
          rdv1_3: null, // Récap
          // Mois 2
          rdv2_1: null, // Visio explicative (optionnelle)
          rdv2_2: null, // Préparation + Tournage
          rdv2_3: null, // Récap
          // Mois 3
          rdv3_1: null, // Visio explicative (optionnelle)
          rdv3_2: null, // Préparation
          rdv3_3: null, // Récap + Collaborations
        }
      : {
          rdv1: null,
          rdv2: null,
          rdv3: null,
        }
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [slotsData, appointmentsData] = await Promise.all([
        api.getAvailableSlots(),
        api.getUserAppointments(currentUser.id),
      ]);
      setAvailableSlots(slotsData.slots || []);
      setAppointments(appointmentsData.appointments || []);
    } catch (error) {
      console.error('Error loading appointment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSlot = (rdvKey: string, slotId: string) => {
    setSelectedSlots({ ...selectedSlots, [rdvKey]: slotId });
  };

  const handleBookAppointments = async () => {
    if (hasCompletePackage) {
      // Vérifier que les RDV obligatoires sont sélectionnés
      const required = ['rdv1_1', 'rdv1_2', 'rdv1_3', 'rdv2_2', 'rdv2_3', 'rdv3_2', 'rdv3_3'];
      const missingRequired = required.some(key => !selectedSlots[key]);
      
      if (missingRequired) {
        alert('Veuillez sélectionner tous les rendez-vous obligatoires (les visios explicatives des mois 2 et 3 sont optionnelles)');
        return;
      }
    } else {
      // Service unique : les 3 RDV sont obligatoires
      if (!selectedSlots.rdv1 || !selectedSlots.rdv2 || !selectedSlots.rdv3) {
        alert('Veuillez sélectionner les 3 rendez-vous');
        return;
      }
    }

    try {
      setLoading(true);
      await api.bookAppointments(currentUser.id, selectedSlots);
      alert(hasCompletePackage 
        ? 'Vos rendez-vous ont été réservés avec succès !' 
        : 'Vos 3 rendez-vous ont été réservés avec succès !');
      onComplete();
    } catch (error: any) {
      console.error('Error booking appointments:', error);
      alert('Erreur lors de la réservation : ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getSlotsByType = (type: string) => {
    return availableSlots.filter(slot => slot.type === type && slot.spotsAvailable > 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Vérifier si l'utilisateur a souscrit aux services premium
  if (!currentUser?.premiumServices || currentUser.premiumServices.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center py-20">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl mb-4">Accès Réservé</h2>
            <p className="text-gray-600 mb-6">
              Le calendrier de réservation est uniquement accessible aux utilisateurs ayant souscrit à nos services premium.
            </p>
            <button
              onClick={() => onNavigate('services')}
              className="w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white px-6 py-4 rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition"
            >
              Découvrir nos services premium
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des créneaux...</p>
        </div>
      </div>
    );
  }

  // RENDU POUR LE PACK COMPLET (9 RDV sur 3 mois)
  if (hasCompletePackage) {
    const monthConfig = {
      1: {
        title: 'Mois 1 - Service 1',
        color: 'cyan',
        rdvs: [
          {
            key: 'rdv1_1',
            type: 'rdv1',
            icon: Video,
            title: 'Visio Explicative',
            description: 'Présentation du fonctionnement d\'Opportunity et de nos méthodes de travail. Séance en groupe (max 16 artistes).',
            duration: '1h30 • Visioconférence • Max 16 personnes',
            optional: false,
          },
          {
            key: 'rdv1_2',
            type: 'rdv2',
            icon: Music,
            title: 'Préparation',
            description: 'Session personnalisée selon votre classification pour préparer votre art.',
            duration: '1h30 • Visioconférence individuelle',
            optional: false,
          },
          {
            key: 'rdv1_3',
            type: 'rdv3',
            icon: TrendingUp,
            title: 'Récap',
            description: 'Bilan de votre accompagnement et définition des prochaines étapes.',
            duration: '1h • Visioconférence individuelle',
            optional: false,
          },
        ],
      },
      2: {
        title: 'Mois 2 - Service 2',
        color: 'purple',
        rdvs: [
          {
            key: 'rdv2_1',
            type: 'rdv1',
            icon: Video,
            title: 'Visio Explicative (Optionnelle)',
            description: 'Rappel du fonctionnement. Vous pouvez sauter ce RDV si vous avez déjà assisté à la visio du Mois 1.',
            duration: '1h30 • Visioconférence • Max 16 personnes',
            optional: true,
          },
          {
            key: 'rdv2_2',
            type: 'rdv2',
            icon: Film,
            title: 'Préparation + Tournage Émission',
            description: 'Session personnalisée pour préparer votre art. Nous définirons ensemble la date du tournage de l\'émission vitrine.',
            duration: '2h • Visioconférence individuelle',
            optional: false,
          },
          {
            key: 'rdv2_3',
            type: 'rdv3',
            icon: TrendingUp,
            title: 'Récap',
            description: 'Bilan post-service et orientation stratégique.',
            duration: '1h • Visioconférence individuelle',
            optional: false,
          },
        ],
      },
      3: {
        title: 'Mois 3 - Service 3',
        color: 'blue',
        rdvs: [
          {
            key: 'rdv3_1',
            type: 'rdv1',
            icon: Video,
            title: 'Visio Explicative (Optionnelle)',
            description: 'Rappel du fonctionnement. Vous pouvez sauter ce RDV si vous avez déjà assisté à la visio du Mois 1.',
            duration: '1h30 • Visioconférence • Max 16 personnes',
            optional: true,
          },
          {
            key: 'rdv3_2',
            type: 'rdv2',
            icon: Music,
            title: 'Préparation',
            description: 'Session personnalisée selon votre classification pour préparer votre art.',
            duration: '1h30 • Visioconférence individuelle',
            optional: false,
          },
          {
            key: 'rdv3_3',
            type: 'rdv3',
            icon: Star,
            title: 'Récap + Collaborations Lucratives',
            description: 'Débrief post-émission et orientation stratégique vers des partenariats et collaborations lucratives.',
            duration: '1h30 • Visioconférence individuelle',
            optional: false,
          },
        ],
      },
    };

    const config = monthConfig[currentMonth as 1 | 2 | 3];

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full mb-6 shadow-2xl shadow-cyan-500/50">
              <Calendar className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl mb-4 text-black">
              Pack Complet - 9 Rendez-vous sur 3 mois
            </h1>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Réservez vos rendez-vous mensuels pour un accompagnement personnalisé sur 3 mois.
              Les visios explicatives des mois 2 et 3 sont optionnelles.
            </p>

            {/* Package Badge */}
            <div className="mt-6 inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full shadow-lg">
              <CheckCircle className="w-5 h-5" />
              <span>Pack Complet - Tournage Émission & Collaborations Lucratives</span>
            </div>
          </div>

          {/* Month Navigation */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentMonth(Math.max(1, currentMonth - 1))}
                disabled={currentMonth === 1}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                  currentMonth === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Mois précédent</span>
              </button>

              <div className="text-center">
                <h2 className="text-2xl text-black">{config.title}</h2>
                <div className="flex items-center justify-center space-x-2 mt-2">
                  {[1, 2, 3].map(month => (
                    <div
                      key={month}
                      className={`w-3 h-3 rounded-full ${
                        month === currentMonth ? 'bg-cyan-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={() => setCurrentMonth(Math.min(3, currentMonth + 1))}
                disabled={currentMonth === 3}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                  currentMonth === 3
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
                }`}
              >
                <span>Mois suivant</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Rendez-vous Cards */}
          {config.rdvs.map((rdv, index) => {
            const Icon = rdv.icon;
            const borderColor = rdv.optional ? 'border-orange-400' : `border-${config.color}-400`;
            const bgColor = rdv.optional ? 'from-orange-400 to-red-500' : `from-${config.color}-400 via-${config.color}-500 to-${config.color}-600`;
            const selectedBgColor = rdv.optional ? 'bg-orange-50' : `bg-${config.color}-50`;
            const selectedBorderColor = rdv.optional ? 'border-orange-500' : `border-${config.color}-500`;

            return (
              <div
                key={rdv.key}
                className={`bg-white rounded-2xl shadow-xl border-2 ${borderColor} p-8 mb-8 ${rdv.optional ? 'opacity-80' : ''}`}
              >
                <div className="flex items-start mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-br ${bgColor} rounded-2xl flex items-center justify-center mr-4 flex-shrink-0`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h2 className="text-2xl text-black">{rdv.title}</h2>
                      {rdv.optional && (
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                          Optionnel
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-4 mt-2">
                      {rdv.description}
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{rdv.duration}</span>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {getSlotsByType(rdv.type).length > 0 ? (
                    getSlotsByType(rdv.type).map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => handleSelectSlot(rdv.key, slot.id)}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                          selectedSlots[rdv.key] === slot.id
                            ? `${selectedBorderColor} ${selectedBgColor} shadow-lg`
                            : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-gray-900">{formatDate(slot.dateTime)}</span>
                          {selectedSlots[rdv.key] === slot.id && (
                            <CheckCircle className={`w-5 h-5 text-${config.color}-600`} />
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          Places restantes : {slot.spotsAvailable}/{slot.maxCapacity}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="col-span-2 p-6 bg-gray-50 rounded-xl text-center text-gray-500">
                      Aucun créneau disponible pour le moment. Les créneaux seront ajoutés prochainement par notre équipe.
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Confirm Button */}
          <div className="text-center">
            <button
              onClick={handleBookAppointments}
              disabled={loading}
              className={`px-12 py-4 rounded-xl transition-all duration-300 inline-flex items-center space-x-3 ${
                !loading
                  ? 'bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Réservation en cours...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-6 h-6" />
                  <span>Confirmer les rendez-vous</span>
                </>
              )}
            </button>
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <p className="text-blue-900 text-center">
              <strong>Note importante :</strong> Les visios explicatives des mois 2 et 3 sont optionnelles car elles répètent les mêmes informations que celle du mois 1. 
              Vous recevrez des liens de visioconférence par email. En cas d'empêchement, vous pouvez modifier vos créneaux jusqu'à 48h avant chaque RDV.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // RENDU POUR SERVICE UNIQUE (3 RDV)
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full mb-6 shadow-2xl shadow-cyan-500/50">
            <Calendar className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl mb-4 text-black">
            Réservation des 3 Rendez-vous Obligatoires
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Pour finaliser votre souscription aux services premium, vous devez réserver 3 rendez-vous 
            essentiels pour votre accompagnement personnalisé.
          </p>
          
          {/* Package Badge */}
          <div className="mt-6 inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-6 py-3 rounded-full shadow-lg">
            <Music className="w-5 h-5" />
            <span>Service Premium - Accompagnement personnalisé</span>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${selectedSlots.rdv1 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${selectedSlots.rdv1 ? 'bg-green-600' : 'bg-gray-300'}`}>
                {selectedSlots.rdv1 ? <CheckCircle className="w-6 h-6 text-white" /> : <span className="text-white">1</span>}
              </div>
              <span className="text-sm">RDV 1 sélectionné</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-4">
              <div className={`h-full ${selectedSlots.rdv1 ? 'bg-green-600' : 'bg-gray-300'}`} style={{ width: selectedSlots.rdv1 ? '100%' : '0%' }}></div>
            </div>
            <div className={`flex items-center ${selectedSlots.rdv2 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${selectedSlots.rdv2 ? 'bg-green-600' : 'bg-gray-300'}`}>
                {selectedSlots.rdv2 ? <CheckCircle className="w-6 h-6 text-white" /> : <span className="text-white">2</span>}
              </div>
              <span className="text-sm">RDV 2 sélectionné</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-4">
              <div className={`h-full ${selectedSlots.rdv2 ? 'bg-green-600' : 'bg-gray-300'}`} style={{ width: selectedSlots.rdv2 ? '100%' : '0%' }}></div>
            </div>
            <div className={`flex items-center ${selectedSlots.rdv3 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${selectedSlots.rdv3 ? 'bg-green-600' : 'bg-gray-300'}`}>
                {selectedSlots.rdv3 ? <CheckCircle className="w-6 h-6 text-white" /> : <span className="text-white">3</span>}
              </div>
              <span className="text-sm">RDV 3 sélectionné</span>
            </div>
          </div>
        </div>

        {/* RDV 1 - Visio Explicative */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-cyan-400 p-8 mb-8">
          <div className="flex items-start mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mr-4 flex-shrink-0">
              <Video className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl mb-2 text-black">RDV 1 : Visio Explicative</h2>
              <p className="text-gray-600 mb-4">
                Présentation du fonctionnement d'Opportunity et de nos méthodes de travail. 
                Séance en groupe (max 16 artistes) pour créer une dynamique collective.
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-2" />
                <span>Durée : 1h30 • Format : Visioconférence</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {getSlotsByType('rdv1').length > 0 ? (
              getSlotsByType('rdv1').map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => handleSelectSlot('rdv1', slot.id)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                    selectedSlots.rdv1 === slot.id
                      ? 'border-cyan-500 bg-cyan-50 shadow-lg'
                      : 'border-gray-200 hover:border-cyan-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-gray-900">{formatDate(slot.dateTime)}</span>
                    {selectedSlots.rdv1 === slot.id && (
                      <CheckCircle className="w-5 h-5 text-cyan-600" />
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    Places restantes : {slot.spotsAvailable}/{slot.maxCapacity}
                  </div>
                </button>
              ))
            ) : (
              <div className="col-span-2 p-6 bg-gray-50 rounded-xl text-center text-gray-500">
                Aucun créneau disponible pour le moment. Les créneaux seront ajoutés prochainement par notre équipe.
              </div>
            )}
          </div>
        </div>

        {/* RDV 2 - Préparation */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-purple-400 p-8 mb-8">
          <div className="flex items-start mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-4 flex-shrink-0">
              <Music className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl mb-2 text-black">RDV 2 : Préparation</h2>
              <p className="text-gray-600 mb-4">
                Session personnalisée selon votre classification pour préparer votre art 
                et définir votre stratégie d'accompagnement.
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-2" />
                <span>Durée : 1h30 • Format : Visioconférence individuelle</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {getSlotsByType('rdv2').length > 0 ? (
              getSlotsByType('rdv2').map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => handleSelectSlot('rdv2', slot.id)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                    selectedSlots.rdv2 === slot.id
                      ? 'border-purple-500 bg-purple-50 shadow-lg'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-gray-900">{formatDate(slot.dateTime)}</span>
                    {selectedSlots.rdv2 === slot.id && (
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    Places restantes : {slot.spotsAvailable}/{slot.maxCapacity}
                  </div>
                </button>
              ))
            ) : (
              <div className="col-span-2 p-6 bg-gray-50 rounded-xl text-center text-gray-500">
                Aucun créneau disponible pour le moment. Les créneaux seront ajoutés prochainement par notre équipe.
              </div>
            )}
          </div>
        </div>

        {/* RDV 3 - Récap */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-400 p-8 mb-8">
          <div className="flex items-start mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mr-4 flex-shrink-0">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl mb-2 text-black">RDV 3 : Récap</h2>
              <p className="text-gray-600 mb-4">
                Bilan de votre accompagnement et définition des prochaines étapes 
                pour poursuivre votre développement artistique.
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-2" />
                <span>Durée : 1h • Format : Visioconférence individuelle</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {getSlotsByType('rdv3').length > 0 ? (
              getSlotsByType('rdv3').map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => handleSelectSlot('rdv3', slot.id)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                    selectedSlots.rdv3 === slot.id
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-gray-900">{formatDate(slot.dateTime)}</span>
                    {selectedSlots.rdv3 === slot.id && (
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    Places restantes : {slot.spotsAvailable}/{slot.maxCapacity}
                  </div>
                </button>
              ))
            ) : (
              <div className="col-span-2 p-6 bg-gray-50 rounded-xl text-center text-gray-500">
                Aucun créneau disponible pour le moment. Les créneaux seront ajoutés prochainement par notre équipe.
              </div>
            )}
          </div>
        </div>

        {/* Confirm Button */}
        <div className="text-center">
          <button
            onClick={handleBookAppointments}
            disabled={!selectedSlots.rdv1 || !selectedSlots.rdv2 || !selectedSlots.rdv3 || loading}
            className={`px-12 py-4 rounded-xl transition-all duration-300 inline-flex items-center space-x-3 ${
              selectedSlots.rdv1 && selectedSlots.rdv2 && selectedSlots.rdv3 && !loading
                ? 'bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Réservation en cours...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-6 h-6" />
                <span>Confirmer les 3 rendez-vous</span>
              </>
            )}
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <p className="text-blue-900 text-center">
            <strong>Note importante :</strong> Une fois les rendez-vous confirmés, vous recevrez 
            des liens de visioconférence par email. En cas d'empêchement, vous pouvez modifier vos 
            créneaux jusqu'à 48h avant chaque RDV.
          </p>
        </div>
      </div>
    </div>
  );
}
