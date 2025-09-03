// Enhanced Full IPO List JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all features
    initializeNavbar();
    initializeSearch();
    initializeAdvancedFilters();
    initializeIPOData();
    initializePagination();
    initializeExport();
    initializeAnimations();
    initializeBackToTop();
    initializeSmoothScrolling();
    initializeTableInteractions();
});

// Global variables
let allIPOData = [];
let filteredData = [];
let currentPage = 1;
const itemsPerPage = 10;

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

// Initialize smooth scrolling for anchor links
function initializeSmoothScrolling() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Enhanced Search with real-time filtering
function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        let searchTimeout;
        
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const filter = this.value.toLowerCase();
            
            searchTimeout = setTimeout(() => {
                applySearchFilter(filter);
            }, 300);
        });
    }
}

// Apply search filter
function applySearchFilter(searchTerm) {
    if (!searchTerm) {
        filteredData = [...allIPOData];
    } else {
        filteredData = allIPOData.filter(ipo => 
            ipo.company_name.toLowerCase().includes(searchTerm) ||
            (ipo.issue_price && ipo.issue_price.toString().includes(searchTerm)) ||
            (ipo.issue_amount && ipo.issue_amount.toString().includes(searchTerm))
        );
    }
    
    currentPage = 1;
    updateTable();
    updatePagination();
    updateStats();
}

// Initialize advanced filters
function initializeAdvancedFilters() {
    const applyBtn = document.getElementById('apply-filters');
    const clearBtn = document.getElementById('clear-filters');
    
    if (applyBtn) {
        applyBtn.addEventListener('click', applyAdvancedFilters);
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', clearAdvancedFilters);
    }
}

// Apply advanced filters
function applyAdvancedFilters() {
    const statusFilter = document.getElementById('status-filter').value;
    const dateFilter = document.getElementById('date-filter').value;
    const priceFilter = document.getElementById('price-filter').value;
    const sizeFilter = document.getElementById('size-filter').value;
    
    filteredData = allIPOData.filter(ipo => {
        // Status filter
        if (statusFilter !== 'all') {
            const status = getIPOStatus(ipo.opening_date, ipo.closing_date);
            if (status.class !== statusFilter) return false;
        }
        
        // Date filter
        if (dateFilter !== 'all') {
            if (!applyDateFilter(ipo, dateFilter)) return false;
        }
        
        // Price filter
        if (priceFilter !== 'all') {
            if (!applyPriceFilter(ipo, priceFilter)) return false;
        }
        
        // Size filter
        if (sizeFilter !== 'all') {
            if (!applySizeFilter(ipo, sizeFilter)) return false;
        }
        
        return true;
    });
    
    currentPage = 1;
    updateTable();
    updatePagination();
    updateStats();
}

// Apply date filter
function applyDateFilter(ipo, filterType) {
    const now = new Date();
    const openingDate = new Date(ipo.opening_date);
    
    switch (filterType) {
        case 'this-week':
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            return openingDate >= weekStart && openingDate <= weekEnd;
            
        case 'this-month':
            return openingDate.getMonth() === now.getMonth() && 
                   openingDate.getFullYear() === now.getFullYear();
            
        case 'next-month':
            const nextMonth = new Date(now);
            nextMonth.setMonth(now.getMonth() + 1);
            return openingDate.getMonth() === nextMonth.getMonth() && 
                   openingDate.getFullYear() === nextMonth.getFullYear();
            
        default:
            return true;
    }
}

// Apply price filter
function applyPriceFilter(ipo, filterType) {
    const price = parseFloat(ipo.issue_price) || 0;
    
    switch (filterType) {
        case 'low':
            return price < 100;
        case 'medium':
            return price >= 100 && price <= 500;
        case 'high':
            return price > 500;
        default:
            return true;
    }
}

// Apply size filter
function applySizeFilter(ipo, filterType) {
    const size = parseFloat(ipo.issue_amount) || 0;
    
    switch (filterType) {
        case 'small':
            return size < 100;
        case 'medium':
            return size >= 100 && size <= 500;
        case 'large':
            return size > 500;
        default:
            return true;
    }
}

