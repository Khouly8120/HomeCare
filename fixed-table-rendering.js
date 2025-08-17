// Fixed Table Rendering System - Handles actual CSV data structure
// Replaces the broken table rendering with proper field mapping

// Enhanced patient table rendering with comprehensive field mapping
window.renderPatientsTable = function() {
    console.log('🔄 Rendering patients table with enhanced mapping...');
    
    const patients = JSON.parse(localStorage.getItem('patients') || '[]');
    const tableBody = document.getElementById('patientsTableBody');
    
    if (!tableBody) {
        console.warn('❌ Patients table body not found');
        return;
    }
    
    // Debug: Show actual data structure
    if (patients.length > 0) {
        console.log('Sample patient data:', patients[0]);
        console.log('Available fields:', Object.keys(patients[0]));
    }
    
    // Get filter values
    const searchTerm = (document.getElementById('searchPatients')?.value || '').toLowerCase();
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    const insuranceFilter = document.getElementById('insuranceFilter')?.value || '';
    
    // Filter patients
    let filteredPatients = patients.filter(patient => {
        // Create searchable text from all patient fields
        const searchableText = Object.values(patient).join(' ').toLowerCase();
        const matchesSearch = !searchTerm || searchableText.includes(searchTerm);
        
        // Status matching - check multiple possible status fields
        const patientStatus = patient.status || patient.Status || patient['Patient Status'] || '';
        const matchesStatus = !statusFilter || patientStatus.toLowerCase().includes(statusFilter.toLowerCase());
        
        // Insurance matching - check multiple possible insurance fields
        const insuranceText = [
            patient.insurance, patient.Insurance, patient['Primary Insurance'], 
            patient.primaryInsurance, patient['Insurance Company'], patient.payer
        ].filter(Boolean).join(' ').toLowerCase();
        const matchesInsurance = !insuranceFilter || insuranceText.includes(insuranceFilter.toLowerCase());
        
        return matchesSearch && matchesStatus && matchesInsurance;
    });
    
    if (filteredPatients.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">
                    <i class="fas fa-users fa-2x mb-3 d-block"></i>
                    ${patients.length === 0 ? 'No patients found. Click "Import CSV" to get started.' : 'No patients match your current filters.'}
                </td>
            </tr>
        `;
        return;
    }
    
    // Render patients with intelligent field mapping
    tableBody.innerHTML = filteredPatients.map(patient => {
        // Smart name extraction - try multiple field combinations
        const name = extractPatientName(patient);
        const email = extractPatientEmail(patient);
        const dob = extractPatientDOB(patient);
        const phone = extractPatientPhone(patient);
        const visits = extractPatientVisits(patient);
        
        return `
            <tr>
                <td>
                    <strong>${name}</strong><br>
                    <small class="text-muted">${email}</small>
                </td>
                <td>${dob}</td>
                <td>${phone}</td>
                <td>${visits}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="viewPatient('${patient.id || 'unknown'}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-success" onclick="editPatient('${patient.id || 'unknown'}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="deletePatient('${patient.id || 'unknown'}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    console.log(`✅ Rendered ${filteredPatients.length} patients`);
};

// Enhanced provider table rendering
window.renderProvidersTable = function() {
    console.log('🔄 Rendering providers table with enhanced mapping...');
    
    const providers = JSON.parse(localStorage.getItem('providers') || '[]');
    const tableBody = document.getElementById('providersTableBody');
    
    if (!tableBody) {
        console.warn('❌ Providers table body not found');
        return;
    }
    
    // Debug: Show actual data structure
    if (providers.length > 0) {
        console.log('Sample provider data:', providers[0]);
        console.log('Available fields:', Object.keys(providers[0]));
    }
    
    // Get filter values
    const searchTerm = (document.getElementById('providerSearch')?.value || '').toLowerCase();
    const statusFilter = document.getElementById('providerStatusFilter')?.value || '';
    const specialtyFilter = document.getElementById('providerSpecialtyFilter')?.value || '';
    
    // Filter providers
    let filteredProviders = providers.filter(provider => {
        const searchableText = Object.values(provider).join(' ').toLowerCase();
        const matchesSearch = !searchTerm || searchableText.includes(searchTerm);
        
        const providerStatus = provider.status || provider.Status || provider['Provider Status'] || 'active';
        const matchesStatus = !statusFilter || providerStatus.toLowerCase().includes(statusFilter.toLowerCase());
        
        const specialty = provider.specialty || provider.position || provider.Position || provider.Specialty || '';
        const matchesSpecialty = !specialtyFilter || specialty.toLowerCase().includes(specialtyFilter.toLowerCase());
        
        return matchesSearch && matchesStatus && matchesSpecialty;
    });
    
    if (filteredProviders.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    <i class="fas fa-user-md fa-2x mb-3 d-block"></i>
                    ${providers.length === 0 ? 'No providers found. Click "Import Provider Data" to get started.' : 'No providers match your current filters.'}
                </td>
            </tr>
        `;
        return;
    }
    
    // Render providers with intelligent field mapping
    tableBody.innerHTML = filteredProviders.map(provider => {
        const name = extractProviderName(provider);
        const phone = extractProviderPhone(provider);
        const email = extractProviderEmail(provider);
        const rate = extractProviderRate(provider);
        const position = extractProviderPosition(provider);
        
        return `
            <tr>
                <td>
                    <strong>${name}</strong>
                    ${provider.license || provider.License || provider['PT License #'] ? 
                        `<br><small class="text-muted">License: ${provider.license || provider.License || provider['PT License #']}</small>` : ''}
                </td>
                <td>${phone}</td>
                <td>${email}</td>
                <td>${rate}</td>
                <td>
                    <span class="badge bg-${getStatusColor(provider.status || 'active')}">
                        ${position}
                    </span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="viewProviderDetails('${provider.id || 'unknown'}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-success" onclick="editProvider('${provider.id || 'unknown'}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteProvider('${provider.id || 'unknown'}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    console.log(`✅ Rendered ${filteredProviders.length} providers`);
};

// Smart field extraction functions for patients
function extractPatientName(patient) {
    // Try multiple name field combinations
    if (patient.name) return patient.name;
    if (patient.Name) return patient.Name;
    if (patient['Patient Name']) return patient['Patient Name'];
    
    // Try first + last name combinations
    const firstName = patient.firstName || patient['First Name'] || patient.first_name || '';
    const lastName = patient.lastName || patient['Last Name'] || patient.last_name || '';
    
    if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim();
    }
    
    return 'Unknown Patient';
}

function extractPatientEmail(patient) {
    return patient.email || patient.Email || patient['Email Address'] || patient.emailAddress || 'No email';
}

function extractPatientDOB(patient) {
    return patient.dob || patient.DOB || patient['Date of Birth'] || patient.birthdate || 
           patient['Patient DOB'] || patient.dateOfBirth || 'N/A';
}

function extractPatientPhone(patient) {
    return patient.phone || patient.Phone || patient['Phone Number'] || patient.mobile || 
           patient.Mobile || patient['Mobile Phone'] || patient.contactNumber || 
           patient['Contact Number'] || 'N/A';
}

function extractPatientVisits(patient) {
    return patient.visits || patient.Visits || patient['Number of Visits'] || 
           patient.numberOfVisits || patient.visitCount || '0';
}

// Smart field extraction functions for providers
function extractProviderName(provider) {
    if (provider.name) return provider.name;
    if (provider.Name) return provider.Name;
    if (provider['Provider Name']) return provider['Provider Name'];
    
    const firstName = provider.firstName || provider['First Name'] || provider.first_name || '';
    const lastName = provider.lastName || provider['Last Name'] || provider.last_name || '';
    
    if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim();
    }
    
    return 'Unknown Provider';
}

function extractProviderPhone(provider) {
    return provider.phone || provider.Phone || provider['Mobile Phone'] || provider.mobile || 
           provider.Mobile || provider['Phone Number'] || provider.contactNumber || 'Not provided';
}

function extractProviderEmail(provider) {
    return provider.email || provider.Email || provider['Email Address'] || provider.emailAddress || 'N/A';
}

function extractProviderRate(provider) {
    const rate = provider.rate || provider.Rate || provider['Hourly Rate'] || provider.hourlyRate || '';
    return rate ? `$${rate}` : 'N/A';
}

function extractProviderPosition(provider) {
    const position = provider.position || provider.Position || provider.specialty || 
                    provider.Specialty || provider.title || provider.Title || 'N/A';
    return position.toUpperCase();
}

// Helper function for status colors
function getStatusColor(status) {
    switch(status.toLowerCase()) {
        case 'active': return 'success';
        case 'pending': return 'warning';
        case 'inactive': return 'secondary';
        case 'credentialing': return 'info';
        default: return 'primary';
    }
}

// Keep existing filter and utility functions
window.filterPatients = function() {
    renderPatientsTable();
};

window.filterProviders = function() {
    renderProvidersTable();
};

window.clearFilters = function() {
    const patientSearch = document.getElementById('searchPatients');
    const statusFilter = document.getElementById('statusFilter');
    const insuranceFilter = document.getElementById('insuranceFilter');
    
    if (patientSearch) patientSearch.value = '';
    if (statusFilter) statusFilter.value = '';
    if (insuranceFilter) insuranceFilter.value = '';
    
    renderPatientsTable();
};

// Force override any existing table rendering functions
console.log('🔄 Overriding existing table rendering functions...');

// Immediately call the functions to test and refresh tables
setTimeout(() => {
    console.log('🔄 Auto-refreshing tables with new rendering...');
    if (typeof window.renderPatientsTable === 'function') {
        window.renderPatientsTable();
    }
    if (typeof window.renderProvidersTable === 'function') {
        window.renderProvidersTable();
    }
}, 500);

console.log('✅ Fixed Table Rendering System loaded - auto-refresh scheduled');
