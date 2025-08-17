// Advanced Analytics Dashboard - UI for AI-powered insights and predictions

// Render advanced analytics dashboard
function renderAdvancedAnalyticsDashboard() {
    const container = document.getElementById('analyticsDashboardContainer');
    if (!container) return;

    // Generate fresh analytics
    const insights = generateInsights();
    const riskScores = calculateRiskScores();
    const trends = generateTrendAnalysis();
    const revenueForecast = forecastRevenue(3);

    // Get high-priority items
    const criticalRisks = riskScores.filter(r => r.riskLevel === 'Critical' || r.riskLevel === 'High');
    const urgentInsights = insights.filter(i => i.priority <= 2);

    container.innerHTML = `
        <div class="row mb-4">
            <!-- AI Insights Overview Cards -->
            <div class="col-md-3 mb-3">
                <div class="card border-danger">
                    <div class="card-body text-center">
                        <i class="fas fa-exclamation-triangle fa-2x text-danger mb-2"></i>
                        <h5 class="card-title">Critical Risks</h5>
                        <h3 class="text-danger">${criticalRisks.length}</h3>
                        <small class="text-muted">Require attention</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card border-warning">
                    <div class="card-body text-center">
                        <i class="fas fa-lightbulb fa-2x text-warning mb-2"></i>
                        <h5 class="card-title">AI Insights</h5>
                        <h3 class="text-warning">${urgentInsights.length}</h3>
                        <small class="text-muted">Actionable insights</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card border-info">
                    <div class="card-body text-center">
                        <i class="fas fa-chart-line fa-2x text-info mb-2"></i>
                        <h5 class="card-title">Trends Tracked</h5>
                        <h3 class="text-info">${trends.length}</h3>
                        <small class="text-muted">Performance metrics</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card border-success">
                    <div class="card-body text-center">
                        <i class="fas fa-dollar-sign fa-2x text-success mb-2"></i>
                        <h5 class="card-title">Revenue Forecast</h5>
                        <h3 class="text-success">$${Math.round(revenueForecast.totalForecast / 1000)}K</h3>
                        <small class="text-muted">Next 3 months</small>
                    </div>
                </div>
            </div>
        </div>

        <!-- Analytics Tabs -->
        <ul class="nav nav-tabs" id="analyticsTabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="ai-insights-tab" data-bs-toggle="tab" data-bs-target="#ai-insights" type="button" role="tab">
                    <i class="fas fa-brain"></i> AI Insights
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="risk-scores-tab" data-bs-toggle="tab" data-bs-target="#risk-scores" type="button" role="tab">
                    <i class="fas fa-shield-alt"></i> Risk Analysis
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="predictions-tab" data-bs-toggle="tab" data-bs-target="#predictions" type="button" role="tab">
                    <i class="fas fa-crystal-ball"></i> Predictions
                </button>
            </li>
        </ul>

        <div class="tab-content mt-3" id="analyticsTabContent">
            <!-- AI Insights Tab -->
            <div class="tab-pane fade show active" id="ai-insights" role="tabpanel">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0"><i class="fas fa-brain"></i> AI-Powered Insights</h5>
                        <button class="btn btn-sm btn-primary" onclick="refreshInsights()">
                            <i class="fas fa-sync-alt"></i> Refresh Analysis
                        </button>
                    </div>
                    <div class="card-body">
                        ${renderAIInsights(insights)}
                    </div>
                </div>
            </div>

            <!-- Risk Scores Tab -->
            <div class="tab-pane fade" id="risk-scores" role="tabpanel">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0"><i class="fas fa-shield-alt"></i> Risk Analysis</h5>
                    </div>
                    <div class="card-body">
                        ${renderRiskScores(riskScores)}
                    </div>
                </div>
            </div>

            <!-- Predictions Tab -->
            <div class="tab-pane fade" id="predictions" role="tabpanel">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0"><i class="fas fa-crystal-ball"></i> Predictive Analytics</h5>
                    </div>
                    <div class="card-body">
                        ${renderPredictions(revenueForecast)}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Render AI insights
function renderAIInsights(insights) {
    if (insights.length === 0) {
        return `
            <div class="text-center py-4">
                <i class="fas fa-brain fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No Insights Available</h5>
                <p class="text-muted">The AI system will generate insights as more data becomes available.</p>
            </div>
        `;
    }

    return insights.map(insight => `
        <div class="card mb-3 border-${getInsightBorderColor(insight.type)}">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h6 class="card-title text-${getInsightTextColor(insight.type)}">
                            <i class="fas fa-${getInsightIcon(insight.type)}"></i>
                            ${insight.title}
                        </h6>
                        <p class="card-text">${insight.description}</p>
                        
                        <div class="mt-3">
                            <h6 class="text-muted mb-2">Recommended Actions:</h6>
                            <ul class="list-unstyled">
                                ${insight.recommendations.slice(0, 3).map(rec => `
                                    <li class="mb-1">
                                        <i class="fas fa-check-circle text-success me-2"></i>
                                        ${rec}
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                    <div class="ms-3">
                        <span class="badge bg-${getImpactBadgeColor(insight.impact)} fs-6">
                            ${insight.impact} Impact
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Render risk scores
function renderRiskScores(riskScores) {
    if (riskScores.length === 0) {
        return `
            <div class="text-center py-4">
                <i class="fas fa-shield-check fa-3x text-success mb-3"></i>
                <h5 class="text-success">No High Risks Detected</h5>
                <p class="text-muted">All monitored entities are within acceptable risk levels.</p>
            </div>
        `;
    }

    return `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Entity</th>
                        <th>Risk Type</th>
                        <th>Risk Score</th>
                        <th>Level</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${riskScores.map(risk => `
                        <tr>
                            <td>
                                <strong>${risk.entityName}</strong>
                            </td>
                            <td>
                                <span class="badge bg-secondary">
                                    ${risk.type.replace('_', ' ')}
                                </span>
                            </td>
                            <td>
                                <div class="d-flex align-items-center">
                                    <div class="progress me-2" style="width: 60px; height: 20px;">
                                        <div class="progress-bar bg-${getRiskProgressColor(risk.riskScore)}" 
                                             style="width: ${risk.riskScore}%"></div>
                                    </div>
                                    <span class="fw-bold">${risk.riskScore}%</span>
                                </div>
                            </td>
                            <td>
                                <span class="badge bg-${getRiskLevelBadgeColor(risk.riskLevel)}">
                                    ${risk.riskLevel}
                                </span>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-outline-primary" onclick="viewRiskDetails('${risk.entityId}')">
                                    <i class="fas fa-eye"></i> View
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Render predictions
function renderPredictions(revenueForecast) {
    return `
        <div class="row">
            <div class="col-md-8 mb-4">
                <div class="card">
                    <div class="card-header">
                        <h6 class="mb-0">Revenue Forecast - Next 3 Months</h6>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Month</th>
                                        <th>Forecasted Revenue</th>
                                        <th>Confidence</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${revenueForecast.forecasts.map(forecast => `
                                        <tr>
                                            <td><strong>${forecast.monthName}</strong></td>
                                            <td class="text-success">
                                                <strong>$${forecast.forecastedRevenue.toLocaleString()}</strong>
                                            </td>
                                            <td>
                                                <div class="progress" style="height: 20px;">
                                                    <div class="progress-bar bg-info" 
                                                         style="width: ${forecast.confidence * 100}%">
                                                        ${Math.round(forecast.confidence * 100)}%
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="mt-3 p-3 bg-light rounded">
                            <strong>Total 3-Month Forecast: $${revenueForecast.totalForecast.toLocaleString()}</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Utility functions
function getInsightIcon(type) {
    const icons = {
        'concern': 'exclamation-triangle',
        'opportunity': 'lightbulb',
        'success': 'check-circle'
    };
    return icons[type] || 'info-circle';
}

function getInsightBorderColor(type) {
    const colors = {
        'concern': 'danger',
        'opportunity': 'warning',
        'success': 'success'
    };
    return colors[type] || 'info';
}

function getInsightTextColor(type) {
    return getInsightBorderColor(type);
}

function getImpactBadgeColor(impact) {
    const colors = {
        'high': 'danger',
        'medium': 'warning',
        'low': 'info',
        'positive': 'success'
    };
    return colors[impact] || 'secondary';
}

function getRiskProgressColor(score) {
    if (score >= 80) return 'danger';
    if (score >= 60) return 'warning';
    if (score >= 40) return 'info';
    return 'success';
}

function getRiskLevelBadgeColor(level) {
    const colors = {
        'Critical': 'danger',
        'High': 'warning',
        'Medium': 'info',
        'Low': 'success',
        'Minimal': 'secondary'
    };
    return colors[level] || 'secondary';
}

// Action functions
function refreshInsights() {
    if (typeof generateInsights === 'function') {
        generateInsights();
        renderAdvancedAnalyticsDashboard();
    }
}

function viewRiskDetails(entityId) {
    alert(`Risk details for entity: ${entityId}\n\nThis would show detailed risk analysis and recommendations.`);
}

// Initialize analytics dashboard when section is shown
function initializeAnalyticsDashboard() {
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const analyticsSection = document.getElementById('advanced-analytics');
                if (analyticsSection && !analyticsSection.style.display) {
                    renderAdvancedAnalyticsDashboard();
                }
            }
        });
    });

    const analyticsSection = document.getElementById('advanced-analytics');
    if (analyticsSection) {
        observer.observe(analyticsSection, { attributes: true });
    }
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    initializeAnalyticsDashboard();
});

// Export for global access
window.analyticsDashboard = {
    renderAdvancedAnalyticsDashboard,
    refreshInsights,
    viewRiskDetails
};
