// Actions Needed - Comprehensive Workflow Management System
// Tracks every operational step from patient interest through billing and LHCSA licensing

// Global variables for actions data
let actionsData = JSON.parse(localStorage.getItem('actionsData')) || {
    patientWorkflows: [],
    lhcsaActions: [],
    templates: {},
    settings: {}
};

// Complete workflow steps for patient processing
const patientWorkflowSteps = {
    initial_contact: {
        id: 'initial_contact',
        name: 'Initial Patient Contact',
        description: 'Call patient to confirm interest and gather initial information',
        category: 'intake',
        priority: 'high',
        estimatedTime: 15,
        requiredFields: ['contactAttempts', 'contactResult', 'patientConfirmed'],
        nextSteps: ['insurance_verification'],
        instructions: [
            'Call patient within 24 hours of interest indication',
            'Confirm patient is still interested in PT services',
            'Gather basic contact and insurance information',
            'Explain next steps in the process',
            'Schedule follow-up if patient unavailable'
        ]
    },
    insurance_verification: {
        id: 'insurance_verification',
        name: 'Insurance Verification & Benefits Check',
        description: 'Verify insurance coverage and check PT benefits',
        category: 'insurance',
        priority: 'high',
        estimatedTime: 30,
        requiredFields: ['insuranceVerified', 'benefitsChecked', 'copayAmount', 'deductible'],
        nextSteps: ['authorization_request'],
        instructions: [
            'Call insurance company to verify active coverage',
            'Check PT benefits and visit limits',
            'Determine copay and deductible amounts',
            'Verify in-network provider status',
            'Document all insurance details in system'
        ]
    },
    authorization_request: {
        id: 'authorization_request',
        name: 'Prior Authorization Request',
        description: 'Submit prior authorization request to insurance',
        category: 'authorization',
        priority: 'high',
        estimatedTime: 45,
        requiredFields: ['authSubmitted', 'authNumber', 'approvedVisits', 'expirationDate'],
        nextSteps: ['provider_credentialing'],
        instructions: [
            'Gather required medical documentation',
            'Complete prior authorization forms',
            'Submit to insurance company',
            'Follow up on authorization status',
            'Document authorization details'
        ]
    },
    provider_credentialing: {
        id: 'provider_credentialing',
        name: 'Provider Credentialing Check',
        description: 'Verify provider is credentialed with patient insurance',
        category: 'credentialing',
        priority: 'medium',
        estimatedTime: 20,
        requiredFields: ['providerCredentialed', 'credentialingStatus', 'effectiveDate'],
        nextSteps: ['provider_matching'],
        instructions: [
            'Check provider credentialing database',
            'Verify provider is in-network with patient insurance',
            'Confirm credentialing is current and active',
            'Document credentialing status',
            'Flag any credentialing issues'
        ]
    },
    provider_matching: {
        id: 'provider_matching',
        name: 'Provider-Patient Matching',
        description: 'Match patient with appropriate PT based on location and availability',
        category: 'scheduling',
        priority: 'medium',
        estimatedTime: 25,
        requiredFields: ['providerAssigned', 'matchingCriteria', 'providerNotified'],
        nextSteps: ['appointment_scheduling'],
        instructions: [
            'Review patient location and preferences',
            'Check provider availability and caseload',
            'Consider specialty requirements',
            'Assign best-matched provider',
            'Notify provider of new patient assignment'
        ]
    },
    appointment_scheduling: {
        id: 'appointment_scheduling',
        name: 'Initial Appointment Scheduling',
        description: 'Schedule initial evaluation appointment with patient and provider',
        category: 'scheduling',
        priority: 'high',
        estimatedTime: 20,
        requiredFields: ['appointmentScheduled', 'appointmentDate', 'appointmentTime', 'location'],
        nextSteps: ['appointment_confirmation'],
        instructions: [
            'Coordinate schedules between patient and provider',
            'Schedule initial evaluation appointment',
            'Confirm appointment details with both parties',
            'Send appointment reminders',
            'Document appointment in system'
        ]
    },
    appointment_confirmation: {
        id: 'appointment_confirmation',
        name: 'Appointment Confirmation',
        description: 'Confirm appointment with patient and provider 24-48 hours prior',
        category: 'scheduling',
        priority: 'medium',
        estimatedTime: 10,
        requiredFields: ['patientConfirmed', 'providerConfirmed', 'confirmationDate'],
        nextSteps: ['visit_documentation'],
        instructions: [
            'Call patient 24-48 hours before appointment',
            'Confirm patient will attend appointment',
            'Remind patient of required documents',
            'Confirm with provider',
            'Update appointment status'
        ]
    },
    visit_documentation: {
        id: 'visit_documentation',
        name: 'Visit Documentation & Notes',
        description: 'Ensure complete documentation for each visit',
        category: 'documentation',
        priority: 'high',
        estimatedTime: 30,
        requiredFields: ['visitNotes', 'treatmentPlan', 'progressNotes', 'nextAppointment'],
        nextSteps: ['billing_submission'],
        instructions: [
            'Review visit documentation for completeness',
            'Ensure all required fields are completed',
            'Verify treatment plan is updated',
            'Check progress notes are detailed',
            'Schedule next appointment if needed'
        ]
    },
    billing_submission: {
        id: 'billing_submission',
        name: 'Billing & Claims Submission',
        description: 'Submit claims to insurance and track payment',
        category: 'billing',
        priority: 'high',
        estimatedTime: 25,
        requiredFields: ['claimSubmitted', 'claimNumber', 'submissionDate', 'expectedPayment'],
        nextSteps: ['payment_tracking'],
        instructions: [
            'Prepare and submit insurance claims',
            'Verify all billing codes are correct',
            'Include required documentation',
            'Track claim submission status',
            'Follow up on any claim rejections'
        ]
    },
    payment_tracking: {
        id: 'payment_tracking',
        name: 'Payment Tracking & Follow-up',
        description: 'Track insurance payments and patient collections',
        category: 'billing',
        priority: 'medium',
        estimatedTime: 15,
        requiredFields: ['paymentReceived', 'paymentAmount', 'patientBalance', 'collectionStatus'],
        nextSteps: ['outcome_tracking'],
        instructions: [
            'Monitor insurance payment status',
            'Track patient copay collections',
            'Follow up on outstanding balances',
            'Send patient statements if needed',
            'Document all payment activities'
        ]
    },
    outcome_tracking: {
        id: 'outcome_tracking',
        name: 'Patient Outcome & Satisfaction',
        description: 'Track patient outcomes and collect feedback',
        category: 'quality',
        priority: 'low',
        estimatedTime: 20,
        requiredFields: ['outcomesMeasured', 'satisfactionScore', 'feedbackCollected'],
        nextSteps: ['case_closure'],
        instructions: [
            'Measure patient functional outcomes',
            'Collect patient satisfaction feedback',
            'Document treatment effectiveness',
            'Identify areas for improvement',
            'Share feedback with provider'
        ]
    },
    case_closure: {
        id: 'case_closure',
        name: 'Case Closure & Follow-up',
        description: 'Close case and schedule follow-up if needed',
        category: 'closure',
        priority: 'low',
        estimatedTime: 15,
        requiredFields: ['caseStatus', 'dischargeDate', 'followUpNeeded', 'referralsMade'],
        nextSteps: [],
        instructions: [
            'Complete final documentation',
            'Update case status to closed',
            'Schedule follow-up appointments if needed',
            'Make referrals to other services',
            'Archive case documentation'
        ]
    }
};

