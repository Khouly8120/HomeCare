// Modal Creation Functions for Referrals and Missing Sections

// Create add referral modal
function createAddReferralModal() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'addReferralModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Add New Referral</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="addReferralForm">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="referralPatientName" class="form-label">Patient Name *</label>
                                    <input type="text" class="form-control" id="referralPatientName" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="referralPhone" class="form-label">Phone Number</label>
                                    <input type="tel" class="form-control" id="referralPhone">
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="referralEmail" class="form-label">Email</label>
                                    <input type="email" class="form-control" id="referralEmail">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="referralSource" class="form-label">Referral Source</label>
                                    <select class="form-select" id="referralSource">
                                        <option value="">Select Source</option>
                                        <option value="physician">Physician</option>
                                        <option value="hospital">Hospital</option>
                                        <option value="insurance">Insurance</option>
                                        <option value="self">Self-Referral</option>
                                        <option value="family">Family/Friend</option>
                                        <option value="online">Online</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="referralPriority" class="form-label">Priority</label>
                                    <select class="form-select" id="referralPriority">
                                        <option value="low">Low</option>
                                        <option value="medium" selected>Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="referralStatus" class="form-label">Status</label>
                                    <select class="form-select" id="referralStatus">
                                        <option value="new" selected>New</option>
                                        <option value="contacted">Contacted</option>
                                        <option value="scheduled">Scheduled</option>
                                        <option value="converted">Converted</option>
                                        <option value="declined">Declined</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="referralDiagnosis" class="form-label">Diagnosis/Condition</label>
                            <input type="text" class="form-control" id="referralDiagnosis">
                        </div>
                        <div class="mb-3">
                            <label for="referralNotes" class="form-label">Notes</label>
                            <textarea class="form-control" id="referralNotes" rows="3"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" onclick="saveNewReferral()">Add Referral</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

// Create edit referral modal
function createEditReferralModal() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'editReferralModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Edit Referral</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="editReferralForm">
                        <input type="hidden" id="editReferralId">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="editReferralPatientName" class="form-label">Patient Name *</label>
                                    <input type="text" class="form-control" id="editReferralPatientName" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="editReferralPhone" class="form-label">Phone Number</label>
                                    <input type="tel" class="form-control" id="editReferralPhone">
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="editReferralEmail" class="form-label">Email</label>
                                    <input type="email" class="form-control" id="editReferralEmail">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="editReferralSource" class="form-label">Referral Source</label>
                                    <select class="form-select" id="editReferralSource">
                                        <option value="">Select Source</option>
                                        <option value="physician">Physician</option>
                                        <option value="hospital">Hospital</option>
                                        <option value="insurance">Insurance</option>
                                        <option value="self">Self-Referral</option>
                                        <option value="family">Family/Friend</option>
                                        <option value="online">Online</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="editReferralPriority" class="form-label">Priority</label>
                                    <select class="form-select" id="editReferralPriority">
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="editReferralStatus" class="form-label">Status</label>
                                    <select class="form-select" id="editReferralStatus">
                                        <option value="new">New</option>
                                        <option value="contacted">Contacted</option>
                                        <option value="scheduled">Scheduled</option>
                                        <option value="converted">Converted</option>
                                        <option value="declined">Declined</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="editReferralDiagnosis" class="form-label">Diagnosis/Condition</label>
                            <input type="text" class="form-control" id="editReferralDiagnosis">
                        </div>
                        <div class="mb-3">
                            <label for="editReferralNotes" class="form-label">Notes</label>
                            <textarea class="form-control" id="editReferralNotes" rows="3"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" onclick="saveEditedReferral()">Save Changes</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

