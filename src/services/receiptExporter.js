/**
 * Service d'exportation des reçus de paiement
 * Supporte: PDF (via impression), Excel (CSV), et impression directe
 */

/**
 * Télécharger le reçu en PDF
 * Utilise l'impression native du navigateur
 */
export const downloadReceiptAsPDF = (receiptData, qrCodeUrl) => {
  try {
    // Ouvrir la fenêtre d'impression
    const printWindow = window.open('', '', 'height=600,width=800')
    
    if (!printWindow) {
      throw new Error('Impossible d\'ouvrir la fenêtre d\'impression')
    }

    // Créer le contenu HTML pour l'impression
    const htmlContent = generateReceiptHTML(receiptData, qrCodeUrl)
    
    // Écrire le contenu dans la fenêtre
    printWindow.document.write(htmlContent)
    printWindow.document.close()

    // Attendre que le contenu soit chargé
    printWindow.onload = function() {
      // Lancer l'impression
      printWindow.print()
      
      // Fermer la fenêtre après l'impression
      setTimeout(() => {
        printWindow.close()
      }, 1000)
    }

    return {
      success: true,
      message: 'Fenêtre d\'impression ouverte',
      filename: `recu_paiement_${receiptData.transaction_id}.pdf`,
    }
  } catch (error) {
    console.error('Erreur lors du téléchargement PDF:', error)
    return {
      success: false,
      message: 'Erreur: ' + error.message,
    }
  }
}

/**
 * Télécharger le reçu en Excel (CSV)
 */
export const downloadReceiptAsExcel = (receiptData) => {
  try {
    // Créer le contenu CSV
    const csvContent = generateReceiptCSV(receiptData)
    
    // Créer un blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    
    // Créer un lien de téléchargement
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `recu_paiement_${receiptData.transaction_id}.csv`)
    link.style.visibility = 'hidden'
    
    // Ajouter le lien au document et cliquer
    document.body.appendChild(link)
    link.click()
    
    // Nettoyer
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    return {
      success: true,
      message: 'Fichier Excel téléchargé',
      filename: `recu_paiement_${receiptData.transaction_id}.csv`,
    }
  } catch (error) {
    console.error('Erreur lors du téléchargement Excel:', error)
    return {
      success: false,
      message: 'Erreur: ' + error.message,
    }
  }
}

/**
 * Imprimer le reçu directement
 */
export const printReceipt = (receiptData, qrCodeUrl) => {
  try {
    const htmlContent = generateReceiptHTML(receiptData, qrCodeUrl)
    
    const printWindow = window.open('', '', 'height=600,width=800')
    if (!printWindow) {
      throw new Error('Impossible d\'ouvrir la fenêtre d\'impression')
    }

    printWindow.document.write(htmlContent)
    printWindow.document.close()

    printWindow.onload = function() {
      printWindow.print()
      setTimeout(() => {
        printWindow.close()
      }, 1000)
    }

    return {
      success: true,
      message: 'Impression lancée',
    }
  } catch (error) {
    console.error('Erreur lors de l\'impression:', error)
    return {
      success: false,
      message: 'Erreur: ' + error.message,
    }
  }
}

/**
 * Générer le HTML du reçu
 */
