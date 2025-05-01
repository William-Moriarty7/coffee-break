function customers() {
    let list = document.getElementById("customer");
    list.innerHTML = "";
    $.post("myphp/importal.php", { status: "customers" },
        function (response) {
            response = JSON.parse(response);
            console.log(response.data);
            if (response.status === 'success') {
                let data_list = "";
                for (let i = 0; i < response.data.length; i++) {
                    let customer = response.data[i];
                    data_list += `
                        <tr>
                            <td>${customer.random_key}</td>
                            <td>${customer.username}</td>
                            <td>${customer.cartorder.split(",").map(Number).length}</td>
                            <td>$${customer.full_price}</td>
                            <td><span class="status completed">${customer.state}</span></td>
                            <td>${customer.created_at}</td>
                            <td>
                                <button class="action-btn view"><i class="fas fa-eye"></i></button>
                                <button class="action-btn edit"><i class="fas fa-edit"></i></button>
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
