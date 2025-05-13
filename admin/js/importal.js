function customers() {
    let list = document.getElementById("customer");
    list.innerHTML = "";
    $.post("myphp/importal.php", { status: "customers" },
        function (response) {
            response = JSON.parse(response);
            if (response.status === 'success') {
                let data_list = "";
                for (let i = 0; i < response.data.length; i++) {
                    let customer = response.data[i];
                    data_list += `
                        <tr>
                            <td>${customer.random_key}</td>
                            <td>${customer.username}</td>
                            <td>${customer.cartorder.split(",").map(Number).length}</td>
                            <td>$${parseFloat(customer.full_price).toFixed(2)}</td>
                            <td><span class="status ${customer.state.toLowerCase()}">${customer.state}</span></td>
                            <td>${new Date(customer.created_at).toLocaleDateString()}</td>
                            <td>
                                <button class="action-btn view" onclick="fa_eye('${customer.cartorder}')"><i class="fas fa-eye"></i></button>
                                <button class="action-btn edit" onclick="editCustomerStatu('${customer.random_key}')"><i class="fas fa-edit"></i></button>
                            </td>
                        </tr>
                    `;
                }
                list.innerHTML = data_list;
            } else {
                console.error("Failed to fetch customers");
            }
        }
    );
}
customers();
