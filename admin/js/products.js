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

    $.get('myphp/products.php', function(response) {
        try {
            if (response.status === 'error') {
                throw new Error(response.message);
            }

            let products = response.products;
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
    // Show add product modal
    Swal.fire({
        title: 'Add New Product',
        html: `
            <form id="add-product-form">
                <div class="form-group">
                    <label for="name">Name</label>
                    <input type="text" class="form-control" id="name" required>
                </div>
                <div class="form-group">
                    <label for="price">Price</label>
                    <input type="number" class="form-control" id="price" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="description">Description</label>
                    <textarea class="form-control" id="description" required></textarea>
                </div>
                <div class="form-group">
                    <label for="image">Image URL</label>
                    <input type="text" class="form-control" id="image">
                </div>
            </form>
        `,
        showCancelButton: true,
        confirmButtonText: 'Add Product',
        cancelButtonText: 'Cancel',
        preConfirm: () => {
            const formData = {
                action: 'add',
                name: $('#name').val(),
                price: $('#price').val(),
                description: $('#description').val(),
                image: $('#image').val()
            };

            return $.post('myphp/product_actions.php', formData)
                .then(response => {
                    if (response.status === 'error') {
                        throw new Error(response.message);
                    }
                    return response;
                })
                .catch(error => {
                    Swal.showValidationMessage(`Request failed: ${error.message}`);
                });
        }
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire('Success!', 'Product added successfully.', 'success');
            products(); // Refresh the products list
        }
    });
}

function handleEditProduct(id) {
    // Get product details and show edit modal
    const product = $('#products-body').find(`tr:has(button[data-id="${id}"])`).find('td');
    
    Swal.fire({
        title: 'Edit Product',
        html: `
            <form id="edit-product-form">
                <input type="hidden" id="id" value="${id}">
                <div class="form-group">
                    <label for="name">Name</label>
                    <input type="text" class="form-control" id="name" value="${product.eq(1).text()}" required>
                </div>
                <div class="form-group">
                    <label for="price">Price</label>
                    <input type="number" class="form-control" id="price" step="0.01" value="${product.eq(3).text().replace('$', '')}" required>
                </div>
                <div class="form-group">
                    <label for="description">Description</label>
                    <textarea class="form-control" id="description" required>${product.eq(2).text()}</textarea>
                </div>
                <div class="form-group">
                    <label for="image">Image URL</label>
                    <input type="text" class="form-control" id="image">
                </div>
            </form>
        `,
        showCancelButton: true,
        confirmButtonText: 'Update Product',
        cancelButtonText: 'Cancel',
        preConfirm: () => {
            const formData = {
                action: 'edit',
                id: id,
                name: $('#name').val(),
                price: $('#price').val(),
                description: $('#description').val(),
                image: $('#image').val()
            };

            return $.post('myphp/product_actions.php', formData)
                .then(response => {
                    if (response.status === 'error') {
                        throw new Error(response.message);
                    }
                    return response;
                })
                .catch(error => {
                    Swal.showValidationMessage(`Request failed: ${error.message}`);
                });
        }
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire('Success!', 'Product updated successfully.', 'success');
            products(); // Refresh the products list
        }
    });
}

function handleDeleteProduct(id) {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            $.post('myphp/product_actions.php', {
                action: 'delete',
                id: id
            })
            .done(function(response) {
                if (response.status === 'success') {
                    Swal.fire('Deleted!', 'Product has been deleted.', 'success');
                    products(); // Refresh the products list
                } else {
                    Swal.fire('Error!', response.message, 'error');
                }
            })
            .fail(function(error) {
                Swal.fire('Error!', 'Failed to delete product.', 'error');
            });
        }
    });
}