const generateReceiptHTML = (receiptData, qrCodeUrl) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>recu_paiement_${receiptData.transaction_id}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: Arial, sans-serif;
            background: white;
            padding: 20px;
          }
          
          .receipt {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border: 1px solid #f0f0f0;
          }
          
          .receipt-header-section {
            text-align: center;
            border-bottom: 3px solid #667eea;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          
          .receipt-logo {
            font-size: 2.5rem;
            font-weight: 700;
            color: #667eea;
            margin-bottom: 10px;
          }
          
          .receipt-title {
            font-size: 1.8rem;
            font-weight: 700;
            color: #333;
            margin-bottom: 5px;
          }
          
          .receipt-subtitle {
            font-size: 1rem;
            color: #666;
          }
          
          .receipt-section {
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #f0f0f0;
          }
          
          .section-title {
            font-size: 1rem;
            font-weight: 700;
            color: #667eea;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .receipt-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            padding: 8px 0;
          }
          
          .receipt-row .label {
            font-weight: 600;
            color: #666;
            font-size: 0.95rem;
          }
          
          .receipt-row .value {
            color: #333;
            font-weight: 500;
            text-align: right;
            font-size: 0.95rem;
          }
          
          .receipt-row .amount {
            font-size: 1.2rem;
            color: #ff6b35;
            font-weight: 700;
          }
          
          .status-badge {
            display: inline-block;
            background: #4caf50;
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
          }
          
          .qr-section {
            text-align: center;
            padding: 30px 0;
            border-top: 2px dashed #667eea;
            border-bottom: 2px dashed #667eea;
          }
          
          .qr-code-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 15px;
          }
          
          .qr-code {
            width: 200px;
            height: 200px;
            border: 2px solid #667eea;
            border-radius: 8px;
            padding: 10px;
            background: white;
          }
          
          .qr-text {
            color: #666;
            font-size: 0.9rem;
            margin: 0;
            font-style: italic;
          }
          
          .receipt-footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #f0f0f0;
          }
          
          .receipt-footer p {
            margin: 8px 0;
            color: #666;
            font-size: 0.95rem;
          }
          
          .footer-note {
            color: #999;
            font-size: 0.85rem;
            font-style: italic;
          }
          
          @media print {
            body {
              padding: 0;
            }
            .receipt {
              border: none;
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="receipt-header-section">
            <div class="receipt-logo">SGEE</div>
            <div class="receipt-title">REÇU DE PAIEMENT</div>
            <div class="receipt-subtitle">Concours</div>
          </div>

          <div class="receipt-section">
            <div class="section-title">Informations de Transaction</div>
            <div class="receipt-row">
              <span class="label">ID Transaction:</span>
              <span class="value">${receiptData.transaction_id}</span>
            </div>
            <div class="receipt-row">
              <span class="label">Date:</span>
              <span class="value">${receiptData.date}</span>
            </div>
            <div class="receipt-row">
              <span class="label">Statut:</span>
              <span class="value"><span class="status-badge">✓ Complété</span></span>
            </div>
          </div>

          <div class="receipt-section">
            <div class="section-title">Informations du Candidat</div>
            <div class="receipt-row">
              <span class="label">Nom:</span>
              <span class="value">${receiptData.candidate_name}</span>
            </div>
            <div class="receipt-row">
              <span class="label">Email:</span>
              <span class="value">${receiptData.candidate_email}</span>
            </div>
          </div>

          <div class="receipt-section">
            <div class="section-title">Informations du Concours</div>
            <div class="receipt-row">
              <span class="label">Concours:</span>
              <span class="value">${receiptData.contest_title}</span>
            </div>
            <div class="receipt-row">
              <span class="label">Montant:</span>
              <span class="value amount">${receiptData.amount} FCFA</span>
            </div>
          </div>

          <div class="receipt-section">
            <div class="section-title">Méthode de Paiement</div>
            <div class="receipt-row">
              <span class="label">Méthode:</span>
              <span class="value">${receiptData.payment_method}</span>
            </div>
          </div>

          ${qrCodeUrl ? `
            <div class="qr-section">
              <div class="section-title">Code de Vérification</div>
              <div class="qr-code-container">
                <img src="${qrCodeUrl}" alt="QR Code" class="qr-code" />
                <p class="qr-text">Scannez ce code pour vérifier votre paiement</p>
              </div>
            </div>
          ` : ''}

          <div class="receipt-footer">
            <p>Merci d'avoir participé à SGEE</p>
            <p class="footer-note">Conservez ce reçu pour votre dossier d'inscription</p>
          </div>
        </div>
      </body>
    </html>
  `
}

/**
 * Générer le CSV du reçu
 */
const generateReceiptCSV = (receiptData) => {
  const rows = [
    ['REÇU DE PAIEMENT - SGEE'],
    [],
    ['INFORMATIONS DE TRANSACTION'],
    ['ID Transaction', receiptData.transaction_id],
    ['Date', receiptData.date],
    ['Statut', 'Complété'],
    [],
    ['INFORMATIONS DU CANDIDAT'],
    ['Nom', receiptData.candidate_name],
    ['Email', receiptData.candidate_email],
    [],
    ['INFORMATIONS DU CONCOURS'],
    ['Concours', receiptData.contest_title],
    ['Montant', `${receiptData.amount} FCFA`],
    [],
    ['MÉTHODE DE PAIEMENT'],
    ['Méthode', receiptData.payment_method],
    [],
    ['Merci d\'avoir participé à SGEE'],
    ['Conservez ce reçu pour votre dossier d\'inscription'],
  ]

  // Convertir en CSV
  const csv = rows.map(row => 
    row.map(cell => {
      // Échapper les guillemets et entourer de guillemets si nécessaire
      const escaped = String(cell).replace(/"/g, '""')
      return escaped.includes(',') || escaped.includes('"') || escaped.includes('\n') 
        ? `"${escaped}"` 
        : escaped
    }).join(',')
  ).join('\n')

  // Ajouter BOM pour UTF-8 (pour Excel)
  return '\uFEFF' + csv
}

/**
 * Copier le reçu dans le presse-papiers
 */
export const copyReceiptToClipboard = (receiptData) => {
  try {
    const text = `
REÇU DE PAIEMENT - SGEE

INFORMATIONS DE TRANSACTION
ID Transaction: ${receiptData.transaction_id}
Date: ${receiptData.date}
Statut: Complété

INFORMATIONS DU CANDIDAT
Nom: ${receiptData.candidate_name}
Email: ${receiptData.candidate_email}

INFORMATIONS DU CONCOURS
Concours: ${receiptData.contest_title}
Montant: ${receiptData.amount} FCFA

MÉTHODE DE PAIEMENT
Méthode: ${receiptData.payment_method}

Merci d'avoir participé à SGEE
Conservez ce reçu pour votre dossier d'inscription
    `.trim()

    navigator.clipboard.writeText(text).then(() => {
      return {
        success: true,
        message: 'Reçu copié dans le presse-papiers',
      }
    }).catch(() => {
      throw new Error('Impossible de copier dans le presse-papiers')
    })
  } catch (error) {
    console.error('Erreur lors de la copie:', error)
    return {
      success: false,
      message: 'Erreur: ' + error.message,
    }
  }
}
