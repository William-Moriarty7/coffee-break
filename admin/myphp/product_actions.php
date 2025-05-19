<?php
header('Content-Type: application/json');

try {
    // Connect to the drinks database
    $db = new SQLite3("../../orders/db/drinks-list.db");
    
    if (!$db) {
        throw new Exception("Failed to connect to the database: " . $db->lastErrorMsg());
    }

    // Get the action from POST data
    $action = $_POST['action'] ?? '';
    
    switch ($action) {
        case 'add':
            // Add new product
            $stmt = $db->prepare('INSERT INTO drinks (name, price, description, image) VALUES (:name, :price, :description, :image)');
            $stmt->bindValue(':name', $_POST['name'], SQLITE3_TEXT);
            $stmt->bindValue(':price', $_POST['price'], SQLITE3_FLOAT);
            $stmt->bindValue(':description', $_POST['description'], SQLITE3_TEXT);
            $stmt->bindValue(':image', $_POST['image'] ?? '', SQLITE3_TEXT);
            
            if ($stmt->execute()) {
                echo json_encode(['status' => 'success', 'message' => 'Product added successfully']);
            } else {
                throw new Exception("Failed to add product");
            }
            break;

        case 'edit':
            // Edit existing product
            $stmt = $db->prepare('UPDATE drinks SET name = :name, price = :price, description = :description, image = :image WHERE id = :id');
            $stmt->bindValue(':id', $_POST['id'], SQLITE3_INTEGER);
            $stmt->bindValue(':name', $_POST['name'], SQLITE3_TEXT);
            $stmt->bindValue(':price', $_POST['price'], SQLITE3_FLOAT);
            $stmt->bindValue(':description', $_POST['description'], SQLITE3_TEXT);
            $stmt->bindValue(':image', $_POST['image'] ?? '', SQLITE3_TEXT);
            
            if ($stmt->execute()) {
                echo json_encode(['status' => 'success', 'message' => 'Product updated successfully']);
            } else {
                throw new Exception("Failed to update product");
            }
            break;

        case 'delete':
            // Delete product
            $stmt = $db->prepare('DELETE FROM drinks WHERE id = :id');
            $stmt->bindValue(':id', $_POST['id'], SQLITE3_INTEGER);
            
            if ($stmt->execute()) {
                echo json_encode(['status' => 'success', 'message' => 'Product deleted successfully']);
            } else {
                throw new Exception("Failed to delete product");
            }
            break;

        default:
            throw new Exception("Invalid action specified");
    }

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