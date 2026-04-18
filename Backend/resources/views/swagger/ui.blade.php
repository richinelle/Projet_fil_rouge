<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SGEE API Documentation</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: sans-serif;
            background: #fafafa;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: #0f0e0fff;
            color: white;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 4px;
        }
        .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
        }
        .header p {
            font-size: 14px;
            opacity: 0.8;
        }
        .endpoints {
            background: white;
            border-radius: 4px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .endpoint {
            border-bottom: 1px solid #e0e0e0;
            padding: 20px;
        }
        .endpoint:last-child {
            border-bottom: none;
        }
        .method {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 3px;
            font-weight: bold;
            font-size: 12px;
            margin-right: 10px;
        }
        .method.get {
            background: #61affe;
            color: white;
        }
        .method.post {
            background: #49cc90;
            color: white;
        }
        .method.put {
            background: #fca130;
            color: white;
        }
        .method.delete {
            background: #f93e3e;
            color: white;
        }
        .path {
            font-family: monospace;
            font-size: 14px;
            color: #333;
        }
        .description {
            margin-top: 10px;
            color: #666;
            font-size: 14px;
        }
        .tag {
            display: inline-block;
            background: #e3f2fd;
            color: #1976d2;
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 12px;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>SGEE API Documentation</h1>
            <p>API pour la gestion des inscriptions aux concours</p>
            <p style="margin-top: 10px; font-size: 12px;">Base URL: http://localhost:8000/api</p>
        </div>

        <div class="endpoints">
            <!-- Authentication Endpoints -->
            <div class="endpoint">
                <span class="method post">POST</span>
                <span class="path">/auth/register</span>
                <div class="description">Register a new candidate</div>
                <span class="tag">Candidate Authentication</span>
            </div>

            <div class="endpoint">
                <span class="method post">POST</span>
                <span class="path">/auth/login</span>
                <div class="description">Login candidate</div>
                <span class="tag">Candidate Authentication</span>
            </div>

            <div class="endpoint">
                <span class="method post">POST</span>
                <span class="path">/auth/verify-email</span>
                <div class="description">Verify email with code</div>
                <span class="tag">Candidate Authentication</span>
            </div>

            <div class="endpoint">
                <span class="method post">POST</span>
                <span class="path">/login</span>
                <div class="description">Login admin or manager</div>
                <span class="tag">Admin/Manager Authentication</span>
            </div>

            <!-- Enrollment Endpoints -->
            <div class="endpoint">
                <span class="method get">GET</span>
                <span class="path">/enrollment/status</span>
                <div class="description">Get enrollment status</div>
                <span class="tag">Enrollment</span>
            </div>

            <div class="endpoint">
                <span class="method post">POST</span>
                <span class="path">/enrollment/save</span>
                <div class="description">Create or update enrollment</div>
                <span class="tag">Enrollment</span>
            </div>

            <div class="endpoint">
                <span class="method post">POST</span>
                <span class="path">/enrollment/submit</span>
                <div class="description">Submit enrollment</div>
                <span class="tag">Enrollment</span>
            </div>

            <div class="endpoint">
                <span class="method get">GET</span>
                <span class="path">/enrollment/certificate</span>
                <div class="description">Download enrollment certificate</div>
                <span class="tag">Enrollment</span>
            </div>

            <!-- Contest Endpoints -->
            <div class="endpoint">
                <span class="method get">GET</span>
                <span class="path">/contests</span>
                <div class="description">List all contests</div>
                <span class="tag">Contests</span>
            </div>

            <div class="endpoint">
                <span class="method get">GET</span>
                <span class="path">/contests/{contestId}</span>
                <div class="description">Get contest details</div>
                <span class="tag">Contests</span>
            </div>

            <!-- Department & Filiere Endpoints -->
            <div class="endpoint">
                <span class="method get">GET</span>
                <span class="path">/departments</span>
                <div class="description">List all departments</div>
                <span class="tag">Departments</span>
            </div>

            <div class="endpoint">
                <span class="method get">GET</span>
                <span class="path">/filieres/by-department/{departmentId}</span>
                <div class="description">Get filieres by department</div>
                <span class="tag">Filieres</span>
            </div>

            <!-- Admin Endpoints -->
            <div class="endpoint">
                <span class="method get">GET</span>
                <span class="path">/admin/enrollments</span>
                <div class="description">Get all enrollments with pagination</div>
                <span class="tag">Admin - Enrollment Management</span>
            </div>

            <div class="endpoint">
                <span class="method post">POST</span>
                <span class="path">/admin/enrollments/{enrollmentId}/approve</span>
                <div class="description">Approve enrollment</div>
                <span class="tag">Admin - Enrollment Management</span>
            </div>

            <div class="endpoint">
                <span class="method post">POST</span>
                <span class="path">/admin/enrollments/{enrollmentId}/reject</span>
                <div class="description">Reject enrollment</div>
                <span class="tag">Admin - Enrollment Management</span>
            </div>
        </div>

        <div style="margin-top: 30px; padding: 20px; background: white; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h3>Pour la documentation complète en Swagger UI</h3>
            <p>Consultez le fichier JSON: <code>/api/docs/json</code></p>
        </div>
    </div>
</body>
</html>
