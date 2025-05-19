$(document).ready(function() {
    // Handle analytics link click
    $('a[href="#analytics"]').on('click', function(e) {
        $('.sidebar-nav li').removeClass('active');
        $(this).parent().addClass('active');
    });
});

function analytics() {
    // Update header title
    $('.admin-header h1').text('Analytics Dashboard');

    $.post('myphp/analytics.php', {
        action: 'getAnalytics'
    }, function(response) {
        try {
            console.log('Response:', response); // Debug log

            // Check if response is valid
            if (!response) {
                throw new Error('No response received from server');
            }

            // If response is a string, try to parse it as JSON
            if (typeof response === 'string') {
                try {
                    response = JSON.parse(response);
                } catch (e) {
                    throw new Error('Invalid JSON response from server');
                }
            }

            // Check if response has data
            if (!response.data) {
                throw new Error('No analytics data received');
            }

            let analyticsData = response.data;
            let content = $('.admin-content');
            
            if (!content.length) {
                throw new Error('Admin content container not found');
            }

            let html = `
            <div class="container">
                <div class="row">
                    <div class="col-md-12">
                        <div class="section-header">
                            <h2>Analytics Overview</h2>
                            <div class="analytics-controls">
                                <div class="date-range-picker">
                                    <select id="time-range" class="form-select">
                                        <option value="today">Today</option>
                                        <option value="week">This Week</option>
                                        <option value="month">This Month</option>
                                        <option value="year">This Year</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Analytics Cards -->
                        <div class="analytics-cards">
                            <div class="analytics-card">
                                <h3>Revenue Overview</h3>
                                <div class="chart-container">
                                    <canvas id="revenue-chart"></canvas>
                                </div>
                                <div class="metrics">
                                    <div class="metric">
                                        <span class="label">Total Revenue</span>
                                        <span class="value">$${formatCurrency(analyticsData.totalRevenue || 0)}</span>
                                    </div>
                                    <div class="metric">
                                        <span class="label">Growth</span>
                                        <span class="value ${getGrowthClass(analyticsData.revenueGrowth)}">${formatGrowth(analyticsData.revenueGrowth)}%</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="analytics-card">
                                <h3>Order Statistics</h3>
                                <div class="chart-container">
                                    <canvas id="orders-chart"></canvas>
                                </div>
                                <div class="metrics">
                                    <div class="metric">
                                        <span class="label">Total Orders</span>
                                        <span class="value">${analyticsData.totalOrders || 0}</span>
                                    </div>
                                    <div class="metric">
                                        <span class="label">Average Order Value</span>
                                        <span class="value">$${formatCurrency(analyticsData.averageOrderValue || 0)}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="analytics-card">
                                <h3>Customer Insights</h3>
                                <div class="chart-container">
                                    <canvas id="customers-chart"></canvas>
                                </div>
                                <div class="metrics">
                                    <div class="metric">
                                        <span class="label">New Customers</span>
                                        <span class="value">${analyticsData.newCustomers || 0}</span>
                                    </div>
                                    <div class="metric">
                                        <span class="label">Retention Rate</span>
                                        <span class="value">${analyticsData.retentionRate || 0}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Detailed Analytics Table -->
                        <div class="analytics-table-section">
                            <h3>Detailed Analytics</h3>
                            <div class="table-responsive">
                                <table id="analytics-table" class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Metric</th>
                                            <th>Current</th>
                                            <th>Previous</th>
                                            <th>Change</th>
                                            <th>Trend</th>
                                        </tr>
                                    </thead>
                                    <tbody id="analytics-body">
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;

            content.html(html);

            // Wait for DOM to update before initializing charts
            setTimeout(() => {
                // Initialize charts
                initializeCharts(analyticsData);
                
                // Populate detailed analytics table
                populateAnalyticsTable(analyticsData);

                // Add event listeners
                $('#time-range').on('change', handleTimeRangeChange);
            }, 100);

        } catch (error) {
            console.error('Error:', error);
            $('.admin-content').html(`
                <div class="alert alert-danger" role="alert">
                    <i class="fas fa-exclamation-circle"></i> Error loading analytics: ${error.message}
                </div>`);
        }
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error('AJAX Error:', textStatus, errorThrown);
        $('.admin-content').html(`
            <div class="alert alert-danger" role="alert">
                <i class="fas fa-exclamation-circle"></i> Error loading analytics: ${errorThrown}
            </div>`);
    });
}

// Helper Functions
function formatCurrency(value) {
    return parseFloat(value).toFixed(2);
}

function formatGrowth(value) {
    return parseFloat(value).toFixed(1);
}

function getGrowthClass(value) {
    return value >= 0 ? 'positive' : 'negative';
}

function initializeCharts(data) {
    try {
        // Initialize Revenue Chart
        if (data.revenueData) {
            const revenueCanvas = document.getElementById('revenue-chart');
            if (revenueCanvas) {
                const revenueCtx = revenueCanvas.getContext('2d');
                new Chart(revenueCtx, {
                    type: 'line',
                    data: data.revenueData,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top'
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function(value) {
                                        return '$' + value;
                                    }
                                }
                            }
                        }
                    }
                });
            }
        }

        // Initialize Orders Chart
        if (data.ordersData) {
            const ordersCanvas = document.getElementById('orders-chart');
            if (ordersCanvas) {
                const ordersCtx = ordersCanvas.getContext('2d');
                new Chart(ordersCtx, {
                    type: 'bar',
                    data: data.ordersData,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top'
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    stepSize: 1
                                }
                            }
                        }
                    }
                });
            }
        }

        // Initialize Customers Chart
        if (data.customersData) {
            const customersCanvas = document.getElementById('customers-chart');
            if (customersCanvas) {
                const customersCtx = customersCanvas.getContext('2d');
                new Chart(customersCtx, {
                    type: 'doughnut',
                    data: data.customersData,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'right'
                            }
                        }
                    }
                });
            }
        }
    } catch (error) {
        console.error('Error initializing charts:', error);
    }
}

function populateAnalyticsTable(data) {
    $('#analytics-body').empty(); // Clear existing rows
    const analyticsBody = $('#analytics-body');
    
    // Define metrics with their categories
    const metrics = [
        {
            category: 'Sales Performance',
            items: [
                { name: 'Total Revenue', current: data.totalRevenue, previous: data.previousRevenue, format: 'currency' },
                { name: 'Average Order Value', current: data.averageOrderValue, previous: data.previousAverageOrderValue, format: 'currency' },
                { name: 'Highest Value Order', current: data.highestOrderValue || 0, previous: data.previousHighestOrderValue || 0, format: 'currency' }
            ]
        },
        {
            category: 'Order Metrics',
            items: [
                { name: 'Total Orders', current: data.totalOrders, previous: data.previousOrders, format: 'number' },
                { name: 'Completed Orders', current: data.completedOrders || 0, previous: data.previousCompletedOrders || 0, format: 'number' },
                { name: 'Cancelled Orders', current: data.cancelledOrders || 0, previous: data.previousCancelledOrders || 0, format: 'number' }
            ]
        },
        {
            category: 'Customer Metrics',
            items: [
                { name: 'New Customers', current: data.newCustomers, previous: data.previousNewCustomers, format: 'number' },
                { name: 'Returning Customers', current: data.returningCustomers || 0, previous: data.previousReturningCustomers || 0, format: 'number' },
                { name: 'Customer Retention Rate', current: data.retentionRate, previous: data.previousRetentionRate, format: 'percentage' }
            ]
        },
        {
            category: 'Product Performance',
            items: [
                { name: 'Most Popular Product', current: data.mostPopularProduct || 'N/A', previous: data.previousMostPopularProduct || 'N/A', format: 'text' },
                { name: 'Total Products Sold', current: data.totalProductsSold || 0, previous: data.previousTotalProductsSold || 0, format: 'number' },
                { name: 'Average Products per Order', current: data.avgProductsPerOrder || 0, previous: data.previousAvgProductsPerOrder || 0, format: 'decimal' }
            ]
        }
    ];

    // Create table content
    metrics.forEach(category => {
        // Add category header
        analyticsBody.append(`
            <tr class="category-header">
                <td colspan="5">${category.category}</td>
            </tr>
        `);

        // Add metrics for this category
        category.items.forEach(metric => {
            const change = calculateChange(metric.current, metric.previous);
            const trend = getTrendIcon(change);
            const row = $('<tr>').html(`
                <td>${metric.name}</td>
                <td>${formatMetricValue(metric.format, metric.current)}</td>
                <td>${formatMetricValue(metric.format, metric.previous)}</td>
                <td class="${getChangeClass(change)}">${formatChange(change)}</td>
                <td>${trend}</td>
            `);
            analyticsBody.append(row);
        });
    });
}

function getTrendIcon(change) {
    if (change > 0) {
        return '<i class="fas fa-arrow-up text-success"></i>';
    } else if (change < 0) {
        return '<i class="fas fa-arrow-down text-danger"></i>';
    }
    return '<i class="fas fa-minus text-muted"></i>';
}

function getChangeClass(change) {
    if (change > 0) return 'text-success';
    if (change < 0) return 'text-danger';
    return 'text-muted';
}

function formatMetricValue(format, value) {
    if (value === null || value === undefined) return 'N/A';
    
    switch (format) {
        case 'currency':
            return `$${formatCurrency(value)}`;
        case 'percentage':
            return `${value}%`;
        case 'decimal':
            return value.toFixed(2);
        case 'number':
            return value.toLocaleString();
        case 'text':
            return value;
        default:
            return value;
    }
}

function calculateChange(current, previous) {
    if (previous === 0 || previous === null || previous === undefined) return 0;
    if (typeof current === 'string' || typeof previous === 'string') return 0;
    return ((current - previous) / previous) * 100;
}

function formatChange(change) {
    if (isNaN(change)) return 'N/A';
    const value = Math.abs(change).toFixed(1);
    return `${change >= 0 ? '+' : '-'}${value}%`;
}

function handleTimeRangeChange(e) {
    const timeRange = $(e.target).val();
    // Reload analytics with new time range
    $.post('myphp/analytics.php', {
        action: 'getAnalytics',
        timeRange: timeRange
    }, function(response) {
        // Handle the updated data
        if (response && response.data) {
            initializeCharts(response.data);
            populateAnalyticsTable(response.data);
        }
    });
} 