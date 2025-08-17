// Data Inspector - Debug tool to examine actual data structure
window.inspectStoredData = function() {
    console.log('=== DATA INSPECTION ===');
    
    // Check patients data
    const patientsRaw = localStorage.getItem('patients');
    console.log('Raw patients data:', patientsRaw);
    
    if (patientsRaw) {
        try {
            const patients = JSON.parse(patientsRaw);
            console.log('Parsed patients count:', patients.length);
            
            if (patients.length > 0) {
                console.log('First patient structure:', JSON.stringify(patients[0], null, 2));
                console.log('All patient keys:', Object.keys(patients[0]));
                
                // Show first 3 patients with their key fields
                patients.slice(0, 3).forEach((patient, index) => {
                    console.log(`Patient ${index + 1}:`, {
                        name: patient.name,
                        firstName: patient.firstName,
                        lastName: patient.lastName,
                        phone: patient.phone,
                        mobile: patient.mobile,
                        email: patient.email,
                        dob: patient.dob,
                        allKeys: Object.keys(patient)
                    });
                });
            }
        } catch (e) {
            console.error('Error parsing patients data:', e);
        }
    }
    
    // Check providers data
    const providersRaw = localStorage.getItem('providers');
    console.log('Raw providers data:', providersRaw);
    
    if (providersRaw) {
        try {
            const providers = JSON.parse(providersRaw);
            console.log('Parsed providers count:', providers.length);
            
            if (providers.length > 0) {
                console.log('First provider structure:', JSON.stringify(providers[0], null, 2));
                console.log('All provider keys:', Object.keys(providers[0]));
            }
        } catch (e) {
            console.error('Error parsing providers data:', e);
        }
    }
    
    console.log('=== END INSPECTION ===');
};

// Auto-run inspection on load and add inspection button
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        window.inspectStoredData();
        window.addInspectionButton();
    }, 1000);
});

// Add button to manually trigger inspection
window.addInspectionButton = function() {
    const button = document.createElement('button');
    button.innerHTML = '🔍 Inspect Data';
    button.className = 'btn btn-info btn-sm';
    button.style.position = 'fixed';
    button.style.top = '10px';
    button.style.right = '10px';
    button.style.zIndex = '9999';
    button.onclick = window.inspectStoredData;
    document.body.appendChild(button);
};

// Clear all data function for testing
window.clearAllData = function() {
    if (confirm('Clear ALL data for testing?')) {
        localStorage.removeItem('patients');
        localStorage.removeItem('providers');
        window.patients = [];
        window.providers = [];
        location.reload();
    }
};

console.log('✅ Data Inspector loaded');
