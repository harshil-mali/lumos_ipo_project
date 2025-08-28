document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/ipo_full')
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const tableHead = document.querySelector('#full-ipo-table thead');
                const tableBody = document.getElementById('full-table-body');

                // Headers banayein
                const headers = Object.keys(data[0]);
                const headerRow = '<tr>' + headers.map(key => `<th>${key.toUpperCase().replace(/_/g, ' ')}</th>`).join('') + '</tr>';
                tableHead.innerHTML = headerRow;

                // Body ko saaf karein
                tableBody.innerHTML = ''; 

                // Har row aur cell ko dynamically banayein
                data.forEach(ipo => {
                    const row = document.createElement('tr');
                    headers.forEach(key => {
                        const cell = document.createElement('td');
                        let cellContent = ipo[key];

                        if (key === 'company_name') {
                            const link = document.createElement('a');
                            link.href = `/company/${encodeURIComponent(ipo.company_name)}`;
                            link.textContent = ipo.company_name;
                            cell.appendChild(link);
                        } else {
                            cell.textContent = cellContent;
                        }
                        row.appendChild(cell);
                    });
                    tableBody.appendChild(row);
                    row.classList.add('fade-in');
                });
            }
        })
        .catch(error => console.error('Error fetching full data:', error));
});