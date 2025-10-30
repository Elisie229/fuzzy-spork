import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2, Lock } from 'lucide-react';

interface StripePaymentFormProps {
  amount: number;
  description: string;
  metadata?: any;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  buttonText?: string;
}

export function StripePaymentForm({
  amount,
  description,
  metadata,
  onSuccess,
  onError,
  buttonText = 'Payer',
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      // 1. Créer le Payment Intent sur le serveur
      const response = await fetch(
        `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID || 'your-project'}.supabase.co/functions/v1/make-server-b90be4d1/stripe/create-payment-intent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify({
            amount,
            description,
            metadata,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la création du paiement');
      }

      const { clientSecret } = await response.json();

      // 2. Confirmer le paiement avec Stripe
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Élément de carte introuvable');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent?.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      onError(err.message || 'Erreur lors du paiement');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Montant */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Montant total :</span>
          <span className="text-3xl text-purple-600">{amount.toFixed(2)}€</span>
        </div>
        {description && (
          <p className="text-sm text-gray-600 mt-2">{description}</p>
        )}
      </div>

      {/* Carte de crédit */}
      <div>
        <label className="block text-gray-700 mb-2 flex items-center">
          <Lock className="w-4 h-4 mr-2 text-green-600" />
          Informations de paiement sécurisé
        </label>
        <div className="border-2 border-gray-300 rounded-xl p-4 bg-white focus-within:border-purple-500 transition">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2 flex items-center">
          <Lock className="w-3 h-3 mr-1" />
          Paiement 100% sécurisé par Stripe
        </p>
      </div>

      {/* Bouton de paiement */}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
      >
        {processing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Paiement en cours...</span>
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            <span>{buttonText} {amount.toFixed(2)}€</span>
          </>
        )}
      </button>

      {/* Sécurité */}
      <div className="text-center text-xs text-gray-500">
        <p>🔒 Vos informations bancaires sont cryptées et sécurisées</p>
        <p className="mt-1">Powered by Stripe - Leader mondial du paiement en ligne</p>
      </div>
    </form>
  );
}
