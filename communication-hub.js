// Communication Hub - Integrated messaging system
// Handles SMS/email templates, bulk communications, and communication logging

// Global variables for communication data
let communicationData = JSON.parse(localStorage.getItem('communicationData')) || {
    templates: [],
    messages: [],
    campaigns: [],
    contacts: [],
    settings: {}
};

// Predefined message templates
const defaultTemplates = {
    appointment_reminder: {
        id: 'appointment_reminder',
        name: 'Appointment Reminder',
        category: 'scheduling',
        type: 'both', // sms, email, both
        subject: 'Appointment Reminder - {{patientName}}',
        smsContent: 'Hi {{patientName}}, this is a reminder of your {{serviceType}} appointment on {{appointmentDate}} at {{appointmentTime}} with {{providerName}}. Please confirm by replying YES or call {{clinicPhone}}.',
        emailContent: `
            <h3>Appointment Reminder</h3>
            <p>Dear {{patientName}},</p>
            <p>This is a friendly reminder of your upcoming appointment:</p>
            <ul>
                <li><strong>Service:</strong> {{serviceType}}</li>
                <li><strong>Date:</strong> {{appointmentDate}}</li>
                <li><strong>Time:</strong> {{appointmentTime}}</li>
                <li><strong>Provider:</strong> {{providerName}}</li>
                <li><strong>Location:</strong> {{appointmentLocation}}</li>
            </ul>
            <p>Please confirm your attendance or contact us at {{clinicPhone}} if you need to reschedule.</p>
            <p>Best regards,<br>{{clinicName}} Team</p>
        `,
        variables: ['patientName', 'serviceType', 'appointmentDate', 'appointmentTime', 'providerName', 'appointmentLocation', 'clinicPhone', 'clinicName']
    },
    welcome_new_patient: {
        id: 'welcome_new_patient',
        name: 'Welcome New Patient',
        category: 'onboarding',
        type: 'email',
        subject: 'Welcome to {{clinicName}} - {{patientName}}',
        emailContent: `
            <h2>Welcome to {{clinicName}}!</h2>
            <p>Dear {{patientName}},</p>
            <p>We're excited to welcome you to our home care family! Your health and comfort are our top priorities.</p>
            
            <h4>What to Expect:</h4>
            <ul>
                <li>Initial evaluation within 24-48 hours</li>
                <li>Personalized treatment plan</li>
                <li>Regular progress updates</li>
                <li>24/7 support availability</li>
            </ul>
            
            <h4>Important Information:</h4>
            <ul>
                <li><strong>Your Case Manager:</strong> {{caseManager}}</li>
                <li><strong>Emergency Contact:</strong> {{emergencyPhone}}</li>
                <li><strong>Portal Access:</strong> {{portalLink}}</li>
            </ul>
            
            <p>Please ensure you have the following documents ready:</p>
            <ul>
                <li>Insurance cards (front and back)</li>
                <li>Photo ID</li>
                <li>Physician orders/referrals</li>
                <li>Medication list</li>
            </ul>
            
            <p>If you have any questions, please don't hesitate to contact us at {{clinicPhone}}.</p>
            <p>Welcome aboard!</p>
            <p>{{clinicName}} Team</p>
        `,
        variables: ['patientName', 'clinicName', 'caseManager', 'emergencyPhone', 'portalLink', 'clinicPhone']
    },
    document_request: {
        id: 'document_request',
        name: 'Document Request',
        category: 'documentation',
        type: 'both',
        subject: 'Document Required - {{patientName}}',
        smsContent: 'Hi {{patientName}}, we need your {{documentType}} for your care. Please upload to our portal or call {{clinicPhone}}. Due: {{dueDate}}',
        emailContent: `
            <h3>Document Request</h3>
            <p>Dear {{patientName}},</p>
            <p>We need the following document to continue providing your care:</p>
            <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 15px 0;">
                <strong>Required Document:</strong> {{documentType}}<br>
                <strong>Due Date:</strong> {{dueDate}}<br>
                <strong>Purpose:</strong> {{documentPurpose}}
            </div>
            
            <h4>How to Submit:</h4>
            <ol>
                <li>Upload through our patient portal: {{portalLink}}</li>
                <li>Email to: {{documentEmail}}</li>
                <li>Fax to: {{faxNumber}}</li>
                <li>Call us at {{clinicPhone}} for assistance</li>
            </ol>
            
            <p>If you have any questions about this requirement, please contact your case manager {{caseManager}} at {{caseManagerPhone}}.</p>
            <p>Thank you for your prompt attention to this matter.</p>
            <p>{{clinicName}} Team</p>
        `,
        variables: ['patientName', 'documentType', 'dueDate', 'documentPurpose', 'portalLink', 'documentEmail', 'faxNumber', 'clinicPhone', 'caseManager', 'caseManagerPhone', 'clinicName']
    },
    satisfaction_survey: {
        id: 'satisfaction_survey',
        name: 'Satisfaction Survey',
        category: 'feedback',
        type: 'email',
        subject: 'How was your experience? - {{patientName}}',
        emailContent: `
            <h3>We Value Your Feedback</h3>
            <p>Dear {{patientName}},</p>
            <p>Thank you for choosing {{clinicName}} for your home care needs. We hope you're satisfied with the care you've received from {{providerName}}.</p>
            
            <p>Your feedback is incredibly important to us and helps us improve our services. Please take a few minutes to share your experience:</p>
            
            <div style="text-align: center; margin: 20px 0;">
                <a href="{{surveyLink}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Complete Survey (2 minutes)
                </a>
            </div>
            
            <p>Your responses are confidential and will be used solely to improve our services.</p>
            
            <p>If you have any immediate concerns, please contact us directly at {{clinicPhone}}.</p>
            
            <p>Thank you for your time and trust in our care.</p>
            <p>{{clinicName}} Team</p>
        `,
        variables: ['patientName', 'clinicName', 'providerName', 'surveyLink', 'clinicPhone']
    },
    authorization_expiring: {
        id: 'authorization_expiring',
        name: 'Authorization Expiring',
        category: 'authorization',
        type: 'both',
        subject: 'Action Required: Authorization Expiring - {{patientName}}',
        smsContent: 'URGENT: {{patientName}}, your therapy authorization expires {{expirationDate}}. We\'re working on renewal. Call {{clinicPhone}} with questions.',
        emailContent: `
            <h3 style="color: #dc3545;">Action Required: Authorization Expiring</h3>
            <p>Dear {{patientName}},</p>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <strong>⚠️ Important Notice:</strong> Your therapy authorization is set to expire on <strong>{{expirationDate}}</strong>.
            </div>
            
            <h4>What We're Doing:</h4>
            <ul>
                <li>We have submitted a renewal request to your insurance</li>
                <li>Our team is actively following up on the status</li>
                <li>We will keep you updated on the progress</li>
            </ul>
            
            <h4>What You Can Do:</h4>
            <ul>
                <li>Contact your insurance to inquire about the renewal status</li>
                <li>Ensure all required documentation is current</li>
                <li>Contact your physician if additional orders are needed</li>
            </ul>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <strong>Your Care Continues:</strong> We will continue providing services while the renewal is pending, as permitted by your insurance policy.
            </div>
            
            <p>For questions or concerns, please contact your case manager {{caseManager}} at {{caseManagerPhone}} or our main office at {{clinicPhone}}.</p>
            
            <p>Thank you for your attention to this matter.</p>
            <p>{{clinicName}} Team</p>
        `,
        variables: ['patientName', 'expirationDate', 'clinicPhone', 'caseManager', 'caseManagerPhone', 'clinicName']
    },
    provider_schedule_update: {
        id: 'provider_schedule_update',
        name: 'Provider Schedule Update',
        category: 'scheduling',
        type: 'sms',
        smsContent: 'Schedule Update: {{providerName}}, you have {{appointmentCount}} appointments today. First: {{firstAppointment}}. Check app for details. Questions? Call {{coordinatorPhone}}.',
        variables: ['providerName', 'appointmentCount', 'firstAppointment', 'coordinatorPhone']
    }
};

