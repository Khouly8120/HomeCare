// Home Care Dashboard Analytics and KPI System

// Dashboard data calculation functions (prioritizing imported data)
function calculateDashboardKPIs(selectedMonth = null, selectedClinic = null) {
    const currentDate = new Date();
    const currentMonth = selectedMonth || `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    // Use centralized data access that prioritizes imported data over sample data
    const patients = typeof getPatientData === 'function' ? getPatientData() : JSON.parse(localStorage.getItem('patients') || '[]');
    const providers = typeof getProviderData === 'function' ? getProviderData() : JSON.parse(localStorage.getItem('providers') || '[]');
    
    // Log data source for debugging
    const hasImported = typeof hasImportedData === 'function' ? hasImportedData() : false;
    console.log('Dashboard KPIs using data source:', hasImported ? 'IMPORTED DATA' : 'SAMPLE DATA');
    
    // Filter data based on selected month and clinic
    const filteredPatients = filterPatientsByMonthAndClinic(patients, currentMonth, selectedClinic);
    const filteredProviders = filterProvidersByClinic(providers, selectedClinic);
    
    // Calculate KPIs
    const kpis = {
        // Patient appointment metrics
        patientsWithUpcoming: calculatePatientsWithUpcoming(filteredPatients),
        patientsWithoutUpcoming: calculatePatientsWithoutUpcoming(filteredPatients),
        
        // Claims metrics
        claimsPaid: calculateClaimsPaid(filteredPatients, currentMonth, selectedClinic),
        claimsUnpaid: calculateClaimsUnpaid(filteredPatients, currentMonth, selectedClinic),
        
        // Provider metrics
        providersWithAvailability: calculateProvidersWithAvailability(filteredProviders),
        providersCredentialed: calculateProvidersCredentialed(filteredProviders),
        
        // Session metrics
        sessionsPerMonth: calculateSessionsPerMonth(filteredPatients, currentMonth, selectedClinic),
        initialEvaluationsPerMonth: calculateInitialEvaluationsPerMonth(filteredPatients, currentMonth, selectedClinic),
        
        // Additional useful metrics
        totalPatients: filteredPatients.length,
        totalProviders: filteredProviders.length,
        averageSessionsPerPatient: 0,
        utilizationRate: 0
    };
    
    // Calculate derived metrics
    kpis.averageSessionsPerPatient = kpis.totalPatients > 0 ? 
        Math.round((kpis.sessionsPerMonth / kpis.totalPatients) * 10) / 10 : 0;
    
    kpis.utilizationRate = kpis.providersWithAvailability > 0 ? 
        Math.round((kpis.sessionsPerMonth / (kpis.providersWithAvailability * 40)) * 100) : 0; // Assuming 40 sessions/month capacity per provider
    
    return kpis;
}

// Filter patients by month and clinic
function filterPatientsByMonthAndClinic(patientList, month, clinic) {
    return patientList.filter(patient => {
        let matchesClinic = true;
        let hasDataInMonth = true;
        
        // Filter by clinic if specified
        if (clinic && clinic !== 'all') {
            matchesClinic = patient.clinicName && patient.clinicName.toLowerCase().includes(clinic.toLowerCase());
        }
        
        // Filter by month if specified (check appointments, payments, etc.)
        if (month && month !== 'all') {
            hasDataInMonth = hasPatientDataInMonth(patient, month);
        }
        
        return matchesClinic && hasDataInMonth;
    });
}

// Filter providers by clinic
function filterProvidersByClinic(providerList, clinic) {
    if (!clinic || clinic === 'all') return providerList;
    
    return providerList.filter(provider => {
        return provider.borough && provider.borough.toLowerCase().includes(clinic.toLowerCase());
    });
}

// Check if patient has data in specified month
function hasPatientDataInMonth(patient, month) {
    const [year, monthNum] = month.split('-');
    
    // Check appointments
    if (patient.appointments && Array.isArray(patient.appointments)) {
        const hasAppointmentInMonth = patient.appointments.some(apt => {
            if (!apt.appointmentDate && !apt.dateOfService) return false;
            const aptDate = new Date(apt.appointmentDate || apt.dateOfService);
            return aptDate.getFullYear() == year && (aptDate.getMonth() + 1) == parseInt(monthNum);
        });
        if (hasAppointmentInMonth) return true;
    }
    
    // Check payments/claims
    if (patient.payments && Array.isArray(patient.payments)) {
        const hasPaymentInMonth = patient.payments.some(payment => {
            if (!payment.dateOfService && !payment.dateOfTransaction) return false;
            const payDate = new Date(payment.dateOfService || payment.dateOfTransaction);
            return payDate.getFullYear() == year && (payDate.getMonth() + 1) == parseInt(monthNum);
        });
        if (hasPaymentInMonth) return true;
    }
    
    return false;
}

// Calculate patients with upcoming appointments
function calculatePatientsWithUpcoming(patientList) {
    const today = new Date();
    let count = 0;
    
    patientList.forEach(patient => {
        if (patient.appointments && Array.isArray(patient.appointments)) {
            const hasUpcoming = patient.appointments.some(apt => {
                if (!apt.appointmentDate && !apt.nextScheduledAppointment) return false;
                const aptDate = new Date(apt.appointmentDate || apt.nextScheduledAppointment);
                return aptDate > today && apt.visitStatus !== 'cancelled';
            });
            if (hasUpcoming) count++;
        } else if (patient.nextScheduledAppointment) {
            const nextApt = new Date(patient.nextScheduledAppointment);
            if (nextApt > today) count++;
        }
    });
    
    return count;
}

// Calculate patients without upcoming appointments
function calculatePatientsWithoutUpcoming(patientList) {
    const today = new Date();
    let count = 0;
    
    patientList.forEach(patient => {
        let hasUpcoming = false;
        
        if (patient.appointments && Array.isArray(patient.appointments)) {
            hasUpcoming = patient.appointments.some(apt => {
                if (!apt.appointmentDate && !apt.nextScheduledAppointment) return false;
                const aptDate = new Date(apt.appointmentDate || apt.nextScheduledAppointment);
                return aptDate > today && apt.visitStatus !== 'cancelled';
            });
        } else if (patient.nextScheduledAppointment) {
            const nextApt = new Date(patient.nextScheduledAppointment);
            hasUpcoming = nextApt > today;
        }
        
        if (!hasUpcoming) count++;
    });
    
    return count;
}

// Calculate paid claims
function calculateClaimsPaid(patientList, month, clinic) {
    let count = 0;
    const [year, monthNum] = month.split('-');
    
    patientList.forEach(patient => {
        if (patient.appointments && Array.isArray(patient.appointments)) {
            patient.appointments.forEach(apt => {
                if (apt.amountPaid && parseFloat(apt.amountPaid) > 0) {
                    const serviceDate = new Date(apt.dateOfService || apt.appointmentDate);
                    if (serviceDate.getFullYear() == year && (serviceDate.getMonth() + 1) == parseInt(monthNum)) {
                        count++;
                    }
                }
            });
        }
        
        // Check payments array if available
        if (patient.payments && Array.isArray(patient.payments)) {
            patient.payments.forEach(payment => {
                if (payment.amountPaid && parseFloat(payment.amountPaid) > 0) {
                    const payDate = new Date(payment.dateOfService || payment.dateOfTransaction);
                    if (payDate.getFullYear() == year && (payDate.getMonth() + 1) == parseInt(monthNum)) {
                        count++;
                    }
                }
            });
        }
    });
    
    return count;
}

// Calculate unpaid claims
function calculateClaimsUnpaid(patientList, month, clinic) {
    let count = 0;
    const [year, monthNum] = month.split('-');
    
    patientList.forEach(patient => {
        if (patient.appointments && Array.isArray(patient.appointments)) {
            patient.appointments.forEach(apt => {
                if (apt.amountDue && parseFloat(apt.amountDue) > 0 && 
                    (!apt.amountPaid || parseFloat(apt.amountPaid) === 0)) {
                    const serviceDate = new Date(apt.dateOfService || apt.appointmentDate);
                    if (serviceDate.getFullYear() == year && (serviceDate.getMonth() + 1) == parseInt(monthNum)) {
                        count++;
                    }
                }
            });
        }
        
        // Check payments array if available
        if (patient.payments && Array.isArray(patient.payments)) {
            patient.payments.forEach(payment => {
                if (payment.amountDue && parseFloat(payment.amountDue) > 0 && 
                    (!payment.amountPaid || parseFloat(payment.amountPaid) === 0)) {
                    const payDate = new Date(payment.dateOfService || payment.dateOfTransaction);
                    if (payDate.getFullYear() == year && (payDate.getMonth() + 1) == parseInt(monthNum)) {
                        count++;
                    }
                }
            });
        }
    });
    
    return count;
}

// Calculate providers with availability
function calculateProvidersWithAvailability(providerList) {
    return providerList.filter(provider => {
        return provider.status === 'active' && 
               provider.availability && 
               provider.availability.totalWeeklyHours > 0 &&
               (!provider.utilizationStats || provider.utilizationStats.utilizationPercentage < 100);
    }).length;
}

// Calculate credentialed providers
function calculateProvidersCredentialed(providerList) {
    return providerList.filter(provider => {
        return provider.status === 'active' && 
               (provider.licenseNumber || provider.credentialStatus === 'credentialed');
    }).length;
}

// Calculate sessions per month
function calculateSessionsPerMonth(patientList, month, clinic) {
    let count = 0;
    const [year, monthNum] = month.split('-');
    
    patientList.forEach(patient => {
        if (patient.appointments && Array.isArray(patient.appointments)) {
            patient.appointments.forEach(apt => {
                if (apt.visitStatus === 'completed' || apt.visitStatus === 'documented') {
                    const serviceDate = new Date(apt.dateOfService || apt.appointmentDate);
                    if (serviceDate.getFullYear() == year && (serviceDate.getMonth() + 1) == parseInt(monthNum)) {
                        count++;
                    }
                }
            });
        }
    });
    
    return count;
}

// Calculate initial evaluations per month
function calculateInitialEvaluationsPerMonth(patientList, month, clinic) {
    let count = 0;
    const [year, monthNum] = month.split('-');
    
    patientList.forEach(patient => {
        if (patient.appointments && Array.isArray(patient.appointments)) {
            patient.appointments.forEach(apt => {
                if ((apt.appointmentType && apt.appointmentType.toLowerCase().includes('initial')) ||
                    (apt.visitType && apt.visitType.toLowerCase().includes('initial')) ||
                    (apt.visitType && apt.visitType.toLowerCase().includes('evaluation'))) {
                    const serviceDate = new Date(apt.dateOfService || apt.appointmentDate);
                    if (serviceDate.getFullYear() == year && (serviceDate.getMonth() + 1) == parseInt(monthNum)) {
                        count++;
                    }
                }
            });
        }
        
        // Check initial evaluation date
        if (patient.initialEvaluation) {
            const evalDate = new Date(patient.initialEvaluation);
            if (evalDate.getFullYear() == year && (evalDate.getMonth() + 1) == parseInt(monthNum)) {
                count++;
            }
        }
    });
    
    return count;
}

// Get unique clinics from patient data
function getUniqueClinics() {
    const clinics = new Set();
    
    patients.forEach(patient => {
        if (patient.clinicName) {
            clinics.add(patient.clinicName);
        }
        if (patient.appointments && Array.isArray(patient.appointments)) {
            patient.appointments.forEach(apt => {
                if (apt.clinicName) clinics.add(apt.clinicName);
            });
        }
    });
    
    return Array.from(clinics).sort();
}

// Generate month options for the last 12 months
function generateMonthOptions() {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthValue = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        months.push({ value: monthValue, label: monthLabel });
    }
    
    return months;
}

// Render enhanced dashboard with KPIs
function renderEnhancedDashboard() {
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    // Get filter values
    const selectedMonth = document.getElementById('dashboardMonthFilter')?.value || currentMonth;
    const selectedClinic = document.getElementById('dashboardClinicFilter')?.value || 'all';
    
    // Calculate KPIs
    const kpis = calculateDashboardKPIs(selectedMonth, selectedClinic);
    
    // Update dashboard content
    const dashboardContent = document.getElementById('dashboard-content');
    if (!dashboardContent) return;
    
    dashboardContent.innerHTML = `
        <!-- Dashboard Filters -->
        <div class="row mb-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h5><i class="fas fa-filter"></i> Dashboard Filters</h5>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <label for="dashboardMonthFilter" class="form-label">Month</label>
                                <select class="form-select" id="dashboardMonthFilter" onchange="renderEnhancedDashboard()">
                                    <option value="all">All Time</option>
                                    ${generateMonthOptions().map(month => 
                                        `<option value="${month.value}" ${month.value === selectedMonth ? 'selected' : ''}>${month.label}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label for="dashboardClinicFilter" class="form-label">Clinic</label>
                                <select class="form-select" id="dashboardClinicFilter" onchange="renderEnhancedDashboard()">
                                    <option value="all">All Clinics</option>
                                    ${getUniqueClinics().map(clinic => 
                                        `<option value="${clinic}" ${clinic === selectedClinic ? 'selected' : ''}>${clinic}</option>`
                                    ).join('')}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- KPI Cards -->
        <div class="row mb-4">
            <!-- Patient Metrics -->
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="card bg-primary text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h3 class="mb-0">${kpis.patientsWithUpcoming}</h3>
                                <p class="mb-0">Patients with Upcoming</p>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-calendar-check fa-2x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="card bg-warning text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h3 class="mb-0">${kpis.patientsWithoutUpcoming}</h3>
                                <p class="mb-0">No Upcoming Appointments</p>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-calendar-times fa-2x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Claims Metrics -->
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="card bg-success text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h3 class="mb-0">${kpis.claimsPaid}</h3>
                                <p class="mb-0">Claims Paid</p>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-dollar-sign fa-2x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="card bg-danger text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h3 class="mb-0">${kpis.claimsUnpaid}</h3>
                                <p class="mb-0">Unpaid Claims</p>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-exclamation-triangle fa-2x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Provider & Session Metrics -->
        <div class="row mb-4">
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="card bg-info text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h3 class="mb-0">${kpis.providersWithAvailability}</h3>
                                <p class="mb-0">Providers Available</p>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-user-md fa-2x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="card bg-secondary text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h3 class="mb-0">${kpis.providersCredentialed}</h3>
                                <p class="mb-0">Providers Credentialed</p>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-certificate fa-2x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="card bg-dark text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h3 class="mb-0">${kpis.sessionsPerMonth}</h3>
                                <p class="mb-0">Sessions This Month</p>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-clipboard-list fa-2x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="card bg-purple text-white" style="background-color: #6f42c1 !important;">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h3 class="mb-0">${kpis.initialEvaluationsPerMonth}</h3>
                                <p class="mb-0">Initial Evaluations</p>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-stethoscope fa-2x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Summary Statistics -->
        <div class="row mb-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h5><i class="fas fa-chart-bar"></i> Summary Statistics</h5>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-3">
                                <div class="text-center">
                                    <h4 class="text-primary">${kpis.totalPatients}</h4>
                                    <p class="mb-0">Total Patients</p>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="text-center">
                                    <h4 class="text-success">${kpis.totalProviders}</h4>
                                    <p class="mb-0">Total Providers</p>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="text-center">
                                    <h4 class="text-info">${kpis.averageSessionsPerPatient}</h4>
                                    <p class="mb-0">Avg Sessions/Patient</p>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="text-center">
                                    <h4 class="text-warning">${kpis.utilizationRate}%</h4>
                                    <p class="mb-0">Provider Utilization</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h5><i class="fas fa-bolt"></i> Quick Actions</h5>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-3 mb-2">
                                <button class="btn btn-primary w-100" onclick="showSection('patients'); addNewPatient()">
                                    <i class="fas fa-user-plus"></i> Add New Patient
                                </button>
                            </div>
                            <div class="col-md-3 mb-2">
                                <button class="btn btn-success w-100" onclick="showSection('providers'); addNewProvider()">
                                    <i class="fas fa-user-md"></i> Add New Provider
                                </button>
                            </div>
                            <div class="col-md-3 mb-2">
                                <button class="btn btn-info w-100" onclick="showUtilizationDashboard()">
                                    <i class="fas fa-chart-bar"></i> Provider Utilization
                                </button>
                            </div>
                            <div class="col-md-3 mb-2">
                                <button class="btn btn-warning w-100" onclick="exportDashboardReport('${selectedMonth}', '${selectedClinic}')">
                                    <i class="fas fa-file-export"></i> Export Report
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Export dashboard report
function exportDashboardReport(month, clinic) {
    const kpis = calculateDashboardKPIs(month, clinic);
    const monthLabel = month === 'all' ? 'All Time' : 
        new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    const clinicLabel = clinic === 'all' ? 'All Clinics' : clinic;
    
    const reportData = [{
        'Report Date': new Date().toLocaleDateString(),
        'Month': monthLabel,
        'Clinic': clinicLabel,
        'Total Patients': kpis.totalPatients,
        'Patients with Upcoming': kpis.patientsWithUpcoming,
        'Patients without Upcoming': kpis.patientsWithoutUpcoming,
        'Claims Paid': kpis.claimsPaid,
        'Claims Unpaid': kpis.claimsUnpaid,
        'Providers Available': kpis.providersWithAvailability,
        'Providers Credentialed': kpis.providersCredentialed,
        'Sessions This Month': kpis.sessionsPerMonth,
        'Initial Evaluations': kpis.initialEvaluationsPerMonth,
        'Average Sessions per Patient': kpis.averageSessionsPerPatient,
        'Provider Utilization Rate': kpis.utilizationRate + '%'
    }];
    
    exportToCSV(reportData, `home-care-dashboard-report-${month}-${clinic}`);
}

// Generic CSV export utility function
function exportToCSV(data, filename = 'export') {
    if (!data || data.length === 0) {
        console.warn('No data to export');
        showAlert('No data available to export', 'warning');
        return;
    }
    
    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    
    // Add data rows
    data.forEach(row => {
        const values = headers.map(header => {
            let value = row[header] || '';
            // Escape commas and quotes in values
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                value = '"' + value.replace(/"/g, '""') + '"';
            }
            return value;
        });
        csvContent += values.join(',') + '\n';
    });
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success message
    if (typeof showAlert === 'function') {
        showAlert('Report exported successfully!', 'success');
    }
}
