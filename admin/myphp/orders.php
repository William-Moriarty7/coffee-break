<?php

$db = new SQLite3("../../casher/casher.db");

if($_SERVER['REQUEST_METHOD'] === "POST" && $_POST['action'] === 'getOrders'){
    $stmt = $db->prepare('SELECT * FROM casher WHERE DATE(created_at) = DATE("now")');
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