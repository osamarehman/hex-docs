// Function to fetch and parse markdown content for weekly progress
async function fetchAndParseWeeklyProgress() {
    try {
        const response = await fetch('https://osamarehman.github.io/Hex-webflow-code/weekly-tasks.md');
        const markdownContent = await response.text();
        
        // Get the weeks container
        const weeksContainer = document.getElementById('weeks-container');
        if (!weeksContainer) {
            console.error('Weeks container not found');
            return;
        }

        // Find all week sections using regex
        const weekSections = markdownContent.match(/### Week \d[\s\S]*?(?=### Week \d|$)/g);
        
        if (!weekSections) {
            console.error('No week sections found in markdown');
            return;
        }

        // Clear existing content
        weeksContainer.innerHTML = '';
        
        // Process each week's content
        weekSections.forEach((section, index) => {
            const weekNumber = index + 1;
            const weekHtml = marked.parse(section);
            
            // Create a tab panel for this week
            const tabPanel = document.createElement('div');
            tabPanel.id = `week${weekNumber}`;
            tabPanel.role = 'tabpanel';
            tabPanel.setAttribute('aria-labelledby', `week${weekNumber}-tab`);
            tabPanel.className = 'tab-content hidden prose max-w-none';
            
            // Create a temporary container to hold the parsed HTML
            tabPanel.innerHTML = weekHtml;
            
            // Process tables in this section
            const tables = tabPanel.getElementsByTagName('table');
            Array.from(tables).forEach(table => {
                table.className = 'min-w-full divide-y divide-gray-200 mt-4';
                
                // Style table header
                const thead = table.getElementsByTagName('thead')[0];
                if (!thead && table.rows.length > 0) {
                    const thead = document.createElement('thead');
                    thead.className = 'bg-gray-50';
                    thead.appendChild(table.rows[0]);
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
    const firstTab = tabs[0];
    
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
    if (firstTab) {
        firstTab.click();
    }
}

// Load markdown content when the page loads
document.addEventListener('DOMContentLoaded', fetchAndParseWeeklyProgress);
