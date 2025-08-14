// Feedback System Module
// Handles patient and provider feedback collection, surveys, and follow-up scheduling

// Global variables for feedback data
let feedbackData = JSON.parse(localStorage.getItem('feedbackData')) || {
    patientFeedback: [],
    providerFeedback: [],
    surveys: [],
    followUpSchedule: []
};

// Survey templates
const surveyTemplates = {
    patient_satisfaction: {
        id: 'patient_satisfaction',
        name: 'Patient Satisfaction Survey',
        questions: [
            { id: 'overall_satisfaction', text: 'How satisfied are you with your overall care?', type: 'rating', scale: 5 },
            { id: 'provider_quality', text: 'How would you rate your physical therapist?', type: 'rating', scale: 5 },
            { id: 'communication', text: 'How well did we communicate with you?', type: 'rating', scale: 5 },
            { id: 'scheduling', text: 'How convenient was scheduling appointments?', type: 'rating', scale: 5 },
            { id: 'improvement', text: 'How much has your condition improved?', type: 'rating', scale: 5 },
            { id: 'recommend', text: 'Would you recommend our services to others?', type: 'yes_no' },
            { id: 'comments', text: 'Additional comments or suggestions:', type: 'text' }
        ]
    },
    provider_feedback: {
        id: 'provider_feedback',
        name: 'Provider Experience Survey',
        questions: [
            { id: 'patient_cooperation', text: 'How cooperative was the patient?', type: 'rating', scale: 5 },
            { id: 'home_environment', text: 'How suitable was the home environment for therapy?', type: 'rating', scale: 5 },
            { id: 'family_support', text: 'How supportive was the patient\'s family?', type: 'rating', scale: 5 },
            { id: 'scheduling_issues', text: 'Were there any scheduling challenges?', type: 'yes_no' },
            { id: 'equipment_needs', text: 'Were additional equipment needs identified?', type: 'yes_no' },
            { id: 'safety_concerns', text: 'Were there any safety concerns?', type: 'yes_no' },
            { id: 'treatment_notes', text: 'Treatment notes and observations:', type: 'text' }
        ]
    }
};

// Initialize Feedback System Module
function initializeFeedbackModule() {
    console.log('Initializing Feedback System Module');
    loadFeedbackData();
    scheduleAutomaticFollowUps();
}

// Load feedback data from localStorage
function loadFeedbackData() {
    feedbackData = JSON.parse(localStorage.getItem('feedbackData')) || {
        patientFeedback: [],
        providerFeedback: [],
        surveys: [],
        followUpSchedule: []
    };
}

// Save feedback data to localStorage
function saveFeedbackData() {
    localStorage.setItem('feedbackData', JSON.stringify(feedbackData));
}

// Create new survey
function createSurvey(patientId, providerId, surveyType) {
    const template = surveyTemplates[surveyType];
    if (!template) return null;
    
    const survey = {
        id: Date.now() + Math.random(),
        patientId: patientId,
        providerId: providerId,
        patientName: getPatientName(patientId),
        providerName: getProviderName(providerId),
        surveyType: surveyType,
        surveyName: template.name,
        questions: template.questions,
        responses: {},
        status: 'pending', // pending, completed, expired
        createdDate: new Date().toISOString(),
        completedDate: null,
        expiryDate: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString(), // 7 days
        lastUpdated: new Date().toISOString()
    };
    
    feedbackData.surveys.push(survey);
    saveFeedbackData();
    return survey;
}

