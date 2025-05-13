let menuData = [];

async function fet() {
    try {
        let menu = await fetch("../orders/js/drinks/drinks-list.json");
        if (!menu.ok) {
            throw new Error(`HTTP error! status: ${menu.status}`);
        }
        let menu_list = await menu.json();
        menuData = menu_list;
    } catch (error) {
        console.error("Failed to fetch menu data:", error);
    }
}

function fa_eye(data) {
    fet().then(() => {
        const order = data.split(",").map(Number);
        let container = "";
        let total = 0;

        for (const orderId of order) {
            const menuItem = menuData.find(item => item.id === orderId);
            if (menuItem) {
                const itemPrice = parseFloat(menuItem.price);
                total += itemPrice;
                container += `
                    <tr>
                        <td>${menuItem.name}</td>
                        <td>$${itemPrice.toFixed(2)}</td>
                        <td>1</td>
                    </tr>`;
            }
        }

        const styles = `
            <style>
            .order-details table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }
            .order-details th, .order-details td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }
            .order-details thead th {
                background-color: #f5f5f5;
                font-weight: bold;
            }
            .order-details tfoot {
                font-weight: bold;
                background-color: #f9f9f9;
            }
            </style>
        `;

        Swal.fire({
            title: 'Order Details',
            html: `
            ${styles}
            <div class="order-details">
                <table>
                <thead>
                    <tr>
                    <th>Item</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    ${container}
                </tbody>
                <tfoot>
                    <tr>
                    <td colspan="2"><strong>Total:</strong></td>
                    <td>$${total.toFixed(2)}</td>
                    </tr>
                </tfoot>
                </table>
            </div>`,
            showCloseButton: true,
            showCancelButton: false,
            focusConfirm: false,
            confirmButtonText: 'Close'
        });
    });
}


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
                $.post("myphp/statuUpdate.php", {
                    status: "editCustomerStatus",
                    key : key,
                    newStatus: status
                })
                .done(response => {
                    try {
                        const result = JSON.parse(response);
                        if (result.status === 'success') {
                            resolve(result);
                        } else {
                            reject(new Error(result.message || 'Failed to update status'));
                        }
                    } catch (e) {
                        reject(new Error('Invalid server response'));
                    }
                })
                .fail(() => reject(new Error('Network error')));
            })
            .then(result => {
                Swal.fire('Success', result.message, 'success');
                get_Stats_Cards();
            })
            .catch(error => {
                Swal.fire('Error', error.message, 'error');
            });
        }
    });
}
