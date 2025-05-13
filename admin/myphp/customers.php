<?php

$db = new SQLite3("../../casher/casher.db");

if($_SERVER['REQUEST_METHOD'] === "POST" && $_POST['action'] === 'getCustomers'){
    $stmt = $db->prepare('SELECT username, full_price, random_key, created_at, state FROM casher');
    $result = $stmt->execute();
    $data = [];

    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $data[] = $row;
    }

    echo json_encode([
        'status'=> 'success',
        'data'=> $data
    ]);
} else {
    echo json_encode([
        'status'=> 'error',
        'message'=> 'Invalid request'
    ]);
}

?>