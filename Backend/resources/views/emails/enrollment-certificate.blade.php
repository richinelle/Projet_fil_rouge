<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fiche d'Inscription</title>
    <style>
        @page {
            margin: 10mm;
            size: A4;
        }
        
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 11px;
            color: #333;
            line-height: 1.3;
            background: white;
            margin: 0;
            padding: 0;
        }

        .container {
            width: 100%;
            padding: 10px;
        }

        /* Header */
        .header-table {
            width: 100%;
            border-bottom: 2px solid #1a5490;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }

        .logo {
            color: #1a5490;
            font-size: 20px;
            font-weight: bold;
            width: 15%;
            vertical-align: top;
        }

        .header-center {
            text-align: center;
            width: 70%;
            vertical-align: top;
        }

        .header-title {
            color: #1a5490;
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0;
        }

        .header-subtitle {
            font-size: 11px;
            color: #333;
            margin-top: 5px;
            font-weight: normal;
        }

        .stamp-box {
            border: 1px solid #ddd;
            height: 60px;
            width: 80px;
            text-align: center;
            font-size: 9px;
            color: #999;
            vertical-align: middle;
            margin-left: auto;
        }

        /* Inscription Banner */
        .banner {
            background-color: #1a5490;
            color: white;
            padding: 10px;
            text-align: center;
            margin-bottom: 20px;
            border-radius: 3px;
        }

        .banner-label {
            font-size: 10px;
            font-weight: bold;
            letter-spacing: 1px;
            text-transform: uppercase;
            margin-bottom: 5px;
            color: white; /* Ensure text is white */
        }

        .banner-value {
            font-size: 24px;
            font-weight: bold;
            color: #ff4444 !important; /* Force red color */
            margin-top: 5px;
            background-color: transparent;
        }

        /* Sections */
        .section-title {
            color: #1a5490;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            border-bottom: 1px solid #eee; /* Fallback */
            background-color: #f0f0f0;
            padding: 6px 10px;
            margin-bottom: 10px;
            border-left: 3px solid #1a5490;
        }

        .content-table {
            width: 100%;
            margin-bottom: 15px;
            border-collapse: collapse;
        }

        .content-table td {
            vertical-align: top;
            padding-bottom: 10px;
        }

        .field-label {
            display: block;
            font-size: 9px;
            font-weight: bold;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 3px;
        }

        .field-value {
            display: block;
            font-size: 11px;
            color: #333;
            font-weight: normal;
        }

        /* Documents List */
        .documents-list {
            background-color: #f9f9f9;
            padding: 10px 15px;
            border-left: 3px solid #1a5490;
            margin-top: 5px;
        }

        .doc-item {
            font-size: 10px;
            margin-bottom: 5px;
            position: relative;
        }
        
        .doc-bullet {
            color: #1a5490;
            font-weight: bold;
            margin-right: 5px;
        }

        /* Footer */
        .footer {
            margin-top: 30px;
            border-top: 1px solid #1a5490;
            padding-top: 10px;
        }

        .footer-table {
            width: 100%;
        }

        .footer-code-label {
            font-weight: bold;
            color: #333;
            font-size: 10px;
        }

        .footer-code-value {
            font-weight: bold;
            color: #ff4444;
            font-size: 12px;
            margin-left: 5px;
        }

        .footer-date {
            text-align: right;
            font-size: 10px;
            color: #666;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header Table -->
        <table class="header-table">
            <tr>
                <td class="logo">SGEE</td>
                <td class="header-center">
                    <h1 class="header-title">FICHE D'INSCRIPTION AU CONCOURS D'ENTRÉE</h1>
                    <h2 class="header-subtitle">CURSUS INGENIEUR</h2>
                </td>
                <td style="width: 15%; text-align: right;">
                    <div class="stamp-box">
                        <br>Timbre Fiscal ici<br>Stamp here
                    </div>
                </td>
            </tr>
        </table>

        <!-- Banner with Candidate Code -->
        <div class="banner">
            <div class="banner-label">INSCRIPTION N°</div>
            <div class="banner-value">{{ $candidateCode }}</div>
        </div>

        <!-- Personal Info -->
        <div class="section-title">Informations Personnelles</div>
        <table class="content-table">
            <tr>
                <td width="33%">
                    <span class="field-label">Nom:</span>
                    <span class="field-value">{{ explode(' ', $enrollment->full_name)[0] ?? 'N/A' }}</span>
                </td>
                <td width="33%">
                    <span class="field-label">Prénom:</span>
                    <span class="field-value">{{ implode(' ', array_slice(explode(' ', $enrollment->full_name), 1)) ?: 'N/A' }}</span>
                </td>
                <td width="33%">
                    <span class="field-label">Date naissance:</span>
                    <span class="field-value">{{ \Carbon\Carbon::parse($enrollment->date_of_birth)->format('d/m/Y') }}</span>
                </td>
            </tr>
            <tr>
                <td>
                    <span class="field-label">Sexe:</span>
                    <span class="field-value">{{ $enrollment->gender === 'male' ? 'Masculin' : ($enrollment->gender === 'female' ? 'Féminin' : 'Autre') }}</span>
                </td>
                <td>
                    <span class="field-label">Nationalité:</span>
                    <span class="field-value">{{ $enrollment->nationality ?: 'N/A' }}</span>
                </td>
                <td>
                    <span class="field-label">CNI:</span>
                    <span class="field-value">{{ $enrollment->cni_number ?: 'N/A' }}</span>
                </td>
            </tr>
            <tr>
                <td>
                    <span class="field-label">Adresse:</span>
                    <span class="field-value">{{ $enrollment->address ?: 'N/A' }}</span>
                </td>
                <td>
                    <span class="field-label">Ville:</span>
                    <span class="field-value">{{ $enrollment->city ?: 'N/A' }}</span>
                </td>
                <td>
                    <span class="field-label">Pays:</span>
                    <span class="field-value">{{ $enrollment->country ?: 'N/A' }}</span>
                </td>
            </tr>
        </table>

        <!-- Academic Info -->
        <div class="section-title">Informations Académique</div>
        <table class="content-table">
            <tr>
                <td width="33%">
                    <span class="field-label">Diplôme:</span>
                    <span class="field-value">
                        @switch($enrollment->education_level)
                            @case('high_school') Lycée @break
                            @case('bachelor') Licence @break
                            @case('master') Master @break
                            @case('phd') Doctorat @break
                            @default {{ $enrollment->education_level }}
                        @endswitch
                    </span>
                </td>
                <td width="33%">
                    <span class="field-label">École:</span>
                    <span class="field-value">{{ $enrollment->school_name ?: 'N/A' }}</span>
                </td>
                <td width="33%">
                    <span class="field-label">Domaine:</span>
                    <span class="field-value">{{ $enrollment->field_of_study ?: 'N/A' }}</span>
                </td>
            </tr>
        </table>

        <!-- Department & Filiere Info -->
        <div class="section-title">Informations d'Inscription</div>
        <table class="content-table">
            <tr>
                <td width="33%">
                    <span class="field-label">Département:</span>
                    <span class="field-value">{{ $enrollment->department->name ?? 'N/A' }}</span>
                </td>
                <td width="33%">
                    <span class="field-label">Filière:</span>
                    <span class="field-value">{{ $enrollment->filiere->name ?? 'N/A' }}</span>
                </td>
                <td width="33%">
                    <span class="field-label">Concours:</span>
                    <span class="field-value">{{ $enrollment->contest->title ?? 'N/A' }}</span>
                </td>
            </tr>
        </table>

        <!-- Exam & Deposit Centers -->
        <div class="section-title">Centres d'Examen et de Dépôt</div>
        <table class="content-table">
            <tr>
                <td width="50%">
                    <span class="field-label">Centre d'Examen:</span>
                    <span class="field-value">
                        @if($enrollment->examCenter)
                            {{ $enrollment->examCenter->name }}<br>
                            <span style="font-size: 9px; color: #666;">{{ $enrollment->examCenter->location ?? '' }}</span>
                        @else
                            N/A
                        @endif
                    </span>
                </td>
                <td width="50%">
                    <span class="field-label">Centre de Dépôt:</span>
                    <span class="field-value">
                        @if($enrollment->depositCenter)
                            {{ $enrollment->depositCenter->name }}<br>
                            <span style="font-size: 9px; color: #666;">{{ $enrollment->depositCenter->location ?? '' }}</span>
                        @else
                            N/A
                        @endif
                    </span>
                </td>
            </tr>
        </table>

        <!-- Emergency Contact -->
        <div class="section-title">Contact d'Urgence</div>
        <table class="content-table">
            <tr>
                <td width="33%">
                    <span class="field-label">Nom:</span>
                    <span class="field-value">{{ $enrollment->emergency_contact_name ?: 'N/A' }}</span>
                </td>
                <td width="33%">
                    <span class="field-label">Téléphone:</span>
                    <span class="field-value">{{ $enrollment->emergency_contact_phone ?: 'N/A' }}</span>
                </td>
                <td width="33%">
                    <span class="field-label">Relation:</span>
                    <span class="field-value">{{ $enrollment->emergency_contact_relationship ?: 'N/A' }}</span>
                </td>
            </tr>
        </table>

        <!-- Professional Info -->
        @if($enrollment->professional_experience || $enrollment->current_job_title || $enrollment->company_name)
        <div class="section-title">Informations Professionnelles</div>
        <table class="content-table">
            <tr>
                <td width="33%">
                    <span class="field-label">Poste Actuel:</span>
                    <span class="field-value">{{ $enrollment->current_job_title ?: 'N/A' }}</span>
                </td>
                <td width="33%">
                    <span class="field-label">Entreprise:</span>
                    <span class="field-value">{{ $enrollment->company_name ?: 'N/A' }}</span>
                </td>
                <td width="33%">
                    <span class="field-label">Expérience:</span>
                    <span class="field-value">{{ $enrollment->professional_experience ? substr($enrollment->professional_experience, 0, 50) . '...' : 'N/A' }}</span>
                </td>
            </tr>
        </table>
        @endif

        <!-- Documents -->
        <div class="section-title">Documents Nécessaires</div>
        <div class="documents-list">
            <div class="doc-item"><span class="doc-bullet">•</span> Acte de naissance certifié (moins de 3 mois)</div>
            <div class="doc-item"><span class="doc-bullet">•</span> Diplôme/attestation requis certifié</div>
            <div class="doc-item"><span class="doc-bullet">•</span> Certificat médical (moins de 3 mois)</div>
            <div class="doc-item"><span class="doc-bullet">•</span> Quatre (04) photos d'identité 4x4</div>
            <div class="doc-item"><span class="doc-bullet">•</span> Reçu de versement bancaire</div>
            <div class="doc-item"><span class="doc-bullet">•</span> Enveloppe A4 timbrée avec adresse</div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <table class="footer-table">
                <tr>
                    <td>
                        <span class="footer-code-label">Code Candidat:</span>
                        <span class="footer-code-value">{{ $candidateCode }}</span>
                    </td>
                    <td class="footer-date">
                        Imprimée le {{ now()->format('d/m/Y') }}
                    </td>
                </tr>
            </table>
        </div>
    </div>
</body>
</html>
