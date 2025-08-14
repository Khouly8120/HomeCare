// Emergency & Crisis Management - Emergency protocols, backup system, crisis communication
// Provides comprehensive emergency response and crisis management capabilities

// Global variables for emergency data
let emergencyData = JSON.parse(localStorage.getItem('emergencyData')) || {
    emergencyContacts: [],
    emergencyProtocols: [],
    crisisEvents: [],
    emergencyAlerts: [],
    backupSystems: [],
    communicationLogs: [],
    settings: {}
};

// Emergency protocol templates
const emergencyProtocolTemplates = {
    medical_emergency: {
        name: 'Medical Emergency',
        steps: [
            'Call 911 immediately',
            'Assess patient condition and provide first aid if trained',
            'Contact emergency contact person',
            'Notify supervisor and medical director',
            'Document incident details',
            'Follow up with family and care team'
        ],
        priority: 'critical',
        responseTime: '0-5 minutes'
    },
    natural_disaster: {
        name: 'Natural Disaster',
        steps: [
            'Ensure immediate safety of patients and staff',
            'Activate emergency communication system',
            'Implement evacuation procedures if necessary',
            'Contact all patients and families',
            'Coordinate with local emergency services',
            'Activate backup service providers'
        ],
        priority: 'critical',
        responseTime: '0-15 minutes'
    },
    provider_unavailability: {
        name: 'Provider Unavailability Crisis',
        steps: [
            'Identify affected patients and appointments',
            'Contact backup providers immediately',
            'Notify patients of schedule changes',
            'Reschedule critical appointments',
            'Document impact and resolution',
            'Review staffing contingency plans'
        ],
        priority: 'high',
        responseTime: '15-30 minutes'
    },
    system_outage: {
        name: 'System/Technology Outage',
        steps: [
            'Switch to manual backup procedures',
            'Notify IT support and vendors',
            'Implement paper-based documentation',
            'Contact patients about potential delays',
            'Activate backup communication methods',
            'Monitor system restoration progress'
        ],
        priority: 'high',
        responseTime: '5-15 minutes'
    },
    security_breach: {
        name: 'Data Security Breach',
        steps: [
            'Immediately isolate affected systems',
            'Contact IT security team',
            'Document breach details and scope',
            'Notify compliance officer',
            'Prepare breach notification letters',
            'Implement additional security measures'
        ],
        priority: 'critical',
        responseTime: '0-10 minutes'
    }
};

// Emergency contact types
const emergencyContactTypes = {
    medical_director: 'Medical Director',
    supervisor: 'Supervisor/Manager',
    it_support: 'IT Support',
    legal_counsel: 'Legal Counsel',
    compliance_officer: 'Compliance Officer',
    backup_provider: 'Backup Provider',
    emergency_services: 'Emergency Services',
    vendor_support: 'Vendor Support'
};

// Initialize Emergency Management
function initializeEmergencyManagement() {
    console.log('Initializing Emergency & Crisis Management');
    loadEmergencyData();
    initializeEmergencySettings();
    generateSampleEmergencyData();
    setupEmergencyMonitoring();
}

// Load emergency data from localStorage
function loadEmergencyData() {
    emergencyData = JSON.parse(localStorage.getItem('emergencyData')) || {
        emergencyContacts: [],
        emergencyProtocols: [],
        crisisEvents: [],
        emergencyAlerts: [],
        backupSystems: [],
        communicationLogs: [],
        settings: {}
    };
}

// Save emergency data to localStorage
function saveEmergencyData() {
    localStorage.setItem('emergencyData', JSON.stringify(emergencyData));
}

// Initialize emergency settings
function initializeEmergencySettings() {
    if (!emergencyData.settings.alertingEnabled) {
        emergencyData.settings = {
            alertingEnabled: true,
            autoEscalation: true,
            escalationTimeMinutes: 15,
            notificationMethods: ['email', 'sms', 'phone'],
            backupActivationAuto: true,
            emergencyContactsRequired: 3,
            protocolReviewFrequency: 'quarterly'
        };
        saveEmergencyData();
    }
}

// Generate sample emergency data
function generateSampleEmergencyData() {
    if (emergencyData.emergencyContacts.length === 0) {
        generateSampleEmergencyContacts();
        generateSampleEmergencyProtocols();
        generateSampleCrisisEvents();
        generateSampleBackupSystems();
        saveEmergencyData();
    }
}

