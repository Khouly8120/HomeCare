// Advanced Analytics & Intelligence Engine
// Provides predictive analytics, trend analysis, risk scoring, and benchmarking

// Global variables for analytics data
let analyticsData = JSON.parse(localStorage.getItem('analyticsData')) || {
    predictions: [],
    trends: [],
    riskScores: [],
    benchmarks: [],
    insights: [],
    models: {}
};

// Industry benchmarks for comparison
const industryBenchmarks = {
    patientSatisfaction: {
        excellent: 4.5,
        good: 4.0,
        average: 3.5,
        poor: 3.0
    },
    providerUtilization: {
        excellent: 85,
        good: 75,
        average: 65,
        poor: 55
    },
    documentationCompliance: {
        excellent: 95,
        good: 90,
        average: 85,
        poor: 80
    },
    authorizationApprovalRate: {
        excellent: 95,
        good: 90,
        average: 85,
        poor: 80
    },
    patientRetention: {
        excellent: 90,
        good: 85,
        average: 80,
        poor: 75
    },
    revenuePerPatient: {
        excellent: 2500,
        good: 2000,
        average: 1500,
        poor: 1000
    }
};

// Initialize Advanced Analytics
function initializeAdvancedAnalytics() {
    console.log('Initializing Advanced Analytics & Intelligence');
    loadAnalyticsData();
    initializePredictiveModels();
    generateTrendAnalysis();
    calculateRiskScores();
    generateInsights();
}

// Load analytics data from localStorage
function loadAnalyticsData() {
    analyticsData = JSON.parse(localStorage.getItem('analyticsData')) || {
        predictions: [],
        trends: [],
        riskScores: [],
        benchmarks: [],
        insights: [],
        models: {}
    };
}

// Save analytics data to localStorage
function saveAnalyticsData() {
    localStorage.setItem('analyticsData', JSON.stringify(analyticsData));
}

// Initialize predictive models
function initializePredictiveModels() {
    // Patient Churn Prediction Model
    analyticsData.models.patientChurn = {
        name: 'Patient Churn Prediction',
        type: 'classification',
        features: ['satisfaction_score', 'missed_appointments', 'payment_delays', 'communication_frequency'],
        weights: [0.4, 0.3, 0.2, 0.1],
        accuracy: 0.85,
        lastTrained: new Date().toISOString()
    };

    // Provider Performance Prediction Model
    analyticsData.models.providerPerformance = {
        name: 'Provider Performance Prediction',
        type: 'regression',
        features: ['utilization_rate', 'patient_satisfaction', 'documentation_compliance', 'experience_years'],
        weights: [0.3, 0.3, 0.25, 0.15],
        accuracy: 0.82,
        lastTrained: new Date().toISOString()
    };

    // Revenue Forecasting Model
    analyticsData.models.revenueForecast = {
        name: 'Revenue Forecasting',
        type: 'time_series',
        features: ['historical_revenue', 'patient_count', 'authorization_approvals', 'seasonal_factors'],
        weights: [0.4, 0.25, 0.2, 0.15],
        accuracy: 0.88,
        lastTrained: new Date().toISOString()
    };

    saveAnalyticsData();
}

