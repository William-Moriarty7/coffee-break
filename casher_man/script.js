// Global function for rendering users
function renderUsers(usersToRender) {
    const usersTableBody = document.getElementById('usersTableBody');
    usersTableBody.innerHTML = '';
    
    usersToRender.forEach(user => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.random_key}</td>
            <td class="status"><span class="${user.state}">${user.state.charAt(0).toUpperCase() + user.state.slice(1)}</span></td>
            <td>${user.cartorder.split(",").map(Number).length} items</td>
            <td>$${parseFloat(user.full_price).toFixed(2)}</td>
            <td>${new Date(user.created_at).toLocaleDateString()}</td>
            <td>
                <button class="view-details" onclick="showUserDetails('${user.cartorder}', '${user.random_key}')">
                    View Details
                </button>
                <button class="view-details" onclick="editCustomerStatu('${user.random_key}')">
                    Edit Statues
                </button>
            </td>
        `;
        usersTableBody.appendChild(row);
    });
}

// Global function for loading users
async function loadUsers() {
    try {
        const response = await fetch('casher_man.php?action=get_users');
        const data = await response.json();
        
        if (data.success) {
            users = data.users;
            renderUsers(users);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load users: ' + data.error,
                confirmButtonColor: '#7D5A50'
            });
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error loading users: ' + error.message,
            confirmButtonColor: '#7D5A50'
        });
    }
}

// Global function for editing customer status
function editCustomerStatu(key){
    Swal.fire({
        title: 'Change Order Status',
        input: 'select',
        inputOptions: {
            'pending': 'Pending',
            'processing': 'Processing',
            'done': 'Done',
            'cancelled': 'Cancelled'
        },
        inputPlaceholder: 'Select a status',
        showCancelButton: true,
        confirmButtonText: 'Update Status',
        cancelButtonText: 'Cancel',
        preConfirm: (status) => {
            return new Promise((resolve, reject) => {
                fetch(`casher_man.php?action=update_mode&user_id=${key}&status=${status}`)
                    .then(response => response.json())
                    .then(result => {
                        if (result.success === true) {
                            resolve(result);
                        } else {
                            reject(new Error(result.message || 'Failed to update status'));
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        reject(new Error('Network error'));
                    });
            })
            .then(result => {
                Swal.fire('Success', result.message, 'success');
                loadUsers(); // Reload the users list
            })
            .catch(error => {
                Swal.fire('Error', error.message, 'error');
            });
        }
    });
}
function filterUsers() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedMode = modeFilter.value;

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.username.toLowerCase().includes(searchTerm) ||
                            user.random_key.toLowerCase().includes(searchTerm);
        const matchesMode = selectedMode === 'all' || user.state === selectedMode;
        return matchesSearch && matchesMode;
    });

    renderUsers(filteredUsers);
}
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const modeFilter = document.getElementById('modeFilter');
    const usersTableBody = document.getElementById('usersTableBody');
    const themeCheckbox = document.getElementById('checkbox');
    const body = document.body;

    let users = [];
    let allDrinks = [];

    // Theme toggle functionality

    // Load users on page load
    loadUsers();

    // Event listeners
    searchInput.addEventListener('input', filterUsers);
    modeFilter.addEventListener('change', filterUsers);

    

    window.showUserDetails = async function(cartorder,random_key) {
        try {
            const response = await fetch('../orders/db/get-drinks.php');
            const data = await response.json();
            
            if (data) {
                const orderIds = cartorder.split(',').map(Number);
                const filteredOrders = data.filter(drink => orderIds.includes(parseInt(drink.id)));
                console.log(filteredOrders);
                
                const ordersHtml = filteredOrders.length === 0 ? 
                    '<p>No orders found</p>' : 
                    filteredOrders.map(order => `
                        <div class="order-item">
                            <h4>${order.name}</h4>
                            <p><strong>Price:</strong> $${parseFloat(order.price).toFixed(2)}</p>
                        </div>
                    `).join('');

                Swal.fire({
                    title: 'Order Details',
                    html: `
                        <div class="user-details">
                            <div class="orders-list">
                                <h3>Order ID: ${random_key}</h3>
                                <h3>Total Price: $${parseFloat(filteredOrders.reduce((total, order) => total + parseFloat(order.price), 0)).toFixed(2)}</h3>
                                ${ordersHtml}
                            </div>
                        </div>
                    `,
                    width: '600px',
                    confirmButtonColor: '#7D5A50',
                    customClass: {
                        popup: 'swal2-popup-dark',
                        title: 'swal2-title-dark',
                        content: 'swal2-content-dark'
                    }
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to load order details',
                    confirmButtonColor: '#7D5A50'
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error loading orders: ' + error.message,
                confirmButtonColor: '#7D5A50'
            });
        }
    };
}); 