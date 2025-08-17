// Forecasting & Staffing Management Module
// Handles patient demand forecasting, staffing needs calculation, and credentialing alerts

// Global variables for forecasting data
let forecastingData = JSON.parse(localStorage.getItem('forecastingData')) || {
    demandForecasts: [],
    staffingNeeds: [],
    credentialingAlerts: []
};

// Initialize Forecasting & Staffing Module
function initializeForecastingModule() {
    console.log('Initializing Forecasting & Staffing Module');
    loadForecastingData();
    calculateCurrentDemandForecast();
    checkCredentialingExpirations();
    
    // Set up tab event listeners
    setupForecastingTabListeners();
}

// Set up tab event listeners for forecasting dashboard
function setupForecastingTabListeners() {
    const forecastingTab = document.getElementById('forecasting-tab');
    if (forecastingTab) {
        forecastingTab.addEventListener('shown.bs.tab', function (e) {
            console.log('Forecasting tab activated, rendering dashboard...');
            renderForecastingDashboard();
        });
    }
}

// Load forecasting data from localStorage
function loadForecastingData() {
    forecastingData = JSON.parse(localStorage.getItem('forecastingData')) || {
        demandForecasts: [],
        staffingNeeds: [],
        credentialingAlerts: []
    };
}

// Save forecasting data to localStorage
function saveForecastingData() {
    localStorage.setItem('forecastingData', JSON.stringify(forecastingData));
}

// Calculate patient demand forecast based on historical data
function calculateCurrentDemandForecast() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Get historical patient data for the last 6 months
    const historicalData = getHistoricalPatientData(6);
    
    // Calculate trends
    const trends = calculateDemandTrends(historicalData);
    
    // Generate forecast for next 3 months
    const forecast = generateDemandForecast(trends, 3);
    
    // Calculate staffing needs based on forecast
    const staffingNeeds = calculateStaffingNeeds(forecast);
    
    // Update forecasting data
    forecastingData.demandForecasts = forecast;
    forecastingData.staffingNeeds = staffingNeeds;
    forecastingData.lastCalculated = new Date().toISOString();
    
    saveForecastingData();
    return { forecast, staffingNeeds };
}

// Get historical patient data
function getHistoricalPatientData(months) {
    const currentDate = new Date();
    const historicalData = [];
    
    for (let i = months; i >= 0; i--) {
        const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthKey = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
        
        const monthData = {
            month: monthKey,
            date: targetDate,
            newPatients: 0,
            activePatients: 0,
            totalSessions: 0,
            averageSessionsPerPatient: 0,
            clinicBreakdown: {}
        };
        
        // Count patients and sessions for this month
        patients.forEach(patient => {
            const patientDate = new Date(patient.dateAdded);
            const isNewThisMonth = patientDate.getFullYear() === targetDate.getFullYear() && 
                                  patientDate.getMonth() === targetDate.getMonth();
            
            if (isNewThisMonth) {
                monthData.newPatients++;
            }
            
            // Check if patient was active this month (had appointments or payments)
            const hasActivityThisMonth = hasPatientActivityInMonth(patient, targetDate);
            if (hasActivityThisMonth) {
                monthData.activePatients++;
                
                // Count sessions
                const sessionsThisMonth = countPatientSessionsInMonth(patient, targetDate);
                monthData.totalSessions += sessionsThisMonth;
                
                // Track by clinic
                const clinic = patient.clinicName || 'Unknown';
                if (!monthData.clinicBreakdown[clinic]) {
                    monthData.clinicBreakdown[clinic] = { patients: 0, sessions: 0 };
                }
                monthData.clinicBreakdown[clinic].patients++;
                monthData.clinicBreakdown[clinic].sessions += sessionsThisMonth;
            }
        });
        
        monthData.averageSessionsPerPatient = monthData.activePatients > 0 ? 
            Math.round((monthData.totalSessions / monthData.activePatients) * 10) / 10 : 0;
        
        historicalData.push(monthData);
    }
    
    return historicalData;
}

