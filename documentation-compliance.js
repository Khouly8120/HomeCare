// Documentation Compliance Management Module
// Handles medical document completion tracking, automated reminders, and compliance monitoring

// Global variables for documentation data
let documentationData = JSON.parse(localStorage.getItem('documentationData')) || {
    documentRequirements: [],
    patientDocuments: [],
    complianceAlerts: []
};

// Document types and requirements
const documentTypes = [
    { id: 'initial_eval', name: 'Initial Evaluation', required: true, daysToComplete: 3 },
    { id: 'treatment_plan', name: 'Treatment Plan', required: true, daysToComplete: 5 },
    { id: 'progress_notes', name: 'Progress Notes', required: true, daysToComplete: 1 },
    { id: 'discharge_summary', name: 'Discharge Summary', required: true, daysToComplete: 2 },
    { id: 'insurance_card', name: 'Insurance Card Copy', required: true, daysToComplete: 1 },
    { id: 'physician_orders', name: 'Physician Orders', required: true, daysToComplete: 1 },
    { id: 'consent_forms', name: 'Consent Forms', required: true, daysToComplete: 1 },
    { id: 'hipaa_forms', name: 'HIPAA Forms', required: true, daysToComplete: 1 }
];

// Initialize Documentation Compliance Module
function initializeDocumentationModule() {
    console.log('Initializing Documentation Compliance Module');
    loadDocumentationData();
    generateDocumentRequirements();
    checkComplianceAlerts();
}

// Load documentation data from localStorage
function loadDocumentationData() {
    documentationData = JSON.parse(localStorage.getItem('documentationData')) || {
        documentRequirements: [],
        patientDocuments: [],
        complianceAlerts: []
    };
}

// Save documentation data to localStorage
function saveDocumentationData() {
    localStorage.setItem('documentationData', JSON.stringify(documentationData));
}

// Generate document requirements for all active patients
function generateDocumentRequirements() {
    const activePatients = patients.filter(p => p.status === 'active');
    
    activePatients.forEach(patient => {
        documentTypes.forEach(docType => {
            const existingReq = documentationData.documentRequirements.find(
                req => req.patientId === patient.id && req.documentType === docType.id
            );
            
            if (!existingReq) {
                const dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + docType.daysToComplete);
                
                documentationData.documentRequirements.push({
                    id: Date.now() + Math.random(),
                    patientId: patient.id,
                    patientName: `${patient.firstName} ${patient.lastName}`,
                    documentType: docType.id,
                    documentName: docType.name,
                    required: docType.required,
                    dueDate: dueDate.toISOString(),
                    status: 'pending', // pending, submitted, approved, rejected
                    createdDate: new Date().toISOString(),
                    submittedDate: null,
                    approvedDate: null,
                    notes: ''
                });
            }
        });
    });
    
    saveDocumentationData();
}

// Add or update patient document
function addPatientDocument(patientId, documentType, documentData) {
    const document = {
        id: Date.now() + Math.random(),
        patientId: patientId,
        patientName: getPatientName(patientId),
        documentType: documentType,
        documentName: getDocumentTypeName(documentType),
        fileName: documentData.fileName || '',
        fileSize: documentData.fileSize || 0,
        uploadDate: new Date().toISOString(),
        status: 'submitted',
        submittedBy: documentData.submittedBy || 'System',
        notes: documentData.notes || '',
        lastUpdated: new Date().toISOString()
    };
    
    documentationData.patientDocuments.push(document);
    
    // Update requirement status
    const requirement = documentationData.documentRequirements.find(
        req => req.patientId === patientId && req.documentType === documentType
    );
    
    if (requirement) {
        requirement.status = 'submitted';
        requirement.submittedDate = new Date().toISOString();
        requirement.lastUpdated = new Date().toISOString();
    }
    
    saveDocumentationData();
    return document;
}

// Update document status
function updateDocumentStatus(documentId, status, notes = '') {
    const document = documentationData.patientDocuments.find(doc => doc.id == documentId);
    if (!document) return null;
    
    document.status = status;
    document.notes = notes;
    document.lastUpdated = new Date().toISOString();
    
    if (status === 'approved') {
        document.approvedDate = new Date().toISOString();
        
        // Update requirement status
        const requirement = documentationData.documentRequirements.find(
            req => req.patientId === document.patientId && req.documentType === document.documentType
        );
        
        if (requirement) {
            requirement.status = 'approved';
            requirement.approvedDate = new Date().toISOString();
        }
    }
    
    saveDocumentationData();
    return document;
}

