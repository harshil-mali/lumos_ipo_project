// Enhanced IPO Dashboard JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all features
    initializeNavbar();
    initializeSearch();
    initializeIPOData();
    initializeAnimations();
    initializeTooltips();
    initializeCharts();
    initializeFilters();
    initializeNotifications();
    initializeStats();
    initializeBackToTop();
    initializeSmoothScrolling();
});

// Enhanced Navbar with scroll effect
function initializeNavbar() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
}

// Initialize stats animation
function initializeStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const finalValue = parseInt(target.dataset.target);
                animateNumber(target, 0, finalValue, 2000);
                observer.unobserve(target);
            }
        });
    }, observerOptions);
    
    statNumbers.forEach(stat => observer.observe(stat));
}

// Animate number counting
function animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    const difference = end - start;
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.floor(start + (difference * progress));
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// Initialize back to top button
function initializeBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });
        
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Initialize smooth scrolling for anchor links
function initializeSmoothScrolling() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Enhanced Search with real-time filtering and suggestions
function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        let searchTimeout;
        
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const filter = this.value.toLowerCase();
            
            // Add loading state
            this.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%236b7280\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z\'/%3E%3C/svg%3E")';
            this.style.backgroundRepeat = 'no-repeat';
            this.style.backgroundPosition = 'left 1rem center';
            this.style.paddingLeft = '3rem';
            
            searchTimeout = setTimeout(() => {
                filterTableRows(filter);
                this.style.backgroundImage = 'none';
                this.style.paddingLeft = '1.5rem';
            }, 300);
        });
        
        // Add search suggestions
        searchInput.addEventListener('focus', function() {
            showSearchSuggestions();
        });
        
        searchInput.addEventListener('blur', function() {
            setTimeout(() => hideSearchSuggestions(), 200);
        });
    }
}

// Enhanced table filtering with smooth animations
function filterTableRows(filter) {
    const rows = document.querySelectorAll('#ipo-table tbody tr');
    let visibleCount = 0;
    
    rows.forEach((row, index) => {
        const nameCell = row.querySelector('td');
        if (nameCell && nameCell.textContent.toLowerCase().includes(filter)) {
            row.style.display = '';
            row.style.animation = `fadeInRow 0.3s ease ${index * 0.05}s both`;
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    // Show no results message if needed
    showNoResultsMessage(visibleCount === 0);
}

// Show no results message
function showNoResultsMessage(show) {
    let noResults = document.getElementById('no-results');
    if (show && !noResults) {
        noResults = document.createElement('tr');
        noResults.id = 'no-results';
        noResults.innerHTML = `
            <td colspan="3" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                <div style="font-size: 1.2rem; margin-bottom: 0.5rem;">🔍</div>
                <div>No IPOs found matching your search</div>
                <div style="font-size: 0.9rem; margin-top: 0.5rem;">Try adjusting your search terms</div>
            </td>
        `;
        document.getElementById('table-body').appendChild(noResults);
    } else if (!show && noResults) {
        noResults.remove();
    }
}

// Initialize IPO data with enhanced features
function initializeIPOData() {
    // Show loading overlay
    showLoadingOverlay();
    
    fetch('/api/ipo_summary')
        .then(response => response.json())
        .then(data => {
            populateTable(data);
            initializeSorting();
            addRowInteractions();
            hideLoadingOverlay();
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            showErrorMessage('Failed to load IPO data. Please try again later.');
            hideLoadingOverlay();
        });
}

// Show loading overlay
function showLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.add('show');
    }
}

// Hide loading overlay
function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.remove('show');
    }
}

