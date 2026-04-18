# Guide de Test - Téléchargement du Reçu de Paiement

## Prérequis

- ✅ Backend Laravel en cours d'exécution (port 8000)
- ✅ Frontend React en cours d'exécution (port 5173)
- ✅ Base de données MySQL configurée
- ✅ Compte candidat créé et vérifié

## Scénario de Test 1: Téléchargement du Reçu

### Étapes

1. **Connexion**
   - Accédez à `http://localhost:5173/login`
   - Entrez les identifiants du candidat
   - Cliquez sur "Se connecter"

2. **Sélection du Concours**
   - Accédez à `/contests-selection`
   - Sélectionnez un concours
   - Cliquez sur "Payer maintenant"

3. **Paiement**
   - Sélectionnez une méthode de paiement (Card, Orange Money, MTN Money)
   - Cliquez sur "Effectuer le paiement"
   - Attendez la confirmation

4. **Affichage du Reçu**
   - Vous devriez être redirigé vers `/payment-receipt?transaction=TXN-xxxxx`
   - Vérifiez que le reçu s'affiche avec:
     - ✅ ID Transaction
     - ✅ Date et heure
     - ✅ Statut (Complété)
     - ✅ Nom du candidat
     - ✅ Email du candidat
     - ✅ Titre du concours
     - ✅ Montant en FCFA
     - ✅ Méthode de paiement
     - ✅ QR code

5. **Téléchargement du Reçu**
   - Cliquez sur le bouton **"⬇️ Télécharger PDF"**
   - La fenêtre d'impression du navigateur devrait s'ouvrir
   - Sélectionnez **"Enregistrer en tant que PDF"** (ou "Save as PDF")
   - Choisissez le dossier de destination
   - Cliquez sur **"Enregistrer"** (ou "Save")
   - Vérifiez que le fichier est téléchargé

6. **Vérification du PDF**
   - Ouvrez le fichier PDF téléchargé
   - Vérifiez que le contenu est correct:
     - ✅ Logo SGEE
     - ✅ Titre "REÇU DE PAIEMENT"
     - ✅ Tous les détails du paiement
     - ✅ QR code visible
     - ✅ Mise en page correcte

### Résultat Attendu
✅ Le PDF est téléchargé avec succès et contient tous les détails du paiement

---

## Scénario de Test 2: Impression du Reçu

### Étapes

1. **Depuis la page de Reçu**
   - Cliquez sur le bouton **"🖨️ Imprimer"**
   - La fenêtre d'impression du navigateur devrait s'ouvrir

2. **Vérification de l'Aperçu**
   - Vérifiez que l'aperçu montre le reçu correctement
   - Vérifiez que les boutons ne sont pas visibles
   - Vérifiez que l'en-tête n'est pas visible

3. **Impression**
   - Sélectionnez une imprimante (ou "Enregistrer en tant que PDF")
   - Cliquez sur "Imprimer"
   - Vérifiez que l'impression est correcte

### Résultat Attendu
✅ Le reçu s'imprime correctement sans les boutons et en-têtes

---

## Scénario de Test 3: Vérification via QR Code

### Étapes

1. **Depuis la page de Reçu**
   - Cliquez droit sur le QR code
   - Sélectionnez "Copier le lien de l'image"

2. **Accès à la Page de Vérification**
   - Ouvrez un nouvel onglet
   - Accédez à `http://localhost:5173/payment-verification?transaction_id=TXN-xxxxx`
   - Remplacez `TXN-xxxxx` par l'ID de transaction réel

3. **Vérification de la Page**
   - Vérifiez que la page s'affiche avec:
     - ✅ Titre "✓ Paiement Vérifié"
     - ✅ Détails du paiement
     - ✅ Informations du candidat
     - ✅ Détails du concours
     - ✅ Code de vérification unique
     - ✅ Bouton "Télécharger le Reçu"

4. **Téléchargement depuis la Page de Vérification**
   - Cliquez sur **"⬇️ Télécharger le Reçu"**
   - Vérifiez que le PDF est téléchargé

### Résultat Attendu
✅ La page de vérification s'affiche correctement et le PDF peut être téléchargé

---

## Scénario de Test 4: Continuation de l'Inscription

### Étapes

1. **Depuis la page de Reçu**
   - Cliquez sur le bouton **"➜ Continuer l'Inscription"**
   - Vous devriez être redirigé vers `/enrollment?contest={contestId}`

2. **Vérification du Formulaire**
   - Vérifiez que le formulaire d'inscription s'affiche
   - Vérifiez que le concours est pré-sélectionné
   - Vérifiez que vous pouvez remplir le formulaire

