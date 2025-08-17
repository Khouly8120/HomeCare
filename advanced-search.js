// Advanced Search & Filtering - Global search, smart filters, bulk actions, saved views
// Provides comprehensive search and filtering capabilities across all data

// Global variables for search data
let searchData = JSON.parse(localStorage.getItem('searchData')) || {
    savedSearches: [],
    searchHistory: [],
    filterPresets: [],
    bulkActions: [],
    settings: {}
};

// Search configuration
const searchConfig = {
    entities: {
        patients: {
            name: 'Patients',
            fields: ['name', 'phone', 'email', 'address', 'diagnosis', 'insurance', 'status'],
            searchableFields: ['name', 'phone', 'email', 'address', 'diagnosis', 'insurance.primary', 'insurance.secondary'],
            displayFields: ['name', 'phone', 'status', 'nextAppointment'],
            icon: 'fas fa-user-injured'
        },
        providers: {
            name: 'Providers',
            fields: ['name', 'email', 'phone', 'specialty', 'borough', 'status', 'rate'],
            searchableFields: ['name', 'email', 'phone', 'specialty', 'borough', 'position'],
            displayFields: ['name', 'specialty', 'borough', 'status'],
            icon: 'fas fa-user-md'
        },
        appointments: {
            name: 'Appointments',
            fields: ['patientName', 'providerName', 'date', 'time', 'type', 'status'],
            searchableFields: ['patientName', 'providerName', 'type', 'status'],
            displayFields: ['patientName', 'providerName', 'date', 'status'],
            icon: 'fas fa-calendar-alt'
        },
        authorizations: {
            name: 'Authorizations',
            fields: ['patientName', 'insurance', 'status', 'expirationDate', 'visits'],
            searchableFields: ['patientName', 'insurance', 'status'],
            displayFields: ['patientName', 'insurance', 'status', 'expirationDate'],
            icon: 'fas fa-file-medical'
        },
        documents: {
            name: 'Documents',
            fields: ['patientName', 'documentType', 'status', 'dueDate'],
            searchableFields: ['patientName', 'documentType', 'status'],
            displayFields: ['patientName', 'documentType', 'status', 'dueDate'],
            icon: 'fas fa-file-alt'
        }
    },
    operators: {
        equals: { name: 'Equals', symbol: '=' },
        contains: { name: 'Contains', symbol: '~' },
        startsWith: { name: 'Starts with', symbol: '^' },
        endsWith: { name: 'Ends with', symbol: '$' },
        greaterThan: { name: 'Greater than', symbol: '>' },
        lessThan: { name: 'Less than', symbol: '<' },
        between: { name: 'Between', symbol: '><' },
        isNull: { name: 'Is empty', symbol: 'null' },
        isNotNull: { name: 'Is not empty', symbol: '!null' }
    }
};

// Initialize Advanced Search
function initializeAdvancedSearch() {
    console.log('Initializing Advanced Search & Filtering');
    loadSearchData();
    initializeSearchSettings();
    generateSampleSearchData();
    setupGlobalSearch();
}

// Load search data from localStorage
function loadSearchData() {
    searchData = JSON.parse(localStorage.getItem('searchData')) || {
        savedSearches: [],
        searchHistory: [],
        filterPresets: [],
        bulkActions: [],
        settings: {}
    };
}

// Save search data to localStorage
function saveSearchData() {
    localStorage.setItem('searchData', JSON.stringify(searchData));
}

// Initialize search settings
function initializeSearchSettings() {
    if (!searchData.settings.globalSearchEnabled) {
        searchData.settings = {
            globalSearchEnabled: true,
            searchHistoryEnabled: true,
            maxSearchHistory: 50,
            autoSaveSearches: true,
            fuzzySearchEnabled: true,
            searchResultsPerPage: 25,
            highlightMatches: true
        };
        saveSearchData();
    }
}

// Generate sample search data
function generateSampleSearchData() {
    if (searchData.savedSearches.length === 0) {
        generateSampleSavedSearches();
        generateSampleFilterPresets();
        saveSearchData();
    }
}

