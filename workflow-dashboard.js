// Workflow Dashboard - UI for managing automated workflows
// Provides visualization and control for the workflow engine

// Render workflow dashboard
function renderWorkflowDashboard() {
    const container = document.getElementById('workflowDashboardContainer');
    if (!container) return;

    // Load current workflow data
    const workflowData = JSON.parse(localStorage.getItem('workflowData')) || {
        workflows: [],
        automatedTasks: [],
        workflowTemplates: [],
        executionLog: []
    };

    const activeWorkflows = workflowData.workflows.filter(w => w.status === 'active');
    const completedWorkflows = workflowData.workflows.filter(w => w.status === 'completed');
    const pendingTasks = workflowData.automatedTasks.filter(t => t.status === 'pending');
    const recentExecutions = workflowData.executionLog.slice(-10).reverse();

    container.innerHTML = `
        <div class="row mb-4">
            <!-- Workflow Overview Cards -->
            <div class="col-md-3 mb-3">
                <div class="card border-primary">
                    <div class="card-body text-center">
                        <i class="fas fa-cogs fa-2x text-primary mb-2"></i>
                        <h5 class="card-title">Active Workflows</h5>
                        <h3 class="text-primary">${activeWorkflows.length}</h3>
                        <small class="text-muted">Currently running</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card border-success">
                    <div class="card-body text-center">
                        <i class="fas fa-check-circle fa-2x text-success mb-2"></i>
                        <h5 class="card-title">Completed Today</h5>
                        <h3 class="text-success">${getCompletedToday(completedWorkflows)}</h3>
                        <small class="text-muted">Workflows finished</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card border-warning">
                    <div class="card-body text-center">
                        <i class="fas fa-tasks fa-2x text-warning mb-2"></i>
                        <h5 class="card-title">Pending Tasks</h5>
                        <h3 class="text-warning">${pendingTasks.length}</h3>
                        <small class="text-muted">Awaiting execution</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card border-info">
                    <div class="card-body text-center">
                        <i class="fas fa-template fa-2x text-info mb-2"></i>
                        <h5 class="card-title">Templates</h5>
                        <h3 class="text-info">${workflowData.workflowTemplates.length}</h3>
                        <small class="text-muted">Available workflows</small>
                    </div>
                </div>
            </div>
        </div>

        <!-- Workflow Management Tabs -->
        <ul class="nav nav-tabs" id="workflowTabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="active-workflows-tab" data-bs-toggle="tab" data-bs-target="#active-workflows" type="button" role="tab">
                    <i class="fas fa-play-circle"></i> Active Workflows
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="templates-tab" data-bs-toggle="tab" data-bs-target="#templates" type="button" role="tab">
                    <i class="fas fa-template"></i> Templates
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="automation-rules-tab" data-bs-toggle="tab" data-bs-target="#automation-rules" type="button" role="tab">
                    <i class="fas fa-robot"></i> Automation Rules
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="execution-log-tab" data-bs-toggle="tab" data-bs-target="#execution-log" type="button" role="tab">
                    <i class="fas fa-history"></i> Execution Log
                </button>
            </li>
        </ul>

        <div class="tab-content mt-3" id="workflowTabContent">
            <!-- Active Workflows Tab -->
            <div class="tab-pane fade show active" id="active-workflows" role="tabpanel">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">Active Workflows</h5>
                        <button class="btn btn-sm btn-primary" onclick="refreshWorkflows()">
                            <i class="fas fa-sync-alt"></i> Refresh
                        </button>
                    </div>
                    <div class="card-body">
                        ${renderActiveWorkflows(activeWorkflows)}
                    </div>
                </div>
            </div>

            <!-- Templates Tab -->
            <div class="tab-pane fade" id="templates" role="tabpanel">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">Workflow Templates</h5>
                        <button class="btn btn-sm btn-success" onclick="createCustomTemplate()">
                            <i class="fas fa-plus"></i> Create Template
                        </button>
                    </div>
                    <div class="card-body">
                        ${renderWorkflowTemplates(workflowData.workflowTemplates)}
                    </div>
                </div>
            </div>

            <!-- Automation Rules Tab -->
            <div class="tab-pane fade" id="automation-rules" role="tabpanel">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">Automation Rules</h5>
                        <button class="btn btn-sm btn-warning" onclick="testAutomationRules()">
                            <i class="fas fa-play"></i> Test Rules
                        </button>
                    </div>
                    <div class="card-body">
                        ${renderAutomationRules()}
                    </div>
                </div>
            </div>

            <!-- Execution Log Tab -->
            <div class="tab-pane fade" id="execution-log" role="tabpanel">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">Recent Executions</h5>
                        <button class="btn btn-sm btn-info" onclick="exportExecutionLog()">
                            <i class="fas fa-download"></i> Export Log
                        </button>
                    </div>
                    <div class="card-body">
                        ${renderExecutionLog(recentExecutions)}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Render active workflows
function renderActiveWorkflows(workflows) {
    if (workflows.length === 0) {
        return `
            <div class="text-center py-4">
                <i class="fas fa-info-circle fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No Active Workflows</h5>
                <p class="text-muted">Workflows will appear here when triggered by system events or manual starts.</p>
            </div>
        `;
    }

    return `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Workflow</th>
                        <th>Progress</th>
                        <th>Started</th>
                        <th>Next Step</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${workflows.map(workflow => `
                        <tr>
                            <td>
                                <strong>${workflow.name}</strong>
                                <br>
                                <small class="text-muted">ID: ${workflow.id}</small>
                            </td>
                            <td>
                                ${renderWorkflowProgress(workflow)}
                            </td>
                            <td>
                                <small>${formatDateTime(workflow.startDate)}</small>
                            </td>
                            <td>
                                ${getNextStep(workflow)}
                            </td>
                            <td>
                                <div class="btn-group btn-group-sm">
                                    <button class="btn btn-outline-primary" onclick="viewWorkflowDetails('${workflow.id}')">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn btn-outline-warning" onclick="pauseWorkflow('${workflow.id}')">
                                        <i class="fas fa-pause"></i>
                                    </button>
                                    <button class="btn btn-outline-danger" onclick="cancelWorkflow('${workflow.id}')">
                                        <i class="fas fa-stop"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Render workflow progress bar
function renderWorkflowProgress(workflow) {
    const completedSteps = workflow.steps.filter(s => s.status === 'completed').length;
    const totalSteps = workflow.steps.length;
    const progressPercent = Math.round((completedSteps / totalSteps) * 100);

    return `
        <div class="progress" style="height: 20px;">
            <div class="progress-bar bg-success" role="progressbar" style="width: ${progressPercent}%" 
                 aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100">
                ${completedSteps}/${totalSteps}
            </div>
        </div>
        <small class="text-muted">${progressPercent}% complete</small>
    `;
}

// Get next step for workflow
function getNextStep(workflow) {
    const nextStep = workflow.steps.find(s => s.status === 'pending');
    if (!nextStep) return '<span class="text-success">All steps completed</span>';
    
    const scheduledDate = new Date(nextStep.scheduledDate);
    const now = new Date();
    const isOverdue = scheduledDate < now;
    
    return `
        <div>
            <strong>${nextStep.description}</strong>
            <br>
            <small class="${isOverdue ? 'text-danger' : 'text-muted'}">
                ${isOverdue ? 'Overdue: ' : 'Due: '}${formatDateTime(nextStep.scheduledDate)}
            </small>
        </div>
    `;
}

// Render workflow templates
function renderWorkflowTemplates(templates) {
    if (templates.length === 0) {
        return `
            <div class="text-center py-4">
                <i class="fas fa-template fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No Templates Available</h5>
                <p class="text-muted">Create workflow templates to automate common processes.</p>
            </div>
        `;
    }

    return `
        <div class="row">
            ${templates.map(template => `
                <div class="col-md-6 mb-3">
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="card-title">
                                <i class="fas fa-workflow"></i> ${template.name}
                            </h5>
                            <p class="card-text">${template.description}</p>
                            <div class="mb-2">
                                <small class="text-muted">
                                    <strong>Trigger:</strong> ${template.trigger}
                                </small>
                            </div>
                            <div class="mb-3">
                                <small class="text-muted">
                                    <strong>Steps:</strong> ${template.steps.length}
                                </small>
                            </div>
                            <div class="btn-group w-100">
                                <button class="btn btn-primary" onclick="startManualWorkflow('${template.id}')">
                                    <i class="fas fa-play"></i> Start Now
                                </button>
                                <button class="btn btn-outline-secondary" onclick="viewTemplateDetails('${template.id}')">
                                    <i class="fas fa-eye"></i> View
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Render automation rules
function renderAutomationRules() {
    const rules = [
        {
            id: 'low_satisfaction_followup',
            name: 'Low Satisfaction Follow-up',
            condition: 'Patient satisfaction < 3 stars',
            action: 'Create follow-up task',
            priority: 'High',
            status: 'Active'
        },
        {
            id: 'missed_appointment_followup',
            name: 'Missed Appointment Follow-up',
            condition: 'Appointment marked as missed',
            action: 'Reschedule and create follow-up',
            priority: 'Medium',
            status: 'Active'
        },
        {
            id: 'overdue_documentation',
            name: 'Overdue Documentation Alert',
            condition: 'Document overdue > 2 days',
            action: 'Escalate to supervisor',
            priority: 'High',
            status: 'Active'
        },
        {
            id: 'provider_utilization_low',
            name: 'Low Provider Utilization',
            condition: 'Provider utilization < 60%',
            action: 'Optimize scheduling',
            priority: 'Medium',
            status: 'Active'
        },
        {
            id: 'authorization_expiring',
            name: 'Authorization Expiring Soon',
            condition: 'Authorization expires within 30 days',
            action: 'Start renewal process',
            priority: 'High',
            status: 'Active'
        }
    ];

    return `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Rule Name</th>
                        <th>Condition</th>
                        <th>Action</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${rules.map(rule => `
                        <tr>
                            <td><strong>${rule.name}</strong></td>
                            <td><code>${rule.condition}</code></td>
                            <td>${rule.action}</td>
                            <td>
                                <span class="badge bg-${rule.priority === 'High' ? 'danger' : rule.priority === 'Medium' ? 'warning' : 'info'}">
                                    ${rule.priority}
                                </span>
                            </td>
                            <td>
                                <span class="badge bg-${rule.status === 'Active' ? 'success' : 'secondary'}">
                                    ${rule.status}
                                </span>
                            </td>
                            <td>
                                <div class="btn-group btn-group-sm">
                                    <button class="btn btn-outline-primary" onclick="editAutomationRule('${rule.id}')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-outline-warning" onclick="toggleAutomationRule('${rule.id}')">
                                        <i class="fas fa-power-off"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Render execution log
function renderExecutionLog(executions) {
    if (executions.length === 0) {
        return `
            <div class="text-center py-4">
                <i class="fas fa-history fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No Recent Executions</h5>
                <p class="text-muted">Workflow execution history will appear here.</p>
            </div>
        `;
    }

    return `
        <div class="table-responsive">
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Event</th>
                        <th>Item</th>
                        <th>Details</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${executions.map(log => `
                        <tr>
                            <td><small>${formatDateTime(log.timestamp)}</small></td>
                            <td>
                                <span class="badge bg-${getEventTypeBadge(log.eventType)}">
                                    ${log.eventType.replace('_', ' ')}
                                </span>
                            </td>
                            <td>${log.itemName}</td>
                            <td><small>${log.details}</small></td>
                            <td>
                                <i class="fas fa-${log.success ? 'check-circle text-success' : 'times-circle text-danger'}"></i>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Utility functions
function getCompletedToday(workflows) {
    const today = new Date().toDateString();
    return workflows.filter(w => 
        w.completedDate && new Date(w.completedDate).toDateString() === today
    ).length;
}

function getEventTypeBadge(eventType) {
    const badges = {
        'workflow_started': 'primary',
        'workflow_completed': 'success',
        'step_executed': 'info',
        'automation_rule': 'warning'
    };
    return badges[eventType] || 'secondary';
}

function formatDateTime(dateString) {
    return new Date(dateString).toLocaleString();
}

// Action functions
function refreshWorkflows() {
    if (typeof processScheduledWorkflows === 'function') {
        processScheduledWorkflows();
    }
    renderWorkflowDashboard();
}

function viewWorkflowDetails(workflowId) {
    const workflowData = JSON.parse(localStorage.getItem('workflowData')) || {};
    const workflow = workflowData.workflows?.find(w => w.id == workflowId);
    
    if (workflow) {
        alert(`Workflow Details:\n\nName: ${workflow.name}\nStatus: ${workflow.status}\nProgress: ${workflow.steps.filter(s => s.status === 'completed').length}/${workflow.steps.length} steps\nStarted: ${formatDateTime(workflow.startDate)}`);
    }
}

function pauseWorkflow(workflowId) {
    const workflowData = JSON.parse(localStorage.getItem('workflowData')) || {};
    const workflow = workflowData.workflows?.find(w => w.id == workflowId);
    
    if (workflow) {
        workflow.status = 'paused';
        localStorage.setItem('workflowData', JSON.stringify(workflowData));
        renderWorkflowDashboard();
    }
}

function cancelWorkflow(workflowId) {
    if (confirm('Are you sure you want to cancel this workflow?')) {
        const workflowData = JSON.parse(localStorage.getItem('workflowData')) || {};
        const workflow = workflowData.workflows?.find(w => w.id == workflowId);
        
        if (workflow) {
            workflow.status = 'cancelled';
            localStorage.setItem('workflowData', JSON.stringify(workflowData));
            renderWorkflowDashboard();
        }
    }
}

function startManualWorkflow(templateId) {
    if (typeof startWorkflow === 'function') {
        const workflow = startWorkflow(templateId, 'manual_start', {
            startedBy: 'user',
            startTime: new Date().toISOString()
        });
        
        if (workflow) {
            alert(`Workflow "${workflow.name}" started successfully!`);
            renderWorkflowDashboard();
        }
    }
}

function testAutomationRules() {
    if (typeof checkAutomationRules === 'function') {
        checkAutomationRules();
        alert('Automation rules tested successfully! Check the execution log for results.');
        renderWorkflowDashboard();
    }
}

function exportExecutionLog() {
    const workflowData = JSON.parse(localStorage.getItem('workflowData')) || {};
    const executions = workflowData.executionLog || [];
    
    if (executions.length === 0) {
        alert('No execution log data to export.');
        return;
    }
    
    const csvContent = [
        ['Timestamp', 'Event Type', 'Item Name', 'Details', 'Success'],
        ...executions.map(log => [
            log.timestamp,
            log.eventType,
            log.itemName,
            log.details,
            log.success ? 'Yes' : 'No'
        ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow_execution_log_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Initialize workflow dashboard when section is shown
function initializeWorkflowDashboard() {
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const workflowSection = document.getElementById('workflow-automation');
                if (workflowSection && !workflowSection.style.display) {
                    renderWorkflowDashboard();
                }
            }
        });
    });

    const workflowSection = document.getElementById('workflow-automation');
    if (workflowSection) {
        observer.observe(workflowSection, { attributes: true });
    }
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    initializeWorkflowDashboard();
});

// Export for global access
window.workflowDashboard = {
    renderWorkflowDashboard,
    refreshWorkflows,
    viewWorkflowDetails,
    startManualWorkflow,
    testAutomationRules,
    exportExecutionLog
};