// Enhanced table population with status indicators
function populateTable(data) {
            const tableBody = document.getElementById('table-body');
    if (!tableBody) return;
    
            tableBody.innerHTML = '';

    data.forEach((ipo, index) => {
        const status = getIPOStatus(ipo.opening_date, ipo.closing_date);
        const companyNameLink = `<a href="/company/${encodeURIComponent(ipo.company_name)}" class="company-link">${ipo.company_name}</a>`;
        
                const row = `
            <tr class="ipo-row" data-index="${index}">
                        <td>${companyNameLink}</td>
                <td>
                    <div class="date-cell">
                        <span class="date">${formatDate(ipo.opening_date)}</span>
                        <span class="status-badge ${status.class}">${status.text}</span>
                    </div>
                </td>
                <td>${formatDate(ipo.closing_date)}</td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
}

// Get IPO status based on dates
function getIPOStatus(openingDate, closingDate) {
    const now = new Date();
    const opening = new Date(openingDate);
    const closing = new Date(closingDate);
    
    if (now < opening) {
        return { text: 'UPCOMING', class: 'warning' };
    } else if (now >= opening && now <= closing) {
        return { text: 'ACTIVE', class: 'success' };
    } else {
        return { text: 'CLOSED', class: 'danger' };
    }
}

// Format date for better display
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

// Initialize table sorting
function initializeSorting() {
    const headers = document.querySelectorAll('#ipo-table th');
    headers.forEach((header, index) => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', () => sortTable(index));
        
        // Add sort indicators
        header.innerHTML += ' <span class="sort-indicator">↕</span>';
    });
}

// Sort table by column
function sortTable(columnIndex) {
    const table = document.getElementById('ipo-table');
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    const isAscending = table.dataset.sortDirection !== 'asc';
    
    rows.sort((a, b) => {
        const aValue = a.cells[columnIndex].textContent;
        const bValue = b.cells[columnIndex].textContent;
        
        if (columnIndex === 0) { // Company name
            return isAscending ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        } else { // Dates
            const aDate = new Date(aValue);
            const bDate = new Date(bValue);
            return isAscending ? aDate - bDate : bDate - aDate;
        }
    });
    
    // Update sort direction
    table.dataset.sortDirection = isAscending ? 'asc' : 'desc';
    
    // Reorder rows with animation
    rows.forEach((row, index) => {
        row.style.animation = `fadeInRow 0.3s ease ${index * 0.05}s both`;
        tbody.appendChild(row);
    });
    
    // Update sort indicators
    updateSortIndicators(columnIndex, isAscending);
}

// Update sort indicators
function updateSortIndicators(activeColumn, isAscending) {
    const headers = document.querySelectorAll('#ipo-table th');
    headers.forEach((header, index) => {
        const indicator = header.querySelector('.sort-indicator');
        if (index === activeColumn) {
            indicator.textContent = isAscending ? '↑' : '↓';
            indicator.style.color = 'var(--primary-color)';
        } else {
            indicator.textContent = '↕';
            indicator.style.color = 'var(--text-light)';
        }
    });
}

// Add row interactions
function addRowInteractions() {
    const rows = document.querySelectorAll('.ipo-row');
    rows.forEach(row => {
        row.addEventListener('mouseenter', () => {
            row.style.transform = 'scale(1.02)';
        });
        
        row.addEventListener('mouseleave', () => {
            row.style.transform = 'scale(1)';
        });
        
        row.addEventListener('click', (e) => {
            if (!e.target.closest('a')) {
                const companyLink = row.querySelector('a');
                if (companyLink) {
                    window.location.href = companyLink.href;
                }
            }
        });
    });
}

// Initialize smooth animations
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.fade-in').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

// Initialize tooltips
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

// Show tooltip
function showTooltip(event) {
    const tooltip = event.target.getAttribute('data-tooltip');
    const tooltipEl = document.createElement('div');
    tooltipEl.className = 'custom-tooltip';
    tooltipEl.textContent = tooltip;
    tooltipEl.style.cssText = `
        position: absolute;
        background: var(--text-primary);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        font-size: 0.875rem;
        z-index: 1000;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(tooltipEl);
    
    const rect = event.target.getBoundingClientRect();
    tooltipEl.style.left = rect.left + (rect.width / 2) - (tooltipEl.offsetWidth / 2) + 'px';
    tooltipEl.style.top = rect.top - tooltipEl.offsetHeight - 10 + 'px';
    
    setTimeout(() => tooltipEl.style.opacity = '1', 10);
    
    event.target._tooltip = tooltipEl;
}

// Hide tooltip
function hideTooltip(event) {
    if (event.target._tooltip) {
        event.target._tooltip.remove();
        event.target._tooltip = null;
    }
}

// Initialize charts (placeholder for future chart implementations)
function initializeCharts() {
    // This function can be expanded to include Chart.js or other chart libraries
    console.log('Charts initialized - ready for chart implementations');
}

// Initialize filters
function initializeFilters() {
    // Add filter buttons for different IPO statuses
    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-container';
    filterContainer.innerHTML = `
        <div class="filter-buttons">
            <button class="filter-btn active" data-filter="all">All IPOs</button>
            <button class="filter-btn" data-filter="upcoming">Upcoming</button>
            <button class="filter-btn" data-filter="active">Active</button>
            <button class="filter-btn" data-filter="closed">Closed</button>
        </div>
    `;
    
    const searchBar = document.querySelector('.search-section');
    if (searchBar && searchBar.parentNode) {
        searchBar.parentNode.insertBefore(filterContainer, searchBar.nextSibling);
    }
    
    // Add filter functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterByStatus(btn.dataset.filter);
        });
    });
}

