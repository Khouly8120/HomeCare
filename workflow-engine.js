// Automated Workflow Engine
// Handles smart task automation, workflow templates, and conditional logic

// Global variables for workflow data
let workflowData = JSON.parse(localStorage.getItem('workflowData')) || {
    workflows: [],
    automatedTasks: [],
    workflowTemplates: [],
    executionLog: []
};

// Predefined workflow templates
const workflowTemplates = {
    new_patient_onboarding: {
        id: 'new_patient_onboarding',
        name: 'New Patient Onboarding',
        description: 'Complete onboarding process for new patients',
        trigger: 'patient_added',
        steps: [
            { id: 1, action: 'create_document_requirements', delay: 0, description: 'Generate document checklist' },
            { id: 2, action: 'schedule_initial_evaluation', delay: 1, description: 'Schedule initial evaluation within 24 hours' },
            { id: 3, action: 'verify_insurance_benefits', delay: 0, description: 'Initiate benefits verification' },
            { id: 4, action: 'send_welcome_message', delay: 2, description: 'Send welcome message and instructions' },
            { id: 5, action: 'assign_case_manager', delay: 0, description: 'Assign primary case manager' }
        ]
    },
    provider_credentialing: {
        id: 'provider_credentialing',
        name: 'Provider Credentialing Process',
        description: 'Complete credentialing workflow for new providers',
        trigger: 'provider_added',
        steps: [
            { id: 1, action: 'request_credentials', delay: 0, description: 'Request license and certification documents' },
            { id: 2, action: 'background_check', delay: 1, description: 'Initiate background check' },
            { id: 3, action: 'reference_verification', delay: 1, description: 'Contact professional references' },
            { id: 4, action: 'orientation_scheduling', delay: 3, description: 'Schedule orientation session' },
            { id: 5, action: 'system_access_setup', delay: 5, description: 'Set up system access and permissions' }
        ]
    },
    authorization_renewal: {
        id: 'authorization_renewal',
        name: 'Authorization Renewal Process',
        description: 'Automated renewal process for expiring authorizations',
        trigger: 'authorization_expiring',
        steps: [
            { id: 1, action: 'prepare_renewal_request', delay: -30, description: 'Prepare renewal 30 days before expiry' },
            { id: 2, action: 'gather_progress_notes', delay: -25, description: 'Collect recent progress notes' },
            { id: 3, action: 'submit_renewal_request', delay: -20, description: 'Submit renewal to insurance' },
            { id: 4, action: 'follow_up_insurance', delay: -10, description: 'Follow up with insurance if no response' },
            { id: 5, action: 'notify_stakeholders', delay: -5, description: 'Notify team of renewal status' }
        ]
    },
    discharge_process: {
        id: 'discharge_process',
        name: 'Patient Discharge Process',
        description: 'Complete discharge workflow for patients',
        trigger: 'patient_discharge',
        steps: [
            { id: 1, action: 'final_evaluation', delay: 0, description: 'Complete final evaluation' },
            { id: 2, action: 'discharge_summary', delay: 1, description: 'Prepare discharge summary' },
            { id: 3, action: 'home_exercise_program', delay: 1, description: 'Provide home exercise program' },
            { id: 4, action: 'satisfaction_survey', delay: 3, description: 'Send satisfaction survey' },
            { id: 5, action: 'follow_up_call', delay: 14, description: 'Follow-up call after 2 weeks' }
        ]
    },
    quality_assurance: {
        id: 'quality_assurance',
        name: 'Quality Assurance Review',
        description: 'Regular quality checks for active patients',
        trigger: 'scheduled_review',
        steps: [
            { id: 1, action: 'review_documentation', delay: 0, description: 'Review patient documentation completeness' },
            { id: 2, action: 'check_progress', delay: 0, description: 'Assess patient progress against goals' },
            { id: 3, action: 'provider_feedback', delay: 1, description: 'Collect provider feedback' },
            { id: 4, action: 'compliance_check', delay: 1, description: 'Verify regulatory compliance' },
            { id: 5, action: 'action_plan', delay: 2, description: 'Create action plan if issues identified' }
        ]
    }
};

