// Provider Import Helper Functions

/**
 * Detect provider report type based on CSV headers
 */
function detectProviderReportType(headers) {
    const headerStr = headers.join('|').toLowerCase();
    
    // Provider Details Report headers
    const detailsHeaders = [
        'provider id', 'first name', 'last name', 'pt license', 'state of licensure',
        'email address', 'mobile phone', 'emergency contact', 'address', 'borough',
        'service area zip codes', 'position', 'rate', 'payment type', 'general availability',
        'availability days', 'availability timings from', 'availability timings till',
        'start date', 'status', 'notes'
    ];
    
    // Provider Insurance Report headers
    const insuranceHeaders = [
        'provider id', 'provider name', 'insurance name', 'credentialing status',
        'date approved/denied', 'notes/follow-up'
    ];
    
    // Count matches for each report type
    let detailsMatches = 0;
    let insuranceMatches = 0;
    
    detailsHeaders.forEach(header => {
        if (headerStr.includes(header)) detailsMatches++;
    });
    
    insuranceHeaders.forEach(header => {
        if (headerStr.includes(header)) insuranceMatches++;
    });
    
    console.log('Header matches - Details:', detailsMatches, 'Insurance:', insuranceMatches);
    
    // Determine report type based on matches
    if (detailsMatches >= 5) {
        return 'provider_details';
    } else if (insuranceMatches >= 3) {
        return 'provider_insurance';
    } else {
        // Try to detect by specific key headers
        if (headerStr.includes('first name') && headerStr.includes('last name')) {
            return 'provider_details';
        } else if (headerStr.includes('insurance name') && headerStr.includes('credentialing status')) {
            return 'provider_insurance';
        }
        
        return 'unknown';
    }
}

/**
 * Process a Provider Details row
 */