// Generate sample saved searches
function generateSampleSavedSearches() {
    const savedSearches = [
        {
            id: `search_${Date.now()}_1`,
            name: 'Active Patients with Upcoming Appointments',
            description: 'Find all active patients who have appointments scheduled',
            entity: 'patients',
            filters: [
                { field: 'status', operator: 'equals', value: 'active' },
                { field: 'nextAppointment', operator: 'isNotNull', value: '' }
            ],
            sortBy: 'nextAppointment',
            sortOrder: 'asc',
            createdAt: new Date().toISOString(),
            lastUsed: new Date().toISOString(),
            useCount: 5,
            isPublic: true
        },
        {
            id: `search_${Date.now()}_2`,
            name: 'Providers in Brooklyn',
            description: 'All active providers located in Brooklyn',
            entity: 'providers',
            filters: [
                { field: 'borough', operator: 'equals', value: 'Brooklyn' },
                { field: 'status', operator: 'equals', value: 'active' }
            ],
            sortBy: 'name',
            sortOrder: 'asc',
            createdAt: new Date().toISOString(),
            lastUsed: new Date().toISOString(),
            useCount: 3,
            isPublic: true
        },
        {
            id: `search_${Date.now()}_3`,
            name: 'Expiring Authorizations',
            description: 'Authorizations expiring within 30 days',
            entity: 'authorizations',
            filters: [
                { field: 'status', operator: 'equals', value: 'active' },
                { field: 'expirationDate', operator: 'lessThan', value: '30_days' }
            ],
            sortBy: 'expirationDate',
            sortOrder: 'asc',
            createdAt: new Date().toISOString(),
            lastUsed: new Date().toISOString(),
            useCount: 8,
            isPublic: true
        }
    ];
    
    searchData.savedSearches = savedSearches;
}

// Generate sample filter presets
function generateSampleFilterPresets() {
    const filterPresets = [
        {
            id: `preset_${Date.now()}_1`,
            name: 'Active Status',
            description: 'Filter for active records only',
            filters: [{ field: 'status', operator: 'equals', value: 'active' }],
            applicableEntities: ['patients', 'providers', 'authorizations'],
            isDefault: true
        },
        {
            id: `preset_${Date.now()}_2`,
            name: 'This Month',
            description: 'Records from current month',
            filters: [{ field: 'date', operator: 'between', value: 'current_month' }],
            applicableEntities: ['appointments', 'documents'],
            isDefault: false
        },
        {
            id: `preset_${Date.now()}_3`,
            name: 'High Priority',
            description: 'High priority or urgent items',
            filters: [{ field: 'priority', operator: 'equals', value: 'high' }],
            applicableEntities: ['documents', 'authorizations'],
            isDefault: false
        }
    ];
    
    searchData.filterPresets = filterPresets;
}

// Setup global search functionality
function setupGlobalSearch() {
    // Create global search input if it doesn't exist
    if (!document.getElementById('global-search-input')) {
        addGlobalSearchInput();
    }
    
    // Setup search event listeners
    setupSearchEventListeners();
}

// Add global search input to navigation
function addGlobalSearchInput() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    const searchContainer = document.createElement('div');
    searchContainer.className = 'navbar-nav ms-auto';
    searchContainer.innerHTML = `
        <div class="nav-item">
            <div class="input-group">
                <input type="text" class="form-control" id="global-search-input" 
                       placeholder="Search patients, providers, appointments..." 
                       style="width: 300px;">
                <button class="btn btn-outline-primary" type="button" onclick="performGlobalSearch()">
                    <i class="fas fa-search"></i>
                </button>
                <button class="btn btn-outline-secondary" type="button" onclick="showAdvancedSearch()">
                    <i class="fas fa-filter"></i>
                </button>
            </div>
        </div>
    `;
    
    navbar.appendChild(searchContainer);
}

// Setup search event listeners
function setupSearchEventListeners() {
    const searchInput = document.getElementById('global-search-input');
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                performGlobalSearch();
            } else if (this.value.length >= 3) {
                // Show search suggestions
                showSearchSuggestions(this.value);
            }
        });
        
        searchInput.addEventListener('focus', function() {
            showSearchHistory();
        });
    }
}

