import { useState } from 'react';
import { FileText, Download, CheckCircle } from 'lucide-react';
import { api } from '../utils/api';

interface ContractPageProps {
  currentUser: any;
  onNavigate: (page: string) => void;
  onAccept: () => void;
}

export function ContractPage({ currentUser, onNavigate, onAccept }: ContractPageProps) {
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAccept = async () => {
    if (!agreed || !signature) {
      alert('Veuillez cocher la case et signer le contrat pour continuer.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Sauvegarder la signature du contrat
      await api.signContract(currentUser.id, signature);
      
      // Afficher un message de succès
      alert('Contrat signé avec succès ! Une copie a été envoyée à votre email.');
      
      onAccept();
    } catch (error: any) {
      console.error('Error signing contract:', error);
      alert('Erreur lors de la signature du contrat. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadContract = () => {
    // Créer un PDF du contrat (version simplifiée)
    const contractText = document.getElementById('contract-content')?.innerText || '';
    const blob = new Blob([contractText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Contrat_Collaboration_Opportunity_${currentUser?.name}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full mb-6 shadow-2xl shadow-cyan-500/50">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl mb-4 text-black">
            Contrat de Collaboration Artistique
          </h1>
          <p className="text-gray-600 text-lg">
            Services Premium Opportunity - Document légal obligatoire
          </p>
        </div>

        {/* Download Button */}
        <div className="mb-8 text-center">
          <button
            onClick={downloadContract}
            className="inline-flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-xl transition-all duration-300"
          >
            <Download className="w-5 h-5" />
            <span>Télécharger le contrat</span>
          </button>
        </div>

        {/* Contract Content */}
        <div
          id="contract-content"
          className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8 md:p-12 mb-8 max-h-[600px] overflow-y-auto"
        >
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl mb-4 text-black">Préambule</h2>
              <p className="text-gray-700 leading-relaxed">
                Le présent contrat est conclu entre la plateforme <strong>Opportunity</strong> (ci-après "la Plateforme") 
                et <strong>{currentUser?.name}</strong> (ci-après "l'Artiste"), 
                dans le cadre de la souscription aux Services Premium de la Plateforme.
              </p>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-2xl mb-4 text-black">Article 1 - Objet du Contrat</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Le présent contrat a pour objet de définir les modalités de collaboration entre la Plateforme 
                et l'Artiste dans le cadre des Services Premium souscrits, incluant notamment :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Accompagnement stratégique et créatif personnalisé</li>
                <li>Promotion via l'émission vitrine de la Plateforme</li>
                <li>Mise en relation avec des partenaires professionnels</li>
                <li>Services de distribution et de développement de carrière</li>
              </ul>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-2xl mb-4 text-black">Article 2 - Confidentialité et Protection des Méthodes</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>2.1 - Engagement de confidentialité</strong><br />
                L'Artiste s'engage à garder strictement confidentielles toutes les informations, méthodes, 
                stratégies et processus exclusifs communiqués par la Plateforme dans le cadre de l'accompagnement.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>2.2 - Sanction financière</strong><br />
                En cas de divulgation, reproduction ou utilisation non autorisée des méthodes stratégiques 
                de la Plateforme, l'Artiste s'engage à verser une pénalité de <strong>5 000 € (cinq mille euros)</strong> 
                à titre de dommages et intérêts, sans préjudice de toute action en justice supplémentaire.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>2.3 - Durée de confidentialité</strong><br />
                L'obligation de confidentialité persiste pendant toute la durée du contrat et pour une période 
                de 5 ans après sa résiliation.
              </p>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-2xl mb-4 text-black">Article 3 - Droits à l'Image et d'Exploitation</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>3.1 - Autorisation d'utilisation</strong><br />
                L'Artiste autorise expressément la Plateforme à utiliser son nom, son image, sa voix, 
                ses œuvres musicales et tout contenu fourni dans le cadre de :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>L'émission vitrine de la Plateforme (diffusion TV, web, replay)</li>
                <li>La promotion sur la plateforme Opportunity et son site web</li>
                <li>Les réseaux sociaux de la Plateforme (Instagram, Facebook, TikTok, YouTube, etc.)</li>
                <li>Les supports marketing et communication de la Plateforme</li>
                <li>Les newsletters et campagnes d'emailing</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>3.2 - Territoire et durée</strong><br />
                Ces droits sont concédés pour le monde entier, pour une durée de 3 ans à compter de la signature, 
                renouvelable tacitement.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>3.3 - Rémunération</strong><br />
                Ces droits sont cédés à titre gratuit, la rémunération de l'Artiste résidant dans les services 
                fournis et la visibilité apportée par la Plateforme.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>3.4 - Droit de retrait</strong><br />
                L'Artiste peut demander le retrait de certains contenus par écrit avec un préavis de 30 jours, 
                sauf pour les contenus déjà diffusés qui restent archivés.
              </p>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-2xl mb-4 text-black">Article 4 - Obligations de l'Artiste</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Fournir des contenus de qualité professionnelle (photos, vidéos, musiques)</li>
                <li>Respecter les délais convenus pour les projets</li>
                <li>Participer activement aux sessions d'accompagnement</li>
                <li>Informer la Plateforme de tout changement important dans sa carrière</li>
                <li>Respecter l'image et la réputation de la Plateforme</li>
                <li>Ne pas dénigrer publiquement la Plateforme ou ses méthodes</li>
              </ul>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-2xl mb-4 text-black">Article 5 - Obligations de la Plateforme</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Fournir un accompagnement professionnel et personnalisé</li>
                <li>Promouvoir l'Artiste selon les modalités convenues</li>
                <li>Respecter la confidentialité des données personnelles de l'Artiste</li>
                <li>Mettre en œuvre les moyens nécessaires pour atteindre les objectifs fixés</li>
                <li>Informer l'Artiste des opportunités de collaboration pertinentes</li>
              </ul>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-2xl mb-4 text-black">Article 6 - Durée et Résiliation</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>6.1 - Durée</strong><br />
                Le présent contrat est conclu pour une durée d'un an à compter de la signature, 
                renouvelable par tacite reconduction.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>6.2 - Résiliation</strong><br />
                Chaque partie peut résilier le contrat moyennant un préavis de 2 mois par lettre recommandée 
                avec accusé de réception.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>6.3 - Résiliation pour faute</strong><br />
                En cas de manquement grave aux obligations contractuelles, le contrat pourra être résilié 
                de plein droit sans préavis ni indemnité.
              </p>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-2xl mb-4 text-black">Article 7 - Propriété Intellectuelle</h2>
              <p className="text-gray-700 leading-relaxed">
                L'Artiste reste propriétaire de ses œuvres musicales. La Plateforme ne dispose que des droits 
                d'exploitation définis à l'article 3. Toute utilisation en dehors de ce cadre nécessite 
                l'accord écrit préalable de l'Artiste.
              </p>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-2xl mb-4 text-black">Article 8 - Protection des Données (RGPD)</h2>
              <p className="text-gray-700 leading-relaxed">
                Les données personnelles de l'Artiste sont traitées conformément au RGPD. L'Artiste dispose 
                d'un droit d'accès, de rectification, d'opposition et de suppression de ses données en contactant 
                contact@opportunity.fr.
              </p>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-2xl mb-4 text-black">Article 9 - Litiges et Juridiction</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>9.1 - Règlement amiable</strong><br />
                En cas de différend, les parties s'engagent à chercher une solution amiable avant toute 
                action judiciaire.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>9.2 - Juridiction compétente</strong><br />
                À défaut d'accord amiable, tout litige sera porté devant les tribunaux compétents de Paris.
              </p>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-2xl mb-4 text-black">Article 10 - Dispositions Générales</h2>
              <p className="text-gray-700 leading-relaxed">
                Si une clause du présent contrat est déclarée nulle ou inapplicable, les autres clauses 
                restent en vigueur. Le présent contrat constitue l'intégralité de l'accord entre les parties 
                et remplace tout accord antérieur.
              </p>
            </div>

            <div className="border-t pt-6 bg-gray-50 p-6 rounded-xl">
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>Fait à Paris, le {new Date().toLocaleDateString('fr-FR')}</strong>
              </p>
              <p className="text-gray-700 leading-relaxed">
                En signant électroniquement ce contrat, l'Artiste reconnaît avoir lu, compris et accepté 
                l'ensemble des clauses du présent contrat de collaboration artistique.
              </p>
            </div>
          </div>
        </div>

        {/* Signature Section */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8 mb-8">
          <h3 className="text-xl mb-6 text-black">Signature Électronique</h3>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">
              Tapez votre nom complet pour signer :
            </label>
            <input
              type="text"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Prénom Nom"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="flex items-start space-x-3 mb-6">
            <input
              type="checkbox"
              id="agree"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="agree" className="text-gray-700 leading-relaxed">
              J'ai lu et j'accepte le contrat, incluant les clauses de confidentialité, droits d'exploitation et sanctions.
            </label>
          </div>

          <button
            onClick={handleAccept}
            disabled={!agreed || !signature || isSubmitting}
            className={`w-full py-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 ${
              agreed && signature && !isSubmitting
                ? 'bg-black text-white hover:bg-gray-800 shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Validation en cours...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-6 h-6" />
                <span>Signer et Accepter le Contrat</span>
              </>
            )}
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <p className="text-blue-800 text-sm leading-relaxed">
            <strong>Note importante :</strong> Une copie de ce contrat signé sera automatiquement 
            envoyée à votre adresse email. Conservez-la précieusement. En cas de question, 
            contactez-nous à contact@opportunity.fr.
          </p>
        </div>
      </div>
    </div>
  );
}
