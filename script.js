// Home Care PT Manager - Main JavaScript File

// Data storage (using localStorage for persistence)
let patients = JSON.parse(localStorage.getItem('patients') || '[]');
let providers = JSON.parse(localStorage.getItem('providers') || '[]');
let referrals = JSON.parse(localStorage.getItem('referrals') || '[]');
let appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
let insuranceClaims = JSON.parse(localStorage.getItem('insuranceClaims') || '[]');
let competitors = JSON.parse(localStorage.getItem('competitors') || '[]');
let activities = JSON.parse(localStorage.getItem('activities') || '[]');



// Global variable to store all unique headers found across all imports
let allUniqueHeaders = new Set();

// Canonical header mapping - maps all variants to standardized names
const CANONICAL_HEADERS = {
    // Define the exact order and canonical names as requested by user
    'Clinic Name': ['Clinic Name', 'Clinic'],
    'EMR ID': ['EMR ID', 'Patient ID', 'EMR Patient ID', 'Patient EMR ID', 'ID'],
    'Patient Name': ['Patient Name', 'Name'],
    'Patient Phone Number': ['Patient Phone Number', 'Phone Num', 'Phone Number', 'Phone'],
    'Patient DOB': ['Patient DOB', 'DOB', 'Date of Birth'],
    'Appointment Date': ['Appointment Date', 'Date of Service'],
    'Appointment Type': ['Appointment Type'],
    'Start Time': ['Start Time'],
    'End Time': ['End Time'],
    'Last Visit': ['Last Visit', 'Last Date of Service'],
    'Check In Time': ['Check In Time'],
    'Initial Evaluation': ['Initial Evaluation'],
    'Likelihood to Attend': ['Likelihood to Attend'],
    'Primary Diagnosis Code': ['Primary Diagnosis Code', 'Treating Diagnosis'],
    'Primary Insurance': ['Primary Insurance', 'Insurance'],
    'Insurance ID': ['Insurance ID'],
    'Secondary Insurance': ['Secondary Insurance'],
    'Address': ['Address'],
    'ZIP Code': ['ZIP Code', 'Zip Code'],
    'Area': ['Area'],
    'Amount Due': ['Amount Due'],
    'Amount Paid': ['Amount Paid'],
    'Payment Received': ['Payment Received', 'Payment Amount', 'Received Amount'],
    'Denial Reason': ['Denial Reason', 'Reason for Denial', 'Denial Code'],
    'Copay': ['Copay', 'Co-pay', 'Patient Copay', 'Copayment'],
    'Secondary Insurance Payment': ['Secondary Insurance Payment', 'Secondary Payment', 'Secondary Ins Payment'],
    'Payment Received Date': ['Payment Received Date', 'Date Payment Received', 'Payment Date'],
    'Patient EMR ID': ['Patient EMR ID', 'EMR Patient ID', 'Patient ID', 'EMR ID'],
    'Collected by': ['Collected by'],
    'Date of Transaction': ['Date of Transaction'],
    'Payment Method': ['Payment Method'],
    'Addendum': ['Addendum'],
    'Documenting Therapist': ['Documenting Therapist'],
    'Treating Therapist': ['Treating Therapist'],
    'Finalizing Therapist': ['Finalizing Therapist'],
    'Date of Finalization': ['Date of Finalization'],
    'Visit Status': ['Visit Status']
};

// Get the canonical header order as specified by user
const HEADER_ORDER = [
    'Clinic Name', 'EMR ID', 'Patient Name', 'Patient Phone Number', 'Patient DOB',
    'Appointment Date', 'Appointment Type', 'Start Time', 'End Time', 'Last Visit',
    'Check In Time', 'Initial Evaluation', 'Likelihood to Attend', 'Primary Diagnosis Code',
    'Primary Insurance', 'Insurance ID', 'Secondary Insurance', 'Address', 'ZIP Code', 'Area',
    'Amount Due', 'Amount Paid', 'Payment Received', 'Denial Reason', 'Copay', 
    'Secondary Insurance Payment', 'Payment Received Date', 'Patient EMR ID',
    'Collected by', 'Date of Transaction', 'Payment Method',
    'Addendum', 'Documenting Therapist', 'Treating Therapist', 'Finalizing Therapist',
    'Date of Finalization', 'Visit Status'
];

// Function to map a raw header to its canonical form
function getCanonicalHeader(rawHeader) {
    for (const [canonical, variants] of Object.entries(CANONICAL_HEADERS)) {
        if (variants.some(variant => variant.toLowerCase() === rawHeader.toLowerCase())) {
            return canonical;
        }
    }
    return rawHeader; // Return original if no mapping found
}

// Function to normalize imported data to use canonical headers
function normalizeDataHeaders(rawData) {
    const normalizedData = {};
    
    for (const [key, value] of Object.entries(rawData)) {
        const canonicalKey = getCanonicalHeader(key);
        normalizedData[canonicalKey] = value;
    }
    
    return normalizedData;
}

// Global variable to store imported row hashes for duplicate detection
let importedRowHashes = new Set();

// Function to create a hash of a row's data for duplicate detection
function createRowHash(rowData) {
    // Sort keys to ensure consistent hashing regardless of column order
    const sortedKeys = Object.keys(rowData).sort();
    const values = sortedKeys.map(key => (rowData[key] || '').toString().trim().toLowerCase());
    return values.join('|');
}

// Function to check if a row is identical to any previously imported row
function isIdenticalRow(rowData) {
    const hash = createRowHash(rowData);
    return importedRowHashes.has(hash);
}

// Function to add a row hash to the imported set
function addRowHash(rowData) {
    const hash = createRowHash(rowData);
    importedRowHashes.add(hash);
}

// Load all data from localStorage
function loadData() {
    console.log('=== loadData() called ===');
    
    try {
        // Initialize with empty arrays if not already defined
        if (!Array.isArray(patients)) {
            console.warn('Initializing patients array');
            patients = [];
        }
        
        if (!Array.isArray(providers)) {
            console.warn('Initializing providers array');
            providers = [];
        }
        // Load patients data
        const patientsData = localStorage.getItem('patients');
        patients = patientsData ? JSON.parse(patientsData) : [];
        
        // Load providers data with better error handling
        try {
            const providersData = localStorage.getItem('providers');
            if (providersData) {
                providers = JSON.parse(providersData);
                console.log('Loaded providers from localStorage:', providers.length);
                
                // Debug: Log first few providers if they exist
                if (providers.length > 0) {
                    console.log('First 3 providers:', JSON.parse(JSON.stringify(providers.slice(0, 3))));
                }
            } else {
                console.log('No providers found in localStorage, initializing empty array');
                providers = [];
                localStorage.setItem('providers', JSON.stringify(providers));
            }
        } catch (e) {
            console.error('Error loading providers:', e);
            providers = [];
            localStorage.setItem('providers', JSON.stringify(providers));
            providers = []; // Ensure it's an empty array
        }
        
        // Load referrals data
        const savedReferrals = localStorage.getItem('referrals');
        if (savedReferrals) {
            try {
                const parsedReferrals = JSON.parse(savedReferrals);
                if (Array.isArray(parsedReferrals)) {
                    referrals = parsedReferrals;
                    console.log('✓ Loaded referrals:', referrals.length);
                } else {
                    console.error('❌ Referrals data is not an array:', parsedReferrals);
                }
            } catch (e) {
                console.error('❌ Error parsing referrals:', e);
            }
        }
        
        // Load activities data
        const savedActivities = localStorage.getItem('activities');
        if (savedActivities) {
            try {
                const parsedActivities = JSON.parse(savedActivities);
                if (Array.isArray(parsedActivities)) {
                    activities = parsedActivities;
                    console.log('✓ Loaded activities:', activities.length);
                } else {
                    console.error('❌ Activities data is not an array:', parsedActivities);
                }
            } catch (e) {
                console.error('❌ Error parsing activities:', e);
            }
        }
        
        console.log('=== Data Summary ===', {
            patients: patients.length,
            providers: providers.length,
            referrals: referrals.length,
            activities: activities.length
        });
        
        // Log any errors in provider data
        if (providers.length > 0) {
            console.log('=== Provider Data Sample ===');
            console.log(JSON.stringify(providers[0], null, 2));
        } else {
            console.log('=== No provider data available ===');
        }
        // Expose data globally for cross-module access (advanced search, imports, etc.)
        window.patients = Array.isArray(patients) ? patients : [];
        window.providers = Array.isArray(providers) ? providers : [];

    } catch (error) {
        console.error('❌ Error in loadData():', error);
        // Ensure all arrays are initialized as empty arrays
        patients = [];
        providers = [];
        referrals = [];
        activities = [];
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== DOMContentLoaded event fired ===');
    console.log('Calling loadData()...');
    loadData();
    
    console.log('Calling showSection(dashboard)...');
    showSection('dashboard');
        // Initialize providers section when switching to it
        // Don't initialize here to avoid timing issues
        // Small delay to ensure DOM is ready for dashboard
        setTimeout(() => {
            if (typeof initializeDashboard === 'function') {
                initializeDashboard();
            } else if (typeof renderEnhancedDashboard === 'function') {
                renderEnhancedDashboard();
            }
        }, 100);
        loadAllSections();
        initializeSidebar();
    });

// Sidebar toggle functionality
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const toggleBtn = document.getElementById('sidebarToggle');
    const toggleIcon = toggleBtn.querySelector('i');
    
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
    
    // Update toggle button icon
    if (sidebar.classList.contains('collapsed')) {
        toggleIcon.classList.remove('fa-bars');
        toggleIcon.classList.add('fa-arrow-right');
        toggleBtn.title = 'Show Sidebar';
    } else {
        toggleIcon.classList.remove('fa-arrow-right');
        toggleIcon.classList.add('fa-bars');
        toggleBtn.title = 'Hide Sidebar';
    }
    
    // Save sidebar state
    localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
}

// Initialize sidebar state
function initializeSidebar() {
    const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    
    if (sidebarCollapsed) {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('mainContent');
        const toggleBtn = document.getElementById('sidebarToggle');
        const toggleIcon = toggleBtn.querySelector('i');
        
        sidebar.classList.add('collapsed');
        mainContent.classList.add('expanded');
        toggleIcon.classList.remove('fa-bars');
        toggleIcon.classList.add('fa-arrow-right');
        toggleBtn.title = 'Show Sidebar';
    }
    
    // Handle responsive behavior
    handleResponsiveSidebar();
    window.addEventListener('resize', handleResponsiveSidebar);
}

// Handle responsive sidebar behavior
function handleResponsiveSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    if (window.innerWidth <= 767) {
        // Mobile: sidebar should be hidden by default
        sidebar.classList.add('collapsed');
        mainContent.classList.add('expanded');
    } else {
        // Desktop: restore saved state
        const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (!sidebarCollapsed) {
            sidebar.classList.remove('collapsed');
            mainContent.classList.remove('expanded');
        }
    }
}

// Navigation function
function showSection(sectionId) {
    console.log(`showSection('${sectionId}') called`);
    
    // Hide all sections by removing active class
    const sections = document.querySelectorAll('.content-section');
    console.log(`Found ${sections.length} content sections`);
    
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show the selected section by adding active class
    const selectedSection = document.getElementById(sectionId);
    console.log(`Selected section element:`, selectedSection);
    
    if (selectedSection) {
        selectedSection.classList.add('active');
        console.log(`Displaying section: ${sectionId}`);
        
        // Update active state in sidebar
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
                console.log(`Set active nav link: ${sectionId}`);
            }
        });
        
        // Load section data if needed
        console.log(`Loading data for section: ${sectionId}`);
        loadSectionData(sectionId);
        
        // Special handling for dashboard
        if (sectionId === 'dashboard') {
            console.log('Updating dashboard...');
            if (typeof initializeDashboard === 'function') {
                initializeDashboard();
            } else if (typeof renderEnhancedDashboard === 'function') {
                renderEnhancedDashboard();
            }
        }
    } else {
        console.error(`Section with ID '${sectionId}' not found`);
    }
    
    // Load section-specific data and create sections if needed
    if (sectionId === 'providers') {
        console.log('Initializing providers section...');
        // The providers section exists in HTML, just load the data
        console.log('Loading providers data and rendering table...');
        if (sectionId === 'providers') {
        // Force render the providers table
        setTimeout(() => {
            renderProvidersTable();
        }, 100);
    } else if (sectionId === 'patients') {
        loadPatientsData();
    } else if (sectionId === 'referrals') {
        loadReferralsData();
    } else if (sectionId === 'dashboard') {
        if (typeof initializeDashboard === 'function') {
            initializeDashboard();
        } else if (typeof renderEnhancedDashboard === 'function') {
            renderEnhancedDashboard();
        }
    }
    
    // Ensure toolbar has Clear buttons when switching sections
    setTimeout(() => { ensureManagementClearButtons(); }, 0);
    
    // Update the URL hash
    window.location.hash = sectionId;
}

// Ensure Clear All buttons exist in Patients and Providers toolbars rendered in index.html
function ensureManagementClearButtons() {
    try {
        // Patients toolbar
        const patientsSection = document.getElementById('patients') || document.querySelector('[data-section="patients"], .content-section#patients');
        if (patientsSection && !document.getElementById('clear-patients-btn')) {
            // Try to find the header toolbar container near the Patient Management title
            const headerBar = patientsSection.querySelector('.d-flex.justify-content-between, .page-header, .toolbar, .btn-toolbar')
                || patientsSection.querySelector('.card-header + .card-body')
                || patientsSection;
            const btn = document.createElement('button');
            btn.id = 'clear-patients-btn';
            btn.className = 'btn btn-danger ms-2';
            btn.innerHTML = '<i class="fas fa-trash-alt"></i> Clear All Data';
            btn.onclick = () => window.clearAllPatientData && window.clearAllPatientData();
            // Prefer appending to the same parent as existing toolbar buttons
            const anyToolbarBtn = patientsSection.querySelector('button.btn, a.btn');
            if (anyToolbarBtn && anyToolbarBtn.parentElement) {
                anyToolbarBtn.parentElement.appendChild(btn);
            } else {
                headerBar.appendChild(btn);
            }
        }

        // Providers toolbar
        const providersSection = document.getElementById('providers') || document.querySelector('[data-section="providers"], .content-section#providers');
        if (providersSection && !document.getElementById('clear-providers-btn')) {
            const headerBar2 = providersSection.querySelector('.d-flex.justify-content-between, .page-header, .toolbar, .btn-toolbar')
                || providersSection.querySelector('.card-header + .card-body')
                || providersSection;
            const btn2 = document.createElement('button');
            btn2.id = 'clear-providers-btn';
            btn2.className = 'btn btn-outline-danger ms-2';
            btn2.title = 'Clear all provider data';
            btn2.innerHTML = '<i class="fas fa-trash-alt"></i> Clear All Data';
            btn2.onclick = () => window.clearAllProviderData && window.clearAllProviderData();
            const anyToolbarBtn2 = providersSection.querySelector('button.btn, a.btn');
            if (anyToolbarBtn2 && anyToolbarBtn2.parentElement) {
                anyToolbarBtn2.parentElement.appendChild(btn2);
            } else {
                headerBar2.appendChild(btn2);
            }
        }
    } catch (e) {
        console.warn('ensureManagementClearButtons warning:', e);
    }
}

// Run once on load as well
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => { ensureManagementClearButtons(); }, 100);
});

// Create sections dynamically
function createSection(sectionId) {
    const main = document.querySelector('main');
    const section = document.createElement('div');
    section.id = sectionId;
    section.className = 'content-section active';
    
    switch(sectionId) {
        case 'patients':
            section.innerHTML = createPatientsSection();
            break;
        case 'providers':
            section.innerHTML = createProvidersSection();
            break;
        case 'referrals':
            section.innerHTML = createReferralsSection();
            break;
        case 'scheduling':
            section.innerHTML = createSchedulingSection();
            break;
        case 'insurance':
            section.innerHTML = createInsuranceSection();
            break;
        case 'tasks':
            section.innerHTML = createTasksSection();
            break;
        case 'competitors':
            section.innerHTML = createCompetitorsSection();
            break;
        default:
            section.innerHTML = `
                <div class="container-fluid">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h2>Coming Soon</h2>
                    </div>
                    <div class="text-center py-5">
                        <i class="fas fa-tools fa-3x text-muted mb-3"></i>
                        <h4 class="text-muted">This Section is Under Development</h4>
                        <p class="text-muted">We're working hard to bring you this feature. Check back soon!</p>
                        <button class="btn btn-primary" onclick="showSection('dashboard')">Return to Dashboard</button>
                    </div>
                </div>
            `;
    }
    
    main.appendChild(section);
    loadSectionData(sectionId);
}

