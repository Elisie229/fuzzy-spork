import { useState } from 'react';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { api } from '../utils/api';

interface CalendarPageProps {
  currentUser: any;
  selectedProId?: string;
  onNavigate: (page: string) => void;
}

export function CalendarPage({ currentUser, selectedProId, onNavigate }: CalendarPageProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [sessionType, setSessionType] = useState('');
  const [loading, setLoading] = useState(false);

  // Vérifier si l'utilisateur a souscrit aux services premium
  const hasPremiumServices = currentUser?.premiumServices && currentUser.premiumServices.length > 0;

  const handleBooking = async () => {
    if (!currentUser) {
      onNavigate('login');
      return;
    }

    if (!selectedDate || !selectedTime || !sessionType) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    try {
      setLoading(true);
      const dateTime = `${selectedDate}T${selectedTime}`;

      await api.createBooking({
        proUserId: selectedProId || 'admin',
        artistUserId: currentUser.id,
        date: dateTime,
        sessionType,
        totalPrice: 0, // Pas de prix car déjà payé avec les services premium
      });

      alert('Réservation effectuée avec succès ! Vous recevrez une confirmation par email.');
      setSelectedDate('');
      setSelectedTime('');
      setSessionType('');
    } catch (error: any) {
      console.error('Booking error:', error);
      alert('Erreur lors de la réservation : ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 18) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return slots;
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Si l'utilisateur n'a pas souscrit aux services premium, afficher un message
  if (!hasPremiumServices) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center py-20">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CalendarIcon className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl mb-4">Accès Réservé aux Services Premium</h2>
            <p className="text-gray-600 mb-6">
              Ce calendrier de réservation est exclusivement réservé aux utilisateurs ayant souscrit à nos services premium Opportunity.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900">
                💡 <strong>Astuce :</strong> Pour réserver des sessions avec des professionnels individuels, utilisez la fonction de recherche pour trouver le professionnel de votre choix et contactez-le directement.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => onNavigate('services')}
                className="w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white px-6 py-4 rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition"
              >
                Découvrir nos services premium
              </button>
              <button
                onClick={() => onNavigate('search')}
                className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
              >
                Rechercher des professionnels
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Calendrier de Réservation Premium</h1>
          <p className="text-gray-600">
            Réservez vos sessions complémentaires incluses dans vos services premium
          </p>
          <div className="bg-gradient-to-r from-cyan-50 to-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-purple-900">
              ✨ <strong>Services Premium :</strong> Ces sessions sont incluses dans votre abonnement, aucun frais supplémentaire ne sera facturé.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Date and Time Selection */}
            <div>
              <h2 className="text-xl mb-6">Sélectionnez votre créneau</h2>

              <div className="space-y-6">
                {/* Date Picker */}
                <div>
                  <label className="block text-sm mb-2 flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={getMinDate()}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Time Picker */}
                <div>
                  <label className="block text-sm mb-2 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Heure
                  </label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Choisir une heure</option>
                    {generateTimeSlots().map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type de session */}
                <div>
                  <label className="block text-sm mb-2">Type de session</label>
                  <select
                    value={sessionType}
                    onChange={(e) => setSessionType(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Choisir un type</option>
                    <option value="coaching">Session de coaching</option>
                    <option value="suivi">Suivi de projet</option>
                    <option value="consultation">Consultation créative</option>
                    <option value="revision">Révision et feedback</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Booking Summary */}
            <div>
              <h2 className="text-xl mb-6">Récapitulatif</h2>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 space-y-4">
                {selectedDate && (
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="text-lg">
                      {new Date(selectedDate).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                )}

                {selectedTime && (
                  <div>
                    <p className="text-sm text-gray-600">Heure</p>
                    <p className="text-lg">{selectedTime}</p>
                  </div>
                )}

                {sessionType && (
                  <div>
                    <p className="text-sm text-gray-600">Type de session</p>
                    <p className="text-lg">
                      {sessionType === 'coaching' && 'Session de coaching'}
                      {sessionType === 'suivi' && 'Suivi de projet'}
                      {sessionType === 'consultation' && 'Consultation créative'}
                      {sessionType === 'revision' && 'Révision et feedback'}
                      {sessionType === 'autre' && 'Autre'}
                    </p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-green-900 flex items-center">
                      <span className="text-2xl mr-2">✓</span>
                      <span><strong>Inclus dans votre abonnement premium</strong></span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleBooking}
                  disabled={loading || !selectedDate || !selectedTime || !sessionType}
                  className="w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white px-6 py-4 rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition disabled:opacity-50 mt-6"
                >
                  {loading ? 'Réservation...' : 'Confirmer la réservation'}
                </button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                <p className="text-blue-900">
                  <strong>Rappel :</strong> Vos 3 rendez-vous obligatoires (Visio explicative, Préparation, Récap) ont été ou seront réservés séparément. Ce calendrier est pour vos sessions complémentaires.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar View */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl mb-6">Mes Réservations</h2>
          <div className="text-center text-gray-500 py-8">
            <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>Vos réservations apparaîtront ici</p>
          </div>
        </div>
      </div>
    </div>
  );
}
