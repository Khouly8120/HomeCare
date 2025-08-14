// Provider-Patient Availability Matching and Utilization System

// Parse provider availability from CSV data
function processProviderAvailabilityData(csvData) {
    try {
        const lines = csvData.split('\n');
        if (lines.length < 2) {
            throw new Error('CSV file must have at least a header row and one data row');
        }
        
        const headers = parseCSVLine(lines[0]);
        let importedCount = 0;
        let updatedCount = 0;
        let errorCount = 0;
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            try {
                const values = parseCSVLine(line);
                if (values.length < 8) continue; // Minimum required columns
                
                const providerData = {
                    name: values[0]?.trim(),
                    contactNumber: values[1]?.trim(),
                    email: values[2]?.trim(),
                    borough: values[3]?.trim(),
                    position: values[4]?.trim(),
                    rate: values[5]?.trim(),
                    paymentType: values[6]?.trim(),
                    availability: values[7]?.trim(),
                    generalNotes: values[8]?.trim() || ''
                };
                
                if (!providerData.name) {
                    console.warn(`Skipping row ${i + 1}: Missing provider name`);
                    continue;
                }
                
                // Parse availability schedule
                const parsedAvailability = parseAvailabilitySchedule(providerData.availability);
                
                // Extract zip codes from notes
                const zipCodes = extractZipCodes(providerData.generalNotes);
                
                // Find existing provider or create new one
                let existingProvider = providers.find(p => 
                    p.name.toLowerCase() === providerData.name.toLowerCase()
                );
                
                if (existingProvider) {
                    // Update existing provider
                    existingProvider.contactNumber = providerData.contactNumber;
                    existingProvider.email = providerData.email;
                    existingProvider.borough = providerData.borough;
                    existingProvider.rate = providerData.rate;
                    existingProvider.paymentType = providerData.paymentType;
                    existingProvider.availability = parsedAvailability;
                    existingProvider.zipCodes = zipCodes;
                    existingProvider.generalNotes = providerData.generalNotes;
                    existingProvider.lastUpdated = new Date().toISOString();
                    updatedCount++;
                } else {
                    // Create new provider
                    const newProvider = {
                        id: Date.now() + Math.random(),
                        name: providerData.name,
                        contactNumber: providerData.contactNumber,
                        email: providerData.email,
                        borough: providerData.borough,
                        position: providerData.position,
                        rate: providerData.rate,
                        paymentType: providerData.paymentType,
                        availability: parsedAvailability,
                        zipCodes: zipCodes,
                        generalNotes: providerData.generalNotes,
                        specialty: 'PT',
                        status: 'active',
                        dateAdded: new Date().toISOString(),
                        utilizationStats: {
                            totalAvailableHours: 0,
                            scheduledHours: 0,
                            utilizationPercentage: 0,
                            lastCalculated: new Date().toISOString()
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
        
        // Calculate utilization for all providers
        calculateAllProviderUtilization();
        
        // Save data and update UI
        saveData();
        updateDashboard();
        loadProvidersData();
        
        // Show import results
        const message = `Provider Availability Import Completed!\n\nNew providers: ${importedCount}\nUpdated providers: ${updatedCount}\nErrors: ${errorCount}\n\nTotal providers now: ${providers.length}`;
        alert(message);
        
        // Add activity log
        addActivity(`Imported provider availability data: ${importedCount} new, ${updatedCount} updated`, 'fa-calendar-alt');
        
    } catch (error) {
        console.error('Provider availability import error:', error);
        alert(`Error processing provider availability data: ${error.message}`);
    }
}

// Parse availability schedule from text
function parseAvailabilitySchedule(availabilityText) {
    if (!availabilityText || availabilityText.trim() === '' || availabilityText.toLowerCase().includes('availability will be sent soon')) {
        return {
            schedule: [],
            totalWeeklyHours: 0,
            isFlexible: false,
            notes: availabilityText
        };
    }
    
    const schedule = [];
    let totalWeeklyHours = 0;
    
    // Common patterns to parse
    const dayPatterns = {
        'monday': 'Mon',
        'tuesday': 'Tue', 
        'wednesday': 'Wed',
        'thursday': 'Thu',
        'friday': 'Fri',
        'saturday': 'Sat',
        'sunday': 'Sun',
        'mon': 'Mon',
        'tue': 'Tue',
        'wed': 'Wed',
        'thu': 'Thu',
        'fri': 'Fri',
        'sat': 'Sat',
        'sun': 'Sun'
    };
    
    const text = availabilityText.toLowerCase();
    
    // Parse different availability patterns
    if (text.includes('mon to fri') || text.includes('monday to friday')) {
        // Monday to Friday pattern
        const timeMatch = text.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm)?).*?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/);
        if (timeMatch) {
            const startTime = timeMatch[1];
            const endTime = timeMatch[2];
            ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].forEach(day => {
                if (!text.includes('except') || !text.includes('thursday') || day !== 'Thu') {
                    schedule.push({
                        day: day,
                        startTime: startTime,
                        endTime: endTime,
                        hours: calculateHoursBetween(startTime, endTime)
                    });
                    totalWeeklyHours += calculateHoursBetween(startTime, endTime);
                }
            });
        }
    } else {
        // Parse individual days
        Object.keys(dayPatterns).forEach(dayName => {
            if (text.includes(dayName)) {
                const dayCode = dayPatterns[dayName];
                
                // Try to extract time for this day
                const dayIndex = text.indexOf(dayName);
                const daySection = text.substring(dayIndex, dayIndex + 100);
                const timeMatch = daySection.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm)?).*?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/);
                
                if (timeMatch) {
                    const hours = calculateHoursBetween(timeMatch[1], timeMatch[2]);
                    schedule.push({
                        day: dayCode,
                        startTime: timeMatch[1],
                        endTime: timeMatch[2],
                        hours: hours
                    });
                    totalWeeklyHours += hours;
                } else {
                    // Default hours if no time specified
                    schedule.push({
                        day: dayCode,
                        startTime: '9:00am',
                        endTime: '5:00pm',
                        hours: 8
                    });
                    totalWeeklyHours += 8;
                }
            }
        });
    }
    
    return {
        schedule: schedule,
        totalWeeklyHours: totalWeeklyHours,
        isFlexible: text.includes('flexible') || text.includes('open to'),
        notes: availabilityText
    };
}