// Conditional rules for workflow automation
const automationRules = [
    {
        id: 'low_satisfaction_followup',
        name: 'Low Satisfaction Follow-up',
        condition: 'patient_satisfaction < 3',
        action: 'create_followup_task',
        priority: 'high',
        description: 'Automatically create follow-up task for low satisfaction scores'
    },
    {
        id: 'missed_appointment_followup',
        name: 'Missed Appointment Follow-up',
        condition: 'appointment_missed',
        action: 'reschedule_and_followup',
        priority: 'medium',
        description: 'Automatically reschedule and create follow-up for missed appointments'
    },
    {
        id: 'overdue_documentation',
        name: 'Overdue Documentation Alert',
        condition: 'document_overdue > 2_days',
        action: 'escalate_to_supervisor',
        priority: 'high',
        description: 'Escalate to supervisor when documentation is overdue by 2+ days'
    },
    {
        id: 'provider_utilization_low',
        name: 'Low Provider Utilization',
        condition: 'provider_utilization < 60',
        action: 'optimize_scheduling',
        priority: 'medium',
        description: 'Optimize scheduling when provider utilization drops below 60%'
    },
    {
        id: 'authorization_expiring',
        name: 'Authorization Expiring Soon',
        condition: 'authorization_expires_in < 30_days',
        action: 'start_renewal_process',
        priority: 'high',
        description: 'Start renewal process when authorization expires within 30 days'
    }
];

// Initialize Workflow Engine
function initializeWorkflowEngine() {
    console.log('Initializing Automated Workflow Engine');
    loadWorkflowData();
    initializeWorkflowTemplates();
    setupAutomationRules();
    processScheduledWorkflows();
}

// Load workflow data from localStorage
function loadWorkflowData() {
    workflowData = JSON.parse(localStorage.getItem('workflowData')) || {
        workflows: [],
        automatedTasks: [],
        workflowTemplates: [],
        executionLog: []
    };
}

// Save workflow data to localStorage
function saveWorkflowData() {
    localStorage.setItem('workflowData', JSON.stringify(workflowData));
}

// Initialize workflow templates
function initializeWorkflowTemplates() {
    workflowData.workflowTemplates = Object.values(workflowTemplates);
    saveWorkflowData();
}

// Setup automation rules monitoring
function setupAutomationRules() {
    // Monitor for conditions that trigger automation rules
    setInterval(() => {
        checkAutomationRules();
    }, 60000); // Check every minute
}

// Check automation rules and execute actions
function checkAutomationRules() {
    automationRules.forEach(rule => {
        if (evaluateCondition(rule.condition)) {
            executeAutomationAction(rule);
        }
    });
}

// Evaluate condition logic
function evaluateCondition(condition) {
    // Simplified condition evaluation - in real implementation would be more sophisticated
    switch (condition) {
        case 'patient_satisfaction < 3':
            return checkLowSatisfactionScores();
        case 'appointment_missed':
            return checkMissedAppointments();
        case 'document_overdue > 2_days':
            return checkOverdueDocuments();
        case 'provider_utilization < 60':
            return checkLowProviderUtilization();
        case 'authorization_expires_in < 30_days':
            return checkExpiringAuthorizations();
        default:
            return false;
    }
}

// Check for low satisfaction scores
function checkLowSatisfactionScores() {
    const recentFeedback = feedbackData?.patientFeedback || [];
    return recentFeedback.some(feedback => 
        feedback.overallRating < 3 && 
        !feedback.followUpScheduled &&
        isWithinLastWeek(feedback.submittedDate)
    );
}

// Check for missed appointments
function checkMissedAppointments() {
    const today = new Date();
    return patients.some(patient => 
        patient.appointments && patient.appointments.some(apt => 
            apt.status === 'missed' && 
            !apt.followUpScheduled &&
            isWithinLastWeek(apt.appointmentDate)
        )
    );
}

// Check for overdue documents
function checkOverdueDocuments() {
    const alerts = documentationData?.complianceAlerts || [];
    return alerts.some(alert => 
        alert.alertType === 'overdue' && 
        alert.daysUntilDue < -2 &&
        !alert.escalated
    );
}

// Check for low provider utilization
function checkLowProviderUtilization() {
    return providers.some(provider => 
        provider.status === 'active' &&
        (provider.utilizationStats?.utilizationPercentage || 0) < 60 &&
        !provider.optimizationScheduled
    );
}