// Perform global search
function performGlobalSearch(query = null) {
    const searchInput = document.getElementById('global-search-input');
    const searchQuery = query || searchInput?.value || '';
    
    if (searchQuery.length < 2) {
        alert('Please enter at least 2 characters to search');
        return;
    }
    
    // Add to search history
    addToSearchHistory(searchQuery);
    
    // Perform search across all entities
    const results = searchAllEntities(searchQuery);
    
    // Display results
    displaySearchResults(results, searchQuery);
    
    return results;
}

// Search across all entities
function searchAllEntities(query) {
    const results = {
        query: query,
        timestamp: new Date().toISOString(),
        totalResults: 0,
        entities: {}
    };
    
    Object.keys(searchConfig.entities).forEach(entityType => {
        const entityConfig = searchConfig.entities[entityType];
        const entityResults = searchEntity(entityType, query, entityConfig);
        
        results.entities[entityType] = {
            name: entityConfig.name,
            icon: entityConfig.icon,
            results: entityResults,
            count: entityResults.length
        };
        
        results.totalResults += entityResults.length;
    });
    
    return results;
}

// Search specific entity
function searchEntity(entityType, query, config) {
    let data = [];
    
    // Get data based on entity type
    switch (entityType) {
        case 'patients':
            data = window.patients || [];
            break;
        case 'providers':
            data = window.providers || [];
            break;
        case 'appointments':
            data = generateAppointmentData();
            break;
        case 'authorizations':
            data = generateAuthorizationData();
            break;
        case 'documents':
            data = generateDocumentData();
            break;
    }
    
    // Perform search
    const searchResults = data.filter(item => {
        return config.searchableFields.some(field => {
            const fieldValue = getNestedValue(item, field);
            if (!fieldValue) return false;
            
            return fieldValue.toString().toLowerCase().includes(query.toLowerCase());
        });
    });
    
    // Add relevance score and highlight matches
    return searchResults.map(item => {
        const relevanceScore = calculateRelevanceScore(item, query, config.searchableFields);
        const highlightedItem = highlightMatches(item, query, config.searchableFields);
        
        return {
            ...highlightedItem,
            _relevanceScore: relevanceScore,
            _entityType: entityType
        };
    }).sort((a, b) => b._relevanceScore - a._relevanceScore);
}

// Get nested object value
function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Calculate relevance score
function calculateRelevanceScore(item, query, searchableFields) {
    let score = 0;
    const queryLower = query.toLowerCase();
    
    searchableFields.forEach(field => {
        const fieldValue = getNestedValue(item, field);
        if (!fieldValue) return;
        
        const valueLower = fieldValue.toString().toLowerCase();
        
        // Exact match gets highest score
        if (valueLower === queryLower) {
            score += 100;
        }
        // Starts with query gets high score
        else if (valueLower.startsWith(queryLower)) {
            score += 75;
        }
        // Contains query gets medium score
        else if (valueLower.includes(queryLower)) {
            score += 50;
        }
        
        // Boost score for name fields
        if (field.includes('name')) {
            score *= 1.5;
        }
    });
    
    return score;
}

// Highlight search matches
function highlightMatches(item, query, searchableFields) {
    if (!searchData.settings.highlightMatches) return item;
    
    const highlightedItem = { ...item };
    const queryLower = query.toLowerCase();
    
    searchableFields.forEach(field => {
        const fieldValue = getNestedValue(highlightedItem, field);
        if (!fieldValue) return;
        
        const valueStr = fieldValue.toString();
        const valueLower = valueStr.toLowerCase();
        
        if (valueLower.includes(queryLower)) {
            const regex = new RegExp(`(${query})`, 'gi');
            const highlightedValue = valueStr.replace(regex, '<mark>$1</mark>');
            setNestedValue(highlightedItem, field, highlightedValue);
        }
    });
    
    return highlightedItem;
}

// Set nested object value
function setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => current[key] = current[key] || {}, obj);
    target[lastKey] = value;
}

// Generate appointment data for search
function generateAppointmentData() {
    const appointments = [];
    const patients = window.patients || [];
    const providers = window.providers || [];
    
    patients.forEach(patient => {
        if (patient.nextAppointment) {
            const provider = providers.find(p => p.id === patient.assignedProvider);
            appointments.push({
                id: `apt_${patient.id}`,
                patientName: patient.name,
                providerName: provider?.name || 'Unassigned',
                date: patient.nextAppointment,
                time: '10:00 AM',
                type: 'Physical Therapy',
                status: 'scheduled'
            });
        }
    });
    
    return appointments;
}