// Update dashboard with current data
function updateDashboard() {
    console.log('updateDashboard called');
    // Unified wrapper to enhanced dashboard (legacy-safe)
    if (typeof initializeDashboard === 'function') {
        initializeDashboard();
        return;
    } else if (typeof renderEnhancedDashboard === 'function') {
        renderEnhancedDashboard();
        return;
    }
    const dashboardContent = document.getElementById('dashboard-content');
    if (!dashboardContent) return;
    
    // Calculate KPIs
    const totalPatients = patients.length;
    const totalProviders = providers.length;
    const totalReferrals = referrals.length;
    const totalTasks = tasks.length;
    const totalClaims = insuranceClaims.length;
    const totalCompetitors = competitors.length;
    
    // Calculate patients with upcoming appointments
    const now = new Date();
    const patientsWithUpcoming = patients.filter(patient => {
        return appointments.some(apt => 
            apt.patientId === patient.id && new Date(apt.date) > now
        );
    }).length;
    const patientsWithoutUpcoming = totalPatients - patientsWithUpcoming;
    
    // Calculate claims statistics
    const paidClaims = insuranceClaims.filter(claim => claim.status === 'paid').length;
    const unpaidClaims = totalClaims - paidClaims;
    
    // Calculate provider statistics
    const availableProviders = providers.filter(provider => 
        provider.status === 'active' && provider.availability
    ).length;
    const credentialedProviders = providers.filter(provider => 
        provider.credentialingStatus === 'approved' || provider.status === 'credentialed'
    ).length;
    
    // Calculate monthly sessions and evaluations
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const sessionsThisMonth = appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate.getMonth() === currentMonth && aptDate.getFullYear() === currentYear;
    }).length;
    const evaluationsThisMonth = appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate.getMonth() === currentMonth && 
               aptDate.getFullYear() === currentYear && 
               apt.type === 'Initial Evaluation';
    }).length;
    
    dashboardContent.innerHTML = `
        <div class="row mb-4">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Dashboard Filters</h5>
                        <div class="row">
                            <div class="col-md-6">
                                <label for="dashboardMonth" class="form-label">Month</label>
                                <select id="dashboardMonth" class="form-select" onchange="updateDashboard()">
                                    <option value="">All Months</option>
                                    <option value="0">January</option>
                                    <option value="1">February</option>
                                    <option value="2">March</option>
                                    <option value="3">April</option>
                                    <option value="4">May</option>
                                    <option value="5">June</option>
                                    <option value="6">July</option>
                                    <option value="7">August</option>
                                    <option value="8">September</option>
                                    <option value="9">October</option>
                                    <option value="10">November</option>
                                    <option value="11">December</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label for="dashboardClinic" class="form-label">Clinic</label>
                                <select id="dashboardClinic" class="form-select" onchange="updateDashboard()">
                                    <option value="">All Clinics</option>
                                    ${[...new Set(patients.map(p => p.clinic || p['Clinic Name']).filter(Boolean))]
                                        .map(clinic => `<option value="${clinic}">${clinic}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Quick Actions</h5>
                        <div class="d-flex gap-2 flex-wrap">
                            <button class="btn btn-primary btn-sm" onclick="showSection('patients')">
                                <i class="fas fa-users"></i> Manage Patients
                            </button>
                            <button class="btn btn-success btn-sm" onclick="showSection('providers')">
                                <i class="fas fa-user-md"></i> Manage Providers
                            </button>
                            <button class="btn btn-info btn-sm" onclick="showSection('referrals')">
                                <i class="fas fa-handshake"></i> Referrals
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card bg-primary text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h4 class="card-title">${totalPatients}</h4>
                                <p class="card-text">Total Patients</p>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-users fa-2x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-success text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h4 class="card-title">${totalProviders}</h4>
                                <p class="card-text">Total Providers</p>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-user-md fa-2x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-info text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h4 class="card-title">${totalReferrals}</h4>
                                <p class="card-text">Total Referrals</p>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-handshake fa-2x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-warning text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h4 class="card-title">${totalTasks}</h4>
                                <p class="card-text">Active Tasks</p>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-tasks fa-2x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card bg-light">
                    <div class="card-body text-center">
                        <h5 class="text-success">${patientsWithUpcoming}</h5>
                        <p class="mb-0">Patients with Upcoming Appointments</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-light">
                    <div class="card-body text-center">
                        <h5 class="text-danger">${patientsWithoutUpcoming}</h5>
                        <p class="mb-0">Patients without Upcoming Appointments</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-light">
                    <div class="card-body text-center">
                        <h5 class="text-success">${paidClaims}</h5>
                        <p class="mb-0">Claims Paid</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-light">
                    <div class="card-body text-center">
                        <h5 class="text-warning">${unpaidClaims}</h5>
                        <p class="mb-0">Unpaid Claims</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card bg-light">
                    <div class="card-body text-center">
                        <h5 class="text-info">${availableProviders}</h5>
                        <p class="mb-0">Providers with Availability</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-light">
                    <div class="card-body text-center">
                        <h5 class="text-primary">${credentialedProviders}</h5>
                        <p class="mb-0">Credentialed Providers</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-light">
                    <div class="card-body text-center">
                        <h5 class="text-success">${sessionsThisMonth}</h5>
                        <p class="mb-0">Sessions This Month</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-light">
                    <div class="card-body text-center">
                        <h5 class="text-info">${evaluationsThisMonth}</h5>
                        <p class="mb-0">Initial Evaluations This Month</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Recent Activity</h5>
                    </div>
                    <div class="card-body">
                        <div id="recentActivity">
                            ${activities.length > 0 ? 
                                activities.slice(-5).reverse().map(activity => `
                                    <div class="d-flex align-items-center mb-2">
                                        <i class="fas ${activity.icon} text-primary me-2"></i>
                                        <span>${activity.message}</span>
                                        <small class="text-muted ms-auto">${formatDate(activity.timestamp)}</small>
                                    </div>
                                `).join('') : 
                                '<p class="text-muted">No recent activity</p>'
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title mb-0">System Status</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-2">
                            <span class="badge bg-success">System Online</span>
                        </div>
                        <div class="mb-2">
                            <small class="text-muted">Last Updated: ${new Date().toLocaleString()}</small>
                        </div>
                        <div class="mb-2">
                            <small class="text-muted">Data Storage: Browser Local Storage</small>
                        </div>
                        <div>
                            <small class="text-muted">Version: 1.0.0</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    console.log('Dashboard rendered successfully');
}




// Update recent activity
function updateRecentActivity() {
    const recentActivityDiv = document.getElementById('recentActivity');
    if (!recentActivityDiv) return;
    
    const recentActivities = activities.slice(-5).reverse();
    
    if (recentActivities.length === 0) {
        recentActivityDiv.innerHTML = '<p class="text-muted">No recent activity</p>';
        return;
    }
    
    const activityHTML = recentActivities.map(activity => `
        <div class="d-flex align-items-center mb-2">
            <i class="fas ${activity.icon} text-primary me-2"></i>
            <span>${activity.message}</span>
            <small class="text-muted ms-auto">${formatDate(activity.timestamp)}</small>
        </div>
    `).join('');
    
    recentActivityDiv.innerHTML = activityHTML;
}

// Add activity to log
function addActivity(message, icon = 'fa-info-circle') {
    const activity = {
        message,
        icon,
        timestamp: new Date().toISOString()
    };
    
    activities.push(activity);
    
    // Keep only last 100 activities
    if (activities.length > 100) {
        activities = activities.slice(-100);
    }
    
    saveData();
    updateRecentActivity();
}

// Create Patients Section with canonical header table
function createPatientsSection() {
    return `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Patient Management</h2>
            <div>
                <button class="btn btn-success me-2" onclick="addNewPatient()">
                    <i class="fas fa-plus"></i> Add Patient
                </button>
                <button class="btn btn-info me-2" onclick="importPatients()">
                    <i class="fas fa-file-import"></i> Import CSV
                </button>
                <button class="btn btn-primary me-2" onclick="processMultiReportImport()">
                    <i class="fas fa-file-medical"></i> Import WebPT Reports
                </button>
                <button class="btn btn-danger" onclick="clearAllPatientData()" title="Clear all patient data">
                    <i class="fas fa-trash-alt"></i> Clear All Data
                </button>
            </div>
        </div>
        
        <div class="row mb-3">
            <div class="col-md-3">
                <input type="text" id="patientSearch" class="form-control" placeholder="Search patients..." onkeyup="filterPatients()">
            </div>
            <div class="col-md-2">
                <select id="patientStatusFilter" class="form-select" onchange="filterPatients()">
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>
            <div class="col-md-2">
                <select id="patientClinicFilter" class="form-select" onchange="filterPatients()">
                    <option value="">All Clinics</option>
                </select>
            </div>
            <div class="col-md-2">
                <select id="patientSortBy" class="form-select" onchange="filterPatients()">
                    <option value="name">Sort by Name</option>
                    <option value="id">Sort by ID</option>
                    <option value="clinic">Sort by Clinic</option>
                    <option value="dob">Sort by DOB</option>
                    <option value="status">Sort by Status</option>
                    <option value="createdAt">Sort by Date Added</option>
                </select>
            </div>
            <div class="col-md-2">
                <select id="patientSortOrder" class="form-select" onchange="filterPatients()">
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                </select>
            </div>
            <div class="col-md-1">
                <button class="btn btn-outline-secondary" onclick="clearFilters()" title="Clear Filters">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h5 class="mb-0">Patient List</h5>
            </div>
            <div class="card-body">
                <div id="patients-table-container">
                    <p class="text-muted">Loading patients...</p>
                </div>
            </div>
        </div>
    `;
}

// Render patients table with canonical headers
function renderPatientsTable() {
    const filteredPatients = filterPatients();
    const tableContainer = document.getElementById('patients-table-container');
    
    if (!tableContainer) return;
    
    if (filteredPatients.length === 0) {
        tableContainer.innerHTML = '<p class="text-muted">No patients found.</p>';
        return;
    }
    
    // Use canonical headers in the specified order, but limit to first 10 for table display
    const displayHeaders = ['Patient Info', ...HEADER_ORDER.slice(0, 9)];
    
    // Create the complete table HTML
    const tableHTML = `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead class="table-light">
                    <tr>
                        ${displayHeaders.map(header => `<th>${header}</th>`).join('')}
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredPatients.map(patient => {
                        const normalizedData = normalizeDataHeaders(patient.webptData?.allFields || patient.allData || {});
                        
                        return `
                            <tr>
                                <td>
                                    <div><strong>${patient.name}</strong></div>
                                    <small class="text-muted">ID: ${patient.patientId}</small><br>
                                    <small class="text-muted">${patient.address || 'No address'}</small><br>
                                    <small class="text-info">${patient.webptData?.appointmentCount ? `${patient.webptData.appointmentCount} appointments` : '1 record'}</small>
                                </td>
                                ${HEADER_ORDER.slice(0, 9).map(header => {
                                    const value = normalizedData[header] || 'N/A';
                                    const displayValue = value.toString().length > 20 ? 
                                        `<span title="${value}">${value.toString().substring(0, 20)}...</span>` : value;
                                    return `<td>${displayValue}</td>`;
                                }).join('')}
                                <td>
                                    <span class="badge bg-${patient.status === 'active' ? 'success' : 
                                        patient.status === 'pending' ? 'warning' : 
                                        patient.status === 'completed' ? 'info' : 'secondary'}">
                                        ${patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                                    </span>
                                </td>
                                <td>
                                    <div class="btn-group-vertical btn-group-sm" role="group">
                                        <button class="btn btn-outline-primary btn-sm" onclick="editPatient(${patient.id})" title="Edit Patient">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-outline-info btn-sm" onclick="viewPatientDetails(${patient.id})" title="View Details">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button class="btn btn-outline-secondary btn-sm" onclick="viewAllFields(${patient.id})" title="View All Fields">
                                            <i class="fas fa-table"></i>
                                        </button>
                                        <button class="btn btn-outline-danger btn-sm" onclick="deletePatient(${patient.id})" title="Delete Patient">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    tableContainer.innerHTML = tableHTML;
}

// Filter patients function
function filterPatients() {
    const searchTerm = document.getElementById('patientSearch')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('patientStatusFilter')?.value || '';
    const clinicFilter = document.getElementById('patientClinicFilter')?.value || '';
    
    let filteredPatients = patients.filter(patient => {
        const matchesSearch = patient.name.toLowerCase().includes(searchTerm) ||
                            patient.patientId.toLowerCase().includes(searchTerm) ||
                            (patient.phone && patient.phone.includes(searchTerm));
        
        const matchesStatus = !statusFilter || patient.status === statusFilter;
        const matchesClinic = !clinicFilter || (patient.webptData?.allFields?.['Clinic Name'] === clinicFilter);
        
        return matchesSearch && matchesStatus && matchesClinic;
    });
    
    // Apply sorting
    filteredPatients = applySorting(filteredPatients);
    
    return filteredPatients;
}

// Apply sorting to patient list
function applySorting(patientList) {
    const sortBy = document.getElementById('patientSortBy')?.value || 'name';
    const sortOrder = document.getElementById('patientSortOrder')?.value || 'asc';
    
    const sortedPatients = [...patientList].sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
            case 'name':
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
                break;
            case 'id':
                aValue = a.patientId.toLowerCase();
                bValue = b.patientId.toLowerCase();
                break;
            case 'clinic':
                aValue = (a.webptData?.allFields?.['Clinic Name'] || '').toLowerCase();
                bValue = (b.webptData?.allFields?.['Clinic Name'] || '').toLowerCase();
                break;
            case 'dob':
                aValue = new Date(a.dob || '1900-01-01');
                bValue = new Date(b.dob || '1900-01-01');
                break;
            case 'status':
                aValue = a.status.toLowerCase();
                bValue = b.status.toLowerCase();
                break;
            case 'createdAt':
                aValue = new Date(a.createdAt || '1900-01-01');
                bValue = new Date(b.createdAt || '1900-01-01');
                break;
            default:
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
        }
        
        let comparison = 0;
        if (aValue > bValue) {
            comparison = 1;
        } else if (aValue < bValue) {
            comparison = -1;
        }
        
        return sortOrder === 'desc' ? comparison * -1 : comparison;
    });
    
    return sortedPatients;
}

// Clear filters function
function clearFilters() {
    const patientSearch = document.getElementById('patientSearch');
    const patientStatusFilter = document.getElementById('patientStatusFilter');
    const patientClinicFilter = document.getElementById('patientClinicFilter');
    const patientSortBy = document.getElementById('patientSortBy');
    const patientSortOrder = document.getElementById('patientSortOrder');
    
    if (patientSearch) patientSearch.value = '';
    if (patientStatusFilter) patientStatusFilter.value = '';
    if (patientClinicFilter) patientClinicFilter.value = '';
    if (patientSortBy) patientSortBy.value = 'name';
    if (patientSortOrder) patientSortOrder.value = 'asc';
    
    filterPatients();
}

// Utility functions
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

function formatDateTime(dateString) {
    return new Date(dateString).toLocaleString();
}

