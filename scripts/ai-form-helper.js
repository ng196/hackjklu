/**
 * AI Form Helper - Floating chatbot icon on form pages
 * Can auto-fill forms via AI commands
 */

class AIFormHelper {
    constructor(pageContext) {
        this.pageContext = pageContext; // 'manual-entry' | 'goals' | 'expenses'
        this.isOpen = false;
        this.messages = [];
        this.init();
    }

    init() {
        this.createWidget();
        this.attachEvents();
    }

    createWidget() {
        const html = `
        <button class="ai-helper-fab" id="aiHelperFab" title="AI Form Assistant">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="url(#grad1)"/>
                <defs><linearGradient id="grad1" x1="0" y1="0" x2="24" y2="24"><stop offset="0%" stop-color="#10B981"/><stop offset="100%" stop-color="#059669"/></linearGradient></defs>
                <path d="M8 10h8M8 14h5" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                <circle cx="17" cy="7" r="4" fill="#F59E0B" stroke="white" stroke-width="1.5"/>
                <text x="17" y="9" text-anchor="middle" fill="white" font-size="6" font-weight="bold">AI</text>
            </svg>
        </button>

        <div class="ai-helper-panel" id="aiHelperPanel">
            <div class="ai-helper-header">
                <div class="ai-helper-header-info">
                    <span class="ai-helper-dot"></span>
                    <span>FinWise AI Helper</span>
                </div>
                <button class="ai-helper-close" id="aiHelperClose">&times;</button>
            </div>
            <div class="ai-helper-body" id="aiHelperBody">
                <div class="ai-helper-welcome">
                    <div class="ai-helper-welcome-icon">🤖</div>
                    <p>I can fill forms for you! Try:</p>
                    <div class="ai-helper-suggestions" id="aiHelperSuggestions"></div>
                </div>
            </div>
            <div class="ai-helper-input-area">
                <input type="text" class="ai-helper-input" id="aiHelperInput" placeholder="Tell me what to fill..." autocomplete="off">
                <button class="ai-helper-send" id="aiHelperSend">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M7 11L12 6L17 11M12 18V7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
            </div>
        </div>`;

        const container = document.createElement('div');
        container.id = 'aiFormHelperContainer';
        container.innerHTML = html;
        document.body.appendChild(container);

        this.fab = document.getElementById('aiHelperFab');
        this.panel = document.getElementById('aiHelperPanel');
        this.body = document.getElementById('aiHelperBody');
        this.input = document.getElementById('aiHelperInput');
        this.sendBtn = document.getElementById('aiHelperSend');
        this.suggestionsEl = document.getElementById('aiHelperSuggestions');

        this.renderSuggestions();
    }

    renderSuggestions() {
        const suggestions = {
            'manual-entry': [
                'Add ₹500 food expense today',
                'Log ₹75000 salary income',
                'Add 3 random test expenses'
            ],
            'goals': [
                'Create a vacation goal for ₹50000',
                'Add a car purchase goal',
                'Create an emergency fund goal'
            ],
            'expenses': [
                'Summarize my spending',
                'What category do I spend most on?'
            ]
        };

        const items = suggestions[this.pageContext] || suggestions['manual-entry'];
        this.suggestionsEl.innerHTML = items.map(s =>
            `<button class="ai-helper-suggestion" onclick="window._aiFormHelper.useSuggestion('${s.replace(/'/g, "\\'")}')">${s}</button>`
        ).join('');
    }

