import { useState } from 'react';
import { Check, Sparkles, Users, Music } from 'lucide-react';
import { api } from '../utils/api';

interface PremiumServicesPageProps {
  currentUser: any;
  onNavigate: (page: string) => void;
  onPurchase: (serviceIds: string[], totalAmount: number) => void;
}

const SERVICES = [
  {
    id: 'test-vision',
    title: 'Je teste ma vision',
    description: 'Accompagnement personnalisé pour artistes émergents',
    price: 50,
    icon: Sparkles,
    color: 'blue',
    targetAudience: 'Artistes émergents',
    features: [
      'Orientation artistique personnalisée',
      'Analyse de votre univers musical',
      'Mettre en place un plan de lancement',
      'Recommandations stratégiques',
    ],
  },
  {
    id: 'develop-audience',
    title: 'Je développe mon audience',
    description: 'Visibilité et mise en avant pour artistes en développement',
    price: 250,
    icon: Users,
    color: 'purple',
    targetAudience: 'Artistes en développement',
    features: [
      'Émissions partenaires pour promouvoir votre musique',
      'Mise en avant sur la plateforme',
      'Stratégie de visibilité',
      'Developpement d\'audience',
    ],
  },
  {
    id: 'create-partnerships',
    title: 'Je booste ma carrière',
    description: 'Collaborations et opportunités pour artistes confirmés',
    price: 350,
    icon: Music,
    color: 'pink',
    targetAudience: 'Artistes confirmés',
    features: [
      'Mise en relation avec professionnels',
      'Élaborer un plan de distribution',
      'Collaborations lucratives',
      'Développement business',
    ],
  },
];

export function PremiumServicesPage({
  currentUser,
  onNavigate,
  onPurchase,
}: PremiumServicesPageProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const toggleService = (serviceId: string) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter((id) => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  const toggleCompletePackage = () => {
    if (selectedServices.length === 3) {
      // Si tous les services sont sélectionnés, on les désélectionne tous
      setSelectedServices([]);
    } else {
      // Sinon, on sélectionne les 3 services
      setSelectedServices(SERVICES.map(s => s.id));
    }
  };

  const calculateTotal = () => {
    if (selectedServices.length === 3) {
      return 552; // Pack complet avec 15% de réduction (650€ - 15% = 552€)
    }
    // Calcul individuel basé sur les prix réels
    return selectedServices.reduce((total, serviceId) => {
      const service = SERVICES.find(s => s.id === serviceId);
      return total + (service?.price || 0);
    }, 0);
  };

  const handlePurchase = () => {
    console.log('[Premium Services] Button clicked');
    console.log('[Premium Services] Current user:', currentUser);
    console.log('[Premium Services] Selected services:', selectedServices);

    if (!currentUser) {
      alert('Veuillez vous connecter pour acheter des services premium.');
      onNavigate('login');
      return;
    }

    if (currentUser.subscriptionStatus !== 'active') {
      alert('Vous devez avoir un abonnement actif (5,99€/an) pour acheter des services premium.');
      onNavigate('subscription');
      return;
    }

    if (selectedServices.length === 0) {
      alert('Veuillez sélectionner au moins un service en cliquant sur les cartes.');
      return;
    }

    // Rediriger vers le paiement avec les IDs de services et le montant total
    const totalAmount = calculateTotal();
    console.log('[Premium Services] Proceeding to payment:', { selectedServices, totalAmount });
    
    // Sauvegarder immédiatement dans localStorage comme backup
    localStorage.setItem('pendingServicePurchase', JSON.stringify({
      selectedServices,
      totalAmount,
    }));
    
    onPurchase(selectedServices, totalAmount);
  };

  const getColorClasses = (color: string) => {
    const colors: any = {
      blue: {
        bg: 'from-blue-50 to-blue-100',
        icon: 'bg-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700',
        border: 'border-blue-600',
      },
      purple: {
        bg: 'from-purple-50 to-purple-100',
        icon: 'bg-purple-600',
        button: 'bg-purple-600 hover:bg-purple-700',
        border: 'border-purple-600',
      },
      pink: {
        bg: 'from-pink-50 to-pink-100',
        icon: 'bg-pink-600',
        button: 'bg-pink-600 hover:bg-pink-700',
        border: 'border-pink-600',
      },
    };
    return colors[color];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl mb-4">Services Premium Opportunity</h1>
          <p className="text-gray-600 text-xl">
            Accompagnement personnalisé administré par notre équipe
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            const colors = getColorClasses(service.color);
            const isSelected = selectedServices.includes(service.id);

            return (
              <div
                key={service.id}
                className={`bg-gradient-to-br ${colors.bg} rounded-2xl p-8 shadow-lg transition cursor-pointer border-4 ${
                  isSelected ? colors.border : 'border-transparent'
                }`}
                onClick={() => toggleService(service.id)}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-16 h-16 ${colors.icon} rounded-full flex items-center justify-center`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  {isSelected && (
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>

                <h3 className="text-2xl mb-2">{service.title}</h3>
                <p className="text-gray-700 mb-4">{service.description}</p>
                <p className="text-sm text-gray-600 mb-4">Pour : {service.targetAudience}</p>

                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start text-sm">
                      <Check className="w-4 h-4 mr-2 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="text-3xl mb-4">{service.price} €</div>
              </div>
            );
          })}
        </div>

        {/* Pack Promotion */}
        <div 
          className={`bg-black text-white rounded-2xl p-8 text-center mb-8 cursor-pointer transition-all hover:bg-gray-800 hover:shadow-2xl hover:scale-105 border-4 ${
            selectedServices.length === 3 ? 'border-white shadow-2xl' : 'border-transparent'
          }`}
          onClick={toggleCompletePackage}
        >
          <div className="flex justify-center items-center mb-4">
            <h3 className="text-2xl">Pack Complet</h3>
            {selectedServices.length === 3 && (
              <div className="ml-4 w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-black" />
              </div>
            )}
          </div>
          <p className="mb-4">Les 3 services premium en un seul achat</p>
          <div className="text-4xl mb-4">552 €</div>
          <p className="text-sm opacity-90">
            🎁 Économisez 15% • Prix normal : 650€
          </p>
        </div>

        {/* Purchase Summary */}
        {selectedServices.length > 0 && (
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl mb-4">Récapitulatif</h3>
            <div className="space-y-2 mb-6">
              {selectedServices.map((serviceId) => {
                const service = SERVICES.find((s) => s.id === serviceId);
                return (
                  <div key={serviceId} className="flex justify-between">
                    <span>{service?.title}</span>
                    <span>{service?.price} €</span>
                  </div>
                );
              })}
            </div>
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between text-xl">
                <span>Total</span>
                <span className="text-purple-600">{calculateTotal()} €</span>
              </div>
              {selectedServices.length === 3 && (
                <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <p className="text-purple-800 mb-2">
                    ✨ <strong>Pack Complet sélectionné</strong>
                  </p>
                  <p className="text-sm text-purple-700">
                    Vos 3 RDV incluront : Visio explicative + Tournage Émission + Collaborations Lucratives
                  </p>
                </div>
              )}
              {selectedServices.length > 0 && selectedServices.length < 3 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-800 text-sm">
                    📅 Vos 3 RDV : Visio explicative + Préparation + Récap
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={handlePurchase}
              className="w-full bg-black text-white px-6 py-4 rounded-lg hover:bg-gray-800 transition shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Procéder au paiement
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