// Check for expiring authorizations
function checkExpiringAuthorizations() {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    return authorizationRequests?.some(auth => 
        auth.status === 'approved' &&
        auth.endDate &&
        new Date(auth.endDate) <= thirtyDaysFromNow &&
        !auth.renewalStarted
    ) || false;
}

// Execute automation action
function executeAutomationAction(rule) {
    const actionId = Date.now() + Math.random();
    
    const automatedTask = {
        id: actionId,
        ruleId: rule.id,
        ruleName: rule.name,
        action: rule.action,
        priority: rule.priority,
        status: 'pending',
        createdDate: new Date().toISOString(),
        executedDate: null,
        description: rule.description
    };
    
    workflowData.automatedTasks.push(automatedTask);
    
    // Execute the specific action
    switch (rule.action) {
        case 'create_followup_task':
            createFollowUpTask(rule);
            break;
        case 'reschedule_and_followup':
            rescheduleAndFollowUp(rule);
            break;
        case 'escalate_to_supervisor':
            escalateToSupervisor(rule);
            break;
        case 'optimize_scheduling':
            optimizeScheduling(rule);
            break;
        case 'start_renewal_process':
            startRenewalProcess(rule);
            break;
    }
    
    automatedTask.status = 'executed';
    automatedTask.executedDate = new Date().toISOString();
    
    logWorkflowExecution(rule, 'automation_rule', 'executed');
    saveWorkflowData();
}

// Start a workflow from template
function startWorkflow(templateId, triggerId, triggerData = {}) {
    const template = workflowTemplates[templateId];
    if (!template) return null;
    
    const workflow = {
        id: Date.now() + Math.random(),
        templateId: templateId,
        name: template.name,
        triggerId: triggerId,
        triggerData: triggerData,
        status: 'active',
        currentStep: 0,
        steps: template.steps.map(step => ({
            ...step,
            status: 'pending',
            scheduledDate: calculateStepDate(step.delay),
            executedDate: null
        })),
        startDate: new Date().toISOString(),
        completedDate: null
    };
    
    workflowData.workflows.push(workflow);
    saveWorkflowData();
    
    logWorkflowExecution(template, 'workflow_started', triggerId);
    
    // Execute immediate steps (delay = 0)
    executeWorkflowSteps(workflow.id);
    
    return workflow;
}

// Calculate step execution date based on delay
function calculateStepDate(delayDays) {
    const date = new Date();
    date.setDate(date.getDate() + delayDays);
    return date.toISOString();
}

// Execute workflow steps that are due
function executeWorkflowSteps(workflowId) {
    const workflow = workflowData.workflows.find(w => w.id === workflowId);
    if (!workflow || workflow.status !== 'active') return;
    
    const now = new Date();
    
    workflow.steps.forEach(step => {
        if (step.status === 'pending' && new Date(step.scheduledDate) <= now) {
            executeWorkflowStep(workflow, step);
        }
    });
    
    // Check if workflow is complete
    const allStepsCompleted = workflow.steps.every(step => step.status === 'completed');
    if (allStepsCompleted) {
        workflow.status = 'completed';
        workflow.completedDate = new Date().toISOString();
        logWorkflowExecution(workflow, 'workflow_completed', workflow.id);
    }
    
    saveWorkflowData();
}

// Execute individual workflow step
function executeWorkflowStep(workflow, step) {
    step.status = 'executing';
    step.executedDate = new Date().toISOString();
    
    // Execute the specific action based on step type
    switch (step.action) {
        case 'create_document_requirements':
            createDocumentRequirements(workflow.triggerData);
            break;
        case 'schedule_initial_evaluation':
            scheduleInitialEvaluation(workflow.triggerData);
            break;
        case 'verify_insurance_benefits':
            verifyInsuranceBenefits(workflow.triggerData);
            break;
        case 'send_welcome_message':
            sendWelcomeMessage(workflow.triggerData);
            break;
        case 'assign_case_manager':
            assignCaseManager(workflow.triggerData);
            break;
        // Add more step actions as needed
        default:
            console.log(`Executing step: ${step.action} for workflow: ${workflow.name}`);
    }
    
    step.status = 'completed';
    logWorkflowExecution(step, 'step_executed', workflow.id);
}

