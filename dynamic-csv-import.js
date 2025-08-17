// Dynamic CSV Import System - Handles any CSV structure
// Replaces hardcoded import logic with flexible, dynamic parsing

class DynamicCSVImporter {
    constructor() {
        this.importHistory = [];
        this.fieldMappings = {
            patients: {
                // Common patient field variations
                'name': ['name', 'patient name', 'full name', 'patient_name'],
                'firstName': ['first name', 'firstname', 'first_name', 'fname'],
                'lastName': ['last name', 'lastname', 'last_name', 'lname'],
                'phone': ['phone', 'phone number', 'mobile', 'cell', 'contact', 'phone_number'],
                'email': ['email', 'email address', 'e-mail', 'email_address'],
                'dob': ['dob', 'date of birth', 'birthdate', 'birth_date', 'patient dob'],
                'address': ['address', 'street address', 'home address', 'patient address'],
                'city': ['city', 'patient city', 'address city'],
                'zipCode': ['zip', 'zipcode', 'zip code', 'postal code', 'zip_code'],
                'insurance': ['insurance', 'primary insurance', 'insurance company', 'insurance_company'],
                'status': ['status', 'patient status', 'current status'],
                'clinic': ['clinic', 'clinic name', 'facility', 'location']
            },
            providers: {
                // Common provider field variations
                'providerId': ['provider id', 'id', 'provider_id', 'providerid'],
                'firstName': ['first name', 'firstname', 'first_name', 'fname'],
                'lastName': ['last name', 'lastname', 'last_name', 'lname'],
                'name': ['name', 'provider name', 'full name', 'provider_name'],
                'email': ['email', 'email address', 'e-mail', 'email_address'],
                'phone': ['phone', 'mobile', 'cell', 'mobile phone', 'phone_number'],
                'license': ['license', 'license number', 'pt license', 'license_number', 'pt license #'],
                'licenseState': ['state', 'license state', 'state of licensure', 'license_state'],
                'specialty': ['specialty', 'position', 'title', 'role', 'specialization'],
                'rate': ['rate', 'hourly rate', 'pay rate', 'rate $', 'hourly_rate'],
                'status': ['status', 'provider status', 'current status'],
                'address': ['address', 'street address', 'home address'],
                'borough': ['borough', 'area', 'region'],
                'serviceZipCodes': ['service area zip codes', 'zip codes', 'service zips', 'service_zip_codes'],
                'availability': ['availability', 'general availability', 'availability_general'],
                'availabilityDays': ['availability days', 'days available', 'available_days'],
                'emergencyContactName': ['emergency contact name', 'emergency_contact_name'],
                'emergencyContactPhone': ['emergency contact phone', 'emergency_contact_phone'],
                'paymentType': ['payment type', 'payment_type'],
                'startDate': ['start date', 'start_date', 'hire date'],
                'notes': ['notes', 'comments', 'remarks']
            }
        };
    }