// Save new referral
function saveNewReferral() {
    const patientName = document.getElementById('referralPatientName').value.trim();
    const phone = document.getElementById('referralPhone').value.trim();
    const email = document.getElementById('referralEmail').value.trim();
    const diagnosis = document.getElementById('referralDiagnosis').value.trim();
    const source = document.getElementById('referralSource').value;
    const priority = document.getElementById('referralPriority').value;
    const status = document.getElementById('referralStatus').value;
    const notes = document.getElementById('referralNotes').value.trim();
    
    if (!patientName) {
        alert('Patient name is required!');
        return;
    }
    
    // Create new referral
    const newReferral = {
        id: Date.now() + Math.random(),
        patientName: patientName,
        phone: phone,
        email: email,
        diagnosis: diagnosis,
        source: source,
        priority: priority,
        status: status,
        notes: notes,
        dateReceived: new Date().toISOString(),
        dateAdded: new Date().toISOString()
    };
    
    // Add to referrals array
    referrals.push(newReferral);
    
    // Save data and update UI
    saveData();
    updateDashboard();
    loadReferralsData();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addReferralModal'));
    modal.hide();
    
    // Show success message and add activity
    alert(`Referral for "${patientName}" has been added successfully!`);
    addActivity(`Added new referral: ${patientName}`, 'fa-share-alt');
}

// Save edited referral
function saveEditedReferral() {
    const referralId = document.getElementById('editReferralId').value;
    const patientName = document.getElementById('editReferralPatientName').value.trim();
    const phone = document.getElementById('editReferralPhone').value.trim();
    const email = document.getElementById('editReferralEmail').value.trim();
    const diagnosis = document.getElementById('editReferralDiagnosis').value.trim();
    const source = document.getElementById('editReferralSource').value;
    const priority = document.getElementById('editReferralPriority').value;
    const status = document.getElementById('editReferralStatus').value;
    const notes = document.getElementById('editReferralNotes').value.trim();
    
    if (!patientName) {
        alert('Patient name is required!');
        return;
    }
    
    // Find and update referral
    const referralIndex = referrals.findIndex(r => r.id == referralId);
    if (referralIndex === -1) {
        alert('Referral not found!');
        return;
    }
    
    // Update referral data
    referrals[referralIndex].patientName = patientName;
    referrals[referralIndex].phone = phone;
    referrals[referralIndex].email = email;
    referrals[referralIndex].diagnosis = diagnosis;
    referrals[referralIndex].source = source;
    referrals[referralIndex].priority = priority;
    referrals[referralIndex].status = status;
    referrals[referralIndex].notes = notes;
    referrals[referralIndex].lastUpdated = new Date().toISOString();
    
    // Save data and update UI
    saveData();
    updateDashboard();
    loadReferralsData();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('editReferralModal'));
    modal.hide();
    
    // Show success message and add activity
    alert(`Referral for "${patientName}" has been updated successfully!`);
    addActivity(`Updated referral: ${patientName}`, 'fa-edit');
}

// Process referral CSV data
function processReferralData(csvData) {
    try {
        const lines = csvData.split('\n');
        if (lines.length < 2) {
            throw new Error('CSV file must have at least a header row and one data row');
        }
        
        const headers = parseCSVLine(lines[0]);
        let importedCount = 0;
        let errorCount = 0;
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            try {
                const values = parseCSVLine(line);
                if (values.length < headers.length) continue;
                
                const referralData = {};
                headers.forEach((header, index) => {
                    referralData[header.toLowerCase().replace(/\s+/g, '')] = values[index]?.trim() || '';
                });
                
                if (!referralData.patientname && !referralData.name) {
                    console.warn(`Skipping row ${i + 1}: Missing patient name`);
                    continue;
                }
                
                // Create new referral
                const newReferral = {
                    id: Date.now() + Math.random() + i,
                    patientName: referralData.patientname || referralData.name,
                    phone: referralData.phone || referralData.phonenumber || '',
                    email: referralData.email || '',
                    diagnosis: referralData.diagnosis || referralData.condition || '',
                    source: referralData.source || referralData.referralsource || 'imported',
                    priority: referralData.priority || 'medium',
                    status: referralData.status || 'new',
                    notes: referralData.notes || '',
                    dateReceived: new Date().toISOString(),
                    dateAdded: new Date().toISOString()
                };
                
                referrals.push(newReferral);
                importedCount++;
                
            } catch (lineError) {
                console.error(`Error processing row ${i + 1}:`, lineError);
                errorCount++;
            }
        }
        
        // Save data and update UI
        saveData();
        updateDashboard();
        loadReferralsData();
        
        // Show import results
        const message = `Referral Import Completed!\n\nNew referrals: ${importedCount}\nErrors: ${errorCount}\n\nTotal referrals now: ${referrals.length}`;
        alert(message);
        
        // Add activity log
        addActivity(`Imported ${importedCount} referrals from CSV`, 'fa-file-import');
        
    } catch (error) {
        console.error('Referral import error:', error);
        alert(`Error processing referral data: ${error.message}`);
    }
}

