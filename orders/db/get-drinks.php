<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    $db = new SQLite3('drinks-list.db');
    
    $query = isset($_GET['search']) ? 
        "SELECT * FROM drinks WHERE name LIKE :search" : 
        "SELECT * FROM drinks";
    
    $stmt = $db->prepare($query);
    
    if (isset($_GET['search'])) {
        $search = '%' . $_GET['search'] . '%';
        $stmt->bindValue(':search', $search, SQLITE3_TEXT);
    }
    
    $result = $stmt->execute();
    $drinks = [];
    
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $drinks[] = $row;
    }
    
    echo json_encode($drinks);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
} finally {
    if (isset($db)) {
        $db->close();
    }
}
?> 