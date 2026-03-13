/* ===== Manual Entry Form JavaScript ===== */

// Form state
const formState = {
    expenses: [],
    income: [],
};

// ===== Initialize on page load =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('Manual Entry Page Loaded');

    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('expenseDate').value = today;
    document.getElementById('incomeDate').value = today;

    // Load data from local storage
    loadFromLocalStorage();

    // Setup tab switching
    setupTabSwitching();

    // Setup form submissions
    setupFormSubmission('expenseForm', 'expense');
    setupFormSubmission('incomeForm', 'income');

    // Setup tag inputs
    setupTagInput('expenseTags');
    setupTagInput('incomeTags');

    // Setup file upload drag and drop
    setupFileUpload('expenseReceipt');

    // Display recent entries
    displayRecentEntries();
});

// ===== Tab Switching =====
function setupTabSwitching() {
    const tabs = document.querySelectorAll('.entry-tab-btn');
    const forms = document.querySelectorAll('.entry-form');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // Update active form
            forms.forEach(form => form.classList.remove('active'));
            if (type === 'expense') {
                document.getElementById('expenseForm').classList.add('active');
            } else {
                document.getElementById('incomeForm').classList.add('active');
            }
        });
    });
}

// ===== Tag Input Setup =====
function setupTagInput(inputId) {
    const input = document.getElementById(inputId);
    const tagList = input.parentElement.querySelector('.tag-list');

    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && this.value.trim()) {
            e.preventDefault();
            addTag(this.value.trim(), tagList, input);
        }
    });
}

function addTag(tagText, tagList, input) {
    if (!tagText) return;

    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.innerHTML = `
        <span>${tagText}</span>
        <span class="tag-remove">&times;</span>
    `;

    tag.querySelector('.tag-remove').addEventListener('click', function() {
        tag.remove();
    });

    tagList.appendChild(tag);
    input.value = '';
}

// ===== File Upload Setup =====
function setupFileUpload(inputId) {
    const fileInput = document.getElementById(inputId);
    const fileUpload = fileInput.parentElement;

    // Click to upload
    fileUpload.addEventListener('click', function() {
        fileInput.click();
    });

    // Drag and drop
    fileUpload.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUpload.style.borderColor = '#10b981';
        fileUpload.style.background = 'rgba(16, 185, 129, 0.05)';
    });

    fileUpload.addEventListener('dragleave', () => {
        fileUpload.style.borderColor = '#d1d5db';
        fileUpload.style.background = '';
    });

    fileUpload.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUpload.style.borderColor = '#d1d5db';
        fileUpload.style.background = '';
        
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            updateFileInputDisplay(fileInput);
        }
    });

    fileInput.addEventListener('change', function() {
        updateFileInputDisplay(this);
    });
}

function updateFileInputDisplay(fileInput) {
    const fileUpload = fileInput.parentElement;
    const uploadText = fileUpload.querySelector('.upload-text');
    
    if (fileInput.files.length > 0) {
        uploadText.textContent = `📄 ${fileInput.files[0].name}`;
    } else {
        uploadText.textContent = '📎 Click to upload receipt or drag & drop';
    }
}

// ===== Form Submission =====
function setupFormSubmission(formId, type) {
    const form = document.getElementById(formId);
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        try {
            // Get form data
            const formData = new FormData(this);
            const entry = {
                id: Date.now(),
                type: type,
                amount: parseFloat(formData.get('amount')),
                date: formData.get('date'),
                time: formData.get('time') || getCurrentTime(),
                description: formData.get('description'),
                timestamp: new Date().toISOString(),
            };

            if (type === 'expense') {
                entry.category = formData.get('category');
                entry.merchant = formData.get('merchant');
                entry.paymentMethod = formData.get('paymentMethod');
                entry.tags = getTags('expenseTags');
            } else {
                entry.source = formData.get('source');
                entry.method = formData.get('method');
                entry.tags = getTags('incomeTags');
            }

            // Validate entry
            if (!validateEntry(entry)) {
                showError('Please fill in all required fields correctly');
                return;
            }

            // Add to appropriate array
            if (type === 'expense') {
                formState.expenses.push(entry);
            } else {
                formState.income.push(entry);
            }

            // Save to local storage
            saveToLocalStorage();

            // Show success message
            showSuccess(`${type === 'expense' ? 'Expense' : 'Income'} added successfully!`);

            // Reset form
            form.reset();
            document.getElementById(type === 'expense' ? 'expenseDate' : 'incomeDate').value = new Date().toISOString().split('T')[0];
            
            // Clear tags
            if (type === 'expense') {
                document.querySelector('#expenseTags').parentElement.querySelector('.tag-list').innerHTML = '';
            } else {
                document.querySelector('#incomeTags').parentElement.querySelector('.tag-list').innerHTML = '';
            }

            // Refresh display
            displayRecentEntries();

        } catch (error) {
            console.error('Form submission error:', error);
            showError('An error occurred while saving your entry');
        }
    });
}

