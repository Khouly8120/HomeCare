// Enhanced Data Import & Patient-Provider Matching System
// Handles CSV import, automatic matching, and email notifications

// Global variables for import data
let importData = JSON.parse(localStorage.getItem('importData')) || {
    importHistory: [],
    matchingRules: [],
    notificationTemplates: [],
    settings: {}
};

// Normalize a header string for robust matching
function normalizeHeaderKey(h) {
    return (h || '')
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\uFEFF/g, '') // strip BOM if present
        .replace(/\([^)]*\)/g, '') // remove parentheses content
        .replace(/[^a-z0-9]+/g, ' ') // non-alnum -> space
        .replace(/\s+/g, ' ') // collapse spaces
        .trim();
}

// Patient data field mapping with common aliases
const patientFieldMapping = {
    // names
    'first name': 'firstName',
    'firstname': 'firstName',
    'last name': 'lastName',
    'lastname': 'lastName',
    'name': 'name', // full name in a single column

    // contact
    'mobile': 'mobile',
    'mobile phone': 'mobile',
    'phone': 'mobile',
    'phone number': 'mobile',
    'contact number': 'mobile',
    'email': 'email',
    'email address': 'email',

    // address
    'primary address': 'address',
    'address': 'address',
    'primary address city': 'city',
    'city': 'city',
    'primary address postalcode': 'zipCode',
    'zip': 'zipCode',
    'zipcode': 'zipCode',
    'postal code': 'zipCode',

    // insurance/status/clinic
    'insurance 1': 'primaryInsurance',
    'primary insurance': 'primaryInsurance',
    'insurance': 'primaryInsurance',
    'insurance 2': 'secondaryInsurance',
    'status': 'status',
    'clinic name': 'clinic',

    // misc
    'patient feedback': 'feedback',
    'notes': 'notes',
    'next appt': 'nextAppointment',
    'pt': 'assignedPT'
};

// Provider data field mapping with common aliases (map Position -> specialty)
const providerFieldMapping = {
    // identifiers
    'provider id': 'providerId',
    'id': 'providerId',

    // names
    'first name': 'firstName',
    'firstname': 'firstName',
    'last name': 'lastName',
    'lastname': 'lastName',
    'name': 'name',

    // contact
    'email': 'email',
    'email address': 'email',
    'mobile': 'mobile',
    'mobile phone': 'mobile',
    'phone': 'mobile',
    'phone number': 'mobile',

    // license
    'pt license #': 'license',
    'license #': 'license',
    'license number': 'license',
    'state of licensure': 'licenseState',

    // address & emergency
    'address': 'address',
    'emergency contact name': 'emergencyContactName',
    'emergency contact phone': 'emergencyContactPhone',

    // location/service
    'borough': 'borough',
    'borough select all available': 'borough',
    'service area zip codes comma separated': 'serviceZipCodes',
    'service area zip codes': 'serviceZipCodes',
    'service zip codes': 'serviceZipCodes',
    'zip codes': 'serviceZipCodes',

    // specialty/position
    'position': 'specialty',
    'title': 'specialty',
    'role': 'specialty',
    'specialty': 'specialty',

    // rate/payment
    'rate': 'rate',
    'hourly rate': 'rate',
    'rate $': 'rate',
    'pay rate': 'rate',
    'payment type': 'paymentType',

    // availability/status
    'general availability': 'generalAvailability',
    'availability days': 'availabilityDays',
    'availability timings from': 'availabilityFrom',
    'availability timings till': 'availabilityTill',
    'start date': 'startDate',
    'status': 'status'
    ,
    // notes
    'notes': 'notes',
    'notes 2': 'notes2'
};

// === Key + Merge Helpers ===
function normalizeStr(v) {
    return (v || '').toString().trim().toLowerCase();
}

function getPatientKey(p) {
    // Prefer mobile if available; fallback to email; finally name-only
    const fn = normalizeStr(p.firstName);
    const ln = normalizeStr(p.lastName);
    const m = normalizeStr(p.mobile || p.contactNumber);
    const e = normalizeStr(p.email || p.emailAddress);
    if (fn && ln && m) return `n:${fn}|${ln}|m:${m}`;
    if (fn && ln && e) return `n:${fn}|${ln}|e:${e}`;
    return `n:${fn}|${ln}`;
}