// Check compliance alerts
function checkComplianceAlerts() {
    const today = new Date();
    const alerts = [];
    
    documentationData.documentRequirements.forEach(req => {
        if (req.status === 'pending' || req.status === 'submitted') {
            const dueDate = new Date(req.dueDate);
            const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
            
            let priority = 'low';
            let alertType = 'upcoming';
            
            if (daysUntilDue < 0) {
                priority = 'high';
                alertType = 'overdue';
            } else if (daysUntilDue <= 1) {
                priority = 'high';
                alertType = 'due_today';
            } else if (daysUntilDue <= 2) {
                priority = 'medium';
                alertType = 'due_soon';
            }
            
            if (priority !== 'low') {
                alerts.push({
                    id: req.id,
                    patientId: req.patientId,
                    patientName: req.patientName,
                    documentType: req.documentType,
                    documentName: req.documentName,
                    dueDate: req.dueDate,
                    daysUntilDue,
                    status: req.status,
                    priority,
                    alertType,
                    message: generateAlertMessage(req, daysUntilDue, alertType)
                });
            }
        }
    });
    
    documentationData.complianceAlerts = alerts;
    saveDocumentationData();
    
    return alerts;
}

// Generate alert message
function generateAlertMessage(requirement, daysUntilDue, alertType) {
    const patientName = requirement.patientName;
    const docName = requirement.documentName;
    
    switch (alertType) {
        case 'overdue':
            return `${docName} for ${patientName} is ${Math.abs(daysUntilDue)} day(s) overdue`;
        case 'due_today':
            return `${docName} for ${patientName} is due today`;
        case 'due_soon':
            return `${docName} for ${patientName} is due in ${daysUntilDue} day(s)`;
        default:
            return `${docName} for ${patientName} is upcoming`;
    }
}