3. **Soumission du Formulaire**
   - Remplissez le formulaire d'inscription
   - Cliquez sur "Soumettre"
   - Vérifiez que l'inscription est enregistrée

### Résultat Attendu
✅ Le formulaire d'inscription s'affiche et peut être soumis

---

## Scénario de Test 5: Retour au Dashboard

### Étapes

1. **Depuis la page de Reçu**
   - Cliquez sur le bouton **"Retour au Dashboard"**
   - Vous devriez être redirigé vers `/dashboard`

2. **Vérification du Dashboard**
   - Vérifiez que le dashboard s'affiche
   - Vérifiez que le concours apparaît dans la liste

### Résultat Attendu
✅ Le dashboard s'affiche correctement

---

## Scénario de Test 6: Navigateurs

### Tester sur les Navigateurs Suivants

1. **Chrome/Chromium**
   - ✅ Téléchargement du PDF
   - ✅ Impression
   - ✅ Affichage du reçu

2. **Firefox**
   - ✅ Téléchargement du PDF
   - ✅ Impression
   - ✅ Affichage du reçu

3. **Safari**
   - ✅ Téléchargement du PDF
   - ✅ Impression
   - ✅ Affichage du reçu

4. **Edge**
   - ✅ Téléchargement du PDF
   - ✅ Impression
   - ✅ Affichage du reçu

5. **Opera**
   - ✅ Téléchargement du PDF
   - ✅ Impression
   - ✅ Affichage du reçu

### Résultat Attendu
✅ Tous les navigateurs fonctionnent correctement

---

## Scénario de Test 7: Appareils Mobiles

### Tester sur les Appareils Suivants

1. **iPhone**
   - ✅ Affichage du reçu
   - ✅ Téléchargement du PDF
   - ✅ Impression

2. **Android**
   - ✅ Affichage du reçu
   - ✅ Téléchargement du PDF
   - ✅ Impression

3. **Tablette**
   - ✅ Affichage du reçu
   - ✅ Téléchargement du PDF
   - ✅ Impression

### Résultat Attendu
✅ Tous les appareils mobiles fonctionnent correctement

---

## Scénario de Test 8: Gestion des Erreurs

### Test 1: Transaction ID Invalide
1. Accédez à `/payment-receipt?transaction=INVALID`
2. Vérifiez que le message d'erreur s'affiche
3. Vérifiez que le bouton "Retour au Dashboard" fonctionne

### Test 2: Transaction ID Manquant
1. Accédez à `/payment-receipt`
2. Vérifiez que le message d'erreur s'affiche
3. Vérifiez que le bouton "Retour au Dashboard" fonctionne

### Test 3: Paiement Non Trouvé
1. Accédez à `/payment-verification?transaction_id=INVALID`
2. Vérifiez que le message d'erreur s'affiche

### Résultat Attendu
✅ Les erreurs sont gérées correctement

---

## Checklist de Test

### Fonctionnalité
- [ ] Téléchargement du PDF fonctionne
- [ ] Impression fonctionne
- [ ] Vérification via QR code fonctionne
- [ ] Continuation de l'inscription fonctionne
- [ ] Retour au dashboard fonctionne

### Affichage
- [ ] Reçu s'affiche correctement
- [ ] QR code s'affiche correctement
- [ ] Tous les détails sont visibles
- [ ] Mise en page est correcte
- [ ] Responsive design fonctionne

### Navigateurs
- [ ] Chrome fonctionne
- [ ] Firefox fonctionne
- [ ] Safari fonctionne
- [ ] Edge fonctionne
- [ ] Opera fonctionne

### Appareils
- [ ] Desktop fonctionne
- [ ] Tablette fonctionne
- [ ] Mobile fonctionne

### Gestion des Erreurs
- [ ] Erreur transaction ID invalide
- [ ] Erreur transaction ID manquant
- [ ] Erreur paiement non trouvé

---

## Résultats

### ✅ Tous les Tests Réussis
Si tous les tests sont réussis, le système est prêt pour la production.

### ⚠️ Certains Tests Échoués
Si certains tests échouent, consultez la section "Dépannage" du guide d'utilisation.

---

## Commandes Utiles

### Démarrer le Backend
```bash
cd Backend
php artisan serve
```

### Démarrer le Frontend
```bash
cd Frontend
npm run dev
```

### Vérifier les Logs
```bash
# Backend
tail -f Backend/storage/logs/laravel.log

# Frontend
# Ouvrir la console du navigateur (F12)
```

---

## Support

Si vous rencontrez des problèmes:
1. Consultez le guide d'utilisation
2. Vérifiez les logs du backend et du frontend
3. Essayez un autre navigateur
4. Actualisez la page
5. Videz le cache du navigateur
