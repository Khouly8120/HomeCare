// Sample Data for Home Care PT Manager
// This file provides realistic sample data for all modules to ensure full functionality

// Sample Patients Data
const samplePatients = [
    {
        id: 1001,
        firstName: "John",
        lastName: "Smith",
        dateOfBirth: "1965-03-15",
        contactNumber: "(555) 123-4567",
        email: "john.smith@email.com",
        address: "123 Main St, Brooklyn, NY 11201",
        zipCode: "11201",
        emergencyContact: "Jane Smith - (555) 123-4568",
        primaryInsurance: "Medicare",
        secondaryInsurance: "Aetna",
        memberID: "123456789A",
        groupNumber: "GRP001",
        clinicName: "Brooklyn Home Care",
        status: "in-progress",
        assignedPT: "Sarah Johnson, PT",
        lastContact: "2024-08-10",
        dateAdded: "2024-01-15T10:00:00Z",
        appointments: [
            {
                appointmentDate: "2024-08-10T14:00:00Z",
                provider: "Dr. Sarah Johnson",
                status: "scheduled",
                notes: "Initial evaluation"
            }
        ],
        payments: [
            {
                dateOfService: "2024-07-15T00:00:00Z",
                amount: 150,
                status: "paid",
                paymentMethod: "insurance"
            }
        ]
    },
    {
        id: 1002,
        firstName: "Maria",
        lastName: "Rodriguez",
        dateOfBirth: "1978-07-22",
        contactNumber: "(555) 234-5678",
        email: "maria.rodriguez@email.com",
        address: "456 Oak Ave, Queens, NY 11375",
        zipCode: "11375",
        emergencyContact: "Carlos Rodriguez - (555) 234-5679",
        primaryInsurance: "Blue Cross Blue Shield",
        status: "scheduled",
        assignedPT: "Michael Chen, PT",
        lastContact: "2024-08-08",
        dateAdded: "2024-02-20T10:00:00Z"
    },
    {
        id: 1003,
        firstName: "Robert",
        lastName: "Johnson",
        dateOfBirth: "1952-11-08",
        contactNumber: "(555) 345-6789",
        email: "robert.johnson@email.com",
        address: "789 Pine St, Manhattan, NY 10001",
        zipCode: "10001",
        emergencyContact: "Linda Johnson - (555) 345-6790",
        primaryInsurance: "Medicaid",
        status: "interested",
        assignedPT: "Not Assigned",
        lastContact: "2024-08-05",
        dateAdded: "2024-08-01T10:00:00Z"
    },
    {
        id: 1004,
        firstName: "Emily",
        lastName: "Davis",
        dateOfBirth: "1945-05-30",
        contactNumber: "(555) 456-7890",
        email: "emily.davis@email.com",
        address: "321 Elm St, Bronx, NY 10451",
        zipCode: "10451",
        emergencyContact: "Tom Davis - (555) 456-7891",
        primaryInsurance: "Private Insurance",
        status: "completed",
        assignedPT: "Lisa Wong, PT",
        lastContact: "2024-07-30",
        dateAdded: "2024-06-15T10:00:00Z"
    },
    {
        id: 1005,
        firstName: "James",
        lastName: "Wilson",
        dateOfBirth: "1960-09-12",
        contactNumber: "(555) 567-8901",
        email: "james.wilson@email.com",
        address: "654 Maple Ave, Staten Island, NY 10301",
        zipCode: "10301",
        emergencyContact: "Mary Wilson - (555) 567-8902",
        primaryInsurance: "Medicare",
        status: "cancelled",
        assignedPT: "Not Assigned",
        lastContact: "2024-07-20",
        dateAdded: "2024-07-10T10:00:00Z"
    }
];