// Submit survey response
function submitSurveyResponse(surveyId, responses) {
    const survey = feedbackData.surveys.find(s => s.id == surveyId);
    if (!survey) return null;
    
    survey.responses = responses;
    survey.status = 'completed';
    survey.completedDate = new Date().toISOString();
    survey.lastUpdated = new Date().toISOString();
    
    // Create feedback record based on survey type
    if (survey.surveyType === 'patient_satisfaction') {
        const feedback = {
            id: Date.now() + Math.random(),
            patientId: survey.patientId,
            providerId: survey.providerId,
            patientName: survey.patientName,
            providerName: survey.providerName,
            type: 'patient',
            overallRating: responses.overall_satisfaction || 0,
            responses: responses,
            submittedDate: new Date().toISOString(),
            followUpRequired: responses.overall_satisfaction < 4 || responses.recommend === 'no'
        };
        feedbackData.patientFeedback.push(feedback);
    } else if (survey.surveyType === 'provider_feedback') {
        const feedback = {
            id: Date.now() + Math.random(),
            patientId: survey.patientId,
            providerId: survey.providerId,
            patientName: survey.patientName,
            providerName: survey.providerName,
            type: 'provider',
            responses: responses,
            submittedDate: new Date().toISOString(),
            actionRequired: responses.safety_concerns === 'yes' || responses.equipment_needs === 'yes'
        };
        feedbackData.providerFeedback.push(feedback);
    }
    
    saveFeedbackData();
    return survey;
}

// Schedule automatic follow-ups
function scheduleAutomaticFollowUps() {
    const today = new Date();
    
    // Schedule follow-ups for patients who completed treatment
    patients.forEach(patient => {
        if (patient.status === 'active') {
            // Check if patient had recent appointments
            const hasRecentAppointments = patient.appointments && patient.appointments.some(apt => {
                const aptDate = new Date(apt.appointmentDate || apt.dateOfService);
                const daysSince = (today - aptDate) / (1000 * 60 * 60 * 24);
                return daysSince >= 7 && daysSince <= 14; // 1-2 weeks ago
            });
            
            if (hasRecentAppointments) {
                // Check if follow-up already scheduled
                const existingFollowUp = feedbackData.followUpSchedule.find(
                    f => f.patientId === patient.id && f.status === 'pending'
                );
                
                if (!existingFollowUp) {
                    const followUp = {
                        id: Date.now() + Math.random(),
                        patientId: patient.id,
                        patientName: `${patient.firstName} ${patient.lastName}`,
                        type: 'satisfaction_survey',
                        scheduledDate: new Date(today.getTime() + (24 * 60 * 60 * 1000)).toISOString(), // Tomorrow
                        status: 'pending', // pending, completed, cancelled
                        notes: 'Automatic follow-up for patient satisfaction',
                        createdDate: new Date().toISOString()
                    };
                    
                    feedbackData.followUpSchedule.push(followUp);
                }
            }
        }
    });
    
    saveFeedbackData();
}

