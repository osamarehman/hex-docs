// Function to fetch and parse markdown content
async function fetchAndParseMarkdown() {
    try {
        const response = await fetch('weekly-tasks.md');
        const markdownContent = await response.text();
        
        // Split content into progress summary and weekly tasks
        const sections = markdownContent.split('## Week');
        const progressSummary = sections[0];
        const weeklyContent = '## Week' + sections.slice(1).join('## Week');
        
        // Parse and update progress summary
        const progressHtml = marked.parse(progressSummary);
        document.getElementById('progress-summary').innerHTML = progressHtml;
        
        // Parse and update weekly content
        const weeklyHtml = marked.parse(weeklyContent);
        
        // Get the weeks container
        const weeksContainer = document.getElementById('weeks-container');
        
        // Create a temporary container to hold the parsed HTML
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = weeklyHtml;
        
        // Process tables and apply Tailwind classes
        const tables = tempContainer.getElementsByTagName('table');
        Array.from(tables).forEach(table => {
            table.className = 'min-w-full divide-y divide-gray-200';
            
            // Style table header
            const thead = table.getElementsByTagName('thead')[0];
            if (!thead) {
                const firstRow = table.rows[0];
                const thead = document.createElement('thead');
                thead.className = 'bg-gray-50';
                thead.appendChild(firstRow);
                table.insertBefore(thead, table.firstChild);
            }
            
            // Style table body
            const tbody = table.getElementsByTagName('tbody')[0] || document.createElement('tbody');
            tbody.className = 'bg-white divide-y divide-gray-200';
            
            // Style cells
            Array.from(table.getElementsByTagName('th')).forEach(th => {
                th.className = 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
            });
            
            Array.from(table.getElementsByTagName('td')).forEach(td => {
                td.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';
                
                // Add special styling for status and priority
                if (td.textContent.includes('High') || td.textContent.includes('Medium') || td.textContent.includes('Low')) {
                    const priority = td.textContent.trim();
                    td.innerHTML = `<span class="priority-${priority.toLowerCase()}">${priority}</span>`;
                }
                
                if (td.textContent.includes('Completed') || td.textContent.includes('In Progress') || td.textContent.includes('Not Started')) {
                    const status = td.textContent.trim();
                    td.innerHTML = `<span class="status-${status.toLowerCase().replace(' ', '-')}">${status}</span>`;
                }
            });
        });
        
        // Update the weekly content
        weeksContainer.innerHTML = tempContainer.innerHTML;
        
        // Initialize tabs if needed
        initializeTabs();
        
    } catch (error) {
        console.error('Error loading markdown:', error);
    }
}

// Function to initialize tabs
function initializeTabs() {
    const tabButtons = document.querySelectorAll('[role="tab"]');
    const tabPanels = document.querySelectorAll('[role="tabpanel"]');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Deactivate all tabs
            tabButtons.forEach(btn => {
                btn.setAttribute('aria-selected', 'false');
                btn.classList.remove('bg-indigo-50', 'text-indigo-700');
                btn.classList.add('text-gray-500', 'hover:text-gray-700');
            });
            
            // Hide all panels
            tabPanels.forEach(panel => {
                panel.classList.add('hidden');
            });
            
            // Activate clicked tab
            button.setAttribute('aria-selected', 'true');
            button.classList.remove('text-gray-500', 'hover:text-gray-700');
            button.classList.add('bg-indigo-50', 'text-indigo-700');
            
            // Show corresponding panel
            const panelId = button.getAttribute('aria-controls');
            document.getElementById(panelId).classList.remove('hidden');
        });
    });
}

// Load markdown content when the page loads
document.addEventListener('DOMContentLoaded', fetchAndParseMarkdown);

// Refresh content periodically (every 5 minutes)
setInterval(fetchAndParseMarkdown, 5 * 60 * 1000);