// Sample Providers Data
const sampleProviders = [
    {
        id: 2001,
        name: "Dr. Sarah Johnson",
        contactNumber: "(555) 111-2222",
        email: "sarah.johnson@homecare.com",
        borough: "Brooklyn",
        position: "Physical Therapist",
        rate: "$85/hour",
        paymentType: "1099",
        specialty: "PT",
        status: "active",
        dateAdded: "2024-01-01T00:00:00Z",
        availability: {
            monday: { available: true, startTime: "09:00", endTime: "17:00" },
            tuesday: { available: true, startTime: "09:00", endTime: "17:00" },
            wednesday: { available: true, startTime: "09:00", endTime: "17:00" },
            thursday: { available: true, startTime: "09:00", endTime: "17:00" },
            friday: { available: true, startTime: "09:00", endTime: "15:00" },
            saturday: { available: false },
            sunday: { available: false }
        },
        zipCodes: ["11201", "11215", "11217"],
        generalNotes: "Specializes in geriatric care",
        utilizationStats: {
            totalAvailableHours: 40,
            scheduledHours: 32,
            utilizationPercentage: 80,
            lastCalculated: "2024-08-06T00:00:00Z"
        }
    },
    {
        id: 2002,
        name: "Dr. Michael Chen",
        contactNumber: "(555) 222-3333",
        email: "michael.chen@homecare.com",
        borough: "Queens",
        position: "Physical Therapist",
        rate: "$90/hour",
        paymentType: "W2",
        specialty: "PT",
        status: "active",
        dateAdded: "2024-01-15T00:00:00Z",
        availability: {
            monday: { available: true, startTime: "08:00", endTime: "16:00" },
            tuesday: { available: true, startTime: "08:00", endTime: "16:00" },
            wednesday: { available: true, startTime: "08:00", endTime: "16:00" },
            thursday: { available: true, startTime: "08:00", endTime: "16:00" },
            friday: { available: true, startTime: "08:00", endTime: "16:00" },
            saturday: { available: true, startTime: "09:00", endTime: "13:00" },
            sunday: { available: false }
        },
        zipCodes: ["11375", "11385", "11372"],
        generalNotes: "Bilingual (English/Mandarin)",
        utilizationStats: {
            totalAvailableHours: 44,
            scheduledHours: 38,
            utilizationPercentage: 86,
            lastCalculated: "2024-08-06T00:00:00Z"
        }
    },
    {
        id: 2003,
        name: "Lisa Williams",
        contactNumber: "(555) 333-4444",
        email: "lisa.williams@homecare.com",
        borough: "Manhattan",
        position: "Physical Therapist Assistant",
        rate: "$65/hour",
        paymentType: "1099",
        specialty: "PTA",
        status: "active",
        dateAdded: "2024-02-01T00:00:00Z",
        availability: {
            monday: { available: true, startTime: "10:00", endTime: "18:00" },
            tuesday: { available: true, startTime: "10:00", endTime: "18:00" },
            wednesday: { available: true, startTime: "10:00", endTime: "18:00" },
            thursday: { available: true, startTime: "10:00", endTime: "18:00" },
            friday: { available: false },
            saturday: { available: true, startTime: "08:00", endTime: "16:00" },
            sunday: { available: true, startTime: "08:00", endTime: "16:00" }
        },
        zipCodes: ["10001", "10002", "10003"],
        generalNotes: "Weekend availability",
        utilizationStats: {
            totalAvailableHours: 40,
            scheduledHours: 28,
            utilizationPercentage: 70,
            lastCalculated: "2024-08-06T00:00:00Z"
        }
    }
];

// Sample Benefits Verifications
const sampleBenefitsVerifications = [
    {
        id: 3001,
        patientId: 1001,
        patientName: "John Smith",
        insuranceName: "Medicare",
        memberID: "123456789A",
        groupNumber: "GRP001",
        verificationDate: "2024-07-15T00:00:00Z",
        status: "verified",
        benefits: {
            ptCoverage: "80% covered after deductible",
            copay: "20",
            deductible: "500",
            maxVisits: "20",
            remainingVisits: "15"
        },
        notes: "Deductible met for 2024",
        expirationDate: "2024-12-31T00:00:00Z",
        lastUpdated: "2024-07-15T00:00:00Z"
    },
    {
        id: 3002,
        patientId: 1002,
        patientName: "Maria Rodriguez",
        insuranceName: "Blue Cross Blue Shield",
        memberID: "987654321B",
        groupNumber: "GRP002",
        verificationDate: "2024-07-20T00:00:00Z",
        status: "pending",
        benefits: {
            ptCoverage: null,
            copay: null,
            deductible: null,
            maxVisits: null,
            remainingVisits: null
        },
        notes: "Waiting for insurance response",
        expirationDate: null,
        lastUpdated: "2024-07-20T00:00:00Z"
    }
];

