import { useState, useEffect, useRef } from 'react';
import { FileText } from 'lucide-react';
import { supabase } from './utils/supabase/client';
import { api } from './utils/api';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { AuthPage } from './components/AuthPage';
import { SearchPage } from './components/SearchPage';
import { ArtistListingPage } from './components/ArtistListingPage';
import { ProfessionalListingPage } from './components/ProfessionalListingPage';
import { PremiumServicesPage } from './components/PremiumServicesPage';
import { MessagingPage } from './components/MessagingPage';
import { ApplicationsPage } from './components/ApplicationsPage';
import { CalendarPage } from './components/CalendarPage';
import { ProServiceBookingPage } from './components/ProServiceBookingPage';
import { QuestionnairePage } from './components/QuestionnairePage';
import { ProfilePage } from './components/ProfilePage';
import { SubscriptionPage } from './components/SubscriptionPage';
import { LegalPage } from './components/LegalPage';
import { AISchedulingPage } from './components/AISchedulingPage';
import { ContractPage } from './components/ContractPage';
import { ServicePaymentPage } from './components/ServicePaymentPage';
import { AppointmentBookingPage } from './components/AppointmentBookingPage';
import { AdminPanelWrapper } from './components/AdminPanelWrapper';
import { ForgotPasswordPage } from './components/ForgotPasswordPage';
import { ResetPasswordPage } from './components/ResetPasswordPage';
import { HelpPage } from './components/HelpPage';
import { ServiceValidationPage } from './components/ServiceValidationPage';

