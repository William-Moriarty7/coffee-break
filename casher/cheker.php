<?php

$db = new SQLite3('casher.db');


if ($_SERVER['REQUEST_METHOD'] === "POST" && $_POST['action'] === 'cancel'){
    $kay = $_POST['random_key'];
    $stmt = $db->prepare('DELETE FROM casher WHERE random_key = :random_key');
    $stmt->bindValue(':random_key', $kay, SQLITE3_TEXT);
    
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


?>