function getProviderKey(p) {
    // Prefer explicit providerId; else name+email/phone
    const id = normalizeStr(p.providerId || p.id);
    if (id) return `id:${id}`;
    const fn = normalizeStr(p.firstName);
    const ln = normalizeStr(p.lastName);
    const e = normalizeStr(p.email);
    const m = normalizeStr(p.mobile || p.phone || p.contactNumber);
    if (fn && ln && e) return `n:${fn}|${ln}|e:${e}`;
    if (fn && ln && m) return `n:${fn}|${ln}|m:${m}`;
    return `n:${fn}|${ln}`;
}

function mergeRecords(existing, incoming) {
    // Non-empty values in incoming overwrite empty/missing in existing
    const result = { ...existing };
    Object.keys(incoming).forEach(k => {
        const newVal = incoming[k];
        const oldVal = existing[k];
        const isEmpty = (v) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '') || (Array.isArray(v) && v.length === 0);
        if (isEmpty(oldVal) && !isEmpty(newVal)) {
            result[k] = newVal;
        }
    });
    return result;
}

// Helper: split a CSV line respecting quotes
function splitCSVLine(line, delimiter) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            // Toggle quotes or handle escaped quotes
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++; // skip escaped quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (ch === delimiter && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += ch;
        }
    }
    result.push(current.trim());
    return result.map(v => v.replace(/^"|"$/g, ''));
}

// Initialize Enhanced Import System
function initializeEnhancedImport() {
    console.log('Initializing Enhanced Data Import System');
    loadImportData();
    initializeImportSettings();
    setupImportInterface();
    
    // Ensure file handlers are set up immediately
    setupFileHandlers();
    console.log('Enhanced Data Import System initialized');
}

// Load import data from localStorage
function loadImportData() {
    importData = JSON.parse(localStorage.getItem('importData')) || {
        importHistory: [],
        matchingRules: [],
        notificationTemplates: [],
        settings: {}
    };
}

// Save import data to localStorage
function saveImportData() {
    localStorage.setItem('importData', JSON.stringify(importData));
}

// Initialize import settings
function initializeImportSettings() {
    if (!importData.settings.autoMatching) {
        importData.settings = {
            autoMatching: true,
            autoNotification: true,
            matchingThreshold: 0.7,
            notificationDelay: 5,
            duplicateHandling: 'merge'
        };
        saveImportData();
    }
}

// Setup import interface
function setupImportInterface() {
    addImportButtons();
    setupFileHandlers();
}

// Add import buttons to dashboard
function addImportButtons() {
    // Disabled: do not inject dashboard import buttons (keeps UI clean)
    // If previously injected, remove them.
    const existing = document.getElementById('import-buttons');
    if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
        console.log('Removed previously injected dashboard import buttons');
    }
    return; // no-op
}

// Setup file handlers
function setupFileHandlers() {
    console.log('Setting up file handlers...');
    
    // Get existing file input elements (from HTML)
    const patientInput = document.getElementById('patient-file-input');
    const providerInput = document.getElementById('provider-file-input');
    
    if (patientInput) {
        console.log('Found patient file input, adding event listener');
        // Clear any inline onchange to avoid double-calls
        try { patientInput.onchange = null; } catch (_) {}
        patientInput.addEventListener('change', handlePatientFileUpload);
    } else {
        console.log('Patient file input not found, creating one');
        const newPatientInput = document.createElement('input');
        newPatientInput.type = 'file';
        newPatientInput.id = 'patient-file-input';
        newPatientInput.accept = '.csv,.xlsx,.xls';
        newPatientInput.style.display = 'none';
        newPatientInput.addEventListener('change', handlePatientFileUpload);
        document.body.appendChild(newPatientInput);
    }

    if (providerInput) {
        console.log('Found provider file input, adding event listener');
        // Clear any inline onchange to avoid double-calls
        try { providerInput.onchange = null; } catch (_) {}
        providerInput.addEventListener('change', handleProviderFileUpload);
    } else {
        console.log('Provider file input not found, creating one');
        const newProviderInput = document.createElement('input');
        newProviderInput.type = 'file';
        newProviderInput.id = 'provider-file-input';
        newProviderInput.accept = '.csv,.xlsx,.xls';
        newProviderInput.style.display = 'none';
        newProviderInput.addEventListener('change', handleProviderFileUpload);
        document.body.appendChild(newProviderInput);
    }
}