// Clear advanced filters
function clearAdvancedFilters() {
    document.getElementById('status-filter').value = 'all';
    document.getElementById('date-filter').value = 'all';
    document.getElementById('price-filter').value = 'all';
    document.getElementById('size-filter').value = 'all';
    
    filteredData = [...allIPOData];
    currentPage = 1;
    updateTable();
    updatePagination();
    updateStats();
}

// Initialize IPO data
function initializeIPOData() {
    showLoadingOverlay();
    
    fetch('/api/ipo_full')
        .then(response => response.json())
        .then(data => {
            allIPOData = data;
            filteredData = [...data];
            updateTable();
            updatePagination();
            updateStats();
            hideLoadingOverlay();
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            showErrorMessage('Failed to load IPO data. Please try again later.');
            hideLoadingOverlay();
        });
}

// Update table with current data
function updateTable() {
    const tableBody = document.getElementById('table-body');
    if (!tableBody) return;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = filteredData.slice(startIndex, endIndex);
    
                tableBody.innerHTML = ''; 

    pageData.forEach((ipo, index) => {
        const status = getIPOStatus(ipo.opening_date, ipo.closing_date);
        const row = createTableRow(ipo, status, startIndex + index);
        tableBody.appendChild(row);
    });
    
    updatePaginationInfo();
}

// Create table row
function createTableRow(ipo, status, index) {
                    const row = document.createElement('tr');
    row.className = 'ipo-row';
    row.dataset.index = index;
    
    row.innerHTML = `
        <td>
            <a href="/company/${encodeURIComponent(ipo.company_name)}" class="company-link">
                ${ipo.company_name}
            </a>
        </td>
        <td>
            <div class="date-cell">
                <span class="date">${formatDate(ipo.opening_date)}</span>
            </div>
        </td>
        <td>
            <div class="date-cell">
                <span class="date">${formatDate(ipo.closing_date)}</span>
            </div>
        </td>
        <td>₹${ipo.issue_price || 'N/A'}</td>
        <td>₹${formatAmount(ipo.issue_amount)}</td>
        <td>
            <span class="status-badge ${status.class}">${status.text}</span>
        </td>
        <td>
            <div class="action-buttons">
                <a href="/company/${encodeURIComponent(ipo.company_name)}" class="action-btn view-btn" title="View Details">
                    <i class="fas fa-eye"></i>
                </a>
                <button class="action-btn bookmark-btn" title="Bookmark" data-company="${ipo.company_name}">
                    <i class="fas fa-bookmark"></i>
                </button>
                <button class="action-btn share-btn" title="Share" data-company="${ipo.company_name}">
                    <i class="fas fa-share-alt"></i>
                </button>
            </div>
        </td>
    `;
    
    return row;
}

// Get IPO status
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

// Format date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

// Format amount
function formatAmount(amount) {
    if (!amount) return 'N/A';
    const num = parseFloat(amount);
    if (num >= 10000000) {
        return (num / 10000000).toFixed(2) + ' Cr';
    } else if (num >= 100000) {
        return (num / 100000).toFixed(2) + ' L';
    } else {
        return num.toLocaleString();
    }
}

// Initialize pagination
function initializePagination() {
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                updateTable();
                updatePagination();
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const maxPage = Math.ceil(filteredData.length / itemsPerPage);
            if (currentPage < maxPage) {
                currentPage++;
                updateTable();
                updatePagination();
            }
        });
    }
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const pageNumbers = document.getElementById('page-numbers');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    
    if (pageNumbers) {
        pageNumbers.innerHTML = '';
        
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => {
                currentPage = i;
                updateTable();
                updatePagination();
            });
            pageNumbers.appendChild(pageBtn);
        }
    }
    
    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentPage === totalPages;
    }
}

// Update pagination info
function updatePaginationInfo() {
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, filteredData.length);
    const total = filteredData.length;
    
    document.getElementById('showing-start').textContent = start;
    document.getElementById('showing-end').textContent = end;
    document.getElementById('total-count').textContent = total;
}

