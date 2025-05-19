<?php
header('Content-Type: application/json');

try {
    $db = new SQLite3("../../casher/casher.db");
    
    // Get time range from request
    $timeRange = isset($_POST['timeRange']) ? $_POST['timeRange'] : 'month';
    
    // Set the date range based on selection
    switch($timeRange) {
        case 'today':
            $startDate = date('Y-m-d 00:00:00');
            $previousStart = date('Y-m-d 00:00:00', strtotime('-1 day'));
            break;
        case 'week':
            $startDate = date('Y-m-d 00:00:00', strtotime('-6 days'));
            $previousStart = date('Y-m-d 00:00:00', strtotime('-13 days'));
            break;
        case 'year':
            $startDate = date('Y-m-d 00:00:00', strtotime('-365 days'));
            $previousStart = date('Y-m-d 00:00:00', strtotime('-730 days'));
            break;
        default: // month
            $startDate = date('Y-m-d 00:00:00', strtotime('-29 days'));
            $previousStart = date('Y-m-d 00:00:00', strtotime('-59 days'));
    }

    $endDate = date('Y-m-d H:i:s');
    $previousEnd = $startDate;

    // Current Period Metrics
    $currentMetrics = $db->prepare("
        SELECT 
            COUNT(*) as totalOrders,
            SUM(full_price) as totalRevenue,
            COUNT(DISTINCT username) as totalCustomers,
            AVG(full_price) as averageOrderValue,
            COUNT(CASE WHEN state = 'done' THEN 1 END) as completedOrders
        FROM casher 
        WHERE created_at BETWEEN :startDate AND :endDate
    ");
    
    $currentMetrics->bindValue(':startDate', $startDate, SQLITE3_TEXT);
    $currentMetrics->bindValue(':endDate', $endDate, SQLITE3_TEXT);
    $current = $currentMetrics->execute()->fetchArray(SQLITE3_ASSOC);

    // Previous Period Metrics
    $previousMetrics = $db->prepare("
        SELECT 
            COUNT(*) as totalOrders,
            SUM(full_price) as totalRevenue,
            COUNT(DISTINCT username) as totalCustomers,
            AVG(full_price) as averageOrderValue
        FROM casher 
        WHERE created_at BETWEEN :previousStart AND :previousEnd
    ");
    
    $previousMetrics->bindValue(':previousStart', $previousStart, SQLITE3_TEXT);
    $previousMetrics->bindValue(':previousEnd', $previousEnd, SQLITE3_TEXT);
    $previous = $previousMetrics->execute()->fetchArray(SQLITE3_ASSOC);

    // Get Revenue Data for Chart
    $revenueData = $db->prepare("
        SELECT 
            date(created_at) as date,
            SUM(full_price) as daily_revenue,
            COUNT(*) as daily_orders
        FROM casher 
        WHERE created_at BETWEEN :startDate AND :endDate
        GROUP BY date(created_at)
        ORDER BY date
    ");
    
    $revenueData->bindValue(':startDate', $startDate, SQLITE3_TEXT);
    $revenueData->bindValue(':endDate', $endDate, SQLITE3_TEXT);
    $result = $revenueData->execute();
    
    $revenueByDay = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $revenueByDay[] = $row;
    }

    // Get Customer Distribution Data
    $customerData = $db->prepare("
        SELECT 
            state,
            COUNT(*) as count
        FROM casher 
        WHERE created_at BETWEEN :startDate AND :endDate
        GROUP BY state
    ");
    
    $customerData->bindValue(':startDate', $startDate, SQLITE3_TEXT);
    $customerData->bindValue(':endDate', $endDate, SQLITE3_TEXT);
    $result = $customerData->execute();
    
    $customerDistribution = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $customerDistribution[] = $row;
    }

    // Calculate New Customers
    $newCustomers = $db->prepare("
        SELECT COUNT(DISTINCT c1.username) as new_customers
        FROM casher c1
        WHERE c1.created_at BETWEEN :startDate AND :endDate
        AND NOT EXISTS (
            SELECT 1 FROM casher c2
            WHERE c2.username = c1.username
            AND c2.created_at < :startDate
        )
    ");
    
    $newCustomers->bindValue(':startDate', $startDate, SQLITE3_TEXT);
    $newCustomers->bindValue(':endDate', $endDate, SQLITE3_TEXT);
    $newCustomerCount = $newCustomers->execute()->fetchArray(SQLITE3_ASSOC)['new_customers'];

    // Calculate Retention Rate
    $retentionRate = 0;
    if ($previous['totalCustomers'] > 0) {
        $returningCustomers = $db->prepare("
            SELECT COUNT(DISTINCT c1.username) as returning
            FROM casher c1
            WHERE c1.created_at BETWEEN :startDate AND :endDate
            AND EXISTS (
                SELECT 1 FROM casher c2
                WHERE c2.username = c1.username
                AND c2.created_at BETWEEN :previousStart AND :previousEnd
            )
        ");
        
        $returningCustomers->bindValue(':startDate', $startDate, SQLITE3_TEXT);
        $returningCustomers->bindValue(':endDate', $endDate, SQLITE3_TEXT);
        $returningCustomers->bindValue(':previousStart', $previousStart, SQLITE3_TEXT);
        $returningCustomers->bindValue(':previousEnd', $previousEnd, SQLITE3_TEXT);
        $returning = $returningCustomers->execute()->fetchArray(SQLITE3_ASSOC)['returning'];
        
        $retentionRate = ($returning / $previous['totalCustomers']) * 100;
    }

    // Prepare Chart Data
    $labels = [];
    $revenues = [];
    $orders = [];
    foreach ($revenueByDay as $day) {
        $labels[] = date('M d', strtotime($day['date']));
        $revenues[] = floatval($day['daily_revenue']);
        $orders[] = intval($day['daily_orders']);
    }

    // Calculate Growth Rates
    $revenueGrowth = $previous['totalRevenue'] > 0 ? 
        (($current['totalRevenue'] - $previous['totalRevenue']) / $previous['totalRevenue']) * 100 : 0;

    // Prepare Response Data
    $response = [
        'success' => true,
        'data' => [
            'totalRevenue' => $current['totalRevenue'] ?? 0,
            'totalOrders' => $current['totalOrders'] ?? 0,
            'averageOrderValue' => $current['averageOrderValue'] ?? 0,
            'newCustomers' => $newCustomerCount ?? 0,
            'retentionRate' => round($retentionRate, 1),
            'revenueGrowth' => round($revenueGrowth, 1),
            'previousRevenue' => $previous['totalRevenue'] ?? 0,
            'previousOrders' => $previous['totalOrders'] ?? 0,
            'previousAverageOrderValue' => $previous['averageOrderValue'] ?? 0,
            'revenueData' => [
                'labels' => $labels,
                'datasets' => [
                    [
                        'label' => 'Revenue',
                        'data' => $revenues,
                        'borderColor' => '#7D5A50',
                        'backgroundColor' => 'rgba(125, 90, 80, 0.1)',
                        'fill' => true
                    ]
                ]
            ],
            'ordersData' => [
                'labels' => $labels,
                'datasets' => [
                    [
                        'label' => 'Orders',
                        'data' => $orders,
                        'backgroundColor' => '#B4846C'
                    ]
                ]
            ],
            'customersData' => [
                'labels' => array_column($customerDistribution, 'state'),
                'datasets' => [
                    [
                        'data' => array_column($customerDistribution, 'count'),
                        'backgroundColor' => [
                            '#7D5A50',
                            '#B4846C',
                            '#E5B299',
                            '#FCDEC0'
                        ]
                    ]
                ]
            ]
        ]
    ];

    echo json_encode($response);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage()
    ]);
}
?>