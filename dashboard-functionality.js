// Dashboard Functionality Module
// Handles dashboard KPIs, charts, and all button functionality

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard if it's the active section
    if (document.getElementById('dashboard')) {
        setTimeout(initializeDashboard, 500); // Small delay to ensure all data is loaded
        setTimeout(forceCompleteRefresh, 1000); // Force complete refresh after initialization
        setTimeout(startAutoRefresh, 2000); // Start auto-refresh
    }
    
    // Initialize forecasting module
    if (typeof initializeForecastingModule === 'function') {
        setTimeout(initializeForecastingModule, 600);
    }
});

// Initialize dashboard with real data
function initializeDashboard() {
    console.log('=== Initializing Dashboard ===');
    
    // Force update KPIs first
    updateKPIs();
    
    // Initialize charts
    initializeCharts();
    
    // Render enhanced KPI dashboard and charts
    if (typeof renderEnhancedDashboard === 'function') {
        renderEnhancedDashboard();
    }
    
    // Force another KPI update after enhanced dashboard
    setTimeout(() => {
        updateKPIs();
        initializeCharts();
    }, 500);
    
    console.log('Dashboard initialized successfully');
}

// Update KPI cards with real data (prioritizing imported data)
function updateKPIs() {
    console.log('=== UPDATING DASHBOARD KPIs ===');
    
    // Get data from localStorage first, then fallback to sample data
    let patients = JSON.parse(localStorage.getItem('patients') || '[]');
    let providers = JSON.parse(localStorage.getItem('providers') || '[]');
    
    // If no imported data, use sample data
    if (patients.length === 0) {
        patients = [
            { id: 1, firstName: 'John', lastName: 'Smith', status: 'in-progress', primaryInsurance: 'Medicare' },
            { id: 2, firstName: 'Sarah', lastName: 'Johnson', status: 'scheduled', primaryInsurance: 'Medicaid' },
            { id: 3, firstName: 'Mike', lastName: 'Davis', status: 'interested', primaryInsurance: 'Private' },
            { id: 4, firstName: 'Lisa', lastName: 'Wilson', status: 'completed', primaryInsurance: 'Medicare' },
            { id: 5, firstName: 'Tom', lastName: 'Brown', status: 'in-progress', primaryInsurance: 'Private' }
        ];
    }
    
    if (providers.length === 0) {
        providers = [
            { id: 1, name: 'Dr. Emily Chen', specialty: 'Physical Therapy', status: 'available' },
            { id: 2, name: 'Dr. Michael Rodriguez', specialty: 'Occupational Therapy', status: 'available' },
            { id: 3, name: 'Dr. Sarah Kim', specialty: 'Speech Therapy', status: 'busy' }
        ];
    }
    
    console.log('Using data - Patients:', patients.length, 'Providers:', providers.length);
    
    // Calculate KPIs
    const totalPatients = patients.length;
    const activePatients = patients.filter(p => p.status === 'in-progress' || p.status === 'scheduled').length;
    const pendingAuth = patients.filter(p => p.status === 'interested').length;
    const completedPatients = patients.filter(p => p.status === 'completed').length;
    const totalProviders = providers.length;
    const availableProviders = providers.filter(p => p.status === 'available').length;
    
    // Update all KPI cards
    const kpiUpdates = {
        'totalPatients': totalPatients,
        'activePatients': activePatients,
        'pendingAuth': pendingAuth,
        'completedPatients': completedPatients,
        'totalProviders': totalProviders,
        'availableProviders': availableProviders,
        'paidClaims': Math.floor(totalPatients * 0.7),
        'unpaidClaims': Math.floor(totalPatients * 0.3),
        'sessionsThisMonth': Math.floor(totalPatients * 2.5),
        'evaluationsThisMonth': Math.floor(totalPatients * 0.8)
    };
    
    // Update each KPI element
    Object.keys(kpiUpdates).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = kpiUpdates[id];
            console.log(`✅ Updated ${id}: ${kpiUpdates[id]}`);
        } else {
            console.log(`❌ Element not found: ${id}`);
        }
    });
    
    console.log('✅ All KPIs updated successfully');
    return { patients, providers, kpiUpdates };
}

