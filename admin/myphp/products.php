<?php
header('Content-Type: application/json');

try {
    // Connect to the drinks database
    $db = new SQLite3("../../orders/db/drinks-list.db");
    
    if (!$db) {
        throw new Exception("Failed to connect to the database: " . $db->lastErrorMsg());
    }

    // Get all products
    $query = "SELECT * FROM drinks ORDER BY id";
    $result = $db->query($query);
    
    $products = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $products[] = [
            'id' => $row['id'],
            'name' => $row['name'],
            'description' => $row['description'],
            'price' => $row['price'],
            'image' => $row['image']
        ];
    }

    // Return the products as JSON
    echo json_encode([
        'status' => 'success',
        'products' => $products
    ]);

} catch (Exception $e) {
    // Return error response
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
} finally {
    if (isset($db)) {
        $db->close();
    }
}
?> 