// Calculate hours between two time strings
function calculateHoursBetween(startTime, endTime) {
    try {
        const start = parseTime(startTime);
        const end = parseTime(endTime);
        
        if (end < start) {
            // Handle overnight shifts
            return (24 - start) + end;
        }
        
        return Math.max(0, end - start);
    } catch (error) {
        console.warn('Error calculating hours:', error);
        return 8; // Default to 8 hours
    }
}

// Parse time string to decimal hours
function parseTime(timeStr) {
    if (!timeStr) return 9; // Default 9am
    
    const cleanTime = timeStr.toLowerCase().replace(/\s+/g, '');
    const isPM = cleanTime.includes('pm');
    const isAM = cleanTime.includes('am');
    
    let timeMatch = cleanTime.match(/(\d{1,2})(?::(\d{2}))?/);
    if (!timeMatch) return 9;
    
    let hours = parseInt(timeMatch[1]);
    let minutes = parseInt(timeMatch[2] || '0');
    
    // Convert to 24-hour format
    if (isPM && hours !== 12) {
        hours += 12;
    } else if (isAM && hours === 12) {
        hours = 0;
    }
    
    return hours + (minutes / 60);
}

// Extract zip codes from text
function extractZipCodes(text) {
    if (!text) return [];
    
    const zipMatches = text.match(/\b\d{5}\b/g);
    return zipMatches ? [...new Set(zipMatches)] : [];
}

// Calculate utilization for all providers
function calculateAllProviderUtilization() {
    providers.forEach(provider => {
        if (provider.availability && provider.availability.totalWeeklyHours > 0) {
            calculateProviderUtilization(provider.id);
        }
    });
}

