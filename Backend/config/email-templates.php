<?php

/**
 * Email Templates Configuration
 *
 * This file contains all email templates used throughout the application.
 * Templates support placeholder substitution for dynamic values.
 *
 * Supported placeholders:
 * - {candidate_name}: Full name of the candidate
 * - {enrollment_id}: Unique enrollment identifier
 * - {submission_date}: Formatted submission date (d/m/Y)
 * - {submission_time}: Formatted submission time (H:i)
 * - {rejection_reason}: Reason for enrollment rejection
 */

return [
    'enrollment_confirmation' => [
        'subject' => 'Confirmation de candidature - Dossier #{enrollment_id}',
        'body' => <<<'HTML'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 30px 20px;
        }
        .greeting {
            font-size: 16px;
            margin-bottom: 20px;
        }
        .message {
            background-color: #f0f7ff;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 15px;
            line-height: 1.8;
        }
        .details {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
            border: 1px solid #e0e0e0;
        }
        .details h3 {
            margin-top: 0;
            color: #667eea;
            font-size: 16px;
        }
        .details-item {
            margin: 12px 0;
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #f0f0f0;
        }
        .details-item:last-child {
            border-bottom: none;
        }
        .details-label {
            font-weight: 600;
            color: #555;
        }
        .details-value {
            color: #667eea;
            font-weight: 500;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 25px 20px;
            border-top: 1px solid #e0e0e0;
            font-size: 13px;
            color: #666;
        }
        .footer h4 {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 14px;
        }
        .contact-info {
            margin: 15px 0;
            line-height: 1.8;
        }
        .contact-info p {
            margin: 5px 0;
        }
        .signature {
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #e0e0e0;
            font-style: italic;
            color: #888;
        }
        @media (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            .header {
                padding: 20px 15px;
            }
            .content {
                padding: 20px 15px;
            }
            .details-item {
                flex-direction: column;
            }
            .details-value {
                margin-top: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✓ Candidature Confirmée</h1>
        </div>
        
        <div class="content">
            <div class="greeting">
                <p>Bonjour <strong>{candidate_name}</strong>,</p>
            </div>
            
            <div class="message">
                <p>Votre candidature a été soumise avec succès et est en cours de traitement. Vous recevrez une réponse d'ici 24h ou veuillez nous contacter.</p>
            </div>
            
            <div class="details">
                <h3>📋 Détails de votre candidature</h3>
                <div class="details-item">
                    <span class="details-label">Numéro de dossier:</span>
                    <span class="details-value">{enrollment_id}</span>
                </div>
                <div class="details-item">
                    <span class="details-label">Date de soumission:</span>
                    <span class="details-value">{submission_date} à {submission_time}</span>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <h4>📞 Besoin d'aide?</h4>
            <p>Si vous avez des questions concernant votre candidature, n'hésitez pas à nous contacter:</p>
            <div class="contact-info">
                <p><strong>Email:</strong> <a href="mailto:richinellelaurence@gmail.com">richinellelaurence@gmail.com</a></p>
                <p><strong>Téléphone:</strong> <a href="tel:+237696482594">+237 696 482 594</a></p>
                <p><strong>Horaires:</strong> Lundi - Vendredi, 9h00 - 17h00</p>
            </div>
            <div class="signature">
                <p>Cordialement,<br>L'équipe de traitement des candidatures</p>
            </div>
        </div>
    </div>
</body>
</html>
HTML
    ],
    'enrollment_rejection' => [
        'subject' => 'Candidature Rejetée - Dossier #{enrollment_id}',
        'body' => <<<'HTML'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 30px 20px; }
        .greeting { font-size: 16px; margin-bottom: 20px; }
        .message { background-color: #ffe6e6; border-left: 4px solid #e74c3c; padding: 15px; margin: 20px 0; border-radius: 4px; font-size: 15px; line-height: 1.8; }
        .details { background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin: 20px 0; border: 1px solid #e0e0e0; }
        .details h3 { margin-top: 0; color: #e74c3c; font-size: 16px; }
        .details-item { margin: 12px 0; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
        .details-item:last-child { border-bottom: none; }
        .details-label { font-weight: 600; color: #555; }
        .details-value { color: #333; font-weight: 500; margin-top: 5px; padding: 10px; background-color: #f5f5f5; border-radius: 4px; }
        .footer { background-color: #f8f9fa; padding: 25px 20px; border-top: 1px solid #e0e0e0; font-size: 13px; color: #666; }
        .footer h4 { margin: 0 0 10px 0; color: #333; font-size: 14px; }
        .contact-info { margin: 15px 0; line-height: 1.8; }
        .contact-info p { margin: 5px 0; }
        .signature { margin-top: 20px; padding-top: 15px; border-top: 1px solid #e0e0e0; font-style: italic; color: #888; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✗ Candidature Rejetée</h1>
        </div>
        <div class="content">
            <div class="greeting">
                <p>Bonjour <strong>{candidate_name}</strong>,</p>
            </div>
            <div class="message">
                <p>Nous regrettons de vous informer que votre candidature a été rejetée après examen attentif de votre dossier.</p>
            </div>
            <div class="details">
                <h3>📋 Détails du rejet</h3>
                <div class="details-item">
                    <span class="details-label">Numéro de dossier:</span>
                    <span class="details-value">{enrollment_id}</span>
                </div>
                <div class="details-item">
                    <span class="details-label">Raison du rejet:</span>
                    <span class="details-value">{rejection_reason}</span>
                </div>
            </div>
            <p style="margin-top: 20px; color: #666;">Si vous avez des questions concernant cette décision ou si vous souhaitez contester le rejet, n'hésitez pas à nous contacter.</p>
        </div>
        <div class="footer">
            <h4>📞 Besoin d'aide?</h4>
            <p>Si vous avez des questions, veuillez nous contacter:</p>
            <div class="contact-info">
                <p><strong>Email:</strong> <a href="mailto:richinellelaurence@gmail.com">richinellelaurence@gmail.com</a></p>
                <p><strong>Téléphone:</strong> <a href="tel:+237696482594">+237 696 482 594</a></p>
                <p><strong>Horaires:</strong> Lundi - Vendredi, 9h00 - 17h00</p>
            </div>
            <div class="signature">
                <p>Cordialement,<br>L'équipe d'administration</p>
            </div>
        </div>
    </div>
</body>
</html>
HTML
    ],
];
