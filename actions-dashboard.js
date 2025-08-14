// Actions Needed Dashboard - UI for comprehensive workflow management
// Displays patient workflows, LHCSA action plan, and task management

// Initialize Actions Dashboard
function initializeActionsDashboard() {
    console.log('Initializing Actions Dashboard');
    renderActionsDashboard();
    setupActionsEventListeners();
}

// Render main actions dashboard
function renderActionsDashboard() {
    const actionsContent = document.getElementById('actions-needed-content');
    if (!actionsContent) return;

    actionsContent.innerHTML = `
        <div class="actions-dashboard">
            <!-- Actions Header -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center">
                        <h3><i class="fas fa-tasks text-primary"></i> Actions Needed</h3>
                        <div class="btn-group">
                            <button class="btn btn-primary" onclick="refreshActionsDashboard()">
                                <i class="fas fa-sync-alt"></i> Refresh
                            </button>
                            <button class="btn btn-success" onclick="createNewWorkflow()">
                                <i class="fas fa-plus"></i> New Workflow
                            </button>
                            <button class="btn btn-info" onclick="exportActionsReport()">
                                <i class="fas fa-download"></i> Export Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Actions Overview Cards -->
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card bg-danger text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h4 id="overdue-actions">--</h4>
                                    <p class="mb-0">Overdue Actions</p>
                                </div>
                                <i class="fas fa-exclamation-triangle fa-2x opacity-50"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-warning text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h4 id="pending-actions">--</h4>
                                    <p class="mb-0">Pending Actions</p>
                                </div>
                                <i class="fas fa-clock fa-2x opacity-50"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-info text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h4 id="active-workflows">--</h4>
                                    <p class="mb-0">Active Workflows</p>
                                </div>
                                <i class="fas fa-project-diagram fa-2x opacity-50"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-success text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h4 id="completed-today">--</h4>
                                    <p class="mb-0">Completed Today</p>
                                </div>
                                <i class="fas fa-check-circle fa-2x opacity-50"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Actions Navigation Tabs -->
            <ul class="nav nav-tabs mb-3" id="actionsTabs" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="patient-workflows-tab" data-bs-toggle="tab" data-bs-target="#patient-workflows-panel" type="button">
                        <i class="fas fa-user-injured"></i> Patient Workflows
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="lhcsa-actions-tab" data-bs-toggle="tab" data-bs-target="#lhcsa-actions-panel" type="button">
                        <i class="fas fa-certificate"></i> LHCSA Licensing
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="overdue-tab" data-bs-toggle="tab" data-bs-target="#overdue-panel" type="button">
                        <i class="fas fa-exclamation-circle"></i> Overdue Items
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="calendar-tab" data-bs-toggle="tab" data-bs-target="#calendar-panel" type="button">
                        <i class="fas fa-calendar"></i> Action Calendar
                    </button>
                </li>
            </ul>

            <!-- Tab Content -->
            <div class="tab-content" id="actionsTabContent">
                <!-- Patient Workflows Panel -->
                <div class="tab-pane fade show active" id="patient-workflows-panel">
                    <div class="card">
                        <div class="card-header">
                            <h5><i class="fas fa-user-injured"></i> Patient Workflow Management</h5>
                        </div>
                        <div class="card-body">
                            <div id="patient-workflows-content">
                                <!-- Patient workflows content will be loaded here -->
                            </div>
                        </div>
                    </div>
                </div>

                <!-- LHCSA Actions Panel -->
                <div class="tab-pane fade" id="lhcsa-actions-panel">
                    <div class="card">
                        <div class="card-header">
                            <h5><i class="fas fa-certificate"></i> LHCSA Licensing Action Plan</h5>
                        </div>
                        <div class="card-body">
                            <div id="lhcsa-actions-content">
                                <!-- LHCSA actions content will be loaded here -->
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Overdue Panel -->
                <div class="tab-pane fade" id="overdue-panel">
                    <div class="card">
                        <div class="card-header">
                            <h5><i class="fas fa-exclamation-circle"></i> Overdue Actions</h5>
                        </div>
                        <div class="card-body">
                            <div id="overdue-content">
                                <!-- Overdue content will be loaded here -->
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Calendar Panel -->
                <div class="tab-pane fade" id="calendar-panel">
                    <div class="card">
                        <div class="card-header">
                            <h5><i class="fas fa-calendar"></i> Action Calendar</h5>
                        </div>
                        <div class="card-body">
                            <div id="calendar-content">
                                <!-- Calendar content will be loaded here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Load initial data
    updateActionsOverview();
    renderPatientWorkflows();
    renderLHCSAActions();
    renderOverdueActions();
    renderActionCalendar();
}

// Update actions overview cards
function updateActionsOverview() {
    const summary = window.actionsNeeded?.getActionsSummary() || {};
    
    document.getElementById('overdue-actions').textContent = summary.overdueActions || 0;
    document.getElementById('pending-actions').textContent = summary.pendingActions || 0;
    document.getElementById('active-workflows').textContent = 
        (summary.activePatientWorkflows || 0) + (summary.activeLHCSAActions || 0);
    document.getElementById('completed-today').textContent = summary.completedToday || 0;
}

// Render patient workflows
function renderPatientWorkflows() {
    const workflowsContent = document.getElementById('patient-workflows-content');
    if (!workflowsContent) return;

    const actionsData = window.actionsNeeded?.loadActionsData() || { patientWorkflows: [] };
    
    workflowsContent.innerHTML = `
        <div class="row">
            <div class="col-12">
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Current Step</th>
                                <th>Progress</th>
                                <th>Priority</th>
                                <th>Due Date</th>
                                <th>Assigned To</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${actionsData.patientWorkflows.map(workflow => `
                                <tr>
                                    <td>
                                        <strong>${workflow.patientName}</strong>
                                        <br><small class="text-muted">ID: ${workflow.patientId}</small>
                                    </td>
                                    <td>
                                        <span class="badge bg-${getStepStatusColor(workflow.steps[workflow.currentStep]?.status)}">
                                            ${workflow.steps[workflow.currentStep]?.name || 'N/A'}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="progress" style="width: 120px;">
                                            <div class="progress-bar" style="width: ${calculateWorkflowProgress(workflow)}%">
                                                ${Math.round(calculateWorkflowProgress(workflow))}%
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="badge bg-${getPriorityColor(workflow.steps[workflow.currentStep]?.priority)}">
                                            ${workflow.steps[workflow.currentStep]?.priority || 'medium'}
                                        </span>
                                    </td>
                                    <td>
                                        ${formatDate(workflow.steps[workflow.currentStep]?.dueDate)}
                                        ${isOverdue(workflow.steps[workflow.currentStep]?.dueDate) ? 
                                            '<br><small class="text-danger">OVERDUE</small>' : ''}
                                    </td>
                                    <td>${workflow.assignedTo}</td>
                                    <td>
                                        <button class="btn btn-sm btn-outline-primary" 
                                                onclick="viewWorkflowDetails('${workflow.id}')">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-success" 
                                                onclick="updateWorkflowStep('${workflow.id}', '${workflow.currentStep}')">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// Render LHCSA actions
function renderLHCSAActions() {
    const lhcsaContent = document.getElementById('lhcsa-actions-content');
    if (!lhcsaContent) return;

    const actionsData = window.actionsNeeded?.loadActionsData() || { lhcsaActions: [] };
    
    lhcsaContent.innerHTML = `
        <div class="row">
            ${actionsData.lhcsaActions.map(workflow => `
                <div class="col-12 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <h6>${workflow.name}</h6>
                            <div class="progress mt-2">
                                <div class="progress-bar bg-info" style="width: ${calculateWorkflowProgress(workflow)}%">
                                    ${Math.round(calculateWorkflowProgress(workflow))}% Complete
                                </div>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                ${Object.values(workflow.steps).map(step => `
                                    <div class="col-md-6 col-lg-4 mb-3">
                                        <div class="card h-100 ${step.status === 'completed' ? 'border-success' : 
                                                                step.status === 'pending' ? 'border-warning' : 
                                                                step.status === 'in_progress' ? 'border-primary' : 'border-light'}">
                                            <div class="card-body">
                                                <h6 class="card-title">${step.name}</h6>
                                                <p class="card-text small">${step.description}</p>
                                                <div class="d-flex justify-content-between align-items-center">
                                                    <span class="badge bg-${getStepStatusColor(step.status)}">
                                                        ${formatStepStatus(step.status)}
                                                    </span>
                                                    <small class="text-muted">${formatDate(step.dueDate)}</small>
                                                </div>
                                                ${step.status === 'pending' || step.status === 'in_progress' ? `
                                                    <button class="btn btn-sm btn-outline-primary mt-2" 
                                                            onclick="updateLHCSAStep('${workflow.id}', '${step.id}')">
                                                        Update Status
                                                    </button>
                                                ` : ''}
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Render overdue actions
function renderOverdueActions() {
    const overdueContent = document.getElementById('overdue-content');
    if (!overdueContent) return;

    const overdueActions = window.actionsNeeded?.getOverdueActions() || [];
    
    if (overdueActions.length === 0) {
        overdueContent.innerHTML = `
            <div class="alert alert-success">
                <i class="fas fa-check-circle"></i> No overdue actions! Great job staying on top of everything.
            </div>
        `;
        return;
    }

    overdueContent.innerHTML = `
        <div class="alert alert-warning">
            <strong>Attention:</strong> You have ${overdueActions.length} overdue action(s) that need immediate attention.
        </div>
        
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Patient/Workflow</th>
                        <th>Action</th>
                        <th>Due Date</th>
                        <th>Days Overdue</th>
                        <th>Priority</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${overdueActions.map(action => `
                        <tr class="table-danger">
                            <td>
                                <span class="badge bg-secondary">
                                    ${action.type === 'patient_workflow' ? 'Patient' : 'LHCSA'}
                                </span>
                            </td>
                            <td>
                                <strong>${action.patientName || action.workflowName}</strong>
                            </td>
                            <td>${action.stepName}</td>
                            <td>${formatDate(action.dueDate)}</td>
                            <td>
                                <span class="badge bg-danger">
                                    ${action.overdueDays} day${action.overdueDays !== 1 ? 's' : ''}
                                </span>
                            </td>
                            <td>
                                <span class="badge bg-${getPriorityColor(action.priority)}">
                                    ${action.priority}
                                </span>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-danger" 
                                        onclick="resolveOverdueAction('${action.workflowId}', '${action.stepId}')">
                                    <i class="fas fa-exclamation"></i> Resolve
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Render action calendar
function renderActionCalendar() {
    const calendarContent = document.getElementById('calendar-content');
    if (!calendarContent) return;

    // Simple calendar view showing upcoming actions
    calendarContent.innerHTML = `
        <div class="row">
            <div class="col-12">
                <h6>Upcoming Actions (Next 7 Days)</h6>
                <div id="upcoming-actions-list">
                    <!-- Upcoming actions will be loaded here -->
                </div>
            </div>
        </div>
    `;

    loadUpcomingActions();
}

// Load upcoming actions
function loadUpcomingActions() {
    const actionsData = window.actionsNeeded?.loadActionsData() || { patientWorkflows: [], lhcsaActions: [] };
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingActions = [];

    // Collect upcoming actions from patient workflows
    actionsData.patientWorkflows.forEach(workflow => {
        Object.values(workflow.steps).forEach(step => {
            const dueDate = new Date(step.dueDate);
            if (step.status === 'pending' && dueDate >= now && dueDate <= sevenDaysFromNow) {
                upcomingActions.push({
                    type: 'patient',
                    workflowId: workflow.id,
                    stepId: step.id,
                    patientName: workflow.patientName,
                    stepName: step.name,
                    dueDate: step.dueDate,
                    priority: step.priority
                });
            }
        });
    });

    // Collect upcoming actions from LHCSA workflows
    actionsData.lhcsaActions.forEach(workflow => {
        Object.values(workflow.steps).forEach(step => {
            const dueDate = new Date(step.dueDate);
            if (step.status === 'pending' && dueDate >= now && dueDate <= sevenDaysFromNow) {
                upcomingActions.push({
                    type: 'lhcsa',
                    workflowId: workflow.id,
                    stepId: step.id,
                    workflowName: workflow.name,
                    stepName: step.name,
                    dueDate: step.dueDate,
                    priority: step.priority
                });
            }
        });
    });

    // Sort by due date
    upcomingActions.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    const upcomingList = document.getElementById('upcoming-actions-list');
    if (upcomingList) {
        if (upcomingActions.length === 0) {
            upcomingList.innerHTML = '<p class="text-muted">No upcoming actions in the next 7 days.</p>';
        } else {
            upcomingList.innerHTML = upcomingActions.map(action => `
                <div class="card mb-2">
                    <div class="card-body py-2">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <strong>${action.patientName || action.workflowName}</strong> - ${action.stepName}
                                <br><small class="text-muted">${action.type === 'patient' ? 'Patient Workflow' : 'LHCSA Licensing'}</small>
                            </div>
                            <div class="text-end">
                                <div class="badge bg-${getPriorityColor(action.priority)}">${action.priority}</div>
                                <br><small class="text-muted">${formatDate(action.dueDate)}</small>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }
}

// Setup event listeners
function setupActionsEventListeners() {
    // Tab switching
    document.querySelectorAll('#actionsTabs button').forEach(tab => {
        tab.addEventListener('shown.bs.tab', function(e) {
            const target = e.target.getAttribute('data-bs-target');
            if (target === '#patient-workflows-panel') renderPatientWorkflows();
            if (target === '#lhcsa-actions-panel') renderLHCSAActions();
            if (target === '#overdue-panel') renderOverdueActions();
            if (target === '#calendar-panel') renderActionCalendar();
        });
    });
}

// Utility functions
function calculateWorkflowProgress(workflow) {
    const totalSteps = Object.keys(workflow.steps).length;
    const completedSteps = workflow.completedSteps?.length || 0;
    return totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
}

function getStepStatusColor(status) {
    switch (status) {
        case 'completed': return 'success';
        case 'in_progress': return 'primary';
        case 'pending': return 'warning';
        case 'overdue': return 'danger';
        default: return 'secondary';
    }
}

function getPriorityColor(priority) {
    switch (priority) {
        case 'high': return 'danger';
        case 'medium': return 'warning';
        case 'low': return 'success';
        default: return 'secondary';
    }
}

function formatStepStatus(status) {
    return status.replace('_', ' ').toUpperCase();
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
}

function isOverdue(dateString) {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
}

// Action functions
function refreshActionsDashboard() {
    updateActionsOverview();
    renderPatientWorkflows();
    renderLHCSAActions();
    renderOverdueActions();
    renderActionCalendar();
}

function createNewWorkflow() {
    alert('Create New Workflow functionality coming soon!');
}

function exportActionsReport() {
    const actionsData = window.actionsNeeded?.loadActionsData() || {};
    const summary = window.actionsNeeded?.getActionsSummary() || {};
    
    const report = {
        generatedDate: new Date().toISOString(),
        summary: summary,
        patientWorkflows: actionsData.patientWorkflows,
        lhcsaActions: actionsData.lhcsaActions,
        overdueActions: window.actionsNeeded?.getOverdueActions() || []
    };
    
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `actions-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

function viewWorkflowDetails(workflowId) {
    // Create and show workflow details modal
    const modal = createWorkflowDetailsModal(workflowId);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

function updateWorkflowStep(workflowId, stepId) {
    // Create and show step update modal
    const modal = createStepUpdateModal(workflowId, stepId);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

function updateLHCSAStep(workflowId, stepId) {
    // Create and show LHCSA step update modal
    const modal = createLHCSAStepUpdateModal(workflowId, stepId);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

function resolveOverdueAction(workflowId, stepId) {
    if (confirm('Mark this overdue action as resolved?')) {
        const success = window.actionsNeeded?.updateWorkflowStep(workflowId, stepId, {
            status: 'completed',
            notes: 'Marked as resolved from overdue actions'
        });
        
        if (success) {
            refreshActionsDashboard();
            alert('Action marked as resolved!');
        }
    }
}

// Create workflow details modal
function createWorkflowDetailsModal(workflowId) {
    const actionsData = window.actionsNeeded?.loadActionsData() || {};
    const workflow = actionsData.patientWorkflows.find(w => w.id === workflowId) ||
                    actionsData.lhcsaActions.find(w => w.id === workflowId);
    
    if (!workflow) return null;

    let modal = document.getElementById('workflow-details-modal');
    if (modal) modal.remove();
    
    modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'workflow-details-modal';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Workflow Details: ${workflow.patientName || workflow.name}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-12">
                            <div class="progress mb-3">
                                <div class="progress-bar" style="width: ${calculateWorkflowProgress(workflow)}%">
                                    ${Math.round(calculateWorkflowProgress(workflow))}% Complete
                                </div>
                            </div>
                            
                            <div class="timeline">
                                ${Object.values(workflow.steps).map(step => `
                                    <div class="timeline-item ${step.status === 'completed' ? 'completed' : 
                                                               step.status === 'pending' ? 'pending' : 'upcoming'}">
                                        <div class="timeline-marker"></div>
                                        <div class="timeline-content">
                                            <h6>${step.name}</h6>
                                            <p>${step.description}</p>
                                            <div class="d-flex justify-content-between">
                                                <span class="badge bg-${getStepStatusColor(step.status)}">
                                                    ${formatStepStatus(step.status)}
                                                </span>
                                                <small class="text-muted">Due: ${formatDate(step.dueDate)}</small>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    return modal;
}

// Create step update modal
function createStepUpdateModal(workflowId, stepId) {
    let modal = document.getElementById('step-update-modal');
    if (modal) modal.remove();
    
    modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'step-update-modal';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Update Step Status</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">Status</label>
                        <select class="form-select" id="step-status-select">
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Notes</label>
                        <textarea class="form-control" id="step-notes" rows="3" 
                                  placeholder="Add notes about this step..."></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" 
                            onclick="saveStepUpdate('${workflowId}', '${stepId}')">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    return modal;
}

// Save step update
function saveStepUpdate(workflowId, stepId) {
    const status = document.getElementById('step-status-select').value;
    const notes = document.getElementById('step-notes').value;
    
    const success = window.actionsNeeded?.updateWorkflowStep(workflowId, stepId, {
        status: status,
        notes: notes ? [notes] : []
    });
    
    if (success) {
        const modal = bootstrap.Modal.getInstance(document.getElementById('step-update-modal'));
        modal.hide();
        refreshActionsDashboard();
        alert('Step updated successfully!');
    }
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeActionsDashboard, 2500);
});