// ===== Helper Functions =====
function getTags(inputId) {
    const tagList = document.getElementById(inputId).parentElement.querySelector('.tag-list');
    const tags = [];
    tagList.querySelectorAll('.tag span:first-child').forEach(tag => {
        tags.push(tag.textContent.trim());
    });
    return tags;
}

function validateEntry(entry) {
    if (!entry.amount || entry.amount <= 0) return false;
    if (!entry.date) return false;
    if (!entry.description || entry.description.trim() === '') return false;
    
    if (entry.type === 'expense') {
        if (!entry.category) return false;
        if (!entry.paymentMethod) return false;
    } else {
        if (!entry.source) return false;
    }
    
    return true;
}

function getCurrentTime() {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

// ===== Local Storage =====
function saveToLocalStorage() {
    try {
        localStorage.setItem('finproData', JSON.stringify(formState));
        console.log('Data saved to local storage');
    } catch (error) {
        console.error('Failed to save to local storage:', error);
    }
}

function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem('finproData');
        if (saved) {
            const data = JSON.parse(saved);
            formState.expenses = data.expenses || [];
            formState.income = data.income || [];
            console.log('Data loaded from local storage');
        }
    } catch (error) {
        console.error('Failed to load from local storage:', error);
        formState.expenses = [];
        formState.income = [];
    }
}

// ===== Display Recent Entries =====
function displayRecentEntries() {
    const entriesList = document.getElementById('entriesList');
    
    // Combine all entries and sort by timestamp (newest first)
    const allEntries = [...formState.expenses, ...formState.income]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10);

    if (allEntries.length === 0) {
        entriesList.innerHTML = '<div class="no-entries"><p>📝 No manual entries yet. Add your first transaction above!</p></div>';
        return;
    }

    entriesList.innerHTML = allEntries.map(entry => createEntryCard(entry)).join('');

    // Add event listeners to action buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const entryId = parseInt(this.getAttribute('data-id'));
            const action = this.getAttribute('data-action');

            if (action === 'delete') {
                deleteEntry(entryId);
            }
        });
    });
}

function createEntryCard(entry) {
    const isExpense = entry.type === 'expense';
    const amountClass = isExpense ? 'expense' : 'income';
    const amountSign = isExpense ? '-' : '+';
    
    let icon = '💰';
    let categoryText = '';

    if (isExpense) {
        categoryText = entry.category;
        const categoryIcons = {
            food: '🍔',
            transport: '🚗',
            entertainment: '🎬',
            utilities: '⚡',
            shopping: '🛍️',
            health: '🏥',
            education: '📚',
            personal: '💄',
            home: '🏠',
            other: '📦'
        };
        icon = categoryIcons[entry.category] || '💰';
    } else {
        categoryText = entry.source;
        const sourceIcons = {
            salary: '💼',
            freelance: '💻',
            investment: '📈',
            bonus: '🎁',
            refund: '↩️',
            gift: '🎉',
            other: '📝'
        };
        icon = sourceIcons[entry.source] || '💰';
    }

    const date = new Date(entry.date).toLocaleDateString('en-IN', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });

    const merchant = entry.merchant ? `<div class="entry-category">📍 ${entry.merchant}</div>` : '';
    const tagsHtml = entry.tags && entry.tags.length > 0 
        ? `<div class="entry-category">${entry.tags.map(t => `<span style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; margin-right: 4px; font-size: 11px;">${t}</span>`).join('')}</div>`
        : '';

    return `
        <div class="entry-card">
            <div class="entry-details">
                <div class="entry-header">
                    <span class="entry-icon">${icon}</span>
                    <div>
                        <div class="entry-merchant">${entry.description.substring(0, 40)}${entry.description.length > 40 ? '...' : ''}</div>
                        ${merchant}
                        <div class="entry-category">${categoryText}</div>
                        ${tagsHtml}
                    </div>
                </div>
            </div>
            <div style="text-align: right;">
                <div class="entry-amount ${amountClass}">
                    ${amountSign}₹${entry.amount.toFixed(2)}
                </div>
                <div class="entry-date">${date} ${entry.time}</div>
            </div>
            <div class="entry-actions">
                <button class="action-btn" data-id="${entry.id}" data-action="edit">✎ Edit</button>
                <button class="action-btn delete" data-id="${entry.id}" data-action="delete">🗑️ Delete</button>
            </div>
        </div>
    `;
}

function deleteEntry(entryId) {
    if (confirm('Are you sure you want to delete this entry?')) {
        formState.expenses = formState.expenses.filter(e => e.id !== entryId);
        formState.income = formState.income.filter(e => e.id !== entryId);
        saveToLocalStorage();
        displayRecentEntries();
        showSuccess('Entry deleted successfully!');
    }
}

// ===== Notification Functions =====
function showSuccess(message) {
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: #fff;
        padding: 16px 24px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showError(message) {
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: #fff;
        padding: 16px 24px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animations to document
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

console.log('Manual Entry JavaScript loaded successfully');