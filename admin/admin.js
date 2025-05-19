$(document).ready(function() {
    // Handle URL hash changes
    function handleHashChange() {
        const hash = window.location.hash;
        $('.sidebar-nav li').removeClass('active');
        
        switch(hash) {
            case '#orders':
                $('a[href="#orders"]').parent().addClass('active');
                orders();
                break;
            case '#products':
                $('a[href="#products"]').parent().addClass('active');
                products();
                break;
            case '#customers':
                $('a[href="#customers"]').parent().addClass('active');
                customers();
                break;
            case '#analytics':
                $('a[href="#analytics"]').parent().addClass('active');
                analytics();
                break;
            case '#dashboard':
                $('a[href="#dashboard"]').parent().addClass('active');
                dashboard();
                break;
            default:
                // Default to dashboard
                $('a[href=""]').parent().addClass('active');
                get_Stats_Cards();
                break;
        }
    }

    // Initial hash check
    handleHashChange();

    // Listen for hash changes
    $(window).on('hashchange', handleHashChange);

    // Handle sidebar navigation clicks
    $('.sidebar-nav a').on('click', function(e) {
        e.preventDefault();
        const href = $(this).attr('href');
        if (href) {  // Only update hash if href is not empty
            window.location.hash = href;
        }
    });
});

function get_Stats_Cards(){
    $.post("myphp/admin.php", 
        { get_Stats_Card: 'get_Stats_Card' },
        function (data) {
            try {
                // Parse the JSON data if it's returned as a string
                const stats = typeof data === 'string' ? JSON.parse(data) : data;
                
                $('#Today-Orders').text(stats.todayOrders.count);
                $('#Customers').text(stats.customers.count);
                $('#Products').text(stats.products);
                $('#Revenue').text(stats.todaycash);
                
            } catch (error) {
                console.error('Error processing stats data:', error);
            }
        },
        'json' // Specify json as the expected dataType
    );
}
function customer() {
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

get_Stats_Cards();
customer();