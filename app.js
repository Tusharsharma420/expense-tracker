/**
 * Simple SPA Router & App Logic
 */

const defaultCategories = [
    { id: 'food', label: 'Food', icon: 'restaurant' },
    { id: 'transport', label: 'Transport', icon: 'directions_car' },
    { id: 'bills', label: 'Bills', icon: 'receipt' },
    { id: 'shopping', label: 'Shopping', icon: 'shopping_bag' },
    { id: 'health', label: 'Health', icon: 'health_and_safety' },
    { id: 'ent', label: 'Fun', icon: 'stadia_controller' },
    { id: 'dairy', label: 'Dairy', icon: 'water_drop' },
    { id: 'veg', label: 'Vegetable', icon: 'nutrition' }
];

let categories = [...defaultCategories];

const app = {
    state: {
        transactions: [],
        config: {
            apiUrl: localStorage.getItem('apiUrl') || '',
            familyId: localStorage.getItem('familyId') || '',
            userName: localStorage.getItem('userName') || '',
            userRole: localStorage.getItem('userRole') || '', // New
            userContact: localStorage.getItem('userContact') || '', // New
            userAvatar: localStorage.getItem('userAvatar') || '', // Me
            customCategories: JSON.parse(localStorage.getItem('customCategories') || '[]'), // New
            familyAvatars: JSON.parse(localStorage.getItem('familyAvatars') || '{}'), // Others map: name -> base64
            budgetLimit: Number(localStorage.getItem('budgetLimit') || 0) // New: Monthly Budget
        },
        online: navigator.onLine,
        filter: '' // New: Search query
    },

    init: () => {
        // Event Listeners
        window.addEventListener('online', () => app.updateOnlineStatus(true));
        window.addEventListener('offline', () => app.updateOnlineStatus(false));

        // Load Data
        app.loadLocalData();

        // Update Header
        app.updateHeaderAvatar();

        // Initial Route
        if (!app.state.config.apiUrl || !app.state.config.userName) {
            router.navigate('config');
        } else {
            router.navigate('dashboard');
            app.sync();
        }
    },

    handleSearch: (query) => {
        // Feature Removed
    },

    editBudget: () => {
        // Feature Removed
    },

    startVoiceInput: () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Voice input not supported in this browser.');
            return;
        }

        const recognition = new webkitSpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.start();

        recognition.onresult = (event) => {
            const speechResult = event.results[0][0].transcript;
            const words = speechResult.split(' ');
            const number = words.find(w => !isNaN(w));
            if (number) {
                const amountParams = document.getElementById('inpAmount');
                if (amountParams) amountParams.value = number;
            }
            const noteInput = document.getElementById('inpNote');
            if (noteInput) {
                noteInput.value = speechResult;
            }
            app.autoSelectCategory(speechResult);
        };
    },

    autoSelectCategory: (text) => {
        const lower = text.toLowerCase();
        const found = categories.find(c => lower.includes(c.label.toLowerCase()) || lower.includes(c.id));
        if (found) {
            document.getElementById('inpCategory').value = found.id;
            document.querySelectorAll('.chip').forEach(c => {
                c.classList.remove('selected');
                if (c.textContent === found.label) c.classList.add('selected');
            });
        }
    },

    // ... (rest of methods) ...

    renderDashboard: () => {
        const list = document.getElementById('recentTransactions');
        if (!list) return;

        list.innerHTML = '';

        // Calc Totals for Current Month
        const currentMonth = new Date().toISOString().slice(0, 7);
        const monthTxns = app.state.transactions.filter(t => t.date.startsWith(currentMonth) && !t.archived);

        const income = monthTxns
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const expense = monthTxns
            .filter(t => !t.type || t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const balance = income - expense;

        document.getElementById('totalBalance').textContent = `₹ ${balance.toLocaleString()}`;
        document.getElementById('totalIncome').textContent = `₹ ${income.toLocaleString()}`;
        document.getElementById('totalExpense').textContent = `₹ ${expense.toLocaleString()}`;

        // Render Family Summary
        const familyList = document.getElementById('familySummary');
        if (familyList) {
            familyList.innerHTML = '';
            familyList.className = 'family-list';

            const personStats = {};
            monthTxns.forEach(t => {
                const p = t.person || 'Me';
                if (!personStats[p]) personStats[p] = { income: 0, expense: 0 };
                if (t.type === 'income') personStats[p].income += Number(t.amount);
                else personStats[p].expense += Number(t.amount);
            });

            const people = Object.keys(personStats).sort();
            if (people.length === 0 && app.state.config.userName) {
                people.push(app.state.config.userName);
            }

            people.forEach(p => {
                const isMe = (p === app.state.config.userName);
                let avatarContent = '';
                if (isMe && app.state.config.userAvatar) {
                    avatarContent = `<img src="${app.state.config.userAvatar}">`;
                } else if (app.state.config.familyAvatars && app.state.config.familyAvatars[p]) {
                    avatarContent = `<img src="${app.state.config.familyAvatars[p]}">`;
                } else {
                    const initial = p.charAt(0).toUpperCase();
                    const hue = (p.length * 50) % 360;
                    avatarContent = `<div style="width:100%; height:100%; background:hsl(${hue}, 70%, 90%); color:hsl(${hue}, 70%, 30%); display:flex; align-items:center; justify-content:center; font-weight:600; font-size:1.2rem;">${initial}</div>`;
                }

                const el = document.createElement('div');
                el.className = 'family-story';
                el.onclick = () => router.navigate('person', p);
                el.innerHTML = `
                     <div class="story-ring">
                         <div class="story-avatar">${avatarContent}</div>
                     </div>
                     <span class="story-name">${isMe ? 'You' : p}</span>
                 `;
                familyList.appendChild(el);
            });
        }

        // Render List (Top 20 Only)
        app.state.transactions.slice(0, 20).forEach(txn => {
            const isIncome = txn.type === 'income';
            let icon = 'help';
            let label = txn.category;

            if (isIncome) {
                icon = 'monetization_on';
                label = 'Income';
            } else {
                const c = categories.find(cat => cat.id === txn.category);
                if (c) {
                    icon = c.icon;
                    label = c.label;
                }
            }

            const el = document.createElement('div');
            el.className = 'txn-item';
            el.onclick = () => router.navigate('edit', txn.txn_id);
            el.style.cursor = 'pointer';
            el.innerHTML = `
                <div class="txn-left">
                    <div class="cat-icon" style="${isIncome ? 'color:var(--success); background:rgba(0,184,148,0.1)' : ''}">
                        <span class="material-symbols-rounded">${icon}</span>
                    </div>
                    <div class="txn-details">
                        <h4>${label}</h4>
                        <p>${txn.person || 'Me'} • ${txn.note || label} • ${txn.date}</p>
                    </div>
                </div>
                <div class="txn-amount ${isIncome ? 'income' : 'expense'}">
                    ${isIncome ? '+' : '-'} ₹${txn.amount}
                </div>
            `;
            list.appendChild(el);
        });
    },

    renderAnalytics: () => {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;

        // Destroy old chart instance if any (Chart.js quirk, simplified here by assuming re-render)
        // In simple apps, often simpler to recreate canvas or specific update logic.
        // For now, let's look for existing chart logic or just overwrite if simple.
        // Note: Chart.js reuse on same canvas ID needs destroy.

        const chartStatus = Chart.getChart("categoryChart"); // <canvas> id
        if (chartStatus != undefined) {
            chartStatus.destroy();
        }

        const viewType = document.querySelector('input[name="chartView"]:checked')?.value || 'category';

        // Data prep
        const stats = {};
        app.state.transactions.forEach(t => {
            // Filter: Only Expenses for Analytics chart generally, or maybe both?
            // Usually analytics chart = expenses breakdown.
            if (t.type === 'income') return;

            const key = viewType === 'person' ? (t.person || 'Me') : t.category;

            if (!stats[key]) stats[key] = 0;
            stats[key] += Number(t.amount);
        });

        const labels = Object.keys(stats).map(k => {
            if (viewType === 'category') {
                const c = categories.find(cat => cat.id === k);
                return c ? c.label : k;
            }
            return k; // Person Name
        });
        const data = Object.values(stats);

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: ['#6c5ce7', '#ff7675', '#00b894', '#ffeaa7', '#a29bfe', '#fab1a0', '#fdcb6e', '#55efc4'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#636e72', font: { family: "'Outfit', sans-serif" } } }
                }
            }
        });

        // Render List below chart
        const statsList = document.getElementById('categoryStats');
        if (statsList) {
            statsList.innerHTML = '';
            const total = data.reduce((a, b) => a + b, 0);

            labels.forEach((label, idx) => {
                const val = data[idx];
                const pct = ((val / total) * 100).toFixed(1);

                const div = document.createElement('div');
                div.className = 'family-item'; // Reuse style
                div.style.marginBottom = '8px';
                div.innerHTML = `
                    <h4>${label}</h4>
                    <div style="text-align:right">
                         <div style="font-weight:600">₹ ${val.toLocaleString()}</div>
                         <div style="font-size:0.8rem; color:var(--text-muted)">${pct}%</div>
                    </div>
                `;
                statsList.appendChild(div);
            });
        }
    },

    renderPerson: (personName) => {
        const isMe = (personName === app.state.config.userName);

        // 1. Header Info
        document.getElementById('personName').textContent = personName;
        if (isMe && app.state.config.userRole) {
            const contact = app.state.config.userContact ? ` • ${app.state.config.userContact}` : '';
            document.getElementById('personRole').textContent = `${app.state.config.userRole}${contact}`;
        } else {
            // We don't really know others roles yet efficiently properly, could guess if we stored it
            document.getElementById('personRole').textContent = isMe ? 'You' : 'Family Member';
        }

        // Avatar
        const avatarContainer = document.getElementById('personAvatar');
        avatarContainer.innerHTML = '';

        if (isMe && app.state.config.userAvatar) {
            avatarContainer.innerHTML = `<img src="${app.state.config.userAvatar}" style="width:100%; height:100%; object-fit:cover;">`;
        } else if (app.state.config.familyAvatars && app.state.config.familyAvatars[personName]) {
            avatarContainer.innerHTML = `<img src="${app.state.config.familyAvatars[personName]}" style="width:100%; height:100%; object-fit:cover;">`;
        } else {
            const initial = personName.charAt(0).toUpperCase();
            const hue = (personName.length * 50) % 360;
            avatarContainer.innerHTML = `<div style="width:100%; height:100%; background:hsl(${hue}, 70%, 90%); color:hsl(${hue}, 70%, 30%); display:flex; align-items:center; justify-content:center; font-weight:600; font-size:2rem;">${initial}</div>`;
        }

        // 2. Stats
        // Filter transactions for this person
        const txns = app.state.transactions.filter(t => (t.person || 'Me') === personName || (isMe && !t.person)); // Handle legacy/null as Me

        const income = txns.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
        const expense = txns.filter(t => t.type === 'expense' || !t.type).reduce((s, t) => s + Number(t.amount), 0);

        document.getElementById('personIncome').textContent = `₹ ${income.toLocaleString()}`;
        document.getElementById('personExpense').textContent = `₹ ${expense.toLocaleString()}`;
        document.getElementById('personBalance').textContent = `₹ ${(income - expense).toLocaleString()}`;

        // 3. Transactions List
        const list = document.getElementById('personTransactions');
        list.innerHTML = '';

        if (txns.length === 0) {
            list.innerHTML = '<p style="text-align:center; padding:20px; color:var(--text-muted)">No history yet.</p>';
            return;
        }

        txns.slice(0, 50).forEach(txn => { // Cap to 50
            const isIncome = txn.type === 'income';
            let icon = isIncome ? 'monetization_on' : 'help';
            let label = txn.category;

            if (!isIncome) {
                const c = categories.find(cat => cat.id === txn.category);
                if (c) {
                    icon = c.icon;
                    label = c.label;
                }
            }

            const el = document.createElement('div');
            el.className = 'txn-item';
            el.onclick = () => router.navigate('edit', txn.txn_id); // Clickable
            el.style.cursor = 'pointer';
            el.innerHTML = `
                 <div class="txn-left">
                     <div class="cat-icon" style="${isIncome ? 'color:var(--success); background:rgba(0,184,148,0.1)' : ''}">
                         <span class="material-symbols-rounded">${icon}</span>
                     </div>
                     <div class="txn-details">
                         <h4>${label}</h4>
                         <p>${txn.note || label} • ${txn.date}</p>
                     </div>
                 </div>
                 <div class="txn-amount ${isIncome ? 'income' : 'expense'}">
                     ${isIncome ? '+' : '-'} ₹${txn.amount}
                 </div>
             `;
            list.appendChild(el);
        });
    } // End renderPerson logic
};