// LHCSA (Licensed Home Care Services Agency) action plan
const lhcsaActionPlan = {
    application_preparation: {
        id: 'application_preparation',
        name: 'LHCSA Application Preparation',
        description: 'Gather all required documents and information for LHCSA application',
        category: 'licensing',
        priority: 'high',
        estimatedTime: 480, // 8 hours
        requiredDocuments: [
            'Business incorporation documents',
            'Federal Tax ID (EIN)',
            'Professional liability insurance',
            'Workers compensation insurance',
            'Surety bond ($50,000 minimum)',
            'Administrator qualifications and resume',
            'Policies and procedures manual',
            'Emergency preparedness plan',
            'Quality assurance program',
            'Staff training program documentation'
        ],
        nextSteps: ['doh_submission'],
        instructions: [
            'Incorporate business entity in New York State',
            'Obtain Federal Tax ID number',
            'Secure required insurance policies',
            'Hire qualified administrator (RN with management experience)',
            'Develop comprehensive policies and procedures',
            'Create emergency and quality assurance plans',
            'Prepare staff training documentation',
            'Complete LHCSA application forms'
        ]
    },
    doh_submission: {
        id: 'doh_submission',
        name: 'DOH Application Submission',
        description: 'Submit complete application to NY Department of Health',
        category: 'licensing',
        priority: 'high',
        estimatedTime: 120,
        requiredFields: ['applicationSubmitted', 'submissionDate', 'applicationNumber', 'feesPaid'],
        nextSteps: ['initial_review'],
        instructions: [
            'Complete all application forms accurately',
            'Include all required supporting documents',
            'Pay application fees ($2,000+)',
            'Submit via DOH online portal or mail',
            'Retain confirmation of submission',
            'Set up tracking system for application status'
        ]
    },
    initial_review: {
        id: 'initial_review',
        name: 'DOH Initial Review Process',
        description: 'DOH conducts initial review of application and documents',
        category: 'licensing',
        priority: 'medium',
        estimatedTime: 2160, // 36 hours over several weeks
        requiredFields: ['reviewStarted', 'deficienciesReceived', 'responsesSubmitted'],
        nextSteps: ['site_inspection'],
        instructions: [
            'Monitor application status regularly',
            'Respond promptly to any deficiency letters',
            'Provide additional documentation as requested',
            'Maintain communication with DOH reviewer',
            'Prepare for potential site inspection'
        ]
    },
    site_inspection: {
        id: 'site_inspection',
        name: 'DOH Site Inspection',
        description: 'Department of Health conducts on-site inspection',
        category: 'licensing',
        priority: 'high',
        estimatedTime: 240,
        requiredFields: ['inspectionScheduled', 'inspectionDate', 'inspectionResults', 'correctiveActions'],
        nextSteps: ['license_approval'],
        instructions: [
            'Prepare office space for inspection',
            'Ensure all policies and procedures are accessible',
            'Have administrator and key staff available',
            'Demonstrate compliance with all regulations',
            'Address any deficiencies immediately',
            'Submit corrective action plans if required'
        ]
    },
    license_approval: {
        id: 'license_approval',
        name: 'License Approval & Issuance',
        description: 'Receive LHCSA license approval and begin operations',
        category: 'licensing',
        priority: 'high',
        estimatedTime: 60,
        requiredFields: ['licenseApproved', 'licenseNumber', 'effectiveDate', 'expirationDate'],
        nextSteps: ['operational_setup'],
        instructions: [
            'Receive official license notification',
            'Download and print license certificate',
            'Update business registrations with license number',
            'Notify insurance companies of license approval',
            'Begin accepting patient referrals',
            'Set up ongoing compliance monitoring'
        ]
    },
    operational_setup: {
        id: 'operational_setup',
        name: 'Operational Setup & Compliance',
        description: 'Establish ongoing operations and compliance systems',
        category: 'operations',
        priority: 'medium',
        estimatedTime: 480,
        requiredFields: ['systemsImplemented', 'staffHired', 'contractsEstablished', 'marketingLaunched'],
        nextSteps: [],
        instructions: [
            'Implement patient management systems',
            'Hire and train clinical staff',
            'Establish provider contracts',
            'Set up billing and payment systems',
            'Launch marketing and referral programs',
            'Begin quality assurance monitoring'
        ]
    }
};