// Filter by IPO status
function filterByStatus(status) {
    const rows = document.querySelectorAll('.ipo-row');
            rows.forEach(row => {
        const statusBadge = row.querySelector('.status-badge');
        if (status === 'all' || statusBadge.classList.contains(status)) {
                    row.style.display = '';
            row.style.animation = 'fadeInRow 0.3s ease both';
                } else {
                    row.style.display = 'none';
                }
            });
}

// Initialize notifications
function initializeNotifications() {
    // Check for new IPOs and show notifications
    setInterval(checkForNewIPOs, 300000); // Check every 5 minutes
}

// Check for new IPOs
function checkForNewIPOs() {
    // This function can be expanded to check for new IPOs and show notifications
    console.log('Checking for new IPOs...');
}

// Show error message
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <div style="background: var(--danger-color); color: white; padding: 1rem; border-radius: 8px; margin: 1rem 0; text-align: center;">
            <strong>Error:</strong> ${message}
        </div>
    `;
    
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(errorDiv, container.firstChild);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// Show search suggestions
function showSearchSuggestions() {
    // This function can be expanded to show search suggestions
    console.log('Showing search suggestions...');
}

// Hide search suggestions
function hideSearchSuggestions() {
    // This function can be expanded to hide search suggestions
    console.log('Hiding search suggestions...');
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInRow {
        from {
            opacity: 0;
            transform: translateX(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .filter-container {
        margin: 1rem 0;
        text-align: center;
    }
    
    .filter-buttons {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
        flex-wrap: wrap;
    }
    
    .filter-btn {
        padding: 0.5rem 1rem;
        border: 2px solid var(--border-color);
        background: var(--bg-primary);
        color: var(--text-secondary);
        border-radius: 25px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 500;
    }
    
    .filter-btn:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
    }
    
    .filter-btn.active {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
    }
    
    .date-cell {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }
    
    .company-link {
        color: var(--primary-color);
        text-decoration: none;
        font-weight: 500;
        transition: all 0.3s ease;
    }
    
    .company-link:hover {
        color: var(--primary-dark);
        text-decoration: underline;
    }
    
    .sort-indicator {
        font-size: 0.8rem;
        margin-left: 0.5rem;
        opacity: 0.7;
    }
    
    .custom-tooltip {
        box-shadow: var(--shadow-lg);
    }
    
    .error-message {
        animation: slideInDown 0.3s ease;
    }
    
    @keyframes slideInDown {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);