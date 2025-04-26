let cart;
function addtocart(button) {
    const item = JSON.parse(button.getAttribute('data-item'));

    // Initialize or get cart
    cart = [];
    if (localStorage.getItem("cart") !== null) {
        cart = JSON.parse(localStorage.getItem("cart"));
    }

    // Check if cart already has 10 items
    if (cart.length >= 10) {
        Swal.fire({
            title: 'Limit Reached',
            text: 'You cannot order more than 10 items at once!',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }

    // Add item to cart
    cart.push(item);
    localStorage.setItem("cart", JSON.stringify(cart));

    // UI feedback: change button text and disable temporarily
    button.innerHTML = "Added to Cart";
    button.setAttribute("disabled", true);

    setTimeout(() => {
        button.innerHTML = "Order Now";
        button.removeAttribute("disabled");
    }, 2000);
}
// Function to show cart items using SweetAlert2
function showCart() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
        Swal.fire({
            title: 'Your Cart is Empty',
            text: 'Add some items to your cart before checking out!',
            icon: 'info',
            confirmButtonText: 'OK'
        });
        return;
    }

    // Group items by name and quantity
    let groupedCart = cart.reduce((acc, item) => {
        let existingItem = acc.find(i => i.name === item.name);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            acc.push({ ...item, quantity: 1 });
        }
        return acc;
    }, []);

    let cartHtml = groupedCart.map(item => `
        <div class="cart-card">
            <img src="https://vinut.com.vn/wp-content/webp-express/webp-images/doc-root/wp-content/uploads/2023/12/how-to-make-a-macchiato-the-classic-way-6572e3d759e13.jpeg.webp${item.image}" alt="${item.name}" loading="lazy" class="cart-card-img">
            <div class="cart-card-content">
                <h3 class="cart-card-title">${item.name} ${item.quantity > 1 ? `x${item.quantity}` : ''}</h3>
                <p class="cart-card-price">Price: $${item.price}</p>
                <div class="cart-card-actions">
                    <button class="btn-remove" data-name="${item.name}">Remove One</button>
                    <button class="btn-add" data-name="${item.name}">Add More</button>
                </div>
            </div>
        </div>
    `).join('');

    Swal.fire({
        title: 'Your Cart',
        html: `<div id="cartList" class="cart-list">${cartHtml}</div>`,
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Checkout',
        denyButtonText: 'Empty Cart',
        cancelButtonText: 'Close',
        didOpen: () => {
            document.querySelectorAll('.btn-remove').forEach(button => {
                button.addEventListener('click', () => {
                    let name = button.getAttribute('data-name');
                    let itemIndex = cart.findIndex(item => item.name === name);
                    if (itemIndex !== -1) {
                        cart.splice(itemIndex, 1);
                        localStorage.setItem("cart", JSON.stringify(cart));
                        showCart();
                    }
                });
            });

            document.querySelectorAll('.btn-add').forEach(button => {
                button.addEventListener('click', () => {
                    if (cart.length >= 10) {
                        Swal.fire({
                            title: 'Limit Reached',
                            text: 'You cannot order more than 10 items at once!',
                            icon: 'warning',
                            confirmButtonText: 'OK'
                        });
                        return;
                    }
                    let name = button.getAttribute('data-name');
                    let itemToAdd = cart.find(item => item.name === name);
                    if (itemToAdd) {
                        cart.push(itemToAdd);
                        localStorage.setItem("cart", JSON.stringify(cart));
                        showCart();
                    }
                });
            });
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Ask for user's name before proceeding to checkout
            Swal.fire({
                title: 'Enter Your Name',
                input: 'text',
                inputPlaceholder: 'Your name',
                showCancelButton: true,
                confirmButtonText: 'Submit',
                cancelButtonText: 'Cancel'
            }).then((nameResult) => {
                if (nameResult.isConfirmed && nameResult.value) {
                    const userName = nameResult.value;
                    Swal.fire('Proceeding to Checkout...', '', 'success').then(() => {
                        const random_key = localStorage.getItem("random_key") || null;
                         // Get the random key from local storage or default to an empty string
                        $.post("../casher/casher.php", { cart: JSON.stringify(cart), userName: userName , random_key: random_key },
                            function (response) {
                                // Handle the response from the server
                                if (response.status === "error") {
                                    Swal.fire('Error!', 'There was an error processing your order.', 'error');
                                } else if (response.status === "success") {
                                    Swal.fire({
                                        text: response.message,
                                        text: "Your key is: " + response.random_key,
                                        icon: "success"
                                      });

                                    localStorage.removeItem("cart"); // Clear cart after checkout
                                    localStorage.setItem("random_key", response.random_key); // Store the random key in local storage
                                }else if (response.status === "progress") {
                                    Swal.fire({
                                        title: 'Order in Progress',
                                        text: "you want to check the order?",
                                        icon: 'info',
                                        showCancelButton: true,
                                        confirmButtonText: 'OK'
                                    }).then(() => {
                                        localStorage.removeItem("cart");  // Clear cart after checkout
                                        Checktheorder(response.data);
                                    });
                                }
                                 else {
                                    Swal.fire('Error!', 'There was an error processing your order.', 'error');
                                    return;
                                }
                            }
                        );
                    });
                } else {
                    Swal.fire('Checkout Cancelled', '', 'info');
                }
            });
        } else if (result.isDenied) {
            cart = [];
            localStorage.setItem("cart", JSON.stringify(cart));
            Swal.fire('Cart Emptied!', '', 'success');
        }
    });
}

