// Force refresh script - bypasses all caching issues
(function() {
    'use strict';
    
    console.log('🚀 Force refresh script loading...');
    
    // Clear any existing table functions immediately
    if (window.renderPatientsTable) {
        delete window.renderPatientsTable;
        console.log('Cleared existing renderPatientsTable');
    }
    if (window.renderProvidersTable) {
        delete window.renderProvidersTable;
        console.log('Cleared existing renderProvidersTable');
    }
    
    // Define new table rendering functions directly here
    window.renderPatientsTable = function() {
        console.log('🔄 FORCE REFRESH - Rendering patients table...');
        
        const patients = JSON.parse(localStorage.getItem('patients') || '[]');
        const tableBody = document.getElementById('patientsTableBody');
        
        if (!tableBody) {
            console.warn('❌ Patients table body not found');
            return;
        }
        
        console.log('📊 Patient data:', patients);
        
        if (patients.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted py-4">
                        <i class="fas fa-users fa-2x mb-3 d-block"></i>
                        No patients found. Click "Import CSV" to get started.
                    </td>
                </tr>
            `;
            return;
        }
        
        // Show first patient structure for debugging
        console.log('First patient fields:', Object.keys(patients[0]));
        console.log('First patient data:', patients[0]);
        
        tableBody.innerHTML = patients.map(patient => {
            // Extract fields with extensive fallbacks
            const name = patient.name || 
                        `${patient.firstName || patient['First Name'] || ''} ${patient.lastName || patient['Last Name'] || ''}`.trim() ||
                        patient['Patient Name'] || 'Unknown';
            
            const email = patient.email || patient['Email Address'] || patient.emailAddress || 'No email';
            
            const dob = patient.dob || patient['Date of Birth'] || patient.birthdate || 
                       patient['Patient DOB'] || patient.dateOfBirth || 'N/A';
            
            const phone = patient.phone || patient['Phone Number'] || patient.mobile || 
                         patient['Mobile Phone'] || patient.contactNumber || 'N/A';
            
            const visits = patient.visits || patient['Number of Visits'] || patient.numberOfVisits || '0';
            
            console.log(`Patient: ${name}, DOB: ${dob}, Phone: ${phone}`);
            
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
                            <button class="btn btn-outline-primary" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-outline-success" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-outline-danger" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        console.log(`✅ FORCE REFRESH - Rendered ${patients.length} patients`);
    };
    
    window.renderProvidersTable = function() {
        console.log('🔄 FORCE REFRESH - Rendering providers table...');
        
        const providers = JSON.parse(localStorage.getItem('providers') || '[]');
        const tableBody = document.getElementById('providersTableBody');
        
        if (!tableBody) {
            console.warn('❌ Providers table body not found');
            return;
        }
        
        console.log('📊 Provider data:', providers);
        
        if (providers.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted py-4">
                        <i class="fas fa-user-md fa-2x mb-3 d-block"></i>
                        No providers found. Click "Import Provider Data" to get started.
                    </td>
                </tr>
            `;
            return;
        }
        
        // Show first provider structure for debugging
        console.log('First provider fields:', Object.keys(providers[0]));
        console.log('First provider data:', providers[0]);
        
        tableBody.innerHTML = providers.map(provider => {
            const name = provider.name || 
                        `${provider.firstName || provider['First Name'] || ''} ${provider.lastName || provider['Last Name'] || ''}`.trim() ||
                        provider['Provider Name'] || 'Unknown';
            
            const phone = provider.phone || provider['Mobile Phone'] || provider.mobile || 
                         provider['Phone Number'] || provider.contactNumber || 'Not provided';
            
            const email = provider.email || provider['Email Address'] || provider.emailAddress || 'N/A';
            
            const rate = provider.rate || provider['Hourly Rate'] || provider.hourlyRate || '';
            const rateDisplay = rate ? `$${rate}` : 'N/A';
            
            const position = (provider.position || provider.specialty || provider.Position || 
                            provider.Specialty || 'N/A').toUpperCase();
            
            console.log(`Provider: ${name}, Phone: ${phone}, Position: ${position}`);
            
            return `
                <tr>
                    <td>
                        <strong>${name}</strong>
                        ${provider.license || provider['PT License #'] ? 
                            `<br><small class="text-muted">License: ${provider.license || provider['PT License #']}</small>` : ''}
                    </td>
                    <td>${phone}</td>
                    <td>${email}</td>
                    <td>${rateDisplay}</td>
                    <td>
                        <span class="badge bg-primary">
                            ${position}
                        </span>
                    </td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-outline-success" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-outline-danger" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        console.log(`✅ FORCE REFRESH - Rendered ${providers.length} providers`);
    };
    
    // Auto-refresh tables immediately
    setTimeout(() => {
        console.log('🔄 Auto-refreshing both tables...');
        window.renderPatientsTable();
        window.renderProvidersTable();
    }, 100);
    
    console.log('✅ Force refresh script loaded and functions defined');
})();