// Calculate utilization for a specific provider
function calculateProviderUtilization(providerId) {
    const provider = providers.find(p => p.id === providerId);
    if (!provider || !provider.availability) return;
    
    const totalAvailableHours = provider.availability.totalWeeklyHours;
    
    // Count scheduled hours from patients
    let scheduledHours = 0;
    patients.forEach(patient => {
        if (patient.appointments && Array.isArray(patient.appointments)) {
            patient.appointments.forEach(appointment => {
                if (appointment.provider === provider.name && 
                    appointment.status === 'scheduled' &&
                    isCurrentWeek(appointment.date)) {
                    scheduledHours += parseFloat(appointment.duration || 1);
                }
            });
        }
    });
    
    const utilizationPercentage = totalAvailableHours > 0 ? 
        Math.round((scheduledHours / totalAvailableHours) * 100) : 0;
    
    provider.utilizationStats = {
        totalAvailableHours: totalAvailableHours,
        scheduledHours: scheduledHours,
        utilizationPercentage: utilizationPercentage,
        lastCalculated: new Date().toISOString()
    };
}

// Check if date is in current week
function isCurrentWeek(dateStr) {
    if (!dateStr) return false;
    
    const date = new Date(dateStr);
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return date >= startOfWeek && date <= endOfWeek;
}

// Find matching providers for a patient
function findMatchingProviders(patient) {
    if (!patient) return [];
    
    const matches = [];
    
    providers.forEach(provider => {
        if (!provider.availability || provider.status !== 'active') return;
        
        const matchScore = calculateMatchScore(patient, provider);
        if (matchScore > 0) {
            matches.push({
                provider: provider,
                matchScore: matchScore,
                reasons: getMatchReasons(patient, provider)
            });
        }
    });
    
    // Sort by match score (highest first)
    return matches.sort((a, b) => b.matchScore - a.matchScore);
}

// Calculate match score between patient and provider
function calculateMatchScore(patient, provider) {
    let score = 0;
    
    // Geographic matching
    if (patient.zipCode && provider.zipCodes && provider.zipCodes.length > 0) {
        if (provider.zipCodes.includes(patient.zipCode)) {
            score += 50; // Exact zip match
        } else {
            // Check nearby zip codes (simplified)
            const patientZip = parseInt(patient.zipCode);
            const nearbyMatch = provider.zipCodes.some(zip => {
                const providerZip = parseInt(zip);
                return Math.abs(patientZip - providerZip) <= 10;
            });
            if (nearbyMatch) score += 25;
        }
    }
    
    // Borough matching
    if (patient.area && provider.borough) {
        if (patient.area.toLowerCase().includes(provider.borough.toLowerCase()) ||
            provider.borough.toLowerCase().includes(patient.area.toLowerCase())) {
            score += 30;
        }
    }
    
    // Insurance matching
    if (patient.insurance && provider.insuranceNetworks) {
        const patientInsurance = patient.insurance.toLowerCase();
        const hasInsuranceMatch = provider.insuranceNetworks.some(ins => 
            ins.toLowerCase().includes(patientInsurance) || 
            patientInsurance.includes(ins.toLowerCase())
        );
        if (hasInsuranceMatch) score += 40;
    }
    
    // Availability matching (simplified - assumes flexible scheduling)
    if (provider.availability.totalWeeklyHours > 0) {
        score += 20;
    }
    
    // Utilization bonus (prefer less utilized providers)
    if (provider.utilizationStats && provider.utilizationStats.utilizationPercentage < 80) {
        score += (80 - provider.utilizationStats.utilizationPercentage) / 4;
    }
    
    return Math.round(score);
}

// Get match reasons for display
function getMatchReasons(patient, provider) {
    const reasons = [];
    
    if (patient.zipCode && provider.zipCodes && provider.zipCodes.includes(patient.zipCode)) {
        reasons.push('Exact zip code match');
    }
    
    if (patient.area && provider.borough && 
        patient.area.toLowerCase().includes(provider.borough.toLowerCase())) {
        reasons.push('Borough match');
    }
    
    if (patient.insurance && provider.insuranceNetworks) {
        const patientInsurance = patient.insurance.toLowerCase();
        const matchingInsurance = provider.insuranceNetworks.find(ins => 
            ins.toLowerCase().includes(patientInsurance) || 
            patientInsurance.includes(ins.toLowerCase())
        );
        if (matchingInsurance) {
            reasons.push(`Insurance: ${matchingInsurance}`);
        }
    }
    
    if (provider.utilizationStats && provider.utilizationStats.utilizationPercentage < 80) {
        reasons.push(`Available capacity: ${100 - provider.utilizationStats.utilizationPercentage}%`);
    }
    
    return reasons;
}