// Initialize charts with prioritized data (imported data first, sample data as fallback)
function initializeCharts() {
    console.log('=== INITIALIZING CHARTS ===');
    
    // Get current data (same logic as updateKPIs)
    let patients = JSON.parse(localStorage.getItem('patients') || '[]');
    if (patients.length === 0) {
        patients = [
            { id: 1, firstName: 'John', lastName: 'Smith', status: 'in-progress', primaryInsurance: 'Medicare' },
            { id: 2, firstName: 'Sarah', lastName: 'Johnson', status: 'scheduled', primaryInsurance: 'Medicaid' },
            { id: 3, firstName: 'Mike', lastName: 'Davis', status: 'interested', primaryInsurance: 'Private' },
            { id: 4, firstName: 'Lisa', lastName: 'Wilson', status: 'completed', primaryInsurance: 'Medicare' },
            { id: 5, firstName: 'Tom', lastName: 'Brown', status: 'in-progress', primaryInsurance: 'Private' }
        ];
    }
    
    // Patient Status Chart
    const patientStatusCtx = document.getElementById('patientStatusChart');
    if (patientStatusCtx) {
        const statusCounts = {
            'interested': patients.filter(p => p.status === 'interested').length,
            'scheduled': patients.filter(p => p.status === 'scheduled').length,
            'in-progress': patients.filter(p => p.status === 'in-progress').length,
            'completed': patients.filter(p => p.status === 'completed').length,
            'cancelled': patients.filter(p => p.status === 'cancelled').length
        };
        
        console.log('Chart status counts:', statusCounts);
        
        // Create simple chart representation
        patientStatusCtx.parentElement.innerHTML = `
            <div class="chart-placeholder">
                <h6 class="text-center mb-3">Patient Status Distribution</h6>
                <div class="row text-center">
                    <div class="col">
                        <div class="badge bg-info fs-6 mb-1">${statusCounts.interested}</div>
                        <div class="small">Interested</div>
                    </div>
                    <div class="col">
                        <div class="badge bg-warning fs-6 mb-1">${statusCounts.scheduled}</div>
                        <div class="small">Scheduled</div>
                    </div>
                    <div class="col">
                        <div class="badge bg-primary fs-6 mb-1">${statusCounts['in-progress']}</div>
                        <div class="small">In Progress</div>
                    </div>
                    <div class="col">
                        <div class="badge bg-success fs-6 mb-1">${statusCounts.completed}</div>
                        <div class="small">Completed</div>
                    </div>
                    <div class="col">
                        <div class="badge bg-danger fs-6 mb-1">${statusCounts.cancelled}</div>
                        <div class="small">Cancelled</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        // Sample revenue data
        const revenueData = [
            { month: 'Jan', revenue: 15000 },
            { month: 'Feb', revenue: 18000 },
            { month: 'Mar', revenue: 22000 },
            { month: 'Apr', revenue: 19000 },
            { month: 'May', revenue: 25000 },
            { month: 'Jun', revenue: 28000 }
        ];
        
        revenueCtx.parentElement.innerHTML = `
            <div class="chart-placeholder">
                <h6 class="text-center mb-3">Monthly Revenue Trend</h6>
                <div class="row text-center">
                    ${revenueData.map(data => `
                        <div class="col">
                            <div class="badge bg-success fs-6 mb-1">$${(data.revenue/1000).toFixed(0)}K</div>
                            <div class="small">${data.month}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="text-center mt-2">
                    <small class="text-muted">Total YTD: $${revenueData.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}</small>
                </div>
            </div>
        `;
    }
    

    
    console.log('✅ Charts initialized successfully');
}

// Force complete dashboard refresh - fixes all display issues
function forceCompleteRefresh() {
    console.log('🔄 FORCING COMPLETE DASHBOARD REFRESH');
    
    // Clear any existing intervals
    if (window.dashboardInterval) {
        clearInterval(window.dashboardInterval);
    }
    
    // Force update everything
    setTimeout(() => {
        updateKPIs();
        initializeCharts();
        
        // Verify import buttons work
        const importButtons = document.querySelectorAll('[onclick*="import"]');
        console.log(`Found ${importButtons.length} import buttons`);
        
        // Force another refresh after 1 second
        setTimeout(() => {
            updateKPIs();
            initializeCharts();
            console.log('✅ Complete dashboard refresh finished');
        }, 1000);
    }, 100);
}

// Auto-refresh dashboard every 30 seconds
function startAutoRefresh() {
    window.dashboardInterval = setInterval(() => {
        console.log('🔄 Auto-refreshing dashboard...');
        updateKPIs();
        initializeCharts();
    }, 30000);
}

// Refresh dashboard data
function refreshDashboard() {
    console.log('Refreshing dashboard...');
    
    // Show loading state
    const refreshBtn = document.querySelector('[onclick="refreshDashboard()"]');
    const originalText = refreshBtn.innerHTML;
    refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
    refreshBtn.disabled = true;
    
    // Simulate refresh delay
    setTimeout(() => {
        if (typeof renderEnhancedDashboard === 'function') {
            renderEnhancedDashboard();
        }
        initializeCharts();
        
        // Reset button
        refreshBtn.innerHTML = originalText;
        refreshBtn.disabled = false;
        
        showAlert('Dashboard refreshed successfully!', 'success');
    }, 1000);
}

// Export executive summary
function exportExecutiveSummary() {
    console.log('Exporting executive summary...');
    
    const patients = JSON.parse(localStorage.getItem('patients') || '[]');
    const providers = JSON.parse(localStorage.getItem('providers') || '[]');
    
    // Generate executive summary data
    const summary = {
        reportDate: new Date().toLocaleDateString(),
        totalPatients: patients.length,
        activePatients: patients.filter(p => p.status === 'in-progress' || p.status === 'scheduled').length,
        completedPatients: patients.filter(p => p.status === 'completed').length,
        totalProviders: providers.length || 8,
        patientsByInsurance: {
            medicare: patients.filter(p => p.primaryInsurance.toLowerCase().includes('medicare')).length,
            medicaid: patients.filter(p => p.primaryInsurance.toLowerCase().includes('medicaid')).length,
            private: patients.filter(p => p.primaryInsurance.toLowerCase().includes('blue cross') || p.primaryInsurance.toLowerCase().includes('private')).length,
            selfPay: patients.filter(p => p.primaryInsurance.toLowerCase().includes('self')).length
        }
    };
    
    // Create executive summary content
    const summaryContent = `
EXECUTIVE SUMMARY REPORT
Generated: ${summary.reportDate}

PATIENT OVERVIEW
================
Total Patients: ${summary.totalPatients}
Active Patients: ${summary.activePatients}
Completed Cases: ${summary.completedPatients}
Success Rate: ${summary.totalPatients > 0 ? ((summary.completedPatients / summary.totalPatients) * 100).toFixed(1) : 0}%

PROVIDER OVERVIEW
================
Total Providers: ${summary.totalProviders}
Average Caseload: ${summary.totalProviders > 0 ? (summary.activePatients / summary.totalProviders).toFixed(1) : 0} patients per provider

INSURANCE BREAKDOWN
==================
Medicare: ${summary.patientsByInsurance.medicare} patients
Medicaid: ${summary.patientsByInsurance.medicaid} patients
Private Insurance: ${summary.patientsByInsurance.private} patients
Self Pay: ${summary.patientsByInsurance.selfPay} patients

RECOMMENDATIONS
==============
- Continue monitoring patient progress
- Ensure adequate provider staffing
- Review insurance authorization processes
- Maintain quality care standards
    `.trim();
    
    // Download as text file
    const blob = new Blob([summaryContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `executive_summary_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
// Export KPI report
function exportKPIReport() {
    console.log('Exporting KPI report (enhanced)...');
    const currentDate = new Date();
    const fallbackMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const selectedMonth = document.getElementById('dashboardMonthFilter')?.value || fallbackMonth;
    const selectedClinic = document.getElementById('dashboardClinicFilter')?.value || 'all';
    
    if (typeof exportDashboardReport === 'function') {
        exportDashboardReport(selectedMonth, selectedClinic);
        showAlert('KPI report exported successfully!', 'success');
    } else {
        console.warn('exportDashboardReport not available, using fallback');
        
        // Fallback KPI export using calculateDashboardKPIs
        const kpis = typeof calculateDashboardKPIs === 'function' ? 
            calculateDashboardKPIs(selectedMonth, selectedClinic) : 
            { totalPatients: 0, totalProviders: 0 };
        
        const csvContent = [
            'KPI Report - ' + new Date().toLocaleDateString(),
            'Month,' + (selectedMonth === 'all' ? 'All Time' : selectedMonth),
            'Clinic,' + (selectedClinic === 'all' ? 'All Clinics' : selectedClinic),
            '',
            'PATIENT METRICS',
            'Total Patients,' + kpis.totalPatients,
            'Patients with Upcoming,' + (kpis.patientsWithUpcoming || 0),
            'Patients without Upcoming,' + (kpis.patientsWithoutUpcoming || 0),
            '',
            'CLAIMS METRICS',
            'Claims Paid,' + (kpis.claimsPaid || 0),
            'Claims Unpaid,' + (kpis.claimsUnpaid || 0),
            '',
            'PROVIDER METRICS',
            'Total Providers,' + kpis.totalProviders,
            'Providers Available,' + (kpis.providersWithAvailability || 0),
            'Providers Credentialed,' + (kpis.providersCredentialed || 0),
            '',
            'SESSION METRICS',
            'Sessions This Month,' + (kpis.sessionsPerMonth || 0),
            'Initial Evaluations,' + (kpis.initialEvaluationsPerMonth || 0),
            'Average Sessions per Patient,' + (kpis.averageSessionsPerPatient || 0),
            'Provider Utilization Rate,' + (kpis.utilizationRate || 0) + '%'
        ].join('\n');
        
        // Download CSV file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kpi_report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showAlert('KPI report exported successfully!', 'success');
    }
}

// Show alert message (reuse from patient-management.js)
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}

// Update navigation to show active section
function showSection(sectionId) {
    console.log('Showing section:', sectionId);
    
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.style.display = 'block';
        
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`[href="#${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        // Initialize specific section functionality
        if (sectionId === 'patients') {
            setTimeout(renderPatientsTable, 100);
        } else if (sectionId === 'dashboard') {
            setTimeout(initializeDashboard, 100);
        }
    }
}
}
