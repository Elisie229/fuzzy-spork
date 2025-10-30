#!/bin/bash

# 🚀 Script de déploiement des Edge Functions Supabase
# Ce script déploie automatiquement les Edge Functions nécessaires pour Opportunity

echo "🚀 Déploiement des Edge Functions Supabase pour Opportunity"
echo "============================================================"
echo ""

# Vérifier si Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI n'est pas installé."
    echo ""
    echo "Installation automatique..."
    npm install -g supabase
    
    if [ $? -ne 0 ]; then
        echo "❌ Échec de l'installation. Installez manuellement avec :"
        echo "   npm install -g supabase"
        exit 1
    fi
    echo "✅ Supabase CLI installé avec succès"
fi

# Vérifier la connexion
echo ""
echo "📡 Vérification de la connexion Supabase..."

if ! supabase projects list &> /dev/null; then
    echo "⚠️  Vous n'êtes pas connecté à Supabase."
    echo ""
    echo "Connexion en cours..."
    supabase login
    
    if [ $? -ne 0 ]; then
        echo "❌ Échec de la connexion. Veuillez vous connecter manuellement avec :"
        echo "   supabase login"
        exit 1
    fi
fi

echo "✅ Connecté à Supabase"

# Lier le projet
PROJECT_REF="pwmxkcijsrykjvxnzxnt"
echo ""
echo "🔗 Liaison au projet $PROJECT_REF..."

supabase link --project-ref $PROJECT_REF

if [ $? -ne 0 ]; then
    echo "⚠️  Échec de la liaison. Le projet est peut-être déjà lié."
fi

# Configurer les secrets (optionnel - commenté par défaut)
echo ""
echo "🔑 Configuration des secrets..."
echo "⚠️  Note: Assurez-vous que les secrets suivants sont configurés :"
echo "   - SUPABASE_URL"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo "   - SUPABASE_ANON_KEY"
echo "   - SUPABASE_DB_URL"
echo ""
echo "Pour configurer les secrets, utilisez :"
echo "   supabase secrets set NOM_SECRET=valeur"
echo ""
read -p "Les secrets sont-ils déjà configurés ? (o/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Oo]$ ]]; then
    echo "⚠️  Veuillez configurer les secrets avant de continuer."
    echo "   Allez dans : https://supabase.com/dashboard/project/$PROJECT_REF/settings/functions"
    echo "   Ou utilisez : supabase secrets set NOM_SECRET=valeur"
    exit 1
fi

# Déployer la fonction
echo ""
echo "📦 Déploiement de la fonction 'server'..."

supabase functions deploy server

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Échec du déploiement."
    echo ""
    echo "Vérifications à faire :"
    echo "  1. Le dossier /supabase/functions/server/ existe"
    echo "  2. Le fichier index.tsx est présent"
    echo "  3. Vous avez les droits nécessaires"
    exit 1
fi

echo ""
echo "✅ Fonction déployée avec succès !"

# Test de la fonction
echo ""
echo "🧪 Test de la fonction..."

FUNCTION_URL="https://$PROJECT_REF.supabase.co/functions/v1/make-server-b90be4d1/health"
echo "   URL: $FUNCTION_URL"

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $FUNCTION_URL)

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ La fonction répond correctement (HTTP $HTTP_STATUS)"
    
    # Afficher la réponse
    echo ""
    echo "Réponse du serveur :"
    curl -s $FUNCTION_URL | python3 -m json.tool || curl -s $FUNCTION_URL
else
    echo "⚠️  La fonction ne répond pas correctement (HTTP $HTTP_STATUS)"
    echo ""
    echo "Attendez 30 secondes (cold start) et testez à nouveau avec :"
    echo "   curl $FUNCTION_URL"
fi

# Afficher les logs
echo ""
echo "📊 Logs récents de la fonction :"
supabase functions logs server --limit 10

echo ""
echo "============================================================"
echo "🎉 Déploiement terminé !"
echo ""
echo "Prochaines étapes :"
echo "  1. Rafraîchissez votre application web"
echo "  2. Allez dans le panel admin"
echo "  3. Essayez de créer un créneau"
echo ""
echo "Pour voir les logs en temps réel :"
echo "   supabase functions logs server --follow"
echo ""
echo "Pour déployer à nouveau :"
echo "   supabase functions deploy server"
echo ""
