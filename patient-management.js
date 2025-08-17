// Patient Management Module
// Handles patient data display, filtering, and CRUD operations

// Initialize patient management when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Load sample patients into localStorage if not exists
    if (!localStorage.getItem('patients')) {
        localStorage.setItem('patients', JSON.stringify(samplePatients));
    }
    
    // Render patients table when patients section is shown
    if (document.getElementById('patients').classList.contains('active')) {
        renderPatientsTable();
    }
});

// Render patients table with data (prioritizing imported data)
function renderPatientsTable() {
    console.log('=== renderPatientsTable called ===');
    
    // Use centralized data access that prioritizes imported data over sample data
    const patients = typeof getPatientData === 'function' ? getPatientData() : JSON.parse(localStorage.getItem('patients') || '[]');
    
    // Log data source for debugging
    const hasImported = typeof hasImportedData === 'function' ? hasImportedData() : false;
    console.log('Patient table using data source:', hasImported ? 'IMPORTED DATA' : 'SAMPLE DATA');
    const tableBody = document.getElementById('patientsTableBody');
    
    if (!tableBody) {
        console.error('Patients table body not found');
        return;
    }
    
    console.log('Current patients array:', patients);
    
    if (patients.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted py-4">
                    <i class="fas fa-users fa-2x mb-2"></i><br>
                    No patients found. <a href="#" onclick="addNewPatient()">Add your first patient</a>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = patients.map(patient => {
        const statusBadge = getStatusBadge(patient.status);
        return `
            <tr>
                <td>
                    <strong>${patient.firstName} ${patient.lastName}</strong><br>
                    <small class="text-muted">${patient.email}</small>
                </td>
                <td>${patient.contactNumber}</td>
                <td>${patient.primaryInsurance}</td>
                <td>${statusBadge}</td>
                <td>${patient.assignedPT || 'Not Assigned'}</td>
                <td>${formatDate(patient.lastContact)}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="viewPatient(${patient.id})" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-success" onclick="editPatient(${patient.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="deletePatient(${patient.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    console.log('Patients table rendered successfully');
}

// Get status badge HTML
function getStatusBadge(status) {
    const badges = {
        'interested': '<span class="badge bg-info">Interested</span>',
        'scheduled': '<span class="badge bg-warning">Scheduled</span>',
        'in-progress': '<span class="badge bg-primary">In Progress</span>',
        'completed': '<span class="badge bg-success">Completed</span>',
        'cancelled': '<span class="badge bg-danger">Cancelled</span>'
    };
    return badges[status] || '<span class="badge bg-secondary">Unknown</span>';
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

// Filter patients based on search and filter criteria
function filterPatients() {
    const statusFilter = document.getElementById('statusFilter').value;
    const insuranceFilter = document.getElementById('insuranceFilter').value;
    const searchTerm = document.getElementById('searchPatients').value.toLowerCase();
    
    const patients = JSON.parse(localStorage.getItem('patients') || '[]');
    
    let filteredPatients = patients.filter(patient => {
        // Status filter
        if (statusFilter !== 'all' && patient.status !== statusFilter) {
            return false;
        }
        
        // Insurance filter
        if (insuranceFilter !== 'all') {
            const insurance = patient.primaryInsurance.toLowerCase();
            if (insuranceFilter === 'medicare' && !insurance.includes('medicare')) return false;
            if (insuranceFilter === 'medicaid' && !insurance.includes('medicaid')) return false;
            if (insuranceFilter === 'private' && !insurance.includes('blue cross') && !insurance.includes('private')) return false;
            if (insuranceFilter === 'self-pay' && !insurance.includes('self')) return false;
        }
        
        // Search term filter
        if (searchTerm) {
            const searchFields = [
                patient.firstName,
                patient.lastName,
                patient.email,
                patient.contactNumber,
                patient.primaryInsurance,
                patient.assignedPT
            ].join(' ').toLowerCase();
            
            if (!searchFields.includes(searchTerm)) {
                return false;
            }
        }
        
        return true;
    });
    
    // Render filtered results
    renderFilteredPatients(filteredPatients);
}

// Render filtered patients
function renderFilteredPatients(patients) {
    const tableBody = document.getElementById('patientsTableBody');
    
    if (patients.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted py-4">
                    <i class="fas fa-search fa-2x mb-2"></i><br>
                    No patients match your search criteria.
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = patients.map(patient => {
        const statusBadge = getStatusBadge(patient.status);
        return `
            <tr>
                <td>
                    <strong>${patient.firstName} ${patient.lastName}</strong><br>
                    <small class="text-muted">${patient.email}</small>
                </td>
                <td>${patient.contactNumber}</td>
                <td>${patient.primaryInsurance}</td>
                <td>${statusBadge}</td>
                <td>${patient.assignedPT || 'Not Assigned'}</td>
                <td>${formatDate(patient.lastContact)}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="viewPatient(${patient.id})" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-success" onclick="editPatient(${patient.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="deletePatient(${patient.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Clear all filters
function clearFilters() {
    document.getElementById('statusFilter').value = 'all';
    document.getElementById('insuranceFilter').value = 'all';
    document.getElementById('searchPatients').value = '';
    renderPatientsTable();
}

// Add new patient
function addNewPatient() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Add New Patient</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="addPatientForm">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">First Name *</label>
                                    <input type="text" class="form-control" name="firstName" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Last Name *</label>
                                    <input type="text" class="form-control" name="lastName" required>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Phone Number *</label>
                                    <input type="tel" class="form-control" name="contactNumber" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-control" name="email">
                                </div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Address</label>
                            <input type="text" class="form-control" name="address">
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Primary Insurance *</label>
                                    <select class="form-select" name="primaryInsurance" required>
                                        <option value="">Select Insurance</option>
                                        <option value="Medicare">Medicare</option>
                                        <option value="Medicaid">Medicaid</option>
                                        <option value="Blue Cross Blue Shield">Blue Cross Blue Shield</option>
                                        <option value="Private Insurance">Private Insurance</option>
                                        <option value="Self Pay">Self Pay</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Status</label>
                                    <select class="form-select" name="status">
                                        <option value="interested">Interested</option>
                                        <option value="scheduled">Scheduled</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" onclick="saveNewPatient()">Save Patient</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    // Clean up modal when closed
    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

// Save new patient
function saveNewPatient() {
    const form = document.getElementById('addPatientForm');
    const formData = new FormData(form);
    
    const patients = JSON.parse(localStorage.getItem('patients') || '[]');
    const newId = Math.max(...patients.map(p => p.id), 1000) + 1;
    
    const newPatient = {
        id: newId,
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        contactNumber: formData.get('contactNumber'),
        email: formData.get('email') || '',
        address: formData.get('address') || '',
        primaryInsurance: formData.get('primaryInsurance'),
        status: formData.get('status') || 'interested',
        assignedPT: 'Not Assigned',
        lastContact: new Date().toISOString().split('T')[0],
        dateAdded: new Date().toISOString()
    };
    
    patients.push(newPatient);
    localStorage.setItem('patients', JSON.stringify(patients));
    
    // Close modal and refresh table
    const modal = bootstrap.Modal.getInstance(document.querySelector('.modal'));
    modal.hide();
    
    renderPatientsTable();
    
    // Show success message
    showAlert('Patient added successfully!', 'success');
}

// View patient details
function viewPatient(patientId) {
    const patients = JSON.parse(localStorage.getItem('patients') || '[]');
    const patient = patients.find(p => p.id === patientId);
    
    if (!patient) {
        showAlert('Patient not found!', 'error');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Patient Details</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h6>Personal Information</h6>
                            <p><strong>Name:</strong> ${patient.firstName} ${patient.lastName}</p>
                            <p><strong>Phone:</strong> ${patient.contactNumber}</p>
                            <p><strong>Email:</strong> ${patient.email || 'Not provided'}</p>
                            <p><strong>Address:</strong> ${patient.address || 'Not provided'}</p>
                        </div>
                        <div class="col-md-6">
                            <h6>Care Information</h6>
                            <p><strong>Status:</strong> ${getStatusBadge(patient.status)}</p>
                            <p><strong>Primary Insurance:</strong> ${patient.primaryInsurance}</p>
                            <p><strong>Assigned PT:</strong> ${patient.assignedPT || 'Not Assigned'}</p>
                            <p><strong>Last Contact:</strong> ${formatDate(patient.lastContact)}</p>
                            <p><strong>Date Added:</strong> ${formatDate(patient.dateAdded)}</p>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" onclick="editPatient(${patient.id}); bootstrap.Modal.getInstance(this.closest('.modal')).hide();">Edit Patient</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    // Clean up modal when closed
    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

// Edit patient
function editPatient(patientId) {
    const patients = JSON.parse(localStorage.getItem('patients') || '[]');
    const patient = patients.find(p => p.id === patientId);
    
    if (!patient) {
        showAlert('Patient not found!', 'error');
        return;
    }
    
    // Implementation for edit patient modal would go here
    showAlert('Edit functionality coming soon!', 'info');
}

// Delete patient
function deletePatient(patientId) {
    if (!confirm('Are you sure you want to delete this patient?')) {
        return;
    }
    
    const patients = JSON.parse(localStorage.getItem('patients') || '[]');
    const filteredPatients = patients.filter(p => p.id !== patientId);
    
    localStorage.setItem('patients', JSON.stringify(filteredPatients));
    renderPatientsTable();
    
    showAlert('Patient deleted successfully!', 'success');
}

// Export patients data
function exportPatients() {
    const patients = JSON.parse(localStorage.getItem('patients') || '[]');
    
    if (patients.length === 0) {
        showAlert('No patients to export!', 'warning');
        return;
    }
    
    // Create CSV content
    const headers = ['Name', 'Phone', 'Email', 'Insurance', 'Status', 'Assigned PT', 'Last Contact'];
    const csvContent = [
        headers.join(','),
        ...patients.map(patient => [
            `"${patient.firstName} ${patient.lastName}"`,
            `"${patient.contactNumber}"`,
            `"${patient.email || ''}"`,
            `"${patient.primaryInsurance}"`,
            `"${patient.status}"`,
            `"${patient.assignedPT || 'Not Assigned'}"`,
            `"${formatDate(patient.lastContact)}"`
        ].join(','))
    ].join('\n');
    
    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patients_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showAlert('Patients exported successfully!', 'success');
}

// Show alert message
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}
