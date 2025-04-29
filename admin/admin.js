// Toggle sidebar on mobile
document.addEventListener('DOMContentLoaded', function() {
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.admin-sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
    
    // Apply saved theme
    if (typeof applySavedTheme === 'function') {
        applySavedTheme();
    }
    
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

// Sample data for charts (you would replace this with real data)
const orderData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
        label: 'Orders',
        data: [65, 59, 80, 81, 56, 55],
        backgroundColor: 'rgba(125, 90, 80, 0.2)',
        borderColor: 'rgba(125, 90, 80, 1)',
        borderWidth: 1
    }]
};

const revenueData = {
    labels: ['Coffee', 'Tea', 'Pastries', 'Other'],
    datasets: [{
        data: [300, 50, 100, 30],
        backgroundColor: [
            '#7D5A50',
            '#B4846C',
            '#E5B299',
            '#FCDEC0'
        ]
    }]
};

// Initialize charts (you would need to include Chart.js)
function initCharts() {
    if (typeof Chart !== 'undefined') {
        const orderCtx = document.getElementById('ordersChart');
        const revenueCtx = document.getElementById('revenueChart');
        
        if (orderCtx) {
            new Chart(orderCtx, {
                type: 'line',
                data: orderData,
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
        
        if (revenueCtx) {
            new Chart(revenueCtx, {
                type: 'doughnut',
                data: revenueData,
                options: {
                    responsive: true
                }
            });
        }
    }
}

// Call initCharts when the page loads
window.addEventListener('load', initCharts);