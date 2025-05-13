<?php

$db = new SQLite3("../../casher/casher.db");
if (!$db) {
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
function getproduct(){
    $product = file_get_contents("../../orders/js/drinks/drinks-list.json");
    $productData = json_decode($product, true);
    return count($productData);
}
echo json_encode([
    'status' => 'success',
    'todayOrders' => getdata($db),
    'customers' => getcustomers($db),
    'todaycash' => gettodaycash($db),
    'products'=> getproduct(),
]);

?>