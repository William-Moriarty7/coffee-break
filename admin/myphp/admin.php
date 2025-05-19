<?php

$db = new SQLite3("../../casher/casher.db");
$drinks_db = new SQLite3("../../orders/db/drinks-list.db");

if (!$db || !$drinks_db) {
    die("Failed to connect to the database: " . $db->lastErrorMsg());
}

function getdata($db){
    $query = $db->query("SELECT COUNT(*) as count FROM casher WHERE DATE(created_at) = DATE('now') AND state != 'cancelled'");
    $data = $query->fetchArray(SQLITE3_ASSOC);
    return $data;
}

function getcustomers($db){
    $query = $db->query("SELECT COUNT(*) as count FROM casher");
    $data = $query->fetchArray(SQLITE3_ASSOC);
    return $data;
}

function gettodaycash($db){
    $query = $db->query("SELECT full_price FROM casher WHERE DATE(created_at) = DATE('now') AND state != 'cancelled'");
    $total = 0;
    while ($row = $query->fetchArray(SQLITE3_ASSOC)) {
        $total += $row['full_price'];
    }
    return $total;
}

function getproduct($drinks_db){
    $query = $drinks_db->query("SELECT COUNT(*) as count FROM drinks");
    $data = $query->fetchArray(SQLITE3_ASSOC);
    return $data['count'];
}

echo json_encode([
    'status' => 'success',
    'todayOrders' => getdata($db),
    'customers' => getcustomers($db),
    'todaycash' => gettodaycash($db),
    'products'=> getproduct($drinks_db),
]);

// Close database connections
$db->close();
$drinks_db->close();

?>