// Initialize Actions Needed System
function initializeActionsNeeded() {
    console.log('Initializing Actions Needed System');
    loadActionsData();
    initializeActionsSettings();
    generateSampleWorkflows();
    setupActionsInterface();
}

// Load actions data from localStorage
function loadActionsData() {
    actionsData = JSON.parse(localStorage.getItem('actionsData')) || {
        patientWorkflows: [],
        lhcsaActions: [],
        templates: {},
        settings: {}
    };
}

// Save actions data to localStorage
function saveActionsData() {
    localStorage.setItem('actionsData', JSON.stringify(actionsData));
}

// Initialize actions settings
function initializeActionsSettings() {
    if (!actionsData.settings.autoCreateWorkflows) {
        actionsData.settings = {
            autoCreateWorkflows: true,
            reminderNotifications: true,
            overdueAlerts: true,
            autoAssignTasks: true,
            trackingEnabled: true,
            defaultPriority: 'medium'
        };
        saveActionsData();
    }
}

// Generate sample workflows for demonstration
function generateSampleWorkflows() {
    if (actionsData.patientWorkflows.length === 0) {
        generateSamplePatientWorkflows();
        generateSampleLHCSAWorkflow();
        saveActionsData();
    }
}

// Generate sample patient workflows
function generateSamplePatientWorkflows() {
    // Get interested patients from the system
    const interestedPatients = (window.patients || []).filter(p => p.isInterested);
    
    interestedPatients.slice(0, 3).forEach(patient => {
        const workflow = createPatientWorkflow(patient);
        actionsData.patientWorkflows.push(workflow);
    });
}

