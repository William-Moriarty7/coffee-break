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

get_Stats_Cards();