// Generic import modal router function (called by HTML buttons)
function showImportModal(type) {
    console.log('showImportModal called with type:', type);
    
    if (type === 'patients') {
        showPatientImportModal();
    } else if (type === 'providers') {
        showProviderImportModal();
    } else if (type === 'referrals') {
        // Handle referrals import if needed
        console.log('Referrals import not yet implemented');
    } else {
        console.error('Unknown import type:', type);
    }
}

// Show patient import modal
function showPatientImportModal() {
    console.log('Opening patient import file dialog...');
    
    // Create file input if it doesn't exist
    let fileInput = document.getElementById('patient-file-input');
    if (!fileInput) {
        console.log('Creating patient file input...');
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'patient-file-input';
        fileInput.accept = '.csv,.xlsx,.xls';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
    }
    
    // Ensure event listener is attached
    fileInput.removeEventListener('change', handlePatientFileUpload);
    fileInput.addEventListener('change', handlePatientFileUpload);
    console.log('Patient file input event listener attached');
    
    // Trigger file dialog
    fileInput.click();
}

// Show provider import modal
function showProviderImportModal() {
    console.log('Opening provider import file dialog...');
    
    // Create file input if it doesn't exist
    let fileInput = document.getElementById('provider-file-input');
    if (!fileInput) {
        console.log('Creating provider file input...');
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'provider-file-input';
        fileInput.accept = '.csv,.xlsx,.xls';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
    }
    
    // Ensure event listener is attached
    fileInput.removeEventListener('change', handleProviderFileUpload);
    fileInput.addEventListener('change', handleProviderFileUpload);
    console.log('Provider file input event listener attached');
    
    // Trigger file dialog
    fileInput.click();
}

// Handle patient file upload
function handlePatientFileUpload(event) {
    console.log('handlePatientFileUpload called');
    const file = event.target.files[0];
    if (file) {
        console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                console.log('File read successfully, parsing CSV...');
                const csvData = e.target.result;
                const patients = parsePatientCSV(csvData);
                console.log('Parsed patients:', patients.length);
                importPatients(patients);
                // Allow re-selecting the same file
                try { event.target.value = ''; } catch (_) {}
            } catch (error) {
                console.error('Error processing patient file:', error);
                alert('Error processing patient file: ' + error.message);
            }
        };
        reader.onerror = function(error) {
            console.error('Error reading file:', error);
            alert('Error reading file: ' + error.message);
            try { event.target.value = ''; } catch (_) {}
        };
        reader.readAsText(file);
    } else {
        console.log('No file selected');
    }
}

// Handle provider file upload
function handleProviderFileUpload(event) {
    console.log('handleProviderFileUpload called');
    const file = event.target.files[0];
    if (file) {
        console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                console.log('File read successfully, parsing CSV...');
                const csvData = e.target.result;
                const providers = parseProviderCSV(csvData);
                console.log('Parsed providers:', providers.length);
                importProviders(providers);
                // Allow re-selecting the same file
                try { event.target.value = ''; } catch (_) {}
            } catch (error) {
                console.error('Error processing provider file:', error);
                alert('Error processing provider file: ' + error.message);
            }
        };
        reader.onerror = function(error) {
            console.error('Error reading file:', error);
            alert('Error reading file: ' + error.message);
            try { event.target.value = ''; } catch (_) {}
        };
        reader.readAsText(file);
    } else {
        console.log('No file selected');
    }
}