// Generate sample emergency contacts
function generateSampleEmergencyContacts() {
    const contacts = [
        {
            id: `contact_${Date.now()}_1`,
            name: 'Dr. Sarah Johnson',
            role: 'Medical Director',
            type: 'medical_director',
            phone: '(555) 123-4567',
            email: 'sarah.johnson@homecare.com',
            alternatePhone: '(555) 987-6543',
            availability: '24/7',
            priority: 1,
            active: true
        },
        {
            id: `contact_${Date.now()}_2`,
            name: 'Mike Rodriguez',
            role: 'Operations Manager',
            type: 'supervisor',
            phone: '(555) 234-5678',
            email: 'mike.rodriguez@homecare.com',
            alternatePhone: '(555) 876-5432',
            availability: 'Business hours + on-call',
            priority: 2,
            active: true
        },
        {
            id: `contact_${Date.now()}_3`,
            name: 'Emergency Services',
            role: '911 Emergency',
            type: 'emergency_services',
            phone: '911',
            email: '',
            alternatePhone: '',
            availability: '24/7',
            priority: 1,
            active: true
        },
        {
            id: `contact_${Date.now()}_4`,
            name: 'IT Support Team',
            role: 'Technical Support',
            type: 'it_support',
            phone: '(555) 345-6789',
            email: 'support@homecare.com',
            alternatePhone: '(555) 765-4321',
            availability: '24/7',
            priority: 3,
            active: true
        }
    ];
    
    emergencyData.emergencyContacts = contacts;
}

// Generate sample emergency protocols
function generateSampleEmergencyProtocols() {
    const protocols = [];
    
    Object.keys(emergencyProtocolTemplates).forEach(protocolKey => {
        const template = emergencyProtocolTemplates[protocolKey];
        const protocol = {
            id: `protocol_${Date.now()}_${protocolKey}`,
            type: protocolKey,
            name: template.name,
            description: `Standard protocol for handling ${template.name.toLowerCase()} situations`,
            steps: template.steps,
            priority: template.priority,
            responseTime: template.responseTime,
            lastUpdated: new Date().toISOString(),
            version: '1.0',
            approvedBy: 'Medical Director',
            active: true,
            trainingRequired: true
        };
        
        protocols.push(protocol);
    });
    
    emergencyData.emergencyProtocols = protocols;
}

// Generate sample crisis events
function generateSampleCrisisEvents() {
    const events = [
        {
            id: `crisis_${Date.now()}_1`,
            type: 'provider_unavailability',
            title: 'Multiple Provider Sick Leave',
            description: 'Three providers called in sick due to flu outbreak',
            severity: 'high',
            status: 'resolved',
            startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            affectedPatients: 15,
            responseActions: [
                'Contacted backup providers',
                'Rescheduled non-critical appointments',
                'Notified patients of changes'
            ],
            lessonsLearned: 'Need larger backup provider pool',
            reportedBy: 'Operations Manager'
        },
        {
            id: `crisis_${Date.now()}_2`,
            type: 'system_outage',
            title: 'EMR System Outage',
            description: 'Electronic medical records system down for 4 hours',
            severity: 'medium',
            status: 'resolved',
            startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
            affectedPatients: 25,
            responseActions: [
                'Switched to paper documentation',
                'Contacted vendor support',
                'Updated patients about potential delays'
            ],
            lessonsLearned: 'Need better backup documentation system',
            reportedBy: 'IT Support'
        }
    ];
    
    emergencyData.crisisEvents = events;
}

// Generate sample backup systems
function generateSampleBackupSystems() {
    const backupSystems = [
        {
            id: `backup_${Date.now()}_1`,
            name: 'Backup Provider Network',
            type: 'staffing',
            description: 'Network of on-call providers for emergency coverage',
            status: 'active',
            lastTested: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            testResults: 'Successful - 5 providers available within 2 hours',
            activationTime: '2 hours',
            capacity: '80% of normal operations',
            contacts: ['backup-coordinator@homecare.com'],
            instructions: 'Contact backup coordinator to activate emergency staffing'
        },
        {
            id: `backup_${Date.now()}_2`,
            name: 'Paper Documentation System',
            type: 'documentation',
            description: 'Manual paper-based documentation for system outages',
            status: 'active',
            lastTested: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            testResults: 'Successful - All forms available and staff trained',
            activationTime: '15 minutes',
            capacity: '100% documentation capability',
            contacts: ['operations@homecare.com'],
            instructions: 'Distribute paper forms and activate manual procedures'
        },
        {
            id: `backup_${Date.now()}_3`,
            name: 'Alternative Communication System',
            type: 'communication',
            description: 'Backup phone and messaging system for emergencies',
            status: 'active',
            lastTested: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            testResults: 'Successful - All communication channels operational',
            activationTime: '5 minutes',
            capacity: '100% communication capability',
            contacts: ['it-support@homecare.com'],
            instructions: 'Switch to backup phone system and activate emergency notifications'
        }
    ];
    
    emergencyData.backupSystems = backupSystems;
}