// Process scheduled workflows (run periodically)
function processScheduledWorkflows() {
    workflowData.workflows
        .filter(w => w.status === 'active')
        .forEach(workflow => {
            executeWorkflowSteps(workflow.id);
        });
    
    // Schedule next processing
    setTimeout(processScheduledWorkflows, 300000); // Check every 5 minutes
}

// Workflow step implementations
function createDocumentRequirements(triggerData) {
    if (triggerData.patientId && typeof generateDocumentRequirements === 'function') {
        generateDocumentRequirements();
    }
}

function scheduleInitialEvaluation(triggerData) {
    // Create task to schedule initial evaluation
    const task = {
        id: Date.now() + Math.random(),
        title: `Schedule Initial Evaluation - ${triggerData.patientName || 'New Patient'}`,
        description: 'Schedule initial evaluation within 24 hours of patient onboarding',
        priority: 'high',
        status: 'pending',
        assignedTo: 'scheduling_team',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        createdDate: new Date().toISOString(),
        category: 'scheduling',
        automatedTask: true
    };
    
    // Add to tasks if tasks system exists
    if (typeof tasks !== 'undefined') {
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
}

function verifyInsuranceBenefits(triggerData) {
    if (triggerData.patientId && typeof addBenefitsVerification === 'function') {
        const insuranceInfo = {
            insuranceName: triggerData.primaryInsurance || 'Unknown',
            memberID: triggerData.memberID || '',
            groupNumber: triggerData.groupNumber || ''
        };
        addBenefitsVerification(triggerData.patientId, insuranceInfo);
    }
}

function sendWelcomeMessage(triggerData) {
    // Log welcome message sent
    console.log(`Welcome message sent to ${triggerData.patientName || 'patient'}`);
}

function assignCaseManager(triggerData) {
    // Assign case manager based on workload or specialty
    console.log(`Case manager assigned for ${triggerData.patientName || 'patient'}`);
}

// Utility functions
function isWithinLastWeek(dateString) {
    const date = new Date(dateString);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return date >= weekAgo;
}

function logWorkflowExecution(item, eventType, details) {
    const logEntry = {
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        eventType: eventType,
        itemName: item.name || item.ruleName || 'Unknown',
        details: details,
        success: true
    };
    
    workflowData.executionLog.push(logEntry);
    
    // Keep only last 1000 log entries
    if (workflowData.executionLog.length > 1000) {
        workflowData.executionLog = workflowData.executionLog.slice(-1000);
    }
}

// Trigger workflow based on events
function triggerWorkflow(eventType, eventData) {
    Object.values(workflowTemplates).forEach(template => {
        if (template.trigger === eventType) {
            startWorkflow(template.id, eventType, eventData);
        }
    });
}

// Global event listeners for automatic workflow triggering
function setupWorkflowTriggers() {
    // Override patient addition to trigger workflow
    const originalAddPatient = window.addNewPatient;
    window.addNewPatient = function(...args) {
        const result = originalAddPatient?.apply(this, args);
        
        // Trigger new patient onboarding workflow
        if (patients.length > 0) {
            const newPatient = patients[patients.length - 1];
            triggerWorkflow('patient_added', {
                patientId: newPatient.id,
                patientName: `${newPatient.firstName} ${newPatient.lastName}`,
                primaryInsurance: newPatient.primaryInsurance,
                memberID: newPatient.memberID,
                groupNumber: newPatient.groupNumber
            });
        }
        
        return result;
    };
    
    // Override provider addition to trigger workflow
    const originalAddProvider = window.addNewProvider;
    window.addNewProvider = function(...args) {
        const result = originalAddProvider?.apply(this, args);
        
        // Trigger provider credentialing workflow
        if (providers.length > 0) {
            const newProvider = providers[providers.length - 1];
            triggerWorkflow('provider_added', {
                providerId: newProvider.id,
                providerName: newProvider.name,
                specialty: newProvider.specialty
            });
        }
        
        return result;
    };
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    initializeWorkflowEngine();
    setupWorkflowTriggers();
});

// Export functions for global access
window.workflowEngine = {
    initializeWorkflowEngine,
    startWorkflow,
    triggerWorkflow,
    checkAutomationRules,
    processScheduledWorkflows,
    loadWorkflowData,
    saveWorkflowData
};