// Create missing section functions
function createSchedulingSection() {
    return `
        <div class="container-fluid">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Scheduling Management</h2>
                <div>
                    <button class="btn btn-primary" onclick="scheduleAppointment()">
                        <i class="fas fa-calendar-plus"></i> Schedule Appointment
                    </button>
                </div>
            </div>
            <div class="text-center py-5">
                <i class="fas fa-calendar-alt fa-3x text-primary mb-3"></i>
                <h4>Scheduling System</h4>
                <p class="text-muted">Manage appointments, schedules, and availability</p>
                <div class="mt-4">
                    <button class="btn btn-outline-primary me-2" onclick="showProviderMatches()">
                        <i class="fas fa-user-md"></i> Provider Matching
                    </button>
                    <button class="btn btn-outline-success" onclick="showUtilizationDashboard()">
                        <i class="fas fa-chart-bar"></i> Utilization Dashboard
                    </button>
                </div>
            </div>
        </div>
    `;
}

function createInsuranceSection() {
    return `
        <div class="container-fluid">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Insurance & Payments</h2>
                <div>
                    <button class="btn btn-success" onclick="addInsuranceClaim()">
                        <i class="fas fa-plus"></i> Add Claim
                    </button>
                </div>
            </div>
            <div class="text-center py-5">
                <i class="fas fa-file-invoice-dollar fa-3x text-success mb-3"></i>
                <h4>Insurance & Claims Management</h4>
                <p class="text-muted">Track claims, payments, and insurance information</p>
                <div class="mt-4">
                    <button class="btn btn-outline-success me-2" onclick="viewClaimsSummary()">
                        <i class="fas fa-chart-pie"></i> Claims Summary
                    </button>
                    <button class="btn btn-outline-primary" onclick="exportPaymentReport()">
                        <i class="fas fa-file-export"></i> Payment Report
                    </button>
                </div>
            </div>
        </div>
    `;
}

function createTasksSection() {
    return `
        <div class="container-fluid">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Task Management</h2>
                <div>
                    <button class="btn btn-primary" onclick="addNewTask()">
                        <i class="fas fa-plus"></i> Add Task
                    </button>
                </div>
            </div>
            <div class="text-center py-5">
                <i class="fas fa-tasks fa-3x text-info mb-3"></i>
                <h4>Task Management System</h4>
                <p class="text-muted">Organize and track your daily tasks and projects</p>
                <div class="mt-4">
                    <button class="btn btn-outline-info me-2" onclick="viewKanbanBoard()">
                        <i class="fas fa-columns"></i> Kanban Board
                    </button>
                    <button class="btn btn-outline-warning" onclick="viewTaskCalendar()">
                        <i class="fas fa-calendar"></i> Task Calendar
                    </button>
                </div>
            </div>
        </div>
    `;
}

function createCompetitorsSection() {
    return `
        <div class="container-fluid">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Competitor Research</h2>
                <div>
                    <button class="btn btn-info" onclick="addCompetitor()">
                        <i class="fas fa-plus"></i> Add Competitor
                    </button>
                </div>
            </div>
            <div class="text-center py-5">
                <i class="fas fa-search fa-3x text-warning mb-3"></i>
                <h4>Competitive Analysis</h4>
                <p class="text-muted">Track competitors, pricing, and market insights</p>
                <div class="mt-4">
                    <button class="btn btn-outline-warning me-2" onclick="viewCompetitorAnalysis()">
                        <i class="fas fa-chart-line"></i> Market Analysis
                    </button>
                    <button class="btn btn-outline-info" onclick="exportCompetitorReport()">
                        <i class="fas fa-file-export"></i> Competitor Report
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Placeholder functions for new sections (these can be implemented later)
function scheduleAppointment() {
    alert('Appointment scheduling feature will be implemented based on your specific workflow needs.');
}

function addInsuranceClaim() {
    alert('Insurance claim management feature will be implemented based on your billing requirements.');
}

function addNewTask() {
    alert('Task management feature will be implemented based on your project management needs.');
}

function addCompetitor() {
    alert('Competitor tracking feature will be implemented based on your market research requirements.');
}
