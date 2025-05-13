$(document).ready(function() {
    // Handle orders link click
    $('a[href="#orders"]').on('click', function(e) {
        $('.sidebar-nav li').removeClass('active');
        $(this).parent().addClass('active');
    });
});

function orders() {
    // Update header title
    $('.admin-header h1').text('Orders Management');

    $.post('myphp/orders.php', {
        action: 'getOrders'
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
                throw new Error('No order data received');
            }

            let orders = response.data;
            let content = $('.admin-content');
            
            if (!content.length) {
                throw new Error('Admin content container not found');
            }

            let html = `
            <div class="container">
                <div class="row">
                    <div class="col-md-12">
                        <div class="section-header">
                            <h2>Orders Management</h2>
                            <div class="order-controls">
                                <div class="search-box">
                                    <input type="text" id="order-search" class="form-control" placeholder="Search orders...">
                                </div>
                                <div class="order-filters">
                                    <select id="status-filter" class="form-select">
                                        <option value="all">All Orders</option>
                                        <option value="pending">Pending</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="table-responsive">
                            <table id="orders-table" class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Order Items</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Order Key</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="orders-body">
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>`;

            content.html(html);

            const ordersBody = $('#orders-body');
            orders.forEach(order => {
                const row = $('<tr>').html(`
                    <td>${order.id || 'N/A'}</td>
                    <td>${order.username || 'N/A'}</td>
                    <td>${formatOrderItems(order.cartorder)}</td>
                    <td>$${parseFloat(order.full_price || 0).toFixed(2)}</td>
                    <td><span class="status ${(order.state || '').toLowerCase()}">${order.state || 'Unknown'}</span></td>
                    <td>${formatDate(order.created_at || new Date())}</td>
                    <td><span class="order-key">${order.random_key || 'N/A'}</span></td>
                    <td>
                        <button class="action-btn view" data-id="${order.id || ''}" title="View Order Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" data-id="${order.id || ''}" title="Edit Order">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" data-id="${order.id || ''}" title="Delete Order">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `);
                ordersBody.append(row);
            });

            // Add event listeners
            $('#status-filter').on('change', handleStatusFilter);
            $('#order-search').on('input', handleSearch);
            $('.action-btn.view').on('click', function() {
                handleViewOrder($(this).data('id'));
            });
            $('.action-btn.edit').on('click', function() {
                handleEditOrder($(this).data('id'));
            });
            $('.action-btn.delete').on('click', function() {
                handleDeleteOrder($(this).data('id'));
            });

        } catch (error) {
            console.error('Error:', error);
            // Show error to user
            $('.admin-content').html(`
                <div class="alert alert-danger" role="alert">
                    <i class="fas fa-exclamation-circle"></i> Error loading orders: ${error.message}
                </div>`);
        }
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error('AJAX Error:', textStatus, errorThrown);
        $('.admin-content').html(`
            <div class="alert alert-danger" role="alert">
                <i class="fas fa-exclamation-circle"></i> Error loading orders: ${errorThrown}
            </div>`);
    });
}

// Helper function to format order items
function formatOrderItems(cartOrder) {
    if (!cartOrder) return 'No items';
    const items = cartOrder.split(',');
    return items.length + ' items';
}

// Helper function to format date
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date');
        }
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else if (date.toDateString() === yesterday.toDateString()) {
            return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    } catch (error) {
        console.error('Date formatting error:', error);
        return 'Invalid date';
    }
}

// Event handlers
function handleStatusFilter(e) {
    const status = $(e.target).val();
    $('#orders-body tr').each(function() {
        const row = $(this);
        if (status === 'all' || row.find('.status').hasClass(status)) {
            row.show();
        } else {
            row.hide();
        }
    });
}

function handleSearch() {
    const searchTerm = $('#order-search').val().toLowerCase();
    const status = $('#status-filter').val();
    
    $('#orders-body tr').each(function() {
        const row = $(this);
        let shouldShow = false;
        
        if (searchTerm === '') {
            shouldShow = true;
        } else {
            shouldShow = row.find('td').toArray().some(cell => 
                $(cell).text().toLowerCase().includes(searchTerm)
            );
        }
        
        const statusMatch = status === 'all' || row.find('.status').hasClass(status);
        row.toggle(shouldShow && statusMatch);
    });
}

function handleViewOrder(id) {
    console.log('View order clicked for ID:', id);
    // Implement view order functionality
}

function handleEditOrder(id) {
    console.log('Edit order clicked for ID:', id);
    // Implement edit order functionality
}

function handleDeleteOrder(id) {
    console.log('Delete order clicked for ID:', id);
    // Implement delete order functionality
}