    // Normalize header for matching
    normalizeHeader(header) {
        return header.toLowerCase()
            .trim()
            .replace(/[^\w\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    // Find best field match for a header
    findFieldMatch(header, type) {
        const normalized = this.normalizeHeader(header);
        const mappings = this.fieldMappings[type] || {};
        
        for (const [field, variations] of Object.entries(mappings)) {
            if (variations.some(variation => 
                this.normalizeHeader(variation) === normalized ||
                normalized.includes(this.normalizeHeader(variation)) ||
                this.normalizeHeader(variation).includes(normalized)
            )) {
                return field;
            }
        }
        
        // If no match found, use sanitized header as field name
        return normalized.replace(/\s+/g, '_');
    }

    // Parse CSV with dynamic header detection
    parseCSV(csvText, type = 'auto') {
        console.log('🔄 Parsing CSV with dynamic header detection...');
        
        const lines = csvText.split(/\r?\n/).filter(line => line.trim());
        if (lines.length < 2) {
            throw new Error('CSV must have at least a header row and one data row');
        }

        // Parse header row
        const headerRow = lines[0];
        const headers = this.parseCSVLine(headerRow);
        console.log('📋 Detected headers:', headers);

        // Auto-detect type if not specified
        if (type === 'auto') {
            type = this.detectCSVType(headers);
            console.log('🔍 Auto-detected type:', type);
        }

        // Create field mapping
        const fieldMap = {};
        headers.forEach((header, index) => {
            const field = this.findFieldMatch(header, type);
            fieldMap[index] = { originalHeader: header, field: field };
        });

        console.log('🗺️ Field mapping:', fieldMap);

        // Parse data rows
        const records = [];
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            
            const values = this.parseCSVLine(lines[i]);
            const record = { _originalRow: i + 1 };
            
            values.forEach((value, index) => {
                const mapping = fieldMap[index];
                if (mapping) {
                    record[mapping.field] = value ? value.trim() : '';
                }
            });

            // Post-process record
            this.postProcessRecord(record, type);
            records.push(record);
        }

        console.log(`✅ Parsed ${records.length} records`);
        return {
            headers: headers,
            fieldMap: fieldMap,
            records: records,
            type: type
        };
    }

    // Parse a single CSV line (handles quotes and commas)
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        let i = 0;

        while (i < line.length) {
            const char = line[i];
            
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    // Escaped quote
                    current += '"';
                    i += 2;
                } else {
                    // Toggle quote state
                    inQuotes = !inQuotes;
                    i++;
                }
            } else if (char === ',' && !inQuotes) {
                // Field separator
                result.push(current);
                current = '';
                i++;
            } else {
                current += char;
                i++;
            }
        }
        
