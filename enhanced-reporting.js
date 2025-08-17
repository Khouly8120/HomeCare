// Enhanced Reporting Module
// Handles custom stakeholder reports, KPI tracking, and automated report generation

// Global variables for reporting data
let reportingData = JSON.parse(localStorage.getItem('reportingData')) || {
    customReports: [],
    kpiTargets: {},
    reportSchedule: []
};

// KPI definitions and targets
const kpiDefinitions = {
    patient_satisfaction: { name: 'Patient Satisfaction', target: 4.5, unit: '/5', format: 'decimal' },
    provider_utilization: { name: 'Provider Utilization', target: 85, unit: '%', format: 'percentage' },
    compliance_rate: { name: 'Documentation Compliance', target: 95, unit: '%', format: 'percentage' },
    new_patients_monthly: { name: 'New Patients (Monthly)', target: 25, unit: '', format: 'number' },
    sessions_per_month: { name: 'Sessions per Month', target: 300, unit: '', format: 'number' },
    claims_approval_rate: { name: 'Claims Approval Rate', target: 90, unit: '%', format: 'percentage' },
    avg_sessions_per_patient: { name: 'Avg Sessions per Patient', target: 8, unit: '', format: 'decimal' },
    credentialing_compliance: { name: 'Credentialing Compliance', target: 100, unit: '%', format: 'percentage' }
};

// Initialize Enhanced Reporting Module
function initializeReportingModule() {
    console.log('Initializing Enhanced Reporting Module');
    loadReportingData();
    initializeKPITargets();
}

// Load reporting data from localStorage
function loadReportingData() {
    reportingData = JSON.parse(localStorage.getItem('reportingData')) || {
        customReports: [],
        kpiTargets: {},
        reportSchedule: []
    };
}

// Save reporting data to localStorage
function saveReportingData() {
    localStorage.setItem('reportingData', JSON.stringify(reportingData));
}

// Initialize KPI targets if not set
function initializeKPITargets() {
    if (Object.keys(reportingData.kpiTargets).length === 0) {
        Object.keys(kpiDefinitions).forEach(kpi => {
            reportingData.kpiTargets[kpi] = kpiDefinitions[kpi].target;
        });
        saveReportingData();
    }
}

// Calculate current KPIs
function calculateCurrentKPIs() {
    const kpis = {};
    
    // Patient Satisfaction
    const patientFeedback = feedbackData?.patientFeedback || [];
    const avgSatisfaction = patientFeedback.length > 0 ? 
        patientFeedback.reduce((sum, f) => sum + (f.overallRating || 0), 0) / patientFeedback.length : 0;
    kpis.patient_satisfaction = { value: avgSatisfaction, target: reportingData.kpiTargets.patient_satisfaction };
    
    // Provider Utilization
    const activeProviders = providers.filter(p => p.status === 'active');
    const avgUtilization = activeProviders.length > 0 ? 
        activeProviders.reduce((sum, p) => sum + (p.utilizationStats?.utilizationPercentage || 0), 0) / activeProviders.length : 0;
    kpis.provider_utilization = { value: avgUtilization, target: reportingData.kpiTargets.provider_utilization };
    
    // Documentation Compliance
    const totalRequirements = documentationData?.documentRequirements?.length || 0;
    const completedRequirements = documentationData?.documentRequirements?.filter(r => r.status === 'approved').length || 0;
    const complianceRate = totalRequirements > 0 ? (completedRequirements / totalRequirements) * 100 : 0;
    kpis.compliance_rate = { value: complianceRate, target: reportingData.kpiTargets.compliance_rate };
    
    // New Patients Monthly
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newPatientsThisMonth = patients.filter(p => {
        const addedDate = new Date(p.dateAdded);
        return addedDate.getMonth() === currentMonth && addedDate.getFullYear() === currentYear;
    }).length;
    kpis.new_patients_monthly = { value: newPatientsThisMonth, target: reportingData.kpiTargets.new_patients_monthly };
    
    // Sessions per Month (estimated from current data)
    const estimatedSessions = patients.length * 4; // Rough estimate
    kpis.sessions_per_month = { value: estimatedSessions, target: reportingData.kpiTargets.sessions_per_month };
    
    // Claims Approval Rate
    const totalAuths = authorizationRequests?.length || 0;
    const approvedAuths = authorizationRequests?.filter(a => a.status === 'approved').length || 0;
    const approvalRate = totalAuths > 0 ? (approvedAuths / totalAuths) * 100 : 0;
    kpis.claims_approval_rate = { value: approvalRate, target: reportingData.kpiTargets.claims_approval_rate };
    
    // Average Sessions per Patient
    const avgSessionsPerPatient = patients.length > 0 ? estimatedSessions / patients.length : 0;
    kpis.avg_sessions_per_patient = { value: avgSessionsPerPatient, target: reportingData.kpiTargets.avg_sessions_per_patient };
    
    // Credentialing Compliance
    const credentialingAlerts = forecastingData?.credentialingAlerts || [];
    const totalProviders = providers.length;
    const providersWithIssues = credentialingAlerts.length;
    const credentialingCompliance = totalProviders > 0 ? ((totalProviders - providersWithIssues) / totalProviders) * 100 : 100;
    kpis.credentialing_compliance = { value: credentialingCompliance, target: reportingData.kpiTargets.credentialing_compliance };
    
    return kpis;
}