// Parse patient CSV
function parsePatientCSV(csvData) {
    console.log('Parsing patient CSV data...');
    const lines = csvData.split(/\r?\n/);
    
    // Detect delimiter (comma or tab)
    const delimiter = lines[0].includes(',') ? ',' : '\t';
    console.log('Detected delimiter:', delimiter === ',' ? 'comma' : 'tab');
    
    const headerLine = lines[0].replace(/^\uFEFF/, ''); // strip BOM
    const headers = splitCSVLine(headerLine, delimiter);
    const patients = [];
    console.log('Headers found:', headers);

    // Build normalized header -> index and detect critical fields
    const headerMap = new Map();
    headers.forEach((h, idx) => headerMap.set(normalizeHeaderKey(h), idx));
    const hasFirst = headerMap.has(normalizeHeaderKey('First Name')) || headerMap.has('first name');
    const hasLast = headerMap.has(normalizeHeaderKey('Last Name')) || headerMap.has('last name');
    const hasFullName = headerMap.has('name');

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i] || !lines[i].trim()) continue; // Skip empty lines
        const values = splitCSVLine(lines[i], delimiter);

        // Header-based mapping path (prefer whenever we can identify name fields)
        if (hasFullName || (hasFirst && hasLast)) {
            const patient = {};
            headers.forEach((header, index) => {
                const norm = normalizeHeaderKey(header);
                const mappedField = patientFieldMapping[norm];
                if (mappedField) {
                    patient[mappedField] = values[index] ? values[index].trim() : '';
                }
            });

            // If a single Name column exists, split into first/last
            if ((!patient.firstName || !patient.lastName) && patient.name) {
                const parts = patient.name.split(/\s+/);
                patient.firstName = patient.firstName || parts[0] || '';
                patient.lastName = patient.lastName || parts.slice(1).join(' ') || '';
            }

            if (patient.firstName && patient.lastName) {
                patient.id = `patient_${Date.now()}_${i}`;
                patient.name = `${patient.firstName} ${patient.lastName}`;
                patient.isInterested = isPatientInterested(patient);
                if (!patient.contactNumber && patient.mobile) patient.contactNumber = patient.mobile;
                patients.push(patient);
            }
        } else {
            // Fallback: index-based mapping similar to legacy importer
            const patient = {
                id: `patient_${Date.now()}_${i}`,
                firstName: values[0] || '',
                lastName: values[1] || '',
                mobile: values[2] || values[3] || '',
                contactNumber: values[2] || '',
                email: values[3] || '',
                address: values[4] || '',
                city: values[5] || '',
                zipCode: values[6] || '',
                primaryInsurance: values[7] || '',
                status: (values[8] || 'interested').toLowerCase()
            };
            if (patient.firstName && patient.lastName) {
                patient.name = `${patient.firstName} ${patient.lastName}`;
                patient.isInterested = isPatientInterested(patient);
                if (!patient.contactNumber && patient.mobile) patient.contactNumber = patient.mobile;
                patients.push(patient);
            }
        }
    }

    return patients;
}

// Parse provider CSV
function parseProviderCSV(csvData) {
    console.log('Parsing provider CSV data...');
    const lines = csvData.split(/\r?\n/);
    
    // Detect delimiter (comma or tab)
    const delimiter = lines[0].includes(',') ? ',' : '\t';
    console.log('Detected delimiter:', delimiter === ',' ? 'comma' : 'tab');
    
    const headerLine = lines[0].replace(/^\uFEFF/, '');
    const headers = splitCSVLine(headerLine, delimiter);
    const providers = [];
    console.log('Headers found:', headers);
    // Build normalized header -> index and detect critical fields
    const headerMap = new Map();
    headers.forEach((h, idx) => headerMap.set(normalizeHeaderKey(h), idx));
    const hasFirst = headerMap.has('first name');
    const hasLast = headerMap.has('last name');
    const hasFullName = headerMap.has('name');

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i] || !lines[i].trim()) continue; // Skip empty lines
        const values = splitCSVLine(lines[i], delimiter);

        if (hasFullName || (hasFirst && hasLast)) {
            const provider = {};
            headers.forEach((header, index) => {
                const norm = normalizeHeaderKey(header);
                const mappedField = providerFieldMapping[norm];
                if (mappedField) {
                    provider[mappedField] = values[index] ? values[index].trim() : '';
                }
            });

            // If a single Name column exists, split into first/last
            if ((!provider.firstName || !provider.lastName) && provider.name) {
                const parts = provider.name.split(/\s+/);
                provider.firstName = provider.firstName || parts[0] || '';
                provider.lastName = provider.lastName || parts.slice(1).join(' ') || '';
            }

            // Heuristic: fix swapped email/mobile if needed
            if (provider.email && !provider.email.includes('@') && provider.mobile && provider.mobile.includes('@')) {
                const tmp = provider.email; provider.email = provider.mobile; provider.mobile = tmp;
            }

            if (provider.firstName && provider.lastName) {
                provider.id = `provider_${Date.now()}_${i}`;
                provider.name = `${provider.firstName} ${provider.lastName}`;
                provider.serviceZipCodes = provider.serviceZipCodes ? 
                    provider.serviceZipCodes.split(',').map(zip => zip.trim()) : [];
                provider.availabilityDays = provider.availabilityDays ? 
                    provider.availabilityDays.split(',').map(day => day.trim()) : [];
                providers.push(provider);
            }
        } else {
            // Fallback: index-based mapping compatible with legacy 23-column CSV
            const provider = {
                id: (values[0] && values[0].trim()) ? values[0].trim() : `provider_${Date.now()}_${i}`,
                firstName: values[1] || '',
                lastName: values[2] || '',
                license: values[3] || '',
                licenseState: values[4] || '',
                // Try to infer email/mobile correctness
                email: values[5] || values[6] || '',
                mobile: values[6] || values[5] || '',
                emergencyContactName: values[7] || '',
                emergencyContactPhone: values[8] || '',
                address: values[9] || '',
                borough: values[10] || '',
                serviceZipCodes: values[11] || '',
                specialty: values[12] || '',
                rate: parseFloat(values[13]) || 0,
                paymentType: values[14] || '',
                generalAvailability: values[15] || '',
                availabilityDays: values[16] || '',
                availabilityFrom: values[17] || '',
                availabilityTill: values[18] || '',
                startDate: values[19] || '',
                status: (values[20] || 'active').toLowerCase(),
                notes: values[21] || '',
                notes2: values[22] || ''
            };
            // Final heuristic swap if needed
            if (provider.email && !provider.email.includes('@') && provider.mobile && provider.mobile.includes('@')) {
                const tmp = provider.email; provider.email = provider.mobile; provider.mobile = tmp;
            }
            if (provider.firstName && provider.lastName) {
                provider.name = `${provider.firstName} ${provider.lastName}`;
                if (typeof provider.serviceZipCodes === 'string') {
                    provider.serviceZipCodes = provider.serviceZipCodes.split(',').map(z => z.trim()).filter(Boolean);
                }
                if (typeof provider.availabilityDays === 'string') {
                    provider.availabilityDays = provider.availabilityDays.split(',').map(d => d.trim()).filter(Boolean);
                }
                providers.push(provider);
            }
        }
    }

    return providers;
}