// Sample Authorization Requests
const sampleAuthorizationRequests = [
    {
        id: 4001,
        patientId: 1001,
        patientName: "John Smith",
        requestDate: "2024-07-10T00:00:00Z",
        status: "approved",
        authNumber: "AUTH2024001",
        requestedVisits: 12,
        approvedVisits: 12,
        startDate: "2024-07-15T00:00:00Z",
        endDate: "2024-10-15T00:00:00Z",
        diagnosis: "M25.511 - Pain in right shoulder",
        notes: "Post-surgical rehabilitation",
        lastUpdated: "2024-07-12T00:00:00Z"
    },
    {
        id: 4002,
        patientId: 1002,
        patientName: "Maria Rodriguez",
        requestDate: "2024-07-25T00:00:00Z",
        status: "pending",
        authNumber: "",
        requestedVisits: 8,
        approvedVisits: 0,
        startDate: "2024-08-01T00:00:00Z",
        endDate: "2024-09-30T00:00:00Z",
        diagnosis: "M54.5 - Low back pain",
        notes: "Chronic pain management",
        lastUpdated: "2024-07-25T00:00:00Z"
    },
    {
        id: 4003,
        patientId: 1003,
        patientName: "Robert Johnson",
        requestDate: "2024-06-01T00:00:00Z",
        status: "approved",
        authNumber: "AUTH2024002",
        requestedVisits: 6,
        approvedVisits: 6,
        startDate: "2024-06-15T00:00:00Z",
        endDate: "2024-08-15T00:00:00Z",
        diagnosis: "Z51.89 - Other specified aftercare",
        notes: "Hip replacement recovery",
        lastUpdated: "2024-06-05T00:00:00Z"
    }
];

// Function to load sample data (ONLY as fallback when no real data exists)
function loadSampleData() {
    console.log('Checking for existing data before loading samples...');
    
    // Only load sample data if no existing data exists
    const existingPatients = localStorage.getItem('patients');
    if (!existingPatients || JSON.parse(existingPatients).length === 0) {
        localStorage.setItem('patients', JSON.stringify(samplePatients));
        console.log('Sample patients data loaded (no existing data found)');
    } else {
        console.log('Existing patients data found, skipping sample data');
    }
    
    const existingProviders = localStorage.getItem('providers');
    if (!existingProviders || JSON.parse(existingProviders).length === 0) {
        localStorage.setItem('providers', JSON.stringify(sampleProviders));
        console.log('Sample providers data loaded (no existing data found)');
    } else {
        console.log('Existing providers data found, skipping sample data');
    }
    
    const existingBenefits = localStorage.getItem('benefitsVerifications');
    if (!existingBenefits || JSON.parse(existingBenefits).length === 0) {
        localStorage.setItem('benefitsVerifications', JSON.stringify(sampleBenefitsVerifications));
        console.log('Sample benefits verifications data loaded (no existing data found)');
    } else {
        console.log('Existing benefits data found, skipping sample data');
    }
    
    const existingAuth = localStorage.getItem('authorizationRequests');
    if (!existingAuth || JSON.parse(existingAuth).length === 0) {
        localStorage.setItem('authorizationRequests', JSON.stringify(sampleAuthorizationRequests));
        console.log('Sample authorization requests data loaded (no existing data found)');
    } else {
        console.log('Existing authorization data found, skipping sample data');
    }
}

// Data priority utility functions
function getPatientData() {
    const data = localStorage.getItem('patients');
    return data ? JSON.parse(data) : [];
}

function getProviderData() {
    const data = localStorage.getItem('providers');
    return data ? JSON.parse(data) : [];
}

function getBenefitsData() {
    const data = localStorage.getItem('benefitsVerifications');
    return data ? JSON.parse(data) : [];
}

function getAuthorizationData() {
    const data = localStorage.getItem('authorizationRequests');
    return data ? JSON.parse(data) : [];
}

// Check if we have imported (real) data vs sample data
function hasImportedData() {
    const patients = getPatientData();
    const providers = getProviderData();
    
    // Check if any data has import-specific IDs (not sample IDs)
    const hasImportedPatients = patients.some(p => p.id && p.id.toString().startsWith('patient_'));
    const hasImportedProviders = providers.some(p => p.id && p.id.toString().startsWith('provider_'));
    
    return hasImportedPatients || hasImportedProviders;
}

// Load sample data when script loads
loadSampleData();

// Make data access functions globally available immediately
if (typeof window !== 'undefined') {
    window.getPatientData = getPatientData;
    window.getProviderData = getProviderData;
    window.getBenefitsData = getBenefitsData;
    window.getAuthorizationData = getAuthorizationData;
    window.hasImportedData = hasImportedData;
    
    console.log('Data priority system initialized - imported data will take precedence over sample data');
    console.log('Global functions exported:', {
        getPatientData: typeof window.getPatientData,
        getProviderData: typeof window.getProviderData,
        hasImportedData: typeof window.hasImportedData
    });
} else {
    console.error('Window object not available for global exports');
}
