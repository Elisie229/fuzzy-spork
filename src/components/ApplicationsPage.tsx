import { useState, useEffect } from 'react';
import { Briefcase, CheckCircle, XCircle, MessageCircle } from 'lucide-react';
import { api } from '../utils/api';

interface ApplicationsPageProps {
  currentUser: any;
  onNavigate: (page: string, data?: any) => void;
}

export function ApplicationsPage({ currentUser, onNavigate }: ApplicationsPageProps) {
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      const response = await api.getApplications(currentUser.id);
      if (response?.applications) {
        setApplications(response.applications);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (applicationId: string, status: string) => {
    try {
      await api.updateApplicationStatus(applicationId, status);
      await loadApplications();
      alert(`Candidature ${status === 'accepted' ? 'acceptée' : 'refusée'} avec succès !`);
    } catch (error) {
      console.error('Error updating application:', error);
      alert('Erreur lors de la mise à jour de la candidature');
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des candidatures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Briefcase className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl">Mes candidatures reçues</h1>
          </div>
          <p className="text-gray-600">
            Gérez les candidatures des artistes intéressés par vos services
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-lg transition ${
              filter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Toutes ({applications.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-6 py-3 rounded-lg transition ${
              filter === 'pending'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            En attente ({applications.filter((a) => a.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('accepted')}
            className={`px-6 py-3 rounded-lg transition ${
              filter === 'accepted'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Acceptées ({applications.filter((a) => a.status === 'accepted').length})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-6 py-3 rounded-lg transition ${
              filter === 'rejected'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Refusées ({applications.filter((a) => a.status === 'rejected').length})
          </button>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucune candidature pour le moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <div
                key={application.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl">{application.applicantName}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          application.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : application.status === 'accepted'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {application.status === 'pending' && 'En attente'}
                        {application.status === 'accepted' && 'Acceptée'}
                        {application.status === 'rejected' && 'Refusée'}
                      </span>
                    </div>
                    
                    <p className="text-purple-600 mb-2">
                      Service: {application.serviceName}
                    </p>
                    
                    {application.message && (
                      <p className="text-gray-600 mb-4 whitespace-pre-line">
                        {application.message}
                      </p>
                    )}
                    
                    <p className="text-sm text-gray-500">
                      Reçue le {new Date(application.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() =>
                        onNavigate('profile-view', { userId: application.applicantId })
                      }
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                    >
                      Voir profil
                    </button>
                    
                    <button
                      onClick={() =>
                        onNavigate('messages', { selectedUserId: application.applicantId })
                      }
                      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition text-sm flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Contacter
                    </button>

                    {application.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(application.id, 'accepted')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Accepter
                        </button>
                        <button
                          onClick={() => handleStatusChange(application.id, 'rejected')}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Refuser
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}