// Generate executive summary report
function generateExecutiveSummary() {
    const kpis = calculateCurrentKPIs();
    const currentDate = new Date();
    
    const summary = {
        reportDate: currentDate.toISOString(),
        reportPeriod: `${currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
        kpiSummary: kpis,
        highlights: [],
        concerns: [],
        recommendations: []
    };
    
    // Analyze KPIs and generate insights
    Object.keys(kpis).forEach(kpiKey => {
        const kpi = kpis[kpiKey];
        const definition = kpiDefinitions[kpiKey];
        const performance = (kpi.value / kpi.target) * 100;
        
        if (performance >= 100) {
            summary.highlights.push(`${definition.name}: ${formatKPIValue(kpi.value, definition)} (${performance.toFixed(0)}% of target)`);
        } else if (performance < 80) {
            summary.concerns.push(`${definition.name}: ${formatKPIValue(kpi.value, definition)} (${performance.toFixed(0)}% of target)`);
            summary.recommendations.push(`Improve ${definition.name} to reach target of ${formatKPIValue(kpi.target, definition)}`);
        }
    });
    
    return summary;
}

// Format KPI value based on type
function formatKPIValue(value, definition) {
    switch (definition.format) {
        case 'percentage':
            return `${value.toFixed(1)}${definition.unit}`;
        case 'decimal':
            return `${value.toFixed(1)}${definition.unit}`;
        case 'number':
            return `${Math.round(value)}${definition.unit}`;
        default:
            return `${value}${definition.unit}`;
    }
}

// Render reporting dashboard
function renderReportingDashboard() {
    const container = document.getElementById('reportingDashboardContainer');
    if (!container) return;
    
    const kpis = calculateCurrentKPIs();
    const summary = generateExecutiveSummary();
    
    container.innerHTML = `
        <!-- KPI Overview -->
        <div class="row mb-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h6><i class="fas fa-tachometer-alt"></i> Key Performance Indicators</h6>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            ${Object.keys(kpis).map(kpiKey => {
                                const kpi = kpis[kpiKey];
                                const definition = kpiDefinitions[kpiKey];
                                const performance = (kpi.value / kpi.target) * 100;
                                const statusClass = performance >= 100 ? 'success' : performance >= 80 ? 'warning' : 'danger';
                                
                                return `
                                    <div class="col-md-3 mb-3">
                                        <div class="card border-${statusClass}">
                                            <div class="card-body text-center">
                                                <h6 class="card-title">${definition.name}</h6>
                                                <h4 class="text-${statusClass}">${formatKPIValue(kpi.value, definition)}</h4>
                                                <small class="text-muted">Target: ${formatKPIValue(kpi.target, definition)}</small>
                                                <div class="progress mt-2" style="height: 6px;">
                                                    <div class="progress-bar bg-${statusClass}" style="width: ${Math.min(performance, 100)}%"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Executive Summary -->
        <div class="row mb-4">
            <div class="col-md-4">
                <div class="card border-success">
                    <div class="card-header bg-success text-white">
                        <h6><i class="fas fa-thumbs-up"></i> Highlights</h6>
                    </div>
                    <div class="card-body">
                        ${summary.highlights.length > 0 ? `
                            <ul class="list-unstyled mb-0">
                                ${summary.highlights.map(highlight => `<li><i class="fas fa-check text-success me-2"></i>${highlight}</li>`).join('')}
                            </ul>
                        ` : '<p class="text-muted mb-0">No highlights this period.</p>'}
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card border-warning">
                    <div class="card-header bg-warning text-white">
                        <h6><i class="fas fa-exclamation-triangle"></i> Concerns</h6>
                    </div>
                    <div class="card-body">
                        ${summary.concerns.length > 0 ? `
                            <ul class="list-unstyled mb-0">
                                ${summary.concerns.map(concern => `<li><i class="fas fa-exclamation text-warning me-2"></i>${concern}</li>`).join('')}
                            </ul>
                        ` : '<p class="text-muted mb-0">No major concerns identified.</p>'}
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card border-info">
                    <div class="card-header bg-info text-white">
                        <h6><i class="fas fa-lightbulb"></i> Recommendations</h6>
                    </div>
                    <div class="card-body">
                        ${summary.recommendations.length > 0 ? `
                            <ul class="list-unstyled mb-0">
                                ${summary.recommendations.map(rec => `<li><i class="fas fa-arrow-right text-info me-2"></i>${rec}</li>`).join('')}
                            </ul>
                        ` : '<p class="text-muted mb-0">Continue current performance.</p>'}
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Report Actions -->
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h6><i class="fas fa-file-export"></i> Report Generation</h6>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-3">
                                <button class="btn btn-primary w-100" onclick="exportExecutiveSummary()">
                                    <i class="fas fa-chart-pie"></i> Executive Summary
                                </button>
                            </div>
                            <div class="col-md-3">
                                <button class="btn btn-success w-100" onclick="exportKPIReport()">
                                    <i class="fas fa-tachometer-alt"></i> KPI Report
                                </button>
                            </div>
                            <div class="col-md-3">
                                <button class="btn btn-info w-100" onclick="exportOperationalReport()">
                                    <i class="fas fa-cogs"></i> Operational Report
                                </button>
                            </div>
                            <div class="col-md-3">
                                <button class="btn btn-warning w-100" onclick="exportComplianceReport()">
                                    <i class="fas fa-shield-alt"></i> Compliance Report
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Global functions for report exports
window.exportExecutiveSummary = function() {
    const summary = generateExecutiveSummary();
    const reportData = [{
        'Report Type': 'Executive Summary',
        'Report Date': new Date(summary.reportDate).toLocaleDateString(),
        'Report Period': summary.reportPeriod,
        'Highlights': summary.highlights.join('; '),
        'Concerns': summary.concerns.join('; '),
        'Recommendations': summary.recommendations.join('; ')
    }];
    exportToCSV(reportData, 'executive-summary-report');
};

window.exportKPIReport = function() {
    const kpis = calculateCurrentKPIs();
    const reportData = Object.keys(kpis).map(kpiKey => {
        const kpi = kpis[kpiKey];
        const definition = kpiDefinitions[kpiKey];
        const performance = ((kpi.value / kpi.target) * 100).toFixed(1);
        
        return {
            'KPI': definition.name,
            'Current Value': formatKPIValue(kpi.value, definition),
            'Target': formatKPIValue(kpi.target, definition),
            'Performance %': performance + '%',
            'Status': performance >= 100 ? 'On Target' : performance >= 80 ? 'Near Target' : 'Below Target'
        };
    });
    exportToCSV(reportData, 'kpi-performance-report');
};

window.exportOperationalReport = function() {
    const reportData = [{
        'Report Type': 'Operational Summary',
        'Generated Date': new Date().toLocaleDateString(),
        'Total Patients': patients.length,
        'Active Providers': providers.filter(p => p.status === 'active').length,
        'Pending Benefits Verifications': benefitsVerifications?.filter(b => b.status === 'pending').length || 0,
        'Pending Authorizations': authorizationRequests?.filter(a => a.status === 'pending').length || 0,
        'Overdue Documents': documentationData?.complianceAlerts?.filter(a => a.alertType === 'overdue').length || 0,
        'Pending Surveys': feedbackData?.surveys?.filter(s => s.status === 'pending').length || 0
    }];
    exportToCSV(reportData, 'operational-summary-report');
};

window.exportComplianceReport = function() {
    const totalRequirements = documentationData?.documentRequirements?.length || 0;
    const completedRequirements = documentationData?.documentRequirements?.filter(r => r.status === 'approved').length || 0;
    const credentialingAlerts = forecastingData?.credentialingAlerts || [];
    
    const reportData = [{
        'Report Type': 'Compliance Summary',
        'Generated Date': new Date().toLocaleDateString(),
        'Total Document Requirements': totalRequirements,
        'Completed Requirements': completedRequirements,
        'Compliance Rate': totalRequirements > 0 ? ((completedRequirements / totalRequirements) * 100).toFixed(1) + '%' : '100%',
        'High Priority Credentialing Alerts': credentialingAlerts.filter(a => a.priority === 'high').length,
        'Medium Priority Credentialing Alerts': credentialingAlerts.filter(a => a.priority === 'medium').length,
        'Overdue Authorizations': authorizationRequests?.filter(a => new Date(a.endDate) < new Date()).length || 0
    }];
    exportToCSV(reportData, 'compliance-summary-report');
};

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    initializeReportingModule();
    
    // Set up event listener for when reporting section becomes visible
    const originalShowSection = window.showSection;
    window.showSection = function(sectionId) {
        if (originalShowSection) {
            originalShowSection(sectionId);
        }
        
        if (sectionId === 'reporting') {
            setTimeout(() => {
                renderReportingDashboard();
            }, 100);
        }
    };
});

// Export functions for global access
window.reportingModule = {
    initializeReportingModule,
    calculateCurrentKPIs,
    generateExecutiveSummary,
    renderReportingDashboard,
    loadReportingData,
    saveReportingData
};