// Check if patient had activity in specific month
function hasPatientActivityInMonth(patient, targetDate) {
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    
    // Check appointments
    if (patient.appointments && patient.appointments.length > 0) {
        const hasAppointment = patient.appointments.some(apt => {
            const aptDate = new Date(apt.appointmentDate || apt.dateOfService);
            return aptDate.getFullYear() === year && aptDate.getMonth() === month;
        });
        if (hasAppointment) return true;
    }
    
    // Check payments (indicating sessions)
    if (patient.payments && patient.payments.length > 0) {
        const hasPayment = patient.payments.some(payment => {
            const paymentDate = new Date(payment.dateOfService || payment.dateOfTransaction);
            return paymentDate.getFullYear() === year && paymentDate.getMonth() === month;
        });
        if (hasPayment) return true;
    }
    
    return false;
}

// Count patient sessions in specific month
function countPatientSessionsInMonth(patient, targetDate) {
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    let sessionCount = 0;
    
    // Count from appointments
    if (patient.appointments) {
        sessionCount += patient.appointments.filter(apt => {
            const aptDate = new Date(apt.appointmentDate || apt.dateOfService);
            return aptDate.getFullYear() === year && aptDate.getMonth() === month;
        }).length;
    }
    
    // Count from payments if no appointments data
    if (sessionCount === 0 && patient.payments) {
        sessionCount = patient.payments.filter(payment => {
            const paymentDate = new Date(payment.dateOfService || payment.dateOfTransaction);
            return paymentDate.getFullYear() === year && paymentDate.getMonth() === month;
        }).length;
    }
    
    return sessionCount;
}

// Calculate demand trends
function calculateDemandTrends(historicalData) {
    if (historicalData.length < 3) {
        return { newPatientsGrowth: 0, sessionsGrowth: 0, confidence: 'low' };
    }
    
    const recent3Months = historicalData.slice(-3);
    const previous3Months = historicalData.slice(-6, -3);
    
    const recentAvgNewPatients = recent3Months.reduce((sum, month) => sum + month.newPatients, 0) / 3;
    const previousAvgNewPatients = previous3Months.reduce((sum, month) => sum + month.newPatients, 0) / 3;
    
    const recentAvgSessions = recent3Months.reduce((sum, month) => sum + month.totalSessions, 0) / 3;
    const previousAvgSessions = previous3Months.reduce((sum, month) => sum + month.totalSessions, 0) / 3;
    
    const newPatientsGrowth = previousAvgNewPatients > 0 ? 
        ((recentAvgNewPatients - previousAvgNewPatients) / previousAvgNewPatients) * 100 : 0;
    
    const sessionsGrowth = previousAvgSessions > 0 ? 
        ((recentAvgSessions - previousAvgSessions) / previousAvgSessions) * 100 : 0;
    
    const confidence = historicalData.length >= 6 ? 'high' : 'medium';
    
    return { newPatientsGrowth, sessionsGrowth, confidence };
}

// Generate demand forecast
function generateDemandForecast(trends, monthsAhead) {
    const currentDate = new Date();
    const forecast = [];
    
    // Get current month baseline
    const currentMonthData = getHistoricalPatientData(1)[0];
    
    for (let i = 1; i <= monthsAhead; i++) {
        const forecastDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
        const monthKey = `${forecastDate.getFullYear()}-${String(forecastDate.getMonth() + 1).padStart(2, '0')}`;
        
        // Apply growth trends
        const growthFactor = 1 + (trends.newPatientsGrowth / 100);
        const sessionsGrowthFactor = 1 + (trends.sessionsGrowth / 100);
        
        const forecastedNewPatients = Math.round(currentMonthData.newPatients * Math.pow(growthFactor, i));
        const forecastedTotalSessions = Math.round(currentMonthData.totalSessions * Math.pow(sessionsGrowthFactor, i));
        const forecastedActivePatients = Math.round(currentMonthData.activePatients * Math.pow(growthFactor, i * 0.8));
        
        forecast.push({
            month: monthKey,
            date: forecastDate,
            forecastedNewPatients,
            forecastedActivePatients,
            forecastedTotalSessions,
            confidence: trends.confidence,
            createdAt: new Date().toISOString()
        });
    }
    
    return forecast;
}