type Page =
  | 'home'
  | 'login'
  | 'signup'
  | 'search'
  | 'search-results'
  | 'artists'
  | 'professionals'
  | 'services'
  | 'service-payment'
  | 'messages'
  | 'calendar'
  | 'pro-service-booking'
  | 'ai-schedule'
  | 'questionnaire'
  | 'contract'
  | 'appointments'
  | 'profile'
  | 'profile-view'
  | 'subscription'
  | 'applications'
  | 'admin'
  | 'forgot-password'
  | 'reset-password'
  | 'help'
  | 'service-validation'
  | 'legal';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [searchCriteria, setSearchCriteria] = useState<any>({
    userType: 'artist',
    classification: '',
    city: '',
    category: '',
    name: '',
    musicGenre: '',
    priceRange: { min: 0, max: 1000 },
  });
  const [navigationData, setNavigationData] = useState<any>(null);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      checkSession();
    }
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('[Session] Error retrieving session:', error.message || error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userId');
        setIsInitializing(false);
        return;
      }

      if (session && session.user) {
        const userId = session.user.id;
        const accessToken = session.access_token;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('userId', userId);

        try {
          const profile = await api.getProfile(userId);
          if (profile && profile.profile) {
            setCurrentUser(profile.profile);
          }
        } catch (profileError: any) {
          console.error('[Session] Error loading user profile:', profileError?.message || profileError);
        }
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userId');
      }
    } catch (error: any) {
      console.error('[Session] Unexpected error during session check:', error?.message || error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userId');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleNavigate = (page: Page, data?: any) => {
    console.log('[App] handleNavigate called:', { page, data, hasData: data !== undefined });
    setCurrentPage(page);
    // Toujours mettre à jour navigationData, même si c'est undefined
    // Cela permet de réinitialiser l'état si nécessaire
    setNavigationData(data);
    window.scrollTo(0, 0);
  };

  const handleLogin = (user: any, accessToken: string) => {
    setCurrentUser(user);
    
    // Après inscription, forcer le paiement de l'abonnement
    if (user.subscriptionStatus !== 'active') {
      handleNavigate('subscription');
    } else if (!user.classification) {
      handleNavigate('questionnaire');
    } else {
      handleNavigate('home');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    setCurrentUser(null);
    handleNavigate('home');
  };

  const handleSearch = (criteria: any) => {
    setSearchCriteria(criteria);
  };

  const handleQuestionnaireComplete = async () => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      try {
        const profile = await api.getProfile(userId);
        if (profile && profile.profile) {
          setCurrentUser(profile.profile);
        }
      } catch (error: any) {
        console.error('[Questionnaire] Error refreshing profile:', error?.message || error);
      }
    }
  };

  const handleSubscribe = async () => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      try {
        const profile = await api.getProfile(userId);
        if (profile && profile.profile) {
          setCurrentUser(profile.profile);
        }
      } catch (error: any) {
        console.error('[Subscription] Error refreshing profile:', error?.message || error);
      }
    }
  };

  const handleServicePurchase = async (serviceIds: string[], totalAmount: number) => {
    // Rediriger vers le paiement avec les données
    console.log('[App] handleServicePurchase called with:', { serviceIds, totalAmount });
    
    // Sauvegarder immédiatement dans localStorage comme backup
    localStorage.setItem('pendingServicePurchase', JSON.stringify({
      selectedServices: serviceIds,
      totalAmount,
    }));
    
    // Passer les données directement à handleNavigate (IMPORTANT: ne pas appeler setNavigationData avant)
    console.log('[App] Navigating to service-payment with data');
    handleNavigate('service-payment', { serviceIds, totalAmount });
  };

  const handlePaymentSuccess = async () => {
    // Après paiement réussi, proposer le contrat
    handleNavigate('contract');
  };

  const handleContractAccept = async () => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      try {
        const profile = await api.getProfile(userId);
        if (profile && profile.profile) {
          setCurrentUser(profile.profile);
        }
      } catch (error: any) {
        console.error('[Contract] Error refreshing profile:', error?.message || error);
      }
    }
    // Après signature du contrat, réserver les 3 RDV
    handleNavigate('appointments');
  };

  const handleAppointmentsComplete = async () => {
    // Rafraîchir le profil et retourner à l'accueil
    const userId = localStorage.getItem('userId');
    if (userId) {
      try {
        const profile = await api.getProfile(userId);
        if (profile && profile.profile) {
          setCurrentUser(profile.profile);
        }
      } catch (error: any) {
        console.error('[Appointments] Error refreshing profile:', error?.message || error);
      }
    }
    handleNavigate('home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} onSearch={handleSearch} />;

      case 'login':
        return (
          <AuthPage mode="login" onSuccess={handleLogin} onNavigate={handleNavigate} />
        );

      case 'signup':
        return (
          <AuthPage mode="signup" onSuccess={handleLogin} onNavigate={handleNavigate} />
        );

      case 'search':
      case 'search-results':
        return (
          <SearchPage
            searchCriteria={searchCriteria}
            currentUser={currentUser}
            onNavigate={handleNavigate}
          />
        );

      case 'artists':
        return <ArtistListingPage onNavigate={handleNavigate} />;

      case 'professionals':
        return (
          <ProfessionalListingPage
            category={navigationData?.category}
            onNavigate={handleNavigate}
          />
        );

      case 'services':
        return (
          <PremiumServicesPage
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onPurchase={handleServicePurchase}
          />
        );

      case 'service-payment':
        const serviceIds = navigationData?.serviceIds || [];
        const amount = navigationData?.totalAmount || 0;
        console.log('[App] Rendering ServicePaymentPage:', { 
          navigationData, 
          serviceIds, 
          amount,
          hasNavigationData: navigationData !== null && navigationData !== undefined
        });
        return (
          <ServicePaymentPage
            currentUser={currentUser}
            selectedServices={serviceIds}
            totalAmount={amount}
            onNavigate={handleNavigate}
            onPaymentSuccess={handlePaymentSuccess}
          />
        );

      case 'messages':
        return (
          <MessagingPage
            currentUser={currentUser}
            selectedUserId={navigationData?.selectedUserId}
            initialMessage={navigationData?.initialMessage}
            onNavigate={handleNavigate}
          />
        );

      case 'calendar':
        return (
          <CalendarPage
            currentUser={currentUser}
            selectedProId={navigationData?.selectedProId}
            onNavigate={handleNavigate}
          />
        );

      case 'pro-service-booking':
        return (
          <ProServiceBookingPage
            currentUser={currentUser}
            proUser={navigationData?.proUser}
            service={navigationData?.service}
            onNavigate={handleNavigate}
          />
        );

      case 'ai-schedule':
        return (
          <AISchedulingPage
            currentUser={currentUser}
            onNavigate={handleNavigate}
          />
        );

      case 'questionnaire':
        return (
          <QuestionnairePage
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onComplete={handleQuestionnaireComplete}
          />
        );

      case 'contract':
        return (
          <ContractPage
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onAccept={handleContractAccept}
          />
        );

      case 'appointments':
        return (
          <AppointmentBookingPage
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onComplete={handleAppointmentsComplete}
          />
        );

      case 'admin':
        return (
          <AdminPanelWrapper
            currentUser={currentUser}
            onNavigate={handleNavigate}
          />
        );

      case 'forgot-password':
        return (
          <ForgotPasswordPage
            onNavigate={handleNavigate}
          />
        );

      case 'reset-password':
        return (
          <ResetPasswordPage
            onNavigate={handleNavigate}
          />
        );

      case 'help':
        return (
          <HelpPage
            currentUser={currentUser}
            onNavigate={handleNavigate}
          />
        );

      case 'service-validation':
        return (
          <ServiceValidationPage
            currentUser={currentUser}
            onNavigate={handleNavigate}
          />
        );

      case 'profile':
        return currentUser ? (
          <ProfilePage
            userId={currentUser.id}
            currentUser={currentUser}
            isOwnProfile={true}
            onNavigate={handleNavigate}
          />
        ) : (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600 mb-4">Veuillez vous connecter</p>
              <button
                onClick={() => handleNavigate('login')}
                className="text-purple-600 hover:underline"
              >
                Se connecter
              </button>
            </div>
          </div>
        );

      case 'profile-view':
        return (
          <ProfilePage
            userId={navigationData?.userId}
            currentUser={currentUser}
            isOwnProfile={currentUser?.id === navigationData?.userId}
            onNavigate={handleNavigate}
          />
        );

      case 'subscription':
        return (
          <SubscriptionPage
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onSubscribe={handleSubscribe}
          />
        );

      case 'applications':
        return currentUser && currentUser.userType === 'pro' ? (
          <ApplicationsPage
            currentUser={currentUser}
            onNavigate={handleNavigate}
          />
        ) : (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Cette page est réservée aux professionnels
              </p>
              <button
                onClick={() => handleNavigate('home')}
                className="text-purple-600 hover:underline"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        );

      case 'legal':
        return <LegalPage onNavigate={handleNavigate} />;

      default:
        return <HomePage onNavigate={handleNavigate} onSearch={handleSearch} />;
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse shadow-2xl shadow-cyan-500/50">
            <span className="text-white text-2xl">O</span>
          </div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
        <Header
          currentUser={currentUser}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
        
        <main className="flex-1">{renderPage()}</main>

        <footer className="bg-black text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/50">
                  <span className="text-white text-sm">O</span>
                </div>
                <span className="text-xl">Opportunity</span>
              </div>
              <p className="text-gray-400 text-sm">
                La marketplace musicale intelligente pour créer des collaborations authentiques.
              </p>
            </div>

            <div>
              <h3 className="mb-4">Plateforme</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <button
                    onClick={() => handleNavigate('home')}
                    className="hover:text-white transition"
                  >
                    Accueil
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigate('search')}
                    className="hover:text-white transition"
                  >
                    Recherche
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigate('services')}
                    className="hover:text-white transition"
                  >
                    Services Premium
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4">Compte</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                {currentUser ? (
                  <>
                    <li>
                      <button
                        onClick={() => handleNavigate('profile')}
                        className="hover:text-white transition"
                      >
                        Mon Profil
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleNavigate('messages')}
                        className="hover:text-white transition"
                      >
                        Messages
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="hover:text-white transition"
                      >
                        Déconnexion
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <button
                        onClick={() => handleNavigate('login')}
                        className="hover:text-white transition"
                      >
                        Connexion
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleNavigate('signup')}
                        className="hover:text-white transition"
                      >
                        Inscription
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </div>

            <div>
              <h3 className="mb-4">Aide & Légal</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <button
                    onClick={() => handleNavigate('help')}
                    className="hover:text-white transition text-blue-400"
                  >
                    💬 Centre d'Aide
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigate('legal')}
                    className="hover:text-white transition flex items-center"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Mentions Légales
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigate('legal')}
                    className="hover:text-white transition"
                  >
                    CGU / CGV
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigate('legal')}
                    className="hover:text-white transition"
                  >
                    Confidentialité
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigate('legal')}
                    className="hover:text-white transition"
                  >
                    RGPD
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
            <p>© 2025 Opportunity. Tous droits réservés.</p>
            <p className="mt-2">
              Marketplace musicale intelligente pour artistes et professionnels.
            </p>
          </div>
        </div>
      </footer>
      </div>
    </ErrorBoundary>
  );
}