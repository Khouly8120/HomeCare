// Consolidated Table Rendering System
// Replaces duplicate/conflicting table rendering functions

// Global table rendering functions
window.renderPatientsTable = function() {
    console.log('🔄 Rendering patients table...');
    
    const patients = JSON.parse(localStorage.getItem('patients') || '[]');
    const tableBody = document.getElementById('patientsTableBody');
    
    if (!tableBody) {
        console.warn('❌ Patients table body not found');
        return;
    }
    
    // Get filter values
    const searchTerm = (document.getElementById('searchPatients')?.value || '').toLowerCase();
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    const insuranceFilter = document.getElementById('insuranceFilter')?.value || '';
    
    // Filter patients
    let filteredPatients = patients.filter(patient => {
        const matchesSearch = !searchTerm || 
            (patient.firstName && patient.firstName.toLowerCase().includes(searchTerm)) ||
            (patient.lastName && patient.lastName.toLowerCase().includes(searchTerm)) ||
            (patient.name && patient.name.toLowerCase().includes(searchTerm)) ||
            (patient.email && patient.email.toLowerCase().includes(searchTerm)) ||
            (patient.phone && patient.phone.includes(searchTerm)) ||
            (patient.mobile && patient.mobile.includes(searchTerm));
            
        const matchesStatus = !statusFilter || patient.status === statusFilter;
        const matchesInsurance = !insuranceFilter || 
            (patient.insurance && patient.insurance.toLowerCase().includes(insuranceFilter.toLowerCase())) ||
            (patient.primaryInsurance && patient.primaryInsurance.toLowerCase().includes(insuranceFilter.toLowerCase()));
            
        return matchesSearch && matchesStatus && matchesInsurance;
    });
    
    if (filteredPatients.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">
                    <i class="fas fa-users fa-2x mb-3 d-block"></i>
                    ${patients.length === 0 ? 'No patients found. Click "Import CSV" or "Add Patient" to get started.' : 'No patients match your current filters.'}
                </td>
            </tr>
        `;
        return;
    }
    
    // Debug: Log first patient to see actual data structure
    if (filteredPatients.length > 0) {
        console.log('First patient data structure:', JSON.stringify(filteredPatients[0], null, 2));
    }
    
    tableBody.innerHTML = filteredPatients.map(patient => {
        // Get the actual name - handle various field names
        const fullName = patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 
                        `${patient['first name'] || ''} ${patient['last name'] || ''}`.trim() || 'Unknown';
        
        // Get email with fallback
        const email = patient.email || patient['email address'] || patient.emailAddress || '';
        
        // Get phone with multiple fallbacks
        const phone = patient.phone || patient.mobile || patient.contactNumber || 
                     patient['phone number'] || patient['mobile phone'] || patient['contact number'] || 'N/A';
        
        // Get DOB with fallbacks
        const dob = patient.dob || patient.birthdate || patient['date of birth'] || 
                   patient['patient dob'] || patient.dateOfBirth || 'N/A';
        
        // Get visits
        const visits = patient.visits || patient.numberOfVisits || patient['number of visits'] || '0';
        
        return `
            <tr>
                <td>
                    <strong>${fullName}</strong><br>
                    <small class="text-muted">${email || 'No email'}</small>
                </td>
                <td>${dob}</td>
                <td>${phone}</td>
                <td>${visits}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="viewPatient('${patient.id}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-success" onclick="editPatient('${patient.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="deletePatient('${patient.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    console.log(`✅ Rendered ${filteredPatients.length} patients`);
};

window.renderProvidersTable = function() {
    console.log('🔄 Rendering providers table...');
    
    const providers = JSON.parse(localStorage.getItem('providers') || '[]');
    const tableBody = document.getElementById('providersTableBody');
    
    if (!tableBody) {
        console.warn('❌ Providers table body not found');
        return;
    }
    
    // Get filter values
    const searchTerm = (document.getElementById('providerSearch')?.value || '').toLowerCase();
    const statusFilter = document.getElementById('providerStatusFilter')?.value || '';
    const specialtyFilter = document.getElementById('providerSpecialtyFilter')?.value || '';
    const sortBy = document.getElementById('providerSortBy')?.value || 'name-asc';
    
    // Filter providers
    let filteredProviders = providers.filter(provider => {
        const matchesSearch = !searchTerm || 
            (provider.firstName && provider.firstName.toLowerCase().includes(searchTerm)) ||
            (provider.lastName && provider.lastName.toLowerCase().includes(searchTerm)) ||
            (provider.name && provider.name.toLowerCase().includes(searchTerm)) ||
            (provider.email && provider.email.toLowerCase().includes(searchTerm)) ||
            (provider.phone && provider.phone.includes(searchTerm)) ||
            (provider.mobile && provider.mobile.includes(searchTerm)) ||
            (provider.license && provider.license.toLowerCase().includes(searchTerm));
            
        const matchesStatus = !statusFilter || provider.status === statusFilter;
        const matchesSpecialty = !specialtyFilter || 
            (provider.specialty && provider.specialty === specialtyFilter) ||
            (provider.position && provider.position === specialtyFilter);
            
        return matchesSearch && matchesStatus && matchesSpecialty;
    });
    
    // Sort providers
    filteredProviders.sort((a, b) => {
        const [field, direction] = sortBy.split('-');
        let aVal = '', bVal = '';
        
        switch(field) {
            case 'name':
                aVal = `${a.firstName || ''} ${a.lastName || ''}`.trim() || a.name || '';
                bVal = `${b.firstName || ''} ${b.lastName || ''}`.trim() || b.name || '';
                break;
            case 'specialty':
                aVal = a.specialty || a.position || '';
                bVal = b.specialty || b.position || '';
                break;
            case 'status':
                aVal = a.status || '';
                bVal = b.status || '';
                break;
            default:
                aVal = a[field] || '';
                bVal = b[field] || '';
        }
        
        const comparison = aVal.localeCompare(bVal);
        return direction === 'desc' ? -comparison : comparison;
    });
    
    if (filteredProviders.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    <i class="fas fa-user-md fa-2x mb-3 d-block"></i>
                    ${providers.length === 0 ? 'No providers found. Click "Import Provider Data" or "Add Provider" to get started.' : 'No providers match your current filters.'}
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = filteredProviders.map(provider => `
        <tr>
            <td>
                <strong>${provider.firstName || ''} ${provider.lastName || ''}</strong>
                ${provider.license ? `<br><small class="text-muted">License: ${provider.license}</small>` : ''}
            </td>
            <td>${provider.mobile || provider.phone || 'N/A'}</td>
            <td>${provider.email || 'N/A'}</td>
            <td>${provider.rate ? '$' + provider.rate : 'N/A'}</td>
            <td>
                <span class="badge bg-${getStatusColor(provider.status || 'active')}">
                    ${(provider.specialty || provider.position || 'N/A').toUpperCase()}
                </span>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="viewProviderDetails('${provider.id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline-success" onclick="editProvider('${provider.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteProvider('${provider.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    console.log(`✅ Rendered ${filteredProviders.length} providers`);
};

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

// Filter functions
window.filterPatients = function() {
    renderPatientsTable();
};

window.filterProviders = function() {
    renderProvidersTable();
};

// Clear filter functions
window.clearFilters = function() {
    // Clear patient filters
    const patientSearch = document.getElementById('searchPatients');
    const statusFilter = document.getElementById('statusFilter');
    const insuranceFilter = document.getElementById('insuranceFilter');
    
    if (patientSearch) patientSearch.value = '';
    if (statusFilter) statusFilter.value = '';
    if (insuranceFilter) insuranceFilter.value = '';
    
    renderPatientsTable();
};

window.clearProviderFilters = function() {
    // Clear provider filters
    const providerSearch = document.getElementById('providerSearch');
    const statusFilter = document.getElementById('providerStatusFilter');
    const specialtyFilter = document.getElementById('providerSpecialtyFilter');
    const sortBy = document.getElementById('providerSortBy');
    
    if (providerSearch) providerSearch.value = '';
    if (statusFilter) statusFilter.value = '';
    if (specialtyFilter) specialtyFilter.value = '';
    if (sortBy) sortBy.value = 'name-asc';
    
    renderProvidersTable();
};

// Data management functions
window.clearAllPatientData = function() {
    if (confirm('⚠️ Are you sure you want to delete ALL patient data? This cannot be undone!')) {
        localStorage.removeItem('patients');
        window.patients = [];
        renderPatientsTable();
        if (typeof updateDashboard === 'function') {
            updateDashboard();
        }
        console.log('✅ All patient data cleared');
        alert('✅ All patient data has been cleared');
    }
};

window.clearAllProviderData = function() {
    if (confirm('⚠️ Are you sure you want to delete ALL provider data? This cannot be undone!')) {
        localStorage.removeItem('providers');
        window.providers = [];
        renderProvidersTable();
        if (typeof updateDashboard === 'function') {
            updateDashboard();
        }
        console.log('✅ All provider data cleared');
        alert('✅ All provider data has been cleared');
    }
};

// Basic CRUD operations
window.viewPatient = function(patientId) {
    console.log('👁️ Viewing patient:', patientId);
    // This would open a patient details modal
    alert('Patient details view - to be implemented');
};

window.editPatient = function(patientId) {
    console.log('✏️ Editing patient:', patientId);
    // This would open a patient edit modal
    alert('Patient edit - to be implemented');
};

window.deletePatient = function(patientId) {
    if (confirm('Are you sure you want to delete this patient?')) {
        const patients = JSON.parse(localStorage.getItem('patients') || '[]');
        const filteredPatients = patients.filter(p => p.id !== patientId);
        localStorage.setItem('patients', JSON.stringify(filteredPatients));
        window.patients = filteredPatients;
        renderPatientsTable();
        console.log('✅ Patient deleted');
    }
};

window.editProvider = function(providerId) {
    console.log('✏️ Editing provider:', providerId);
    // This would open a provider edit modal
    alert('Provider edit - to be implemented');
};

window.deleteProvider = function(providerId) {
    if (confirm('Are you sure you want to delete this provider?')) {
        const providers = JSON.parse(localStorage.getItem('providers') || '[]');
        const filteredProviders = providers.filter(p => p.id !== providerId);
        localStorage.setItem('providers', JSON.stringify(filteredProviders));
        window.providers = filteredProviders;
        renderProvidersTable();
        console.log('✅ Provider deleted');
    }
};

// Add new record functions
window.addNewPatient = function() {
    console.log('➕ Adding new patient...');
    // This would open a new patient modal
    alert('Add new patient - to be implemented');
};

window.addNewProvider = function() {
    console.log('➕ Adding new provider...');
    // This would open a new provider modal
    alert('Add new provider - to be implemented');
};

// Export functions
window.exportPatients = function() {
    console.log('📤 Exporting patients...');
    const patients = JSON.parse(localStorage.getItem('patients') || '[]');
    
    if (patients.length === 0) {
        alert('No patients to export');
        return;
    }
    
    // Convert to CSV
    const headers = ['Name', 'Email', 'Phone', 'DOB', 'Address', 'Insurance', 'Status'];
    const csvContent = [
        headers.join(','),
        ...patients.map(p => [
            `"${p.firstName || ''} ${p.lastName || ''}"`,
            `"${p.email || ''}"`,
            `"${p.phone || p.mobile || p.contactNumber || ''}"`,
            `"${p.dob || p.birthdate || ''}"`,
            `"${p.address || ''}"`,
            `"${p.insurance || p.primaryInsurance || ''}"`,
            `"${p.status || ''}"`
        ].join(','))
    ].join('\n');
    
    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patients_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    console.log('✅ Patients exported');
};

window.exportProviders = function() {
    console.log('📤 Exporting providers...');
    const providers = JSON.parse(localStorage.getItem('providers') || '[]');
    
    if (providers.length === 0) {
        alert('No providers to export');
        return;
    }
    
    // Convert to CSV
    const headers = ['Name', 'Email', 'Phone', 'License', 'Specialty', 'Rate', 'Status'];
    const csvContent = [
        headers.join(','),
        ...providers.map(p => [
            `"${p.firstName || ''} ${p.lastName || ''}"`,
            `"${p.email || ''}"`,
            `"${p.mobile || p.phone || ''}"`,
            `"${p.license || ''}"`,
            `"${p.specialty || p.position || ''}"`,
            `"${p.rate || ''}"`,
            `"${p.status || ''}"`
        ].join(','))
    ].join('\n');
    
    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `providers_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    console.log('✅ Providers exported');
};

console.log('✅ Table Rendering System loaded');