// Save all data to localStorage
function saveData() {
    try {
        // Log before saving
        console.log('Saving data...', {
            patients: patients.length,
            providers: providers.length,
            referrals: referrals.length,
            activities: activities.length
        });
        
        // Save each item individually
        localStorage.setItem('patients', JSON.stringify(patients));
        localStorage.setItem('providers', JSON.stringify(providers));
        localStorage.setItem('referrals', JSON.stringify(referrals));
        localStorage.setItem('activities', JSON.stringify(activities));
        
        // Verify the save
        const savedProviders = localStorage.getItem('providers');
        console.log('Data saved. Providers in localStorage:', savedProviders ? JSON.parse(savedProviders).length : 0);
        
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// Load all sections
function loadAllSections() {
    console.log('=== loadAllSections() called ===');
    
    // Initialize all section data
    loadSectionData('patients');
    loadSectionData('providers');
    loadSectionData('referrals');
    
    // Create provider section if it doesn't exist
    if (!document.getElementById('providers')) {
        console.log('Creating providers section...');
        createProvidersSection();
    }
    
    console.log('All sections loaded successfully');
}

// Load section-specific data
function loadSectionData(sectionId) {
    switch(sectionId) {
        case 'patients':
            loadPatientsData();
            break;
        case 'providers':
            loadProvidersData();
            break;
        case 'referrals':
            loadReferralsData();
            break;
    }
}

// Load patients data
function loadPatientsData() {
    populateClinicFilter();
    renderPatientsTable();
    setupSearchAndFilterListeners();
}

// Setup event listeners for search and filter functionality
function setupSearchAndFilterListeners() {
    const searchInput = document.getElementById('patientSearch');
    const statusFilter = document.getElementById('patientStatusFilter');
    const clinicFilter = document.getElementById('patientClinicFilter');
    const sortBy = document.getElementById('patientSortBy');
    const sortOrder = document.getElementById('patientSortOrder');
    
    // Add event listeners for real-time filtering
    if (searchInput) {
        searchInput.addEventListener('input', renderPatientsTable);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', renderPatientsTable);
    }
    
    if (clinicFilter) {
        clinicFilter.addEventListener('change', renderPatientsTable);
    }
    
    if (sortBy) {
        sortBy.addEventListener('change', renderPatientsTable);
    }
    
    if (sortOrder) {
        sortOrder.addEventListener('change', renderPatientsTable);
    }
}

// Populate clinic filter dropdown
function populateClinicFilter() {
    const clinicFilter = document.getElementById('patientClinicFilter');
    if (!clinicFilter) return;
    
    const clinics = new Set();
    patients.forEach(patient => {
        const clinicName = patient.webptData?.allFields?.['Clinic Name'];
        if (clinicName) {
            clinics.add(clinicName);
        }
    });
    
    // Clear existing options except "All Clinics"
    clinicFilter.innerHTML = '<option value="">All Clinics</option>';
    
    // Add clinic options
    Array.from(clinics).sort().forEach(clinic => {
        const option = document.createElement('option');
        option.value = clinic;
        option.textContent = clinic;
        clinicFilter.appendChild(option);
    });
}

// Test function to create sample provider data
function createSampleProviders() {
    const sampleProviders = [
        {
            id: 'p1',
            name: 'Dr. Sarah Johnson',
            specialty: 'PT',
            license: 'PT123456',
            email: 'sarah.johnson@example.com',
            phone: '(555) 123-4567',
            status: 'active',
            address: '123 Main St, Anytown, NY',
            zipCode: '10001',
            availability: 'Weekdays 9am-5pm',
            notes: 'Prefers home health cases',
            credentials: ['DPT', 'OCS'],
            insurances: ['Medicare', 'Aetna', 'Blue Cross'],
            createdAt: new Date().toISOString()
        },
        {
            id: 'p2',
            name: 'John Smith',
            specialty: 'PTA',
            license: 'PTA789012',
            email: 'john.smith@example.com',
            phone: '(555) 987-6543',
            status: 'pending',
            address: '456 Oak Ave, Somewhere, NY',
            zipCode: '10023',
            availability: 'Weekends and evenings',
            notes: 'New hire, needs training',
            credentials: ['PTA', 'LSVT BIG'],
            insurances: ['Medicaid', 'United Healthcare'],
            createdAt: new Date().toISOString()
        },
        {
            id: 'p3',
            name: 'Maria Garcia',
            specialty: 'OT',
            license: 'OT345678',
            email: 'maria.garcia@example.com',
            phone: '(555) 456-7890',
            status: 'active',
            address: '789 Pine St, Elsewhere, NY',
            zipCode: '10045',
            availability: 'Monday-Wednesday 8am-4pm',
            notes: 'Bilingual (English/Spanish)',
            credentials: ['OTR/L', 'CHT'],
            insurances: ['Medicare', 'Cigna', 'Aetna'],
            createdAt: new Date().toISOString()
        }
    ];
    
    // Save to localStorage
    localStorage.setItem('providers', JSON.stringify(sampleProviders));
    window.providers = sampleProviders;
    
    // Refresh the table
    if (window.location.hash === '#providers') {
        renderProvidersTable();
    }
    
    console.log('Sample providers created successfully');
    return sampleProviders;
}

// Only create sample providers if none exist in localStorage (first-run)
try {
    const existingProvidersRaw = localStorage.getItem('providers');
    const existingProviders = existingProvidersRaw ? JSON.parse(existingProvidersRaw) : [];
    if (!existingProviders || existingProviders.length === 0) {
        console.log('No providers found in storage. Creating sample providers (first-run only).');
        createSampleProviders();
    } else {
        console.log(`Providers already present in storage (${existingProviders.length}). Skipping sample creation.`);
    }
} catch (e) {
    console.warn('Error checking existing providers; creating sample providers as fallback.', e);
    createSampleProviders();
}

// Provider Management Section

// Load providers data from localStorage
function loadProvidersData() {
    console.log('=== loadProvidersData called ===');
    try {
        const storedProviders = localStorage.getItem('providers');
        console.log('Raw providers from localStorage:', storedProviders);
        
        if (storedProviders) {
            window.providers = JSON.parse(storedProviders);
            console.log('Parsed providers:', window.providers);
        } else {
            console.log('No providers found in localStorage, initializing empty array');
            window.providers = [];
        }
        
        console.log('Calling renderProvidersTable...');
        renderProvidersTable();
    } catch (error) {
        console.error('Error in loadProvidersData:', error);
        showError('providers-table-container', `Error loading providers: ${error.message}`);
    }
}

// Render the providers table with filtering and sorting (prioritizing imported data)
function renderProvidersTable() {
    console.log('=== renderProvidersTable called ===');
    
    // Use centralized data access that prioritizes imported data over sample data
    const providers = typeof getProviderData === 'function' ? getProviderData() : JSON.parse(localStorage.getItem('providers') || '[]');
    window.providers = providers; // Update global reference for compatibility
    
    // Log data source for debugging
    const hasImported = typeof hasImportedData === 'function' ? hasImportedData() : false;
    console.log('Provider table using data source:', hasImported ? 'IMPORTED DATA' : 'SAMPLE DATA');
    console.log('Current providers array:', JSON.stringify(providers, null, 2));
    
    try {
        const container = document.getElementById('providers-table-container');
        if (!container) {
            console.error('Providers table container not found');
            return;
        }

        // Get filter values
        const searchTerm = document.getElementById('providerSearch')?.value?.toLowerCase() || '';
        const statusFilter = document.getElementById('providerStatusFilter')?.value || '';
        const specialtyFilter = document.getElementById('providerSpecialtyFilter')?.value || '';
        const sortBy = document.getElementById('providerSortBy')?.value || 'name-asc';

        // Filter providers
        let filteredProviders = providers || [];
        
        if (searchTerm) {
            filteredProviders = filteredProviders.filter(provider => 
                (provider.name && provider.name.toLowerCase().includes(searchTerm)) ||
                (provider.email && provider.email.toLowerCase().includes(searchTerm)) ||
                (provider.phone && provider.phone.includes(searchTerm)) ||
                (provider.specialty && provider.specialty.toLowerCase().includes(searchTerm))
            );
        }

        if (statusFilter) {
            filteredProviders = filteredProviders.filter(provider => 
                provider.status === statusFilter
            );
        }

        if (specialtyFilter) {
            filteredProviders = filteredProviders.filter(provider => 
                provider.specialty === specialtyFilter
            );
        }

        // Sort providers
        const [sortField, sortOrder] = sortBy.split('-');
        filteredProviders.sort((a, b) => {
            let valueA, valueB;
            
            switch(sortField) {
                case 'name':
                    valueA = a.name || '';
                    valueB = b.name || '';
                    break;
                case 'specialty':
                    valueA = a.specialty || '';
                    valueB = b.specialty || '';
                    break;
                case 'status':
                    valueA = a.status || '';
                    valueB = b.status || '';
                    break;
                default:
                    valueA = a.name || '';
                    valueB = b.name || '';
            }

            if (sortOrder === 'asc') {
                return valueA.localeCompare(valueB);
            } else {
                return valueB.localeCompare(valueA);
            }
        });

        // Generate table HTML
        let tableHTML = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead class="table-light">
                        <tr>
                            <th>Name</th>
                            <th>Specialty</th>
                            <th>License</th>
                            <th>Contact</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (filteredProviders.length === 0) {
            tableHTML += `
                <tr>
                    <td colspan="6" class="text-center py-4">
                        <i class="fas fa-inbox me-2"></i>
                        No providers found. Try adjusting your filters or add a new provider.
                    </td>
                </tr>
            `;
        } else {
            filteredProviders.forEach(provider => {
                const statusClass = {
                    'active': 'success',
                    'pending': 'warning',
                    'inactive': 'secondary'
                }[provider.status] || 'secondary';

                tableHTML += `
                    <tr>
                        <td>
                            <div class="fw-bold">${escapeHtml(provider.name || 'N/A')}</div>
                            <small class="text-muted">${escapeHtml(provider.email || '')}</small>
                        </td>
                        <td>${escapeHtml(provider.specialty || 'N/A')}</td>
                        <td>${escapeHtml(provider.license || 'N/A')}</td>
                        <td>${escapeHtml(provider.phone || 'N/A')}</td>
                        <td>
                            <span class="badge bg-${statusClass}">
                                ${provider.status ? provider.status.charAt(0).toUpperCase() + provider.status.slice(1) : 'N/A'}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary me-1" onclick="editProvider('${provider.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteProvider('${provider.id}', '${escapeHtml(provider.name || 'this provider')}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
        }

        tableHTML += `
                    </tbody>
                </table>
            </div>
            <div class="d-flex justify-content-between align-items-center mt-2">
                <div class="text-muted small">
                    Showing ${filteredProviders.length} of ${window.providers.length} providers
                </div>
                <button class="btn btn-sm btn-outline-secondary" onclick="exportProvidersToCSV()">
                    <i class="fas fa-download me-1"></i> Export to CSV
                </button>
            </div>
        `;

        container.innerHTML = tableHTML;
    } catch (error) {
        console.error('Error rendering providers table:', error);
        showError('providers-table-container', `Error displaying providers: ${error.message}`);
    }
}

// Filter providers function removed - filtering is now handled within renderProvidersTable

// Add a new provider
function addNewProvider() {
    alert('Add new provider functionality will be implemented here');
    // TODO: Implement add new provider modal/dialog
}

// Edit an existing provider
function editProvider(providerId) {
    const provider = window.providers.find(p => p.id === providerId);
    if (provider) {
        alert(`Edit provider: ${provider.name}\nThis will open an edit form in a future update.`);
        // TODO: Implement edit provider modal/dialog
    }
}

// Confirm before deleting a provider
function confirmDeleteProvider(providerId, providerName) {
    if (confirm(`Are you sure you want to delete ${providerName}? This action cannot be undone.`)) {
        deleteProvider(providerId);
    }
}

// Delete a provider
function deleteProvider(providerId) {
    try {
        const index = window.providers.findIndex(p => p.id === providerId);
        if (index !== -1) {
            window.providers.splice(index, 1);
            localStorage.setItem('providers', JSON.stringify(window.providers));
            renderProvidersTable();
            showSuccess('Provider deleted successfully');
        }
    } catch (error) {
        console.error('Error deleting provider:', error);
        showError('Error deleting provider: ' + error.message);
    }
}

// Export providers to CSV
function exportProvidersToCSV() {
    try {
        if (!window.providers || window.providers.length === 0) {
            showError('No providers to export');
            return;
        }

        // Get the filtered providers (or all if not filtered)
        const filteredProviders = getFilteredProviders();
        
        if (filteredProviders.length === 0) {
            showError('No providers match the current filters');
            return;
        }

        // Create CSV header
        const headers = [
            'Name', 'Specialty', 'License', 'Email', 'Phone', 'Status',
            'Address', 'Zip Code', 'Availability', 'Notes', 'Credentials', 'Insurances'
        ];
        
        // Create CSV rows
        const rows = filteredProviders.map(provider => {
            return [
                `"${escapeCsv(provider.name || '')}"`,
                `"${escapeCsv(provider.specialty || '')}"`,
                `"${escapeCsv(provider.license || '')}"`,
                `"${escapeCsv(provider.email || '')}"`,
                `"${escapeCsv(provider.phone || '')}"`,
                `"${escapeCsv(provider.status || '')}"`,
                `"${escapeCsv(provider.address || '')}"`,
                `"${escapeCsv(provider.zipCode || '')}"`,
                `"${escapeCsv(provider.availability || '')}"`,
                `"${escapeCsv(provider.notes || '')}"`,
                `"${escapeCsv(Array.isArray(provider.credentials) ? provider.credentials.join(', ') : '')}"`,
                `"${escapeCsv(Array.isArray(provider.insurances) ? provider.insurances.join(', ') : '')}"`
            ].join(',');
        });

        // Combine header and rows
        const csvContent = [
            headers.join(','),
            ...rows
        ].join('\n');

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `providers_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showSuccess(`Exported ${filteredProviders.length} providers to CSV`);
    } catch (error) {
        console.error('Error exporting providers to CSV:', error);
        showError('Error exporting providers: ' + error.message);
    }
}

// Get filtered providers based on current filters
function getFilteredProviders() {
    const searchTerm = document.getElementById('providerSearch')?.value?.toLowerCase() || '';
    const statusFilter = document.getElementById('providerStatusFilter')?.value || '';
    const specialtyFilter = document.getElementById('providerSpecialtyFilter')?.value || '';

    return (window.providers || []).filter(provider => {
        // Filter by search term
        const matchesSearch = !searchTerm || 
            (provider.name && provider.name.toLowerCase().includes(searchTerm)) ||
            (provider.email && provider.email.toLowerCase().includes(searchTerm)) ||
            (provider.phone && provider.phone.includes(searchTerm)) ||
            (provider.specialty && provider.specialty.toLowerCase().includes(searchTerm));
        
        // Filter by status
        const matchesStatus = !statusFilter || provider.status === statusFilter;
        
        // Filter by specialty
        const matchesSpecialty = !specialtyFilter || provider.specialty === specialtyFilter;
        
        return matchesSearch && matchesStatus && matchesSpecialty;
    });
}

// Helper function to escape CSV values
function escapeCsv(value) {
    if (value === null || value === undefined) return '';
    return String(value).replace(/"/g, '""');
}

// Helper function to show error messages
function showError(containerId, message) {
    console.error('Error:', message);
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <i class="fas fa-exclamation-triangle me-2"></i>
                ${escapeHtml(message)}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
    } else {
        // If container not found, show in console and alert
        alert(`Error: ${message}`);
    }
}

// Helper function to escape HTML to prevent XSS
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Initialize providers when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize providers array if it doesn't exist
    if (!window.providers) {
        window.providers = [];
    }
    
    // Load providers data
    loadProvidersData();
    
    // Set up event listeners for provider management
    setupProviderListeners();
});

// Expose provider management functions to the global scope
window.createProvidersSection = createProvidersSection;
window.loadProvidersData = loadProvidersData;
window.renderProvidersTable = renderProvidersTable;
// filterProviders function removed - filtering is now handled within renderProvidersTable
window.addNewProvider = addNewProvider;
window.editProvider = editProvider;
window.confirmDeleteProvider = confirmDeleteProvider;
window.deleteProvider = deleteProvider;
window.exportProvidersToCSV = exportProvidersToCSV;
window.importProviders = importProviders;
window.clearProviderFilters = clearProviderFilters;
window.clearAllProviderData = clearAllProviderData;
window.createSampleProviders = createSampleProviders;
// Expose patient clear function
window.clearAllPatientData = clearAllPatientData;

// Provider Management Section

// Initialize providers array if it doesn't exist
if (!window.providers) {
    window.providers = [];
}

/**
 * Load providers data from localStorage and render the table
 */
function loadProvidersData() {
    try {
        console.log('Loading providers data...');
        const savedProviders = localStorage.getItem('providers');
        if (savedProviders) {
            window.providers = JSON.parse(savedProviders);
            console.log(`Loaded ${window.providers.length} providers from storage`);
        } else {
            console.log('No providers found in storage, initializing empty array');
            window.providers = [];
        }
        renderProvidersTable();
    } catch (error) {
        console.error('Error loading providers data:', error);
        showError('providers-table-container', `Error loading providers: ${error.message}`);
    }
}

// Duplicate renderProvidersTable function removed - using the main implementation above

/**
 * Helper function to show error messages
 */
function showError(containerId, message) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                ${escapeHtml(message)}
            </div>
        `;
    }
}

/**
 * Helper function to escape HTML to prevent XSS
 */
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Get the appropriate badge class for a status
 */
function getStatusBadgeClass(status) {
    switch (status.toLowerCase()) {
        case 'active': return 'bg-success';
        case 'pending': return 'bg-warning text-dark';
        case 'inactive': return 'bg-secondary';
        default: return 'bg-light text-dark';
    }
}

/**
 * Format status for display
 */
function formatStatus(status) {
    if (!status) return 'N/A';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

// Second duplicate filterProviders function removed - filtering is now handled within renderProvidersTable

/**
 * Add a new provider
 */
function addNewProvider() {
    // This would open a modal or form to add a new provider
    alert('Add new provider functionality will be implemented here');
}

/**
 * Edit an existing provider
 */
function editProvider(providerId) {
    // This would open a modal or form to edit the provider
    alert(`Edit provider ${providerId} functionality will be implemented here`);
}

/**
 * Delete a provider
 */
function deleteProvider(providerId) {
    if (confirm('Are you sure you want to delete this provider? This action cannot be undone.')) {
        const index = window.providers.findIndex(p => p.id === providerId);
        if (index !== -1) {
            const providerName = window.providers[index].name || 'Unknown';
            window.providers.splice(index, 1);
            saveData();
            renderProvidersTable();
            addActivity(`Deleted provider: ${providerName}`, 'fa-user-times');
        }
    }
}

/**
 * Import providers from CSV
 */
function importProviders() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const csvData = e.target.result;
                processProviderCSV(csvData);
            } catch (error) {
                console.error('Error processing provider CSV:', error);
                alert(`Error importing providers: ${error.message}`);
            }
        };
        
        reader.onerror = function() {
            alert('Error reading the file');
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

/**
 * Process provider data from CSV - supports both Provider Details and Provider Insurance formats
 */
function processProviderCSV(csvData) {
    console.log('=== processProviderCSV() called ===');
    
    try {
        if (!csvData || typeof csvData !== 'string') {
            throw new Error('No CSV data provided');
        }
        
        // Parse CSV data
        const lines = csvData.replace(/\r\n/g, '\n').split('\n');
        console.log(`Found ${lines.length} lines in CSV data`);
        
        if (lines.length < 2) {
            throw new Error('CSV file must have at least a header row and one data row');
        }
        
        const headers = parseCSVLine(lines[0]);
        console.log('CSV Headers:', headers);
        
        // Detect report type based on headers
        const reportType = detectProviderReportType(headers);
        console.log('Detected report type:', reportType);
        
        let importedCount = 0;
        let updatedCount = 0;
        let errorCount = 0;
        const errors = [];
        
        // Process each data row
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            try {
                const values = parseCSVLine(line);
                const rowData = {};
                
                // Map values to headers
                headers.forEach((header, index) => {
                    rowData[header] = (values[index] || '').trim();
                });
                
                // Process based on report type
                if (reportType === 'provider_details') {
                    const result = processProviderDetailsRow(rowData);
                    if (result.isNew) importedCount++;
                    else if (result.isUpdated) updatedCount++;
                } else if (reportType === 'provider_insurance') {
                    const result = processProviderInsuranceRow(rowData);
                    if (result.isNew) importedCount++;
                    else if (result.isUpdated) updatedCount++;
                } else {
                    throw new Error(`Unsupported report type: ${reportType}`);
                }
                
            } catch (rowError) {
                console.error(`Error processing row ${i + 1}:`, rowError);
                errors.push(`Row ${i + 1}: ${rowError.message}`);
                errorCount++;
            }
        }
        
        // Save data and update UI
        localStorage.setItem('providers', JSON.stringify(window.providers));
        renderProvidersTable();
        updateDashboard();
        
        // Show import results
        let message = `Provider Import Completed!\n\n`;
        message += `Report Type: ${reportType === 'provider_details' ? 'Provider Details' : 'Provider Insurance'}\n`;
        message += `New providers: ${importedCount}\n`;
        message += `Updated providers: ${updatedCount}\n`;
        message += `Errors: ${errorCount}\n`;
        message += `Total providers now: ${window.providers.length}`;
        
        if (errors.length > 0) {
            message += `\n\nFirst 3 errors:\n${errors.slice(0, 3).join('\n')}`;
            if (errors.length > 3) {
                message += `\n... and ${errors.length - 3} more errors`;
            }
        }
        
        alert(message);
        
        // Add activity log
        addActivity(`Imported provider data: ${importedCount} new, ${updatedCount} updated`, 'fa-file-import');
        
    } catch (error) {
        console.error('Provider CSV import error:', error);
        alert(`Error importing provider data: ${error.message}`);
    }
}
function createProvidersSection() {
    console.log('=== createProvidersSection called ===');
    
    // Get or create the providers section
    let section = document.getElementById('providers');
    
    if (!section) {
        console.warn('Providers section not found in HTML, creating dynamically');
        section = document.createElement('div');
        section.id = 'providers';
        section.className = 'content-section';
        
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.appendChild(section);
        } else {
            console.error('Could not find mainContent element');
            return;
        }
    }
    
    // Set the inner HTML for the providers section
    section.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Provider Management</h2>
            <div>
                <button class="btn btn-success me-2" onclick="importProviders()">
                    <i class="fas fa-file-import"></i> Import CSV
                </button>
                <button class="btn btn-primary me-2" onclick="addNewProvider()">
                    <i class="fas fa-plus"></i> Add Provider
                </button>
                <button class="btn btn-outline-danger" onclick="clearAllProviderData()" title="Clear all provider data">
                    <i class="fas fa-trash-alt"></i> Clear All Data
                </button>
            </div>
        </div>
        
        <!-- Provider Filters -->
        <div class="row mb-4">
            <div class="col-md-4">
                <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-search"></i></span>
                    <input type="text" id="providerSearch" class="form-control" placeholder="Search providers..." onkeyup="renderProvidersTable()">
                </div>
            </div>
            <div class="col-md-3">
                <select id="providerStatusFilter" class="form-select" onchange="renderProvidersTable()">
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>
            <div class="col-md-3">
                <select id="providerSpecialtyFilter" class="form-select" onchange="renderProvidersTable()">
                    <option value="">All Specialties</option>
                    <option value="PT">Physical Therapist</option>
                    <option value="PTA">Physical Therapist Assistant</option>
                    <option value="OT">Occupational Therapist</option>
                    <option value="COTA">Certified OT Assistant</option>
                    <option value="SLP">Speech Language Pathologist</option>
                </select>
            </div>
            <div class="col-md-2">
                <select id="providerSortBy" class="form-select" onchange="renderProvidersTable()">
                    <option value="name-asc">Sort by Name (A-Z)</option>
                    <option value="name-desc">Sort by Name (Z-A)</option>
                    <option value="specialty-asc">Sort by Specialty (A-Z)</option>
                    <option value="specialty-desc">Sort by Specialty (Z-A)</option>
                    <option value="status-asc">Sort by Status (A-Z)</option>
                    <option value="status-desc">Sort by Status (Z-A)</option>
                </select>
            </div>
        </div>
        
        <!-- Providers Table -->
        <div class="card">
            <div class="card-body">
                <div id="providers-table-container">
                    <div class="text-center py-5">
                        <i class="fas fa-spinner fa-spin fa-2x text-muted mb-3"></i>
                        <p class="text-muted">Loading providers...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Initialize the providers table
    try {
        // Initialize providers array if it doesn't exist
        if (!window.providers) {
            window.providers = [];
        }
        
        // Load and render providers
        loadProvidersData();
    } catch (error) {
        console.error('Error initializing providers section:', error);
        showError('providers-table-container', `Error loading providers: ${error.message}`);
    }
}

// Referrals & Leads Section
function createReferralsSection() {
    return `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Referrals & Leads Management</h2>
            <div>
                <button class="btn btn-success me-2" onclick="addNewReferral()">
                    <i class="fas fa-plus"></i> Add Referral
                </button>
                <button class="btn btn-info" onclick="importReferrals()">
                    <i class="fas fa-file-import"></i> Import CSV
                </button>
            </div>
        </div>
        
        <div class="row mb-4">
            <div class="col-md-3">
                <input type="text" id="referralSearch" class="form-control" placeholder="Search referrals...">
            </div>
            <div class="col-md-2">
                <select id="referralStatusFilter" class="form-select">
                    <option value="">All Status</option>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="converted">Converted</option>
                    <option value="lost">Lost</option>
                </select>
            </div>
            <div class="col-md-2">
                <select id="referralSourceFilter" class="form-select">
                    <option value="">All Sources</option>
                    <option value="physician">Physician</option>
                    <option value="hospital">Hospital</option>
                    <option value="insurance">Insurance</option>
                    <option value="self">Self-Referral</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div class="col-md-2">
                <select id="referralPriorityFilter" class="form-select">
                    <option value="">All Priority</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
            </div>
            <div class="col-md-2">
                <select id="referralSortBy" class="form-select">
                    <option value="dateReceived">Sort by Date</option>
                    <option value="name">Sort by Name</option>
                    <option value="priority">Sort by Priority</option>
                    <option value="status">Sort by Status</option>
                </select>
            </div>
            <div class="col-md-1">
                <button class="btn btn-outline-secondary" onclick="clearReferralFilters()" title="Clear Filters">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h5 class="mb-0">Referral List</h5>
            </div>
            <div class="card-body">
                <div id="referrals-table-container">
                    <p class="text-muted">Loading referrals...</p>
                </div>
            </div>
        </div>
    `;
}

// Placeholder functions for patient management
function addNewPatient() {
    // Create and show the add patient modal
    const modal = document.getElementById('addPatientModal') || createAddPatientModal();
    
    // Reset form
    document.getElementById('patientName').value = '';
    document.getElementById('patientPhone').value = '';
    document.getElementById('patientEmail').value = '';
    document.getElementById('patientDOB').value = '';
    document.getElementById('patientAddress').value = '';
    document.getElementById('patientZipCode').value = '';
    document.getElementById('patientInsurance').value = '';
    document.getElementById('patientInsuranceId').value = '';
    document.getElementById('patientStatus').value = 'active';
    
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}

function editPatient(patientId) {
    const patient = patients.find(p => p.id == patientId);
    if (!patient) {
        alert('Patient not found!');
        return;
    }
    
    // Create and show the edit patient modal
    const modal = document.getElementById('editPatientModal') || createEditPatientModal();
    
    // Populate form with existing data
    document.getElementById('editPatientId').value = patient.id;
    document.getElementById('editPatientName').value = patient.patientName || '';
    document.getElementById('editPatientPhone').value = patient.patientPhoneNumber || '';
    document.getElementById('editPatientEmail').value = patient.email || '';
    document.getElementById('editPatientDOB').value = patient.patientDOB || '';
    document.getElementById('editPatientAddress').value = patient.address || '';
    document.getElementById('editPatientZipCode').value = patient.zipCode || '';
    document.getElementById('editPatientInsurance').value = patient.primaryInsurance || '';
    document.getElementById('editPatientInsuranceId').value = patient.insuranceID || '';
    document.getElementById('editPatientStatus').value = patient.status || 'active';
    
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}

function deletePatient(patientId) {
    if (confirm('Are you sure you want to delete this patient?')) {
        patients = patients.filter(p => p.id !== patientId);
        saveData();
        loadPatientsData();
        addActivity(`Deleted patient`, 'fa-trash');
    }
}

function viewPatientDetails(patientId) {
    const patient = patients.find(p => p.id == patientId);
    if (!patient) {
        alert('Patient not found!');
        return;
    }
    
    viewAllFields(patientId);
}

function viewAllFields(patientId) {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;
    
    const appointments = patient.webptData?.appointments || [];
    const appointmentCount = appointments.length;
    
    // Create modal to show all appointments and fields
    const modalHTML = `
        <div class="modal fade" id="allFieldsModal" tabindex="-1">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">All Data: ${patient.name} (${appointmentCount} appointments)</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <input type="text" id="fieldSearch" class="form-control" placeholder="Search appointments and fields..." onkeyup="filterAppointments()">
                        </div>
                        
                        ${appointmentCount > 1 ? `
                            <div class="alert alert-info">
                                <strong>Multiple Appointments Found:</strong> This patient has ${appointmentCount} appointments/records from the imported data.
                            </div>
                        ` : ''}
                        
                        <div class="accordion" id="appointmentsAccordion">
                            ${appointments.map((appointment, index) => {
                                const normalizedData = normalizeDataHeaders(appointment);
                                return `
                                    <div class="accordion-item appointment-item">
                                        <h2 class="accordion-header" id="heading${index}">
                                            <button class="accordion-button ${index === 0 ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}" aria-expanded="${index === 0 ? 'true' : 'false'}" aria-controls="collapse${index}">
                                                <strong>Appointment ${index + 1}</strong> 
                                                <span class="ms-2 badge bg-secondary">${appointment.source}</span>
                                                ${normalizedData['Appointment Date'] ? `<span class="ms-2 text-muted">${normalizedData['Appointment Date']}</span>` : ''}
                                                ${normalizedData['Appointment Type'] ? `<span class="ms-2 text-info">${normalizedData['Appointment Type']}</span>` : ''}
                                            </button>
                                        </h2>
                                        <div id="collapse${index}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" aria-labelledby="heading${index}" data-bs-parent="#appointmentsAccordion">
                                            <div class="accordion-body">
                                                <div class="table-responsive">
                                                    <table class="table table-sm table-striped">
                                                        <thead>
                                                            <tr>
                                                                <th>Field Name</th>
                                                                <th>Value</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            ${HEADER_ORDER.map(header => {
                                                                const value = normalizedData[header] || 'N/A';
                                                                if (value === 'N/A' || value === '') return '';
                                                                return `
                                                                    <tr>
                                                                        <td><strong>${header}</strong></td>
                                                                        <td>${value}</td>
                                                                    </tr>
                                                                `;
                                                            }).filter(row => row !== '').join('')}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" onclick="exportPatientData(${patientId})">Export All Data</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if present
    const existingModal = document.getElementById('allFieldsModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('allFieldsModal'));
    modal.show();
}

function filterFields() {
    const searchTerm = document.getElementById('fieldSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#fieldsTable tbody tr');
    
    rows.forEach(row => {
        const fieldName = row.cells[0].textContent.toLowerCase();
        const fieldValue = row.cells[1].textContent.toLowerCase();
        
        if (fieldName.includes(searchTerm) || fieldValue.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function exportPatientData(patientId) {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;
    
    const exportData = {
        basicInfo: {
            name: patient.name,
            patientId: patient.patientId,
            phone: patient.phone,
            email: patient.email,
            dob: patient.dob,
            address: patient.address,
            status: patient.status
        },
        allFields: normalizeDataHeaders(patient.webptData?.allFields || patient.allData || {}),
        reportSources: patient.webptData?.reportSources || [],
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `patient_${patient.patientId}_data.json`;
    link.click();
    
    URL.revokeObjectURL(url);
}

// Single CSV Import functionality
function importPatients() {
    console.log('=== DASHBOARD PATIENT IMPORT STARTED ===');
    
    // Use the same working direct import logic
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.style.display = 'none';
    
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        console.log('Dashboard import - File selected:', file.name);
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const csv = e.target.result;
                console.log('Dashboard import - CSV loaded, parsing...');
                
                const lines = csv.split('\n');
                const patients = [];
                
                for (let i = 1; i < lines.length; i++) {
                    if (!lines[i].trim()) continue;
                    
                    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
                    if (values.length < 2) continue;
                    
                    const patient = {
                        id: `imported_${Date.now()}_${i}`,
                        firstName: values[0] || '',
                        lastName: values[1] || '',
                        contactNumber: values[2] || '',
                        email: values[3] || '',
                        address: values[4] || '',
                        zipCode: values[6] || '',
                        primaryInsurance: values[7] || '',
                        status: (values[8] || 'interested').toLowerCase(),
                        assignedPT: 'Not Assigned',
                        lastContact: new Date().toISOString().split('T')[0],
                        dateAdded: new Date().toISOString()
                    };
                    
                    if (patient.firstName && patient.lastName) {
                        patients.push(patient);
                    }
                }
                
                console.log('Dashboard import - Parsed patients:', patients.length);
                
                // Save to localStorage
                localStorage.setItem('patients', JSON.stringify(patients));
                console.log('✅ Dashboard import - Patients saved to localStorage');
                
                // Force UI refresh
                setTimeout(() => {
                    if (typeof renderPatientsTable === 'function') {
                        renderPatientsTable();
                        console.log('✅ Dashboard import - Patient table refreshed');
                    }
                    
                    // Update dashboard KPIs
                    if (typeof updateKPIs === 'function') {
                        updateKPIs();
                        console.log('✅ Dashboard import - KPIs updated');
                    }
                    
                    // Go to patients page to see results
                    if (typeof showSection === 'function') {
                        showSection('patients');
                    }
                }, 100);
                
                alert(`✅ Dashboard Import Success! Imported ${patients.length} patients. Check the Patient Management page.`);
                
            } catch (error) {
                console.error('❌ Dashboard import error:', error);
                alert('❌ Dashboard Import Error: ' + error.message);
            }
        };
        
        reader.readAsText(file);
    };
    
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
}

// Process single CSV import
function processSingleImport() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Please select a CSV file');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csvData = e.target.result;
            parseAndImportPatients(csvData);
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('importModal'));
            modal.hide();
        } catch (error) {
            alert('Error reading file: ' + error.message);
        }
    };
    
    reader.readAsText(file);
}

// Parse and import patients from CSV with canonical header mapping
function parseAndImportPatients(csvData) {
    try {
        const data = parseCSV(csvData);
        
        if (data.length === 0) {
            alert('No data found in CSV file');
            return;
        }
        
        // Track headers for canonical mapping
        const headers = Object.keys(data[0]);
        headers.forEach(header => {
            const canonical = getCanonicalHeader(header);
            allUniqueHeaders.add(canonical);
        });
        
        let importedCount = 0;
        let errorCount = 0;
        let duplicateCount = 0;
        const errors = [];
        const duplicates = [];
        
        data.forEach((row, index) => {
            try {
                // Check for identical row (all cells match exactly)
                if (isIdenticalRow(row)) {
                    duplicates.push(`Row ${index + 2}: Identical row already imported (all cells match)`);
                    duplicateCount++;
                    return;
                }
                
                // Normalize headers to canonical form
                const normalizedRow = normalizeDataHeaders(row);
                
                const patientData = {
                    id: Date.now() + index,
                    patientId: normalizedRow['EMR ID'] || `single_${Date.now()}_${index}`,
                    name: normalizedRow['Patient Name'] || '',
                    phone: normalizedRow['Patient Phone Number'] || '',
                    email: '',
                    dob: normalizedRow['Patient DOB'] || '',
                    insurance: normalizedRow['Primary Insurance'] || '',
                    insuranceId: normalizedRow['Insurance ID'] || '',
                    condition: '',
                    address: `${normalizedRow['Address'] || ''} ${normalizedRow['Area'] || ''} ${normalizedRow['ZIP Code'] || ''}`.trim(),
                    status: (normalizedRow['Visit Status'] || 'pending').toLowerCase(),
                    emergencyContact: '',
                    notes: `Imported from CSV on ${new Date().toLocaleDateString()}`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    // Store ALL data with canonical headers
                    allData: normalizedRow,
                    reportSources: ['singleCSV'],
                    webptData: {
                        allFields: normalizedRow,
                        reportSources: ['singleCSV'],
                        totalFields: Object.keys(normalizedRow).length
                    }
                };
                
                // Import all rows, even if some fields are missing
                // Only skip if completely empty row
                if (!patientData.name && !patientData.phone && !patientData.dob) {
                    errors.push(`Row ${index + 2}: Completely empty row`);
                    errorCount++;
                    return;
                }
                
                // Check for duplicate phone numbers only if phone exists
                if (patientData.phone) {
                    const existingPatient = patients.find(p => p.phone === patientData.phone);
                    if (existingPatient) {
                        errors.push(`Row ${index + 2}: Patient with phone ${patientData.phone} already exists`);
                        errorCount++;
                        return;
                    }
                }
                
                // Add row hash to prevent future duplicates
                addRowHash(row);
                
                patients.push(patientData);
                importedCount++;
                
            } catch (error) {
                errors.push(`Row ${index + 2}: ${error.message}`);
                errorCount++;
            }
        });
        
        // Save data and update UI
        saveData();
        loadPatientsData();
        updateDashboard();
        
        // Show import results
        let message = `Import completed!\n\nSuccessfully imported: ${importedCount} patients`;
        
        if (duplicateCount > 0) {
            message += `\nDuplicate rows skipped: ${duplicateCount}`;
            if (duplicates.length > 0) {
                message += `\n\nDuplicate details:\n${duplicates.slice(0, 3).join('\n')}`;
                if (duplicates.length > 3) {
                    message += `\n... and ${duplicates.length - 3} more duplicates`;
                }
            }
        }
        
        if (errorCount > 0) {
            message += `\nErrors: ${errorCount}`;
            if (errors.length > 0) {
                message += `\n\nError details:\n${errors.slice(0, 5).join('\n')}`;
                if (errors.length > 5) {
                    message += `\n... and ${errors.length - 5} more errors`;
                }
            }
        }
        
        alert(message);
        addActivity(`Imported ${importedCount} patients from CSV (${duplicateCount} duplicates skipped)`, 'fa-file-import');
        
    } catch (error) {
        alert('Error parsing CSV: ' + error.message);
    }
}

// Multi-report WebPT Import functionality
function processMultiReportImport() {
    const modalHTML = `
        <div class="modal fade" id="multiImportModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Import WebPT Multi-Reports</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-info">
                            <strong>Instructions:</strong> Select up to 4 WebPT report files. Data will be merged by Patient ID.
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="scheduledVisitsFile" class="form-label">Scheduled Visits Report</label>
                                    <input type="file" class="form-control" id="scheduledVisitsFile" accept=".csv">
                                </div>
                                <div class="mb-3">
                                    <label for="patientCaseFile" class="form-label">Patient Case Status Report</label>
                                    <input type="file" class="form-control" id="patientCaseFile" accept=".csv">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="patientPaymentsFile" class="form-label">Patient Payments Report</label>
                                    <input type="file" class="form-control" id="patientPaymentsFile" accept=".csv">
                                </div>
                                <div class="mb-3">
                                    <label for="documentedUnitsFile" class="form-label">Documented Units Report</label>
                                    <input type="file" class="form-control" id="documentedUnitsFile" accept=".csv">
                                </div>
                            </div>
                        </div>
                        
                        <div class="alert alert-warning">
                            <strong>Note:</strong> At least one file must be selected. Files will be merged by Patient ID.
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="processMultiReportFiles()">Import Reports</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('multiImportModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('multiImportModal'));
    modal.show();
}

// Process multi-report files
function processMultiReportFiles() {
    const fileInputs = {
        scheduledVisits: document.getElementById('scheduledVisitsFile'),
        patientCase: document.getElementById('patientCaseFile'),
        patientPayments: document.getElementById('patientPaymentsFile'),
        documentedUnits: document.getElementById('documentedUnitsFile')
    };
    
    const selectedFiles = {};
    let fileCount = 0;
    
    // Check which files are selected
    Object.keys(fileInputs).forEach(key => {
        if (fileInputs[key].files[0]) {
            selectedFiles[key] = fileInputs[key].files[0];
            fileCount++;
        }
    });
    
    if (fileCount === 0) {
        alert('Please select at least one report file');
        return;
    }
    
    // Process all selected files
    const reportData = {};
    let processedFiles = 0;
    
    Object.keys(selectedFiles).forEach(reportType => {
        const file = selectedFiles[reportType];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const csvData = e.target.result;
                reportData[reportType] = parseCSV(csvData);
                processedFiles++;
                
                // When all files are processed, merge the data
                if (processedFiles === fileCount) {
                    mergeWebPTReports(reportData);
                    
                    // Close modal
                    const modal = bootstrap.Modal.getInstance(document.getElementById('multiImportModal'));
                    modal.hide();
                }
            } catch (error) {
                alert(`Error reading ${reportType} file: ${error.message}`);
            }
        };
        
        reader.readAsText(file);
    });
}

// Merge WebPT reports into unified patient data with canonical headers
function mergeWebPTReports(reportData) {
    const mergedPatients = new Map();
    let totalProcessed = 0;
    let totalDuplicates = 0;
    let errors = [];
    const duplicates = [];
    
    // Process each report type
    Object.keys(reportData).forEach(reportType => {
        const data = reportData[reportType];
        
        // Track headers for canonical mapping
        if (data.length > 0) {
            const headers = Object.keys(data[0]);
            headers.forEach(header => {
                const canonical = getCanonicalHeader(header);
                allUniqueHeaders.add(canonical);
            });
        }
        
        data.forEach((row, index) => {
            try {
                // Check for identical row (all cells match exactly)
                if (isIdenticalRow(row)) {
                    duplicates.push(`${reportType} Row ${index + 2}: Identical row already imported`);
                    totalDuplicates++;
                    return;
                }
                
                // Normalize headers to canonical form
                const normalizedRow = normalizeDataHeaders(row);
                
                // Find Patient ID using canonical mapping
                const patientId = normalizedRow['EMR ID'] || `${reportType}_${index}`;
                const patientName = normalizedRow['Patient Name'] || '';
                
                // Skip only if both ID and name are completely missing
                if (!patientId && !patientName) {
                    errors.push(`${reportType} Row ${index + 2}: Missing both Patient ID and Name`);
                    return;
                }
                
                // Add row hash to prevent future duplicates
                addRowHash(row);
                
                // Create or update patient record
                if (!mergedPatients.has(patientId)) {
                    mergedPatients.set(patientId, {
                        id: Date.now() + totalProcessed,
                        patientId: patientId,
                        name: patientName,
                        phone: normalizedRow['Patient Phone Number'] || '',
                        email: '',
                        dob: normalizedRow['Patient DOB'] || '',
                        insurance: normalizedRow['Primary Insurance'] || '',
                        insuranceId: normalizedRow['Insurance ID'] || '',
                        condition: normalizedRow['Primary Diagnosis Code'] || '',
                        address: `${normalizedRow['Address'] || ''} ${normalizedRow['Area'] || ''} ${normalizedRow['ZIP Code'] || ''}`.trim(),
                        status: (normalizedRow['Visit Status'] || 'pending').toLowerCase(),
                        emergencyContact: '',
                        notes: `Imported from WebPT reports on ${new Date().toLocaleDateString()}`,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        allData: { ...normalizedRow },
                        reportSources: [reportType],
                        webptData: {
                            allFields: { ...normalizedRow },
                            reportSources: [reportType],
                            totalFields: Object.keys(normalizedRow).length
                        }
                    });
                } else {
                    // Merge additional data from this report
                    const existingPatient = mergedPatients.get(patientId);
                    
                    // Update fields with new data (don't overwrite existing data)
                    Object.keys(normalizedRow).forEach(key => {
                        if (normalizedRow[key] && !existingPatient.allData[key]) {
                            existingPatient.allData[key] = normalizedRow[key];
                            existingPatient.webptData.allFields[key] = normalizedRow[key];
                        }
                    });
                    
                    // Update basic fields if empty
                    if (!existingPatient.name && patientName) existingPatient.name = patientName;
                    if (!existingPatient.phone && normalizedRow['Patient Phone Number']) existingPatient.phone = normalizedRow['Patient Phone Number'];
                    if (!existingPatient.dob && normalizedRow['Patient DOB']) existingPatient.dob = normalizedRow['Patient DOB'];
                    if (!existingPatient.insurance && normalizedRow['Primary Insurance']) existingPatient.insurance = normalizedRow['Primary Insurance'];
                    if (!existingPatient.condition && normalizedRow['Primary Diagnosis Code']) existingPatient.condition = normalizedRow['Primary Diagnosis Code'];
                    
                    // Add report source
                    if (!existingPatient.reportSources.includes(reportType)) {
                        existingPatient.reportSources.push(reportType);
                        existingPatient.webptData.reportSources.push(reportType);
                    }
                    
                    // Update field count
                    existingPatient.webptData.totalFields = Object.keys(existingPatient.allData).length;
                    existingPatient.updatedAt = new Date().toISOString();
                }
                
                totalProcessed++;
                
            } catch (error) {
                errors.push(`${reportType} Row ${index + 2}: ${error.message}`);
            }
        });
    });
    
    // Add merged patients to main patients array
    let importedCount = 0;
    mergedPatients.forEach(patientData => {
        // Check for existing patient by phone or ID
        const existingPatient = patients.find(p => 
            (p.phone && p.phone === patientData.phone) || 
            (p.patientId === patientData.patientId)
        );
        
        if (!existingPatient) {
            // Add comprehensive notes
            let notes = `Imported from WebPT multi-report on ${new Date().toLocaleDateString()}\n`;
            notes += `Data sources: ${patientData.reportSources.join(', ')}\n`;
            notes += `Total unique fields: ${Object.keys(patientData.allData).length}\n\n`;
            
            patientData.notes = notes;
            patients.push(patientData);
            importedCount++;
        }
    });
    
    // Save data and update UI
    saveData();
    loadPatientsData();
    updateDashboard();
    
    // Show import results
    let message = `WebPT Multi-Report Import completed!\n\n`;
    message += `Successfully imported: ${importedCount} patients\n`;
    message += `Total records processed: ${totalProcessed}\n`;
    
    if (totalDuplicates > 0) {
        message += `Duplicate rows skipped: ${totalDuplicates}\n`;
        if (duplicates.length > 0) {
            message += `\nDuplicate details:\n${duplicates.slice(0, 3).join('\n')}`;
            if (duplicates.length > 3) {
                message += `\n... and ${duplicates.length - 3} more duplicates`;
            }
        }
    }
    
    if (errors.length > 0) {
        message += `\nErrors: ${errors.length}`;
        if (errors.length > 0) {
            message += `\n\nError details:\n${errors.slice(0, 5).join('\n')}`;
            if (errors.length > 5) {
                message += `\n... and ${errors.length - 5} more errors`;
            }
        }
    }
    
    alert(message);
    addActivity(`Imported ${importedCount} patients from WebPT reports (${totalDuplicates} duplicates skipped)`, 'fa-file-import');
}

// Helper function to parse CSV data (Excel CSV format - comma delimited)
function parseCSV(csvData) {
    try {
        // Handle very large files by limiting processing
        const lines = csvData.split('\n');
        
        if (lines.length > 10000) {
            throw new Error(`File too large: ${lines.length} rows. Please limit to 10,000 rows or less.`);
        }
        
        if (lines.length === 0) {
            throw new Error('Empty CSV file');
        }
        
        const headers = parseCSVLine(lines[0]);
        if (!headers || headers.length === 0) {
            throw new Error('No headers found in CSV file');
        }
        
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            try {
                const values = parseCSVLine(line);
                const row = {};
                
                headers.forEach((header, index) => {
                    row[header] = values[index] || '';
                });
                
                data.push(row);
            } catch (lineError) {
                console.warn(`Error parsing line ${i + 1}: ${lineError.message}`);
                // Continue processing other lines
            }
        }
        
        return data;
    } catch (error) {
        console.error('CSV parsing error:', error);
        throw error;
    }
}

// Helper function to parse CSV line with proper comma handling
function parseCSVLine(line) {
    if (!line || typeof line !== 'string') {
        return [];
    }
    
    // Prevent infinite loops with very long lines
    if (line.length > 50000) {
        throw new Error('Line too long - possible malformed CSV data');
    }
    
    const result = [];
    let current = '';
    let inQuotes = false;
    let quoteCount = 0;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            quoteCount++;
            // Prevent infinite quote processing
            if (quoteCount > 1000) {
                throw new Error('Too many quotes in line - possible malformed CSV data');
            }
            
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++; // Skip next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current.trim());
    return result;
}

// Import CSV functionality
function importPatients() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const csvData = e.target.result;
                    const parsedData = parseCSV(csvData);
                    processImportedData(parsedData, 'Single CSV Import');
                } catch (error) {
                    alert(`Error importing CSV: ${error.message}`);
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

// Process imported data with proper duplicate detection
function processImportedData(data, source) {
    let importedCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;
    
    data.forEach((row, index) => {
        try {
            // Normalize headers to canonical form
            const normalizedRow = normalizeDataHeaders(row);
            
            // Check if this exact row already exists
            if (isIdenticalRow(normalizedRow)) {
                duplicateCount++;
                console.log(`Skipping duplicate row ${index + 1}:`, normalizedRow);
                return;
            }
            
            // Create patient object
            const patient = {
                id: Date.now() + Math.random(),
                name: normalizedRow['Patient Name'] || 'Unknown',
                patientId: normalizedRow['EMR ID'] || `TEMP-${Date.now()}`,
                phone: normalizedRow['Patient Phone Number'] || '',
                address: normalizedRow['Address'] || '',
                status: 'active',
                dateAdded: new Date().toISOString(),
                webptData: {
                    allFields: normalizedRow,
                    source: source
                }
            };
            
            // Add to patients array
            patients.push(patient);
            
            // Track this row as imported
            addRowHash(normalizedRow);
            
            importedCount++;
        } catch (error) {
            console.error(`Error processing row ${index + 1}:`, error);
            errorCount++;
        }
    });
    
    // Save data and update UI
    saveData();
    updateDashboard();
    loadPatientsData();
    
    // Show import results
    const message = `Import completed!\n\nImported: ${importedCount} patients\nDuplicates skipped: ${duplicateCount}\nErrors: ${errorCount}`;
    alert(message);
    
    // Add activity log
    addActivity(`Imported ${importedCount} patients from ${source}`, 'fa-file-import');
}

// Multi-report WebPT import functionality
function processMultiReportImport() {
    // Create modal for multi-file selection
    const modalHTML = `
        <div class="modal fade" id="multiReportModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Import WebPT Reports</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p>Select up to 4 WebPT report CSV files to merge by Patient ID:</p>
                        
                        <div class="mb-3">
                            <label class="form-label">Scheduled Visits Report</label>
                            <input type="file" class="form-control" id="scheduledVisits" accept=".csv">
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">Patient Case Status Report</label>
                            <input type="file" class="form-control" id="patientCaseStatus" accept=".csv">
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">Patient Payments Report</label>
                            <input type="file" class="form-control" id="patientPayments" accept=".csv">
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">Documented Units Report</label>
                            <input type="file" class="form-control" id="documentedUnits" accept=".csv">
                        </div>
                        
                        <div class="alert alert-info">
                            <strong>Note:</strong> At least one file must be selected. Files will be merged by Patient ID.
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="processMultiReportFiles()">Import Reports</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if present
    const existingModal = document.getElementById('multiReportModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('multiReportModal'));
    modal.show();
}

// Process multiple WebPT report files
function processMultiReportFiles() {
    const fileInputs = {
        scheduledVisits: document.getElementById('scheduledVisits'),
        patientCaseStatus: document.getElementById('patientCaseStatus'),
        patientPayments: document.getElementById('patientPayments'),
        documentedUnits: document.getElementById('documentedUnits')
    };
    
    const selectedFiles = [];
    
    // Collect selected files
    Object.keys(fileInputs).forEach(key => {
        const input = fileInputs[key];
        if (input && input.files[0]) {
            selectedFiles.push({
                name: key,
                file: input.files[0]
            });
        }
    });
    
    if (selectedFiles.length === 0) {
        alert('Please select at least one file to import.');
        return;
    }
    
    // Process files
    let processedFiles = 0;
    const allData = {};
    
    selectedFiles.forEach(({name, file}) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const csvData = e.target.result;
                const parsedData = parseCSV(csvData);
                allData[name] = parsedData;
                processedFiles++;
                
                // When all files are processed, merge them
                if (processedFiles === selectedFiles.length) {
                    mergeWebPTReports(allData);
                    // Close modal
                    const modal = bootstrap.Modal.getInstance(document.getElementById('multiReportModal'));
                    modal.hide();
                }
            } catch (error) {
                alert(`Error reading ${name} file: ${error.message}`);
            }
        };
        reader.readAsText(file);
    });
}

// Process WebPT reports preserving all appointments per patient
function mergeWebPTReports(reportsData) {
    const patientAppointments = new Map(); // Store all appointments per patient
    let totalRows = 0;
    let duplicateCount = 0;
    let importedCount = 0;
    
    // Process each report
    Object.keys(reportsData).forEach(reportName => {
        const reportData = reportsData[reportName];
        totalRows += reportData.length;
        
        reportData.forEach(row => {
            // Normalize headers
            const normalizedRow = normalizeDataHeaders(row);
            
            // Check for duplicate rows
            if (isIdenticalRow(normalizedRow)) {
                duplicateCount++;
                return;
            }
            
            // Get Patient ID (try multiple possible header names)
            const patientId = normalizedRow['EMR ID'] || normalizedRow['Patient ID'] || normalizedRow['EMR Patient ID'];
            
            if (!patientId) {
                console.warn('Row missing Patient ID, skipping:', normalizedRow);
                return;
            }
            
            // Store each row as a separate appointment/record
            if (!patientAppointments.has(patientId)) {
                patientAppointments.set(patientId, []);
            }
            
            // Add appointment data with source tracking
            const appointmentData = {
                ...normalizedRow,
                source: reportName,
                importDate: new Date().toISOString()
            };
            
            patientAppointments.get(patientId).push(appointmentData);
            
            // Track this row as imported
            addRowHash(normalizedRow);
            importedCount++;
        });
    });
    
    // Create patient objects with all their appointments
    patientAppointments.forEach((appointments, patientId) => {
        // Use the first appointment to get basic patient info
        const firstAppointment = appointments[0];
        
        const patient = {
            id: Date.now() + Math.random(),
            name: firstAppointment['Patient Name'] || 'Unknown',
            patientId: patientId,
            phone: firstAppointment['Patient Phone Number'] || '',
            address: firstAppointment['Address'] || '',
            status: 'active',
            dateAdded: new Date().toISOString(),
            webptData: {
                allFields: firstAppointment, // Primary patient data from first record
                source: 'WebPT Multi-Report Import',
                appointments: appointments, // Store ALL appointments
                appointmentCount: appointments.length,
                reports: [...new Set(appointments.map(apt => apt.source))] // Unique report sources
            }
        };
        
        patients.push(patient);
    });
    
    // Save and update UI
    saveData();
    updateDashboard();
    loadPatientsData();
    
    // Show results
    const patientCount = patientAppointments.size;
    const message = `Multi-report import completed!\n\nTotal rows processed: ${totalRows}\nPatients imported: ${patientCount}\nTotal appointments: ${importedCount}\nDuplicates skipped: ${duplicateCount}`;
    alert(message);
    
    // Add activity log
    addActivity(`Imported ${patientCount} patients with ${importedCount} appointments from WebPT reports`, 'fa-file-medical');
}

// Provider Management Functions
function loadProvidersData() {
    console.log('=== loadProvidersData() called ===');
    
    // Ensure providers array exists and is an array
    if (!Array.isArray(providers)) {
        console.warn('Providers is not an array, initializing empty array');
        providers = [];
    }
    
    console.log(`Loaded ${providers.length} providers`);
    
    // Debug: Log first few providers
    if (providers.length > 0) {
        console.log('First 3 providers:', JSON.parse(JSON.stringify(providers.slice(0, 3))));
    } else {
        console.log('No providers found in the system');
    }
    
    // Render the providers table
    try {
        renderProvidersTable();
        
        // Setup event listeners with a small delay to ensure DOM is ready
        setTimeout(() => {
            setupProviderListeners();
            
            // Debug: Check if table container exists and has content
            const tableContainer = document.getElementById('providers-table-container');
            if (tableContainer) {
                console.log('Table container found, content length:', tableContainer.innerHTML.length);
                if (tableContainer.innerHTML.trim() === '') {
                    console.warn('Table container is empty after render');
                }
            } else {
                console.error('Table container not found in the DOM');
            }
        }, 100);
    } catch (error) {
        console.error('Error in loadProvidersData:', error);
        // Show error to user
        const tableContainer = document.getElementById('providers-table-container');
        if (tableContainer) {
            tableContainer.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Error loading providers: ${error.message}
                </div>
            `;
        }
    }
}

function setupProviderListeners() {
    // Setup search functionality
    const searchInput = document.getElementById('providerSearch');
    if (searchInput) {
        searchInput.addEventListener('input', renderProvidersTable);
    }
    
    // Setup filter functionality
    const statusFilter = document.getElementById('providerStatusFilter');
    const specialtyFilter = document.getElementById('providerSpecialtyFilter');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', renderProvidersTable);
    }
    
    if (specialtyFilter) {
        specialtyFilter.addEventListener('change', renderProvidersTable);
    }
}