// Calculate staffing needs based on forecast
function calculateStaffingNeeds(forecast) {
    const staffingNeeds = [];
    
    // Assumptions for calculations
    const sessionsPerProviderPerMonth = 120; // Average capacity
    const patientsPerProviderRatio = 15; // Optimal caseload
    const utilizationTarget = 0.85; // 85% utilization target
    
    forecast.forEach(monthForecast => {
        const requiredProviders = Math.ceil(monthForecast.forecastedTotalSessions / (sessionsPerProviderPerMonth * utilizationTarget));
        const currentProviders = providers.filter(p => p.status === 'active').length;
        const staffingGap = requiredProviders - currentProviders;
        
        const recommendation = staffingGap > 0 ? 
            `Hire ${staffingGap} additional provider(s)` : 
            staffingGap < -2 ? 
            `Consider reducing staff by ${Math.abs(staffingGap)} provider(s)` : 
            'Current staffing is adequate';
        
        staffingNeeds.push({
            month: monthForecast.month,
            forecastedSessions: monthForecast.forecastedTotalSessions,
            requiredProviders,
            currentProviders,
            staffingGap,
            recommendation,
            priority: staffingGap > 2 ? 'high' : staffingGap > 0 ? 'medium' : 'low'
        });
    });
    
    return staffingNeeds;
}

// Check credentialing expirations
function checkCredentialingExpirations() {
    const today = new Date();
    const threeMonthsFromNow = new Date(today.getTime() + (90 * 24 * 60 * 60 * 1000));
    
    const credentialingAlerts = [];
    
    providers.forEach(provider => {
        // Check license expiration (assuming 2-year renewal cycle)
        const licenseDate = new Date(provider.dateAdded);
        const licenseExpiry = new Date(licenseDate.getTime() + (2 * 365 * 24 * 60 * 60 * 1000));
        
        if (licenseExpiry <= threeMonthsFromNow && licenseExpiry > today) {
            const daysUntilExpiry = Math.ceil((licenseExpiry - today) / (1000 * 60 * 60 * 24));
            credentialingAlerts.push({
                providerId: provider.id,
                providerName: provider.name,
                alertType: 'license_expiration',
                expiryDate: licenseExpiry.toISOString(),
                daysUntilExpiry,
                priority: daysUntilExpiry <= 30 ? 'high' : daysUntilExpiry <= 60 ? 'medium' : 'low',
                message: `PT License expires in ${daysUntilExpiry} days`
            });
        }
        
        // Check background check (annual renewal)
        const backgroundCheckDate = new Date(provider.dateAdded);
        const backgroundExpiry = new Date(backgroundCheckDate.getTime() + (365 * 24 * 60 * 60 * 1000));
        
        if (backgroundExpiry <= threeMonthsFromNow && backgroundExpiry > today) {
            const daysUntilExpiry = Math.ceil((backgroundExpiry - today) / (1000 * 60 * 60 * 24));
            credentialingAlerts.push({
                providerId: provider.id,
                providerName: provider.name,
                alertType: 'background_check',
                expiryDate: backgroundExpiry.toISOString(),
                daysUntilExpiry,
                priority: daysUntilExpiry <= 30 ? 'high' : daysUntilExpiry <= 60 ? 'medium' : 'low',
                message: `Background check expires in ${daysUntilExpiry} days`
            });
        }
    });
    
    forecastingData.credentialingAlerts = credentialingAlerts;
    saveForecastingData();
    
    return credentialingAlerts;
}

