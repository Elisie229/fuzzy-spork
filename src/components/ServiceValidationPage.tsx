import { useState, useEffect } from 'react';
import { Star, CheckCircle, Calendar, DollarSign, User, MessageCircle, ArrowLeft } from 'lucide-react';
import { api } from '../utils/api';

interface ServiceValidationPageProps {
  currentUser: any;
  onNavigate: (page: string, data?: any) => void;
}

export function ServiceValidationPage({ currentUser, onNavigate }: ServiceValidationPageProps) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    if (!currentUser) {
      onNavigate('login');
      return;
    }

    if (currentUser.userType !== 'artist') {
      alert('Cette page est réservée aux artistes');
      onNavigate('home');
      return;
    }

    try {
      setLoading(true);
      const pendingBookings = await api.getBookingsToValidate(currentUser.id);
      setBookings(pendingBookings || []);
    } catch (error: any) {
      console.error('Error loading bookings:', error);
      alert('Erreur lors du chargement des services : ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!selectedBooking) return;

    if (!confirmed) {
      alert('Veuillez confirmer que vous avez bien reçu le service');
      return;
    }

    if (rating < 1 || rating > 5) {
      alert('Veuillez sélectionner une note entre 1 et 5 étoiles');
      return;
    }

    try {
      setSubmitting(true);

      await api.validateServiceBooking({
        bookingId: selectedBooking.id,
        rating,
        comment: comment.trim() || null,
        artistId: currentUser.id,
      });

      alert(
        `✅ Service validé avec succès !\n\n` +
        `Note : ${rating}/5 ⭐\n` +
        `Le professionnel va recevoir son paiement.\n\n` +
        `Merci pour votre retour !`
      );

      // Fermer le modal et recharger
      setSelectedBooking(null);
      setRating(5);
      setComment('');
      setConfirmed(false);
      loadBookings();
    } catch (error: any) {
      console.error('Error validating service:', error);
      alert('Erreur lors de la validation : ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openValidationModal = (booking: any) => {
    setSelectedBooking(booking);
    setRating(5);
    setComment('');
    setConfirmed(false);
  };

  const closeValidationModal = () => {
    setSelectedBooking(null);
    setRating(5);
    setComment('');
    setConfirmed(false);
  };

  const renderStars = (currentRating: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && setRating(star)}
            className={`transition-all ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
            disabled={!interactive}
          >
            <Star
              className={`w-8 h-8 ${
                star <= currentRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse shadow-2xl">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Chargement des services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => onNavigate('profile')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour au profil
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl mb-2">Valider mes Services</h1>
                <p className="text-gray-600">
                  Confirmez la réception de vos services et notez les professionnels
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Services List */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl mb-3">Aucun service à valider</h2>
            <p className="text-gray-600 mb-6">
              Vous n'avez actuellement aucun service en attente de validation.
            </p>
            <button
              onClick={() => onNavigate('search')}
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition shadow-lg"
            >
              Rechercher des professionnels
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">!</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-yellow-900 mb-1">Services en attente de validation</h3>
                <p className="text-yellow-800 text-sm">
                  Validez vos services pour libérer le paiement aux professionnels. 
                  Si vous ne validez pas sous 30 jours, la validation sera automatique.
                </p>
              </div>
            </div>

            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <User className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl mb-1">{booking.serviceName}</h3>
                      <p className="text-gray-600 flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        {booking.proName}
                      </p>
                    </div>
                  </div>

                  <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg text-sm flex items-center space-x-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                    <span>En attente</span>
                  </div>
                </div>

                {booking.description && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-700 text-sm">
                      <MessageCircle className="w-4 h-4 inline mr-2" />
                      {booking.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-3 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-500">Date de réservation</p>
                      <p className="font-medium">
                        {new Date(booking.scheduledDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-5 h-5 mr-3 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Montant total</p>
                      <p className="font-medium">{booking.price.toFixed(2)}€</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => openValidationModal(booking)}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition shadow-lg flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Valider ce service</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Validation Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                {/* Header */}
                <div className="mb-6">
                  <h2 className="text-2xl mb-2">Valider le service</h2>
                  <p className="text-gray-600">
                    {selectedBooking.serviceName} par {selectedBooking.proName}
                  </p>
                </div>

                {/* Rating */}
                <div className="mb-6">
                  <label className="block mb-3">
                    Notez la qualité du service (obligatoire)
                  </label>
                  <div className="flex items-center space-x-4">
                    {renderStars(rating, true)}
                    <span className="text-2xl">{rating}/5</span>
                  </div>
                </div>

                {/* Comment */}
                <div className="mb-6">
                  <label className="block mb-3">
                    Commentaire public (optionnel)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Partagez votre expérience avec ce professionnel..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {comment.length}/500 caractères
                  </p>
                </div>

                {/* Confirmation */}
                <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmed}
                      onChange={(e) => setConfirmed(e.target.checked)}
                      className="mt-1 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <div className="flex-1">
                      <p className="text-green-900 mb-1">
                        Je confirme avoir reçu ce service
                      </p>
                      <p className="text-green-700 text-sm">
                        En validant, vous autorisez le paiement de{' '}
                        <span className="font-medium">
                          {selectedBooking.price.toFixed(2)}€
                        </span>{' '}
                        au professionnel.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Warning */}
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ <strong>Attention :</strong> La validation est définitive. 
                    Assurez-vous d'avoir bien reçu le service avant de continuer.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <button
                    onClick={closeValidationModal}
                    disabled={submitting}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleValidate}
                    disabled={!confirmed || submitting}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Validation...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span>Valider et Libérer le Paiement</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
