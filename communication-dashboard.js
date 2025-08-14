// Communication Dashboard - UI for managing communications
// Provides interface for templates, messaging, campaigns, and communication logs

// Render communication dashboard
function renderCommunicationDashboard() {
    const container = document.getElementById('communicationDashboardContainer');
    if (!container) return;

    // Load communication data and stats
    const stats = getCommunicationStats();
    const recentMessages = communicationData.messages.slice(-10).reverse();
    const activeCampaigns = communicationData.campaigns.filter(c => c.status === 'sending');

    container.innerHTML = `
        <div class="row mb-4">
            <!-- Communication Overview Cards -->
            <div class="col-md-3 mb-3">
                <div class="card border-primary">
                    <div class="card-body text-center">
                        <i class="fas fa-envelope fa-2x text-primary mb-2"></i>
                        <h5 class="card-title">Messages Today</h5>
                        <h3 class="text-primary">${stats.today.messages}</h3>
                        <small class="text-muted">Total: ${stats.total.messages}</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card border-success">
                    <div class="card-body text-center">
                        <i class="fas fa-bullhorn fa-2x text-success mb-2"></i>
                        <h5 class="card-title">Campaigns</h5>
                        <h3 class="text-success">${activeCampaigns.length}</h3>
                        <small class="text-muted">Active campaigns</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card border-warning">
                    <div class="card-body text-center">
                        <i class="fas fa-template fa-2x text-warning mb-2"></i>
                        <h5 class="card-title">Templates</h5>
                        <h3 class="text-warning">${stats.total.templates}</h3>
                        <small class="text-muted">Available templates</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card border-info">
                    <div class="card-body text-center">
                        <i class="fas fa-chart-line fa-2x text-info mb-2"></i>
                        <h5 class="card-title">This Week</h5>
                        <h3 class="text-info">${stats.thisWeek.messages}</h3>
                        <small class="text-muted">Messages sent</small>
                    </div>
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="row mb-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0"><i class="fas fa-bolt"></i> Quick Actions</h5>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-4 mb-2">
                                <button class="btn btn-primary w-100" onclick="openQuickMessage('appointment_reminder')">
                                    <i class="fas fa-calendar-check"></i> Send Appointment Reminder
                                </button>
                            </div>
                            <div class="col-md-4 mb-2">
                                <button class="btn btn-success w-100" onclick="openQuickMessage('document_request')">
                                    <i class="fas fa-file-medical"></i> Request Document
                                </button>
                            </div>
                            <div class="col-md-4 mb-2">
                                <button class="btn btn-info w-100" onclick="openQuickMessage('satisfaction_survey')">
                                    <i class="fas fa-star"></i> Send Survey
                                </button>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-4 mb-2">
                                <button class="btn btn-warning w-100" onclick="openBulkMessage()">
                                    <i class="fas fa-users"></i> Bulk Message
                                </button>
                            </div>
                            <div class="col-md-4 mb-2">
                                <button class="btn btn-secondary w-100" onclick="openTemplateManager()">
                                    <i class="fas fa-edit"></i> Manage Templates
                                </button>
                            </div>
                            <div class="col-md-4 mb-2">
                                <button class="btn btn-dark w-100" onclick="openCommunicationSettings()">
                                    <i class="fas fa-cog"></i> Settings
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Communication Tabs -->
        <ul class="nav nav-tabs" id="communicationTabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="recent-messages-tab" data-bs-toggle="tab" data-bs-target="#recent-messages" type="button" role="tab">
                    <i class="fas fa-comments"></i> Recent Messages
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="templates-tab" data-bs-toggle="tab" data-bs-target="#templates" type="button" role="tab">
                    <i class="fas fa-template"></i> Templates
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="campaigns-tab" data-bs-toggle="tab" data-bs-target="#campaigns" type="button" role="tab">
                    <i class="fas fa-bullhorn"></i> Campaigns
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="analytics-tab" data-bs-toggle="tab" data-bs-target="#analytics" type="button" role="tab">
                    <i class="fas fa-chart-bar"></i> Analytics
                </button>
            </li>
        </ul>

        <div class="tab-content mt-3" id="communicationTabContent">
            <!-- Recent Messages Tab -->
            <div class="tab-pane fade show active" id="recent-messages" role="tabpanel">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">Recent Messages</h5>
                        <button class="btn btn-sm btn-primary" onclick="refreshMessages()">
                            <i class="fas fa-sync-alt"></i> Refresh
                        </button>
                    </div>
                    <div class="card-body">
                        ${renderRecentMessages(recentMessages)}
                    </div>
                </div>
            </div>

            <!-- Templates Tab -->
            <div class="tab-pane fade" id="templates" role="tabpanel">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">Message Templates</h5>
                        <button class="btn btn-sm btn-success" onclick="createNewTemplate()">
                            <i class="fas fa-plus"></i> New Template
                        </button>
                    </div>
                    <div class="card-body">
                        ${renderTemplates(communicationData.templates)}
                    </div>
                </div>
            </div>

            <!-- Campaigns Tab -->
            <div class="tab-pane fade" id="campaigns" role="tabpanel">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">Communication Campaigns</h5>
                        <button class="btn btn-sm btn-warning" onclick="createNewCampaign()">
                            <i class="fas fa-plus"></i> New Campaign
                        </button>
                    </div>
                    <div class="card-body">
                        ${renderCampaigns(communicationData.campaigns)}
                    </div>
                </div>
            </div>

            <!-- Analytics Tab -->
            <div class="tab-pane fade" id="analytics" role="tabpanel">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">Communication Analytics</h5>
                    </div>
                    <div class="card-body">
                        ${renderCommunicationAnalytics(stats)}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Render recent messages
function renderRecentMessages(messages) {
    if (messages.length === 0) {
        return `
            <div class="text-center py-4">
                <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No Recent Messages</h5>
                <p class="text-muted">Messages will appear here when sent.</p>
            </div>
        `;
    }

    return `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Recipient</th>
                        <th>Template</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Sent</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${messages.map(message => `
                        <tr>
                            <td>
                                <strong>${message.recipientName}</strong>
                                <br>
                                <small class="text-muted">${message.recipientType}</small>
                            </td>
                            <td>${message.templateName}</td>
                            <td>
                                <span class="badge bg-${getMessageTypeBadge(message.type)}">
                                    ${message.type.toUpperCase()}
                                </span>
                            </td>
                            <td>
                                <span class="badge bg-${getStatusBadge(message.status)}">
                                    ${message.status}
                                </span>
                            </td>
                            <td>
                                <small>${formatDateTime(message.sentDate)}</small>
                            </td>
                            <td>
                                <div class="btn-group btn-group-sm">
                                    <button class="btn btn-outline-primary" onclick="viewMessage('${message.id}')">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn btn-outline-success" onclick="resendMessage('${message.id}')">
                                        <i class="fas fa-redo"></i>
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

// Render templates
function renderTemplates(templates) {
    const groupedTemplates = templates.reduce((acc, template) => {
        const category = template.category || 'other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(template);
        return acc;
    }, {});

    return `
        <div class="row">
            ${Object.entries(groupedTemplates).map(([category, categoryTemplates]) => `
                <div class="col-12 mb-4">
                    <h6 class="text-uppercase text-muted mb-3">
                        <i class="fas fa-folder"></i> ${category.replace('_', ' ')}
                    </h6>
                    <div class="row">
                        ${categoryTemplates.map(template => `
                            <div class="col-md-6 mb-3">
                                <div class="card h-100">
                                    <div class="card-body">
                                        <h6 class="card-title">
                                            <i class="fas fa-${getTemplateIcon(template.category)}"></i>
                                            ${template.name}
                                        </h6>
                                        <p class="card-text">
                                            <small class="text-muted">
                                                Type: ${template.type.toUpperCase()}
                                            </small>
                                        </p>
                                        <div class="btn-group w-100">
                                            <button class="btn btn-primary btn-sm" onclick="useTemplate('${template.id}')">
                                                <i class="fas fa-paper-plane"></i> Use
                                            </button>
                                            <button class="btn btn-outline-secondary btn-sm" onclick="editTemplate('${template.id}')">
                                                <i class="fas fa-edit"></i> Edit
                                            </button>
                                            <button class="btn btn-outline-info btn-sm" onclick="previewTemplate('${template.id}')">
                                                <i class="fas fa-eye"></i> Preview
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Render campaigns
function renderCampaigns(campaigns) {
    if (campaigns.length === 0) {
        return `
            <div class="text-center py-4">
                <i class="fas fa-bullhorn fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No Campaigns</h5>
                <p class="text-muted">Create bulk messaging campaigns to reach multiple recipients.</p>
            </div>
        `;
    }

    return `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Campaign</th>
                        <th>Recipients</th>
                        <th>Success Rate</th>
                        <th>Status</th>
                        <th>Started</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${campaigns.map(campaign => `
                        <tr>
                            <td>
                                <strong>${campaign.name}</strong>
                                <br>
                                <small class="text-muted">ID: ${campaign.id}</small>
                            </td>
                            <td>
                                <span class="badge bg-info">${campaign.totalRecipients}</span>
                            </td>
                            <td>
                                ${renderSuccessRate(campaign)}
                            </td>
                            <td>
                                <span class="badge bg-${getCampaignStatusBadge(campaign.status)}">
                                    ${campaign.status}
                                </span>
                            </td>
                            <td>
                                <small>${formatDateTime(campaign.startDate)}</small>
                            </td>
                            <td>
                                <div class="btn-group btn-group-sm">
                                    <button class="btn btn-outline-primary" onclick="viewCampaign('${campaign.id}')">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn btn-outline-success" onclick="duplicateCampaign('${campaign.id}')">
                                        <i class="fas fa-copy"></i>
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

// Render communication analytics
function renderCommunicationAnalytics(stats) {
    return `
        <div class="row">
            <!-- Message Type Distribution -->
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header">
                        <h6 class="mb-0">Message Type Distribution</h6>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <div class="d-flex justify-content-between">
                                <span>SMS Messages</span>
                                <span class="fw-bold">${stats.byType.sms}</span>
                            </div>
                            <div class="progress mb-2">
                                <div class="progress-bar bg-primary" style="width: ${(stats.byType.sms / stats.total.messages * 100)}%"></div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <div class="d-flex justify-content-between">
                                <span>Email Messages</span>
                                <span class="fw-bold">${stats.byType.email}</span>
                            </div>
                            <div class="progress mb-2">
                                <div class="progress-bar bg-success" style="width: ${(stats.byType.email / stats.total.messages * 100)}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Category Distribution -->
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header">
                        <h6 class="mb-0">Messages by Category</h6>
                    </div>
                    <div class="card-body">
                        ${Object.entries(stats.byCategory).map(([category, count]) => `
                            <div class="mb-3">
                                <div class="d-flex justify-content-between">
                                    <span>${category.replace('_', ' ')}</span>
                                    <span class="fw-bold">${count}</span>
                                </div>
                                <div class="progress mb-2">
                                    <div class="progress-bar bg-info" style="width: ${(count / stats.total.messages * 100)}%"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Monthly Trends -->
            <div class="col-12 mb-4">
                <div class="card">
                    <div class="card-header">
                        <h6 class="mb-0">Communication Trends</h6>
                    </div>
                    <div class="card-body">
                        <div class="row text-center">
                            <div class="col-md-3">
                                <h4 class="text-primary">${stats.today.messages}</h4>
                                <small class="text-muted">Today</small>
                            </div>
                            <div class="col-md-3">
                                <h4 class="text-success">${stats.thisWeek.messages}</h4>
                                <small class="text-muted">This Week</small>
                            </div>
                            <div class="col-md-3">
                                <h4 class="text-warning">${stats.thisMonth.messages}</h4>
                                <small class="text-muted">This Month</small>
                            </div>
                            <div class="col-md-3">
                                <h4 class="text-info">${stats.total.messages}</h4>
                                <small class="text-muted">Total</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Utility functions
function getMessageTypeBadge(type) {
    const badges = {
        'sms': 'primary',
        'email': 'success',
        'both': 'info'
    };
    return badges[type] || 'secondary';
}

function getStatusBadge(status) {
    const badges = {
        'sent': 'success',
        'pending': 'warning',
        'failed': 'danger',
        'delivered': 'info'
    };
    return badges[status] || 'secondary';
}

function getCampaignStatusBadge(status) {
    const badges = {
        'completed': 'success',
        'sending': 'warning',
        'failed': 'danger',
        'scheduled': 'info'
    };
    return badges[status] || 'secondary';
}

function getTemplateIcon(category) {
    const icons = {
        'scheduling': 'calendar-check',
        'onboarding': 'user-plus',
        'documentation': 'file-medical',
        'feedback': 'star',
        'authorization': 'shield-alt'
    };
    return icons[category] || 'envelope';
}

function renderSuccessRate(campaign) {
    const successRate = campaign.totalRecipients > 0 ? 
        Math.round((campaign.sentCount / campaign.totalRecipients) * 100) : 0;
    
    return `
        <div class="progress" style="height: 20px;">
            <div class="progress-bar bg-success" style="width: ${successRate}%">
                ${successRate}%
            </div>
        </div>
        <small class="text-muted">${campaign.sentCount}/${campaign.totalRecipients}</small>
    `;
}

function formatDateTime(dateString) {
    return new Date(dateString).toLocaleString();
}

// Action functions
function refreshMessages() {
    loadCommunicationData();
    renderCommunicationDashboard();
}

function openQuickMessage(templateId) {
    // Open modal for quick message sending
    alert(`Quick message feature for template: ${templateId}\n\nThis would open a modal to select recipients and send the message.`);
}

function openBulkMessage() {
    alert('Bulk Message feature\n\nThis would open a modal to create and send bulk messages to multiple recipients.');
}

function openTemplateManager() {
    alert('Template Manager\n\nThis would open a modal to create, edit, and manage message templates.');
}

function openCommunicationSettings() {
    alert('Communication Settings\n\nThis would open a modal to configure clinic information, default values, and communication preferences.');
}

function viewMessage(messageId) {
    const message = communicationData.messages.find(m => m.id == messageId);
    if (message) {
        alert(`Message Details:\n\nTo: ${message.recipientName}\nTemplate: ${message.templateName}\nType: ${message.type}\nSent: ${formatDateTime(message.sentDate)}\nStatus: ${message.status}`);
    }
}

function useTemplate(templateId) {
    alert(`Use Template: ${templateId}\n\nThis would open a modal to select recipients and customize the message before sending.`);
}

function previewTemplate(templateId) {
    const template = communicationData.templates.find(t => t.id === templateId);
    if (template) {
        alert(`Template Preview: ${template.name}\n\nSubject: ${template.subject || 'N/A'}\n\nSMS: ${template.smsContent || 'N/A'}\n\nEmail: ${template.emailContent ? 'HTML Content Available' : 'N/A'}`);
    }
}

// Initialize communication dashboard when section is shown
function initializeCommunicationDashboard() {
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const communicationSection = document.getElementById('communication-hub');
                if (communicationSection && !communicationSection.style.display) {
                    renderCommunicationDashboard();
                }
            }
        });
    });

    const communicationSection = document.getElementById('communication-hub');
    if (communicationSection) {
        observer.observe(communicationSection, { attributes: true });
    }
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    initializeCommunicationDashboard();
});

// Export for global access
window.communicationDashboard = {
    renderCommunicationDashboard,
    refreshMessages,
    openQuickMessage,
    openBulkMessage,
    viewMessage,
    useTemplate,
    previewTemplate
};