    attachEvents() {
        this.fab.addEventListener('click', () => this.toggle());
        document.getElementById('aiHelperClose').addEventListener('click', () => this.close());
        this.sendBtn.addEventListener('click', () => this.send());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.send();
        });
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        this.isOpen = true;
        this.panel.classList.add('active');
        this.fab.classList.add('active');
        this.input.focus();
    }

    close() {
        this.isOpen = false;
        this.panel.classList.remove('active');
        this.fab.classList.remove('active');
    }

    useSuggestion(text) {
        this.input.value = text;
        this.send();
    }

    addMessage(text, role) {
        const welcome = this.body.querySelector('.ai-helper-welcome');
        if (welcome) welcome.remove();

        const div = document.createElement('div');
        div.className = `ai-helper-msg ${role}`;
        div.textContent = text;
        this.body.appendChild(div);
        this.body.scrollTop = this.body.scrollHeight;
    }

    addActionResult(results) {
        for (const r of results) {
            if (r.success) {
                const div = document.createElement('div');
                div.className = 'ai-helper-msg action-result';
                div.innerHTML = `✅ ${r.message}`;
                this.body.appendChild(div);
            }
        }
        this.body.scrollTop = this.body.scrollHeight;
    }

    async send() {
        const text = this.input.value.trim();
        if (!text) return;

        this.input.value = '';
        this.addMessage(text, 'user');

        // Show loading
        const loading = document.createElement('div');
        loading.className = 'ai-helper-msg bot loading';
        loading.innerHTML = '<span class="ai-helper-dots"><span></span><span></span><span></span></span>';
        this.body.appendChild(loading);
        this.body.scrollTop = this.body.scrollHeight;

        // Get form context
        const formContext = this.getFormContext();

        const systemPrompt = `You are FinWise AI Form Helper. You help users fill forms quickly.

Current page: ${this.pageContext}
Available form fields: ${JSON.stringify(formContext)}

When the user asks you to fill a form or add entries, respond with action blocks.
For manual-entry page, use add_transaction action.
For goals page, use create_goal action.

You can add MULTIPLE entries at once if asked.

Action format:
\`\`\`action
{"action": "add_transaction", "data": {"type": "expense", "amount": 500, "category": "food", "description": "Lunch", "date": "${new Date().toISOString().split('T')[0]}"}}
\`\`\`

After performing actions, also try to fill in the visible form fields on the page. Respond with a form_fill action:
\`\`\`action
{"action": "form_fill", "data": {"fieldId": "value", ...}}
\`\`\`

Be concise and helpful. Confirm what you did.`;

        try {
            const result = await finwiseAI.chat(text, systemPrompt);
            loading.remove();

            this.addMessage(result.message || 'Done!', 'bot');

            if (result.actions && result.actions.length > 0) {
                this.addActionResult(result.actions);
            }

            // Check for form_fill actions in raw response
            this.tryFormFill(result.raw || '');

        } catch (err) {
            loading.remove();
            this.addMessage('Sorry, something went wrong. Is the AI server running?', 'bot');
        }
    }

    getFormContext() {
        const fields = [];
        document.querySelectorAll('input, select, textarea').forEach(el => {
            if (el.id && !el.id.startsWith('aiHelper')) {
                fields.push({
                    id: el.id,
                    type: el.type || el.tagName.toLowerCase(),
                    label: el.closest('.form-group')?.querySelector('label')?.textContent || el.placeholder || el.id
                });
            }
        });
        return fields;
    }

    tryFormFill(raw) {
        const fillRegex = /```action\s*\n?([\s\S]*?)```/g;
        let match;
        while ((match = fillRegex.exec(raw)) !== null) {
            try {
                const parsed = JSON.parse(match[1].trim());
                if (parsed.action === 'form_fill' && parsed.data) {
                    for (const [fieldId, value] of Object.entries(parsed.data)) {
                        const el = document.getElementById(fieldId);
                        if (el) {
                            el.value = value;
                            el.dispatchEvent(new Event('change', { bubbles: true }));
                            el.dispatchEvent(new Event('input', { bubbles: true }));
                            // Highlight filled field
                            el.style.transition = 'box-shadow 0.3s';
                            el.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.3)';
                            setTimeout(() => { el.style.boxShadow = ''; }, 2000);
                        }
                    }
                }
            } catch (e) { /* ignore */ }
        }
    }
}

// Make accessible globally
window._aiFormHelper = null;

function initAIFormHelper(pageContext) {
    if (typeof finwiseAI === 'undefined') {
        console.warn('AI Actions system not loaded. Include ai-actions.js first.');
        return;
    }
    window._aiFormHelper = new AIFormHelper(pageContext);
}
