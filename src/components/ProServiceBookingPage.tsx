import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Euro, User } from 'lucide-react';
import { api } from '../utils/api';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProServiceBookingPageProps {
  currentUser: any;
  proUser: any;
  service?: any;
  onNavigate: (page: string) => void;
}

export function ProServiceBookingPage({
  currentUser,
  proUser,
  service,
  onNavigate,
}: ProServiceBookingPageProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(1);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Tarif horaire du pro (peut être défini dans son profil ou le service)
  const hourlyRate = service?.hourlyRate || proUser?.hourlyRate || 50;

  const handleBooking = async () => {
    if (!currentUser) {
      onNavigate('login');
      return;
    }

    if (!selectedDate || !selectedTime) {
      alert('Veuillez sélectionner une date et une heure');
      return;
    }

    if (currentUser.subscriptionStatus !== 'active') {
      alert('Vous devez avoir un abonnement actif pour réserver.');
      onNavigate('subscription');
      return;
    }

    try {
      setLoading(true);
      const dateTime = `${selectedDate}T${selectedTime}`;
      const totalPrice = hourlyRate * duration;

      await api.createBooking({
        proUserId: proUser.id,
        artistUserId: currentUser.id,
        date: dateTime,
        duration,
        totalPrice,
        serviceName: service?.name || 'Session personnalisée',
        notes,
      });

      alert(
        `Réservation effectuée avec succès !\n\nMontant : ${totalPrice}€\n\nVous recevrez une confirmation par email et pourrez discuter des détails avec ${proUser.name} via la messagerie.`
      );
      
      // Rediriger vers la messagerie avec le pro
      onNavigate('messages', { selectedUserId: proUser.id });
    } catch (error: any) {
      console.error('Booking error:', error);
      alert('Erreur lors de la réservation : ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return hourlyRate * duration;
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header avec info pro */}
        <div className="mb-8">
          <button
            onClick={() => onNavigate('profile-view', { userId: proUser.id })}
            className="text-purple-600 hover:underline mb-4 inline-flex items-center"
          >
            ← Retour au profil
          </button>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
                {proUser.profileImageUrl || proUser.avatar ? (
                  <ImageWithFallback
                    src={proUser.profileImageUrl || proUser.avatar}
                    alt={proUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl mb-1">Réserver avec {proUser.name}</h1>
                <p className="text-gray-600">
                  {service?.name || 'Session personnalisée'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Tarif horaire</p>
                <p className="text-2xl text-purple-600">{hourlyRate}€/h</p>
              </div>
            </div>

            {service?.description && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-gray-700">{service.description}</p>
              </div>
            )}
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

                {/* Duration */}
                <div>
                  <label className="block text-sm mb-2">Durée (heures)</label>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setDuration(Math.max(1, duration - 1))}
                      className="w-10 h-10 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                    >
                      -
                    </button>
                    <span className="text-2xl">{duration}h</span>
                    <button
                      onClick={() => setDuration(Math.min(8, duration + 1))}
                      className="w-10 h-10 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm mb-2">Notes (optionnel)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Précisez vos besoins, objectifs, ou questions..."
                  />
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

                <div>
                  <p className="text-sm text-gray-600">Durée</p>
                  <p className="text-lg">{duration} heure{duration > 1 ? 's' : ''}</p>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Tarif horaire</span>
                    <span>{hourlyRate} €/h</span>
                  </div>
                  <div className="flex justify-between items-center text-xl">
                    <span>Total</span>
                    <span className="text-purple-600 flex items-center">
                      <Euro className="w-5 h-5 mr-1" />
                      {calculateTotal()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleBooking}
                  disabled={loading || !selectedDate || !selectedTime}
                  className="w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white px-6 py-4 rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition disabled:opacity-50 mt-6"
                >
                  {loading ? 'Réservation...' : `Réserver pour ${calculateTotal()}€`}
                </button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                <p className="text-blue-900">
                  <strong>💡 Comment ça marche :</strong>
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-blue-800">
                  <li>Réservez votre créneau</li>
                  <li>Le paiement sera traité de manière sécurisée</li>
                  <li>Vous recevrez une confirmation par email</li>
                  <li>Discutez des détails via la messagerie</li>
                </ul>
              </div>

              <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg text-sm">
                <p className="text-orange-900">
                  <strong>⚠️ Important :</strong> Cette réservation concerne les services individuels du professionnel. 
                  Pour les services premium Opportunity, rendez-vous sur la page dédiée.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