        result.push(current);
        return result.map(field => field.replace(/^"|"$/g, '').trim());
    }

    // Auto-detect CSV type based on headers
    detectCSVType(headers) {
        const normalizedHeaders = headers.map(h => this.normalizeHeader(h));
        
        // Count matches for each type
        const scores = { patients: 0, providers: 0 };
        
        for (const type of Object.keys(scores)) {
            const mappings = this.fieldMappings[type];
            for (const variations of Object.values(mappings)) {
                for (const variation of variations) {
                    if (normalizedHeaders.some(h => 
                        h === this.normalizeHeader(variation) ||
                        h.includes(this.normalizeHeader(variation))
                    )) {
                        scores[type]++;
                        break;
                    }
                }
            }
        }
        
        console.log('🎯 Type detection scores:', scores);
        return scores.providers > scores.patients ? 'providers' : 'patients';
    }

    // Post-process record based on type
    postProcessRecord(record, type) {
        // Generate ID if missing
        if (!record.id && !record.providerId && !record.patientId) {
            record.id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }

        if (type === 'patients') {
            // Combine name fields if needed
            if (!record.name && record.firstName && record.lastName) {
                record.name = `${record.firstName} ${record.lastName}`.trim();
            } else if (record.name && !record.firstName && !record.lastName) {
                const parts = record.name.split(/\s+/);
                record.firstName = parts[0] || '';
                record.lastName = parts.slice(1).join(' ') || '';
            }
            
            // Ensure required fields
            record.status = record.status || 'active';
            record.contactNumber = record.contactNumber || record.phone || '';
        }

        if (type === 'providers') {
            // Combine name fields if needed
            if (!record.name && record.firstName && record.lastName) {
                record.name = `${record.firstName} ${record.lastName}`.trim();
            } else if (record.name && !record.firstName && !record.lastName) {
                const parts = record.name.split(/\s+/);
                record.firstName = parts[0] || '';
                record.lastName = parts.slice(1).join(' ') || '';
            }

            // Process arrays
            if (record.serviceZipCodes && typeof record.serviceZipCodes === 'string') {
                record.serviceZipCodes = record.serviceZipCodes.split(',').map(z => z.trim()).filter(Boolean);
            }
            
            if (record.availabilityDays && typeof record.availabilityDays === 'string') {
                record.availabilityDays = record.availabilityDays.split(',').map(d => d.trim()).filter(Boolean);
            }

            // Ensure required fields
            record.status = record.status || 'active';
            record.mobile = record.mobile || record.phone || '';
            record.position = record.position || record.specialty || '';
            record.specialty = record.specialty || record.position || '';
        }

        // Add timestamps
        record.dateCreated = record.dateCreated || new Date().toISOString();
        record.lastModified = new Date().toISOString();
    }

    // Import data with duplicate detection
    importData(csvText, type = 'auto', options = {}) {
        try {
            const parseResult = this.parseCSV(csvText, type);
            const { records, type: detectedType } = parseResult;
            
            console.log(`📥 Importing ${records.length} ${detectedType} records...`);
            
            // Load existing data
            const storageKey = detectedType;
            const existingData = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            // Merge with duplicate detection
            const mergeResult = this.mergeData(existingData, records, detectedType, options);
            
            // Save to localStorage
            localStorage.setItem(storageKey, JSON.stringify(mergeResult.data));
            
            // Update global variables
            if (detectedType === 'patients') {
                window.patients = mergeResult.data;
            } else if (detectedType === 'providers') {
                window.providers = mergeResult.data;
            }
            
            // Record import history
            this.importHistory.push({
                timestamp: new Date().toISOString(),
                type: detectedType,
                recordCount: records.length,
                imported: mergeResult.imported,
                updated: mergeResult.updated,
                skipped: mergeResult.skipped
            });
            
            console.log('✅ Import completed:', mergeResult);
            return { ...parseResult, ...mergeResult };
            
        } catch (error) {
            console.error('❌ Import failed:', error);
            throw error;
        }
    }

    // Merge new data with existing data
    mergeData(existingData, newRecords, type, options = {}) {
        const duplicateStrategy = options.duplicateStrategy || 'merge'; // 'merge', 'skip', 'overwrite'
        let imported = 0, updated = 0, skipped = 0;
        
        // Create lookup for existing records
        const existingLookup = new Map();
        existingData.forEach((record, index) => {
            const key = this.getRecordKey(record, type);
            existingLookup.set(key, { record, index });
        });
        
        const resultData = [...existingData];
        
        newRecords.forEach(newRecord => {
            const key = this.getRecordKey(newRecord, type);
            const existing = existingLookup.get(key);
            
            if (!existing) {
                // New record
                resultData.push(newRecord);
                imported++;
            } else {
                // Duplicate found
                switch (duplicateStrategy) {
                    case 'skip':
                        skipped++;
                        break;
                    case 'overwrite':
                        resultData[existing.index] = { ...newRecord, id: existing.record.id };
                        updated++;
                        break;
                    case 'merge':
                    default:
                        resultData[existing.index] = this.mergeRecords(existing.record, newRecord);
                        updated++;
                        break;
                }
            }
        });
        
        return {
            data: resultData,
            imported,
            updated,
            skipped
        };
    }

    // Generate unique key for record matching
    getRecordKey(record, type) {
        if (type === 'patients') {
            // Use phone + name, or email + name, or just name
            const name = `${record.firstName || ''} ${record.lastName || ''}`.trim() || record.name || '';
            const phone = record.phone || record.mobile || record.contactNumber || '';
            const email = record.email || '';
            
            if (name && phone) return `${name.toLowerCase()}|${phone}`;
            if (name && email) return `${name.toLowerCase()}|${email}`;
            return name.toLowerCase();
        }
        
        if (type === 'providers') {
            // Use provider ID if available, otherwise name + email/phone
            if (record.providerId) return `id:${record.providerId}`;
            
            const name = `${record.firstName || ''} ${record.lastName || ''}`.trim() || record.name || '';
            const email = record.email || '';
            const phone = record.phone || record.mobile || '';
            
            if (name && email) return `${name.toLowerCase()}|${email}`;
            if (name && phone) return `${name.toLowerCase()}|${phone}`;
            return name.toLowerCase();
        }
        
        return record.id || `${Date.now()}_${Math.random()}`;
    }

    // Merge two records intelligently
    mergeRecords(existing, incoming) {
        const merged = { ...existing };
        
        Object.keys(incoming).forEach(key => {
            const existingValue = existing[key];
            const incomingValue = incoming[key];
            
            // Skip if incoming value is empty
            if (!incomingValue || incomingValue === '') return;
            
            // Always update if existing is empty
            if (!existingValue || existingValue === '') {
                merged[key] = incomingValue;
                return;
            }
            
            // For arrays, merge uniquely
            if (Array.isArray(existingValue) && Array.isArray(incomingValue)) {
                merged[key] = [...new Set([...existingValue, ...incomingValue])];
                return;
            }
            
            // For timestamps, keep the most recent
            if (key.includes('date') || key.includes('Date') || key.includes('timestamp')) {
                try {
                    const existingDate = new Date(existingValue);
                    const incomingDate = new Date(incomingValue);
                    merged[key] = incomingDate > existingDate ? incomingValue : existingValue;
                    return;
                } catch (e) {
                    // If date parsing fails, use incoming
                    merged[key] = incomingValue;
                    return;
                }
            }
            
            // Default: use incoming value (it's more recent)
            merged[key] = incomingValue;
        });
        
        // Update last modified
        merged.lastModified = new Date().toISOString();
        
        return merged;
    }
}