// Import patients
function importPatients(patients) {
    if (!Array.isArray(window.patients)) {
        try {
            window.patients = JSON.parse(localStorage.getItem('patients') || '[]');
        } catch (_) {
            window.patients = [];
        }
    }

    // Build index for fast duplicate detection
    const index = new Map();
    window.patients.forEach(p => index.set(getPatientKey(p), p));

    const mode = (importData && importData.settings && importData.settings.duplicateHandling) || 'merge';
    let imported = 0, updated = 0, skipped = 0;

    patients.forEach(patient => {
        // ensure id
        if (!patient.id && patient.patientId) patient.id = patient.patientId;
        if (!patient.id) patient.id = `patient_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;

        const key = getPatientKey(patient);
        const existing = index.get(key);

        if (!existing) {
            window.patients.push(patient);
            index.set(key, patient);
            imported++;
        } else {
            if (mode === 'overwrite') {
                // preserve ID
                patient.id = existing.id || patient.id;
                Object.assign(existing, patient);
                updated++;
            } else if (mode === 'merge') {
                const merged = mergeRecords(existing, patient);
                Object.assign(existing, merged);
                updated++;
            } else {
                // skip
                skipped++;
            }
        }
    });

    // Normalize all patient records to avoid UI errors
    window.patients = (window.patients || []).map((p, idx) => {
        const out = { ...p };
        // Ensure names
        if (!out.firstName && out.name) {
            const parts = String(out.name).split(/\s+/);
            out.firstName = parts[0] || '';
            out.lastName = out.lastName || parts.slice(1).join(' ');
        }
        if (!out.name || typeof out.name !== 'string' || out.name.trim() === '') {
            out.name = `${out.firstName || ''} ${out.lastName || ''}`.trim();
        }
        if (typeof out.name !== 'string') out.name = String(out.name || '');

        // Ensure IDs
        if (!out.patientId) out.patientId = out.id || `patient_${Date.now()}_${idx}`;
        if (typeof out.patientId !== 'string') out.patientId = String(out.patientId || '');

        // Ensure status string
        if (!out.status) out.status = 'active';
        if (typeof out.status !== 'string') out.status = String(out.status || 'active');

        // Ensure contactNumber for display
        if (!out.contactNumber && out.mobile) out.contactNumber = out.mobile;
        if (out.contactNumber && typeof out.contactNumber !== 'string') out.contactNumber = String(out.contactNumber);

        return out;
    });

    localStorage.setItem('patients', JSON.stringify(window.patients));
    
    alert(`Successfully processed patients. Imported: ${imported}, Updated: ${updated}, Skipped: ${skipped}`);
    
    // Force comprehensive UI refresh
    console.log('Refreshing UI after patient import...');
    
    // Method 1: Try renderPatientsTable from patient-management.js
    if (typeof renderPatientsTable === 'function') {
        console.log('Calling renderPatientsTable...');
        renderPatientsTable();
    }
    
    // Method 2: Direct DOM manipulation as fallback
    setTimeout(() => {
        const tableBody = document.getElementById('patientsTableBody');
        if (tableBody) {
            const patients = JSON.parse(localStorage.getItem('patients') || '[]');
            console.log(`Direct rendering ${patients.length} patients to table...`);
            
            if (patients.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center text-muted py-4">
                            <i class="fas fa-users fa-2x mb-2"></i><br>
                            No patients found.
                        </td>
                    </tr>
                `;
            } else {
                tableBody.innerHTML = patients.map(patient => `
                    <tr>
                        <td>
                            <strong>${patient.firstName || ''} ${patient.lastName || ''}</strong><br>
                            <small class="text-muted">${patient.email || ''}</small>
                        </td>
                        <td>${patient.contactNumber || patient.mobile || 'N/A'}</td>
                        <td>${patient.primaryInsurance || 'N/A'}</td>
                        <td><span class="badge bg-${patient.status === 'active' ? 'success' : 'secondary'}">${patient.status || 'Unknown'}</span></td>
                        <td>${patient.assignedPT || 'Not Assigned'}</td>
                        <td>${patient.lastContact ? new Date(patient.lastContact).toLocaleDateString() : 'Never'}</td>
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
                `).join('');
            }
            console.log('Direct table rendering complete');
        }
    }, 100)
    
    // Auto-match interested patients
    if (typeof autoMatchPatients === 'function') autoMatchPatients();
    
    // Refresh dashboard/KPIs
    if (typeof updateDashboard === 'function') updateDashboard();
    if (typeof updateKPIs === 'function') updateKPIs();
}