// Force refresh provider display
function refreshProviderDisplay() {
    console.log('Force refreshing provider display, providers:', providers.length);
    const tableContainer = document.getElementById('providers-table-container');
    if (tableContainer) {
        tableContainer.innerHTML = '<p class="text-muted">Refreshing...</p>';
        setTimeout(() => {
            renderProvidersTable();
        }, 100);
    }
}

// Third duplicate renderProvidersTable function removed - using the main implementation above

// Helper function to sort providers
function sortProviders(sortBy) {
    const sortSelect = document.getElementById('providerSortBy');
    if (!sortSelect) return;
    
    const currentSort = sortSelect.value;
    const sortParts = currentSort.split('-');
    const currentSortBy = sortParts[0];
    const currentOrder = sortParts[1] || 'asc';
    
    // Toggle sort order if clicking the same column
    if (currentSortBy === sortBy) {
        const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
        sortSelect.value = `${sortBy}-${newOrder}`;
    } else {
        // Default to ascending when changing sort column
        sortSelect.value = `${sortBy}-asc`;
    }
    
    // Re-render the table with new sort
    renderProvidersTable();
}

function filterProviders() {
    console.log('=== filterProviders() called ===');
    
    // Ensure providers is an array
    if (!Array.isArray(providers)) {
        console.error('❌ Providers is not an array in filterProviders');
        return [];
    }
    
    console.log('Total providers:', providers.length);
    if (providers.length > 0) {
        console.log('First provider sample:', JSON.stringify(providers[0]));
    }
    
    // Safely get filter values
    const searchInput = document.getElementById('providerSearch');
    const statusSelect = document.getElementById('providerStatusFilter');
    const specialtySelect = document.getElementById('providerSpecialtyFilter');
    
    if (!searchInput || !statusSelect || !specialtySelect) {
        console.error('❌ Could not find filter elements in the DOM');
        return [...providers]; // Return all providers as fallback
    }
    
    const searchTerm = (searchInput?.value || '').toLowerCase().trim();
    const statusFilter = statusSelect?.value || '';
    const specialtyFilter = specialtySelect?.value || '';
    
    // Debug log
    console.log('Filter values:', { searchTerm, statusFilter, specialtyFilter });
    
    // If no filters are applied, return all providers
    if (!searchTerm && !statusFilter && !specialtyFilter) {
        console.log('No filters active, returning all', providers.length, 'providers');
        return [...providers]; // Return a copy of the providers array
    }
    
    console.log('Filters:', { searchTerm, statusFilter, specialtyFilter });
    console.log('Total providers to filter:', providers.length);
    
    let filteredProviders = [];
    
    try {
        filteredProviders = providers.filter(provider => {
            if (!provider || typeof provider !== 'object') {
                console.warn('Invalid provider in array:', provider);
                return false;
            }
            
            // Debug the current provider
            console.log('Checking provider:', {
                id: provider.id,
                name: provider.name,
                email: provider.email,
                phone: provider.phone,
                status: provider.status,
                specialty: provider.specialty
            });
            
            const nameMatch = provider.name && provider.name.toLowerCase().includes(searchTerm);
            const emailMatch = provider.email && provider.email.toLowerCase().includes(searchTerm);
            const phoneMatch = provider.phone && provider.phone.includes(searchTerm);
            
            const matchesSearch = nameMatch || emailMatch || phoneMatch;
            const matchesStatus = !statusFilter || provider.status === statusFilter;
            const matchesSpecialty = !specialtyFilter || provider.specialty === specialtyFilter;
            
            const include = matchesSearch && matchesStatus && matchesSpecialty;
            
            if (include) {
                console.log('Provider matches filters:', provider.name);
            }
            
            return include;
        });
        
        console.log(`Filtered to ${filteredProviders.length} providers`);
        
    } catch (e) {
        console.error('❌ Error in filterProviders:', e);
        filteredProviders = [];
    }
    
    // Apply sorting
    const sortBy = document.getElementById('providerSortBy')?.value || 'name';
    const sortOrder = document.getElementById('providerSortOrder')?.value || 'asc';
    
    filteredProviders.sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
            case 'name':
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
                break;
            case 'specialty':
                aValue = a.specialty || '';
                bValue = b.specialty || '';
                break;
            case 'status':
                aValue = a.status;
                bValue = b.status;
                break;
            case 'dateAdded':
                aValue = new Date(a.dateAdded);
                bValue = new Date(b.dateAdded);
                break;
            default:
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
        }
        
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });
    
    return filteredProviders;
}