// Initialize Communication Hub
function initializeCommunicationHub() {
    console.log('Initializing Communication Hub');
    loadCommunicationData();
    initializeTemplates();
    setupCommunicationSettings();
}

// Load communication data from localStorage
function loadCommunicationData() {
    communicationData = JSON.parse(localStorage.getItem('communicationData')) || {
        templates: [],
        messages: [],
        campaigns: [],
        contacts: [],
        settings: {
            clinicName: 'Home Care Solutions',
            clinicPhone: '(555) 123-4567',
            emergencyPhone: '(555) 123-4567',
            documentEmail: 'documents@homecare.com',
            faxNumber: '(555) 123-4568',
            portalLink: 'https://portal.homecare.com',
            defaultSender: 'Home Care Team'
        }
    };
}

// Save communication data to localStorage
function saveCommunicationData() {
    localStorage.setItem('communicationData', JSON.stringify(communicationData));
}

// Initialize default templates
function initializeTemplates() {
    // Add default templates if they don't exist
    Object.values(defaultTemplates).forEach(template => {
        const exists = communicationData.templates.find(t => t.id === template.id);
        if (!exists) {
            communicationData.templates.push(template);
        }
    });
    saveCommunicationData();
}

// Setup communication settings
function setupCommunicationSettings() {
    // Initialize default settings if not present
    if (!communicationData.settings.clinicName) {
        communicationData.settings = {
            ...communicationData.settings,
            ...defaultTemplates.welcome_new_patient.variables.reduce((acc, variable) => {
                if (variable.includes('clinic') || variable.includes('emergency') || variable.includes('portal')) {
                    acc[variable] = getDefaultValue(variable);
                }
                return acc;
            }, {})
        };
        saveCommunicationData();
    }
}

