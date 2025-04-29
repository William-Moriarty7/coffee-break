let cart = [];

function addtocart(button) {
    const item = JSON.parse(button.getAttribute('data-item'));

    if (localStorage.getItem("random_key") !== null) {
        Swal.fire({
            title: "Order in Process",
            text: "You can't add new orders while your order is being processed.",
            icon: "warning",
            confirmButtonText: 'OK'
        });
        return;
    }

    cart = JSON.parse(localStorage.getItem("cart")) || [];

    const totalQuantity = cart.length;
    if (totalQuantity >= 10) {
        Swal.fire({
            title: 'Limit Reached',
            text: 'You cannot order more than 10 items at once!',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }

    cart.push(item);
    localStorage.setItem("cart", JSON.stringify(cart));

    button.disabled = true;
    button.innerHTML = "Added to Cart";

    setTimeout(() => {
        button.disabled = false;
        button.innerHTML = "Order Now";
    }, 2000);
}
function showCart() {
    cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (localStorage.getItem("random_key") !== null) {
        $.post("../casher/cheker.php", { action: "get_old", random_key: localStorage.getItem("random_key") }, function (response) {
            try {
                const data = typeof response === "string" ? JSON.parse(response) : response;
                Checktheorder(data.data);
            } catch (error) {
                Swal.fire('Error!', 'Failed to parse server response.', 'error');
            }
        }).fail(() => {
            Swal.fire('Network Error!', 'Could not reach the server.', 'error');
        });
        return;
    }

    if (cart.length === 0) {
        Swal.fire({
            title: 'Your Cart is Empty',
            text: 'Add some items to your cart before checking out!',
            icon: 'info',
            confirmButtonText: 'OK'
        });
        return;
    }

    let groupedCart = cart.reduce((acc, item) => {
        let found = acc.find(i => i.name === item.name);
        if (found) {
            found.quantity += 1;
        } else {
            acc.push({ ...item, quantity: 1 });
        }
        return acc;
    }, []);

    // Calculate the total price
    let totalPrice = groupedCart.reduce((acc, item) => {
        return acc + (item.price * item.quantity);
    }, 0);

    let cartHtml = groupedCart.map(item => `
        <div class="cart-card">
            <img src="${item.image || 'https://vinut.com.vn/wp-content/webp-express/webp-images/doc-root/wp-content/uploads/2023/12/how-to-make-a-macchiato-the-classic-way-6572e3d759e13.jpeg.webp'}" alt="${item.name}" loading="lazy" class="cart-card-img">
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

    // Show cart with total price
    Swal.fire({
        title: 'Your Cart',
        html: `
            <div id="cartList" class="cart-list">${cartHtml}</div>
            <hr>
            <p><strong>Total Price: $${totalPrice.toFixed(2)}</strong></p>`,
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Checkout',
        denyButtonText: 'Empty Cart',
        cancelButtonText: 'Close',
        didOpen: () => {
            document.querySelectorAll('.btn-remove').forEach(button => {
                button.addEventListener('click', () => {
                    let name = button.getAttribute('data-name');
                    let idx = cart.findIndex(item => item.name === name);
                    if (idx !== -1) {
                        cart.splice(idx, 1);
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
                            text: 'You cannot order more than 10 items!',
                            icon: 'warning',
                            confirmButtonText: 'OK'
                        });
                        return;
                    }
                    let name = button.getAttribute('data-name');
                    let item = cart.find(i => i.name === name);
                    if (item) {
                        cart.push(item);
                        localStorage.setItem("cart", JSON.stringify(cart));
                        showCart();
                    }
                });
            });
        }
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Enter Your Name',
                input: 'text',
                inputPlaceholder: 'Your name',
                showCancelButton: true,
                confirmButtonText: 'Submit',
                cancelButtonText: 'Cancel'
            }).then(nameResult => {
                if (nameResult.isConfirmed && nameResult.value) {
                    const userName = nameResult.value;
                    const random_key = localStorage.getItem("random_key") || null;

                    $.post("../casher/casher.php", { cart: JSON.stringify(cart), userName: userName, random_key: random_key }, function (response) {
                        try {
                            const res = typeof response === "string" ? JSON.parse(response) : response;

                            if (res.status === "success") {
                                Swal.fire({
                                    title: 'Order Successful!',
                                    html: `<b>${res.message}</b><br>Your key is: <span style="color:#22c55e;">${res.random_key}</span>`,
                                    icon: "success"
                                });
                                localStorage.removeItem("cart");
                                localStorage.setItem("random_key", res.random_key);
                            } else if (res.status === "progress") {
                                Swal.fire({
                                    title: 'Order in Progress',
                                    text: "Want to check your order?",
                                    icon: 'info',
                                    showCancelButton: true,
                                    confirmButtonText: 'OK'
                                }).then(() => {
                                    localStorage.removeItem("cart");
                                    Checktheorder(res.data);
                                });
                            } else {
                                Swal.fire('Error!', res.message || 'Unexpected error occurred.', 'error');
                            }
                        } catch (error) {
                            Swal.fire('Error!', 'Invalid server response.', 'error');
                        }
                    }).fail(() => {
                        Swal.fire('Network Error!', 'Could not reach the server.', 'error');
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

        // Calculate the total price
        let totalPrice = orderedDrinks.reduce((acc, drink) => {
            // Assuming the drinks array contains price as a number
            return acc + drink.price;
        }, 0);

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
                    <hr style="margin: 10px 0;">
                    <p><b>Total Price: $${totalPrice.toFixed(2)}</b></p>
                </div>
                ${orderHtml}
            `,
            width: 600,
            background: '#fff',
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: 'Continue ✅',
            denyButtonText: 'Cancel the Order ❌',
            cancelButtonText: 'Close 🚪'
        });

        if (result.isConfirmed) {
            Swal.fire('Order Marked as Done!', '', 'success');
        } else if (result.isDenied) {
            $.post("../casher/cheker.php", { random_key: localStorage.getItem("random_key"), action: "cancel" }, function (response) {
                try {
                    const res = typeof response === "string" ? JSON.parse(response) : response;

                    if (res.status === "success") {
                        Swal.fire('Order Cancelled!', res.message, 'success');
                        localStorage.removeItem("cart");
                        localStorage.removeItem("random_key");
                    } else {
                        Swal.fire('Error!', res.message || 'Unexpected error occurred.', 'error');
                    }
                } catch (error) {
                    Swal.fire('Error!', 'Failed to parse cancellation response.', 'error');
                }
            }).fail(() => {
                Swal.fire('Network Error!', 'Could not reach the server.', 'error');
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

