// Provider Management Functions

function addNewProvider() {
    const modal = createProviderModal();
    document.body.appendChild(modal);
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}

function createProviderModal(provider = null) {
    const isEdit = provider !== null;
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${isEdit ? 'Edit' : 'Add New'} Provider</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="providerForm">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Full Name *</label>
                                    <input type="text" class="form-control" id="providerName" value="${provider?.name || ''}" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">License Number *</label>
                                    <input type="text" class="form-control" id="providerLicense" value="${provider?.license || ''}" required>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Phone *</label>
                                    <input type="tel" class="form-control" id="providerPhone" value="${provider?.phone || ''}" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-control" id="providerEmail" value="${provider?.email || ''}">
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Specialization</label>
                                    <select class="form-control" id="providerSpecialization">
                                        <option value="general" ${provider?.specialization === 'general' ? 'selected' : ''}>General Physical Therapy</option>
                                        <option value="orthopedic" ${provider?.specialization === 'orthopedic' ? 'selected' : ''}>Orthopedic</option>
                                        <option value="neurological" ${provider?.specialization === 'neurological' ? 'selected' : ''}>Neurological</option>
                                        <option value="pediatric" ${provider?.specialization === 'pediatric' ? 'selected' : ''}>Pediatric</option>
                                        <option value="geriatric" ${provider?.specialization === 'geriatric' ? 'selected' : ''}>Geriatric</option>
                                        <option value="sports" ${provider?.specialization === 'sports' ? 'selected' : ''}>Sports Medicine</option>
                                        <option value="cardiopulmonary" ${provider?.specialization === 'cardiopulmonary' ? 'selected' : ''}>Cardiopulmonary</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Years of Experience</label>
                                    <input type="number" class="form-control" id="providerExperience" value="${provider?.experience || ''}" min="0">
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Status</label>
                                    <select class="form-control" id="providerStatus">
                                        <option value="pending" ${provider?.status === 'pending' ? 'selected' : ''}>Pending</option>
                                        <option value="credentialing" ${provider?.status === 'credentialing' ? 'selected' : ''}>Credentialing</option>
                                        <option value="active" ${provider?.status === 'active' ? 'selected' : ''}>Active</option>
                                        <option value="inactive" ${provider?.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Hourly Rate ($)</label>
                                    <input type="number" class="form-control" id="providerRate" value="${provider?.rate || ''}" min="0" step="0.01">
                                </div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Address</label>
                            <textarea class="form-control" id="providerAddress" rows="2">${provider?.address || ''}</textarea>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Availability</label>
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="availMonday" ${provider?.availability?.includes('monday') ? 'checked' : ''}>
                                        <label class="form-check-label">Monday</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="availTuesday" ${provider?.availability?.includes('tuesday') ? 'checked' : ''}>
                                        <label class="form-check-label">Tuesday</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="availWednesday" ${provider?.availability?.includes('wednesday') ? 'checked' : ''}>
                                        <label class="form-check-label">Wednesday</label>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="availThursday" ${provider?.availability?.includes('thursday') ? 'checked' : ''}>
                                        <label class="form-check-label">Thursday</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="availFriday" ${provider?.availability?.includes('friday') ? 'checked' : ''}>
                                        <label class="form-check-label">Friday</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="availSaturday" ${provider?.availability?.includes('saturday') ? 'checked' : ''}>
                                        <label class="form-check-label">Saturday</label>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="availSunday" ${provider?.availability?.includes('sunday') ? 'checked' : ''}>
                                        <label class="form-check-label">Sunday</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Notes</label>
                            <textarea class="form-control" id="providerNotes" rows="3">${provider?.notes || ''}</textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" onclick="saveProvider(${isEdit ? provider.id : 'null'})">${isEdit ? 'Update' : 'Save'} Provider</button>
                </div>
            </div>
        </div>
    `;
    return modal;
}

function saveProvider(providerId = null) {
    const form = document.getElementById('providerForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const availability = [];
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    days.forEach(day => {
        if (document.getElementById(`avail${day.charAt(0).toUpperCase() + day.slice(1)}`).checked) {
            availability.push(day);
        }
    });
    
    const providerData = {
        id: providerId || Date.now(),
        name: document.getElementById('providerName').value,
        license: document.getElementById('providerLicense').value,
        phone: document.getElementById('providerPhone').value,
        email: document.getElementById('providerEmail').value,
        specialization: document.getElementById('providerSpecialization').value,
        experience: parseInt(document.getElementById('providerExperience').value) || 0,
        status: document.getElementById('providerStatus').value,
        rate: parseFloat(document.getElementById('providerRate').value) || 0,
        address: document.getElementById('providerAddress').value,
        availability: availability,
        notes: document.getElementById('providerNotes').value,
        createdAt: providerId ? providers.find(p => p.id === providerId)?.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    if (providerId) {
        const index = providers.findIndex(p => p.id === providerId);
        providers[index] = providerData;
        addActivity(`Updated provider: ${providerData.name}`, 'fa-user-edit');
    } else {
        providers.push(providerData);
        addActivity(`Added new provider: ${providerData.name}`, 'fa-user-plus');
    }
    
    saveData();
    loadProvidersData();
    updateDashboard();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.querySelector('.modal'));
    modal.hide();
    document.querySelector('.modal').remove();
}

function loadProvidersDataLegacy() {
    // Legacy function - not used in current implementation
    const tbody = document.getElementById('providersTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = providers.map(provider => `
        <tr>
            <td>${provider.name}</td>
            <td>${provider.license}</td>
            <td>${provider.specialization.charAt(0).toUpperCase() + provider.specialization.slice(1)}</td>
            <td>${provider.phone}</td>
            <td><span class="status-${provider.status}">${provider.status.charAt(0).toUpperCase() + provider.status.slice(1)}</span></td>
            <td>${provider.availability.join(', ') || 'Not set'}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="editProvider(${provider.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteProvider(${provider.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function editProvider(providerId) {
    const provider = providers.find(p => p.id === providerId);
    if (provider) {
        const modal = createProviderModal(provider);
        document.body.appendChild(modal);
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
    }
}

function deleteProvider(providerId) {
    if (confirm('Are you sure you want to delete this provider?')) {
        const provider = providers.find(p => p.id === providerId);
        providers = providers.filter(p => p.id !== providerId);
        saveData();
        loadProvidersData();
        updateDashboard();
        addActivity(`Deleted provider: ${provider.name}`, 'fa-user-times');
    }
}

function filterProvidersLegacy() {
    // Legacy function - not used in current implementation
    const search = document.getElementById('providerSearch').value.toLowerCase();
    const statusFilter = document.getElementById('providerStatusFilter').value;
    
    const filteredProviders = providers.filter(provider => {
        const matchesSearch = provider.name.toLowerCase().includes(search) || 
                            provider.license.toLowerCase().includes(search) ||
                            provider.specialization.toLowerCase().includes(search);
        const matchesStatus = !statusFilter || provider.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
    const container = document.getElementById('providers-table-container');
    if (!container) {
        console.error('Provider table container not found');
        return;
    }
    
    container.innerHTML = `
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>Name</th>
                        <th>License</th>
                        <th>Specialty</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Availability</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredProviders.map(provider => `
                        <tr>
                            <td>${provider.name || 'N/A'}</td>
                            <td>${provider.license || provider.licenseNumber || 'N/A'}</td>
                            <td>${provider.specialty ? provider.specialty.charAt(0).toUpperCase() + provider.specialty.slice(1) : 'Not specified'}</td>
                            <td>${provider.phone || 'N/A'}</td>
                            <td><span class="status-${provider.status || 'active'}">${provider.status ? provider.status.charAt(0).toUpperCase() + provider.status.slice(1) : 'Active'}</span></td>
                            <td>${Array.isArray(provider.availability) ? provider.availability.join(', ') : (provider.availability || 'Not set')}</td>
                            <td>
                                <button class="btn btn-sm btn-outline-primary" onclick="editProvider(${provider.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="deleteProvider(${provider.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}