// Get default value for template variables
function getDefaultValue(variable) {
    const defaults = {
        clinicName: 'Home Care Solutions',
        clinicPhone: '(555) 123-4567',
        emergencyPhone: '(555) 123-4567',
        documentEmail: 'documents@homecare.com',
        faxNumber: '(555) 123-4568',
        portalLink: 'https://portal.homecare.com'
    };
    return defaults[variable] || '';
}

// Send message using template
function sendTemplatedMessage(templateId, recipientType, recipientId, variables = {}) {
    const template = communicationData.templates.find(t => t.id === templateId);
    if (!template) {
        console.error('Template not found:', templateId);
        return false;
    }

    // Get recipient information
    const recipient = getRecipientInfo(recipientType, recipientId);
    if (!recipient) {
        console.error('Recipient not found:', recipientType, recipientId);
        return false;
    }

    // Merge variables with defaults and recipient info
    const mergedVariables = {
        ...communicationData.settings,
        ...recipient,
        ...variables
    };

    // Create message
    const message = {
        id: Date.now() + Math.random(),
        templateId: templateId,
        templateName: template.name,
        recipientType: recipientType,
        recipientId: recipientId,
        recipientName: recipient.name,
        recipientPhone: recipient.phone,
        recipientEmail: recipient.email,
        type: template.type,
        subject: replaceVariables(template.subject || '', mergedVariables),
        smsContent: template.smsContent ? replaceVariables(template.smsContent, mergedVariables) : null,
        emailContent: template.emailContent ? replaceVariables(template.emailContent, mergedVariables) : null,
        status: 'sent', // In real implementation: pending, sent, delivered, failed
        sentDate: new Date().toISOString(),
        deliveredDate: null,
        readDate: null,
        variables: mergedVariables
    };

    // Add to messages log
    communicationData.messages.push(message);
    saveCommunicationData();

    // Simulate sending (in real implementation, integrate with SMS/email providers)
    console.log('Message sent:', message);
    
    return message;
}

// Get recipient information
function getRecipientInfo(type, id) {
    switch (type) {
        case 'patient':
            const patient = patients.find(p => p.id == id);
            return patient ? {
                name: `${patient.firstName} ${patient.lastName}`,
                phone: patient.contactNumber,
                email: patient.email,
                patientName: `${patient.firstName} ${patient.lastName}`
            } : null;
            
        case 'provider':
            const provider = providers.find(p => p.id == id);
            return provider ? {
                name: provider.name,
                phone: provider.contactNumber,
                email: provider.email,
                providerName: provider.name
            } : null;
            
        default:
            return null;
    }
}

// Replace variables in template content
function replaceVariables(content, variables) {
    let result = content;
    Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(regex, variables[key] || '');
    });
    return result;
}

// Send bulk messages
function sendBulkMessage(templateId, recipients, variables = {}) {
    const campaign = {
        id: Date.now() + Math.random(),
        templateId: templateId,
        name: `Bulk Campaign - ${new Date().toLocaleDateString()}`,
        totalRecipients: recipients.length,
        sentCount: 0,
        failedCount: 0,
        startDate: new Date().toISOString(),
        endDate: null,
        status: 'sending',
        recipients: recipients
    };

    communicationData.campaigns.push(campaign);

    // Send messages to each recipient
    recipients.forEach(recipient => {
        try {
            const message = sendTemplatedMessage(
                templateId, 
                recipient.type, 
                recipient.id, 
                { ...variables, ...recipient.customVariables }
            );
            
            if (message) {
                campaign.sentCount++;
            } else {
                campaign.failedCount++;
            }
        } catch (error) {
            console.error('Failed to send message to recipient:', recipient, error);
            campaign.failedCount++;
        }
    });

    campaign.status = 'completed';
    campaign.endDate = new Date().toISOString();
    saveCommunicationData();

    return campaign;
}

