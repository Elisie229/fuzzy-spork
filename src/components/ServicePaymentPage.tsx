import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, Shield } from 'lucide-react';
import { api } from '../utils/api';

interface ServicePaymentPageProps {
  currentUser: any;
  selectedServices: string[];
  totalAmount: number;
  onNavigate: (page: string) => void;
  onPaymentSuccess: () => void;
}

// Définition des services disponibles
const SERVICES_INFO = {
  'test-vision': { title: 'Je teste ma vision', price: 50 },
  'develop-audience': { title: 'Je développe mon audience', price: 50 },
  'create-partnerships': { title: 'Je crée des partenariats', price: 50 },
};

export function ServicePaymentPage({
  currentUser,
  selectedServices: propSelectedServices,
  totalAmount: propTotalAmount,
  onNavigate,
  onPaymentSuccess,
}: ServicePaymentPageProps) {
  // Système de sauvegarde avec localStorage
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverAvailable, setServerAvailable] = useState<boolean | null>(null);

  // Récupérer les données depuis les props ou localStorage
  useEffect(() => {
    console.log('[ServicePayment] Initializing with props:', { propSelectedServices, propTotalAmount });
    
    let servicesToUse: string[] = [];
    let amountToUse = 0;
    
    // 1. Essayer d'abord les props
    if (propSelectedServices && propSelectedServices.length > 0) {
      console.log('[ServicePayment] Using props data');
      servicesToUse = propSelectedServices;
      amountToUse = propTotalAmount;
    } else {
      // 2. Sinon essayer localStorage
      console.log('[ServicePayment] No props, checking localStorage');
      const savedData = localStorage.getItem('pendingServicePurchase');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          console.log('[ServicePayment] Found localStorage data:', parsed);
          servicesToUse = parsed.selectedServices || [];
          amountToUse = parsed.totalAmount || 0;
        } catch (e) {
          console.error('[ServicePayment] Error parsing localStorage:', e);
        }
      }
    }
    
    // Appliquer les données trouvées
    if (servicesToUse.length > 0) {
      console.log('[ServicePayment] Setting services:', servicesToUse);
      setSelectedServices(servicesToUse);
      setTotalAmount(amountToUse);
      
      // Toujours sauvegarder dans localStorage comme backup
      localStorage.setItem('pendingServicePurchase', JSON.stringify({
        selectedServices: servicesToUse,
        totalAmount: amountToUse,
      }));
    } else {
      console.warn('[ServicePayment] No services found in props or localStorage');
    }
  }, [propSelectedServices, propTotalAmount]);

  // Check server availability
  useEffect(() => {
    const checkServer = async () => {
      try {
        console.log('[ServicePayment] Checking server availability...');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(
          `https://pwmxkcijsrykjvxnzxnt.supabase.co/functions/v1/make-server-b90be4d1/health`,
          { signal: controller.signal }
        );
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          console.log('[ServicePayment] Server is available');
          setServerAvailable(true);
        } else {
          console.warn('[ServicePayment] Server returned error:', response.status);
          setServerAvailable(false);
        }
      } catch (error: any) {
        console.error('[ServicePayment] Server not available:', error?.message || error);
        setServerAvailable(false);
      }
    };
    
    checkServer();
  }, []);

  // Vérifier que l'utilisateur est connecté
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">!</span>
          </div>
          <h2 className="text-2xl mb-4">Connexion requise</h2>
          <p className="text-gray-600 mb-6">
            Vous devez être connecté pour effectuer un paiement.
          </p>
          <button
            onClick={() => onNavigate('login')}
            className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl hover:shadow-lg transition"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  // Handler pour recharger depuis localStorage
  const handleReload = () => {
    try {
      const savedData = localStorage.getItem('pendingServicePurchase');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        console.log('[ServicePayment] Manually reloading from localStorage:', parsed);
        setSelectedServices(parsed.selectedServices || []);
        setTotalAmount(parsed.totalAmount || 0);
      } else {
        onNavigate('services');
      }
    } catch (e) {
      console.error('[ServicePayment] Error reloading:', e);
      onNavigate('services');
    }
  };

  // Vérifier qu'il y a des services sélectionnés
  if (!selectedServices || selectedServices.length === 0) {
    const savedData = localStorage.getItem('pendingServicePurchase');
    console.error('[ServicePayment] No services selected!', { 
      selectedServices, 
      propSelectedServices,
      savedData,
      parsedData: savedData ? (() => { try { return JSON.parse(savedData); } catch(e) { return null; } })() : null
    });
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl">
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">?</span>
          </div>
          <h2 className="text-2xl mb-4">Aucun service sélectionné</h2>
          <p className="text-gray-600 mb-6">
            {savedData 
              ? 'Vos services semblent sauvegardés. Cliquez pour recharger.'
              : 'Veuillez sélectionner au moins un service premium.'}
          </p>
          <div className="space-y-3">
            <button
              onClick={handleReload}
              className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl hover:shadow-lg transition"
            >
              {savedData ? 'Recharger mes services' : 'Voir les services'}
            </button>
            {savedData && (
              <button
                onClick={() => onNavigate('services')}
                className="w-full bg-gray-200 text-gray-700 px-8 py-3 rounded-xl hover:bg-gray-300 transition"
              >
                Retour aux services
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Vérifier que l'utilisateur est connecté
      if (!currentUser || !currentUser.id) {
        throw new Error('Vous devez être connecté pour effectuer un paiement');
      }

      // Vérifier le token d'authentification
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken || accessToken === 'undefined' || accessToken === 'null') {
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }

      // Valider les données de la carte
      if (!paymentData.cardNumber || !paymentData.cardName || !paymentData.expiryDate || !paymentData.cvv) {
        throw new Error('Veuillez remplir tous les champs');
      }

      // Validation du numéro de carte (simple check)
      const cardNumberOnly = paymentData.cardNumber.replace(/\s/g, '');
      if (cardNumberOnly.length < 13 || cardNumberOnly.length > 19) {
        throw new Error('Numéro de carte invalide');
      }

      // Validation de la date d'expiration
      if (!/^\d{2}\/\d{2}$/.test(paymentData.expiryDate)) {
        throw new Error('Date d\'expiration invalide (format MM/AA)');
      }

      // Validation du CVV
      if (!/^\d{3,4}$/.test(paymentData.cvv)) {
        throw new Error('CVV invalide (3 ou 4 chiffres)');
      }

      console.log('[ServicePayment] Calling API with:', { userId: currentUser.id, selectedServices });
      
      // Appeler l'API de paiement
      const result = await api.purchaseServices(currentUser.id, selectedServices);
      
      console.log('[ServicePayment] API response:', result);

      // Nettoyer le localStorage après un paiement réussi
      localStorage.removeItem('pendingServicePurchase');

      // Paiement réussi
      alert('Paiement réussi ! Vous allez maintenant signer le contrat de collaboration.');
      onPaymentSuccess();
    } catch (err: any) {
      console.error('[ServicePayment] Payment error:', {
        error: err,
        message: err?.message,
        status: err?.status,
        stack: err?.stack,
      });
      
      let errorMessage = 'Erreur lors du paiement';
      
      if (err.message) {
        // Si le message contient "Load failed", donner plus de contexte
        if (err.message.includes('Load failed') || err.message.includes('Failed to fetch')) {
          errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion internet et réessayez.';
        } else {
          errorMessage = err.message;
        }
      } else if (err.status === 401) {
        errorMessage = 'Session expirée. Veuillez vous reconnecter.';
      } else if (err.status === 404) {
        errorMessage = 'Profil non trouvé. Veuillez contacter le support.';
      } else if (err.status === 500) {
        errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full mb-6 shadow-2xl shadow-cyan-500/50">
            <CreditCard className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl mb-4 text-black">
            Paiement Sécurisé
          </h1>
          <p className="text-gray-600 text-lg">
            Services Premium Opportunity
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left - Order Summary */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8">
            <h2 className="text-2xl mb-6 text-black">Récapitulatif de commande</h2>
            
            <div className="space-y-4 mb-6">
              {(selectedServices || []).map((serviceId) => {
                const serviceInfo = SERVICES_INFO[serviceId as keyof typeof SERVICES_INFO];
                if (!serviceInfo) {
                  console.warn('[ServicePayment] Unknown service ID:', serviceId);
                  return null;
                }
                
                return (
                  <div key={serviceId} className="flex justify-between py-3 border-b">
                    <span className="text-gray-700">{serviceInfo.title}</span>
                    <span className="text-black">{serviceInfo.price}€</span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between py-4 border-t-2 border-gray-300 text-xl">
              <span className="text-black">Total</span>
              <span className="text-black">{totalAmount}€</span>
            </div>

            <div className="mt-8 p-4 bg-cyan-50 border border-cyan-200 rounded-xl">
              <h3 className="text-black mb-3 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-cyan-600" />
                Après le paiement
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✅ Signature du contrat de collaboration</li>
                {(selectedServices || []).length === 3 ? (
                  <>
                    <li>✅ Réservation de 9 RDV sur 3 mois :</li>
                    <li className="ml-4 font-medium text-purple-700">📅 Mois 1 - Service 1 :</li>
                    <li className="ml-8">• Visio explicative</li>
                    <li className="ml-8">• Préparation</li>
                    <li className="ml-8">• Récap</li>
                    <li className="ml-4 font-medium text-purple-700">📅 Mois 2 - Service 2 :</li>
                    <li className="ml-8">• Visio explicative (optionnelle)</li>
                    <li className="ml-8">• Préparation + Tournage Émission</li>
                    <li className="ml-8">• Récap</li>
                    <li className="ml-4 font-medium text-purple-700">📅 Mois 3 - Service 3 :</li>
                    <li className="ml-8">• Visio explicative (optionnelle)</li>
                    <li className="ml-8">• Préparation</li>
                    <li className="ml-8">• Récap + Collaborations Lucratives</li>
                  </>
                ) : (
                  <>
                    <li>✅ Réservation de 3 RDV obligatoires :</li>
                    <li className="ml-4">• RDV 1 : Visio explicative</li>
                    <li className="ml-4">• RDV 2 : Préparation</li>
                    <li className="ml-4">• RDV 3 : Récap</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Right - Payment Form */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-black">Paiement par carte</h2>
              <Shield className="w-6 h-6 text-green-600" />
            </div>

            {serverAvailable === false && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6">
                <p className="text-sm">
                  ⚠️ Le serveur de paiement semble indisponible. 
                  Vérifiez que les Edge Functions Supabase sont déployées.
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handlePayment} className="space-y-6">
              <div>
                <label className="block text-gray-700 mb-2">Numéro de carte</label>
                <input
                  type="text"
                  value={paymentData.cardNumber}
                  onChange={(e) => setPaymentData({ ...paymentData, cardNumber: formatCardNumber(e.target.value) })}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Nom du titulaire</label>
                <input
                  type="text"
                  value={paymentData.cardName}
                  onChange={(e) => setPaymentData({ ...paymentData, cardName: e.target.value.toUpperCase() })}
                  placeholder="JEAN DUPONT"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Date d'expiration</label>
                  <input
                    type="text"
                    value={paymentData.expiryDate}
                    onChange={(e) => setPaymentData({ ...paymentData, expiryDate: formatExpiryDate(e.target.value) })}
                    placeholder="MM/AA"
                    maxLength={5}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-cyan-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">CVV</label>
                  <input
                    type="text"
                    value={paymentData.cvv}
                    onChange={(e) => setPaymentData({ ...paymentData, cvv: e.target.value.replace(/[^0-9]/g, '') })}
                    placeholder="123"
                    maxLength={3}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-cyan-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600 flex items-start">
                  <Shield className="w-5 h-5 mr-2 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Paiement 100% sécurisé. Vos données bancaires sont cryptées et ne sont jamais stockées sur nos serveurs.
                  </span>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 ${
                  loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl transform hover:scale-105'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Traitement en cours...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-6 h-6" />
                    <span>Payer {totalAmount}€</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-center space-x-4 text-gray-400">
              <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="h-8" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-8" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="Amex" className="h-6" />
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}