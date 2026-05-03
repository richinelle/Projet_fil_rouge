import React, { useState, useRef, useEffect } from 'react'
import '../styles/AIChat.css'

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Bonjour! 👋 Je suis l'assistant IA de SGEE. Comment puis-je vous aider?",
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const commonQuestions = [
    "Comment m'inscrire?",
    "Quelles sont les méthodes de paiement?",
    "Comment participer à un concours?",
    "Besoin d'aide avec mon enrôlement"
  ]

  const handleSendMessage = async (text) => {
    if (!text.trim()) return

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: text,
      sender: 'user',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    // Simulate bot response with delay
    setTimeout(() => {
      const botResponses = {
        "comment m'inscrire?": "Pour vous inscrire, cliquez sur le bouton 'S'inscrire (Candidat)' sur la page d'accueil. Vous devrez fournir votre email, créer un mot de passe, puis vérifier votre email. C'est simple et rapide!",
        "quelles sont les méthodes de paiement?": "Nous acceptons plusieurs méthodes de paiement: Carte bancaire, Orange Money (OM), et MTN Money. Tous les paiements sont sécurisés et vous recevrez un reçu par email.",
        "comment participer à un concours?": "Après vous être inscrit et avoir complété votre enrôlement, vous pouvez consulter les concours disponibles. Cliquez sur 'Voir les Concours' et inscrivez-vous à ceux qui vous intéressent. Vous devrez ensuite effectuer le paiement.",
        "besoin d'aide avec mon enrôlement": "L'enrôlement se fait en 7 étapes simples. Vous devez fournir vos informations personnelles, académiques, et télécharger les documents requis. Si vous avez des questions, n'hésitez pas à nous contacter à richinellelaurence@gmail.com ou +237 696482594.",
        "default": "Merci pour votre question! Pour plus d'informations détaillées, veuillez nous contacter à richinellelaurence@gmail.com ou appelez-nous au +237 696482594. Notre équipe est disponible du lundi au vendredi, 9h00 - 17h00."
      }

      const lowerText = text.toLowerCase()
      let response = botResponses['default']
      
      for (const [key, value] of Object.entries(botResponses)) {
        if (key !== 'default' && lowerText.includes(key.split('?')[0])) {
          response = value
          break
        }
      }

      const botMessage = {
        id: messages.length + 2,
        text: response,
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
      setIsLoading(false)
    }, 800)
  }

  const handleQuickQuestion = (question) => {
    handleSendMessage(question)
  }

  return (
    <>
      {/* Chat Widget */}
      <div className={`ai-chat-widget ${isOpen ? 'open' : ''}`}>
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-header-content">
            <div className="chat-avatar">🤖</div>
            <div className="chat-header-text">
              <h3>Assistant SGEE</h3>
              <p className="chat-status">En ligne</p>
            </div>
          </div>
          <button 
            className="chat-close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Fermer le chat"
          >
            ✕
          </button>
        </div>

        {/* Chat Messages */}
        <div className="chat-messages">
          {messages.map(message => (
            <div key={message.id} className={`message message-${message.sender}`}>
              <div className="message-content">
                {message.text}
              </div>
              <span className="message-time">
                {message.timestamp.toLocaleTimeString('fr-FR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          ))}
          {isLoading && (
            <div className="message message-bot">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        {messages.length === 1 && (
          <div className="quick-questions">
            <p className="quick-questions-label">Questions fréquentes:</p>
            <div className="quick-questions-grid">
              {commonQuestions.map((question, index) => (
                <button
                  key={index}
                  className="quick-question-btn"
                  onClick={() => handleQuickQuestion(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Input */}
        <div className="chat-input-container">
          <input
            type="text"
            className="chat-input"
            placeholder="Écrivez votre message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !isLoading) {
                handleSendMessage(inputValue)
              }
            }}
            disabled={isLoading}
          />
          <button
            className="chat-send-btn"
            onClick={() => handleSendMessage(inputValue)}
            disabled={isLoading || !inputValue.trim()}
            aria-label="Envoyer le message"
          >
            ➤
          </button>
        </div>

        {/* Contact Info */}
        <div className="chat-contact-info">
          <p className="contact-label">Besoin d'aide directe?</p>
          <a href="mailto:richinellelaurence@gmail.com" className="contact-link">
            📧 richinellelaurence@gmail.com
          </a>
          <a href="tel:+237696482594" className="contact-link">
            📞 +237 696482594
          </a>
        </div>
      </div>

      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          className="chat-toggle-btn"
          onClick={() => setIsOpen(true)}
          aria-label="Ouvrir le chat"
          title="Assistant IA"
        >
          <span className="chat-icon">💬</span>
          <span className="chat-label">Aide</span>
        </button>
      )}
    </>
  )
}