// Update stats
function updateStats() {
    const total = filteredData.length;
    const active = filteredData.filter(ipo => {
        const status = getIPOStatus(ipo.opening_date, ipo.closing_date);
        return status.class === 'success';
    }).length;
    
    const upcoming = filteredData.filter(ipo => {
        const status = getIPOStatus(ipo.opening_date, ipo.closing_date);
        return status.class === 'warning';
    }).length;
    
    const closed = filteredData.filter(ipo => {
        const status = getIPOStatus(ipo.opening_date, ipo.closing_date);
        return status.class === 'danger';
    }).length;
    
    document.getElementById('total-ipos').textContent = total;
    document.getElementById('active-ipos').textContent = active;
    document.getElementById('upcoming-ipos').textContent = upcoming;
    document.getElementById('closed-ipos').textContent = closed;
}

// Initialize export functionality
function initializeExport() {
    const exportBtns = document.querySelectorAll('.export-btn');
    exportBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const format = btn.dataset.format;
            exportData(format);
        });
    });
}

// Export data
function exportData(format) {
    const data = filteredData.map(ipo => ({
        Company: ipo.company_name,
        'Opening Date': ipo.opening_date,
        'Closing Date': ipo.closing_date,
        'Issue Price': ipo.issue_price,
        'Issue Amount': ipo.issue_amount,
        'Listing Date': ipo.listing_date,
        'Lead Manager': ipo.lead_manager
    }));
    
    switch (format) {
        case 'csv':
            exportToCSV(data);
            break;
        case 'excel':
            exportToExcel(data);
            break;
        case 'pdf':
            exportToPDF(data);
            break;
        case 'json':
            exportToJSON(data);
            break;
    }
}

// Export to CSV
function exportToCSV(data) {
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');
    
    downloadFile(csvContent, 'ipo_data.csv', 'text/csv');
}

// Export to Excel (CSV format for simplicity)
function exportToExcel(data) {
    exportToCSV(data); // For now, export as CSV
}

// Export to PDF
function exportToPDF(data) {
    // This would require a PDF library like jsPDF
    alert('PDF export feature coming soon!');
}

// Export to JSON
function exportToJSON(data) {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, 'ipo_data.json', 'application/json');
}

// Download file
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Initialize table interactions
function initializeTableInteractions() {
    document.addEventListener('click', (e) => {
        if (e.target.closest('.bookmark-btn')) {
            const btn = e.target.closest('.bookmark-btn');
            const company = btn.dataset.company;
            toggleBookmark(btn, company);
        }
        
        if (e.target.closest('.share-btn')) {
            const btn = e.target.closest('.share-btn');
            const company = btn.dataset.company;
            shareIPO(company);
        }
    });
}

// Toggle bookmark
function toggleBookmark(btn, company) {
    const icon = btn.querySelector('i');
    const isBookmarked = icon.classList.contains('fas');
    
    if (isBookmarked) {
        icon.classList.remove('fas');
        icon.classList.add('far');
        btn.style.color = 'var(--text-secondary)';
        removeBookmark(company);
    } else {
        icon.classList.remove('far');
        icon.classList.add('fas');
        btn.style.color = 'var(--warning-color)';
        addBookmark(company);
    }
}

// Add bookmark
function addBookmark(company) {
    let bookmarks = JSON.parse(localStorage.getItem('ipo_bookmarks') || '[]');
    if (!bookmarks.includes(company)) {
        bookmarks.push(company);
        localStorage.setItem('ipo_bookmarks', JSON.stringify(bookmarks));
        showNotification(`Added ${company} to bookmarks`, 'success');
    }
}

// Remove bookmark
function removeBookmark(company) {
    let bookmarks = JSON.parse(localStorage.getItem('ipo_bookmarks') || '[]');
    bookmarks = bookmarks.filter(b => b !== company);
    localStorage.setItem('ipo_bookmarks', JSON.stringify(bookmarks));
    showNotification(`Removed ${company} from bookmarks`, 'info');
}

