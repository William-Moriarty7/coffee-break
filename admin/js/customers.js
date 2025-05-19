$(document).ready(function() {
    // Handle customers link click
    $('a[href="#customers"]').on('click', function(e) {
        $('.sidebar-nav li').removeClass('active');
        $(this).parent().addClass('active');
    });
});

function customers() {
    // Update header title
    $('.admin-header h1').text('Customers Management');

    $.post('myphp/customers.php', {
        action: 'getCustomers'
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
                throw new Error('No customer data received');
            }

            let customers = response.data;
            let content = $('.admin-content');
            
            if (!content.length) {
                throw new Error('Admin content container not found');
            }

            let html = `
            <div class="container">
                <div class="row">
                    <div class="col-md-12">
                        <div class="section-header">
                            <h2>Customers Management</h2>
                            <div class="customer-controls">
                                <div class="search-box">
                                    <input type="text" id="customer-search" class="form-control" placeholder="Search customers...">
                                </div>
                                
                            </div>
                        </div>
                        <div class="table-responsive">
                            <table id="customers-table" class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>Total Spent</th>
                                        <th>Status</th>
                                        <th>Order Key</th>
                                        <th>Joined Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="customers-body">
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>`;

            content.html(html);

            const customersBody = $('#customers-body');
            customers.forEach(customer => {
                const row = $('<tr>').html(`
                    <td>${customer.username || 'N/A'}</td>
                    <td>$${parseFloat(customer.full_price || 0).toFixed(2)}</td>
                    <td><span class="status ${(customer.state || '').toLowerCase()}">${customer.state || 'Unknown'}</span></td>
                    <td><span class="order-key">${customer.random_key || 'N/A'}</span></td>
                    <td>${formatDate(customer.created_at || new Date())}</td>
                    <td>
                        <button class="action-btn delete" data-id="${customer.username || ''}" title="Delete Customer" onclick="delete_item('customer','${customer.random_key}','customers')")">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `);
                customersBody.append(row);
            });

            // Add event listeners
            $('#status-filter').on('change', handleStatusFilter);
            $('#customer-search').on('input', handleSearch);
            $('.action-btn.view').on('click', function() {
                handleViewCustomer($(this).data('id'));
            });
            $('.action-btn.edit').on('click', function() {
                handleEditCustomer($(this).data('id'));
            });
            $('.action-btn.delete').on('click', function() {
                handleDeleteCustomer($(this).data('id'));
            });

        } catch (error) {
            console.error('Error:', error);
            // Show error to user
            $('.admin-content').html(`
                <div class="alert alert-danger" role="alert">
                    <i class="fas fa-exclamation-circle"></i> Error loading customers: ${error.message}
                </div>`);
        }
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error('AJAX Error:', textStatus, errorThrown);
        $('.admin-content').html(`
            <div class="alert alert-danger" role="alert">
                <i class="fas fa-exclamation-circle"></i> Error loading customers: ${errorThrown}
            </div>`);
    });
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
    $('#customers-body tr').each(function() {
        const row = $(this);
        if (status === 'all' || row.find('.status').hasClass(status)) {
            row.show();
        } else {
            row.hide();
        }
    });
}

function handleSearch() {
    const searchTerm = $('#customer-search').val().toLowerCase();
    const status = $('#status-filter').val();
    
    $('#customers-body tr').each(function() {
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

function handleViewCustomer(username) {
    console.log('View customer clicked for username:', username);
    // Implement view customer functionality
}

function handleEditCustomer(username) {
    console.log('Edit customer clicked for username:', username);
    // Implement edit customer functionality
}

function handleDeleteCustomer(username) {
    console.log('Delete customer clicked for username:', username);
    // Implement delete customer functionality
}