async function Checktheorder(list_order) {
    try {
        const response = await fetch("js/drinks/drinks-list.json");
        const drinksList = await response.json();

        const orderedIds = list_order.cartorder.split(',').map(id => parseInt(id.trim()));

        // Filter the drinks that match the ordered IDs
        const orderedDrinks = drinksList.filter(drink => orderedIds.includes(drink.id));

        if (orderedDrinks.length === 0) {
            Swal.fire({
                title: 'No items found',
                text: 'The ordered items could not be matched with the drink list.',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }

        // Build HTML for ordered drinks
        let orderHtml = `
            <div style="text-align: left; max-height: 300px; overflow-y: auto;">
                ${orderedDrinks.map(drink => `
                    <div style="display: flex; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                        <img src="${drink.image || 'https://vinut.com.vn/wp-content/webp-express/webp-images/doc-root/wp-content/uploads/2023/12/how-to-make-a-macchiato-the-classic-way-6572e3d759e13.jpeg.webp'}" alt="${drink.name}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px; border-radius: 8px;">
                        <div>
                            <div style="font-weight: bold;">${drink.name}</div>
                            <div style="font-size: 12px; color: gray;">$${drink.price.toFixed(2)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        const result = await Swal.fire({
            title: `<h3 style="margin-bottom: 10px;">Order for <b>${list_order.username}</b></h3>`,
            html: `
                <div style="text-align: left; font-size: 14px; margin-bottom: 10px;">
                    <p><b>Order Key:</b> <span style="color: #3b82f6;">${list_order.random_key}</span></p>
                    <p><b>Status:</b> <span style="color: ${list_order.state === 'pending' ? '#f00' : '#22c55e'};">${list_order.state}</span></p>
                    <p><b>Created At:</b> ${list_order.created_at}</p>
                </div>
                <hr style="margin: 10px 0;">
                ${orderHtml}
            `,
            width: 600,
            background: '#fff',
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: 'Continue ✅',
            denyButtonText: 'Cancel the Order ❌',
            cancelButtonText: 'Close 🚪',
            customClass: {
                popup: 'animated fadeInDown faster'
            }
        });

        // Handle the user's choice
if (result.isConfirmed) {
    Swal.fire('Order Marked as Done!', '', 'success');
    // Optional: Call an API here to update order status to 'done' if you want
} else if (result.isDenied) {
    $.post("../casher/cheker.php", { random_key: localStorage.getItem("random_key"), action: "cancel" }, function (response) {
        // Check if the response needs parsing
        let res = response;
        if (typeof response === "string") {
            try {
                res = JSON.parse(response);
            } catch (e) {
                console.error('Failed to parse response:', e);
                Swal.fire('Error!', 'Invalid server response.', 'error');
                return;
            }
        }

        if (res.status === "success") {
            Swal.fire({
                title: 'Order Cancelled!',
                text: res.message,
                icon: "success"
            });

            // Clear the cart if cancellation is successful
            localStorage.removeItem("cart");
            localStorage.removeItem("random_key");
        } else {
            Swal.fire('Error!', res.message || 'There was an error processing your order.', 'error');
        }
    });
}


    } catch (error) {
        console.error(error);
        Swal.fire({
            title: 'Error',
            text: 'Failed to fetch the drinks list. Please try again later.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}
