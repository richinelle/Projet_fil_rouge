/**
 * Service de génération de PDF pour les reçus de paiement
 * Utilise l'impression du navigateur pour générer un PDF
 * Pas de dépendances externes requises
 */

/**
 * Générer un PDF du reçu en utilisant l'impression du navigateur
 * C'est la méthode la plus simple et la plus compatible
 */
export const generatePaymentReceiptPDF = async (receiptData, qrCodeUrl) => {
  try {
    // Utiliser directement l'impression du navigateur
    window.print()
    
    return {
      success: true,
      message: 'Impression lancée',
      filename: `recu_paiement_${receiptData.transaction_id}.pdf`,
    }
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error)
    return {
      success: false,
      message: 'Erreur lors de la génération du PDF: ' + error.message,
    }
  }
}

/**
 * Fallback: Utiliser l'impression du navigateur directement
 */
export const generatePaymentReceiptPDFFallback = () => {
  window.print()
  return {
    success: true,
    message: 'Impression lancée',
  }
}
