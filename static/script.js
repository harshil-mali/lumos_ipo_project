
document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/ipo_summary')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('table-body');
            tableBody.innerHTML = '';

            data.forEach(ipo => {
                // Yahan par company name ko hyperlink banaya gaya hai
                const companyNameLink = `<a href="/company/${encodeURIComponent(ipo.company_name)}">${ipo.company_name}</a>`;
                const row = `
                    <tr>
                        <td>${companyNameLink}</td>
                        <td>${ipo.opening_date}</td>
                        <td>${ipo.closing_date}</td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        })
        .catch(error => console.error('Error fetching data:', error));

    const viewMoreBtn = document.getElementById('view-more-btn');
    viewMoreBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '/full_list';
    });

    // Add search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const filter = this.value.toLowerCase();
            const rows = document.querySelectorAll('#ipo-table tbody tr');
            rows.forEach(row => {
                const nameCell = row.querySelector('td');
                if (nameCell && nameCell.textContent.toLowerCase().includes(filter)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
});