// Get patient name by ID
function getPatientName(patientId) {
    const patient = patients.find(p => p.id == patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
}

// Get provider name by ID
function getProviderName(providerId) {
    const provider = providers.find(p => p.id == providerId);
    return provider ? provider.name : 'Unknown Provider';
}

// Render feedback dashboard
function renderFeedbackDashboard() {
    const container = document.getElementById('feedbackDashboardContainer');
    if (!container) return;
    
    const pendingSurveys = feedbackData.surveys.filter(s => s.status === 'pending').length;
    const completedSurveys = feedbackData.surveys.filter(s => s.status === 'completed').length;
    const pendingFollowUps = feedbackData.followUpSchedule.filter(f => f.status === 'pending').length;
    
    const avgPatientRating = calculateAveragePatientRating();
    const recentFeedback = [...feedbackData.patientFeedback, ...feedbackData.providerFeedback]
        .sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate))
        .slice(0, 5);
    
    container.innerHTML = `
        <!-- Feedback Overview Cards -->
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card border-primary">
                    <div class="card-header bg-primary text-white">
                        <h6><i class="fas fa-star"></i> Avg Patient Rating</h6>
                    </div>
                    <div class="card-body text-center">
                        <h3 class="text-primary">${avgPatientRating.toFixed(1)}/5</h3>
                        <p class="mb-0">Overall Satisfaction</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card border-warning">
                    <div class="card-header bg-warning text-white">
                        <h6><i class="fas fa-clipboard-list"></i> Pending Surveys</h6>
                    </div>
                    <div class="card-body text-center">
                        <h3 class="text-warning">${pendingSurveys}</h3>
                        <p class="mb-0">Awaiting Response</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card border-success">
                    <div class="card-header bg-success text-white">
                        <h6><i class="fas fa-check-circle"></i> Completed</h6>
                    </div>
                    <div class="card-body text-center">
                        <h3 class="text-success">${completedSurveys}</h3>
                        <p class="mb-0">Surveys Completed</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card border-info">
                    <div class="card-header bg-info text-white">
                        <h6><i class="fas fa-phone"></i> Follow-ups</h6>
                    </div>
                    <div class="card-body text-center">
                        <h3 class="text-info">${pendingFollowUps}</h3>
                        <p class="mb-0">Pending Follow-ups</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="row mb-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h6><i class="fas fa-bolt"></i> Quick Actions</h6>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-3">
                                <button class="btn btn-primary w-100" onclick="sendPatientSurvey()">
                                    <i class="fas fa-user"></i> Send Patient Survey
                                </button>
                            </div>
                            <div class="col-md-3">
                                <button class="btn btn-success w-100" onclick="sendProviderSurvey()">
                                    <i class="fas fa-user-md"></i> Send Provider Survey
                                </button>
                            </div>
                            <div class="col-md-3">
                                <button class="btn btn-info w-100" onclick="scheduleFollowUp()">
                                    <i class="fas fa-calendar-plus"></i> Schedule Follow-up
                                </button>
                            </div>
                            <div class="col-md-3">
                                <button class="btn btn-warning w-100" onclick="viewFeedbackReports()">
                                    <i class="fas fa-chart-bar"></i> View Reports
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Recent Feedback -->
        <div class="row mb-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h6><i class="fas fa-comments"></i> Recent Feedback</h6>
                    </div>
                    <div class="card-body">
                        ${recentFeedback.length > 0 ? `
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Patient</th>
                                            <th>Provider</th>
                                            <th>Type</th>
                                            <th>Rating/Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${recentFeedback.map(feedback => `
                                            <tr>
                                                <td>${new Date(feedback.submittedDate).toLocaleDateString()}</td>
                                                <td>${feedback.patientName}</td>
                                                <td>${feedback.providerName}</td>
                                                <td><span class="badge bg-${feedback.type === 'patient' ? 'primary' : 'success'}">${feedback.type.charAt(0).toUpperCase() + feedback.type.slice(1)}</span></td>
                                                <td>
                                                    ${feedback.type === 'patient' ? 
                                                        `<span class="text-warning">${'★'.repeat(feedback.overallRating)}${'☆'.repeat(5-feedback.overallRating)}</span>` : 
                                                        `<span class="badge bg-${feedback.actionRequired ? 'warning' : 'success'}">${feedback.actionRequired ? 'Action Required' : 'No Issues'}</span>`
                                                    }
                                                </td>
                                                <td>
                                                    <button class="btn btn-sm btn-primary" onclick="viewFeedbackDetails('${feedback.id}')">
                                                        <i class="fas fa-eye"></i> View
                                                    </button>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        ` : '<p class="text-muted">No recent feedback available.</p>'}
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Pending Follow-ups -->
        ${pendingFollowUps > 0 ? `
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h6><i class="fas fa-calendar-check"></i> Pending Follow-ups</h6>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Patient</th>
                                        <th>Type</th>
                                        <th>Scheduled Date</th>
                                        <th>Notes</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${feedbackData.followUpSchedule.filter(f => f.status === 'pending').map(followUp => `
                                        <tr>
                                            <td>${followUp.patientName}</td>
                                            <td>${followUp.type.replace('_', ' ').toUpperCase()}</td>
                                            <td>${new Date(followUp.scheduledDate).toLocaleDateString()}</td>
                                            <td>${followUp.notes}</td>
                                            <td>
                                                <button class="btn btn-sm btn-success" onclick="completeFollowUp('${followUp.id}')">
                                                    <i class="fas fa-check"></i> Complete
                                                </button>
                                                <button class="btn btn-sm btn-secondary" onclick="postponeFollowUp('${followUp.id}')">
                                                    <i class="fas fa-clock"></i> Postpone
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        ` : ''}
    `;
}

// Calculate average patient rating
function calculateAveragePatientRating() {
    const patientRatings = feedbackData.patientFeedback
        .filter(f => f.overallRating > 0)
        .map(f => f.overallRating);
    
    return patientRatings.length > 0 ? 
        patientRatings.reduce((sum, rating) => sum + rating, 0) / patientRatings.length : 0;
}

// Global functions for button clicks
window.sendPatientSurvey = function() {
    const patientId = prompt('Enter Patient ID:');
    const providerId = prompt('Enter Provider ID:');
    
    if (patientId && providerId) {
        const survey = createSurvey(parseInt(patientId), parseInt(providerId), 'patient_satisfaction');
        if (survey) {
            alert('Patient satisfaction survey created successfully!');
            renderFeedbackDashboard();
        } else {
            alert('Error creating survey. Please check the IDs.');
        }
    }
};

window.sendProviderSurvey = function() {
    const patientId = prompt('Enter Patient ID:');
    const providerId = prompt('Enter Provider ID:');
    
    if (patientId && providerId) {
        const survey = createSurvey(parseInt(patientId), parseInt(providerId), 'provider_feedback');
        if (survey) {
            alert('Provider feedback survey created successfully!');
            renderFeedbackDashboard();
        } else {
            alert('Error creating survey. Please check the IDs.');
        }
    }
};

window.scheduleFollowUp = function() {
    const patientId = prompt('Enter Patient ID:');
    const type = prompt('Enter follow-up type (satisfaction_survey, wellness_check, etc.):');
    
    if (patientId && type) {
        const followUp = {
            id: Date.now() + Math.random(),
            patientId: parseInt(patientId),
            patientName: getPatientName(parseInt(patientId)),
            type: type,
            scheduledDate: new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString(),
            status: 'pending',
            notes: 'Manual follow-up scheduled',
            createdDate: new Date().toISOString()
        };
        
        feedbackData.followUpSchedule.push(followUp);
        saveFeedbackData();
        alert('Follow-up scheduled successfully!');
        renderFeedbackDashboard();
    }
};

window.viewFeedbackReports = function() {
    alert('Feedback reports feature - would show detailed analytics and trends');
};

window.completeFollowUp = function(followUpId) {
    const followUp = feedbackData.followUpSchedule.find(f => f.id == followUpId);
    if (followUp) {
        followUp.status = 'completed';
        followUp.completedDate = new Date().toISOString();
        saveFeedbackData();
        renderFeedbackDashboard();
    }
};

window.postponeFollowUp = function(followUpId) {
    const followUp = feedbackData.followUpSchedule.find(f => f.id == followUpId);
    if (followUp) {
        const newDate = new Date(followUp.scheduledDate);
        newDate.setDate(newDate.getDate() + 7); // Postpone by 1 week
        followUp.scheduledDate = newDate.toISOString();
        saveFeedbackData();
        renderFeedbackDashboard();
    }
};

window.viewFeedbackDetails = function(feedbackId) {
    alert('Feedback details view - would show complete feedback responses and analysis');
};

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    initializeFeedbackModule();
    
    // Set up event listener for when feedback section becomes visible
    const originalShowSection = window.showSection;
    window.showSection = function(sectionId) {
        if (originalShowSection) {
            originalShowSection(sectionId);
        }
        
        if (sectionId === 'feedback') {
            setTimeout(() => {
                renderFeedbackDashboard();
            }, 100);
        }
    };
});

// Export functions for global access
window.feedbackModule = {
    initializeFeedbackModule,
    createSurvey,
    submitSurveyResponse,
    scheduleAutomaticFollowUps,
    renderFeedbackDashboard,
    loadFeedbackData,
    saveFeedbackData
};