// Third duplicate filterProviders function removed - filtering is now handled within renderProvidersTable

// Referral Management Functions
function loadReferralsData() {
    renderReferralsTable();
    setupReferralListeners();
}

function setupReferralListeners() {
    const searchInput = document.getElementById('referralSearch');
    const statusFilter = document.getElementById('referralStatusFilter');
    const sourceFilter = document.getElementById('referralSourceFilter');
    const priorityFilter = document.getElementById('referralPriorityFilter');
    const sortBy = document.getElementById('referralSortBy');
    
    if (searchInput) searchInput.addEventListener('input', renderReferralsTable);
    if (statusFilter) statusFilter.addEventListener('change', renderReferralsTable);
    if (sourceFilter) sourceFilter.addEventListener('change', renderReferralsTable);
    if (priorityFilter) priorityFilter.addEventListener('change', renderReferralsTable);
    if (sortBy) sortBy.addEventListener('change', renderReferralsTable);
}

function renderReferralsTable() {
    const filteredReferrals = filterReferrals();
    const tableContainer = document.getElementById('referrals-table-container');
    
    if (!tableContainer) return;
    
    if (filteredReferrals.length === 0) {
        tableContainer.innerHTML = '<p class="text-muted">No referrals found.</p>';
        return;
    }
    
    const tableHTML = `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead class="table-light">
                    <tr>
                        <th>Patient Info</th>
                        <th>Source</th>
                        <th>Priority</th>
                        <th>Date Received</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredReferrals.map(referral => `
                        <tr>
                            <td>
                                <div><strong>${referral.patientName}</strong></div>
                                <small class="text-muted">${referral.phone || 'No phone'}</small><br>
                                <small class="text-muted">${referral.diagnosis || 'No diagnosis'}</small>
                            </td>
                            <td>${referral.source || 'N/A'}</td>
                            <td>
                                <span class="badge bg-${referral.priority === 'high' ? 'danger' : 
                                    referral.priority === 'medium' ? 'warning' : 'info'}">
                                    ${referral.priority ? referral.priority.charAt(0).toUpperCase() + referral.priority.slice(1) : 'N/A'}
                                </span>
                            </td>
                            <td>${referral.dateReceived ? new Date(referral.dateReceived).toLocaleDateString() : 'N/A'}</td>
                            <td>
                                <span class="badge bg-${referral.status === 'converted' ? 'success' : 
                                    referral.status === 'new' ? 'primary' : 
                                    referral.status === 'contacted' ? 'info' : 
                                    referral.status === 'scheduled' ? 'warning' : 'secondary'}">
                                    ${referral.status ? referral.status.charAt(0).toUpperCase() + referral.status.slice(1) : 'N/A'}
                                </span>
                            </td>
                            <td>
                                <div class="btn-group-vertical btn-group-sm" role="group">
                                    <button class="btn btn-outline-primary btn-sm" onclick="editReferral(${referral.id})" title="Edit Referral">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-outline-success btn-sm" onclick="convertReferral(${referral.id})" title="Convert to Patient">
                                        <i class="fas fa-user-plus"></i>
                                    </button>
                                    <button class="btn btn-outline-danger btn-sm" onclick="deleteReferral(${referral.id})" title="Delete Referral">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    tableContainer.innerHTML = tableHTML;
}