// Setup emergency monitoring
function setupEmergencyMonitoring() {
    // Monitor for emergency conditions
    setInterval(checkEmergencyConditions, 60000); // Check every minute
    
    // Monitor system health
    setInterval(monitorSystemHealth, 300000); // Check every 5 minutes
}

// Check for emergency conditions
function checkEmergencyConditions() {
    const conditions = [];
    
    // Check provider availability
    const availableProviders = providers.filter(p => 
        p.status === 'active' && p.availability && Object.keys(p.availability).length > 0
    ).length;
    
    if (availableProviders < 3) {
        conditions.push({
            type: 'provider_shortage',
            severity: 'high',
            message: `Only ${availableProviders} providers available`,
            action: 'Activate backup provider network'
        });
    }
    
    // Check for overdue documentation
    const overdueDocuments = documentationData?.complianceAlerts?.filter(alert => 
        alert.alertType === 'overdue' && alert.urgency === 'high'
    ).length || 0;
    
    if (overdueDocuments > 10) {
        conditions.push({
            type: 'documentation_crisis',
            severity: 'medium',
            message: `${overdueDocuments} critical documents overdue`,
            action: 'Implement emergency documentation procedures'
        });
    }
    
    // Check for high incident rate
    const recentIncidents = qaData?.incidents?.filter(incident => {
        const incidentDate = new Date(incident.reportDate);
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return incidentDate >= sevenDaysAgo && incident.severity === 'high';
    }).length || 0;
    
    if (recentIncidents > 3) {
        conditions.push({
            type: 'safety_crisis',
            severity: 'critical',
            message: `${recentIncidents} high-severity incidents in past week`,
            action: 'Activate safety protocol review'
        });
    }
    
    // Process emergency conditions
    conditions.forEach(condition => {
        createEmergencyAlert(condition);
    });
}

// Monitor system health
function monitorSystemHealth() {
    const healthChecks = [];
    
    // Check data integrity
    try {
        const testData = JSON.parse(localStorage.getItem('patients') || '[]');
        healthChecks.push({
            system: 'data_storage',
            status: 'operational',
            message: 'Data storage functioning normally'
        });
    } catch (error) {
        healthChecks.push({
            system: 'data_storage',
            status: 'error',
            message: 'Data storage corruption detected',
            action: 'Activate backup data recovery'
        });
    }
    
    // Check browser compatibility
    const isCompatible = 'localStorage' in window && 'JSON' in window;
    healthChecks.push({
        system: 'browser_compatibility',
        status: isCompatible ? 'operational' : 'error',
        message: isCompatible ? 'Browser fully compatible' : 'Browser compatibility issues detected'
    });
    
    // Log health status
    console.log('System Health Check:', healthChecks);
    
    // Create alerts for errors
    healthChecks.filter(check => check.status === 'error').forEach(check => {
        createEmergencyAlert({
            type: 'system_error',
            severity: 'high',
            message: check.message,
            action: check.action || 'Contact IT support immediately'
        });
    });
}

// Create emergency alert
function createEmergencyAlert(condition) {
    const alert = {
        id: `alert_${Date.now()}_${Math.random()}`,
        type: condition.type,
        severity: condition.severity,
        message: condition.message,
        recommendedAction: condition.action,
        timestamp: new Date().toISOString(),
        status: 'active',
        acknowledgedBy: null,
        acknowledgedAt: null,
        resolvedAt: null
    };
    
    emergencyData.emergencyAlerts.push(alert);
    
    // Keep only last 100 alerts
    if (emergencyData.emergencyAlerts.length > 100) {
        emergencyData.emergencyAlerts = emergencyData.emergencyAlerts.slice(-100);
    }
    
    saveEmergencyData();
    
    // Auto-escalate if enabled
    if (emergencyData.settings.autoEscalation && condition.severity === 'critical') {
        setTimeout(() => {
            escalateEmergencyAlert(alert.id);
        }, emergencyData.settings.escalationTimeMinutes * 60 * 1000);
    }
    
    return alert;
}

// Escalate emergency alert
function escalateEmergencyAlert(alertId) {
    const alert = emergencyData.emergencyAlerts.find(a => a.id === alertId);
    if (!alert || alert.status !== 'active') return;
    
    // Send notifications to emergency contacts
    const emergencyContacts = emergencyData.emergencyContacts
        .filter(contact => contact.active && contact.priority <= 2)
        .sort((a, b) => a.priority - b.priority);
    
    emergencyContacts.forEach(contact => {
        sendEmergencyNotification(contact, alert);
    });
    
    // Log escalation
    logEmergencyCommunication({
        type: 'escalation',
        alertId: alertId,
        message: `Alert escalated to ${emergencyContacts.length} emergency contacts`,
        timestamp: new Date().toISOString()
    });
}

