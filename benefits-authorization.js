// Benefits & Authorization Management Module
// Handles insurance verification, authorization tracking, and alerts

// Global variables for benefits and authorization data
let benefitsVerifications = JSON.parse(localStorage.getItem('benefitsVerifications')) || [];
let authorizationRequests = JSON.parse(localStorage.getItem('authorizationRequests')) || [];

// Initialize Benefits & Authorization Module
function initializeBenefitsModule() {
    console.log('Initializing Benefits & Authorization Module');
    loadBenefitsData();
    setupBenefitsEventListeners();
    checkExpiringAuthorizations();
}

// Load benefits data from localStorage
function loadBenefitsData() {
    benefitsVerifications = JSON.parse(localStorage.getItem('benefitsVerifications')) || [];
    authorizationRequests = JSON.parse(localStorage.getItem('authorizationRequests')) || [];
}

// Save benefits data to localStorage
function saveBenefitsData() {
    localStorage.setItem('benefitsVerifications', JSON.stringify(benefitsVerifications));
    localStorage.setItem('authorizationRequests', JSON.stringify(authorizationRequests));
}

// Add new benefits verification
function addBenefitsVerification(patientId, insuranceInfo) {
    const verification = {
        id: Date.now() + Math.random(),
        patientId: patientId,
        patientName: getPatientName(patientId),
        insuranceName: insuranceInfo.insuranceName,
        memberID: insuranceInfo.memberID,
        groupNumber: insuranceInfo.groupNumber,
        verificationDate: new Date().toISOString(),
        status: 'pending', // pending, verified, denied, expired
        benefits: {
            ptCoverage: null,
            copay: null,
            deductible: null,
            maxVisits: null,
            remainingVisits: null
        },
        notes: '',
        expirationDate: null,
        lastUpdated: new Date().toISOString()
    };
    
    benefitsVerifications.push(verification);
    saveBenefitsData();
    return verification;
}

// Add new authorization request
function addAuthorizationRequest(patientId, authDetails) {
    const authorization = {
        id: Date.now() + Math.random(),
        patientId: patientId,
        patientName: getPatientName(patientId),
        requestDate: new Date().toISOString(),
        status: 'submitted', // submitted, pending, approved, denied, expired
        authNumber: '',
        requestedVisits: authDetails.requestedVisits || 0,
        approvedVisits: 0,
        startDate: authDetails.startDate,
        endDate: authDetails.endDate,
        diagnosis: authDetails.diagnosis || '',
        notes: authDetails.notes || '',
        lastUpdated: new Date().toISOString()
    };
    
    authorizationRequests.push(authorization);
    saveBenefitsData();
    return authorization;
}

// Update benefits verification
function updateBenefitsVerification(verificationId, updates) {
    const index = benefitsVerifications.findIndex(v => v.id === verificationId);
    if (index !== -1) {
        benefitsVerifications[index] = { ...benefitsVerifications[index], ...updates };
        benefitsVerifications[index].lastUpdated = new Date().toISOString();
        saveBenefitsData();
        return benefitsVerifications[index];
    }
    return null;
}

// Update authorization request
function updateAuthorizationRequest(authId, updates) {
    const index = authorizationRequests.findIndex(a => a.id === authId);
    if (index !== -1) {
        authorizationRequests[index] = { ...authorizationRequests[index], ...updates };
        authorizationRequests[index].lastUpdated = new Date().toISOString();
        saveBenefitsData();
        return authorizationRequests[index];
    }
    return null;
}

// Get patient name by ID
function getPatientName(patientId) {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
}

// Check for expiring authorizations
function checkExpiringAuthorizations() {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    const expiringAuths = authorizationRequests.filter(auth => {
        if (!auth.endDate || auth.status !== 'approved') return false;
        const endDate = new Date(auth.endDate);
        return endDate <= thirtyDaysFromNow && endDate > today;
    });
    
    if (expiringAuths.length > 0) {
        showExpirationAlert(expiringAuths);
    }
}

