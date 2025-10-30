import { Menu, X, User, MessageSquare, Calendar, LogOut, Briefcase, Sparkles, Settings } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  currentUser: any | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function Header({ currentUser, onNavigate, onLogout }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-2 group"
          >
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
              <span className="text-white">O</span>
            </div>
            <span className="text-xl text-black">Opportunity</span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => onNavigate('home')}
              className="text-gray-700 hover:text-purple-600 transition"
            >
              Accueil
            </button>
            <button
              onClick={() => onNavigate('search')}
              className="text-gray-700 hover:text-purple-600 transition"
            >
              Recherche
            </button>
            <button
              onClick={() => onNavigate('services')}
              className="text-gray-700 hover:text-purple-600 transition"
            >
              Services Premium
            </button>
            {currentUser && (
              <>
                <button
                  onClick={() => onNavigate('ai-schedule')}
                  className="text-gray-700 hover:text-purple-600 transition flex items-center space-x-1"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Planning IA</span>
                </button>
                <button
                  onClick={() => onNavigate('messages')}
                  className="text-gray-700 hover:text-purple-600 transition flex items-center space-x-1"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Messages</span>
                </button>
                <button
                  onClick={() => onNavigate('calendar')}
                  className="text-gray-700 hover:text-purple-600 transition flex items-center space-x-1"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Calendrier</span>
                </button>
                {currentUser.userType === 'pro' && (
                  <button
                    onClick={() => onNavigate('applications')}
                    className="text-gray-700 hover:text-purple-600 transition flex items-center space-x-1"
                  >
                    <Briefcase className="w-5 h-5" />
                    <span>Candidatures</span>
                  </button>
                )}
                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => onNavigate('admin')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition flex items-center space-x-1"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Admin</span>
                  </button>
                )}
              </>
            )}
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <>
                <button
                  onClick={() => onNavigate('profile')}
                  className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition"
                >
                  <User className="w-5 h-5" />
                  <span>{currentUser.name}</span>
                </button>
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('login')}
                  className="text-gray-700 hover:text-purple-600 transition"
                >
                  Connexion
                </button>
                <button
                  onClick={() => onNavigate('signup')}
                  className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-all duration-300"
                >
                  S'inscrire
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-700"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => {
                  onNavigate('home');
                  setMobileMenuOpen(false);
                }}
                className="text-left text-gray-700 hover:text-purple-600 transition"
              >
                Accueil
              </button>
              <button
                onClick={() => {
                  onNavigate('search');
                  setMobileMenuOpen(false);
                }}
                className="text-left text-gray-700 hover:text-purple-600 transition"
              >
                Recherche
              </button>
              <button
                onClick={() => {
                  onNavigate('services');
                  setMobileMenuOpen(false);
                }}
                className="text-left text-gray-700 hover:text-purple-600 transition"
              >
                Services Premium
              </button>
              {currentUser && (
                <>
                  <button
                    onClick={() => {
                      onNavigate('ai-schedule');
                      setMobileMenuOpen(false);
                    }}
                    className="text-left text-gray-700 hover:text-purple-600 transition"
                  >
                    Planning IA
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('messages');
                      setMobileMenuOpen(false);
                    }}
                    className="text-left text-gray-700 hover:text-purple-600 transition"
                  >
                    Messages
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('calendar');
                      setMobileMenuOpen(false);
                    }}
                    className="text-left text-gray-700 hover:text-purple-600 transition"
                  >
                    Calendrier
                  </button>
                  {currentUser.userType === 'pro' && (
                    <button
                      onClick={() => {
                        onNavigate('applications');
                        setMobileMenuOpen(false);
                      }}
                      className="text-left text-gray-700 hover:text-purple-600 transition"
                    >
                      Candidatures
                    </button>
                  )}
                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => {
                        onNavigate('admin');
                        setMobileMenuOpen(false);
                      }}
                      className="text-left bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg"
                    >
                      🔑 Admin
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onNavigate('profile');
                      setMobileMenuOpen(false);
                    }}
                    className="text-left text-gray-700 hover:text-purple-600 transition"
                  >
                    Mon Profil
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-left text-red-600 hover:text-red-700 transition"
                  >
                    Déconnexion
                  </button>
                </>
              )}
              {!currentUser && (
                <>
                  <button
                    onClick={() => {
                      onNavigate('login');
                      setMobileMenuOpen(false);
                    }}
                    className="text-left text-gray-700 hover:text-purple-600 transition"
                  >
                    Connexion
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('signup');
                      setMobileMenuOpen(false);
                    }}
                    className="text-left bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-all duration-300"
                  >
                    S'inscrire
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