const router = {
    navigate: (viewName, param) => {
        const main = document.getElementById('mainView');
        const tpl = document.getElementById(`tpl-${viewName}`);

        if (!tpl) return;

        main.innerHTML = '';
        main.appendChild(tpl.content.cloneNode(true)); // Using cloneNode is important for templates

        // View specific logic
        if (viewName === 'dashboard') {
            app.renderDashboard();
        } else if (viewName === 'person' && param) {
            app.renderPerson(param);
        } else if (viewName === 'add') {
            // Set default date to today
            document.getElementById('inpDate').valueAsDate = new Date();

            // Render chips
            const chipContainer = document.getElementById('categoryChips');
            categories.forEach(cat => {
                const chip = document.createElement('div');
                chip.className = 'chip';
                chip.textContent = cat.label;
                chip.onclick = () => {
                    document.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
                    chip.classList.add('selected');
                    document.getElementById('inpCategory').value = cat.id;
                };
                chipContainer.appendChild(chip);
            });

            // Add Custom Button
            const addBtn = document.createElement('div');
            addBtn.className = 'chip';
            addBtn.style.background = 'var(--surface-2)';
            addBtn.style.border = '1px dashed var(--border)';
            addBtn.innerHTML = '<span class="material-symbols-rounded" style="font-size:1.2rem; vertical-align:middle">add</span>';
            addBtn.onclick = app.addCustomCategory;
            chipContainer.appendChild(addBtn);
        } else if (viewName === 'analytics') {
            setTimeout(app.renderAnalytics, 100); // Allow DOM to paint
        } else if (viewName === 'edit' && param) {
            // Param is txnId
            const txn = app.state.transactions.find(t => t.txn_id === param);
            if (!txn) {
                alert('Transaction not found');
                return router.navigate('dashboard');
            }

            // Fill Form
            document.getElementById('inpEditId').value = txn.txn_id;
            document.getElementById('inpEditAmount').value = txn.amount;
            document.getElementById('inpEditNote').value = txn.note || '';
            document.getElementById('inpEditDate').value = txn.date;
            document.getElementById('inpEditCategory').value = txn.category;

            // Type
            if (txn.type === 'income') {
                document.getElementById('edit-type-income').checked = true;
            } else {
                document.getElementById('edit-type-expense').checked = true;
            }
            app.toggleEditType(txn.type || 'expense');

            // Render chips
            const chipContainer = document.getElementById('editCategoryChips');
            categories.forEach(cat => {
                const chip = document.createElement('div');
                chip.className = 'chip';
                if (cat.id === txn.category) chip.classList.add('selected');
                chip.textContent = cat.label;
                chip.onclick = () => {
                    document.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
                    chip.classList.add('selected');
                    document.getElementById('inpEditCategory').value = cat.id;
                };
                chipContainer.appendChild(chip);
            });

        } else if (viewName === 'profile') {
            // Pre-fill
            document.getElementById('inpUserName').value = app.state.config.userName;
            document.getElementById('inpFamilyId').value = app.state.config.familyId;
            document.getElementById('inpApiUrl').value = app.state.config.apiUrl;
            if (document.getElementById('inpUserRole')) document.getElementById('inpUserRole').value = app.state.config.userRole || '';
            if (document.getElementById('inpUserContact')) document.getElementById('inpUserContact').value = app.state.config.userContact || '';

            // Show current avatar if exists
            if (app.state.config.userAvatar) {
                const preview = document.getElementById('profilePreview');
                const ph = document.getElementById('profilePlaceholder');
                preview.src = app.state.config.userAvatar;
                preview.style.display = 'block';
                ph.style.display = 'none';
            }

            // Render Custom Categories
            const catList = document.getElementById('customCategoriesList');
            if (catList) {
                catList.innerHTML = '';
                if (app.state.config.customCategories && app.state.config.customCategories.length > 0) {
                    app.state.config.customCategories.forEach(cat => {
                        const chip = document.createElement('div');
                        chip.className = 'chip';
                        chip.style.paddingRight = '8px';
                        chip.innerHTML = `${cat.label} <span onclick="app.deleteCustomCategory('${cat.id}')" style="margin-left:8px; opacity:0.6; cursor:pointer;">&times;</span>`;
                        catList.appendChild(chip);
                    });
                } else {
                    catList.innerHTML = '<p style="color:var(--text-muted); font-size:0.9rem;">No custom categories yet.</p>';
                }
            }

        } else if (viewName === 'distribute') {
            app.initDistribute();
        }

        // Update Nav
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        // Currently simple matching, in real router would use data-attributes
    },

    back: () => {
        router.navigate('dashboard');
    }
};

// Start
document.addEventListener('DOMContentLoaded', app.init);