// Import provider availability from CSV
function importProviderAvailability() {
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
                    processProviderAvailabilityData(csvData);
                } catch (error) {
                    alert(`Error importing provider availability: ${error.message}`);
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

// Show provider utilization dashboard
function showUtilizationDashboard() {
    calculateAllProviderUtilization();
    
    const modal = document.getElementById('utilizationModal') || createUtilizationModal();
    const modalBody = modal.querySelector('.modal-body');
    
    const totalProviders = providers.filter(p => p.status === 'active').length;
    const totalAvailableHours = providers.reduce((sum, p) => 
        sum + (p.availability?.totalWeeklyHours || 0), 0);
    const totalScheduledHours = providers.reduce((sum, p) => 
        sum + (p.utilizationStats?.scheduledHours || 0), 0);
    const overallUtilization = totalAvailableHours > 0 ? 
        Math.round((totalScheduledHours / totalAvailableHours) * 100) : 0;
    
    modalBody.innerHTML = `
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card bg-primary text-white">
                    <div class="card-body text-center">
                        <h3>${totalProviders}</h3>
                        <p class="mb-0">Active Providers</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-info text-white">
                    <div class="card-body text-center">
                        <h3>${totalAvailableHours}h</h3>
                        <p class="mb-0">Available Hours</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-success text-white">
                    <div class="card-body text-center">
                        <h3>${totalScheduledHours}h</h3>
                        <p class="mb-0">Scheduled Hours</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-warning text-white">
                    <div class="card-body text-center">
                        <h3>${overallUtilization}%</h3>
                        <p class="mb-0">Overall Utilization</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Provider</th>
                        <th>Available Hours</th>
                        <th>Scheduled Hours</th>
                        <th>Utilization</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${providers.filter(p => p.status === 'active').map(provider => {
                        const stats = provider.utilizationStats || {};
                        const utilization = stats.utilizationPercentage || 0;
                        const statusClass = utilization > 90 ? 'danger' : 
                                          utilization > 70 ? 'warning' : 'success';
                        
                        return `
                            <tr>
                                <td>
                                    <strong>${provider.name}</strong><br>
                                    <small class="text-muted">${provider.borough || 'N/A'}</small>
                                </td>
                                <td>${stats.totalAvailableHours || 0}h</td>
                                <td>${stats.scheduledHours || 0}h</td>
                                <td>
                                    <div class="progress" style="height: 20px;">
                                        <div class="progress-bar bg-${statusClass}" 
                                             style="width: ${utilization}%">
                                            ${utilization}%
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span class="badge bg-${statusClass}">
                                        ${utilization > 90 ? 'Overbooked' : 
                                          utilization > 70 ? 'Busy' : 'Available'}
                                    </span>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}

// Create utilization modal
function createUtilizationModal() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'utilizationModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Provider Utilization Dashboard</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <!-- Content will be populated dynamically -->
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" onclick="exportUtilizationReport()">Export Report</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

// Export utilization report
function exportUtilizationReport() {
    calculateAllProviderUtilization();
    
    const reportData = providers.filter(p => p.status === 'active').map(provider => {
        const stats = provider.utilizationStats || {};
        return {
            'Provider Name': provider.name,
            'Borough': provider.borough || 'N/A',
            'Contact': provider.contactNumber || 'N/A',
            'Email': provider.email || 'N/A',
            'Available Hours': stats.totalAvailableHours || 0,
            'Scheduled Hours': stats.scheduledHours || 0,
            'Utilization %': stats.utilizationPercentage || 0,
            'Status': stats.utilizationPercentage > 90 ? 'Overbooked' : 
                     stats.utilizationPercentage > 70 ? 'Busy' : 'Available',
            'Last Updated': stats.lastCalculated ? new Date(stats.lastCalculated).toLocaleDateString() : 'N/A'
        };
    });
    
    exportToCSV(reportData, 'provider-utilization-report');
}
