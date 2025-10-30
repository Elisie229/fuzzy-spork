import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, AlertCircle, ExternalLink, Loader2, Info } from 'lucide-react';
import { api } from '../utils/api';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';

interface StripeConnectOnboardingProps {
  currentUser: any;
  onNavigate: (page: string) => void;
}

export function StripeConnectOnboarding({ currentUser, onNavigate }: StripeConnectOnboardingProps) {
  const [accountStatus, setAccountStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAccountStatus();
  }, []);

  const checkAccountStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const status = await api.getStripeAccountStatus(currentUser.id);
      setAccountStatus(status);
    } catch (err: any) {
      console.error('Error checking Stripe account status:', err);
      setError(err.message || 'Erreur lors de la vérification du compte');
      setAccountStatus({ status: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const handleOnboarding = async () => {
    try {
      setActionLoading(true);
      setError(null);
      const result = await api.createStripeOnboardingLink();
      
      if (result.url) {
        // Redirect to Stripe onboarding
        window.location.href = result.url;
      }
    } catch (err: any) {
      console.error('Error creating onboarding link:', err);
      setError(err.message || 'Erreur lors de la création du lien d\'onboarding');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDashboard = async () => {
    try {
      setActionLoading(true);
      setError(null);
      const result = await api.createStripeDashboardLink();
      
      if (result.url) {
        // Open dashboard in new tab
        window.open(result.url, '_blank');
      }
    } catch (err: any) {
      console.error('Error creating dashboard link:', err);
      setError(err.message || 'Erreur lors de l\'accès au dashboard');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
        </CardContent>
      </Card>
    );
  }

  const getStatusInfo = () => {
    switch (accountStatus?.status) {
      case 'active':
        return {
          icon: <CheckCircle className="w-6 h-6 text-green-500" />,
          title: '✅ Compte activé',
          description: 'Vous pouvez recevoir des paiements',
          color: 'bg-green-50 border-green-200',
        };
      case 'pending':
        return {
          icon: <AlertCircle className="w-6 h-6 text-orange-500" />,
          title: '⏳ Configuration en cours',
          description: 'Complétez votre profil Stripe pour recevoir des paiements',
          color: 'bg-orange-50 border-orange-200',
        };
      case 'restricted':
        return {
          icon: <AlertCircle className="w-6 h-6 text-red-500" />,
          title: '⚠️ Compte restreint',
          description: 'Des informations supplémentaires sont requises',
          color: 'bg-red-50 border-red-200',
        };
      default:
        return {
          icon: <CreditCard className="w-6 h-6 text-gray-500" />,
          title: 'Configurer mes paiements',
          description: 'Ajoutez vos coordonnées bancaires pour recevoir vos gains',
          color: 'bg-gray-50 border-gray-200',
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="w-5 h-5" />
          <span>Paiements professionnels</span>
        </CardTitle>
        <CardDescription>
          Gérez vos coordonnées bancaires pour recevoir vos paiements
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status Card */}
        <div className={`p-4 rounded-lg border-2 ${statusInfo.color}`}>
          <div className="flex items-start space-x-3">
            {statusInfo.icon}
            <div className="flex-1">
              <h3 className="font-medium">{statusInfo.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{statusInfo.description}</p>
            </div>
          </div>
        </div>

        {/* Info Alert for beginners */}
        {accountStatus?.status === 'none' && (
          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">💡 Bon à savoir :</p>
                <ul className="text-sm space-y-1 ml-4 list-disc">
                  <li><strong>Débutant sans SIRET ?</strong> Pas de problème ! Stripe accepte les particuliers.</li>
                  <li><strong>Pro établi ?</strong> Vous pourrez renseigner votre SIRET/SIREN.</li>
                  <li><strong>Sécurisé :</strong> Vos coordonnées bancaires sont gérées par Stripe, pas par Opportunity.</li>
                  <li><strong>Automatique :</strong> Recevez vos paiements directement après validation des artistes.</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {accountStatus?.status === 'none' && (
            <Button
              onClick={handleOnboarding}
              disabled={actionLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Chargement...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Configurer mes paiements
                </>
              )}
            </Button>
          )}

          {(accountStatus?.status === 'pending' || accountStatus?.status === 'restricted') && (
            <Button
              onClick={handleOnboarding}
              disabled={actionLoading}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Chargement...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Compléter ma configuration
                </>
              )}
            </Button>
          )}

          {accountStatus?.status === 'active' && (
            <Button
              onClick={handleDashboard}
              disabled={actionLoading}
              variant="outline"
              className="w-full"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Chargement...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Accéder à mon dashboard Stripe
                </>
              )}
            </Button>
          )}

          <Button
            onClick={checkAccountStatus}
            variant="ghost"
            size="sm"
            className="w-full"
          >
            Actualiser le statut
          </Button>
        </div>

        {/* Additional Info */}
        {accountStatus?.status === 'active' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Comment ça marche ?</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>✓ Les artistes réservent vos services et paient en ligne</li>
              <li>✓ L'argent est sécurisé par Stripe (escrow)</li>
              <li>✓ Après validation de l'artiste, vous recevez automatiquement votre paiement</li>
              <li>✓ Commission Opportunity : 1,99€ par réservation</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
