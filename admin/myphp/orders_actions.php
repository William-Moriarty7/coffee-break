<?php

// Set header to return JSON response
header('Content-Type: application/json');

$db = new SQLite3("../../casher/casher.db");

if($_SERVER['REQUEST_METHOD'] === "POST") {
    if(isset($_POST['action']) && $_POST['action'] === 'customer') {
        $key = $_POST['key'];
        $stmt = $db->prepare("DELETE FROM casher WHERE random_key = :key");
        $stmt->bindParam(':key', $key);
        $stmt->execute();

        echo json_encode(['status' => 'success', 'message' => 'Customer deleted successfully']);
    }
}

?> 