function filterReferrals() {
    const searchTerm = document.getElementById('referralSearch')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('referralStatusFilter')?.value || '';
    const sourceFilter = document.getElementById('referralSourceFilter')?.value || '';
    const priorityFilter = document.getElementById('referralPriorityFilter')?.value || '';
    
    let filteredReferrals = referrals.filter(referral => {
        const matchesSearch = referral.patientName.toLowerCase().includes(searchTerm) ||
                            (referral.phone && referral.phone.includes(searchTerm)) ||
                            (referral.diagnosis && referral.diagnosis.toLowerCase().includes(searchTerm));
        
        const matchesStatus = !statusFilter || referral.status === statusFilter;
        const matchesSource = !sourceFilter || referral.source === sourceFilter;
        const matchesPriority = !priorityFilter || referral.priority === priorityFilter;
        
        return matchesSearch && matchesStatus && matchesSource && matchesPriority;
    });
    
    // Apply sorting
    const sortBy = document.getElementById('referralSortBy')?.value || 'dateReceived';
    
    filteredReferrals.sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
            case 'dateReceived':
                aValue = new Date(a.dateReceived);
                bValue = new Date(b.dateReceived);
                break;
            case 'name':
                aValue = a.patientName.toLowerCase();
                bValue = b.patientName.toLowerCase();
                break;
            case 'priority':
                const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
                aValue = priorityOrder[a.priority] || 0;
                bValue = priorityOrder[b.priority] || 0;
                break;
            case 'status':
                aValue = a.status;
                bValue = b.status;
                break;
            default:
                aValue = new Date(a.dateReceived);
                bValue = new Date(b.dateReceived);
        }
        
        if (aValue < bValue) return -1;
        if (aValue > bValue) return 1;
        return 0;
    });
    
    return filteredReferrals;
}