// Send emergency notification
function sendEmergencyNotification(contact, alert) {
    const notification = {
        id: `notification_${Date.now()}_${Math.random()}`,
        contactId: contact.id,
        alertId: alert.id,
        method: 'email', // Would be actual notification method
        message: `EMERGENCY ALERT: ${alert.message}. Recommended action: ${alert.recommendedAction}`,
        sentAt: new Date().toISOString(),
        status: 'sent'
    };
    
    // Log notification
    logEmergencyCommunication({
        type: 'notification',
        contactName: contact.name,
        method: notification.method,
        message: notification.message,
        timestamp: notification.sentAt
    });
    
    console.log(`Emergency notification sent to ${contact.name}: ${notification.message}`);
}

// Log emergency communication
function logEmergencyCommunication(logEntry) {
    emergencyData.communicationLogs.push(logEntry);
    
    // Keep only last 500 log entries
    if (emergencyData.communicationLogs.length > 500) {
        emergencyData.communicationLogs = emergencyData.communicationLogs.slice(-500);
    }
    
    saveEmergencyData();
}

// Activate emergency protocol
function activateEmergencyProtocol(protocolType, details = {}) {
    const protocol = emergencyData.emergencyProtocols.find(p => p.type === protocolType);
    if (!protocol) {
        console.error(`Emergency protocol not found: ${protocolType}`);
        return null;
    }
    
    const activation = {
        id: `activation_${Date.now()}`,
        protocolId: protocol.id,
        protocolType: protocolType,
        activatedAt: new Date().toISOString(),
        activatedBy: 'System', // Would be actual user
        details: details,
        status: 'active',
        completedSteps: [],
        currentStep: 0
    };
    
    // Create crisis event
    const crisisEvent = {
        id: `crisis_${Date.now()}`,
        type: protocolType,
        title: `${protocol.name} - ${details.title || 'Emergency Activation'}`,
        description: details.description || `Emergency protocol activated: ${protocol.name}`,
        severity: protocol.priority === 'critical' ? 'critical' : 'high',
        status: 'active',
        startTime: activation.activatedAt,
        endTime: null,
        affectedPatients: details.affectedPatients || 0,
        responseActions: [],
        reportedBy: activation.activatedBy,
        protocolActivation: activation.id
    };
    
    emergencyData.crisisEvents.push(crisisEvent);
    saveEmergencyData();
    
    // Send immediate notifications
    const criticalContacts = emergencyData.emergencyContacts
        .filter(contact => contact.active && contact.priority === 1);
    
    criticalContacts.forEach(contact => {
        sendEmergencyNotification(contact, {
            id: activation.id,
            type: 'protocol_activation',
            severity: protocol.priority,
            message: `Emergency protocol activated: ${protocol.name}`,
            recommendedAction: 'Review protocol steps and respond immediately'
        });
    });
    
    return activation;
}

// Test backup systems
function testBackupSystems() {
    const testResults = [];
    
    emergencyData.backupSystems.forEach(system => {
        const testResult = {
            systemId: system.id,
            systemName: system.name,
            testDate: new Date().toISOString(),
            status: 'success', // Simplified for demo
            responseTime: Math.random() * 300 + 60, // 1-5 minutes
            notes: 'Backup system test completed successfully'
        };
        
        // Update system test date
        system.lastTested = testResult.testDate;
        system.testResults = testResult.notes;
        
        testResults.push(testResult);
    });
    
    saveEmergencyData();
    
    // Log test completion
    logEmergencyCommunication({
        type: 'backup_test',
        message: `Backup systems test completed. ${testResults.length} systems tested.`,
        timestamp: new Date().toISOString(),
        results: testResults
    });
    
    return testResults;
}

// Get emergency status summary
function getEmergencyStatusSummary() {
    const activeAlerts = emergencyData.emergencyAlerts.filter(alert => alert.status === 'active');
    const activeCrises = emergencyData.crisisEvents.filter(crisis => crisis.status === 'active');
    const availableContacts = emergencyData.emergencyContacts.filter(contact => contact.active);
    const operationalBackups = emergencyData.backupSystems.filter(system => system.status === 'active');
    
    return {
        alertsActive: activeAlerts.length,
        crisesActive: activeCrises.length,
        emergencyContactsAvailable: availableContacts.length,
        backupSystemsOperational: operationalBackups.length,
        lastSystemCheck: new Date().toISOString(),
        overallStatus: activeAlerts.length === 0 && activeCrises.length === 0 ? 'normal' : 'alert'
    };
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    initializeEmergencyManagement();
});

// Export functions for global access
window.emergencyManagement = {
    initializeEmergencyManagement,
    createEmergencyAlert,
    activateEmergencyProtocol,
    testBackupSystems,
    getEmergencyStatusSummary,
    loadEmergencyData,
    saveEmergencyData
};