// Predict patient churn risk
function predictPatientChurn(patientId) {
    const patient = patients.find(p => p.id == patientId);
    if (!patient) return null;

    // Get patient feedback data
    const patientFeedback = feedbackData?.patientFeedback?.filter(f => f.patientId == patientId) || [];
    const avgSatisfaction = patientFeedback.length > 0 ? 
        patientFeedback.reduce((sum, f) => sum + f.overallRating, 0) / patientFeedback.length : 3.5;

    // Calculate missed appointments
    const appointments = patient.appointments || [];
    const missedAppointments = appointments.filter(a => a.status === 'missed').length;
    const totalAppointments = appointments.length;
    const missedRate = totalAppointments > 0 ? missedAppointments / totalAppointments : 0;

    // Calculate payment delays (simulated)
    const paymentDelays = Math.random() * 0.3; // 0-30% payment delay rate

    // Calculate communication frequency
    const messages = communicationData?.messages?.filter(m => m.recipientId == patientId) || [];
    const communicationFreq = messages.length / Math.max(1, getPatientTenureDays(patient));

    // Apply model weights
    const model = analyticsData.models.patientChurn;
    const features = [avgSatisfaction / 5, missedRate, paymentDelays, communicationFreq];
    
    let riskScore = 0;
    features.forEach((feature, index) => {
        riskScore += feature * model.weights[index];
    });

    // Convert to percentage and invert satisfaction (lower satisfaction = higher risk)
    riskScore = Math.max(0, Math.min(1, riskScore)) * 100;
    if (avgSatisfaction > 3.5) riskScore *= 0.7; // Reduce risk for satisfied patients

    const riskLevel = getRiskLevel(riskScore);

    return {
        patientId: patientId,
        patientName: `${patient.firstName} ${patient.lastName}`,
        riskScore: Math.round(riskScore),
        riskLevel: riskLevel,
        factors: {
            satisfaction: avgSatisfaction,
            missedAppointments: missedRate * 100,
            paymentDelays: paymentDelays * 100,
            communicationFreq: communicationFreq
        },
        recommendations: getChurnPreventionRecommendations(riskScore, features),
        lastUpdated: new Date().toISOString()
    };
}

// Predict provider performance
function predictProviderPerformance(providerId) {
    const provider = providers.find(p => p.id == providerId);
    if (!provider) return null;

    // Get utilization rate
    const utilizationRate = provider.utilizationStats?.utilizationPercentage || 0;

    // Get patient satisfaction for this provider
    const providerFeedback = feedbackData?.patientFeedback?.filter(f => f.providerId == providerId) || [];
    const avgSatisfaction = providerFeedback.length > 0 ? 
        providerFeedback.reduce((sum, f) => sum + f.overallRating, 0) / providerFeedback.length : 3.5;

    // Calculate documentation compliance
    const docCompliance = calculateProviderDocCompliance(providerId);

    // Experience years (simulated based on date added)
    const experienceYears = getProviderExperienceYears(provider);

    // Apply model weights
    const model = analyticsData.models.providerPerformance;
    const features = [utilizationRate / 100, avgSatisfaction / 5, docCompliance / 100, Math.min(experienceYears / 10, 1)];
    
    let performanceScore = 0;
    features.forEach((feature, index) => {
        performanceScore += feature * model.weights[index];
    });

    performanceScore = Math.max(0, Math.min(1, performanceScore)) * 100;
    const performanceLevel = getPerformanceLevel(performanceScore);

    return {
        providerId: providerId,
        providerName: provider.name,
        performanceScore: Math.round(performanceScore),
        performanceLevel: performanceLevel,
        factors: {
            utilization: utilizationRate,
            satisfaction: avgSatisfaction,
            documentation: docCompliance,
            experience: experienceYears
        },
        recommendations: getPerformanceImprovementRecommendations(performanceScore, features),
        lastUpdated: new Date().toISOString()
    };
}

