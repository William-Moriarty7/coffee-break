<?php

$db = new SQLite3('casher.db');


if ($_SERVER['REQUEST_METHOD'] === "POST" && $_POST['action'] === 'cancel'){
    $kay = $_POST['random_key'];
    $stmt = $db->prepare('UPDATE casher SET state = :stat WHERE random_key = :random_key');
    $stmt->bindValue(':random_key', $kay, SQLITE3_TEXT);
    $stmt->bindValue(':stat', 'cancelled', SQLITE3_TEXT);
    if($stmt->execute()){
        echo json_encode([
            "status" => "success",
            "message" => "Order cancelled successfully."
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to cancel order."
        ]);
    }
}

if ($_SERVER['REQUEST_METHOD'] === "POST" && $_POST['action'] === 'get_old'){
    $kay = $_POST['random_key'];
    $stmt = $db->prepare('SELECT * FROM casher WHERE random_key = :random_key');
    $stmt->bindValue(':random_key', $kay, SQLITE3_TEXT);
    $result = $stmt->execute();
    $data = $result->fetchArray(SQLITE3_ASSOC);
    
    echo json_encode([
        'status'=> 'success',
        'data'=> $data
        ]);
}

?>