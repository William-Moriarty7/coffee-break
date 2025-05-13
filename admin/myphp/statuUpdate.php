<?php

$db = new SQLite3("../../casher/casher.db");

if ($_SERVER['REQUEST_METHOD'] === "POST" && isset($_POST['status']) && $_POST['status'] === 'editCustomerStatus') {
    $key = $_POST["key"];
    
    // Ensure the query is correct
    $stmt = $db->prepare('UPDATE casher SET state = :statu WHERE random_key = :key');
    $stmt->bindValue(':statu', $_POST['newStatus']); // Assuming 'newStatus' is passed in the POST request
    $stmt->bindValue(':key', $key);
    $result = $stmt->execute();

    if ($result) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Customer status updated successfully'
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to update customer status'
        ]);
    }
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid request'
    ]);
}



?>