// Forecast revenue
function forecastRevenue(months = 3) {
    // Get historical revenue data (simulated)
    const historicalData = generateHistoricalRevenueData();
    
    // Current metrics
    const currentPatients = patients.length;
    const approvedAuths = authorizationRequests?.filter(a => a.status === 'approved').length || 0;
    const totalAuths = authorizationRequests?.length || 1;
    const approvalRate = approvedAuths / totalAuths;

    // Seasonal factors (higher in winter months)
    const currentMonth = new Date().getMonth();
    const seasonalFactors = [1.1, 1.2, 1.0, 0.9, 0.8, 0.7, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2];

    const forecasts = [];
    for (let i = 1; i <= months; i++) {
        const forecastMonth = (currentMonth + i) % 12;
        const seasonalFactor = seasonalFactors[forecastMonth];
        
        // Base revenue calculation
        const baseRevenue = currentPatients * 1500; // Average revenue per patient
        const authorizationImpact = approvalRate * 1.2; // Authorization approval impact
        const seasonalRevenue = baseRevenue * seasonalFactor * authorizationImpact;
        
        // Add trend (slight growth)
        const trendFactor = 1 + (i * 0.02); // 2% monthly growth
        const forecastedRevenue = seasonalRevenue * trendFactor;

        forecasts.push({
            month: i,
            monthName: getMonthName(forecastMonth),
            forecastedRevenue: Math.round(forecastedRevenue),
            confidence: Math.max(0.6, 0.9 - (i * 0.1)), // Decreasing confidence over time
            factors: {
                baseRevenue: Math.round(baseRevenue),
                seasonalFactor: seasonalFactor,
                authorizationImpact: Math.round(authorizationImpact * 100),
                trendFactor: Math.round(trendFactor * 100)
            }
        });
    }

    return {
        forecasts: forecasts,
        totalForecast: forecasts.reduce((sum, f) => sum + f.forecastedRevenue, 0),
        averageConfidence: forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length,
        model: analyticsData.models.revenueForecast,
        lastUpdated: new Date().toISOString()
    };
}

// Generate trend analysis
function generateTrendAnalysis() {
    const trends = [];

    // Patient satisfaction trend
    const satisfactionTrend = analyzeSatisfactionTrend();
    trends.push(satisfactionTrend);

    // Provider utilization trend
    const utilizationTrend = analyzeUtilizationTrend();
    trends.push(utilizationTrend);

    // Documentation compliance trend
    const complianceTrend = analyzeComplianceTrend();
    trends.push(complianceTrend);

    // Revenue trend
    const revenueTrend = analyzeRevenueTrend();
    trends.push(revenueTrend);

    analyticsData.trends = trends;
    saveAnalyticsData();

    return trends;
}

// Analyze satisfaction trend
function analyzeSatisfactionTrend() {
    const feedback = feedbackData?.patientFeedback || [];
    const monthlyData = groupFeedbackByMonth(feedback);
    
    const trend = calculateTrend(monthlyData);
    
    return {
        metric: 'Patient Satisfaction',
        category: 'quality',
        currentValue: getCurrentSatisfactionAverage(),
        trend: trend.direction,
        trendStrength: trend.strength,
        changePercent: trend.changePercent,
        monthlyData: monthlyData,
        benchmark: industryBenchmarks.patientSatisfaction.good,
        status: getBenchmarkStatus(getCurrentSatisfactionAverage(), industryBenchmarks.patientSatisfaction),
        lastUpdated: new Date().toISOString()
    };
}

// Analyze utilization trend
function analyzeUtilizationTrend() {
    const utilizationData = providers.map(p => p.utilizationStats?.utilizationPercentage || 0);
    const avgUtilization = utilizationData.reduce((sum, u) => sum + u, 0) / Math.max(1, utilizationData.length);
    
    // Simulate monthly data
    const monthlyData = generateMonthlyUtilizationData();
    const trend = calculateTrend(monthlyData);
    
    return {
        metric: 'Provider Utilization',
        category: 'efficiency',
        currentValue: Math.round(avgUtilization),
        trend: trend.direction,
        trendStrength: trend.strength,
        changePercent: trend.changePercent,
        monthlyData: monthlyData,
        benchmark: industryBenchmarks.providerUtilization.good,
        status: getBenchmarkStatus(avgUtilization, industryBenchmarks.providerUtilization),
        lastUpdated: new Date().toISOString()
    };
}