// Share IPO
function shareIPO(company) {
    if (navigator.share) {
        navigator.share({
            title: `${company} IPO`,
            text: `Check out ${company} IPO details on IPO Dashboard`,
            url: `${window.location.origin}/company/${encodeURIComponent(company)}`
        });
                        } else {
        // Fallback: copy to clipboard
        const url = `${window.location.origin}/company/${encodeURIComponent(company)}`;
        navigator.clipboard.writeText(url).then(() => {
            showNotification('Link copied to clipboard!', 'success');
        });
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Initialize animations
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

// Add CSS styles
const style = document.createElement('style');
style.textContent = `
    .advanced-filters {
        background: var(--bg-primary);
        border-radius: 20px;
        padding: 2rem;
        margin: 2rem 0;
        box-shadow: var(--shadow-lg);
        border: 1px solid var(--border-color);
    }
    
    .filter-section h3 {
        font-family: 'Poppins', sans-serif;
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .filter-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
    }
    
    .filter-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: var(--text-primary);
    }
    
    .filter-group select {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid var(--border-color);
        border-radius: 8px;
        background: var(--bg-primary);
        color: var(--text-primary);
        font-size: 0.9rem;
        transition: all 0.3s ease;
    }
    
    .filter-group select:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
    
    .filter-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
    }
    
    .table-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
        margin: 2rem 0;
    }
    
    .stat-item {
        text-align: center;
        padding: 1.5rem;
        background: var(--bg-primary);
        border-radius: 12px;
        border: 1px solid var(--border-color);
        transition: all 0.3s ease;
    }
    
    .stat-item:hover {
        transform: translateY(-5px);
        box-shadow: var(--shadow-lg);
    }
    
    .stat-item i {
        font-size: 2rem;
        color: var(--primary-color);
        margin-bottom: 0.5rem;
    }
    
    .stat-item span {
        display: block;
        font-family: 'Poppins', sans-serif;
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 0.25rem;
    }
    
    .stat-item label {
        font-size: 0.9rem;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .action-buttons {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
    }
    
    .action-btn {
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 6px;
        background: var(--bg-tertiary);
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
    }
    
    .action-btn:hover {
        background: var(--primary-color);
        color: white;
        transform: scale(1.1);
    }
    
    .view-btn:hover {
        background: var(--success-color);
    }
    
    .bookmark-btn:hover {
        background: var(--warning-color);
    }
    
    .share-btn:hover {
        background: var(--accent-color);
    }
    
    .pagination-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 2rem 0;
        flex-wrap: wrap;
        gap: 1rem;
    }
    
    .pagination-info {
        color: var(--text-secondary);
        font-size: 0.9rem;
    }
    
    .pagination-controls {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .pagination-btn {
        padding: 0.5rem 1rem;
        border: 2px solid var(--border-color);
        background: var(--bg-primary);
        color: var(--text-secondary);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .pagination-btn:hover:not(:disabled) {
        border-color: var(--primary-color);
        color: var(--primary-color);
    }
    
    .pagination-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    .page-numbers {
        display: flex;
        gap: 0.25rem;
    }
    
    .page-btn {
        width: 36px;
        height: 36px;
        border: 2px solid var(--border-color);
        background: var(--bg-primary);
        color: var(--text-secondary);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 500;
    }
    
    .page-btn:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
    }
    
    .page-btn.active {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
    }
    
    .export-section {
        background: var(--bg-primary);
        border-radius: 20px;
        padding: 2rem;
        margin: 3rem 0;
        box-shadow: var(--shadow-lg);
        border: 1px solid var(--border-color);
    }
    
    .export-options {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
        margin-top: 2rem;
    }
    
    .export-btn {
        padding: 1rem 1.5rem;
        border: 2px solid var(--border-color);
        background: var(--bg-primary);
        color: var(--text-secondary);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .export-btn:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
    }
    
    .notification {
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 1rem 1.5rem;
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    .notification-success {
        border-left: 4px solid var(--success-color);
    }
    
    .notification-warning {
        border-left: 4px solid var(--warning-color);
    }
    
    .notification-info {
        border-left: 4px solid var(--primary-color);
    }
    
    .nav-links a.active {
        color: var(--primary-color);
        background: var(--bg-tertiary);
    }
    
    @media (max-width: 768px) {
        .filter-grid {
            grid-template-columns: 1fr;
        }
        
        .filter-actions {
            flex-direction: column;
        }
        
        .pagination-container {
            flex-direction: column;
            text-align: center;
        }
        
        .export-options {
            flex-direction: column;
            align-items: center;
        }
        
        .action-buttons {
            flex-direction: column;
        }
    }
`;
document.head.appendChild(style);