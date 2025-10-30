import { useState } from 'react';
import { ClipboardList, CheckCircle } from 'lucide-react';
import { api } from '../utils/api';

interface QuestionnairePageProps {
  currentUser: any;
  onNavigate: (page: string) => void;
  onComplete: () => void;
}

export function QuestionnairePage({
  currentUser,
  onNavigate,
  onComplete,
}: QuestionnairePageProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<any>({
    // Collaboration questionnaire
    ambitions: '',
    personality: '',
    artisticUniverse: '',
    productivity: '',
    collaborationStyle: [] as string[],
    musicalTastes: '',
    designStyles: '',
    musicGenre: '',
    
    // Classification questionnaire
    experience: '',
    platformPresence: false,
    fanbaseSize: '',
    projectsCompleted: '',
    clientsReferences: '',
    
    // Musical links
    spotifyLink: '',
    youtubeLink: '',
    soundcloudLink: '',
    appleMusicLink: '',
    deezerLink: '',
    otherLink: '',
  });

  const updateAnswer = (field: string, value: any) => {
    setAnswers({ ...answers, [field]: value });
  };

  const toggleCollaborationStyle = (style: string) => {
    const current = answers.collaborationStyle || [];
    if (current.includes(style)) {
      updateAnswer('collaborationStyle', current.filter((s: string) => s !== style));
    } else {
      updateAnswer('collaborationStyle', [...current, style]);
    }
  };

  const calculateClassification = () => {
    if (currentUser.userType === 'artist') {
      if (answers.experience === '1-3') return 'emergent';
      if (answers.experience === '3-5') return 'developpement';
      if (answers.experience === '5+') return 'confirme';
    } else {
      if (answers.experience === 'debutant') return 'debutant';
      if (answers.experience === 'intermediaire') return 'intermediaire';
      if (answers.experience === 'expert') return 'expert';
    }
    return null;
  };

  const handleSubmit = async () => {
    const classification = calculateClassification();
    
    try {
      setLoading(true);
      await api.submitQuestionnaire(currentUser.id, {
        ...answers,
        classification,
      });
      alert('Questionnaire soumis avec succès !');
      onComplete();
      onNavigate('profile');
    } catch (error: any) {
      console.error('Questionnaire submission error:', error);
      alert('Erreur lors de la soumission : ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl mb-4">Questionnaire de Collaboration</h2>

      <div>
        <label className="block mb-2">Quelles sont vos ambitions artistiques ?</label>
        <textarea
          value={answers.ambitions}
          onChange={(e) => updateAnswer('ambitions', e.target.value)}
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Décrivez vos objectifs et aspirations..."
        />
      </div>

      <div>
        <label className="block mb-2">Comment décririez-vous votre personnalité ?</label>
        <textarea
          value={answers.personality}
          onChange={(e) => updateAnswer('personality', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Vos traits de caractère, votre façon de travailler..."
        />
      </div>

      <div>
        <label className="block mb-2">Décrivez votre univers artistique</label>
        <textarea
          value={answers.artisticUniverse}
          onChange={(e) => updateAnswer('artisticUniverse', e.target.value)}
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Votre style, vos influences, votre identité artistique..."
        />
      </div>

      <div>
        <label className="block mb-2">Niveau de productivité (projets par an)</label>
        <select
          value={answers.productivity}
          onChange={(e) => updateAnswer('productivity', e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="">Sélectionner</option>
          <option value="1-2">1-2 projets</option>
          <option value="3-5">3-5 projets</option>
          <option value="5-10">5-10 projets</option>
          <option value="10+">Plus de 10 projets</option>
        </select>
      </div>

      <div>
        <label className="block mb-2">
          Style de collaboration recherché (plusieurs choix possibles)
        </label>
        <div className="space-y-2">
          {['Mode', 'Musique', 'Audiovisuel', 'Design', 'Marketing'].map((style) => (
            <label key={style} className="flex items-center">
              <input
                type="checkbox"
                checked={answers.collaborationStyle?.includes(style)}
                onChange={() => toggleCollaborationStyle(style)}
                className="mr-3 w-5 h-5 text-purple-600"
              />
              <span>{style}</span>
            </label>
          ))}
        </div>
      </div>

      {currentUser.userType === 'artist' && (
        <div>
          <label className="block mb-2">Genre musical principal</label>
          <select
            value={answers.musicGenre}
            onChange={(e) => updateAnswer('musicGenre', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
        </div>
      )}

      <div>
        <label className="block mb-2">Goûts musicaux / artistiques</label>
        <textarea
          value={answers.musicalTastes}
          onChange={(e) => updateAnswer('musicalTastes', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Genres, artistes préférés, références..."
        />
      </div>

      <div>
        <label className="block mb-2">Styles de design préférés</label>
        <textarea
          value={answers.designStyles}
          onChange={(e) => updateAnswer('designStyles', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Minimaliste, coloré, vintage, moderne..."
        />
      </div>

      <button
        onClick={() => setStep(2)}
        className="w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white px-6 py-4 rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition"
      >
        Continuer
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl mb-4">Questionnaire de Classification</h2>

      <div>
        <label className="block mb-2">Expérience professionnelle</label>
        <select
          value={answers.experience}
          onChange={(e) => updateAnswer('experience', e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="">Sélectionner</option>
          {currentUser.userType === 'artist' ? (
            <>
              <option value="1-3">1 à 3 ans</option>
              <option value="3-5">3 à 5 ans</option>
              <option value="5+">5 ans et plus</option>
            </>
          ) : (
            <>
              <option value="debutant">Débutant</option>
              <option value="intermediaire">Intermédiaire</option>
              <option value="expert">Expert</option>
            </>
          )}
        </select>
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={answers.platformPresence}
            onChange={(e) => updateAnswer('platformPresence', e.target.checked)}
            className="mr-3 w-5 h-5 text-purple-600"
          />
          <span>Présence sur les plateformes (Spotify, YouTube, etc.)</span>
        </label>
      </div>

      {/* Musical Links - Only for artists with platform presence */}
      {currentUser.userType === 'artist' && answers.platformPresence && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
          <h3 className="text-lg mb-4 text-purple-900 flex items-center">
            🎵 Liens vers vos projets musicaux
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Ajoutez les liens vers vos profils et projets pour les rendre visibles sur votre profil.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2 text-gray-700">
                <span className="inline-flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="#1DB954" viewBox="0 0 24 24"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                  Spotify
                </span>
              </label>
              <input
                type="url"
                value={answers.spotifyLink}
                onChange={(e) => updateAnswer('spotifyLink', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://open.spotify.com/artist/..."
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">
                <span className="inline-flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="#FF0000" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  YouTube
                </span>
              </label>
              <input
                type="url"
                value={answers.youtubeLink}
                onChange={(e) => updateAnswer('youtubeLink', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://youtube.com/@..."
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">
                <span className="inline-flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="#FF5500" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.949 17.277c-3.898 1.832-9.99 1.832-13.898 0-.625-.293-.625-1.562 0-1.855 3.898-1.832 9.99-1.832 13.898 0 .625.293.625 1.562 0 1.855z"/></svg>
                  SoundCloud
                </span>
              </label>
              <input
                type="url"
                value={answers.soundcloudLink}
                onChange={(e) => updateAnswer('soundcloudLink', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://soundcloud.com/..."
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">
                <span className="inline-flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="#FA243C" viewBox="0 0 24 24"><path d="M23.994 6.124c0-.738-.065-1.47-.24-2.184-.317-1.309-1.062-2.28-2.24-2.88C20.124.408 18.57.162 17.032.024 15.494-.114 13.956-.09 12.42.024c-1.538.138-3.092.384-4.482 1.036-1.178.6-1.923 1.571-2.24 2.88-.175.714-.24 1.446-.24 2.184v11.752c0 .738.065 1.47.24 2.184.317 1.309 1.062 2.28 2.24 2.88 1.39.652 2.944.898 4.482 1.036 1.536.114 3.074.138 4.612.024 1.538-.138 3.092-.384 4.482-1.036 1.178-.6 1.923-1.571 2.24-2.88.175-.714.24-1.446.24-2.184zm-3.54 11.752c-.195.625-.51 1.103-1.01 1.428-.522.34-1.11.514-1.714.605-1.04.156-2.092.182-3.138.148-1.046-.034-2.092-.108-3.124-.296-.6-.109-1.188-.283-1.714-.605-.5-.325-.815-.803-1.01-1.428-.186-.595-.24-1.208-.24-1.824V6.124c0-.616.054-1.229.24-1.824.195-.625.51-1.103 1.01-1.428.526-.322 1.114-.496 1.714-.605C10.574 2.078 11.62 2.004 12.666 1.97c1.046-.034 2.098-.008 3.138.148.604.091 1.192.265 1.714.605.5.325.815.803 1.01 1.428.186.595.24 1.208.24 1.824z"/></svg>
                  Apple Music
                </span>
              </label>
              <input
                type="url"
                value={answers.appleMusicLink}
                onChange={(e) => updateAnswer('appleMusicLink', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://music.apple.com/..."
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">
                <span className="inline-flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="#00C7F2" viewBox="0 0 24 24"><path d="M18.384 3.143c-.074.037-.148.074-.222.111a34.34 34.34 0 0 0-4.557 3.04 50.812 50.812 0 0 1-1.66 1.143c-.963.63-1.962 1.222-2.998 1.74a46.117 46.117 0 0 1-4.112 1.925c-.518.222-.999.518-1.073 1.11-.074.629.37 1.036.925 1.184.592.148 1.11.074 1.628-.148.74-.296 1.443-.666 2.109-1.11a53.867 53.867 0 0 0 4.186-2.887c.222-.148.481-.333.703-.555.555-.518 1.073-1.073 1.591-1.628.629-.703 1.258-1.443 1.887-2.183a21.54 21.54 0 0 1 2.22-2.331c.259-.222.629-.37 1.073-.296.444.074.777.37.962.777.222.518.296 1.11.111 1.665-.148.481-.333.962-.592 1.369-.777 1.258-1.591 2.479-2.442 3.663-.222.333-.481.629-.666.999-.037.074-.074.111-.111.185a.67.67 0 0 0 .037.777c.222.259.555.333.888.222.259-.074.481-.222.666-.407.74-.74 1.443-1.517 2.109-2.331.703-.851 1.406-1.702 2.072-2.59.37-.518.703-1.073.925-1.665.296-.814.185-1.554-.444-2.183-.592-.555-1.295-.666-2.035-.518a3.898 3.898 0 0 0-1.924 1.073z"/></svg>
                  Deezer
                </span>
              </label>
              <input
                type="url"
                value={answers.deezerLink}
                onChange={(e) => updateAnswer('deezerLink', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://deezer.com/..."
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">
                <span className="inline-flex items-center">
                  🔗 Autre lien (site web, Bandcamp, etc.)
                </span>
              </label>
              <input
                type="url"
                value={answers.otherLink}
                onChange={(e) => updateAnswer('otherLink', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>
      )}

      {currentUser.userType === 'artist' ? (
        <div>
          <label className="block mb-2">Taille de la fanbase</label>
          <select
            value={answers.fanbaseSize}
            onChange={(e) => updateAnswer('fanbaseSize', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Sélectionner</option>
            <option value="<100">Moins de 100</option>
            <option value="100-1000">100 - 1 000</option>
            <option value="1000-10000">1 000 - 10 000</option>
            <option value="10000+">Plus de 10 000</option>
          </select>
        </div>
      ) : (
        <>
          <div>
            <label className="block mb-2">Nombre de projets réalisés</label>
            <input
              type="number"
              value={answers.projectsCompleted}
              onChange={(e) => updateAnswer('projectsCompleted', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Ex: 25"
            />
          </div>

          <div>
            <label className="block mb-2">Clients référencés</label>
            <textarea
              value={answers.clientsReferences}
              onChange={(e) => updateAnswer('clientsReferences', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Noms de clients, projets notables..."
            />
          </div>
        </>
      )}

      <div className="bg-purple-50 p-4 rounded-lg">
        <p className="text-sm text-purple-900">
          <strong>Classification prévue :</strong>{' '}
          {calculateClassification()?.charAt(0).toUpperCase() +
            calculateClassification()?.slice(1) || 'Non déterminée'}
        </p>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => setStep(1)}
          className="flex-1 bg-gray-200 text-gray-700 px-6 py-4 rounded-lg hover:bg-gray-300 transition"
        >
          Retour
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || !answers.experience}
          className="flex-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white px-6 py-4 rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition disabled:opacity-50"
        >
          {loading ? 'Envoi...' : 'Soumettre'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl mb-2">Questionnaires Obligatoires</h1>
          <p className="text-gray-600">
            Complétez ces questionnaires pour profiter pleinement de la plateforme
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${step >= 1 ? 'text-purple-600' : 'text-gray-400'}`}>
              {step > 1 ? (
                <CheckCircle className="w-6 h-6 mr-2" />
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-current mr-2 flex items-center justify-center text-sm">
                  1
                </div>
              )}
              <span>Collaboration</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center ${step >= 2 ? 'text-purple-600' : 'text-gray-400'}`}>
              <div className="w-6 h-6 rounded-full border-2 border-current mr-2 flex items-center justify-center text-sm">
                2
              </div>
              <span>Classification</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 1 ? renderStep1() : renderStep2()}
        </div>
      </div>
    </div>
  );
}