// Provider CRUD Operations
function addNewProvider() {
    // Create and show the add provider modal
    const modal = document.getElementById('addProviderModal') || createAddProviderModal();
    
    // Reset form
    document.getElementById('providerName').value = '';
    document.getElementById('providerEmail').value = '';
    document.getElementById('providerPhone').value = '';
    document.getElementById('providerSpecialty').value = 'PT';
    document.getElementById('providerLicense').value = '';
    document.getElementById('providerAddress').value = '';
    document.getElementById('providerStatus').value = 'active';
    
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}

// Create add provider modal
function createAddProviderModal() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'addProviderModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Add New Provider</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="addProviderForm">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="providerName" class="form-label">Provider Name *</label>
                                    <input type="text" class="form-control" id="providerName" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="providerEmail" class="form-label">Email</label>
                                    <input type="email" class="form-control" id="providerEmail">
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="providerPhone" class="form-label">Phone Number</label>
                                    <input type="tel" class="form-control" id="providerPhone">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="providerSpecialty" class="form-label">Specialty</label>
                                    <select class="form-select" id="providerSpecialty">
                                        <option value="PT">Physical Therapist</option>
                                        <option value="PTA">Physical Therapist Assistant</option>
                                        <option value="OT">Occupational Therapist</option>
                                        <option value="OTA">Occupational Therapist Assistant</option>
                                        <option value="SLP">Speech Language Pathologist</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="providerLicense" class="form-label">License Number</label>
                                    <input type="text" class="form-control" id="providerLicense">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="providerStatus" class="form-label">Status</label>
                                    <select class="form-select" id="providerStatus">
                                        <option value="active">Active</option>
                                        <option value="pending">Pending</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="providerAddress" class="form-label">Address</label>
                            <textarea class="form-control" id="providerAddress" rows="2"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" onclick="saveNewProvider()">Add Provider</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

// Save new provider
function saveNewProvider() {
    const name = document.getElementById('providerName').value.trim();
    const email = document.getElementById('providerEmail').value.trim();
    const phone = document.getElementById('providerPhone').value.trim();
    const specialty = document.getElementById('providerSpecialty').value;
    const license = document.getElementById('providerLicense').value.trim();
    const address = document.getElementById('providerAddress').value.trim();
    const status = document.getElementById('providerStatus').value;
    
    if (!name) {
        alert('Provider name is required!');
        return;
    }
    
    // Check if provider already exists
    const existingProvider = providers.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (existingProvider) {
        alert('A provider with this name already exists!');
        return;
    }
    
    // Create new provider
    const newProvider = {
        id: Date.now() + Math.random(),
        name: name,
        email: email,
        phone: phone,
        specialty: specialty,
        licenseNumber: license,
        address: address,
        status: status,
        dateAdded: new Date().toISOString(),
        insuranceNetworks: [],
        availability: {
            schedule: [],
            totalWeeklyHours: 0,
            isFlexible: false,
            notes: ''
        },
        utilizationStats: {
            totalAvailableHours: 0,
            scheduledHours: 0,
            utilizationPercentage: 0,
            lastCalculated: new Date().toISOString()
        }
    };
    
    // Add to providers array
    providers.push(newProvider);
    
    // Save data and update UI
    saveData();
    updateDashboard();
    loadProvidersData();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addProviderModal'));
    modal.hide();
    
    // Show success message and add activity
    alert(`Provider "${name}" has been added successfully!`);
    addActivity(`Added new provider: ${name}`, 'fa-user-plus');
}

function editProvider(providerId) {
    const provider = providers.find(p => p.id == providerId);
    if (!provider) {
        alert('Provider not found!');
        return;
    }
    
    // Create and show the edit provider modal
    const modal = document.getElementById('editProviderModal') || createEditProviderModal();
    
    // Populate form with existing data
    document.getElementById('editProviderId').value = provider.id;
    document.getElementById('editProviderName').value = provider.name || '';
    document.getElementById('editProviderEmail').value = provider.email || '';
    document.getElementById('editProviderPhone').value = provider.phone || provider.contactNumber || '';
    document.getElementById('editProviderSpecialty').value = provider.specialty || 'PT';
    document.getElementById('editProviderLicense').value = provider.licenseNumber || '';
    document.getElementById('editProviderAddress').value = provider.address || '';
    document.getElementById('editProviderStatus').value = provider.status || 'active';
    document.getElementById('editProviderBorough').value = provider.borough || '';
    
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}

function viewProviderDetails(providerId) {
    const provider = providers.find(p => p.id == providerId);
    if (!provider) {
        alert('Provider not found!');
        return;
    }
    
    // Create and show provider details modal
    const modal = document.getElementById('providerDetailsModal') || createProviderDetailsModal();
    
    // Populate modal with provider data
    const modalBody = modal.querySelector('.modal-body');
    modalBody.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <h6>Basic Information</h6>
                <table class="table table-sm">
                    <tr><td><strong>Name:</strong></td><td>${provider.name}</td></tr>
                    <tr><td><strong>Email:</strong></td><td>${provider.email || 'N/A'}</td></tr>
                    <tr><td><strong>Phone:</strong></td><td>${provider.phone || provider.contactNumber || 'N/A'}</td></tr>
                    <tr><td><strong>Specialty:</strong></td><td>${provider.specialty || 'N/A'}</td></tr>
                    <tr><td><strong>License #:</strong></td><td>${provider.licenseNumber || 'N/A'}</td></tr>
                    <tr><td><strong>Status:</strong></td><td><span class="badge bg-${provider.status === 'active' ? 'success' : 'secondary'}">${provider.status}</span></td></tr>
                </table>
            </div>
            <div class="col-md-6">
                <h6>Location & Availability</h6>
                <table class="table table-sm">
                    <tr><td><strong>Borough:</strong></td><td>${provider.borough || 'N/A'}</td></tr>
                    <tr><td><strong>Address:</strong></td><td>${provider.address || 'N/A'}</td></tr>
                    <tr><td><strong>Zip Codes:</strong></td><td>${provider.zipCodes ? provider.zipCodes.join(', ') : 'N/A'}</td></tr>
                    <tr><td><strong>Weekly Hours:</strong></td><td>${provider.availability?.totalWeeklyHours || 0}h</td></tr>
                    <tr><td><strong>Utilization:</strong></td><td>${provider.utilizationStats?.utilizationPercentage || 0}%</td></tr>
                </table>
            </div>
        </div>
        <div class="row mt-3">
            <div class="col-12">
                <h6>Insurance Networks</h6>
                <div class="insurance-networks">
                    ${provider.insuranceNetworks && provider.insuranceNetworks.length > 0 
                        ? provider.insuranceNetworks.map(ins => `<span class="badge bg-info me-1 mb-1">${ins}</span>`).join('')
                        : '<span class="text-muted">No insurance networks listed</span>'
                    }
                </div>
            </div>
        </div>
        ${provider.availability?.schedule && provider.availability.schedule.length > 0 ? `
        <div class="row mt-3">
            <div class="col-12">
                <h6>Schedule</h6>
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead><tr><th>Day</th><th>Start Time</th><th>End Time</th><th>Hours</th></tr></thead>
                        <tbody>
                            ${provider.availability.schedule.map(slot => `
                                <tr>
                                    <td>${slot.day}</td>
                                    <td>${slot.startTime}</td>
                                    <td>${slot.endTime}</td>
                                    <td>${slot.hours}h</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        ` : ''}
        ${provider.generalNotes ? `
        <div class="row mt-3">
            <div class="col-12">
                <h6>Notes</h6>
                <p class="text-muted">${provider.generalNotes}</p>
            </div>
        </div>
        ` : ''}
    `;
    
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}

function deleteProvider(providerId) {
    if (confirm('Are you sure you want to delete this provider?')) {
        providers = providers.filter(p => p.id !== providerId);
        saveData();
        loadProvidersData();
        updateDashboard();
        addActivity('Deleted provider', 'fa-trash');
    }
}

function importProviders() {
    console.log('=== importProviders() called ===');
    
    try {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        
        input.onchange = function(event) {
            const file = event.target.files[0];
            if (!file) {
                console.error('No file selected');
                return;
            }
            
            console.log('Selected file:', file.name);
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    console.log('File read successfully');
                    const csvData = e.target.result;
                    console.log('CSV data length:', csvData.length, 'characters');
                    
                    // Log first 200 characters of CSV for debugging
                    console.log('CSV preview (first 200 chars):', csvData.substring(0, 200));
                    
                    processProviderInsuranceData(csvData);
                } catch (error) {
                    console.error('Error processing CSV file:', error);
                    alert(`Error processing provider data: ${error.message}\n\nCheck the browser console for more details.`);
                }
            };
            
            reader.onerror = function(error) {
                console.error('Error reading file:', error);
                alert('Error reading the file. Please try again.');
            };
            
            reader.readAsText(file);
        };
        
        // Trigger the file input dialog
        input.click();
        
    } catch (error) {
        console.error('Error in importProviders:', error);
        alert(`Error initializing file import: ${error.message}`);
    }
}

