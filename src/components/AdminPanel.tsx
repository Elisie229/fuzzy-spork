import { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, Users, Settings, TrendingUp, DollarSign, UserCheck, ShoppingBag, BarChart3, Mail, Link, Edit, Filter, Search } from 'lucide-react';
import { api } from '../utils/api';
import { ClassificationBadge } from './ClassificationBadge';
import { ServerNotAvailableGuide } from './ServerNotAvailableGuide';

interface AdminPanelProps {
  currentUser: any;
  onNavigate: (page: string) => void;
}

export function AdminPanel({ currentUser, onNavigate }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'slots' | 'appointments' | 'orders'>('dashboard');
  const [slots, setSlots] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [premiumPurchases, setPremiumPurchases] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlot, setNewSlot] = useState({
    type: 'rdv1_1',
    dateTime: '',
    maxCapacity: 16,
    visioLink: '',
  });
  const [emailSending, setEmailSending] = useState<Record<string, boolean>>({});
  const [appointmentSearch, setAppointmentSearch] = useState('');
  const [appointmentFilter, setAppointmentFilter] = useState<'all' | string>('all');

  // Message d'erreur serveur
  const [serverError, setServerError] = useState<string | null>(null);
  const [showServerGuide, setShowServerGuide] = useState(false);

  // Vérifier les droits admin
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🔒</span>
          </div>
          <h1 className="text-2xl mb-2">Accès refusé</h1>
          <p className="text-gray-600 mb-6">
            Cette page est réservée aux administrateurs.
          </p>
          <button
            onClick={() => onNavigate('home')}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const initAdmin = async () => {
      // Test server connectivity first
      await testServerConnection();
      // Only load data if server is available
      if (!serverError) {
        loadData();
      }
    };
    initAdmin();
  }, [activeTab]);

  const testServerConnection = async () => {
    try {
      const projectId = 'pwmxkcijsrykjvxnzxnt';
      const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-b90be4d1`;
      
      console.log('[Admin] Testing server connection...');
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[Admin] ✅ Server health check passed:', data);
        setServerError(null);
      } else {
        console.error('[Admin] ❌ Server health check failed:', response.status, response.statusText);
        setServerError(`Serveur non accessible (HTTP ${response.status})`);
      }
    } catch (error: any) {
      console.error('[Admin] ❌ Server is not reachable:', error?.message);
      console.error('[Admin] This usually means:');
      console.error('  1. Edge Functions are not deployed');
      console.error('  2. Edge Functions are still starting up (wait 30s)');
      console.error('  3. There is a network connectivity issue');
      setServerError('Serveur non disponible - Edge Functions non déployées');
      // Auto-show guide after 2 seconds
      setTimeout(() => setShowServerGuide(true), 2000);
    }
  };

  const checkAndFixAdminStatus = async () => {
    try {
      console.log('[Admin] Checking admin status...');
      
      // First check if user is admin
      const statusCheck = await api.checkAdmin();
      console.log('[Admin] Current admin status:', statusCheck);

      if (statusCheck.isAdmin) {
        alert(`✅ Vous êtes déjà admin !\n\nUser ID: ${statusCheck.userId}\nEmail: ${statusCheck.userEmail}\nRole: ${statusCheck.role}`);
        setServerError(null);
        // Reload data
        loadData();
      } else {
        const shouldFix = confirm(
          `❌ Vous n'êtes PAS admin\n\n` +
          `User ID: ${statusCheck.userId}\n` +
          `Email: ${statusCheck.userEmail}\n` +
          `Role actuel: ${statusCheck.role}\n\n` +
          `Voulez-vous vous promouvoir admin ?`
        );

        if (shouldFix) {
          console.log('[Admin] Promoting user to admin...');
          const result = await api.makeAdmin();
          console.log('[Admin] Promotion result:', result);
          
          if (result.success) {
            alert(`✅ Succès !\n\nVous êtes maintenant admin.\n\nRafraîchissement de la page...`);
            window.location.reload();
          } else {
            alert(`❌ Échec : ${result.error || 'Erreur inconnue'}`);
          }
        }
      }
    } catch (error: any) {
      console.error('[Admin] Error checking/fixing admin status:', error);
      alert(`❌ Erreur : ${error?.message || 'Impossible de vérifier le statut admin'}`);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('[Admin] Loading data for tab:', activeTab);
      
      if (activeTab === 'dashboard') {
        const [ordersData, purchasesData, usersData, appointmentsData] = await Promise.all([
          api.getAllOrders(),
          api.getAllPremiumPurchases(),
          api.getAllUsers(),
          api.getAllAppointments(),
        ]);
        setOrders(ordersData.orders || []);
        setPremiumPurchases(purchasesData.purchases || []);
        setUsers(usersData.users || []);
        setAppointments(appointmentsData.appointments || []);
      } else if (activeTab === 'users') {
        const data = await api.getAllUsers();
        console.log('[Admin] Users loaded:', data.users?.length || 0);
        setUsers(data.users || []);
      } else if (activeTab === 'slots') {
        const data = await api.getAllSlots();
        console.log('[Admin] Slots loaded:', data.slots?.length || 0, data.slots);
        setSlots(data.slots || []);
      } else if (activeTab === 'appointments') {
        const [appointmentsData, slotsData] = await Promise.all([
          api.getAllAppointments(),
          api.getAllSlots(),
        ]);
        console.log('[Admin] Appointments loaded:', appointmentsData.appointments?.length || 0);
        console.log('[Admin] Slots loaded:', slotsData.slots?.length || 0);
        setAppointments(appointmentsData.appointments || []);
        setSlots(slotsData.slots || []);
      } else if (activeTab === 'orders') {
        const [ordersData, purchasesData] = await Promise.all([
          api.getAllOrders(),
          api.getAllPremiumPurchases(),
        ]);
        setOrders(ordersData.orders || []);
        setPremiumPurchases(purchasesData.purchases || []);
      }
    } catch (error: any) {
      console.error('[Admin] Error loading admin data:', error);
      
      let errorMessage = 'Erreur lors du chargement des données';
      
      // Check for specific HTTP status codes
      if (error?.status === 401) {
        errorMessage = '🔒 Accès non autorisé\n\n' +
          'Vous n\'avez pas le rôle "admin".\n\n' +
          'Solution :\n' +
          '1. Cliquez sur le bouton "🔧 Vérifier statut admin" ci-dessous\n' +
          '2. Acceptez la promotion à admin\n' +
          '3. Rafraîchissez la page\n\n' +
          'Erreur : ' + (error?.message || 'Unauthorized');
        setServerError('Vous n\'êtes pas admin - Cliquez sur "Vérifier statut admin"');
      } else if (error?.status === 403) {
        errorMessage = '🚫 Accès interdit\n\n' +
          'Votre compte n\'a pas les droits admin.\n\n' +
          'Contactez un administrateur pour obtenir l\'accès.';
        setServerError('Accès interdit - Droits admin requis');
      } else if (error?.message?.includes('Impossible de se connecter au serveur')) {
        errorMessage = '⚠️ Serveur non disponible\n\n' +
          'Les Edge Functions Supabase ne sont pas accessibles.\n\n' +
          'Solutions :\n' +
          '1. Vérifiez que les Edge Functions sont déployées sur Supabase\n' +
          '2. Exécutez : supabase functions deploy server\n' +
          '3. Vérifiez les variables d\'environnement dans Supabase Dashboard\n\n' +
          'En développement local, assurez-vous que Supabase CLI est démarré.';
        setServerError('Serveur non disponible - Edge Functions non déployées');
      } else {
        errorMessage += ' : ' + (error?.message || 'Erreur inconnue');
        setServerError('Erreur de chargement');
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('[Admin] Creating slot:', newSlot);
      const result = await api.createSlot(newSlot);
      console.log('[Admin] Slot created successfully:', result);
      alert('Créneau ajouté avec succès !');
      setShowAddSlot(false);
      setNewSlot({ type: 'rdv1_1', dateTime: '', maxCapacity: 16, visioLink: '' });
      
      // Recharger les données immédiatement
      await loadData();
      console.log('[Admin] Data reloaded after slot creation');
    } catch (error: any) {
      console.error('[Admin] Error creating slot:', error);
      alert('Erreur lors de l\'ajout : ' + error.message);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce créneau ?')) return;
    
    try {
      await api.deleteSlot(slotId);
      alert('Créneau supprimé');
      loadData();
    } catch (error: any) {
      alert('Erreur lors de la suppression : ' + error.message);
    }
  };

  const handleSendEmail = async (appointmentId: string, userEmail: string, userName: string, slotDateTime: string, visioLink: string, rdvType: string) => {
    if (!visioLink) {
      alert('Aucun lien de visioconférence n\'est associé à ce créneau. Veuillez d\'abord ajouter le lien dans la section "Créneaux".');
      return;
    }

    if (!confirm(`Envoyer le lien de visio à ${userName} (${userEmail}) ?`)) {
      return;
    }

    try {
      setEmailSending({ ...emailSending, [appointmentId]: true });
      await api.sendVisioEmail({
        appointmentId,
        userEmail,
        userName,
        slotDateTime,
        visioLink,
        rdvType,
      });
      alert(`Email envoyé avec succès à ${userName} !`);
    } catch (error: any) {
      alert('Erreur lors de l\'envoi : ' + error.message);
    } finally {
      setEmailSending({ ...emailSending, [appointmentId]: false });
    }
  };

  const handleSendBulkEmails = async (slotId: string) => {
    const slotAppointments = appointments.filter(apt => apt.slotId === slotId);
    
    if (slotAppointments.length === 0) {
      alert('Aucun participant pour ce créneau.');
      return;
    }

    const slot = slots.find(s => s.id === slotId);
    if (!slot || !slot.visioLink) {
      alert('Aucun lien de visioconférence n\'est associé à ce créneau.');
      return;
    }

    if (!confirm(`Envoyer le lien de visio à ${slotAppointments.length} participant(s) ?`)) {
      return;
    }

    try {
      setEmailSending({ ...emailSending, [slotId]: true });
      
      for (const apt of slotAppointments) {
        await api.sendVisioEmail({
          appointmentId: apt.id,
          userEmail: apt.userEmail,
          userName: apt.userName,
          slotDateTime: apt.slotDateTime,
          visioLink: slot.visioLink,
          rdvType: apt.type,
        });
      }
      
      alert(`Emails envoyés avec succès à ${slotAppointments.length} participant(s) !`);
    } catch (error: any) {
      alert('Erreur lors de l\'envoi : ' + error.message);
    } finally {
      setEmailSending({ ...emailSending, [slotId]: false });
    }
  };

  const handleUpdateVisioLink = async (slotId: string) => {
    const slot = slots.find(s => s.id === slotId);
    if (!slot) return;

    const newLink = prompt('Nouveau lien de visioconférence :', slot.visioLink || '');
    if (newLink === null) return; // Annulé

    try {
      await api.updateSlotVisioLink(slotId, newLink);
      alert('Lien mis à jour avec succès');
      loadData();
    } catch (error: any) {
      alert('Erreur lors de la mise à jour : ' + error.message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeLabel = (type: string) => {
    // Types pour pack complet (9 RDV)
    if (type.startsWith('rdv1_')) return `Mois 1 - RDV ${type.split('_')[1]} - ${getSubTypeLabel(type)}`;
    if (type.startsWith('rdv2_')) return `Mois 2 - RDV ${type.split('_')[1]} - ${getSubTypeLabel(type)}`;
    if (type.startsWith('rdv3_')) return `Mois 3 - RDV ${type.split('_')[1]} - ${getSubTypeLabel(type)}`;
    
    // Types classiques (3 RDV)
    switch (type) {
      case 'rdv1': return 'RDV 1 - Visio Explicative';
      case 'rdv2': return 'RDV 2 - Préparation';
      case 'rdv3': return 'RDV 3 - Récap';
      default: return type;
    }
  };

  const getSubTypeLabel = (type: string) => {
    const subType = type.split('_')[1];
    const month = type.split('_')[0];
    
    if (month === 'rdv1') {
      if (subType === '1') return 'Visio Explicative';
      if (subType === '2') return 'Préparation';
      if (subType === '3') return 'Récap';
    }
    
    if (month === 'rdv2') {
      if (subType === '1') return 'Visio Explicative (Optionnelle)';
      if (subType === '2') return 'Préparation + Tournage Émission';
      if (subType === '3') return 'Récap';
    }
    
    if (month === 'rdv3') {
      if (subType === '1') return 'Visio Explicative (Optionnelle)';
      if (subType === '2') return 'Préparation';
      if (subType === '3') return 'Récap + Collaborations Lucratives';
    }
    
    return '';
  };

  // Filtrer les appointments
  const filteredAppointments = appointments.filter(apt => {
    const matchesFilter = appointmentFilter === 'all' || apt.type.startsWith(appointmentFilter);
    const matchesSearch = !appointmentSearch || 
      apt.userName?.toLowerCase().includes(appointmentSearch.toLowerCase()) ||
      apt.userEmail?.toLowerCase().includes(appointmentSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Calculs pour le dashboard
  const totalUsers = users.length;
  const activeSubscriptions = users.filter(u => u.subscriptionStatus === 'active').length;
  const totalTransactions = orders.length + premiumPurchases.length;
  
  // Commission 1,99€ UNIQUEMENT sur services pros (PAS sur premium)
  const COMMISSION_PRO = 1.99;
  const totalProRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || o.price || 0), 0);
  const commissionRevenue = orders.length * COMMISSION_PRO;
  const premiumRevenue = premiumPurchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  const subscriptionRevenue = activeSubscriptions * 5.99;
  const totalPlatformRevenue = commissionRevenue + subscriptionRevenue;

  // Transactions récentes (dernières 10)
  const allTransactions = [
    ...orders.map(o => ({ ...o, type: 'pro', date: o.createdAt || o.date })),
    ...premiumPurchases.map(p => ({ ...p, type: 'premium', date: p.createdAt })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl mb-2 text-black flex items-center">
                <Settings className="w-10 h-10 mr-4 text-purple-600" />
                Panel Administrateur
              </h1>
              <p className="text-gray-600 text-lg">
                Gestion complète de la plateforme Opportunity
              </p>
            </div>
            <button
              onClick={() => onNavigate('home')}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl transition"
            >
              Retour
            </button>
          </div>

          {/* Server Status Warning */}
          {serverError && (
            <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-red-900 mb-2">
                    {serverError}
                  </h3>
                  <p className="text-red-700 text-sm mb-4">
                    Les Edge Functions Supabase ne sont pas accessibles. Le panel admin ne peut pas fonctionner sans elles.
                  </p>
                  <div className="bg-white rounded-lg p-4 mb-4 border border-red-200">
                    <p className="text-sm mb-2">
                      <strong>Solution rapide :</strong>
                    </p>
                    <code className="block text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">
                      supabase functions deploy server
                    </code>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={testServerConnection}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                    >
                      Retester la connexion
                    </button>
                    <button
                      onClick={checkAndFixAdminStatus}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
                    >
                      🔧 Vérifier statut admin
                    </button>
                    <a
                      href="/GUIDE_DEPLOYER_EDGE_FUNCTIONS.md"
                      target="_blank"
                      className="px-4 py-2 bg-white text-red-600 border-2 border-red-600 rounded-lg hover:bg-red-50 transition text-sm"
                    >
                      📖 Guide complet
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 mb-8">
          <div className="flex border-b-2 border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 px-6 py-4 transition whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'border-b-4 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="w-5 h-5 inline mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 px-6 py-4 transition whitespace-nowrap ${
                activeTab === 'users'
                  ? 'border-b-4 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-5 h-5 inline mr-2" />
              Utilisateurs
            </button>
            <button
              onClick={() => setActiveTab('slots')}
              className={`flex-1 px-6 py-4 transition whitespace-nowrap ${
                activeTab === 'slots'
                  ? 'border-b-4 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-5 h-5 inline mr-2" />
              Créneaux
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`flex-1 px-6 py-4 transition whitespace-nowrap ${
                activeTab === 'appointments'
                  ? 'border-b-4 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <UserCheck className="w-5 h-5 inline mr-2" />
              Rendez-vous
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 px-6 py-4 transition whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'border-b-4 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ShoppingBag className="w-5 h-5 inline mr-2" />
              Transactions
            </button>
          </div>

          <div className="p-8">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <h2 className="text-3xl text-black mb-6">📊 Vue d'ensemble</h2>

                {/* KPIs Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Total Users */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border-2 border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <Users className="w-10 h-10 text-blue-600" />
                      <span className="text-xs text-blue-600 bg-blue-200 px-3 py-1 rounded-full">Total</span>
                    </div>
                    <p className="text-4xl text-blue-900 mb-1">{totalUsers}</p>
                    <p className="text-sm text-blue-700">Utilisateurs inscrits</p>
                  </div>

                  {/* Active Subscriptions */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border-2 border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <TrendingUp className="w-10 h-10 text-green-600" />
                      <span className="text-xs text-green-600 bg-green-200 px-3 py-1 rounded-full">5,99€/an</span>
                    </div>
                    <p className="text-4xl text-green-900 mb-1">{activeSubscriptions}</p>
                    <p className="text-sm text-green-700">Abonnements actifs</p>
                  </div>

                  {/* Total Transactions */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border-2 border-purple-200">
                    <div className="flex items-center justify-between mb-3">
                      <ShoppingBag className="w-10 h-10 text-purple-600" />
                      <span className="text-xs text-purple-600 bg-purple-200 px-3 py-1 rounded-full">Total</span>
                    </div>
                    <p className="text-4xl text-purple-900 mb-1">{totalTransactions}</p>
                    <p className="text-sm text-purple-700">Transactions</p>
                  </div>

                  {/* Platform Revenue */}
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-2xl border-2 border-yellow-200">
                    <div className="flex items-center justify-between mb-3">
                      <DollarSign className="w-10 h-10 text-yellow-600" />
                      <span className="text-xs text-yellow-600 bg-yellow-200 px-3 py-1 rounded-full">Revenus</span>
                    </div>
                    <p className="text-4xl text-yellow-900 mb-1">{totalPlatformRevenue.toFixed(2)}€</p>
                    <p className="text-sm text-yellow-700">Revenus plateforme</p>
                  </div>
                </div>

                {/* Revenue Details */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-2xl border-2 border-purple-200">
                  <h3 className="text-2xl text-black mb-6 flex items-center">
                    <DollarSign className="w-8 h-8 mr-3 text-purple-600" />
                    Détail des revenus
                  </h3>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Commission Services Pros */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                      <p className="text-sm text-gray-600 mb-2">Commissions Services Pros</p>
                      <p className="text-xs text-gray-500 mb-3">{orders.length} × 1,99€</p>
                      <p className="text-3xl text-purple-600">{commissionRevenue.toFixed(2)}€</p>
                    </div>

                    {/* Subscription Revenue */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                      <p className="text-sm text-gray-600 mb-2">Abonnements annuels</p>
                      <p className="text-xs text-gray-500 mb-3">{activeSubscriptions} × 5,99€</p>
                      <p className="text-3xl text-green-600">{subscriptionRevenue.toFixed(2)}€</p>
                    </div>

                    {/* Total Platform */}
                    <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-6 rounded-xl shadow-lg text-white">
                      <p className="text-sm opacity-90 mb-2">Total Plateforme</p>
                      <p className="text-xs opacity-75 mb-3">Commission + Abonnements</p>
                      <p className="text-3xl">{totalPlatformRevenue.toFixed(2)}€</p>
                    </div>
                  </div>

                  {/* Services Info */}
                  <div className="mt-6 grid md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-md">
                      <p className="text-sm text-gray-600 mb-2">Services Premium vendus</p>
                      <p className="text-xs text-gray-500 mb-3">(Sans commission plateforme)</p>
                      <p className="text-3xl text-cyan-600">{premiumRevenue.toFixed(2)}€</p>
                      <p className="text-xs text-gray-500 mt-2">{premiumPurchases.length} vente(s)</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md">
                      <p className="text-sm text-gray-600 mb-2">Services Pros réservés</p>
                      <p className="text-xs text-gray-500 mb-3">Chiffre d'affaires total</p>
                      <p className="text-3xl text-blue-600">{totalProRevenue.toFixed(2)}€</p>
                      <p className="text-xs text-gray-500 mt-2">{orders.length} réservation(s)</p>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className="text-2xl text-black mb-4 flex items-center">
                    <TrendingUp className="w-7 h-7 mr-3 text-purple-600" />
                    Activité récente
                  </h3>

                  {loading ? (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">Chargement...</p>
                    </div>
                  ) : allTransactions.length > 0 ? (
                    <div className="space-y-3">
                      {allTransactions.map((transaction, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-xl border-2 ${
                            transaction.type === 'pro'
                              ? 'bg-blue-50 border-blue-200'
                              : 'bg-purple-50 border-purple-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-1">
                                <span className={`px-3 py-1 rounded-full text-xs ${
                                  transaction.type === 'pro'
                                    ? 'bg-blue-200 text-blue-700'
                                    : 'bg-purple-200 text-purple-700'
                                }`}>
                                  {transaction.type === 'pro' ? 'Service Pro' : 'Service Premium'}
                                </span>
                                <span className="text-xs text-gray-600">
                                  {new Date(transaction.date).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">
                                {transaction.userName || transaction.artistName || 'Client'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg text-gray-900">
                                {(transaction.totalPrice || transaction.price || transaction.totalAmount || 0).toFixed(2)}€
                              </p>
                              {transaction.type === 'pro' && (
                                <p className="text-xs text-green-600">+{COMMISSION_PRO}€ commission</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                      <p className="text-gray-500">Aucune transaction pour le moment.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <h2 className="text-2xl mb-6 text-black flex items-center">
                  <Users className="w-7 h-7 mr-3 text-purple-600" />
                  Utilisateurs inscrits ({users.length})
                </h2>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement...</p>
                  </div>
                ) : users.length > 0 ? (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-purple-300 transition"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            {user.profileImageUrl ? (
                              <img
                                src={user.profileImageUrl}
                                alt={user.name}
                                className="w-16 h-16 rounded-full object-cover border-2 border-purple-200"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">{user.userType === 'artist' ? '🎤' : '👔'}</span>
                              </div>
                            )}
                            <div>
                              <h3 className="text-xl text-black">{user.name}</h3>
                              <p className="text-sm text-gray-600">@{user.pseudo}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs ${
                              user.userType === 'artist'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-cyan-100 text-cyan-700'
                            }`}>
                              {user.userType === 'artist' ? 'Artiste' : 'Professionnel'}
                            </span>
                            {user.role === 'admin' && (
                              <span className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-700">
                                Admin
                              </span>
                            )}
                            {user.subscriptionStatus === 'active' && (
                              <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
                                Abonné
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 text-sm mb-4">
                          <div>
                            <span className="text-gray-500">Email :</span>
                            <p className="text-gray-900">{user.email}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Ville :</span>
                            <p className="text-gray-900">{user.city || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Inscription :</span>
                            <p className="text-gray-900">
                              {user.createdAt
                                ? new Date(user.createdAt).toLocaleDateString('fr-FR')
                                : 'N/A'}
                            </p>
                          </div>
                        </div>

                        {user.classification && (
                          <div className="mb-3">
                            <ClassificationBadge
                              classification={user.classification}
                              userType={user.userType}
                            />
                          </div>
                        )}

                        {user.bio && (
                          <p className="text-sm text-gray-600 italic border-l-4 border-purple-200 pl-4">
                            {user.bio}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <p className="text-gray-500">Aucun utilisateur inscrit pour le moment.</p>
                  </div>
                )}
              </div>
            )}

            {/* Slots Tab */}
            {activeTab === 'slots' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl text-black">Créneaux Disponibles ({slots.length})</h2>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => loadData()}
                      className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition flex items-center space-x-2"
                      disabled={loading}
                    >
                      <Calendar className="w-5 h-5" />
                      <span>{loading ? 'Chargement...' : 'Rafraîchir'}</span>
                    </button>
                    <button
                      onClick={() => setShowAddSlot(true)}
                      className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition flex items-center space-x-2"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Ajouter un créneau</span>
                    </button>
                  </div>
                </div>

                {showAddSlot && (
                  <div className="bg-gray-50 p-6 rounded-xl mb-6 border-2 border-gray-200">
                    <h3 className="text-xl mb-4 text-black">Nouveau Créneau</h3>
                    <form onSubmit={handleAddSlot} className="space-y-4">
                      <div>
                        <label className="block text-gray-700 mb-2">Type de RDV</label>
                        <select
                          value={newSlot.type}
                          onChange={(e) => setNewSlot({ ...newSlot, type: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                        >
                          <optgroup label="Pack Complet - Mois 1">
                            <option value="rdv1_1">RDV 1.1 - Visio Explicative</option>
                            <option value="rdv1_2">RDV 1.2 - Préparation</option>
                            <option value="rdv1_3">RDV 1.3 - Récap</option>
                          </optgroup>
                          <optgroup label="Pack Complet - Mois 2">
                            <option value="rdv2_1">RDV 2.1 - Visio Explicative (Optionnelle)</option>
                            <option value="rdv2_2">RDV 2.2 - Préparation + Tournage Émission</option>
                            <option value="rdv2_3">RDV 2.3 - Récap</option>
                          </optgroup>
                          <optgroup label="Pack Complet - Mois 3">
                            <option value="rdv3_1">RDV 3.1 - Visio Explicative (Optionnelle)</option>
                            <option value="rdv3_2">RDV 3.2 - Préparation</option>
                            <option value="rdv3_3">RDV 3.3 - Récap + Collaborations Lucratives</option>
                          </optgroup>
                          <optgroup label="Service Unique (3 RDV)">
                            <option value="rdv1">RDV 1 - Visio Explicative</option>
                            <option value="rdv2">RDV 2 - Préparation</option>
                            <option value="rdv3">RDV 3 - Récap</option>
                          </optgroup>
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">Date et heure</label>
                        <input
                          type="datetime-local"
                          value={newSlot.dateTime}
                          onChange={(e) => setNewSlot({ ...newSlot, dateTime: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">Capacité maximale</label>
                        <input
                          type="number"
                          value={newSlot.maxCapacity}
                          onChange={(e) => setNewSlot({ ...newSlot, maxCapacity: parseInt(e.target.value) })}
                          min={1}
                          max={newSlot.type.includes('1') ? 16 : 1}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                          required
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          {newSlot.type.includes('1') ? 'Visio explicative : Maximum 16 personnes' : 'Autres RDV : Individuel (1 personne)'}
                        </p>
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">
                          <Link className="w-4 h-4 inline mr-2" />
                          Lien de visioconférence
                        </label>
                        <input
                          type="url"
                          value={newSlot.visioLink}
                          onChange={(e) => setNewSlot({ ...newSlot, visioLink: e.target.value })}
                          placeholder="https://meet.google.com/... ou https://zoom.us/..."
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                        />
                        <p className="text-sm text-purple-600 mt-1">
                          💡 Le lien sera automatiquement envoyé par email aux participants
                        </p>
                      </div>

                      <div className="flex space-x-4">
                        <button
                          type="submit"
                          className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition"
                        >
                          Créer le créneau
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddSlot(false)}
                          className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-400 transition"
                        >
                          Annuler
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {slots.length > 0 ? (
                      slots.map((slot) => {
                        const slotAppointments = appointments.filter(apt => apt.slotId === slot.id);
                        return (
                          <div
                            key={slot.id}
                            className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center space-x-4 mb-2">
                                  <span className={`px-3 py-1 rounded-full text-sm ${
                                    slot.type.startsWith('rdv1') || slot.type === 'rdv1' ? 'bg-cyan-100 text-cyan-700' :
                                    slot.type.startsWith('rdv2') || slot.type === 'rdv2' ? 'bg-purple-100 text-purple-700' :
                                    'bg-blue-100 text-blue-700'
                                  }`}>
                                    {getTypeLabel(slot.type)}
                                  </span>
                                  <span className="text-sm text-gray-600">
                                    Places : {slot.spotsAvailable || slot.maxCapacity}/{slot.maxCapacity}
                                  </span>
                                </div>
                                <p className="text-gray-900 mb-2">{formatDate(slot.dateTime)}</p>
                                {slot.visioLink ? (
                                  <div className="flex items-center space-x-2">
                                    <Link className="w-4 h-4 text-green-600" />
                                    <a
                                      href={slot.visioLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-green-600 hover:underline"
                                    >
                                      {slot.visioLink.substring(0, 50)}...
                                    </a>
                                  </div>
                                ) : (
                                  <p className="text-sm text-orange-600">⚠️ Aucun lien de visio</p>
                                )}
                              </div>
                              <div className="flex space-x-2">
                                {slotAppointments.length > 0 && (
                                  <button
                                    onClick={() => handleSendBulkEmails(slot.id)}
                                    disabled={emailSending[slot.id] || !slot.visioLink}
                                    className={`px-4 py-2 rounded-lg transition flex items-center space-x-2 ${
                                      emailSending[slot.id] || !slot.visioLink
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                                    title={`Envoyer le lien à ${slotAppointments.length} participant(s)`}
                                  >
                                    <Mail className="w-4 h-4" />
                                    <span>Envoyer à tous ({slotAppointments.length})</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => handleUpdateVisioLink(slot.id)}
                                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                                  title="Modifier le lien de visio"
                                >
                                  <Edit className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSlot(slot.id)}
                                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                                  title="Supprimer ce créneau"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        Aucun créneau créé. Cliquez sur "Ajouter un créneau" pour commencer.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Appointments Tab */}
            {activeTab === 'appointments' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl mb-4 text-black">Rendez-vous Réservés</h2>
                  
                  {/* Filters */}
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="relative">
                      <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rechercher par nom ou email..."
                        value={appointmentSearch}
                        onChange={(e) => setAppointmentSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                    <div className="relative">
                      <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <select
                        value={appointmentFilter}
                        onChange={(e) => setAppointmentFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none appearance-none"
                      >
                        <option value="all">Tous les types de RDV</option>
                        <option value="rdv1">Mois 1</option>
                        <option value="rdv2">Mois 2</option>
                        <option value="rdv3">Mois 3</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <UserCheck className="w-5 h-5 text-purple-600" />
                      <span className="text-sm text-gray-700">
                        {filteredAppointments.length} rendez-vous {appointmentSearch || appointmentFilter !== 'all' ? 'filtrés' : 'au total'}
                      </span>
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAppointments.length > 0 ? (
                      filteredAppointments.map((apt) => {
                        const slot = slots.find(s => s.id === apt.slotId);
                        return (
                          <div
                            key={apt.id}
                            className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className={`px-3 py-1 rounded-full text-sm ${
                                apt.type.startsWith('rdv1') || apt.type === 'rdv1' ? 'bg-cyan-100 text-cyan-700' :
                                apt.type.startsWith('rdv2') || apt.type === 'rdv2' ? 'bg-purple-100 text-purple-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {getTypeLabel(apt.type)}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-sm ${
                                apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {apt.status === 'confirmed' ? 'Confirmé' : apt.status === 'cancelled' ? 'Annulé' : 'En attente'}
                              </span>
                            </div>
                            <div className="grid md:grid-cols-3 gap-4 text-sm mb-4">
                              <div>
                                <span className="text-gray-500">Artiste :</span>
                                <p className="text-gray-900">{apt.userName || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Email :</span>
                                <p className="text-gray-900">{apt.userEmail || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Date du RDV :</span>
                                <p className="text-gray-900">{formatDate(apt.slotDateTime)}</p>
                              </div>
                            </div>
                            {slot?.visioLink && (
                              <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
                                <div className="flex items-center space-x-2 flex-1">
                                  <Link className="w-4 h-4 text-green-600" />
                                  <a
                                    href={slot.visioLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-green-600 hover:underline truncate"
                                  >
                                    {slot.visioLink}
                                  </a>
                                </div>
                                <button
                                  onClick={() => handleSendEmail(apt.id, apt.userEmail, apt.userName, apt.slotDateTime, slot.visioLink, apt.type)}
                                  disabled={emailSending[apt.id]}
                                  className={`ml-4 px-4 py-2 rounded-lg transition flex items-center space-x-2 whitespace-nowrap ${
                                    emailSending[apt.id]
                                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                      : 'bg-purple-600 text-white hover:bg-purple-700'
                                  }`}
                                >
                                  {emailSending[apt.id] ? (
                                    <>
                                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                      <span>Envoi...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Mail className="w-4 h-4" />
                                      <span>Envoyer lien</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            )}
                            {!slot?.visioLink && (
                              <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                                <p className="text-sm text-orange-700">
                                  ⚠️ Aucun lien de visio associé à ce créneau. Ajoutez-le dans l'onglet "Créneaux".
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        {appointmentSearch || appointmentFilter !== 'all' 
                          ? 'Aucun rendez-vous ne correspond à vos critères.'
                          : 'Aucun rendez-vous réservé pour le moment.'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab - Inchangé */}
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-2xl mb-6 text-black">Commandes & Achats</h2>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement...</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Services Premium */}
                    <div>
                      <h3 className="text-xl mb-4 text-black flex items-center">
                        <span className="w-2 h-2 bg-purple-600 rounded-full mr-3"></span>
                        Services Premium (50€, 100€ ou 150€)
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 italic">
                        ℹ️ Aucune commission prélevée sur les services premium
                      </p>
                      {premiumPurchases.length > 0 ? (
                        <div className="space-y-4">
                          {premiumPurchases.map((purchase) => (
                            <div
                              key={purchase.id}
                              className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200"
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm">
                                    {purchase.serviceIds?.length || 0} service{(purchase.serviceIds?.length || 0) > 1 ? 's' : ''}
                                  </span>
                                  <p className="mt-2 text-2xl text-purple-900">
                                    {purchase.totalAmount}€
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-gray-600">
                                    {new Date(purchase.createdAt).toLocaleDateString('fr-FR', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                    })}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {new Date(purchase.createdAt).toLocaleTimeString('fr-FR', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className="grid md:grid-cols-3 gap-4 text-sm border-t border-purple-200 pt-4">
                                <div>
                                  <span className="text-gray-500">Artiste :</span>
                                  <p className="text-gray-900">{purchase.userName || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Email :</span>
                                  <p className="text-gray-900">{purchase.userEmail || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Services :</span>
                                  <p className="text-gray-900">
                                    {purchase.serviceIds?.join(', ') || 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                          <p className="text-gray-500">Aucun service premium acheté pour le moment.</p>
                        </div>
                      )}
                    </div>

                    {/* Services Pros */}
                    <div>
                      <h3 className="text-xl mb-4 text-black flex items-center">
                        <span className="w-2 h-2 bg-cyan-600 rounded-full mr-3"></span>
                        Réservations de Services Professionnels
                      </h3>
                      <p className="text-sm text-green-600 mb-4 italic">
                        💰 Commission plateforme : 1,99€ par réservation
                      </p>
                      {orders.length > 0 ? (
                        <div className="space-y-4">
                          {orders.map((order) => (
                            <div
                              key={order.id}
                              className="bg-cyan-50 p-6 rounded-xl border-2 border-cyan-200"
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <span className="px-3 py-1 bg-cyan-600 text-white rounded-full text-sm">
                                    {order.serviceName || 'Service Pro'}
                                  </span>
                                  <p className="mt-2 text-2xl text-cyan-900">
                                    {(order.totalPrice || order.price || 0).toFixed(2)}€
                                  </p>
                                  <p className="text-xs text-green-600 mt-1">
                                    +{COMMISSION_PRO}€ commission plateforme
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-gray-600">
                                    {new Date(order.createdAt || order.date).toLocaleDateString('fr-FR', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className="grid md:grid-cols-2 gap-4 text-sm border-t border-cyan-200 pt-4">
                                <div>
                                  <span className="text-gray-500">Artiste :</span>
                                  <p className="text-gray-900">{order.artistName || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Professionnel :</span>
                                  <p className="text-gray-900">{order.proName || 'N/A'}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                          <p className="text-gray-500">Aucune réservation de service pro pour le moment.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