// Get patient name by ID
function getPatientName(patientId) {
    const patient = patients.find(p => p.id == patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
}

// Get document type name
function getDocumentTypeName(documentType) {
    const docType = documentTypes.find(dt => dt.id === documentType);
    return docType ? docType.name : documentType;
}

// Render documentation compliance dashboard
function renderDocumentationDashboard() {
    const container = document.getElementById('documentationDashboardContainer');
    if (!container) return;
    
    const alerts = checkComplianceAlerts();
    const overdue = alerts.filter(a => a.alertType === 'overdue');
    const dueToday = alerts.filter(a => a.alertType === 'due_today');
    const dueSoon = alerts.filter(a => a.alertType === 'due_soon');
    
    const totalRequirements = documentationData.documentRequirements.length;
    const completedRequirements = documentationData.documentRequirements.filter(r => r.status === 'approved').length;
    const complianceRate = totalRequirements > 0 ? Math.round((completedRequirements / totalRequirements) * 100) : 0;
    
    container.innerHTML = `
        <!-- Compliance Overview Cards -->
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card border-success">
                    <div class="card-header bg-success text-white">
                        <h6><i class="fas fa-check-circle"></i> Compliance Rate</h6>
                    </div>
                    <div class="card-body text-center">
                        <h3 class="text-success">${complianceRate}%</h3>
                        <p class="mb-0">${completedRequirements}/${totalRequirements} Complete</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card border-danger">
                    <div class="card-header bg-danger text-white">
                        <h6><i class="fas fa-exclamation-circle"></i> Overdue</h6>
                    </div>
                    <div class="card-body text-center">
                        <h3 class="text-danger">${overdue.length}</h3>
                        <p class="mb-0">Documents</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card border-warning">
                    <div class="card-header bg-warning text-white">
                        <h6><i class="fas fa-clock"></i> Due Today</h6>
                    </div>
                    <div class="card-body text-center">
                        <h3 class="text-warning">${dueToday.length}</h3>
                        <p class="mb-0">Documents</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card border-info">
                    <div class="card-header bg-info text-white">
                        <h6><i class="fas fa-calendar-alt"></i> Due Soon</h6>
                    </div>
                    <div class="card-body text-center">
                        <h3 class="text-info">${dueSoon.length}</h3>
                        <p class="mb-0">Documents</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Alerts Section -->
        ${alerts.length > 0 ? `
        <div class="row mb-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h6><i class="fas fa-bell"></i> Documentation Alerts</h6>
                    </div>
                    <div class="card-body">
                        ${alerts.map(alert => `
                            <div class="alert alert-${alert.priority === 'high' ? 'danger' : alert.priority === 'medium' ? 'warning' : 'info'} mb-2">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>${alert.message}</strong>
                                        <br><small>Due: ${new Date(alert.dueDate).toLocaleDateString()}</small>
                                    </div>
                                    <div>
                                        <button class="btn btn-sm btn-primary" onclick="markDocumentComplete('${alert.id}')">
                                            <i class="fas fa-check"></i> Mark Complete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
        ` : ''}
        
        <!-- Document Requirements Table -->
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h6><i class="fas fa-file-alt"></i> Document Requirements</h6>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Patient</th>
                                        <th>Document Type</th>
                                        <th>Status</th>
                                        <th>Due Date</th>
                                        <th>Days Until Due</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${documentationData.documentRequirements.map(req => {
                                        const dueDate = new Date(req.dueDate);
                                        const today = new Date();
                                        const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                                        const statusClass = req.status === 'approved' ? 'success' : 
                                                          req.status === 'submitted' ? 'info' : 
                                                          daysUntilDue < 0 ? 'danger' : 
                                                          daysUntilDue <= 1 ? 'warning' : 'secondary';
                                        
                                        return `
                                            <tr>
                                                <td>${req.patientName}</td>
                                                <td>${req.documentName}</td>
                                                <td><span class="badge bg-${statusClass}">${req.status.charAt(0).toUpperCase() + req.status.slice(1)}</span></td>
                                                <td>${dueDate.toLocaleDateString()}</td>
                                                <td class="text-${daysUntilDue < 0 ? 'danger' : daysUntilDue <= 1 ? 'warning' : 'muted'}">
                                                    ${daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` : 
                                                      daysUntilDue === 0 ? 'Due today' : 
                                                      `${daysUntilDue} days`}
                                                </td>
                                                <td>
                                                    ${req.status !== 'approved' ? `
                                                        <button class="btn btn-sm btn-success" onclick="markDocumentComplete('${req.id}')">
                                                            <i class="fas fa-check"></i>
                                                        </button>
                                                    ` : ''}
                                                    <button class="btn btn-sm btn-primary" onclick="editDocumentRequirement('${req.id}')">
                                                        <i class="fas fa-edit"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Mark document as complete
function markDocumentComplete(requirementId) {
    const requirement = documentationData.documentRequirements.find(req => req.id == requirementId);
    if (!requirement) return;
    
    requirement.status = 'approved';
    requirement.approvedDate = new Date().toISOString();
    requirement.lastUpdated = new Date().toISOString();
    
    saveDocumentationData();
    renderDocumentationDashboard();
}

// Edit document requirement
function editDocumentRequirement(requirementId) {
    const requirement = documentationData.documentRequirements.find(req => req.id == requirementId);
    if (!requirement) return;
    
    const newDueDate = prompt('Enter new due date (YYYY-MM-DD):', requirement.dueDate.split('T')[0]);
    if (newDueDate) {
        requirement.dueDate = new Date(newDueDate).toISOString();
        requirement.lastUpdated = new Date().toISOString();
        saveDocumentationData();
        renderDocumentationDashboard();
    }
}

// Global functions for button clicks
window.markDocumentComplete = markDocumentComplete;
window.editDocumentRequirement = editDocumentRequirement;

window.refreshDocumentation = function() {
    generateDocumentRequirements();
    renderDocumentationDashboard();
};

window.exportDocumentationReport = function() {
    const alerts = checkComplianceAlerts();
    const totalRequirements = documentationData.documentRequirements.length;
    const completedRequirements = documentationData.documentRequirements.filter(r => r.status === 'approved').length;
    const complianceRate = totalRequirements > 0 ? Math.round((completedRequirements / totalRequirements) * 100) : 0;
    
    const reportData = [
        {
            'Report Type': 'Documentation Compliance',
            'Generated Date': new Date().toLocaleDateString(),
            'Total Requirements': totalRequirements,
            'Completed Requirements': completedRequirements,
            'Compliance Rate': complianceRate + '%',
            'Overdue Documents': alerts.filter(a => a.alertType === 'overdue').length,
            'Due Today': alerts.filter(a => a.alertType === 'due_today').length,
            'Due Soon': alerts.filter(a => a.alertType === 'due_soon').length
        }
    ];
    
    exportToCSV(reportData, 'documentation-compliance-report');
};

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    initializeDocumentationModule();
    
    // Set up event listener for when documentation section becomes visible
    const originalShowSection = window.showSection;
    window.showSection = function(sectionId) {
        if (originalShowSection) {
            originalShowSection(sectionId);
        }
        
        if (sectionId === 'documentation') {
            setTimeout(() => {
                renderDocumentationDashboard();
            }, 100);
        }
    };
});

// Export functions for global access
window.documentationModule = {
    initializeDocumentationModule,
    addPatientDocument,
    updateDocumentStatus,
    checkComplianceAlerts,
    renderDocumentationDashboard,
    loadDocumentationData,
    saveDocumentationData
};
