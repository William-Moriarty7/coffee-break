$(document).ready(function() {
    // Handle products link click
    $('a[href="#products"]').on('click', function(e) {
        e.preventDefault();
        $('.sidebar-nav li').removeClass('active');
        $(this).parent().addClass('active');
        products();
    });
});

function products() {
    // Update header title
    $('.admin-header h1').text('Products Management');

    $.post('../orders/js/drinks/drinks-list.json', function(response) {
        try {
            console.log('Response:', response); // Debug log

            // Check if response is valid
            if (!response) {
                throw new Error('No response received from server');
            }

            let products = response;
            let content = $('.admin-content');
            
            if (!content.length) {
                throw new Error('Admin content container not found');
            }

            let html = `
            <div class="container">
                <div class="row">
                    <div class="col-md-12">
                        <div class="section-header">
                            <h2>Products Management</h2>
                            <button id="add-product" class="btn btn-primary">
                                <i class="fas fa-plus"></i> Add New Product
                            </button>
                        </div>
                        <div class="table-responsive">
                            <table id="products-table" class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Description</th>
                                        <th>Price</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="products-body">
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>`;

            content.html(html);

            const productsBody = $('#products-body');
            products.forEach(product => {
                const row = $('<tr>').html(`
                    <td>${product.id || 'N/A'}</td>
                    <td><strong>${product.name || 'N/A'}</strong></td>
                    <td>${product.description || 'N/A'}</td>
                    <td>$${parseFloat(product.price || 0).toFixed(2)}</td>
                    <td>
                        <button class="action-btn edit" data-id="${product.id || ''}" title="Edit Product">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" data-id="${product.id || ''}" title="Delete Product">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `);
                productsBody.append(row);
            });

            // Add event listeners
            $('#add-product').on('click', handleAddProduct);
            $('.action-btn.edit').on('click', function() {
                handleEditProduct($(this).data('id'));
            });
            $('.action-btn.delete').on('click', function() {
                handleDeleteProduct($(this).data('id'));
            });

        } catch (error) {
            console.error('Error:', error);
            // Show error to user
            $('.admin-content').html(`
                <div class="alert alert-danger" role="alert">
                    <i class="fas fa-exclamation-circle"></i> Error loading products: ${error.message}
                </div>`);
        }
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error('AJAX Error:', textStatus, errorThrown);
        $('.admin-content').html(`
            <div class="alert alert-danger" role="alert">
                <i class="fas fa-exclamation-circle"></i> Error loading products: ${errorThrown}
            </div>`);
    });
}

function handleAddProduct() {
    console.log('Add product clicked');
    // Implement add product functionality
}

function handleEditProduct(id) {
    console.log('Edit product clicked for ID:', id);
    // Implement edit product functionality
}

function handleDeleteProduct(id) {
    console.log('Delete product clicked for ID:', id);
    // Implement delete product functionality
}