// Global instance
window.csvImporter = new DynamicCSVImporter();

// Enhanced import functions that use dynamic parsing
window.showPatientImportModal = function() {
    console.log('🔄 Opening patient import dialog...');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.txt';
    input.style.display = 'none';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        console.log('📁 File selected:', file.name);
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const result = window.csvImporter.importData(e.target.result, 'patients');
                
                // Show success message
                alert(`✅ Patient Import Success!\n\nImported: ${result.imported}\nUpdated: ${result.updated}\nSkipped: ${result.skipped}`);
                
                // Refresh UI
                if (typeof renderPatientsTable === 'function') {
                    renderPatientsTable();
                }
                
                // Update dashboard
                if (typeof updateDashboard === 'function') {
                    updateDashboard();
                }
                
                console.log('✅ Patient import completed successfully');
                
            } catch (error) {
                console.error('❌ Patient import error:', error);
                alert(`❌ Import Error: ${error.message}`);
            }
        };
        
        reader.onerror = function() {
            alert('❌ Error reading file');
        };
        
        reader.readAsText(file);
    };
    
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
};

window.showProviderImportModal = function() {
    console.log('🔄 Opening provider import dialog...');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.txt';
    input.style.display = 'none';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        console.log('📁 File selected:', file.name);
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const result = window.csvImporter.importData(e.target.result, 'providers');
                
                // Show success message
                alert(`✅ Provider Import Success!\n\nImported: ${result.imported}\nUpdated: ${result.updated}\nSkipped: ${result.skipped}`);
                
                // Refresh UI
                if (typeof renderProvidersTable === 'function') {
                    renderProvidersTable();
                }
                
                // Navigate to providers section
                if (typeof showSection === 'function') {
                    showSection('providers');
                }
                
                // Update dashboard
                if (typeof updateDashboard === 'function') {
                    updateDashboard();
                }
                
                console.log('✅ Provider import completed successfully');
                
            } catch (error) {
                console.error('❌ Provider import error:', error);
                alert(`❌ Import Error: ${error.message}`);
            }
        };
        
        reader.onerror = function() {
            alert('❌ Error reading file');
        };
        
        reader.readAsText(file);
    };
    
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
};

console.log('✅ Dynamic CSV Import System loaded');