// Show expiration alert
function showExpirationAlert(expiringAuths) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-warning alert-dismissible fade show';
    alertDiv.innerHTML = `
        <strong>Authorization Alert!</strong> ${expiringAuths.length} authorization(s) expiring within 30 days.
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const dashboardContent = document.getElementById('dashboard');
    if (dashboardContent) {
        dashboardContent.insertBefore(alertDiv, dashboardContent.firstChild);
    }
}

// Setup event listeners
function setupBenefitsEventListeners() {
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeBenefitsModule);
    } else {
        initializeBenefitsModule();
    }
}

// UI Functions for Benefits & Authorization

// Render benefits verification table
function renderBenefitsVerificationTable() {
    const tableBody = document.getElementById('benefitsVerificationTable');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    benefitsVerifications.forEach(verification => {
        const row = document.createElement('tr');
        const statusBadge = getStatusBadge(verification.status);
        const benefitsInfo = formatBenefitsInfo(verification.benefits);
        
        row.innerHTML = `
            <td>
                <strong>${verification.patientName}</strong><br>
                <small class="text-muted">ID: ${verification.patientId}</small>
            </td>
            <td>
                <strong>${verification.insuranceName}</strong><br>
                <small>Member: ${verification.memberID}</small>
            </td>
            <td>${statusBadge}</td>
            <td>${new Date(verification.verificationDate).toLocaleDateString()}</td>
            <td>${benefitsInfo}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editBenefitsVerification('${verification.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteBenefitsVerification('${verification.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Render authorization requests table
function renderAuthorizationRequestsTable() {
    const tableBody = document.getElementById('authorizationRequestsTable');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    authorizationRequests.forEach(auth => {
        const row = document.createElement('tr');
        const statusBadge = getStatusBadge(auth.status);
        
        row.innerHTML = `
            <td>
                <strong>${auth.patientName}</strong><br>
                <small class="text-muted">ID: ${auth.patientId}</small>
            </td>
            <td>${auth.authNumber || 'Pending'}</td>
            <td>${statusBadge}</td>
            <td>${auth.approvedVisits}/${auth.requestedVisits}</td>
            <td>${auth.startDate ? new Date(auth.startDate).toLocaleDateString() : 'N/A'}</td>
            <td>${auth.endDate ? new Date(auth.endDate).toLocaleDateString() : 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editAuthorizationRequest('${auth.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteAuthorizationRequest('${auth.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Get status badge HTML
function getStatusBadge(status) {
    const statusClasses = {
        'pending': 'bg-warning',
        'verified': 'bg-success',
        'approved': 'bg-success',
        'denied': 'bg-danger',
        'expired': 'bg-secondary',
        'submitted': 'bg-info'
    };
    
    const className = statusClasses[status] || 'bg-secondary';
    return `<span class="badge ${className}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;
}

// Format benefits information
function formatBenefitsInfo(benefits) {
    if (!benefits.ptCoverage) return 'Not verified';
    
    return `
        <small>
            Coverage: ${benefits.ptCoverage}<br>
            Copay: $${benefits.copay || 'N/A'}<br>
            Visits: ${benefits.remainingVisits || 'N/A'}/${benefits.maxVisits || 'N/A'}
        </small>
    `;
}

// Show benefits verification modal
function addBenefitsVerification() {
    showBenefitsVerificationModal();
}

// Show authorization request modal
function addAuthorizationRequest() {
    showAuthorizationRequestModal();
}

// Show benefits verification modal
function showBenefitsVerificationModal(verificationId = null) {
    const isEdit = verificationId !== null;
    const verification = isEdit ? benefitsVerifications.find(v => v.id === verificationId) : null;
    
    const modalHTML = `
        <div class="modal fade" id="benefitsVerificationModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${isEdit ? 'Edit' : 'Add'} Benefits Verification</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="benefitsVerificationForm">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Patient</label>
                                        <select class="form-select" id="patientSelect" required>
                                            <option value="">Select Patient</option>
                                            ${patients.map(p => `
                                                <option value="${p.id}" ${verification && verification.patientId === p.id ? 'selected' : ''}>
                                                    ${p.firstName} ${p.lastName}
                                                </option>
                                            `).join('')}
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Insurance Name</label>
                                        <input type="text" class="form-control" id="insuranceName" 
                                               value="${verification ? verification.insuranceName : ''}" required>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Member ID</label>
                                        <input type="text" class="form-control" id="memberID" 
                                               value="${verification ? verification.memberID : ''}" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Group Number</label>
                                        <input type="text" class="form-control" id="groupNumber" 
                                               value="${verification ? verification.groupNumber : ''}">
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Status</label>
                                        <select class="form-select" id="verificationStatus" required>
                                            <option value="pending" ${verification && verification.status === 'pending' ? 'selected' : ''}>Pending</option>
                                            <option value="verified" ${verification && verification.status === 'verified' ? 'selected' : ''}>Verified</option>
                                            <option value="denied" ${verification && verification.status === 'denied' ? 'selected' : ''}>Denied</option>
                                            <option value="expired" ${verification && verification.status === 'expired' ? 'selected' : ''}>Expired</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">PT Coverage</label>
                                        <input type="text" class="form-control" id="ptCoverage" 
                                               value="${verification && verification.benefits ? verification.benefits.ptCoverage || '' : ''}">
                                    </div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Notes</label>
                                <textarea class="form-control" id="verificationNotes" rows="3">${verification ? verification.notes : ''}</textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="saveBenefitsVerification('${verificationId || ''}')">
                            ${isEdit ? 'Update' : 'Save'} Verification
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('benefitsVerificationModal');
    if (existingModal) existingModal.remove();
    
    // Add modal to DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('benefitsVerificationModal'));
    modal.show();
}

// Save benefits verification
function saveBenefitsVerification(verificationId) {
    const form = document.getElementById('benefitsVerificationForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const formData = {
        patientId: document.getElementById('patientSelect').value,
        insuranceName: document.getElementById('insuranceName').value,
        memberID: document.getElementById('memberID').value,
        groupNumber: document.getElementById('groupNumber').value,
        status: document.getElementById('verificationStatus').value,
        benefits: {
            ptCoverage: document.getElementById('ptCoverage').value
        },
        notes: document.getElementById('verificationNotes').value
    };
    
    if (verificationId) {
        updateBenefitsVerification(verificationId, formData);
    } else {
        addBenefitsVerification(formData.patientId, formData);
    }
    
    // Close modal and refresh table
    bootstrap.Modal.getInstance(document.getElementById('benefitsVerificationModal')).hide();
    renderBenefitsVerificationTable();
}

// Edit benefits verification
function editBenefitsVerification(verificationId) {
    showBenefitsVerificationModal(verificationId);
}

// Delete benefits verification
function deleteBenefitsVerification(verificationId) {
    if (confirm('Are you sure you want to delete this benefits verification?')) {
        const index = benefitsVerifications.findIndex(v => v.id == verificationId);
        if (index !== -1) {
            benefitsVerifications.splice(index, 1);
            saveBenefitsData();
            renderBenefitsVerificationTable();
        }
    }
}

// Show authorization request modal
function showAuthorizationRequestModal(authId = null) {
    const isEdit = authId !== null;
    const auth = isEdit ? authorizationRequests.find(a => a.id == authId) : null;
    
    const modalHTML = `
        <div class="modal fade" id="authorizationRequestModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${isEdit ? 'Edit' : 'Add'} Authorization Request</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="authorizationRequestForm">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Patient</label>
                                        <select class="form-select" id="authPatientSelect" required>
                                            <option value="">Select Patient</option>
                                            ${patients.map(p => `
                                                <option value="${p.id}" ${auth && auth.patientId == p.id ? 'selected' : ''}>
                                                    ${p.firstName} ${p.lastName}
                                                </option>
                                            `).join('')}
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Authorization Number</label>
                                        <input type="text" class="form-control" id="authNumber" 
                                               value="${auth ? auth.authNumber || '' : ''}">
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label class="form-label">Status</label>
                                        <select class="form-select" id="authStatus" required>
                                            <option value="submitted" ${auth && auth.status === 'submitted' ? 'selected' : ''}>Submitted</option>
                                            <option value="pending" ${auth && auth.status === 'pending' ? 'selected' : ''}>Pending</option>
                                            <option value="approved" ${auth && auth.status === 'approved' ? 'selected' : ''}>Approved</option>
                                            <option value="denied" ${auth && auth.status === 'denied' ? 'selected' : ''}>Denied</option>
                                            <option value="expired" ${auth && auth.status === 'expired' ? 'selected' : ''}>Expired</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label class="form-label">Requested Visits</label>
                                        <input type="number" class="form-control" id="requestedVisits" 
                                               value="${auth ? auth.requestedVisits || 0 : 0}" required>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label class="form-label">Approved Visits</label>
                                        <input type="number" class="form-control" id="approvedVisits" 
                                               value="${auth ? auth.approvedVisits || 0 : 0}">
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Start Date</label>
                                        <input type="date" class="form-control" id="authStartDate" 
                                               value="${auth && auth.startDate ? auth.startDate.split('T')[0] : ''}">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">End Date</label>
                                        <input type="date" class="form-control" id="authEndDate" 
                                               value="${auth && auth.endDate ? auth.endDate.split('T')[0] : ''}">
                                    </div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Diagnosis</label>
                                <input type="text" class="form-control" id="authDiagnosis" 
                                       value="${auth ? auth.diagnosis || '' : ''}">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Notes</label>
                                <textarea class="form-control" id="authNotes" rows="3">${auth ? auth.notes || '' : ''}</textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="saveAuthorizationRequest('${authId || ''}')">
                            ${isEdit ? 'Update' : 'Save'} Authorization
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('authorizationRequestModal');
    if (existingModal) existingModal.remove();
    
    // Add modal to DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('authorizationRequestModal'));
    modal.show();
}

// Save authorization request
function saveAuthorizationRequest(authId) {
    const form = document.getElementById('authorizationRequestForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const formData = {
        patientId: document.getElementById('authPatientSelect').value,
        authNumber: document.getElementById('authNumber').value,
        status: document.getElementById('authStatus').value,
        requestedVisits: parseInt(document.getElementById('requestedVisits').value) || 0,
        approvedVisits: parseInt(document.getElementById('approvedVisits').value) || 0,
        startDate: document.getElementById('authStartDate').value,
        endDate: document.getElementById('authEndDate').value,
        diagnosis: document.getElementById('authDiagnosis').value,
        notes: document.getElementById('authNotes').value
    };
    
    if (authId) {
        updateAuthorizationRequest(authId, formData);
    } else {
        addAuthorizationRequest(formData.patientId, formData);
    }
    
    // Close modal and refresh table
    bootstrap.Modal.getInstance(document.getElementById('authorizationRequestModal')).hide();
    renderAuthorizationRequestsTable();
    renderAlertsTab();
}

// Edit authorization request
function editAuthorizationRequest(authId) {
    showAuthorizationRequestModal(authId);
}

// Delete authorization request
function deleteAuthorizationRequest(authId) {
    if (confirm('Are you sure you want to delete this authorization request?')) {
        const index = authorizationRequests.findIndex(a => a.id == authId);
        if (index !== -1) {
            authorizationRequests.splice(index, 1);
            saveBenefitsData();
            renderAuthorizationRequestsTable();
            renderAlertsTab();
        }
    }
}

// Render alerts tab
function renderAlertsTab() {
    const alertsContainer = document.getElementById('alertsContainer');
    if (!alertsContainer) return;
    
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    const expiringAuths = authorizationRequests.filter(auth => {
        if (!auth.endDate || auth.status !== 'approved') return false;
        const endDate = new Date(auth.endDate);
        return endDate <= thirtyDaysFromNow && endDate > today;
    });
    
    const expiredAuths = authorizationRequests.filter(auth => {
        if (!auth.endDate) return false;
        const endDate = new Date(auth.endDate);
        return endDate <= today;
    });
    
    let alertsHTML = '';
    
    if (expiringAuths.length > 0) {
        alertsHTML += `
            <div class="alert alert-warning">
                <h6><i class="fas fa-exclamation-triangle"></i> Authorizations Expiring Soon (${expiringAuths.length})</h6>
                <ul class="mb-0">
                    ${expiringAuths.map(auth => {
                        const daysLeft = Math.ceil((new Date(auth.endDate) - today) / (1000 * 60 * 60 * 24));
                        return `<li>${auth.patientName} - Auth #${auth.authNumber || 'Pending'} expires in ${daysLeft} days (${new Date(auth.endDate).toLocaleDateString()})</li>`;
                    }).join('')}
                </ul>
            </div>
        `;
    }
    
    if (expiredAuths.length > 0) {
        alertsHTML += `
            <div class="alert alert-danger">
                <h6><i class="fas fa-times-circle"></i> Expired Authorizations (${expiredAuths.length})</h6>
                <ul class="mb-0">
                    ${expiredAuths.map(auth => {
                        return `<li>${auth.patientName} - Auth #${auth.authNumber || 'Pending'} expired on ${new Date(auth.endDate).toLocaleDateString()}</li>`;
                    }).join('')}
                </ul>
            </div>
        `;
    }
    
    if (alertsHTML === '') {
        alertsHTML = `
            <div class="alert alert-success">
                <h6><i class="fas fa-check-circle"></i> No Authorization Alerts</h6>
                <p class="mb-0">All authorizations are current and no renewals are needed within the next 30 days.</p>
            </div>
        `;
    }
    
    alertsContainer.innerHTML = alertsHTML;
}

// Initialize Benefits Module when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeBenefitsModule();
    
    // Set up event listener for when benefits section becomes visible
    const originalShowSection = window.showSection;
    window.showSection = function(sectionId) {
        if (originalShowSection) {
            originalShowSection(sectionId);
        }
        
        if (sectionId === 'benefits') {
            setTimeout(() => {
                renderBenefitsVerificationTable();
                renderAuthorizationRequestsTable();
                renderAlertsTab();
            }, 100);
        }
    };
});

// Global functions for button clicks
window.addBenefitsVerification = function() {
    showBenefitsVerificationModal();
};

window.addAuthorizationRequest = function() {
    showAuthorizationRequestModal();
};

window.editBenefitsVerification = function(verificationId) {
    showBenefitsVerificationModal(verificationId);
};

window.deleteBenefitsVerification = function(verificationId) {
    if (confirm('Are you sure you want to delete this benefits verification?')) {
        const index = benefitsVerifications.findIndex(v => v.id == verificationId);
        if (index !== -1) {
            benefitsVerifications.splice(index, 1);
            saveBenefitsData();
            renderBenefitsVerificationTable();
        }
    }
};

window.editAuthorizationRequest = function(authId) {
    showAuthorizationRequestModal(authId);
};

window.deleteAuthorizationRequest = function(authId) {
    if (confirm('Are you sure you want to delete this authorization request?')) {
        const index = authorizationRequests.findIndex(a => a.id == authId);
        if (index !== -1) {
            authorizationRequests.splice(index, 1);
            saveBenefitsData();
            renderAuthorizationRequestsTable();
            renderAlertsTab();
        }
    }
};

window.saveBenefitsVerification = function(verificationId) {
    const form = document.getElementById('benefitsVerificationForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const formData = {
        patientId: document.getElementById('patientSelect').value,
        insuranceName: document.getElementById('insuranceName').value,
        memberID: document.getElementById('memberID').value,
        groupNumber: document.getElementById('groupNumber').value,
        status: document.getElementById('verificationStatus').value,
        benefits: {
            ptCoverage: document.getElementById('ptCoverage').value
        },
        notes: document.getElementById('verificationNotes').value
    };
    
    if (verificationId) {
        updateBenefitsVerification(verificationId, formData);
    } else {
        addBenefitsVerification(formData.patientId, formData);
    }
    
    // Close modal and refresh table
    bootstrap.Modal.getInstance(document.getElementById('benefitsVerificationModal')).hide();
    renderBenefitsVerificationTable();
};

window.saveAuthorizationRequest = function(authId) {
    const form = document.getElementById('authorizationRequestForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const formData = {
        patientId: document.getElementById('authPatientSelect').value,
        authNumber: document.getElementById('authNumber').value,
        status: document.getElementById('authStatus').value,
        requestedVisits: parseInt(document.getElementById('requestedVisits').value) || 0,
        approvedVisits: parseInt(document.getElementById('approvedVisits').value) || 0,
        startDate: document.getElementById('authStartDate').value,
        endDate: document.getElementById('authEndDate').value,
        diagnosis: document.getElementById('authDiagnosis').value,
        notes: document.getElementById('authNotes').value
    };
    
    if (authId) {
        updateAuthorizationRequest(authId, formData);
    } else {
        addAuthorizationRequest(formData.patientId, formData);
    }
    
    // Close modal and refresh table
    bootstrap.Modal.getInstance(document.getElementById('authorizationRequestModal')).hide();
    renderAuthorizationRequestsTable();
    renderAlertsTab();
};

// Export functions for global access
window.benefitsModule = {
    addBenefitsVerification,
    addAuthorizationRequest,
    updateBenefitsVerification,
    updateAuthorizationRequest,
    checkExpiringAuthorizations,
    loadBenefitsData,
    saveBenefitsData,
    renderBenefitsVerificationTable,
    renderAuthorizationRequestsTable
};
