import { Search, Music, Users, Sparkles, Eye, Video, Briefcase, Camera, Headphones, Settings, Calendar, Newspaper, PenTool } from 'lucide-react';
import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { HeroSlideshow } from './HeroSlideshow';
import { ClassificationBadge } from './ClassificationBadge';
import heroImage from 'figma:asset/dffd7b4126b74e24e5ee55b68048dd6770fa1a47.png';

interface HomePageProps {
  onNavigate: (page: string) => void;
  onSearch: (criteria: any) => void;
}

export function HomePage({ onNavigate, onSearch }: HomePageProps) {
  const [searchCriteria, setSearchCriteria] = useState({
    userType: 'artist',
    classification: '',
    city: '',
    category: '',
    priceRange: { min: 0, max: 1000 },
  });

  const handleSearch = () => {
    onSearch(searchCriteria);
    onNavigate('search-results');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Dynamic Image */}
      <section className="relative overflow-hidden bg-white py-6 md:py-8">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Layout responsive : mobile = colonne, desktop = grille */}
          <div className="flex flex-col md:grid md:grid-cols-[20%_80%] gap-4 md:gap-0 items-center">
            
            {/* Image - en premier sur mobile, à droite sur desktop */}
            <div className="order-1 md:order-2 relative w-full md:h-[500px] lg:h-[600px] flex items-center justify-start md:-ml-32">
              <div className="w-full h-[300px] sm:h-[400px] md:h-full max-h-[550px] rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={heroImage} 
                  alt="Artistes musicaux" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Button - en dessous sur mobile, à gauche sur desktop */}
            <div className="order-2 md:order-1 text-black z-20 flex flex-col justify-center items-center md:items-start w-full">
              <button
                onClick={() => onNavigate('signup')}
                className="bg-black/90 backdrop-blur-md text-white px-6 py-3 md:px-8 md:py-4 rounded-xl hover:bg-black transition-all duration-300 shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 border border-white/10 text-sm md:text-base"
              >
                Commencer maintenant
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Services Section - PREMIÈRE POSITION */}
      <section className="py-12 md:py-20 bg-white relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-cyan-200/30 via-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tl from-purple-200/30 via-pink-200/30 to-cyan-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8 md:mb-16">
            <div className="inline-block mb-3">
              <span className="inline-flex items-center px-4 py-1.5 md:px-6 md:py-2 rounded-full bg-gradient-to-r from-cyan-100 via-blue-100 to-purple-100 border-2 border-cyan-400/30 text-sm md:text-base">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-cyan-600 mr-2" />
                <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Offre Exclusive
                </span>
              </span>
            </div>
            <h2 className="text-2xl md:text-4xl lg:text-5xl mb-4 md:mb-6 text-black">
              Circuit Artist
            </h2>
            <p className="text-gray-600 text-sm md:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed px-4">
              Accompagnement personnalisé administré par notre équipe pour propulser votre carrière musicale
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
            {/* Service 1 - Je teste ma vision (Cyan) */}
            <div className="group relative bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 border-2 border-gray-200 hover:border-cyan-400 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/30 transform hover:-translate-y-2">
              {/* Black Background on Hover */}
              <div className="absolute inset-0 bg-black/10 rounded-2xl md:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              {/* Glass Effect on Hover */}
              <div className="absolute inset-0 bg-white/30 backdrop-blur-sm rounded-2xl md:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 border border-white/50"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-500 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 lg:mb-8 mx-auto shadow-xl shadow-cyan-500/50 group-hover:scale-110 transition-transform duration-500">
                  <Eye className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl lg:text-3xl text-center mb-2 md:mb-3 text-gray-900 group-hover:text-cyan-600 transition-colors duration-300">
                  Je teste ma vision
                </h3>
                <p className="text-center text-cyan-500 text-2xl md:text-3xl mb-3 md:mb-6">50€</p>
                <p className="text-center text-gray-600 mb-4 md:mb-6 lg:mb-8 text-sm md:text-base lg:text-lg">
                  Qui êtes-vous ? Que visez-vous ?
                </p>
                
                <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8 lg:mb-10">
                  <li className="flex items-start text-gray-700 text-sm md:text-base">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 mt-1.5 md:mt-2 mr-2 md:mr-3 flex-shrink-0"></div>
                    <span>Analyse de votre projet musical</span>
                  </li>
                  <li className="flex items-start text-gray-700 text-sm md:text-base">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 mt-1.5 md:mt-2 mr-2 md:mr-3 flex-shrink-0"></div>
                    <span>Réfléchir à son identité et ses objectifs</span>
                  </li>
                  <li className="flex items-start text-gray-700 text-sm md:text-base">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 mt-1.5 md:mt-2 mr-2 md:mr-3 flex-shrink-0"></div>
                    <span>Stratégie de développement</span>
                  </li>
                  <li className="flex items-start text-gray-700 text-sm md:text-base">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 mt-1.5 md:mt-2 mr-2 md:mr-3 flex-shrink-0"></div>
                    <span>Mettre en place un plan de lancement</span>
                  </li>
                </ul>
                
                <button
                  onClick={() => onNavigate('services')}
                  className="w-full bg-black text-white px-4 py-3 md:px-6 md:py-4 lg:px-8 lg:py-5 rounded-xl hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm md:text-base"
                >
                  Sélectionner - 50€
                </button>
              </div>
            </div>

            {/* Service 2 - Je développe ma notoriété (Violet) */}
            <div className="group relative bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 border-2 border-gray-200 hover:border-purple-400 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/30 transform hover:-translate-y-2 md:scale-105">
              {/* Popular Badge */}
              <div className="absolute -top-3 md:-top-4 left-1/2 transform -translate-x-1/2 z-20">
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 md:px-6 md:py-2 rounded-full shadow-lg text-xs md:text-sm">
                  ⭐ Plus Populaire
                </span>
              </div>

              {/* Black Background on Hover */}
              <div className="absolute inset-0 bg-black/10 rounded-2xl md:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              {/* Glass Effect on Hover */}
              <div className="absolute inset-0 bg-white/30 backdrop-blur-sm rounded-2xl md:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 border border-white/50"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 lg:mb-8 mx-auto shadow-xl shadow-purple-500/50 group-hover:scale-110 transition-transform duration-500">
                  <Video className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl lg:text-3xl text-center mb-2 md:mb-3 text-gray-900 group-hover:text-purple-600 transition-colors duration-300">
                  Je développe mon audience
                </h3>
                <p className="text-center text-purple-500 text-2xl md:text-3xl mb-3 md:mb-6">250€</p>
                <p className="text-center text-gray-600 mb-4 md:mb-6 lg:mb-8 text-sm md:text-base lg:text-lg">
                  Mise en avant via émission vitrine
                </p>
                
                <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8 lg:mb-10">
                  <li className="flex items-start text-gray-700 text-sm md:text-base">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 mt-1.5 md:mt-2 mr-2 md:mr-3 flex-shrink-0"></div>
                    <span>Émission partenaire pour promouvoir votre musique</span>
                  </li>
                  <li className="flex items-start text-gray-700 text-sm md:text-base">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 mt-1.5 md:mt-2 mr-2 md:mr-3 flex-shrink-0"></div>
                    <span>Promotion sur nos réseaux</span>
                  </li>
                  <li className="flex items-start text-gray-700 text-sm md:text-base">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 mt-1.5 md:mt-2 mr-2 md:mr-3 flex-shrink-0"></div>
                    <span>Stratégie de visibilité</span>
                  </li>
                  <li className="flex items-start text-gray-700 text-sm md:text-base">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 mt-1.5 md:mt-2 mr-2 md:mr-3 flex-shrink-0"></div>
                    <span>Développement d'audience</span>
                  </li>
                </ul>
                
                <button
                  onClick={() => onNavigate('services')}
                  className="w-full bg-black text-white px-4 py-3 md:px-6 md:py-4 lg:px-8 lg:py-5 rounded-xl hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm md:text-base"
                >
                  Sélectionner - 250€
                </button>
              </div>
            </div>

            {/* Service 3 - Je booste ma carrière (Bleu foncé) */}
            <div className="group relative bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 border-2 border-gray-200 hover:border-blue-400 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/30 transform hover:-translate-y-2">
              {/* Black Background on Hover */}
              <div className="absolute inset-0 bg-black/10 rounded-2xl md:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              {/* Glass Effect on Hover */}
              <div className="absolute inset-0 bg-white/30 backdrop-blur-sm rounded-2xl md:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 border border-white/50"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 lg:mb-8 mx-auto shadow-xl shadow-blue-500/50 group-hover:scale-110 transition-transform duration-500">
                  <Briefcase className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl lg:text-3xl text-center mb-2 md:mb-3 text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                  Je booste ma carrière
                </h3>
                <p className="text-center text-blue-600 text-2xl md:text-3xl mb-3 md:mb-6">350€</p>
                <p className="text-center text-gray-600 mb-4 md:mb-6 lg:mb-8 text-sm md:text-base lg:text-lg">
                  Partenariats lucratifs + distribution
                </p>
                
                <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8 lg:mb-10">
                  <li className="flex items-start text-gray-700 text-sm md:text-base">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 mt-1.5 md:mt-2 mr-2 md:mr-3 flex-shrink-0"></div>
                    <span>Opportunités lucratives</span>
                  </li>
                  <li className="flex items-start text-gray-700 text-sm md:text-base">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 mt-1.5 md:mt-2 mr-2 md:mr-3 flex-shrink-0"></div>
                    <span>Plan de distribution</span>
                  </li>
                  <li className="flex items-start text-gray-700 text-sm md:text-base">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 mt-1.5 md:mt-2 mr-2 md:mr-3 flex-shrink-0"></div>
                    <span>Développement business</span>
                  </li>
                </ul>
                
                <button
                  onClick={() => onNavigate('services')}
                  className="w-full bg-black text-white px-4 py-3 md:px-6 md:py-4 lg:px-8 lg:py-5 rounded-xl hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm md:text-base"
                >
                  Sélectionner - 350€
                </button>
              </div>
            </div>
          </div>

          {/* Pack Offer */}
          <div className="text-center relative">
            <div className="inline-block relative group cursor-pointer" onClick={() => onNavigate('services')}>
              <div className="absolute inset-0 bg-black rounded-2xl md:rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
              <div className="relative bg-black text-white px-8 py-6 md:px-12 md:py-8 lg:px-16 lg:py-10 rounded-2xl md:rounded-3xl shadow-2xl shadow-black/50 transform group-hover:scale-105 transition-transform duration-300">
                <p className="mb-2 md:mb-3 text-base md:text-xl lg:text-2xl">Pack complet : 3 services</p>
                <div className="text-3xl md:text-5xl lg:text-6xl">552 €</div>
                <p className="mt-2 md:mt-4 text-sm md:text-base lg:text-lg">🎁 Économisez 15% (au lieu de 650€) !</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Artist Cards Section */}
      <section className="py-20 bg-black border-t border-purple-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with Button and "Voir plus" */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => onNavigate('artists')}
                className="border border-purple-600 text-white px-5 py-2.5 rounded-lg hover:bg-purple-600/10 transition-all duration-300 tracking-wider uppercase"
              >
                Je cherche un artiste
              </button>
              <button
                onClick={() => onNavigate('artists')}
                className="text-purple-400 hover:text-purple-300 transition uppercase tracking-wider text-sm"
              >
                Voir plus
              </button>
            </div>
            <p className="text-gray-500 text-sm">
              Profils d'exemple - Créez un compte pour découvrir de vrais artistes
            </p>
          </div>

          {/* Separator Line */}
          <div className="h-0.5 bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 mb-12"></div>
          
          {/* Dynamic Artist Cards - Masonry-like Layout */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Card 1 - Large - CLIQUABLE */}
            <div
              onClick={() => onNavigate('artists')}
              className="col-span-1 row-span-2 bg-[#1a1a1a] rounded-2xl overflow-hidden border border-gray-800 hover:border-purple-500/50 transition-all duration-300 group cursor-pointer"
            >
              <div className="h-full overflow-hidden relative">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1602026084040-78e6134b2661?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjBzaW5nZXIlMjBwZXJmb3JtZXJ8ZW58MXx8fHwxNzU5NDA4MzIyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Emma Laurent"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute top-4 right-4">
                  <ClassificationBadge classification="confirme" userType="artist" size="sm" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl text-white mb-1">Emma Laurent</h3>
                  <p className="text-purple-400 text-sm">Pop / R&B</p>
                </div>
              </div>
            </div>

            {/* Card 2 - Tall - CLIQUABLE */}
            <div
              onClick={() => onNavigate('artists')}
              className="col-span-1 row-span-2 bg-[#1a1a1a] rounded-2xl overflow-hidden border border-gray-800 hover:border-purple-500/50 transition-all duration-300 group cursor-pointer"
            >
              <div className="h-full overflow-hidden relative">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1595963202332-e837eb8e466c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYXAlMjBhcnRpc3QlMjBzdHVkaW98ZW58MXx8fHwxNzU5NDA4MzIyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Lucas Dubois"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute top-4 right-4">
                  <ClassificationBadge classification="developpement" userType="artist" size="sm" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl text-white mb-1">Lucas Dubois</h3>
                  <p className="text-purple-400 text-sm">Hip-Hop / Rap</p>
                </div>
              </div>
            </div>

            {/* Card 3 - Small - CLIQUABLE */}
            <div
              onClick={() => onNavigate('artists')}
              className="col-span-1 row-span-1 bg-[#1a1a1a] rounded-2xl overflow-hidden border border-gray-800 hover:border-purple-500/50 transition-all duration-300 group cursor-pointer"
            >
              <div className="h-64 overflow-hidden relative">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1512153129600-528cae82b06a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpZSUyMG11c2ljaWFuJTIwZ3VpdGFyfGVufDF8fHx8MTc1OTM1ODAzNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Sophie Martin"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute top-4 right-4">
                  <ClassificationBadge classification="emergent" userType="artist" size="sm" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-lg text-white mb-1">Sophie Martin</h3>
                  <p className="text-purple-400 text-xs">Indie / Folk</p>
                </div>
              </div>
            </div>

            {/* Card 4 - Wide - CLIQUABLE */}
            <div
              onClick={() => onNavigate('artists')}
              className="col-span-1 row-span-1 bg-[#1a1a1a] rounded-2xl overflow-hidden border border-gray-800 hover:border-purple-500/50 transition-all duration-300 group cursor-pointer"
            >
              <div className="h-64 overflow-hidden relative">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1523198421516-973dc001a953?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3AlMjBhcnRpc3QlMjBzdGFnZXxlbnwxfHx8fDE3NTk0MDgzMjN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Marc Durand"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute top-4 right-4">
                  <ClassificationBadge classification="confirme" userType="artist" size="sm" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-lg text-white mb-1">Marc Durand</h3>
                  <p className="text-purple-400 text-xs">Électro / House</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Planning Section */}
      <section className="py-20 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 via-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="bg-gradient-to-r from-cyan-400 via-purple-500 to-purple-600 bg-clip-text text-transparent">
                Planification IA Personnalisée
              </h2>
            </div>
            <p className="text-gray-600 text-lg mb-8">
              Organisez vos tournées et projets musicaux avec l'intelligence artificielle
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📝</span>
              </div>
              <h3 className="mb-2">Décrivez votre projet</h3>
              <p className="text-gray-600 text-sm">
                Expliquez en détail vos besoins : tournée, enregistrement, production...
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="mb-2">L'IA analyse vos besoins</h3>
              <p className="text-gray-600 text-sm">
                Notre intelligence artificielle trouve les meilleurs professionnels disponibles
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📅</span>
              </div>
              <h3 className="mb-2">Planning optimisé</h3>
              <p className="text-gray-600 text-sm">
                Recevez un planning complet avec dates, prix et disponibilités
              </p>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => onNavigate('ai-schedule')}
              className="bg-black text-white px-12 py-5 rounded-xl hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center space-x-3"
            >
              <Sparkles className="w-6 h-6" />
              <span>Créer mon planning intelligent</span>
            </button>
          </div>
        </div>
      </section>

      {/* Professional Categories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl mb-4 text-black">
              SERVICES
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8">
            {/* Vidéaste */}
            <div
              className="flex flex-col items-center group cursor-pointer"
              onClick={() => onNavigate('professionals', { category: 'videaste' })}
            >
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center mb-4 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <Video className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <p className="text-center text-gray-700 text-sm">Vidéaste</p>
            </div>

            {/* Média */}
            <div
              className="flex flex-col items-center group cursor-pointer"
              onClick={() => onNavigate('professionals', { category: 'media' })}
            >
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center mb-4 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <Newspaper className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <p className="text-center text-gray-700 text-sm">Média</p>
            </div>

            {/* Management */}
            <div
              className="flex flex-col items-center group cursor-pointer"
              onClick={() => onNavigate('professionals', { category: 'management' })}
            >
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center mb-4 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <Briefcase className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <p className="text-center text-gray-700 text-sm">Management</p>
            </div>

            {/* Événementiel */}
            <div
              className="flex flex-col items-center group cursor-pointer"
              onClick={() => onNavigate('professionals', { category: 'evenementiel' })}
            >
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center mb-4 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <Calendar className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <p className="text-center text-gray-700 text-sm">Événementiel</p>
            </div>

            {/* Recording Studio */}
            <div
              className="flex flex-col items-center group cursor-pointer"
              onClick={() => onNavigate('professionals', { category: 'recording_studio' })}
            >
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center mb-4 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <Headphones className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <p className="text-center text-gray-700 text-sm">Recording Studio</p>
            </div>

            {/* Mixage/Mastering */}
            <div
              className="flex flex-col items-center group cursor-pointer"
              onClick={() => onNavigate('professionals', { category: 'mixage_mastering' })}
            >
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center mb-4 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <Settings className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <p className="text-center text-gray-700 text-sm">Mixage/Mastering</p>
            </div>

            {/* Photographe */}
            <div
              className="flex flex-col items-center group cursor-pointer"
              onClick={() => onNavigate('professionals', { category: 'photographe' })}
            >
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center mb-4 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <Camera className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <p className="text-center text-gray-700 text-sm">Photographe</p>
            </div>

            {/* Ghost Writer */}
            <div
              className="flex flex-col items-center group cursor-pointer"
              onClick={() => onNavigate('professionals', { category: 'ghost_writer' })}
            >
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center mb-4 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <PenTool className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <p className="text-center text-gray-700 text-sm">Ghost Writer</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-black via-gray-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-violet-600/20 to-purple-600/20"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white relative z-10">
          <h2 className="text-3xl mb-6">
            Prêt à transformer votre carrière musicale ?
          </h2>
          <p className="text-2xl mb-8 text-gray-300">
            Rejoignez Opportunity dès aujourd'hui pour seulement 5,99 €/an
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-10 text-left max-w-3xl mx-auto">
            {/* Pour les Artistes */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl mb-4 text-cyan-400 flex items-center">
                <Music className="w-6 h-6 mr-2" />
                Pour les Artistes
              </h3>
              <ul className="space-y-3 text-gray-200">
                <li className="flex items-start">
                  <span className="text-cyan-400 mr-2">✓</span>
                  <span>Exposez votre profil musical auprès des professionnels</span>
                </li>
                <li className="flex items-start">
                  <span className="text-cyan-400 mr-2">✓</span>
                  <span>Obtenez une classification qui facilite les collaborations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-cyan-400 mr-2">✓</span>
                  <span>Contactez des pros qui matchent avec votre univers</span>
                </li>
              </ul>
            </div>

            {/* Pour les Professionnels */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl mb-4 text-purple-400 flex items-center">
                <Briefcase className="w-6 h-6 mr-2" />
                Pour les Professionnels
              </h3>
              <ul className="space-y-3 text-gray-200">
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">✓</span>
                  <span>Exposez votre portfolio et services auprès des artistes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">✓</span>
                  <span>Développez votre réseau professionnel dans la musique</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">✓</span>
                  <span>Contactez directement les artistes pour collaborer</span>
                </li>
              </ul>
            </div>
          </div>

          <button
            onClick={() => onNavigate('signup')}
            className="bg-black text-white px-12 py-5 rounded-xl hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            S'inscrire maintenant
          </button>
        </div>
      </section>
    </div>
  );
}
