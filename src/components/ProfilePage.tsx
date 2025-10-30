import { useState, useEffect } from 'react';
import { useRef } from 'react';
import {
  User,
  Mail,
  MapPin,
  Link as LinkIcon,
  Edit,
  Save,
  Award,
  Youtube,
  Music as MusicIcon,
  MessageCircle,
  ShoppingCart,
  Check,
} from 'lucide-react';
import { api } from '../utils/api';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ClassificationBadge } from './ClassificationBadge';
import { ServiceEditor } from './ServiceEditor';
import { StripeConnectOnboarding } from './StripeConnectOnboarding';
import { AvailabilityEditor } from './AvailabilityEditor';

interface ProfilePageProps {
  userId: string;
  currentUser: any;
  isOwnProfile: boolean;
  onNavigate: (page: string, data?: any) => void;
}

export function ProfilePage({
  userId,
  currentUser,
  isOwnProfile,
  onNavigate,
}: ProfilePageProps) {
  const [profile, setProfile] = useState<any>(null);
  const [questionnaire, setQuestionnaire] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<any>({});
  const [showServiceEditor, setShowServiceEditor] = useState(false);
  const [showAvailabilityEditor, setShowAvailabilityEditor] = useState(false);
  const loadedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (userId && userId !== loadedUserIdRef.current) {
      loadedUserIdRef.current = userId;
      loadProfile();
    }
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await api.getProfile(userId);
      setProfile(response.profile);
      setQuestionnaire(response.questionnaire);
      setEditedProfile(response.profile);
    } catch (error: any) {
      console.error('Error loading profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.updateProfile(userId, editedProfile);
      setProfile(editedProfile);
      setEditing(false);
      alert('Profil mis à jour avec succès !');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert('Erreur lors de la mise à jour : ' + error.message);
    }
  };

  const handleContact = () => {
    const initialMessage = `Bonjour ${profile.name}, je serais intéressé(e) par une collaboration. Pourriez-vous me donner plus d'informations ?`;
    onNavigate('messages', {
      selectedUserId: profile.id,
      initialMessage,
    });
  };

  const handleServiceSubscribe = async (service: any) => {
    if (!currentUser) {
      alert('Veuillez vous connecter pour souscrire à ce service');
      onNavigate('login');
      return;
    }

    // Rediriger vers la page de réservation avec le service sélectionné
    onNavigate('pro-service-booking', {
      proUser: profile,
      service: service
    });
  };

  const handleSaveServices = async (services: any[]) => {
    try {
      await api.updateProfile(userId, { ...profile, services });
      setProfile({ ...profile, services });
      setEditedProfile({ ...editedProfile, services });
      setShowServiceEditor(false);
      alert('Services mis à jour avec succès !');
    } catch (error: any) {
      console.error('Error updating services:', error);
      alert('Erreur lors de la mise à jour des services');
    }
  };

  const handleSaveAvailability = async (availability: string[]) => {
    try {
      await api.updateProfile(userId, { ...profile, availability });
      setProfile({ ...profile, availability });
      setEditedProfile({ ...editedProfile, availability });
      setShowAvailabilityEditor(false);
      alert('Disponibilités mises à jour avec succès !');
    } catch (error: any) {
      console.error('Error updating availability:', error);
      alert('Erreur lors de la mise à jour des disponibilités');
    }
  };

  const handleServiceApply = async (service: any) => {
    if (!currentUser) {
      alert('Veuillez vous connecter pour postuler');
      onNavigate('login');
      return;
    }

    try {
      await api.createApplication({
        proUserId: profile.id,
        applicantId: currentUser.id,
        serviceName: service.name,
        message: `Candidature pour: ${service.name}`,
      });
      
      alert('Candidature envoyée avec succès !');
      onNavigate('messages', { selectedUserId: profile.id });
    } catch (error) {
      console.error('Error applying to service:', error);
      alert('Erreur lors de l\'envoi de la candidature');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Profil non trouvé</p>
          <button onClick={() => onNavigate('home')} className="text-purple-600 hover:underline">
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="h-48 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600"></div>
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16">
              <div className="flex items-end space-x-4">
                <div className="w-32 h-32 bg-white rounded-xl shadow-lg flex items-center justify-center border-4 border-white overflow-hidden">
                  {(profile.profileImageUrl || profile.avatar) ? (
                    <ImageWithFallback
                      src={profile.profileImageUrl || profile.avatar}
                      alt={profile.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <User className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                <div className="mb-2">
                  <h1 className="text-3xl mb-1">{profile.name}</h1>
                  <p className="text-gray-600">
                    {profile.userType === 'artist' ? 'Artiste' : 'Professionnel'}
                  </p>
                </div>
              </div>

              <div className="mt-4 md:mt-0 flex gap-3">
                {isOwnProfile ? (
                  !editing ? (
                    <>
                      <button
                        onClick={() => setEditing(true)}
                        className="flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
                      >
                        <Edit className="w-5 h-5" />
                        <span>Modifier</span>
                      </button>
                      {profile.userType === 'artist' && (
                        <button
                          onClick={() => onNavigate('service-validation')}
                          className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition shadow-lg"
                        >
                          <Check className="w-5 h-5" />
                          <span>Valider mes services</span>
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSave}
                        className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
                      >
                        <Save className="w-5 h-5" />
                        <span>Enregistrer</span>
                      </button>
                      <button
                        onClick={() => {
                          setEditing(false);
                          setEditedProfile(profile);
                        }}
                        className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
                      >
                        Annuler
                      </button>
                    </div>
                  )
                ) : (
                  <button
                    onClick={handleContact}
                    className="flex items-center space-x-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Contacter</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column - Info */}
          <div className="space-y-6">
            {/* Classification Badge */}
            {profile.classification && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Award className="w-5 h-5 text-purple-600" />
                  <h2 className="text-lg">Classification</h2>
                </div>
                <div className="flex justify-center">
                  <ClassificationBadge
                    classification={profile.classification}
                    userType={profile.userType}
                    size="lg"
                    showIcon={true}
                  />
                </div>
              </div>
            )}

            {/* Contact Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg mb-4">Informations</h2>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <Mail className="w-5 h-5 mr-3" />
                  <span>{profile.email}</span>
                </div>
                
                {/* City */}
                {(editing || profile.city) && (
                  <div className="flex items-start text-gray-600">
                    <MapPin className="w-5 h-5 mr-3 mt-1" />
                    {editing ? (
                      <input
                        type="text"
                        value={editedProfile.city || ''}
                        onChange={(e) =>
                          setEditedProfile({ ...editedProfile, city: e.target.value })
                        }
                        placeholder="Ville"
                        className="flex-1 px-2 py-1 border rounded"
                      />
                    ) : (
                      <span>{profile.city}</span>
                    )}
                  </div>
                )}

                {/* Category for Pros */}
                {profile.userType === 'pro' && (editing || profile.category) && (
                  <div className="flex items-start text-gray-600">
                    <span className="mr-3 mt-1">📂</span>
                    {editing ? (
                      <select
                        value={editedProfile.category || ''}
                        onChange={(e) =>
                          setEditedProfile({ ...editedProfile, category: e.target.value })
                        }
                        className="flex-1 px-2 py-1 border rounded"
                      >
                        <option value="">Sélectionner une catégorie</option>
                        <option value="videaste">Vidéaste</option>
                        <option value="media">Média</option>
                        <option value="management">Management</option>
                        <option value="evenementiel">Événementiel</option>
                        <option value="recording_studio">Recording Studio</option>
                        <option value="mixage_mastering">Mixage/Mastering</option>
                        <option value="photographe">Photographe</option>
                        <option value="ghost_writer">Ghost Writer</option>
                      </select>
                    ) : (
                      <span>
                        {profile.category === 'videaste' && 'Vidéaste'}
                        {profile.category === 'media' && 'Média'}
                        {profile.category === 'management' && 'Management'}
                        {profile.category === 'evenementiel' && 'Événementiel'}
                        {profile.category === 'recording_studio' && 'Recording Studio'}
                        {profile.category === 'mixage_mastering' && 'Mixage/Mastering'}
                        {profile.category === 'photographe' && 'Photographe'}
                        {profile.category === 'ghost_writer' && 'Ghost Writer'}
                      </span>
                    )}
                  </div>
                )}

                {/* Music Genre for Artists */}
                {profile.userType === 'artist' && (editing || profile.musicGenre) && (
                  <div className="flex items-start text-gray-600">
                    <span className="mr-3 mt-1">🎵</span>
                    {editing ? (
                      <select
                        value={editedProfile.musicGenre || ''}
                        onChange={(e) =>
                          setEditedProfile({ ...editedProfile, musicGenre: e.target.value })
                        }
                        className="flex-1 px-2 py-1 border rounded"
                      >
                        <option value="">Sélectionner un genre</option>
                        <option value="rap_hiphop">Rap/Hip-Hop</option>
                        <option value="rnb_soul">R&B/Soul</option>
                        <option value="pop">Pop</option>
                        <option value="rock">Rock</option>
                        <option value="electro">Électro</option>
                        <option value="jazz">Jazz</option>
                        <option value="reggae_dancehall">Reggae/Dancehall</option>
                        <option value="afrobeat">Afrobeat</option>
                        <option value="variete_francaise">Variété française</option>
                        <option value="classique">Classique</option>
                        <option value="metal">Metal</option>
                        <option value="folk_acoustique">Folk/Acoustique</option>
                        <option value="autre">Autre</option>
                      </select>
                    ) : (
                      <span>
                        {profile.musicGenre === 'rap_hiphop' && 'Rap/Hip-Hop'}
                        {profile.musicGenre === 'rnb_soul' && 'R&B/Soul'}
                        {profile.musicGenre === 'pop' && 'Pop'}
                        {profile.musicGenre === 'rock' && 'Rock'}
                        {profile.musicGenre === 'electro' && 'Électro'}
                        {profile.musicGenre === 'jazz' && 'Jazz'}
                        {profile.musicGenre === 'reggae_dancehall' && 'Reggae/Dancehall'}
                        {profile.musicGenre === 'afrobeat' && 'Afrobeat'}
                        {profile.musicGenre === 'variete_francaise' && 'Variété française'}
                        {profile.musicGenre === 'classique' && 'Classique'}
                        {profile.musicGenre === 'metal' && 'Metal'}
                        {profile.musicGenre === 'folk_acoustique' && 'Folk/Acoustique'}
                        {profile.musicGenre === 'autre' && 'Autre'}
                      </span>
                    )}
                  </div>
                )}

                {/* Price per hour for Pros */}
                {profile.userType === 'pro' && (editing || profile.pricePerHour) && (
                  <div className="flex items-start text-gray-600">
                    <span className="mr-3 mt-1">💰</span>
                    {editing ? (
                      <div className="flex-1">
                        <input
                          type="number"
                          value={editedProfile.pricePerHour || ''}
                          onChange={(e) =>
                            setEditedProfile({ ...editedProfile, pricePerHour: Number(e.target.value) })
                          }
                          placeholder="Tarif horaire"
                          min="0"
                          className="w-full px-2 py-1 border rounded"
                        />
                        <p className="text-xs text-gray-500 mt-1">€/heure</p>
                      </div>
                    ) : (
                      <span>{profile.pricePerHour} €/h</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Musical Links */}
            {questionnaire && profile.userType === 'artist' && (
              questionnaire.spotifyLink ||
              questionnaire.youtubeLink ||
              questionnaire.soundcloudLink ||
              questionnaire.appleMusicLink ||
              questionnaire.deezerLink ||
              questionnaire.otherLink
            ) && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg mb-4 flex items-center">
                  <MusicIcon className="w-5 h-5 mr-2 text-purple-600" />
                  Projets Musicaux
                </h2>
                <div className="space-y-3">
                  {questionnaire.spotifyLink && (
                    <a
                      href={questionnaire.spotifyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-green-600 hover:text-green-700 hover:underline transition"
                    >
                      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                      </svg>
                      <span>Spotify</span>
                    </a>
                  )}
                  {questionnaire.youtubeLink && (
                    <a
                      href={questionnaire.youtubeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-red-600 hover:text-red-700 hover:underline transition"
                    >
                      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      <span>YouTube</span>
                    </a>
                  )}
                  {questionnaire.soundcloudLink && (
                    <a
                      href={questionnaire.soundcloudLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-orange-600 hover:text-orange-700 hover:underline transition"
                    >
                      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.949 17.277c-3.898 1.832-9.99 1.832-13.898 0-.625-.293-.625-1.562 0-1.855 3.898-1.832 9.99-1.832 13.898 0 .625.293.625 1.562 0 1.855z"/>
                      </svg>
                      <span>SoundCloud</span>
                    </a>
                  )}
                  {questionnaire.appleMusicLink && (
                    <a
                      href={questionnaire.appleMusicLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-pink-600 hover:text-pink-700 hover:underline transition"
                    >
                      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.994 6.124c0-.738-.065-1.47-.24-2.184-.317-1.309-1.062-2.28-2.24-2.88C20.124.408 18.57.162 17.032.024 15.494-.114 13.956-.09 12.42.024c-1.538.138-3.092.384-4.482 1.036-1.178.6-1.923 1.571-2.24 2.88-.175.714-.24 1.446-.24 2.184v11.752c0 .738.065 1.47.24 2.184.317 1.309 1.062 2.28 2.24 2.88 1.39.652 2.944.898 4.482 1.036 1.536.114 3.074.138 4.612.024 1.538-.138 3.092-.384 4.482-1.036 1.178-.6 1.923-1.571 2.24-2.88.175-.714.24-1.446.24-2.184zm-3.54 11.752c-.195.625-.51 1.103-1.01 1.428-.522.34-1.11.514-1.714.605-1.04.156-2.092.182-3.138.148-1.046-.034-2.092-.108-3.124-.296-.6-.109-1.188-.283-1.714-.605-.5-.325-.815-.803-1.01-1.428-.186-.595-.24-1.208-.24-1.824V6.124c0-.616.054-1.229.24-1.824.195-.625.51-1.103 1.01-1.428.526-.322 1.114-.496 1.714-.605C10.574 2.078 11.62 2.004 12.666 1.97c1.046-.034 2.098-.008 3.138.148.604.091 1.192.265 1.714.605.5.325.815.803 1.01 1.428.186.595.24 1.208.24 1.824z"/>
                      </svg>
                      <span>Apple Music</span>
                    </a>
                  )}
                  {questionnaire.deezerLink && (
                    <a
                      href={questionnaire.deezerLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-700 hover:underline transition"
                    >
                      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.384 3.143c-.074.037-.148.074-.222.111a34.34 34.34 0 0 0-4.557 3.04 50.812 50.812 0 0 1-1.66 1.143c-.963.63-1.962 1.222-2.998 1.74a46.117 46.117 0 0 1-4.112 1.925c-.518.222-.999.518-1.073 1.11-.074.629.37 1.036.925 1.184.592.148 1.11.074 1.628-.148.74-.296 1.443-.666 2.109-1.11a53.867 53.867 0 0 0 4.186-2.887c.222-.148.481-.333.703-.555.555-.518 1.073-1.073 1.591-1.628.629-.703 1.258-1.443 1.887-2.183a21.54 21.54 0 0 1 2.22-2.331c.259-.222.629-.37 1.073-.296.444.074.777.37.962.777.222.518.296 1.11.111 1.665-.148.481-.333.962-.592 1.369-.777 1.258-1.591 2.479-2.442 3.663-.222.333-.481.629-.666.999-.037.074-.074.111-.111.185a.67.67 0 0 0 .037.777c.222.259.555.333.888.222.259-.074.481-.222.666-.407.74-.74 1.443-1.517 2.109-2.331.703-.851 1.406-1.702 2.072-2.59.37-.518.703-1.073.925-1.665.296-.814.185-1.554-.444-2.183-.592-.555-1.295-.666-2.035-.518a3.898 3.898 0 0 0-1.924 1.073z"/>
                      </svg>
                      <span>Deezer</span>
                    </a>
                  )}
                  {questionnaire.otherLink && (
                    <a
                      href={questionnaire.otherLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-600 hover:text-gray-700 hover:underline transition"
                    >
                      <LinkIcon className="w-5 h-5 mr-3" />
                      <span>Autre lien</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Bio */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg mb-4">Biographie</h2>
              {editing ? (
                <textarea
                  value={editedProfile.bio || ''}
                  onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Parlez de vous..."
                />
              ) : (
                <p className="text-gray-700">
                  {profile.bio || 'Aucune biographie renseignée'}
                </p>
              )}
            </div>

            {/* Availability (for pros) */}
            {profile.userType === 'pro' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg">Disponibilités</h2>
                  {isOwnProfile && (
                    <button
                      onClick={() => setShowAvailabilityEditor(true)}
                      className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      Gérer
                    </button>
                  )}
                </div>
                
                {profile.availability && profile.availability.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      {profile.availability.length} date{profile.availability.length > 1 ? 's' : ''} disponible{profile.availability.length > 1 ? 's' : ''}
                    </p>
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                      {profile.availability
                        .map((d: string) => new Date(d))
                        .sort((a: Date, b: Date) => a.getTime() - b.getTime())
                        .slice(0, 20)
                        .map((date: Date, idx: number) => (
                          <span
                            key={idx}
                            className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full"
                          >
                            {date.toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        ))}
                      {profile.availability.length > 20 && (
                        <span className="text-xs text-gray-500 px-3 py-1">
                          ... et {profile.availability.length - 20} autres dates
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    {isOwnProfile ? 'Cliquez sur "Gérer" pour indiquer vos disponibilités' : 'Aucune disponibilité renseignée'}
                  </p>
                )}
              </div>
            )}

            {/* Services (for pros) */}
            {profile.userType === 'pro' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg">Services proposés</h2>
                  {isOwnProfile && (
                    <button
                      onClick={() => setShowServiceEditor(true)}
                      className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      Gérer
                    </button>
                  )}
                </div>
                
                {profile.services && profile.services.length > 0 ? (
                  <div className="space-y-4">
                    {profile.services.map((service: any, idx: number) => {
                      const isApplicationService = service.category === 'evenementiel' || service.category === 'media';
                      
                      const categoryLabels: { [key: string]: string } = {
                        production: 'Production',
                        studio: 'Studio',
                        management: 'Management',
                        marketing: 'Marketing',
                        evenementiel: 'Événementiel',
                        media: 'Média',
                        design: 'Design',
                        video: 'Vidéo',
                        autre: 'Autre',
                      };
                      
                      return (
                        <div
                          key={idx}
                          className="border border-gray-200 rounded-xl p-5 hover:border-purple-500/50 transition-all duration-300 hover:shadow-md"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-xl">{typeof service === 'string' ? service : service.name}</h3>
                                {typeof service === 'object' && service.category && (
                                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs">
                                    {categoryLabels[service.category] || service.category}
                                  </span>
                                )}
                              </div>
                              {typeof service === 'object' && service.description && (
                                <p className="text-gray-600 mb-3">{service.description}</p>
                              )}
                              {typeof service === 'object' && service.availability && isApplicationService && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                                  <p className="text-sm text-blue-900">
                                    <strong>📅 Disponibilité :</strong> {service.availability}
                                  </p>
                                </div>
                              )}
                            </div>
                            {typeof service === 'object' && !isApplicationService && (
                              <div className="ml-4 text-right">
                                {service.price > 0 && (
                                  <div>
                                    <p className="text-xs text-gray-500">Prix forfaitaire</p>
                                    <span className="text-2xl text-purple-600">{service.price}€</span>
                                  </div>
                                )}
                                {service.hourlyRate > 0 && (
                                  <div className={service.price > 0 ? 'mt-2' : ''}>
                                    <p className="text-xs text-gray-500">Tarif horaire</p>
                                    <span className={service.price > 0 ? 'text-lg text-purple-600' : 'text-2xl text-purple-600'}>
                                      {service.hourlyRate}€/h
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {typeof service === 'object' && service.features && service.features.length > 0 && (
                            <div className="mb-4">
                              <ul className="space-y-2">
                                {service.features.map((feature: string, fIdx: number) => (
                                  <li key={fIdx} className="flex items-start text-sm text-gray-700">
                                    <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {!isOwnProfile && typeof service === 'object' && (
                            isApplicationService ? (
                              <button
                                onClick={() => handleServiceApply(service)}
                                className="w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 flex items-center justify-center space-x-2"
                              >
                                <MessageCircle className="w-5 h-5" />
                                <span>Postuler à cette annonce</span>
                              </button>
                            ) : (service.price > 0 || service.hourlyRate > 0) ? (
                              <button
                                onClick={() => handleServiceSubscribe(service)}
                                className="w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 flex items-center justify-center space-x-2"
                              >
                                <ShoppingCart className="w-5 h-5" />
                                <span>
                                  {service.price > 0 
                                    ? `Souscrire - ${service.price}€` 
                                    : service.hourlyRate > 0 
                                    ? `Réserver - ${service.hourlyRate}€/h`
                                    : 'Réserver'}
                                </span>
                              </button>
                            ) : null
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    {isOwnProfile ? 'Cliquez sur "Gérer" pour ajouter vos services' : 'Aucun service disponible'}
                  </p>
                )}
              </div>
            )}

            {/* Stripe Connect - Payment Configuration (for pros only, own profile) */}
            {profile.userType === 'pro' && isOwnProfile && (
              <div>
                <StripeConnectOnboarding
                  currentUser={profile}
                  onNavigate={onNavigate}
                />
              </div>
            )}

            {/* Questionnaire Responses */}
            {questionnaire && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg mb-4">Profil artistique</h2>
                <div className="space-y-4">
                  {questionnaire.ambitions && (
                    <div>
                      <h3 className="text-sm text-gray-600 mb-1">Ambitions</h3>
                      <p className="text-gray-900">{questionnaire.ambitions}</p>
                    </div>
                  )}
                  {questionnaire.artisticUniverse && (
                    <div>
                      <h3 className="text-sm text-gray-600 mb-1">Univers artistique</h3>
                      <p className="text-gray-900">{questionnaire.artisticUniverse}</p>
                    </div>
                  )}
                  {questionnaire.musicalTastes && (
                    <div>
                      <h3 className="text-sm text-gray-600 mb-1">Goûts musicaux</h3>
                      <p className="text-gray-900">{questionnaire.musicalTastes}</p>
                    </div>
                  )}
                  {questionnaire.collaborationStyle &&
                    questionnaire.collaborationStyle.length > 0 && (
                      <div>
                        <h3 className="text-sm text-gray-600 mb-2">Collaborations recherchées</h3>
                        <div className="flex flex-wrap gap-2">
                          {questionnaire.collaborationStyle.map((style: string, idx: number) => (
                            <span
                              key={idx}
                              className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                            >
                              {style}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Actions */}
            {!isOwnProfile && currentUser && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg mb-4">Contacter {profile.name}</h2>
                <p className="text-gray-600 text-sm mb-4">
                  Proposez une collaboration ou discutez d'un projet ensemble
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      if (!currentUser || !currentUser.name) {
                        alert('Veuillez vous connecter pour contacter cet utilisateur');
                        return;
                      }
                      if (!profile || !profile.name) {
                        alert('Impossible de charger les informations du profil');
                        return;
                      }
                      onNavigate('messages', { 
                        selectedUserId: userId,
                        initialMessage: `Bonjour ${profile.name},\n\nJe serais intéressé(e) par une collaboration avec vous. Seriez-vous disponible pour en discuter ?\n\nCordialement,\n${currentUser.name}`
                      });
                    }}
                    className="flex-1 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                  >
                    Contacter
                  </button>
                  <button
                    onClick={() => onNavigate('pro-service-booking', { 
                      proUser: profile,
                      service: null 
                    })}
                    className="flex-1 bg-gradient-to-br from-pink-600 via-pink-700 to-rose-800 text-white px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-pink-500/50 transition-all"
                  >
                    Réserver un créneau
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Service Editor Modal */}
      {showServiceEditor && (
        <ServiceEditor
          services={profile.services || []}
          onSave={handleSaveServices}
          onClose={() => setShowServiceEditor(false)}
        />
      )}

      {/* Availability Editor Modal */}
      {showAvailabilityEditor && (
        <AvailabilityEditor
          availability={profile.availability || []}
          onSave={handleSaveAvailability}
          onClose={() => setShowAvailabilityEditor(false)}
        />
      )}
    </div>
  );
}