// Currency Configuration for Cameroon (FCFA)

export const CURRENCY = {
  code: 'XAF',
  symbol: 'FCFA',
  name: 'Franc CFA',
  country: 'Cameroon',
  decimals: 0, // FCFA typically doesn't use decimals
}

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '0 FCFA'
  
  // Format with thousand separators
  const formatted = Math.round(amount).toLocaleString('fr-FR')
  return `${formatted} FCFA`
}

export const formatCurrencyWithDecimals = (amount) => {
  if (amount === null || amount === undefined) return '0.00 FCFA'
  
  // Format with decimals
  const formatted = parseFloat(amount).toLocaleString('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
  return `${formatted} FCFA`
}

export default CURRENCY
