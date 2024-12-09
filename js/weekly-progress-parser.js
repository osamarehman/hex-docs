// Function to fetch and parse markdown content for weekly progress
async function fetchAndParseWeeklyProgress() {
    try {
        const response = await fetch('../weekly-tasks.md');
        const markdownContent = await response.text();
        
        // Split content into weekly sections
        const sections = markdownContent.split('## Week');
        
        // Get the weeks container
        const weeksContainer = document.getElementById('weeks-container');
        if (!weeksContainer) return;
        
        // Process each week's content
        sections.slice(1).forEach((section, index) => {
            const weekNumber = index + 1;
            const weekContent = '## Week' + section;
            const weekHtml = marked.parse(weekContent);
            
            // Create a tab panel for this week
            const tabPanel = document.createElement('div');
            tabPanel.id = `week${weekNumber}`;
            tabPanel.role = 'tabpanel';
            tabPanel.setAttribute('aria-labelledby', `week${weekNumber}-tab`);
            tabPanel.className = 'tab-content hidden';
            if (weekNumber === 1) {
                tabPanel.classList.remove('hidden');
            }
            
            // Create a temporary container to hold the parsed HTML
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = weekHtml;
            
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
                });
            });
            
            tabPanel.appendChild(tempContainer);
            weeksContainer.appendChild(tabPanel);
        });
        
        // Initialize tab functionality
        initializeTabs();
    } catch (error) {
        console.error('Error loading markdown:', error);
    }
}

// Function to initialize tabs
function initializeTabs() {
    const tabs = document.querySelectorAll('[role="tab"]');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Hide all tab panels
            document.querySelectorAll('[role="tabpanel"]').forEach(panel => {
                panel.classList.add('hidden');
            });
            
            // Show the selected tab panel
            const panelId = tab.getAttribute('aria-controls');
            const panel = document.getElementById(panelId);
            if (panel) {
                panel.classList.remove('hidden');
            }
            
            // Update tab states
            tabs.forEach(t => {
                t.setAttribute('aria-selected', 'false');
                t.classList.remove('text-blue-600', 'border-blue-600');
                t.classList.add('text-gray-500', 'border-transparent');
            });
            
            tab.setAttribute('aria-selected', 'true');
            tab.classList.remove('text-gray-500', 'border-transparent');
            tab.classList.add('text-blue-600', 'border-blue-600');
        });
    });
    
    // Activate the first tab by default
    const firstTab = tabs[0];
    if (firstTab) {
        firstTab.click();
    }
}

// Load markdown content when the page loads
document.addEventListener('DOMContentLoaded', fetchAndParseWeeklyProgress);
