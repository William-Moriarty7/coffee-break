$(document).ready(function() {
    // Handle dashboard link click
    $('a[href="#dashboard"]').on('click', function(e) {
        e.preventDefault();
        $('.sidebar-nav li').removeClass('active');
        $(this).parent().addClass('active');
        dashboard();
    });
});

function dashboard() {
    // Update header title
    $('.admin-header h1').text('Dashboard');

    // Get stats cards data
    get_Stats_Cards();

    // Create dashboard content
    let content = $('.admin-content');
    let html = `
        <!-- Stats Cards -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon" style="background-color: #FCDEC0;">
                    <i class="fas fa-shopping-bag" style="color: #B85C38;"></i>
                </div>
                <div class="stat-info">
                    <h3>Today's Orders</h3>
                    <p id="Today-Orders">0</p>

                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background-color: #E5B299;">
                    <i class="fas fa-coffee" style="color: #5C4033;"></i>
                </div>
                <div class="stat-info">
                    <h3>Products</h3>
                    <p id="Products">0</p>

                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background-color: #B4846C;">
                    <i class="fas fa-users" style="color: #FDF6EC;"></i>
                </div>
                <div class="stat-info">
                    <h3>Customers</h3>
                    <p id="Customers">0</p>

                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background-color: #7D5A50;">
                    <i class="fas fa-dollar-sign" style="color: #FDF6EC;"></i>
                </div>
                <div class="stat-info">
                    <h3>Revenue</h3>
                    <p id="Revenue">$0</p>
                </div>
            </div>
        </div>

        <!-- Recent Orders -->
        <div class="content-section">
            <div class="section-header">
                <h2>Recent Orders</h2>
                <a onclick="orders()" href="#orders" class="btn outline">View All</a>
            </div>
            <div class="table-container">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="customer">
                        <!-- Recent orders will be loaded here -->
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Popular Products -->
        <div class="content-section">
            <div class="section-header">
                <h2>Popular Products</h2>
                <a href="#products" class="btn outline">Manage Products</a>
            </div>
            <div class="products-grid">
                <div class="product-card">
                    <div class="product-image">
                        <img src="https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg" alt="Espresso">
                    </div>
                    <div class="product-info">
                        <h3>Classic Espresso</h3>
                        <p>24 orders this week</p>
                        <div class="product-meta">
                            <span>$3.50</span>
                            <div class="product-rating">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star-half-alt"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="product-card">
                    <div class="product-image">
                        <img src="https://images.pexels.com/photos/4792377/pexels-photo-4792377.jpeg" alt="Caramel Latte">
                    </div>
                    <div class="product-info">
                        <h3>Caramel Latte</h3>
                        <p>18 orders this week</p>
                        <div class="product-meta">
                            <span>$4.75</span>
                            <div class="product-rating">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="far fa-star"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="product-card">
                    <div class="product-image">
                        <img src="https://images.pexels.com/photos/2074130/pexels-photo-2074130.jpeg" alt="Cold Brew">
                    </div>
                    <div class="product-info">
                        <h3>Classic Cold Brew</h3>
                        <p>15 orders this week</p>
                        <div class="product-meta">
                            <span>$4.50</span>
                            <div class="product-rating">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="product-card">
                    <div class="product-image">
                        <img src="https://images.pexels.com/photos/372851/pexels-photo-372851.jpeg" alt="Croissant">
                    </div>
                    <div class="product-info">
                        <h3>Butter Croissant</h3>
                        <p>12 orders this week</p>
                        <div class="product-meta">
                            <span>$3.25</span>
                            <div class="product-rating">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star-half-alt"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    content.html(html);

    // Load recent orders
    loadRecentOrders();
}

function loadRecentOrders() {
    $.post("myphp/importal.php", 
        { get_Recent_Orders: 'get_Recent_Orders' },
        function (data) {
            try {
                const orders = typeof data === 'string' ? JSON.parse(data) : data;
                let ordersHtml = '';
                
                orders.forEach(order => {
                    ordersHtml += `
                        <tr>
                            <td>${order.order_id}</td>
                            <td>${order.customer_name}</td>
                            <td>${order.items_count}</td>
                            <td>$${parseFloat(order.total).toFixed(2)}</td>
                            <td><span class="status ${order.state.toLowerCase()}">${order.state}</span></td>
                            <td>${new Date(order.created_at).toLocaleDateString()}</td>
                            <td>
                                <button class="action-btn view" onclick="fa_eye('${order.cartorder}')"><i class="fas fa-eye"></i></button>
                                <button class="action-btn edit" onclick="editCustomerStatu('${order.random_key}')"><i class="fas fa-edit"></i></button>
                            </td>
                        </tr>
                    `;
                });

                $('#customer').html(ordersHtml);
            } catch (error) {
                console.error('Error processing recent orders:', error);
                $('#customer').html('<tr><td colspan="7" class="text-center">Error loading recent orders</td></tr>');
            }
        },
        'json'
    );
} 