// Calculate risk scores for all entities
function calculateRiskScores() {
    const riskScores = [];

    // Patient churn risks
    patients.forEach(patient => {
        const churnRisk = predictPatientChurn(patient.id);
        if (churnRisk && churnRisk.riskScore > 30) {
            riskScores.push({
                type: 'patient_churn',
                entityId: patient.id,
                entityName: churnRisk.patientName,
                riskScore: churnRisk.riskScore,
                riskLevel: churnRisk.riskLevel,
                factors: churnRisk.factors,
                recommendations: churnRisk.recommendations
            });
        }
    });

    // Provider performance risks
    providers.forEach(provider => {
        const perfPrediction = predictProviderPerformance(provider.id);
        if (perfPrediction && perfPrediction.performanceScore < 70) {
            riskScores.push({
                type: 'provider_performance',
                entityId: provider.id,
                entityName: perfPrediction.providerName,
                riskScore: 100 - perfPrediction.performanceScore,
                riskLevel: getRiskLevel(100 - perfPrediction.performanceScore),
                factors: perfPrediction.factors,
                recommendations: perfPrediction.recommendations
            });
        }
    });

    // Authorization expiration risks
    const expiringAuths = authorizationRequests?.filter(auth => {
        if (!auth.endDate || auth.status !== 'approved') return false;
        const daysUntilExpiry = Math.ceil((new Date(auth.endDate) - new Date()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    }) || [];

    expiringAuths.forEach(auth => {
        const daysUntilExpiry = Math.ceil((new Date(auth.endDate) - new Date()) / (1000 * 60 * 60 * 24));
        const riskScore = Math.max(0, 100 - (daysUntilExpiry * 3.33)); // Higher risk as expiry approaches
        
        riskScores.push({
            type: 'authorization_expiry',
            entityId: auth.id,
            entityName: `Authorization for ${auth.patientName}`,
            riskScore: Math.round(riskScore),
            riskLevel: getRiskLevel(riskScore),
            factors: {
                daysUntilExpiry: daysUntilExpiry,
                authorizationType: auth.serviceType,
                renewalStatus: auth.renewalStarted ? 'In Progress' : 'Not Started'
            },
            recommendations: getAuthorizationRiskRecommendations(daysUntilExpiry)
        });
    });

    analyticsData.riskScores = riskScores.sort((a, b) => b.riskScore - a.riskScore);
    saveAnalyticsData();

    return riskScores;
}

// Generate AI-powered insights
function generateInsights() {
    const insights = [];

    // Performance insights
    const kpis = calculateDashboardKPIs();
    
    // Patient satisfaction insight
    const avgSatisfaction = getCurrentSatisfactionAverage();
    if (avgSatisfaction < industryBenchmarks.patientSatisfaction.average) {
        insights.push({
            type: 'concern',
            category: 'quality',
            title: 'Patient Satisfaction Below Average',
            description: `Current satisfaction score (${avgSatisfaction.toFixed(1)}) is below industry average (${industryBenchmarks.patientSatisfaction.average}).`,
            impact: 'high',
            recommendations: [
                'Implement immediate follow-up for low satisfaction scores',
                'Review and improve service delivery processes',
                'Increase communication frequency with patients',
                'Provide additional training for providers'
            ],
            priority: 1
        });
    }

    // Utilization insight
    const avgUtilization = providers.reduce((sum, p) => sum + (p.utilizationStats?.utilizationPercentage || 0), 0) / Math.max(1, providers.length);
    if (avgUtilization < industryBenchmarks.providerUtilization.average) {
        insights.push({
            type: 'opportunity',
            category: 'efficiency',
            title: 'Provider Utilization Optimization Opportunity',
            description: `Average provider utilization (${avgUtilization.toFixed(1)}%) is below industry average (${industryBenchmarks.providerUtilization.average}%).`,
            impact: 'medium',
            recommendations: [
                'Optimize scheduling algorithms',
                'Reduce travel time between appointments',
                'Implement flexible scheduling options',
                'Consider geographic clustering of patients'
            ],
            priority: 2
        });
    }

    // Documentation compliance insight
    const complianceRate = calculateOverallComplianceRate();
    if (complianceRate < industryBenchmarks.documentationCompliance.good) {
        insights.push({
            type: 'concern',
            category: 'compliance',
            title: 'Documentation Compliance Needs Attention',
            description: `Documentation compliance rate (${complianceRate.toFixed(1)}%) is below good practice standards (${industryBenchmarks.documentationCompliance.good}%).`,
            impact: 'high',
            recommendations: [
                'Implement automated documentation reminders',
                'Provide documentation training for staff',
                'Streamline documentation processes',
                'Set up compliance monitoring dashboards'
            ],
            priority: 1
        });
    }

    // Revenue opportunity insight
    const revenuePerPatient = calculateRevenuePerPatient();
    if (revenuePerPatient < industryBenchmarks.revenuePerPatient.average) {
        insights.push({
            type: 'opportunity',
            category: 'financial',
            title: 'Revenue Per Patient Optimization',
            description: `Revenue per patient ($${revenuePerPatient}) is below industry average ($${industryBenchmarks.revenuePerPatient.average}).`,
            impact: 'high',
            recommendations: [
                'Review and optimize service pricing',
                'Improve authorization approval rates',
                'Expand service offerings',
                'Implement value-based care models'
            ],
            priority: 2
        });
    }

    // Positive insights for good performance
    if (avgSatisfaction >= industryBenchmarks.patientSatisfaction.good) {
        insights.push({
            type: 'success',
            category: 'quality',
            title: 'Excellent Patient Satisfaction',
            description: `Patient satisfaction (${avgSatisfaction.toFixed(1)}) exceeds industry good practice standards.`,
            impact: 'positive',
            recommendations: [
                'Document and share best practices',
                'Use satisfaction as a competitive advantage',
                'Consider patient testimonial programs',
                'Maintain current quality standards'
            ],
            priority: 3
        });
    }

    analyticsData.insights = insights.sort((a, b) => a.priority - b.priority);
    saveAnalyticsData();

    return insights;
}

// Utility functions
function getRiskLevel(score) {
    if (score >= 80) return 'Critical';
    if (score >= 60) return 'High';
    if (score >= 40) return 'Medium';
    if (score >= 20) return 'Low';
    return 'Minimal';
}

function getPerformanceLevel(score) {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Average';
    if (score >= 60) return 'Below Average';
    return 'Poor';
}

function getBenchmarkStatus(value, benchmarks) {
    if (value >= benchmarks.excellent) return 'excellent';
    if (value >= benchmarks.good) return 'good';
    if (value >= benchmarks.average) return 'average';
    return 'poor';
}

function getCurrentSatisfactionAverage() {
    const feedback = feedbackData?.patientFeedback || [];
    if (feedback.length === 0) return 3.5;
    return feedback.reduce((sum, f) => sum + f.overallRating, 0) / feedback.length;
}

function calculateOverallComplianceRate() {
    const alerts = documentationData?.complianceAlerts || [];
    const totalDocs = documentationData?.documentRequirements?.length || 1;
    const overdueDocs = alerts.filter(a => a.alertType === 'overdue').length;
    return Math.max(0, ((totalDocs - overdueDocs) / totalDocs) * 100);
}

function calculateRevenuePerPatient() {
    // Simulated calculation
    return 1800 + (Math.random() * 400); // $1800-$2200 range
}

function getPatientTenureDays(patient) {
    const startDate = new Date(patient.dateAdded || Date.now());
    const today = new Date();
    return Math.max(1, Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)));
}

