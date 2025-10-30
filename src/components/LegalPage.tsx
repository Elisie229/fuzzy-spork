import { Shield, FileText, Lock } from 'lucide-react';

interface LegalPageProps {
  onNavigate: (page: string) => void;
}

export function LegalPage({ onNavigate }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl mb-4">Mentions Légales</h1>
          <p className="text-gray-600">
            Conditions générales et politique de confidentialité
          </p>
        </div>

        <div className="space-y-8">
          {/* CGU/CGV */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-2xl">Conditions Générales d'Utilisation et de Vente</h2>
            </div>

            <div className="space-y-4 text-gray-700">
              <section>
                <h3 className="text-lg mb-2">Article 1 - Objet</h3>
                <p>
                  Les présentes Conditions Générales ont pour objet de définir les modalités et
                  conditions d'utilisation de la plateforme Opportunity, ainsi que les droits et
                  obligations des utilisateurs.
                </p>
              </section>

              <section>
                <h3 className="text-lg mb-2">Article 2 - Accès à la plateforme</h3>
                <p>
                  L'accès à la plateforme Opportunity nécessite un abonnement annuel de 5,99 €.
                  Cet abonnement est obligatoire pour accéder aux fonctionnalités de la plateforme.
                </p>
              </section>

              <section>
                <h3 className="text-lg mb-2">Article 3 - Services Premium</h3>
                <p>
                  Opportunity propose trois services premium administrés par la plateforme :
                  "Je teste ma vision" (50€), "Je développe mon audience" (50€), et
                  "Je crée des partenariats" (50€). Un pack complet est disponible à 150€.
                </p>
                <p className="mt-2">
                  L'achat d'un service premium engage l'artiste à participer à 3 rendez-vous
                  obligatoires avec l'équipe Opportunity et à signer un contrat de collaboration
                  et de confidentialité.
                </p>
              </section>

              <section>
                <h3 className="text-lg mb-2">Article 4 - Responsabilités</h3>
                <p>
                  Opportunity agit en tant qu'intermédiaire entre les artistes et les professionnels.
                  La plateforme ne peut être tenue responsable de la qualité des services fournis
                  par les professionnels inscrits.
                </p>
              </section>
            </div>
          </div>

          {/* Confidentialité */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl">Politique de Confidentialité</h2>
            </div>

            <div className="space-y-4 text-gray-700">
              <section>
                <h3 className="text-lg mb-2">Collecte des données</h3>
                <p>
                  Opportunity collecte les données personnelles nécessaires au fonctionnement de la
                  plateforme : nom, email, informations de profil, questionnaires de classification
                  et de collaboration.
                </p>
              </section>

              <section>
                <h3 className="text-lg mb-2">Utilisation des données</h3>
                <p>
                  Les données collectées sont utilisées pour :
                </p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>Créer et gérer votre compte</li>
                  <li>Faciliter les mises en relation</li>
                  <li>Améliorer nos services</li>
                  <li>Envoyer des notifications pertinentes</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg mb-2">RGPD</h3>
                <p>
                  Conformément au Règlement Général sur la Protection des Données (RGPD), vous
                  disposez d'un droit d'accès, de rectification, d'effacement et de portabilité
                  de vos données personnelles.
                </p>
              </section>
            </div>
          </div>

          {/* Droits à l'image */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-pink-600" />
              </div>
              <h2 className="text-2xl">Cession des Droits à l'Image</h2>
            </div>

            <div className="space-y-4 text-gray-700">
              <section>
                <p>
                  En utilisant Opportunity et en souscrivant aux services premium, vous acceptez
                  que votre image, vos contenus et vos créations puissent être utilisés par
                  Opportunity dans le cadre de :
                </p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>La promotion de la plateforme</li>
                  <li>Les émissions et contenus produits par Opportunity</li>
                  <li>Les réseaux sociaux et supports de communication</li>
                  <li>Les présentations et portfolios de la plateforme</li>
                </ul>
              </section>

              <section className="mt-4">
                <p>
                  Cette cession est non exclusive et ne vous empêche pas d'utiliser vos propres
                  contenus de manière autonome. Vous conservez la propriété intellectuelle de vos
                  créations.
                </p>
              </section>
            </div>
          </div>

          {/* Contrat de Collaboration */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl">Contrat de Collaboration et Confidentialité</h2>
            </div>

            <div className="space-y-4 text-gray-700">
              <section>
                <h3 className="text-lg mb-2">Obligation de confidentialité</h3>
                <p>
                  Toutes les informations échangées dans le cadre des services premium et des
                  collaborations sur la plateforme sont confidentielles. Leur divulgation non
                  autorisée entraîne des pénalités conformément à la législation en vigueur.
                </p>
              </section>

              <section>
                <h3 className="text-lg mb-2">Inscription obligatoire des professionnels</h3>
                <p>
                  Tous les professionnels avec lesquels vous travaillez dans le cadre des services
                  proposés par Opportunity doivent être inscrits sur la plateforme. Cette mesure
                  garantit la qualité et la traçabilité des collaborations.
                </p>
              </section>

              <section>
                <h3 className="text-lg mb-2">Pénalités</h3>
                <p>
                  En cas de non-respect des clauses de confidentialité ou des obligations
                  contractuelles, des pénalités financières et/ou la suspension du compte peuvent
                  être appliquées.
                </p>
              </section>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => onNavigate('home')}
            className="text-purple-600 hover:underline"
          >
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}