// Render forecasting dashboard
function renderForecastingDashboard() {
    const container = document.getElementById('forecastingDashboardContainer');
    if (!container) return;
    
    const { forecast, staffingNeeds } = calculateCurrentDemandForecast();
    const credentialingAlerts = checkCredentialingExpirations();
    
    container.innerHTML = `
        <!-- Demand Forecast Cards -->
        <div class="row mb-4">
            <div class="col-md-4">
                <div class="card border-primary">
                    <div class="card-header bg-primary text-white">
                        <h6><i class="fas fa-chart-line"></i> Next Month Forecast</h6>
                    </div>
                    <div class="card-body">
                        <div class="text-center">
                            <h4 class="text-primary">${forecast[0]?.forecastedNewPatients || 0}</h4>
                            <p class="mb-1">New Patients</p>
                            <h4 class="text-info">${forecast[0]?.forecastedTotalSessions || 0}</h4>
                            <p class="mb-0">Total Sessions</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card border-warning">
                    <div class="card-header bg-warning text-white">
                        <h6><i class="fas fa-users"></i> Staffing Needs</h6>
                    </div>
                    <div class="card-body">
                        <div class="text-center">
                            <h4 class="text-warning">${staffingNeeds[0]?.requiredProviders || 0}</h4>
                            <p class="mb-1">Providers Needed</p>
                            <h4 class="text-${staffingNeeds[0]?.staffingGap > 0 ? 'danger' : 'success'}">${staffingNeeds[0]?.staffingGap || 0}</h4>
                            <p class="mb-0">Staffing Gap</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card border-danger">
                    <div class="card-header bg-danger text-white">
                        <h6><i class="fas fa-exclamation-triangle"></i> Credentialing Alerts</h6>
                    </div>
                    <div class="card-body">
                        <div class="text-center">
                            <h4 class="text-danger">${credentialingAlerts.filter(a => a.priority === 'high').length}</h4>
                            <p class="mb-1">High Priority</p>
                            <h4 class="text-warning">${credentialingAlerts.filter(a => a.priority === 'medium').length}</h4>
                            <p class="mb-0">Medium Priority</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Detailed Tables -->
        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h6><i class="fas fa-chart-bar"></i> 3-Month Demand Forecast</h6>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Month</th>
                                        <th>New Patients</th>
                                        <th>Total Sessions</th>
                                        <th>Confidence</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${forecast.map(f => `
                                        <tr>
                                            <td>${new Date(f.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</td>
                                            <td>${f.forecastedNewPatients}</td>
                                            <td>${f.forecastedTotalSessions}</td>
                                            <td><span class="badge bg-${f.confidence === 'high' ? 'success' : f.confidence === 'medium' ? 'warning' : 'secondary'}">${f.confidence}</span></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h6><i class="fas fa-user-plus"></i> Staffing Recommendations</h6>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Month</th>
                                        <th>Required</th>
                                        <th>Current</th>
                                        <th>Recommendation</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${staffingNeeds.map(s => `
                                        <tr>
                                            <td>${new Date(s.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</td>
                                            <td>${s.requiredProviders}</td>
                                            <td>${s.currentProviders}</td>
                                            <td><span class="badge bg-${s.priority === 'high' ? 'danger' : s.priority === 'medium' ? 'warning' : 'success'}">${s.recommendation}</span></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Credentialing Alerts -->
        ${credentialingAlerts.length > 0 ? `
        <div class="row mt-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h6><i class="fas fa-certificate"></i> Credentialing Alerts</h6>
                    </div>
                    <div class="card-body">
                        ${credentialingAlerts.map(alert => `
                            <div class="alert alert-${alert.priority === 'high' ? 'danger' : alert.priority === 'medium' ? 'warning' : 'info'} mb-2">
                                <strong>${alert.providerName}</strong> - ${alert.message}
                                <small class="float-end">Expires: ${new Date(alert.expiryDate).toLocaleDateString()}</small>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
        ` : ''}
    `;
}

// Global functions for button clicks
window.refreshForecast = function() {
    renderForecastingDashboard();
};

window.exportForecastReport = function() {
    const { forecast, staffingNeeds } = calculateCurrentDemandForecast();
    const credentialingAlerts = checkCredentialingExpirations();
    
    const reportData = [
        {
            'Report Type': 'Demand Forecast',
            'Generated Date': new Date().toLocaleDateString(),
            'Next Month New Patients': forecast[0]?.forecastedNewPatients || 0,
            'Next Month Total Sessions': forecast[0]?.forecastedTotalSessions || 0,
            'Providers Needed': staffingNeeds[0]?.requiredProviders || 0,
            'Current Providers': staffingNeeds[0]?.currentProviders || 0,
            'Staffing Gap': staffingNeeds[0]?.staffingGap || 0,
            'High Priority Alerts': credentialingAlerts.filter(a => a.priority === 'high').length,
            'Medium Priority Alerts': credentialingAlerts.filter(a => a.priority === 'medium').length
        }
    ];
    
    exportToCSV(reportData, 'forecasting-staffing-report');
};

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    initializeForecastingModule();
    
    // Set up event listener for when forecasting section becomes visible
    const originalShowSection = window.showSection;
    window.showSection = function(sectionId) {
        if (originalShowSection) {
            originalShowSection(sectionId);
        }
        
        if (sectionId === 'forecasting') {
            setTimeout(() => {
                renderForecastingDashboard();
            }, 100);
        }
    };
});

// Export functions for global access
window.forecastingModule = {
    initializeForecastingModule,
    calculateCurrentDemandForecast,
    checkCredentialingExpirations,
    renderForecastingDashboard,
    loadForecastingData,
    saveForecastingData
};