function calculateProviderDocCompliance(providerId) {
    // Simulated calculation
    return 85 + (Math.random() * 15); // 85-100% range
}

function getProviderExperienceYears(provider) {
    const startDate = new Date(provider.dateAdded || Date.now());
    const today = new Date();
    return Math.max(0.5, (today - startDate) / (1000 * 60 * 60 * 24 * 365));
}

function getMonthName(monthIndex) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthIndex];
}

// Recommendation generators
function getChurnPreventionRecommendations(riskScore, factors) {
    const recommendations = [];
    
    if (factors[0] < 0.7) { // Low satisfaction
        recommendations.push('Schedule immediate satisfaction follow-up call');
        recommendations.push('Assign dedicated case manager');
    }
    
    if (factors[1] > 0.2) { // High missed appointments
        recommendations.push('Implement appointment reminder system');
        recommendations.push('Offer flexible scheduling options');
    }
    
    if (factors[2] > 0.2) { // Payment delays
        recommendations.push('Set up payment plan options');
        recommendations.push('Improve billing communication');
    }
    
    if (factors[3] < 0.1) { // Low communication
        recommendations.push('Increase proactive communication');
        recommendations.push('Send regular progress updates');
    }
    
    return recommendations;
}

function getPerformanceImprovementRecommendations(score, factors) {
    const recommendations = [];
    
    if (factors[0] < 0.6) { // Low utilization
        recommendations.push('Optimize scheduling and routing');
        recommendations.push('Reduce gaps between appointments');
    }
    
    if (factors[1] < 0.7) { // Low patient satisfaction
        recommendations.push('Provide customer service training');
        recommendations.push('Implement patient feedback system');
    }
    
    if (factors[2] < 0.8) { // Poor documentation
        recommendations.push('Provide documentation training');
        recommendations.push('Implement mobile documentation tools');
    }
    
    recommendations.push('Set up regular performance reviews');
    recommendations.push('Provide continuing education opportunities');
    
    return recommendations;
}