// Create patient workflow
function createPatientWorkflow(patient) {
    const workflowId = `workflow_${patient.id}_${Date.now()}`;
    const workflow = {
        id: workflowId,
        patientId: patient.id,
        patientName: patient.name,
        status: 'active',
        createdDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        currentStep: 'initial_contact',
        completedSteps: [],
        steps: {},
        notes: [],
        assignedTo: 'Operations Team'
    };

    // Initialize all workflow steps
    Object.keys(patientWorkflowSteps).forEach(stepId => {
        const stepTemplate = patientWorkflowSteps[stepId];
        workflow.steps[stepId] = {
            id: stepId,
            name: stepTemplate.name,
            description: stepTemplate.description,
            category: stepTemplate.category,
            priority: stepTemplate.priority,
            status: stepId === 'initial_contact' ? 'pending' : 'not_started',
            assignedTo: 'Operations Team',
            dueDate: calculateDueDate(stepTemplate.estimatedTime),
            estimatedTime: stepTemplate.estimatedTime,
            actualTime: null,
            startedDate: null,
            completedDate: null,
            requiredFields: stepTemplate.requiredFields || [],
            completedFields: {},
            instructions: stepTemplate.instructions || [],
            notes: []
        };
    });

    return workflow;
}

// Calculate due date based on estimated time
function calculateDueDate(estimatedMinutes) {
    const now = new Date();
    const dueDate = new Date(now.getTime() + (estimatedMinutes * 60 * 1000));
    return dueDate.toISOString();
}

// Generate sample LHCSA workflow
function generateSampleLHCSAWorkflow() {
    const lhcsaWorkflow = {
        id: `lhcsa_workflow_${Date.now()}`,
        name: 'LHCSA License Application Process',
        type: 'lhcsa_licensing',
        status: 'active',
        createdDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        currentStep: 'application_preparation',
        completedSteps: [],
        steps: {},
        notes: [],
        assignedTo: 'Management Team',
        estimatedCompletion: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days
    };

    // Initialize LHCSA workflow steps
    Object.keys(lhcsaActionPlan).forEach(stepId => {
        const stepTemplate = lhcsaActionPlan[stepId];
        lhcsaWorkflow.steps[stepId] = {
            id: stepId,
            name: stepTemplate.name,
            description: stepTemplate.description,
            category: stepTemplate.category,
            priority: stepTemplate.priority,
            status: stepId === 'application_preparation' ? 'pending' : 'not_started',
            assignedTo: 'Management Team',
            dueDate: calculateDueDate(stepTemplate.estimatedTime),
            estimatedTime: stepTemplate.estimatedTime,
            actualTime: null,
            startedDate: null,
            completedDate: null,
            requiredDocuments: stepTemplate.requiredDocuments || [],
            completedDocuments: [],
            requiredFields: stepTemplate.requiredFields || [],
            completedFields: {},
            instructions: stepTemplate.instructions || [],
            notes: []
        };
    });

    actionsData.lhcsaActions.push(lhcsaWorkflow);
}

// Setup actions interface
function setupActionsInterface() {
    // Add actions needed button to navigation if not exists
    addActionsNeededNavigation();
}

// Add actions needed navigation
function addActionsNeededNavigation() {
    const sidebar = document.querySelector('.sidebar .nav');
    if (sidebar && !document.querySelector('a[onclick*="actions-needed"]')) {
        const actionsNavItem = document.createElement('li');
        actionsNavItem.className = 'nav-item';
        actionsNavItem.innerHTML = `
            <a class="nav-link" href="#" onclick="showSection('actions-needed')">
                <i class="fas fa-tasks"></i> Actions Needed
            </a>
        `;
        
        // Insert after dashboard
        const dashboardItem = sidebar.querySelector('li:first-child');
        if (dashboardItem) {
            dashboardItem.insertAdjacentElement('afterend', actionsNavItem);
        }
    }
}

// Create patient workflow when patient marked as interested
function onPatientInterested(patient) {
    if (actionsData.settings.autoCreateWorkflows) {
        const existingWorkflow = actionsData.patientWorkflows.find(w => w.patientId === patient.id);
        
        if (!existingWorkflow) {
            const workflow = createPatientWorkflow(patient);
            actionsData.patientWorkflows.push(workflow);
            saveActionsData();
            
            console.log(`Created workflow for interested patient: ${patient.name}`);
            
            // Trigger notification if enabled
            if (actionsData.settings.reminderNotifications) {
                createActionReminder(workflow.steps.initial_contact, workflow);
            }
        }
    }
}