// Generate authorization data for search
function generateAuthorizationData() {
    const authorizations = [];
    const patients = window.patients || [];
    
    patients.forEach(patient => {
        if (patient.insurance?.primary) {
            authorizations.push({
                id: `auth_${patient.id}`,
                patientName: patient.name,
                insurance: patient.insurance.primary,
                status: 'active',
                expirationDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                visits: '12/20'
            });
        }
    });
    
    return authorizations;
}

// Generate document data for search
function generateDocumentData() {
    const documents = [];
    const patients = window.patients || [];
    
    patients.forEach(patient => {
        documents.push({
            id: `doc_${patient.id}_eval`,
            patientName: patient.name,
            documentType: 'Initial Evaluation',
            status: 'completed',
            dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
    });
    
    return documents;
}

// Display search results
function displaySearchResults(results, query) {
    // Create or update search results modal
    let modal = document.getElementById('search-results-modal');
    if (!modal) {
        modal = createSearchResultsModal();
    }
    
    const modalBody = modal.querySelector('.modal-body');
    modalBody.innerHTML = `
        <div class="search-results">
            <div class="search-summary mb-3">
                <h6>Search Results for: "${query}"</h6>
                <p class="text-muted">${results.totalResults} results found</p>
            </div>
            
            ${Object.keys(results.entities).map(entityType => {
                const entity = results.entities[entityType];
                if (entity.count === 0) return '';
                
                return `
                    <div class="entity-results mb-4">
                        <h6><i class="${entity.icon}"></i> ${entity.name} (${entity.count})</h6>
                        <div class="results-list">
                            ${entity.results.slice(0, 5).map(result => 
                                formatSearchResult(result, entityType)
                            ).join('')}
                            ${entity.count > 5 ? 
                                `<div class="text-center mt-2">
                                    <button class="btn btn-sm btn-outline-primary" 
                                            onclick="showAllResults('${entityType}', '${query}')">
                                        View all ${entity.count} results
                                    </button>
                                </div>` : ''}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    // Show modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

// Format individual search result
function formatSearchResult(result, entityType) {
    const config = searchConfig.entities[entityType];
    
    return `
        <div class="search-result-item border rounded p-2 mb-2">
            <div class="d-flex justify-content-between align-items-start">
                <div class="result-content">
                    ${config.displayFields.map(field => {
                        const value = getNestedValue(result, field);
                        if (!value) return '';
                        
                        return `<div class="result-field">
                            <strong>${formatFieldName(field)}:</strong> 
                            <span>${value}</span>
                        </div>`;
                    }).join('')}
                </div>
                <div class="result-actions">
                    <button class="btn btn-sm btn-outline-primary" 
                            onclick="viewSearchResult('${entityType}', '${result.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Create search results modal
function createSearchResultsModal() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'search-results-modal';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Search Results</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <!-- Results will be loaded here -->
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" onclick="saveCurrentSearch()">Save Search</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    return modal;
}

// Format field names for display
function formatFieldName(field) {
    return field.split(/(?=[A-Z])/).join(' ')
        .replace(/^\w/, c => c.toUpperCase())
        .replace(/id$/i, 'ID');
}

// Add to search history
function addToSearchHistory(query) {
    if (!searchData.settings.searchHistoryEnabled) return;
    
    // Remove if already exists
    searchData.searchHistory = searchData.searchHistory.filter(item => item.query !== query);
    
    // Add to beginning
    searchData.searchHistory.unshift({
        query: query,
        timestamp: new Date().toISOString(),
        resultCount: 0 // Will be updated after search
    });
    
    // Keep only max history items
    if (searchData.searchHistory.length > searchData.settings.maxSearchHistory) {
        searchData.searchHistory = searchData.searchHistory.slice(0, searchData.settings.maxSearchHistory);
    }
    
    saveSearchData();
}

// Show search suggestions
function showSearchSuggestions(query) {
    // Implementation for search suggestions dropdown
    console.log('Showing suggestions for:', query);
}

// Show search history
function showSearchHistory() {
    // Implementation for search history dropdown
    console.log('Showing search history');
}

// Show advanced search modal
function showAdvancedSearch() {
    let modal = document.getElementById('advanced-search-modal');
    if (!modal) {
        modal = createAdvancedSearchModal();
    }
    
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

// Create advanced search modal
function createAdvancedSearchModal() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'advanced-search-modal';
    modal.innerHTML = `
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Advanced Search & Filtering</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-4">
                            <h6>Search Entity</h6>
                            <select class="form-select mb-3" id="search-entity-select">
                                ${Object.keys(searchConfig.entities).map(key => 
                                    `<option value="${key}">${searchConfig.entities[key].name}</option>`
                                ).join('')}
                            </select>
                            
                            <h6>Saved Searches</h6>
                            <div class="list-group mb-3" id="saved-searches-list">
                                ${searchData.savedSearches.map(search => `
                                    <a href="#" class="list-group-item list-group-item-action" 
                                       onclick="loadSavedSearch('${search.id}')">
                                        <div class="d-flex w-100 justify-content-between">
                                            <h6 class="mb-1">${search.name}</h6>
                                            <small>Used ${search.useCount} times</small>
                                        </div>
                                        <p class="mb-1">${search.description}</p>
                                    </a>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="col-md-8">
                            <h6>Search Filters</h6>
                            <div id="search-filters-container">
                                <!-- Filters will be added here -->
                            </div>
                            
                            <button class="btn btn-sm btn-outline-primary mb-3" onclick="addSearchFilter()">
                                <i class="fas fa-plus"></i> Add Filter
                            </button>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <label class="form-label">Sort By</label>
                                    <select class="form-select" id="search-sort-field">
                                        <option value="">Select field...</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Sort Order</label>
                                    <select class="form-select" id="search-sort-order">
                                        <option value="asc">Ascending</option>
                                        <option value="desc">Descending</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-outline-primary" onclick="clearSearchFilters()">Clear</button>
                    <button type="button" class="btn btn-success" onclick="saveAdvancedSearch()">Save Search</button>
                    <button type="button" class="btn btn-primary" onclick="executeAdvancedSearch()">Search</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    // Wire up entity-dependent controls once modal exists in DOM
    setupAdvancedSearchModal(modal);
    return modal;
}

// Setup modal interactions and initial state
function setupAdvancedSearchModal(modal) {
    try {
        const entitySelect = modal.querySelector('#search-entity-select');
        if (entitySelect) {
            entitySelect.addEventListener('change', () => {
                refreshAdvancedSearchFields();
            });
        }
        // Populate sort field options and add an initial empty filter
        refreshAdvancedSearchFields();
        if (modal.querySelectorAll('.advanced-filter-row').length === 0) {
            addSearchFilter();
        }
    } catch (e) {
        console.error('Error setting up Advanced Search modal:', e);
    }
}

// Populate sort field options and update filter field dropdowns per entity
function refreshAdvancedSearchFields() {
    const modal = document.getElementById('advanced-search-modal');
    if (!modal) return;

    const entityType = modal.querySelector('#search-entity-select')?.value || 'patients';
    const entityCfg = searchConfig.entities[entityType];
    if (!entityCfg) return;

    // Update sort fields
    const sortFieldEl = modal.querySelector('#search-sort-field');
    if (sortFieldEl) {
        sortFieldEl.innerHTML = '<option value="">Select field...</option>' +
            entityCfg.fields.map(f => `<option value="${f}">${formatFieldName(f)}</option>`).join('');
    }

    // Update all filter field selects to match current entity
    modal.querySelectorAll('.advanced-filter-row select[data-role="field"]').forEach(sel => {
        const current = sel.value;
        sel.innerHTML = entityCfg.fields.map(f => `<option value="${f}">${formatFieldName(f)}</option>`).join('');
        // Try to preserve selection if still applicable
        if (entityCfg.fields.includes(current)) sel.value = current;
    });
}

// Add a filter row to the filters container
function addSearchFilter() {
    const modal = document.getElementById('advanced-search-modal');
    if (!modal) return;
    const container = modal.querySelector('#search-filters-container');
    if (!container) return;

    const entityType = modal.querySelector('#search-entity-select')?.value || 'patients';
    const entityCfg = searchConfig.entities[entityType];
    const ops = searchConfig.operators;
    const id = `flt_${Date.now()}_${Math.floor(Math.random()*1000)}`;

    const row = document.createElement('div');
    row.className = 'row g-2 mb-2 advanced-filter-row';
    row.dataset.filterId = id;
    row.innerHTML = `
        <div class="col-md-4">
            <select class="form-select" data-role="field">
                ${entityCfg.fields.map(f => `<option value="${f}">${formatFieldName(f)}</option>`).join('')}
            </select>
        </div>
        <div class="col-md-3">
            <select class="form-select" data-role="operator">
                ${Object.keys(ops).map(k => `<option value="${k}">${ops[k].name}</option>`).join('')}
            </select>
        </div>
        <div class="col-md-4">
            <input type="text" class="form-control" data-role="value" placeholder="Value" />
        </div>
        <div class="col-md-1 d-grid">
            <button type="button" class="btn btn-outline-danger" title="Remove" onclick="removeSearchFilter('${id}')">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    container.appendChild(row);
}

function removeSearchFilter(filterId) {
    const modal = document.getElementById('advanced-search-modal');
    const row = modal?.querySelector(`.advanced-filter-row[data-filter-id="${filterId}"]`);
    row?.remove();
}

// Read current advanced search state from modal
function getCurrentAdvancedSearchState() {
    const modal = document.getElementById('advanced-search-modal');
    if (!modal) return null;
    const entity = modal.querySelector('#search-entity-select')?.value || 'patients';
    const sortBy = modal.querySelector('#search-sort-field')?.value || '';
    const sortOrder = modal.querySelector('#search-sort-order')?.value || 'asc';

    const filters = Array.from(modal.querySelectorAll('.advanced-filter-row')).map(row => {
        return {
            field: row.querySelector('select[data-role="field"]').value,
            operator: row.querySelector('select[data-role="operator"]').value,
            value: row.querySelector('input[data-role="value"]').value
        };
    });

    return { entity, sortBy, sortOrder, filters };
}

// Apply a single filter to an item
function evaluateFilter(item, filter) {
    const raw = getNestedValue(item, filter.field);
    const val = raw == null ? '' : raw;
    const fval = (filter.value || '').toString().trim();
    const op = filter.operator;

    // Helper conversions
    const toNumber = v => {
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
    };
    const toDate = v => {
        const d = new Date(v);
        return isNaN(d.getTime()) ? null : d;
    };

    // Special tokens support
    const now = new Date();
    const specialDateRange = token => {
        switch (token) {
            case 'current_month': {
                const start = new Date(now.getFullYear(), now.getMonth(), 1);
                const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                return { start, end };
            }
            case '30_days': {
                const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                return { start: now, end };
            }
            default:
                return null;
        }
    };

    switch (op) {
        case 'equals':
            return String(val).toLowerCase() === fval.toLowerCase();
        case 'contains':
            return String(val).toLowerCase().includes(fval.toLowerCase());
        case 'startsWith':
            return String(val).toLowerCase().startsWith(fval.toLowerCase());
        case 'endsWith':
            return String(val).toLowerCase().endsWith(fval.toLowerCase());
        case 'greaterThan': {
            const n1 = toNumber(val);
            const n2 = toNumber(fval);
            if (n1 != null && n2 != null) return n1 > n2;
            const d1 = toDate(val);
            const d2 = toDate(fval);
            if (d1 && d2) return d1 > d2;
            return String(val) > String(fval);
        }
        case 'lessThan': {
            const special = specialDateRange(fval);
            if (special) {
                const d1 = toDate(val);
                if (!d1) return false;
                return d1 < special.end; // e.g., expiring within 30 days
            }
            const n1 = toNumber(val);
            const n2 = toNumber(fval);
            if (n1 != null && n2 != null) return n1 < n2;
            const d1 = toDate(val);
            const d2 = toDate(fval);
            if (d1 && d2) return d1 < d2;
            return String(val) < String(fval);
        }
        case 'between': {
            const range = specialDateRange(fval);
            const d1 = toDate(val);
            if (range && d1) return d1 >= range.start && d1 <= range.end;
            // Expect comma-separated bounds
            const [a, b] = fval.split(',').map(s => s.trim());
            const n1 = toNumber(val), nA = toNumber(a), nB = toNumber(b);
            if (n1 != null && nA != null && nB != null) return n1 >= nA && n1 <= nB;
            const dA = toDate(a), dB = toDate(b);
            if (d1 && dA && dB) return d1 >= dA && d1 <= dB;
            return false;
        }
        case 'isNull':
            return val === '' || val == null;
        case 'isNotNull':
            return !(val === '' || val == null);
        default:
            return true;
    }
}

// Execute the advanced search using filters
function executeAdvancedSearch() {
    const state = getCurrentAdvancedSearchState();
    if (!state) return;

    const entityCfg = searchConfig.entities[state.entity];
    if (!entityCfg) return;

    // Get data set
    let data = [];
    switch (state.entity) {
        case 'patients':
            data = window.patients || [];
            break;
        case 'providers':
            data = window.providers || [];
            break;
        case 'appointments':
            data = generateAppointmentData();
            break;
        case 'authorizations':
            data = generateAuthorizationData();
            break;
        case 'documents':
            data = generateDocumentData();
            break;
    }

    // Apply filters
    const filtered = data.filter(item => state.filters.every(f => evaluateFilter(item, f)));

    // Sort if requested
    if (state.sortBy) {
        filtered.sort((a, b) => {
            const av = getNestedValue(a, state.sortBy);
            const bv = getNestedValue(b, state.sortBy);
            if (av == null && bv == null) return 0;
            if (av == null) return state.sortOrder === 'asc' ? -1 : 1;
            if (bv == null) return state.sortOrder === 'asc' ? 1 : -1;
            if (typeof av === 'number' && typeof bv === 'number') {
                return state.sortOrder === 'asc' ? av - bv : bv - av;
            }
            const sa = String(av).toLowerCase();
            const sb = String(bv).toLowerCase();
            if (sa < sb) return state.sortOrder === 'asc' ? -1 : 1;
            if (sa > sb) return state.sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // Wrap results to reuse displaySearchResults
    const results = {
        query: '(Advanced Search)',
        timestamp: new Date().toISOString(),
        totalResults: filtered.length,
        entities: {
            [state.entity]: {
                name: entityCfg.name,
                icon: entityCfg.icon,
                results: filtered,
                count: filtered.length
            }
        }
    };

    displaySearchResults(results, 'Advanced Search');
}

function clearSearchFilters() {
    const modal = document.getElementById('advanced-search-modal');
    if (!modal) return;
    const container = modal.querySelector('#search-filters-container');
    if (container) container.innerHTML = '';
    const sortFieldEl = modal.querySelector('#search-sort-field');
    if (sortFieldEl) sortFieldEl.value = '';
    const sortOrderEl = modal.querySelector('#search-sort-order');
    if (sortOrderEl) sortOrderEl.value = 'asc';
    // Add a fresh empty filter row for convenience
    addSearchFilter();
}

function saveAdvancedSearch() {
    const state = getCurrentAdvancedSearchState();
    if (!state) return;
    const name = prompt('Enter a name for this search:', 'My Advanced Search');
    if (!name) return;

    const saved = {
        id: `search_${Date.now()}`,
        name,
        description: `${state.entity} — ${state.filters.length} filter(s)`,
        entity: state.entity,
        filters: state.filters,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        useCount: 0,
        isPublic: false
    };

    // Replace if same name exists
    searchData.savedSearches = (searchData.savedSearches || []).filter(s => s.name !== name);
    searchData.savedSearches.push(saved);
    saveSearchData();

    // Refresh the Saved Searches list in the modal if open
    const list = document.querySelector('#advanced-search-modal #saved-searches-list');
    if (list) {
        list.innerHTML = searchData.savedSearches.map(search => `
            <a href="#" class="list-group-item list-group-item-action" 
               onclick="loadSavedSearch('${search.id}')">
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${search.name}</h6>
                    <small>Used ${search.useCount} times</small>
                </div>
                <p class="mb-1">${search.description || ''}</p>
            </a>
        `).join('');
    }

    alert('Search saved successfully.');
}

function saveCurrentSearch() {
    // Alias used by the Search Results modal
    saveAdvancedSearch();
}

function loadSavedSearch(id) {
    const modal = document.getElementById('advanced-search-modal');
    if (!modal) return;
    const saved = (searchData.savedSearches || []).find(s => s.id === id);
    if (!saved) return;

    // Set entity
    const entitySel = modal.querySelector('#search-entity-select');
    if (entitySel) {
        entitySel.value = saved.entity;
    }
    refreshAdvancedSearchFields();

    // Clear existing filters
    const container = modal.querySelector('#search-filters-container');
    if (container) container.innerHTML = '';

    // Recreate filters
    saved.filters.forEach(f => {
        addSearchFilter();
        const row = modal.querySelector('.advanced-filter-row:last-child');
        if (row) {
            row.querySelector('select[data-role="field"]').value = f.field;
            row.querySelector('select[data-role="operator"]').value = f.operator;
            row.querySelector('input[data-role="value"]').value = f.value;
        }
    });

    // Sort controls
    const sortFieldEl = modal.querySelector('#search-sort-field');
    if (sortFieldEl) sortFieldEl.value = saved.sortBy || '';
    const sortOrderEl = modal.querySelector('#search-sort-order');
    if (sortOrderEl) sortOrderEl.value = saved.sortOrder || 'asc';

    // Update usage
    saved.lastUsed = new Date().toISOString();
    saved.useCount = (saved.useCount || 0) + 1;
    saveSearchData();
}

// Handlers referenced by search results modal
function showAllResults(entityType, query) {
    const config = searchConfig.entities[entityType];
    if (!config) return;
    const all = searchEntity(entityType, query, config);

    let modal = document.getElementById('search-results-modal');
    if (!modal) modal = createSearchResultsModal();
    const modalBody = modal.querySelector('.modal-body');
    modalBody.innerHTML = `
        <div class="entity-results">
            <h6><i class="${config.icon}"></i> ${config.name} (${all.length})</h6>
            <div class="results-list">
                ${all.map(r => formatSearchResult(r, entityType)).join('')}
            </div>
        </div>
    `;

    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

function viewSearchResult(entityType, id) {
    // Placeholder action; integrate with your routing/details view
    console.log(`View ${entityType} item:`, id);
    alert(`View ${entityType} item: ${id}`);
}

// Bulk action functions
function performBulkAction(action, selectedItems) {
    console.log(`Performing bulk action: ${action} on ${selectedItems.length} items`);
    
    const bulkAction = {
        id: `bulk_${Date.now()}`,
        action: action,
        itemCount: selectedItems.length,
        items: selectedItems,
        timestamp: new Date().toISOString(),
        status: 'completed'
    };
    
    searchData.bulkActions.push(bulkAction);
    saveSearchData();
    
    return bulkAction;
}

// Export search results
function exportSearchResults(results, format = 'csv') {
    const exportData = [];
    
    Object.keys(results.entities).forEach(entityType => {
        const entity = results.entities[entityType];
        entity.results.forEach(result => {
            exportData.push({
                entity: entity.name,
                ...result
            });
        });
    });
    
    if (format === 'csv') {
        const csv = convertToCSV(exportData);
        downloadFile(csv, `search-results-${Date.now()}.csv`, 'text/csv');
    } else if (format === 'json') {
        const json = JSON.stringify(exportData, null, 2);
        downloadFile(json, `search-results-${Date.now()}.json`, 'application/json');
    }
}

// Convert data to CSV
function convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => {
                const value = row[header] || '';
                return `"${value.toString().replace(/"/g, '""')}"`;
            }).join(',')
        )
    ].join('\n');
    
    return csvContent;
}

// Download file
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    initializeAdvancedSearch();
});

// Export functions for global access
window.advancedSearch = {
    initializeAdvancedSearch,
    performGlobalSearch,
    showAdvancedSearch,
    exportSearchResults,
    performBulkAction,
    loadSearchData,
    saveSearchData
};