function processProviderDetailsRow(rowData) {
    // Map headers to standardized field names
    const providerId = rowData['Provider ID'] || rowData['provider id'] || '';
    const firstName = rowData['First Name'] || rowData['first name'] || '';
    const lastName = rowData['Last Name'] || rowData['last name'] || '';
    const fullName = `${firstName} ${lastName}`.trim();
    const license = rowData['PT License #'] || rowData['pt license #'] || rowData['License'] || '';
    const email = rowData['Email Address'] || rowData['email address'] || rowData['Email'] || '';
    const phone = rowData['Mobile Phone'] || rowData['mobile phone'] || rowData['Phone'] || '';
    const address = rowData['Address'] || rowData['address'] || '';
    const borough = rowData['Borough (Select All Available)'] || rowData['borough'] || '';
    const zipCodes = rowData['Service Area Zip Codes (Comma Separated)'] || rowData['service area zip codes'] || '';
    const position = rowData['Position'] || rowData['position'] || '';
    const rate = rowData['Rate'] || rowData['rate'] || '';
    const paymentType = rowData['Payment Type'] || rowData['payment type'] || '';
    const generalAvailability = rowData['General Availability'] || rowData['general availability'] || '';
    const availabilityDays = rowData['Availability Days (Select All Available)'] || rowData['availability days'] || '';
    const availabilityFrom = rowData['Availability Timings from'] || rowData['availability timings from'] || '';
    const availabilityTill = rowData['Availability Timings till'] || rowData['availability timings till'] || '';
    const startDate = rowData['Start Date'] || rowData['start date'] || '';
    const status = (rowData['Status'] || rowData['status'] || 'active').toLowerCase();
    const notes = rowData['Notes'] || rowData['notes'] || '';
    const emergencyContactName = rowData['Emergency Contact Name'] || rowData['emergency contact name'] || '';
    const emergencyContactPhone = rowData['Emergency Contact Phone'] || rowData['emergency contact phone'] || '';
    const stateOfLicensure = rowData['State of Licensure'] || rowData['state of licensure'] || '';
    
    // Validate required fields
    if (!fullName && !firstName && !lastName) {
        throw new Error('Provider name is required');
    }
    
    // Check if provider already exists (by Provider ID or name)
    let existingProvider = null;
    if (providerId) {
        existingProvider = window.providers.find(p => p.providerId === providerId);
    }
    if (!existingProvider && fullName) {
        existingProvider = window.providers.find(p => 
            p.name && p.name.toLowerCase() === fullName.toLowerCase()
        );
    }
    
    // Structure availability data
    const availability = {
        general: generalAvailability,
        days: availabilityDays ? availabilityDays.split(',').map(d => d.trim()) : [],
        timeFrom: availabilityFrom,
        timeTill: availabilityTill,
        isAvailable: status === 'active'
    };
    
    // Create or update provider object
    const providerData = {
        id: existingProvider ? existingProvider.id : `p_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        providerId: providerId,
        name: fullName,
        firstName: firstName,
        lastName: lastName,
        specialty: position || 'PT', // Default to PT if not specified
        license: license,
        licenseNumber: license,
        stateOfLicensure: stateOfLicensure,
        email: email,
        phone: phone,
        address: address,
        borough: borough,
        zipCode: zipCodes,
        serviceAreaZipCodes: zipCodes ? zipCodes.split(',').map(z => z.trim()) : [],
        position: position,
        rate: rate,
        paymentType: paymentType,
        availability: availability,
        startDate: startDate,
        status: status,
        notes: notes ? [notes] : [],
        emergencyContact: {
            name: emergencyContactName,
            phone: emergencyContactPhone
        },
        createdAt: existingProvider ? existingProvider.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    let isNew = false;
    let isUpdated = false;
    
    if (existingProvider) {
        // Update existing provider
        const index = window.providers.findIndex(p => p.id === existingProvider.id);
        window.providers[index] = { ...existingProvider, ...providerData };
        isUpdated = true;
        console.log('Updated existing provider:', fullName);
    } else {
        // Add new provider
        window.providers.push(providerData);
        isNew = true;
        console.log('Added new provider:', fullName);
    }
    
    return { isNew, isUpdated };
}

/**
 * Process a Provider Insurance row
 */
function processProviderInsuranceRow(rowData) {
    // Map headers to standardized field names
    const providerId = rowData['Provider ID'] || rowData['provider id'] || '';
    const providerName = rowData['Provider Name'] || rowData['provider name'] || '';
    const insuranceName = rowData['Insurance Name'] || rowData['insurance name'] || '';
    const credentialingStatus = rowData['Credentialing Status'] || rowData['credentialing status'] || '';
    const dateApprovedDenied = rowData['Date Approved/Denied'] || rowData['date approved/denied'] || '';
    const notesFollowUp = rowData['Notes/Follow-up'] || rowData['notes/follow-up'] || rowData['Notes'] || '';
    
    // New insurance and payment fields
    const paymentReceived = rowData['Payment Received'] || rowData['payment received'] || rowData['Payment Amount'] || '';
    const denialReason = rowData['Denial Reason'] || rowData['denial reason'] || rowData['Reason for Denial'] || '';
    const copay = rowData['Copay'] || rowData['copay'] || rowData['Co-pay'] || rowData['Patient Copay'] || '';
    const secondaryInsurancePayment = rowData['Secondary Insurance Payment'] || rowData['secondary insurance payment'] || rowData['Secondary Payment'] || '';
    const paymentReceivedDate = rowData['Payment Received Date'] || rowData['payment received date'] || rowData['Date Payment Received'] || '';
    const patientEmrId = rowData['Patient EMR ID'] || rowData['patient emr id'] || rowData['EMR Patient ID'] || rowData['Patient ID'] || '';
    
    // Validate required fields
    if (!providerName && !providerId) {
        throw new Error('Provider ID or Provider Name is required');
    }
    
    if (!insuranceName) {
        throw new Error('Insurance Name is required');
    }
    
    // Find existing provider (by Provider ID or name)
    let existingProvider = null;
    if (providerId) {
        existingProvider = window.providers.find(p => p.providerId === providerId);
    }
    if (!existingProvider && providerName) {
        existingProvider = window.providers.find(p => 
            p.name && p.name.toLowerCase() === providerName.toLowerCase()
        );
    }
    
    let isNew = false;
    let isUpdated = false;
    
    if (existingProvider) {
        // Update existing provider with insurance information
        if (!existingProvider.insuranceNetworks) {
            existingProvider.insuranceNetworks = [];
        }
        if (!existingProvider.credentialingStatus) {
            existingProvider.credentialingStatus = {};
        }
        if (!existingProvider.notes) {
            existingProvider.notes = [];
        }
        
        // Add insurance if not already present
        if (!existingProvider.insuranceNetworks.includes(insuranceName)) {
            existingProvider.insuranceNetworks.push(insuranceName);
        }
        
        // Update credentialing status with enhanced payment tracking
        existingProvider.credentialingStatus[insuranceName] = {
            status: credentialingStatus,
            date: dateApprovedDenied,
            notes: notesFollowUp,
            paymentReceived: paymentReceived,
            denialReason: denialReason,
            copay: copay,
            secondaryInsurancePayment: secondaryInsurancePayment,
            paymentReceivedDate: paymentReceivedDate,
            patientEmrId: patientEmrId
        };
        
        // Add notes if provided
        if (notesFollowUp && !existingProvider.notes.includes(notesFollowUp)) {
            existingProvider.notes.push(notesFollowUp);
        }
        
        existingProvider.updatedAt = new Date().toISOString();
        isUpdated = true;
        console.log('Updated provider insurance info:', providerName);
        
    } else {
        // Create new provider with insurance information
        const newProvider = {
            id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            providerId: providerId,
            name: providerName,
            specialty: 'PT', // Default
            insuranceNetworks: [insuranceName],
            credentialingStatus: {
                [insuranceName]: {
                    status: credentialingStatus,
                    date: dateApprovedDenied,
                    notes: notesFollowUp,
                    paymentReceived: paymentReceived,
                    denialReason: denialReason,
                    copay: copay,
                    secondaryInsurancePayment: secondaryInsurancePayment,
                    paymentReceivedDate: paymentReceivedDate,
                    patientEmrId: patientEmrId
                }
            },
            notes: notesFollowUp ? [notesFollowUp] : [],
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        window.providers.push(newProvider);
        isNew = true;
        console.log('Created new provider from insurance data:', providerName);
    }
    
    return { isNew, isUpdated };
}