// Update workflow step
function updateWorkflowStep(workflowId, stepId, updates) {
    const workflow = actionsData.patientWorkflows.find(w => w.id === workflowId) ||
                    actionsData.lhcsaActions.find(w => w.id === workflowId);
    
    if (!workflow || !workflow.steps[stepId]) {
        console.error(`Workflow or step not found: ${workflowId}, ${stepId}`);
        return false;
    }

    const step = workflow.steps[stepId];
    
    // Update step properties
    Object.keys(updates).forEach(key => {
        step[key] = updates[key];
    });

    // Update timestamps
    step.lastUpdated = new Date().toISOString();
    workflow.lastUpdated = new Date().toISOString();

    // Handle status changes
    if (updates.status === 'completed' && step.status !== 'completed') {
        step.completedDate = new Date().toISOString();
        workflow.completedSteps.push(stepId);
        
        // Move to next step
        const nextSteps = patientWorkflowSteps[stepId]?.nextSteps || lhcsaActionPlan[stepId]?.nextSteps || [];
        if (nextSteps.length > 0) {
            const nextStepId = nextSteps[0];
            if (workflow.steps[nextStepId]) {
                workflow.steps[nextStepId].status = 'pending';
                workflow.currentStep = nextStepId;
            }
        }
    } else if (updates.status === 'in_progress' && step.status !== 'in_progress') {
        step.startedDate = new Date().toISOString();
    }

    saveActionsData();
    return true;
}

// Create action reminder
function createActionReminder(step, workflow) {
    const reminder = {
        id: `reminder_${Date.now()}`,
        workflowId: workflow.id,
        stepId: step.id,
        type: 'step_reminder',
        title: `Action Required: ${step.name}`,
        message: `${step.description} for ${workflow.patientName || workflow.name}`,
        priority: step.priority,
        dueDate: step.dueDate,
        createdDate: new Date().toISOString(),
        status: 'active'
    };

    // In a real system, this would create notifications
    console.log('Action Reminder Created:', reminder);
    
    return reminder;
}

// Get overdue actions
function getOverdueActions() {
    const now = new Date();
    const overdueActions = [];

    // Check patient workflows
    actionsData.patientWorkflows.forEach(workflow => {
        Object.values(workflow.steps).forEach(step => {
            if (step.status === 'pending' && new Date(step.dueDate) < now) {
                overdueActions.push({
                    type: 'patient_workflow',
                    workflowId: workflow.id,
                    stepId: step.id,
                    patientName: workflow.patientName,
                    stepName: step.name,
                    dueDate: step.dueDate,
                    priority: step.priority,
                    overdueDays: Math.floor((now - new Date(step.dueDate)) / (1000 * 60 * 60 * 24))
                });
            }
        });
    });

    // Check LHCSA workflows
    actionsData.lhcsaActions.forEach(workflow => {
        Object.values(workflow.steps).forEach(step => {
            if (step.status === 'pending' && new Date(step.dueDate) < now) {
                overdueActions.push({
                    type: 'lhcsa_workflow',
                    workflowId: workflow.id,
                    stepId: step.id,
                    workflowName: workflow.name,
                    stepName: step.name,
                    dueDate: step.dueDate,
                    priority: step.priority,
                    overdueDays: Math.floor((now - new Date(step.dueDate)) / (1000 * 60 * 60 * 24))
                });
            }
        });
    });

    return overdueActions.sort((a, b) => b.overdueDays - a.overdueDays);
}

// Get actions summary
function getActionsSummary() {
    const summary = {
        totalPatientWorkflows: actionsData.patientWorkflows.length,
        activePatientWorkflows: actionsData.patientWorkflows.filter(w => w.status === 'active').length,
        totalLHCSAActions: actionsData.lhcsaActions.length,
        activeLHCSAActions: actionsData.lhcsaActions.filter(w => w.status === 'active').length,
        overdueActions: getOverdueActions().length,
        pendingActions: 0,
        completedToday: 0
    };

    // Count pending actions
    actionsData.patientWorkflows.forEach(workflow => {
        Object.values(workflow.steps).forEach(step => {
            if (step.status === 'pending') summary.pendingActions++;
        });
    });

    actionsData.lhcsaActions.forEach(workflow => {
        Object.values(workflow.steps).forEach(step => {
            if (step.status === 'pending') summary.pendingActions++;
        });
    });

    // Count completed today
    const today = new Date().toISOString().split('T')[0];
    actionsData.patientWorkflows.forEach(workflow => {
        Object.values(workflow.steps).forEach(step => {
            if (step.completedDate && step.completedDate.startsWith(today)) {
                summary.completedToday++;
            }
        });
    });

    return summary;
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeActionsNeeded, 2000);
});

// Export functions for global access
window.actionsNeeded = {
    initializeActionsNeeded,
    onPatientInterested,
    updateWorkflowStep,
    getOverdueActions,
    getActionsSummary,
    loadActionsData,
    saveActionsData
};