// Schedule automated messages
function scheduleMessage(templateId, recipientType, recipientId, variables, scheduleDate) {
    const scheduledMessage = {
        id: Date.now() + Math.random(),
        templateId: templateId,
        recipientType: recipientType,
        recipientId: recipientId,
        variables: variables,
        scheduleDate: scheduleDate,
        status: 'scheduled',
        createdDate: new Date().toISOString()
    };

    // In real implementation, this would integrate with a job scheduler
    console.log('Message scheduled:', scheduledMessage);
    
    return scheduledMessage;
}

// Get message history for recipient
function getMessageHistory(recipientType, recipientId) {
    return communicationData.messages.filter(m => 
        m.recipientType === recipientType && m.recipientId == recipientId
    ).sort((a, b) => new Date(b.sentDate) - new Date(a.sentDate));
}

// Get communication statistics
function getCommunicationStats() {
    const messages = communicationData.messages;
    const campaigns = communicationData.campaigns;
    
    const today = new Date().toDateString();
    const thisWeek = getWeekStart(new Date());
    const thisMonth = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0');

    return {
        total: {
            messages: messages.length,
            campaigns: campaigns.length,
            templates: communicationData.templates.length
        },
        today: {
            messages: messages.filter(m => new Date(m.sentDate).toDateString() === today).length,
            campaigns: campaigns.filter(c => new Date(c.startDate).toDateString() === today).length
        },
        thisWeek: {
            messages: messages.filter(m => new Date(m.sentDate) >= thisWeek).length,
            campaigns: campaigns.filter(c => new Date(c.startDate) >= thisWeek).length
        },
        thisMonth: {
            messages: messages.filter(m => m.sentDate.startsWith(thisMonth)).length,
            campaigns: campaigns.filter(c => c.startDate.startsWith(thisMonth)).length
        },
        byType: {
            sms: messages.filter(m => m.type === 'sms' || m.type === 'both').length,
            email: messages.filter(m => m.type === 'email' || m.type === 'both').length
        },
        byCategory: communicationData.templates.reduce((acc, template) => {
            const category = template.category;
            const count = messages.filter(m => m.templateId === template.id).length;
            acc[category] = (acc[category] || 0) + count;
            return acc;
        }, {})
    };
}

// Utility function to get week start
function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
}

// Quick send functions for common scenarios
function sendAppointmentReminder(patientId, appointmentDetails) {
    return sendTemplatedMessage('appointment_reminder', 'patient', patientId, appointmentDetails);
}

function sendWelcomeMessage(patientId, caseManagerInfo) {
    return sendTemplatedMessage('welcome_new_patient', 'patient', patientId, caseManagerInfo);
}

function sendDocumentRequest(patientId, documentInfo) {
    return sendTemplatedMessage('document_request', 'patient', patientId, documentInfo);
}

function sendSatisfactionSurvey(patientId, surveyInfo) {
    return sendTemplatedMessage('satisfaction_survey', 'patient', patientId, surveyInfo);
}

function sendAuthorizationAlert(patientId, authorizationInfo) {
    return sendTemplatedMessage('authorization_expiring', 'patient', patientId, authorizationInfo);
}

function sendProviderScheduleUpdate(providerId, scheduleInfo) {
    return sendTemplatedMessage('provider_schedule_update', 'provider', providerId, scheduleInfo);
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    initializeCommunicationHub();
});

// Export functions for global access
window.communicationHub = {
    initializeCommunicationHub,
    sendTemplatedMessage,
    sendBulkMessage,
    scheduleMessage,
    getMessageHistory,
    getCommunicationStats,
    sendAppointmentReminder,
    sendWelcomeMessage,
    sendDocumentRequest,
    sendSatisfactionSurvey,
    sendAuthorizationAlert,
    sendProviderScheduleUpdate,
    loadCommunicationData,
    saveCommunicationData
};
