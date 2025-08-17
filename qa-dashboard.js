// Quality Assurance Dashboard - UI for compliance monitoring and quality metrics

// Initialize QA Dashboard
function initializeQADashboard() {
    console.log('Initializing QA Dashboard');
    renderQADashboard();
    setupQAEventListeners();
}

// Render main QA dashboard
function renderQADashboard() {
    const qaContent = document.getElementById('qa-compliance-content');
    if (!qaContent) return;

    qaContent.innerHTML = `
        <div class="qa-dashboard">
            <!-- QA Header -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center">
                        <h3><i class="fas fa-shield-alt text-primary"></i> Quality Assurance & Compliance</h3>
                        <div class="btn-group">
                            <button class="btn btn-primary" onclick="runComplianceAudit()">
                                <i class="fas fa-search"></i> Run Audit
                            </button>
                            <button class="btn btn-success" onclick="generateQAReport()">
                                <i class="fas fa-file-alt"></i> Generate Report
                            </button>
                            <button class="btn btn-info" onclick="exportQAData()">
                                <i class="fas fa-download"></i> Export Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- QA Overview Cards -->
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card bg-primary text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h4 id="overall-qa-score">--</h4>
                                    <p class="mb-0">Overall QA Score</p>
                                </div>
                                <i class="fas fa-chart-line fa-2x opacity-50"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-success text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h4 id="compliance-rate">--</h4>
                                    <p class="mb-0">Compliance Rate</p>
                                </div>
                                <i class="fas fa-check-circle fa-2x opacity-50"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-warning text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h4 id="active-incidents">--</h4>
                                    <p class="mb-0">Active Incidents</p>
                                </div>
                                <i class="fas fa-exclamation-triangle fa-2x opacity-50"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-info text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h4 id="pending-actions">--</h4>
                                    <p class="mb-0">Pending Actions</p>
                                </div>
                                <i class="fas fa-tasks fa-2x opacity-50"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- QA Navigation Tabs -->
            <ul class="nav nav-tabs mb-3" id="qaTabs" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="compliance-tab" data-bs-toggle="tab" data-bs-target="#compliance-panel" type="button">
                        <i class="fas fa-clipboard-check"></i> Compliance
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="quality-metrics-tab" data-bs-toggle="tab" data-bs-target="#quality-metrics-panel" type="button">
                        <i class="fas fa-chart-bar"></i> Quality Metrics
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="audits-tab" data-bs-toggle="tab" data-bs-target="#audits-panel" type="button">
                        <i class="fas fa-search"></i> Audits
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="incidents-tab" data-bs-toggle="tab" data-bs-target="#incidents-panel" type="button">
                        <i class="fas fa-exclamation-circle"></i> Incidents
                    </button>
                </li>
            </ul>

            <!-- Tab Content -->
            <div class="tab-content" id="qaTabContent">
                <!-- Compliance Panel -->
                <div class="tab-pane fade show active" id="compliance-panel">
                    <div class="card">
                        <div class="card-header">
                            <h5><i class="fas fa-clipboard-check"></i> Compliance Dashboard</h5>
                        </div>
                        <div class="card-body">
                            <div id="compliance-content">
                                <!-- Compliance content will be loaded here -->
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quality Metrics Panel -->
                <div class="tab-pane fade" id="quality-metrics-panel">
                    <div class="card">
                        <div class="card-header">
                            <h5><i class="fas fa-chart-bar"></i> Quality Metrics</h5>
                        </div>
                        <div class="card-body">
                            <div id="quality-metrics-content">
                                <!-- Quality metrics content will be loaded here -->
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Audits Panel -->
                <div class="tab-pane fade" id="audits-panel">
                    <div class="card">
                        <div class="card-header">
                            <h5><i class="fas fa-search"></i> Audit Management</h5>
                        </div>
                        <div class="card-body">
                            <div id="audits-content">
                                <!-- Audits content will be loaded here -->
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Incidents Panel -->
                <div class="tab-pane fade" id="incidents-panel">
                    <div class="card">
                        <div class="card-header">
                            <h5><i class="fas fa-exclamation-circle"></i> Incident Tracking</h5>
                        </div>
                        <div class="card-body">
                            <div id="incidents-content">
                                <!-- Incidents content will be loaded here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Load initial data
    updateQAOverview();
    renderCompliancePanel();
    renderQualityMetricsPanel();
    renderAuditsPanel();
    renderIncidentsPanel();
}

// Update QA overview cards
function updateQAOverview() {
    const qaReport = window.qualityAssurance?.generateQAReport() || {};
    
    document.getElementById('overall-qa-score').textContent = qaReport.overallScore || '--';
    document.getElementById('compliance-rate').textContent = 
        qaReport.complianceStatus === 'fully_compliant' ? '100%' : 
        qaReport.complianceStatus === 'mostly_compliant' ? '85%' : '65%';
    document.getElementById('active-incidents').textContent = qaReport.activeIncidents?.length || 0;
    document.getElementById('pending-actions').textContent = qaReport.pendingActions?.length || 0;
}

// Render compliance panel
function renderCompliancePanel() {
    const complianceContent = document.getElementById('compliance-content');
    if (!complianceContent) return;

    const qaData = window.qualityAssurance?.loadQAData() || { complianceChecks: [] };
    
    complianceContent.innerHTML = `
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Standard</th>
                        <th>Status</th>
                        <th>Score</th>
                        <th>Requirements Met</th>
                        <th>Issues</th>
                        <th>Last Check</th>
                    </tr>
                </thead>
                <tbody>
                    ${qaData.complianceChecks.map(check => `
                        <tr>
                            <td>
                                <strong>${check.standardName}</strong>
                                <br><small class="text-muted">${check.standard}</small>
                            </td>
                            <td>
                                <span class="badge bg-${getComplianceStatusColor(check.status)}">
                                    ${formatComplianceStatus(check.status)}
                                </span>
                            </td>
                            <td>
                                <div class="progress" style="width: 100px;">
                                    <div class="progress-bar bg-${getScoreColor(check.score)}" 
                                         style="width: ${check.score}%">${check.score}%</div>
                                </div>
                            </td>
                            <td>${check.requirementsMet}/${check.totalRequirements}</td>
                            <td>
                                ${check.issues.length > 0 ? 
                                    `<span class="badge bg-warning">${check.issues.length}</span>` : 
                                    '<span class="badge bg-success">None</span>'}
                            </td>
                            <td>${formatDate(check.checkDate)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Render quality metrics panel
function renderQualityMetricsPanel() {
    const metricsContent = document.getElementById('quality-metrics-content');
    if (!metricsContent) return;

    const qaData = window.qualityAssurance?.loadQAData() || { qualityMetrics: [] };
    
    metricsContent.innerHTML = `
        <div class="row">
            ${qaData.qualityMetrics.map(metric => `
                <div class="col-md-6 col-lg-4 mb-3">
                    <div class="card h-100">
                        <div class="card-body">
                            <h6 class="card-title">${metric.name}</h6>
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="h4 mb-0">${formatMetricValue(metric.value, metric.unit)}</span>
                                <span class="badge bg-${getMetricStatusColor(metric.status)}">
                                    ${formatMetricStatus(metric.status)}
                                </span>
                            </div>
                            <div class="progress mb-2" style="height: 8px;">
                                <div class="progress-bar bg-${getMetricStatusColor(metric.status)}" 
                                     style="width: ${getMetricProgressWidth(metric.value, metric.target, metric.unit)}%"></div>
                            </div>
                            <small class="text-muted">
                                Target: ${formatMetricValue(metric.target, metric.unit)} | 
                                Trend: <i class="fas fa-arrow-${getTrendIcon(metric.trend)}"></i> ${metric.trend}
                            </small>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Render audits panel
function renderAuditsPanel() {
    const auditsContent = document.getElementById('audits-content');
    if (!auditsContent) return;

    const qaData = window.qualityAssurance?.loadQAData() || { audits: [] };
    
    auditsContent.innerHTML = `
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Audit Title</th>
                        <th>Type</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Score</th>
                        <th>Findings</th>
                    </tr>
                </thead>
                <tbody>
                    ${qaData.audits.map(audit => `
                        <tr>
                            <td>
                                <strong>${audit.title}</strong>
                                <br><small class="text-muted">${audit.auditor}</small>
                            </td>
                            <td>
                                <span class="badge bg-secondary">${formatAuditType(audit.type)}</span>
                            </td>
                            <td>${formatDate(audit.auditDate)}</td>
                            <td>
                                <span class="badge bg-${getAuditStatusColor(audit.status)}">
                                    ${formatAuditStatus(audit.status)}
                                </span>
                            </td>
                            <td>
                                <div class="progress" style="width: 80px;">
                                    <div class="progress-bar bg-${getScoreColor(audit.score)}" 
                                         style="width: ${audit.score}%">${Math.round(audit.score)}%</div>
                                </div>
                            </td>
                            <td>
                                ${audit.findings > 0 ? 
                                    `<span class="badge bg-warning">${audit.findings}</span>` : 
                                    '<span class="badge bg-success">None</span>'}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Render incidents panel
function renderIncidentsPanel() {
    const incidentsContent = document.getElementById('incidents-content');
    if (!incidentsContent) return;

    const qaData = window.qualityAssurance?.loadQAData() || { incidents: [] };
    
    incidentsContent.innerHTML = `
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Incident ID</th>
                        <th>Type</th>
                        <th>Severity</th>
                        <th>Report Date</th>
                        <th>Status</th>
                        <th>Patient Involved</th>
                    </tr>
                </thead>
                <tbody>
                    ${qaData.incidents.map(incident => `
                        <tr>
                            <td><strong>${incident.id}</strong></td>
                            <td>
                                <span class="badge bg-info">${formatIncidentType(incident.type)}</span>
                            </td>
                            <td>
                                <span class="badge bg-${getSeverityColor(incident.severity)}">
                                    ${incident.severity.toUpperCase()}
                                </span>
                            </td>
                            <td>${formatDate(incident.reportDate)}</td>
                            <td>
                                <span class="badge bg-${getIncidentStatusColor(incident.status)}">
                                    ${formatIncidentStatus(incident.status)}
                                </span>
                            </td>
                            <td>
                                ${incident.patientInvolved ? 
                                    '<span class="badge bg-warning">Yes</span>' : 
                                    '<span class="badge bg-success">No</span>'}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Setup event listeners
function setupQAEventListeners() {
    document.querySelectorAll('#qaTabs button').forEach(tab => {
        tab.addEventListener('shown.bs.tab', function(e) {
            const target = e.target.getAttribute('data-bs-target');
            if (target === '#compliance-panel') renderCompliancePanel();
            if (target === '#quality-metrics-panel') renderQualityMetricsPanel();
            if (target === '#audits-panel') renderAuditsPanel();
            if (target === '#incidents-panel') renderIncidentsPanel();
        });
    });
}

// Utility functions
function getComplianceStatusColor(status) {
    switch (status) {
        case 'compliant': return 'success';
        case 'partially_compliant': return 'warning';
        case 'non_compliant': return 'danger';
        default: return 'secondary';
    }
}

function formatComplianceStatus(status) {
    return status.replace('_', ' ').toUpperCase();
}

function getScoreColor(score) {
    if (score >= 95) return 'success';
    if (score >= 85) return 'warning';
    return 'danger';
}

function getMetricStatusColor(status) {
    switch (status) {
        case 'excellent': return 'success';
        case 'meets_target': return 'primary';
        case 'below_target': return 'warning';
        case 'critical': return 'danger';
        default: return 'secondary';
    }
}

function formatMetricStatus(status) {
    return status.replace('_', ' ').toUpperCase();
}

function formatMetricValue(value, unit) {
    switch (unit) {
        case 'percentage': return `${Math.round(value)}%`;
        case 'rating': return `${value.toFixed(1)}/5`;
        case 'per_1000_visits': return `${value.toFixed(1)}/1000`;
        default: return Math.round(value);
    }
}

function getMetricProgressWidth(value, target, unit) {
    if (unit === 'per_1000_visits') {
        return Math.min(100, (target / Math.max(value, 0.1)) * 100);
    }
    return Math.min(100, (value / target) * 100);
}

function getTrendIcon(trend) {
    switch (trend) {
        case 'improving': return 'up text-success';
        case 'declining': return 'down text-danger';
        default: return 'right text-muted';
    }
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

function getAuditStatusColor(status) {
    switch (status) {
        case 'completed': return 'success';
        case 'in_progress': return 'warning';
        case 'scheduled': return 'info';
        default: return 'secondary';
    }
}

function formatAuditStatus(status) {
    return status.replace('_', ' ').toUpperCase();
}

function formatAuditType(type) {
    return type.replace('_', ' ').toUpperCase();
}

function getSeverityColor(severity) {
    switch (severity) {
        case 'critical': return 'danger';
        case 'high': return 'warning';
        case 'medium': return 'info';
        case 'low': return 'success';
        default: return 'secondary';
    }
}

function getIncidentStatusColor(status) {
    switch (status) {
        case 'closed': return 'success';
        case 'resolved': return 'primary';
        case 'investigating': return 'warning';
        case 'reported': return 'info';
        default: return 'secondary';
    }
}

function formatIncidentStatus(status) {
    return status.replace('_', ' ').toUpperCase();
}

function formatIncidentType(type) {
    return type.replace('_', ' ').toUpperCase();
}

// Action functions
function runComplianceAudit() {
    if (window.qualityAssurance) {
        window.qualityAssurance.runComplianceChecks();
        renderCompliancePanel();
        updateQAOverview();
        alert('Compliance audit completed successfully!');
    }
}

function generateQAReport() {
    if (window.qualityAssurance) {
        const report = window.qualityAssurance.generateQAReport();
        console.log('QA Report Generated:', report);
        alert('QA Report generated successfully! Check console for details.');
    }
}

function exportQAData() {
    if (window.qualityAssurance) {
        const qaData = window.qualityAssurance.loadQAData();
        const dataStr = JSON.stringify(qaData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `qa-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    initializeQADashboard();
});