// Process provider CSV data with comprehensive format
function processProviderInsuranceData(csvData) {
    console.log('=== processProviderInsuranceData() called ===');
    
    try {
        // Ensure we have data
        if (!csvData || typeof csvData !== 'string') {
            throw new Error('No CSV data provided');
        }
        
        // Normalize line endings and split into lines
        const lines = csvData.replace(/\r\n/g, '\n').split('\n');
        console.log(`Found ${lines.length} lines in CSV data`);
        
        if (lines.length < 2) {
            throw new Error('CSV file must have at least a header row and one data row');
        }
        
        // Parse headers
        const headers = parseCSVLine(lines[0]);
        console.log('CSV Headers detected:', headers);
        
        if (!headers || headers.length === 0) {
            throw new Error('Could not parse CSV headers');
        }
        
        // Create header mapping for flexible column detection
        const headerMap = {};
        headers.forEach((header, index) => {
            if (!header || typeof header !== 'string') {
                console.warn(`Skipping invalid header at index ${index}`);
                return;
            }
            const cleanHeader = header.trim().toLowerCase().replace(/[\s"]/g, '');
            headerMap[cleanHeader] = index;
        });
        
        console.log('Header map created:', headerMap);
        
        // Map common header variations
        const getColumnIndex = (variations) => {
            for (const variation of variations) {
                const cleanVar = variation.toLowerCase().replace(/["\s]/g, '');
                if (headerMap[cleanVar] !== undefined) {
                    return headerMap[cleanVar];
                }
            }
            return -1;
        };
        
        const nameIndex = getColumnIndex(['CANDIDATE NAME', 'Provider Name', 'Name', 'Provider']);
        const contactIndex = getColumnIndex(['CONTACT NUMBER', 'Contact', 'Phone', 'Contact Number']);
        const emailIndex = getColumnIndex(['EMAIL', 'Email Address']);
        const boroughIndex = getColumnIndex(['BOROUGH', 'Borough', 'Location', 'Area']);
        const positionIndex = getColumnIndex(['Position', 'Role', 'Specialty', 'Title']);
        const rateIndex = getColumnIndex(['Rate', 'Hourly Rate', 'Pay Rate']);
        const paymentTypeIndex = getColumnIndex(['Payment Type', 'Pay Type', 'Payment Method']);
        const availabilityIndex = getColumnIndex(['AVAILABILITY', 'Availability', 'Schedule']);
        const notesIndex = getColumnIndex(['GENERAL NOTES', 'Notes', 'Comments']);
        const insuranceIndex = getColumnIndex(['Insurance', 'Network', 'Insurance Network', 'Networks']);
        
        if (nameIndex === -1) {
            throw new Error('CSV must have a name column (CANDIDATE NAME, Provider Name, or Name)');
        }
        
        let importedCount = 0;
        let updatedCount = 0;
        let errorCount = 0;
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            try {
                const values = parseCSVLine(line);
                if (values.length < headers.length) continue;
                
                const providerName = values[nameIndex]?.trim();
                
                if (!providerName) {
                    console.warn(`Skipping row ${i + 1}: Missing provider name`);
                    continue;
                }
                
                // Extract all available data
                const contactNumber = contactIndex >= 0 ? values[contactIndex]?.trim() : '';
                const email = emailIndex >= 0 ? values[emailIndex]?.trim() : '';
                const borough = boroughIndex >= 0 ? values[boroughIndex]?.trim() : '';
                const position = positionIndex >= 0 ? values[positionIndex]?.trim() : '';
                const rate = rateIndex >= 0 ? values[rateIndex]?.trim() : '';
                const paymentType = paymentTypeIndex >= 0 ? values[paymentTypeIndex]?.trim() : '';
                
                // Clean and structure availability data
                const availabilityRaw = availabilityIndex >= 0 ? values[availabilityIndex]?.trim() : '';
                const availability = cleanAvailability(availabilityRaw);
                
                // Clean and structure general notes
                const notesRaw = notesIndex >= 0 ? values[notesIndex]?.trim() : '';
                const notes = cleanGeneralNotes(notesRaw);
                
                // Extract insurance information
                const insurance = insuranceIndex >= 0 ? values[insuranceIndex]?.trim() : '';
                
                // Check if provider already exists
                let existingProvider = providers.find(p => 
                    p.name.toLowerCase() === providerName.toLowerCase()
                );
                
                if (existingProvider) {
                    // Update existing provider with new data
                    if (contactNumber) existingProvider.phone = contactNumber;
                    if (email) existingProvider.email = email;
                    if (borough) existingProvider.borough = borough;
                    if (position) existingProvider.specialty = position;
                    if (rate) existingProvider.rate = rate;
                    if (paymentType) existingProvider.paymentType = paymentType;
                    
                    // Update availability - merge with existing if needed
                    if (availabilityRaw) {
                        if (!existingProvider.availability) {
                            existingProvider.availability = availability;
                        } else {
                            // Merge availability days and time ranges
                            const existingAvail = existingProvider.availability;
                            const newDays = [...new Set([...existingAvail.days, ...availability.days])];
                            const newTimeRanges = [...existingAvail.timeRanges];
                            
                            // Add new time ranges if they don't exist
                            availability.timeRanges.forEach(newRange => {
                                const exists = newTimeRanges.some(
                                    r => r.start === newRange.start && r.end === newRange.end
                                );
                                if (!exists) {
                                    newTimeRanges.push(newRange);
                                }
                            });
                            
                            existingProvider.availability = {
                                raw: existingAvail.raw + '; ' + availability.raw,
                                days: newDays,
                                timeRanges: newTimeRanges,
                                isAvailable: existingAvail.isAvailable && availability.isAvailable
                            };
                        }
                    }
                    
                    // Update notes - merge with existing
                    if (notesRaw) {
                        if (!existingProvider.notes) {
                            existingProvider.notes = notes;
                        } else {
                            // Only add new unique notes
                            const existingNotes = new Set(existingProvider.notes);
                            notes.forEach(note => existingNotes.add(note));
                            existingProvider.notes = Array.from(existingNotes);
                        }
                    }
                    
                    // Add insurance to network if it doesn't exist
                    if (insurance) {
                        if (!existingProvider.insuranceNetworks) {
                            existingProvider.insuranceNetworks = [];
                        }
                        if (!existingProvider.insuranceNetworks.includes(insurance)) {
                            existingProvider.insuranceNetworks.push(insurance);
                        }
                    }
                    
                    existingProvider.lastUpdated = new Date().toISOString();
                    updatedCount++;
                } else {
                    // Create new provider with comprehensive data
                    const newProvider = {
                        id: Date.now() + Math.random() + i,
                        name: providerName,
                        phone: contactNumber || '',
                        email: email || '',
                        specialty: position || 'PT',
                        borough: borough || '',
                        rate: rate || '',
                        paymentType: paymentType || '',
                        availability: availability || {
                            raw: '',
                            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                            timeRanges: [{ start: '9:00 AM', end: '5:00 PM' }],
                            isAvailable: true
                        },
                        notes: notes || [],
                        status: 'active',
                        dateAdded: new Date().toISOString(),
                        insuranceNetworks: insurance ? [insurance] : [],
                        lastUpdated: new Date().toISOString(),
                        // Add additional fields for better filtering
                        fullName: providerName,
                        displayName: providerName,
                        isActive: true,
                        // Add empty arrays for future use
                        credentials: [],
                        specialties: position ? [position] : [],
                        languages: [],
                        // Add metadata
                        source: 'import',
                        importDate: new Date().toISOString(),
                        // Add empty objects for future use
                        contact: {
                            phone: contactNumber || '',
                            email: email || '',
                            address: ''
                        },
                        // Add empty schedule object
                        schedule: {
                            monday: availability?.days?.includes('Monday') ? availability.timeRanges : [],
                            tuesday: availability?.days?.includes('Tuesday') ? availability.timeRanges : [],
                            wednesday: availability?.days?.includes('Wednesday') ? availability.timeRanges : [],
                            thursday: availability?.days?.includes('Thursday') ? availability.timeRanges : [],
                            friday: availability?.days?.includes('Friday') ? availability.timeRanges : [],
                            saturday: availability?.days?.includes('Saturday') ? availability.timeRanges : [],
                            sunday: availability?.days?.includes('Sunday') ? availability.timeRanges : []
                        }
                    };
                    
                    providers.push(newProvider);
                    importedCount++;
                }
                
            } catch (lineError) {
                console.error(`Error processing row ${i + 1}:`, lineError);
                errorCount++;
            }
        }
        
        // Save data and update UI
        saveData();
        updateDashboard();
        
        // Force refresh the provider table
        setTimeout(() => {
            loadProvidersData();
            renderProvidersTable();
        }, 100);
        
        // Show import results
        const message = `Provider Import Completed!\n\nNew providers: ${importedCount}\nUpdated providers: ${updatedCount}\nErrors: ${errorCount}\n\nTotal providers now: ${providers.length}`;
        alert(message);
        
        // Add activity log
        addActivity(`Imported provider data: ${importedCount} new, ${updatedCount} updated`, 'fa-file-import');
        
    } catch (error) {
        console.error('Provider import error:', error);
        alert(`Error processing provider data: ${error.message}`);
    }
}

function clearProviderFilters() {
    const searchInput = document.getElementById('providerSearch');
    const statusFilter = document.getElementById('providerStatusFilter');
    const specialtyFilter = document.getElementById('providerSpecialtyFilter');
    const sortBy = document.getElementById('providerSortBy');
    const sortOrder = document.getElementById('providerSortOrder');
    
    if (searchInput) searchInput.value = '';
    if (statusFilter) statusFilter.value = '';
    if (specialtyFilter) specialtyFilter.value = '';
    if (sortBy) sortBy.value = 'name';
    if (sortOrder) sortOrder.value = 'asc';
    
    renderProvidersTable();
}

// Helper function to clean and structure availability data
function cleanAvailability(availability) {
    if (!availability) return [];
    
    // Common patterns to extract
    const patterns = [
        // Matches: "Mon to Fri from 2pm till evening"
        /(Mon|Tues|Wed|Thur|Fri|Sat|Sun)(?:\s*to\s*(Mon|Tues|Wed|Thur|Fri|Sat|Sun))?\s*(?:from\s*)?(\d{1,2}(?::\d{2})?\s*[ap]m)?(?:\s*till\s*(\d{1,2}(?::\d{2})?\s*[ap]m|evening|morning|afternoon|night))?/gi,
        // Matches: "Available on Monday, Wednesday, Friday"
        /(?:available\s*on\s*)?(?:every\s*)?(\w+)(?:\s*,\s*(\w+))*/gi,
        // Matches: "9am-5pm" or "9:00 AM - 5:00 PM"
        /(\d{1,2}(?::\d{2})?\s*[ap]m?\s*-\s*\d{1,2}(?::\d{2})?\s*[ap]m?)/gi
    ];
    
    // Common abbreviations to full day names
    const dayMap = {
        'mon': 'Monday', 'tue': 'Tuesday', 'tues': 'Tuesday', 'wed': 'Wednesday',
        'thu': 'Thursday', 'thurs': 'Thursday', 'fri': 'Friday', 'sat': 'Saturday',
        'sun': 'Sunday'
    };
    
    // Clean the input
    let cleanText = availability
        .toLowerCase()
        .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
        .replace(/[^\w\s,\-:]/g, '')  // Remove special chars except those used in times
        .trim();
    
    // Try to extract structured data
    const days = [];
    const timeRanges = [];
    
    // Extract days of the week
    const dayPattern = /(mon|tue|tues|wed|thu|thurs|fri|sat|sun)/gi;
    let dayMatch;
    while ((dayMatch = dayPattern.exec(cleanText)) !== null) {
        const dayAbbr = dayMatch[0].toLowerCase();
        if (dayMap[dayAbbr] && !days.includes(dayMap[dayAbbr])) {
            days.push(dayMap[dayAbbr]);
        }
    }
    
    // Extract time ranges
    const timePattern = /(\d{1,2}(?::\d{2})?\s*[ap]m?)\s*-\s*(\d{1,2}(?::\d{2})?\s*[ap]m?)/gi;
    let timeMatch;
    while ((timeMatch = timePattern.exec(cleanText)) !== null) {
        timeRanges.push({
            start: timeMatch[1].trim(),
            end: timeMatch[2].trim()
        });
    }
    
    // If no specific times but has "evening", "morning", etc.
    if (timeRanges.length === 0) {
        if (/evening/i.test(availability)) timeRanges.push({ start: '5:00 PM', end: '9:00 PM' });
        if (/morning/i.test(availability)) timeRanges.push({ start: '8:00 AM', end: '12:00 PM' });
        if (/afternoon/i.test(availability)) timeRanges.push({ start: '12:00 PM', end: '5:00 PM' });
    }
    
    return {
        raw: availability,
        days: days.length > 0 ? days : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        timeRanges: timeRanges.length > 0 ? timeRanges : [{ start: '9:00 AM', end: '5:00 PM' }],
        isAvailable: !/not available|unavailable|n\/a|none/i.test(availability)
    };
}

// Helper function to clean and structure general notes
function cleanGeneralNotes(notes) {
    if (!notes) return [];
    
    // Split by common separators and clean up
    return notes
        .split(/[,\n\|;]+/)  // Split by comma, newline, pipe, or semicolon
        .map(item => item.trim())
        .filter(item => item.length > 0)
        .map(item => {
            // Clean up common patterns
            return item
                .replace(/^[-\*\s]+/, '')  // Remove leading dashes, asterisks, or spaces
                .replace(/\s+/g, ' ')      // Collapse multiple spaces
                .replace(/\s*[,\.;]\s*$/, '')  // Remove trailing punctuation
                .trim();
        });
}

// Clear all provider data
function clearAllProviderData() {
    if (confirm('Are you sure you want to delete ALL provider data? This action cannot be undone.')) {
        providers = [];
        window.providers = [];
        try { localStorage.removeItem('providers'); } catch (_) {}
        saveData(); // persists empty arrays for all datasets
        updateDashboard();
        // Re-render providers table using empty data source
        try { renderProvidersTable(); } catch (_) {}
        addActivity('Cleared all provider data', 'fa-trash-alt');
        alert('All provider data has been cleared.');
    }
}

// Clear all patient data
function clearAllPatientData() {
    if (confirm('Are you sure you want to delete ALL patient data? This action cannot be undone.')) {
        patients = [];
        saveData();
        updateDashboard();
        loadPatientsData();
        addActivity('Cleared all patient data', 'fa-trash-alt');
        alert('All patient data has been cleared.');
    }
}

// Debug function to check provider data from console
window.debugProviders = function() {
    console.log('=== DEBUG: Provider Data ===');
    console.log('Current providers array length:', providers.length);
    
    // Show first 3 providers as samples
    console.log('Sample providers (first 3):', providers.slice(0, 3));
    
    // Check localStorage directly
    const savedProviders = localStorage.getItem('providers');
    console.log('Raw providers from localStorage:', savedProviders);
    
    // Check table container
    const tableContainer = document.getElementById('providers-table-container');
    console.log('Table container exists:', !!tableContainer);
    
    // Return the providers array for further inspection
    return providers;
};

// Debug function to refresh provider data
function debugRefreshProviderData() {
    console.log('=== DEBUG: Refreshing provider data ===');
    console.log('Current providers array length:', providers.length);
    
    // Force reload from localStorage
    const savedProviders = localStorage.getItem('providers');
    console.log('Raw providers from localStorage:', savedProviders);
    
    if (savedProviders) {
        try {
            const parsedProviders = JSON.parse(savedProviders);
            console.log('Parsed providers from localStorage:', parsedProviders);
            
            // Update the providers array
            providers = Array.isArray(parsedProviders) ? parsedProviders : [];
            console.log('Updated providers array length:', providers.length);
            
            // Force re-render
            renderProvidersTable();
            
            // Show visual feedback
            const tableContainer = document.getElementById('providers-table-container');
            if (tableContainer) {
                if (providers.length === 0) {
                    tableContainer.innerHTML = `
                        <div class="alert alert-warning">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            No providers found in the system.
                        </div>
                    `;
                }
            }
            
            alert(`Refreshed provider data. Found ${providers.length} providers.`);
        } catch (e) {
            console.error('Error parsing providers:', e);
            alert('Error parsing provider data. Check console for details.');
        }
    } else {
        console.log('No provider data found in localStorage');
        alert('No provider data found in localStorage');
    }
}

// Referral CRUD Operations
function addNewReferral() {
    // Create and show the add referral modal
    const modal = document.getElementById('addReferralModal') || createAddReferralModal();
    
    // Reset form
    document.getElementById('referralPatientName').value = '';
    document.getElementById('referralPhone').value = '';
    document.getElementById('referralEmail').value = '';
    document.getElementById('referralDiagnosis').value = '';
    document.getElementById('referralSource').value = '';
    document.getElementById('referralPriority').value = 'medium';
    document.getElementById('referralStatus').value = 'new';
    document.getElementById('referralNotes').value = '';
    
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}

function editReferral(referralId) {
    const referral = referrals.find(r => r.id == referralId);
    if (!referral) {
        alert('Referral not found!');
        return;
    }
    
    // Create and show the edit referral modal
    const modal = document.getElementById('editReferralModal') || createEditReferralModal();
    
    // Populate form with existing data
    document.getElementById('editReferralId').value = referral.id;
    document.getElementById('editReferralPatientName').value = referral.patientName || '';
    document.getElementById('editReferralPhone').value = referral.phone || '';
    document.getElementById('editReferralEmail').value = referral.email || '';
    document.getElementById('editReferralDiagnosis').value = referral.diagnosis || '';
    document.getElementById('editReferralSource').value = referral.source || '';
    document.getElementById('editReferralPriority').value = referral.priority || 'medium';
    document.getElementById('editReferralStatus').value = referral.status || 'new';
    document.getElementById('editReferralNotes').value = referral.notes || '';
    
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}

function convertReferral(referralId) {
    const referral = referrals.find(r => r.id === referralId);
    if (!referral) return;
    
    if (confirm(`Convert referral for ${referral.patientName} to patient?`)) {
        // Create new patient from referral
        const newPatient = {
            id: Date.now(),
            name: referral.patientName,
            patientId: `REF-${referral.id}`,
            phone: referral.phone || '',
            address: referral.address || '',
            status: 'active',
            dateAdded: new Date().toISOString(),
            referralSource: referral.source,
            diagnosis: referral.diagnosis
        };
        
        patients.push(newPatient);
        
        // Update referral status
        referral.status = 'converted';
        referral.convertedDate = new Date().toISOString();
        
        saveData();
        updateDashboard();
        loadReferralsData();
        addActivity(`Converted referral to patient: ${referral.patientName}`, 'fa-user-plus');
        
        alert(`Referral converted to patient successfully!`);
    }
}

function deleteReferral(referralId) {
    if (confirm('Are you sure you want to delete this referral?')) {
        referrals = referrals.filter(r => r.id !== referralId);
        saveData();
        loadReferralsData();
        updateDashboard();
        addActivity('Deleted referral', 'fa-trash');
    }
}

function importReferrals() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const csvData = e.target.result;
                    processReferralData(csvData);
                } catch (error) {
                    alert(`Error importing referral data: ${error.message}`);
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

function clearReferralFilters() {
    document.getElementById('referralSearch').value = '';
    document.getElementById('referralStatusFilter').value = '';
    document.getElementById('referralSourceFilter').value = '';
    document.getElementById('referralPriorityFilter').value = '';
    document.getElementById('referralSortBy').value = 'dateReceived';
    renderReferralsTable();
}

// Function to clear all data and start fresh
function clearAllData() {
    const confirmMessage = 'Are you sure you want to clear ALL data?\n\nThis will permanently delete:\n• All patients\n• All providers\n• All referrals\n• All appointments\n• All tasks\n• All insurance claims\n• All competitors\n• All activities\n• All imported data\n\nThis action cannot be undone!';
    
    if (confirm(confirmMessage)) {
        // Clear all data arrays
        patients = [];
        providers = [];
        referrals = [];
        appointments = [];
        tasks = [];
        insuranceClaims = [];
        competitors = [];
        activities = [];
        
        // Clear unique headers and duplicate tracking
        allUniqueHeaders.clear();
        importedRowHashes.clear();
        
        // Clear localStorage
        localStorage.removeItem('patients');
        localStorage.removeItem('providers');
        localStorage.removeItem('referrals');
        localStorage.removeItem('appointments');
        localStorage.removeItem('tasks');
        localStorage.removeItem('insuranceClaims');
        localStorage.removeItem('competitors');
        localStorage.removeItem('activities');
        
        // Update UI
        updateDashboard();
        loadPatientsData();
        
        // Add activity log
        addActivity('All data cleared - fresh start', 'fa-trash-alt');
        
        alert('All data has been cleared successfully!\n\nYou can now start fresh with new imports.');
    }
}