// Import providers
function importProviders(providers) {
    if (!Array.isArray(window.providers)) {
        try {
            window.providers = JSON.parse(localStorage.getItem('providers') || '[]');
        } catch (_) {
            window.providers = [];
        }
    }

    // Normalize and index
    const index = new Map();
    window.providers.forEach(p => {
        // normalize status early
        if (p.status) p.status = ('' + p.status).toLowerCase();
        index.set(getProviderKey(p), p);
    });

    const mode = (importData && importData.settings && importData.settings.duplicateHandling) || 'merge';
    let imported = 0, updated = 0, skipped = 0;

    providers.forEach(provider => {
        // normalize collections
        if (typeof provider.serviceZipCodes === 'string') {
            provider.serviceZipCodes = provider.serviceZipCodes.split(',').map(z => z.trim()).filter(Boolean);
        }
        if (typeof provider.availabilityDays === 'string') {
            provider.availabilityDays = provider.availabilityDays.split(',').map(d => d.trim()).filter(Boolean);
        }
        if (provider.status) provider.status = ('' + provider.status).toLowerCase();

        // ensure id
        if (!provider.id && provider.providerId) provider.id = provider.providerId;
        if (!provider.id) provider.id = `provider_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;

        const key = getProviderKey(provider);
        const existing = index.get(key);

        // Normalize fields expected by current UI renderers
        if (provider.specialty && !provider.position) provider.position = provider.specialty;
        if (provider.position && !provider.specialty) provider.specialty = provider.position;
        // Normalize service zip codes across both naming styles
        if (Array.isArray(provider.serviceZipCodes)) {
            provider.serviceAreaZipCodes = provider.serviceAreaZipCodes || provider.serviceZipCodes.join(', ');
        } else if (typeof provider.serviceZipCodes === 'string') {
            provider.serviceAreaZipCodes = provider.serviceAreaZipCodes || provider.serviceZipCodes;
            provider.serviceZipCodes = provider.serviceZipCodes.split(',').map(z => z.trim()).filter(Boolean);
        }

        if (!existing) {
            window.providers.push(provider);
            index.set(key, provider);
            imported++;
        } else {
            if (mode === 'overwrite') {
                provider.id = existing.id || provider.id;
                Object.assign(existing, provider);
                // keep compatibility fields in existing as well
                if (existing.specialty && !existing.position) existing.position = existing.specialty;
                if (existing.position && !existing.specialty) existing.specialty = existing.position;
                if (Array.isArray(existing.serviceZipCodes)) {
                    existing.serviceAreaZipCodes = existing.serviceAreaZipCodes || existing.serviceZipCodes.join(', ');
                } else if (typeof existing.serviceZipCodes === 'string') {
                    existing.serviceAreaZipCodes = existing.serviceAreaZipCodes || existing.serviceZipCodes;
                    existing.serviceZipCodes = existing.serviceZipCodes.split(',').map(z => z.trim()).filter(Boolean);
                }
                updated++;
            } else if (mode === 'merge') {
                const merged = mergeRecords(existing, provider);
                Object.assign(existing, merged);
                if (existing.specialty && !existing.position) existing.position = existing.specialty;
                if (existing.position && !existing.specialty) existing.specialty = existing.position;
                if (Array.isArray(existing.serviceZipCodes)) {
                    existing.serviceAreaZipCodes = existing.serviceAreaZipCodes || existing.serviceZipCodes.join(', ');
                } else if (typeof existing.serviceZipCodes === 'string') {
                    existing.serviceAreaZipCodes = existing.serviceAreaZipCodes || existing.serviceZipCodes;
                    existing.serviceZipCodes = existing.serviceZipCodes.split(',').map(z => z.trim()).filter(Boolean);
                }
                updated++;
            } else {
                skipped++;
            }
        }
    });

    localStorage.setItem('providers', JSON.stringify(window.providers));
    
    alert(`Successfully processed providers. Imported: ${imported}, Updated: ${updated}, Skipped: ${skipped}`);
    
    // Force comprehensive UI refresh
    console.log('Refreshing UI after provider import...');
    
    // Method 1: Try renderProvidersTable from script.js
    if (typeof renderProvidersTable === 'function') {
        console.log('Calling renderProvidersTable...');
        renderProvidersTable();
    }
    
    // Method 2: Direct DOM manipulation as fallback
    setTimeout(() => {
        const tableBody = document.getElementById('providersTableBody');
        if (tableBody) {
            const providers = JSON.parse(localStorage.getItem('providers') || '[]');
            console.log(`Direct rendering ${providers.length} providers to table...`);
            
            if (providers.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center text-muted py-4">
                            <i class="fas fa-user-md fa-2x mb-2"></i><br>
                            No providers found.
                        </td>
                    </tr>
                `;
            } else {
                tableBody.innerHTML = providers.map(provider => `
                    <tr>
                        <td>${provider.firstName || ''} ${provider.lastName || ''}</td>
                        <td>${provider.email || 'N/A'}</td>
                        <td>${provider.mobile || provider.contactNumber || 'N/A'}</td>
                        <td>${provider.specialty || 'Physical Therapist'}</td>
                        <td><span class="badge bg-${provider.status === 'active' ? 'success' : 'secondary'}">${provider.status || 'Unknown'}</span></td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary" onclick="viewProvider('${provider.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-success" onclick="editProvider('${provider.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
            }
            console.log('Direct table rendering complete');
        }
    }, 100)
    
    // Refresh dashboard
    if (typeof updateDashboard === 'function') {
        updateDashboard();
    }
    if (typeof updateKPIs === 'function') {
        updateKPIs();
    }
}

// Check if patient is interested
function isPatientInterested(patient) {
    const feedback = (patient.feedback || '').toLowerCase();
    const notes = (patient.notes || '').toLowerCase();
    
    return feedback.includes('interested') || 
           notes.includes('interested') ||
           feedback.includes('text sent') ||
           notes.includes('text sent');
}

// Auto-match patients with providers
function autoMatchPatients() {
    if (typeof window.patients === 'undefined' || typeof window.providers === 'undefined') {
        alert('Please import both patients and providers first.');
        return;
    }

    const interestedPatients = window.patients.filter(p => p.isInterested);
    const activeProviders = window.providers.filter(p => (p.status || '').toLowerCase() === 'active');

    let matches = 0;
    let notifications = 0;

    interestedPatients.forEach(patient => {
        const matchedProviders = findMatchingProviders(patient, activeProviders);
        
        if (matchedProviders.length > 0) {
            matches++;
            
            // Send notifications to matched providers
            matchedProviders.forEach(provider => {
                sendProviderNotification(provider, patient);
                notifications++;
            });
        }
    });

    alert(`Auto-matching complete!\n${matches} patients matched with providers.\n${notifications} email notifications sent.`);
}

// Find matching providers for a patient
function findMatchingProviders(patient, providers) {
    const matches = [];

    providers.forEach(provider => {
        const score = calculateMatchScore(patient, provider);
        
        if (score >= importData.settings.matchingThreshold) {
            matches.push({
                provider: provider,
                score: score
            });
        }
    });

    // Sort by score and return top 2 matches
    matches.sort((a, b) => b.score - a.score);
    return matches.slice(0, 2).map(m => m.provider);
}

// Calculate match score between patient and provider
function calculateMatchScore(patient, provider) {
    let score = 0;

    // Geographic matching
    if (patient.zipCode && provider.serviceZipCodes.includes(patient.zipCode)) {
        score += 0.4;
    }

    // Borough matching
    if (patient.city && provider.borough && 
        patient.city.toLowerCase().includes(provider.borough.toLowerCase())) {
        score += 0.3;
    }

    // Provider availability
    if (provider.availabilityDays && provider.availabilityDays.length > 0) {
        score += 0.2;
    }

    // Active status
    if (provider.status === 'Active') {
        score += 0.1;
    }

    return score;
}

// Send provider notification
function sendProviderNotification(provider, patient) {
    const notification = {
        id: `notification_${Date.now()}_${Math.random()}`,
        providerId: provider.id,
        providerEmail: provider.email,
        providerName: provider.name,
        patientName: patient.name,
        patientPhone: patient.mobile,
        patientAddress: `${patient.address}, ${patient.city} ${patient.zipCode}`,
        patientInsurance: patient.primaryInsurance,
        timestamp: new Date().toISOString(),
        status: 'sent'
    };

    // In a real system, this would send an actual email
    console.log(`Email notification sent to ${provider.name} (${provider.email})`);
    console.log(`Subject: New Interested Patient - ${patient.name}`);
    console.log(`Patient Details:
        Name: ${patient.name}
        Phone: ${patient.mobile}
        Address: ${notification.patientAddress}
        Insurance: ${patient.primaryInsurance}
        Status: Interested in PT services
        
        Please contact the patient to schedule an evaluation.`);

    // Store notification for tracking
    if (!importData.notifications) {
        importData.notifications = [];
    }
    importData.notifications.push(notification);
    saveImportData();

    return notification;
}

// Show import results
function showImportResults(results) {
    alert(`Import Results:
        Total Records: ${results.total}
        Successfully Imported: ${results.imported}
        Updated: ${results.updated}
        Skipped: ${results.skipped}
        Matches Found: ${results.matches.length}
        Notifications Sent: ${results.notifications.length}`);
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up import system...');
    
    // Initialize import system immediately
    setTimeout(() => {
        initializeEnhancedImport();
        
        // Force setup file handlers with debugging
        console.log('=== DEBUGGING IMPORT SETUP ===');
        const patientInput = document.getElementById('patient-file-input');
        const providerInput = document.getElementById('provider-file-input');
        
        console.log('Patient input found:', !!patientInput);
        console.log('Provider input found:', !!providerInput);
        
        if (patientInput) {
            // Clear inline handler to prevent duplicate triggers
            try { patientInput.onchange = null; } catch (_) {}
            // Remove any existing listeners and add fresh ones
            patientInput.removeEventListener('change', handlePatientFileUpload);
            patientInput.addEventListener('change', handlePatientFileUpload);
            console.log('✅ Patient file input listener attached');
        } else {
            console.error('❌ Patient file input not found');
        }
        
        if (providerInput) {
            // Clear inline handler to prevent duplicate triggers
            try { providerInput.onchange = null; } catch (_) {}
            // Remove any existing listeners and add fresh ones
            providerInput.removeEventListener('change', handleProviderFileUpload);
            providerInput.addEventListener('change', handleProviderFileUpload);
            console.log('✅ Provider file input listener attached');
        } else {
            console.error('❌ Provider file input not found');
        }
        
        // Make functions globally available
        window.showImportModal = showImportModal;
        window.showPatientImportModal = showPatientImportModal;
        window.showProviderImportModal = showProviderImportModal;
        window.handlePatientFileUpload = handlePatientFileUpload;
        window.handleProviderFileUpload = handleProviderFileUpload;
        
        console.log('=== IMPORT SETUP COMPLETE ===');
    }, 1000);
});

// Export functions for global access
window.enhancedImport = {
    initializeEnhancedImport,
    showPatientImportModal,
    showProviderImportModal,
    autoMatchPatients,
    loadImportData,
    saveImportData
};

// Also expose critical handlers directly for immediate availability
window.showImportModal = showImportModal;
window.showPatientImportModal = showPatientImportModal;
window.showProviderImportModal = showProviderImportModal;
window.handlePatientFileUpload = handlePatientFileUpload;
window.handleProviderFileUpload = handleProviderFileUpload;