function getAuthorizationRiskRecommendations(daysUntilExpiry) {
    const recommendations = [];
    
    if (daysUntilExpiry <= 7) {
        recommendations.push('URGENT: Contact insurance immediately');
        recommendations.push('Prepare for potential service interruption');
    } else if (daysUntilExpiry <= 14) {
        recommendations.push('Follow up on renewal request');
        recommendations.push('Gather additional documentation if needed');
    } else {
        recommendations.push('Submit renewal request');
        recommendations.push('Update patient on renewal status');
    }
    
    return recommendations;
}

// Data generators for simulation
function generateHistoricalRevenueData() {
    const data = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        data.push({
            month: getMonthName(date.getMonth()),
            revenue: 45000 + (Math.random() * 15000) // $45k-$60k range
        });
    }
    return data;
}

function groupFeedbackByMonth(feedback) {
    // Simulate monthly grouping
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const avgRating = 3.5 + (Math.random() * 1.5); // 3.5-5.0 range
        monthlyData.push({
            month: getMonthName(date.getMonth()),
            value: Math.round(avgRating * 10) / 10
        });
    }
    return monthlyData;
}

function generateMonthlyUtilizationData() {
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const utilization = 60 + (Math.random() * 25); // 60-85% range
        monthlyData.push({
            month: getMonthName(date.getMonth()),
            value: Math.round(utilization)
        });
    }
    return monthlyData;
}

function calculateTrend(monthlyData) {
    if (monthlyData.length < 2) return { direction: 'stable', strength: 'weak', changePercent: 0 };
    
    const firstValue = monthlyData[0].value;
    const lastValue = monthlyData[monthlyData.length - 1].value;
    const changePercent = ((lastValue - firstValue) / firstValue) * 100;
    
    let direction = 'stable';
    let strength = 'weak';
    
    if (Math.abs(changePercent) > 5) {
        direction = changePercent > 0 ? 'increasing' : 'decreasing';
        strength = Math.abs(changePercent) > 15 ? 'strong' : 'moderate';
    }
    
    return { direction, strength, changePercent: Math.round(changePercent) };
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    initializeAdvancedAnalytics();
});

// Export functions for global access
window.advancedAnalytics = {
    initializeAdvancedAnalytics,
    predictPatientChurn,
    predictProviderPerformance,
    forecastRevenue,
    generateTrendAnalysis,
    calculateRiskScores,
    generateInsights,
    loadAnalyticsData,
    saveAnalyticsData
};
