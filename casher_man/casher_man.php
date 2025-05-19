<?php
session_start();
header('Content-Type: application/json');

// Database connection
$db = new SQLite3('../casher/casher.db');

// Create necessary tables if they don't exist
// Create the table if it doesn't exist
$db->exec('CREATE TABLE IF NOT EXISTS casher (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    cartorder TEXT,
    full_price DECIMAL(10,2),
    random_key TEXT,
    state TEXT,
    created_at TEXT
)');

// Handle different operations
$action = $_GET['action'] ?? '';

switch($action) {
    case 'get_users':
        $stmt = $db->prepare('SELECT * FROM casher');
        $result = $stmt->execute();
        $users = [];
        while($row = $result->fetchArray(SQLITE3_ASSOC)) {
            $users[] = $row;
        }
        echo json_encode(['success' => true, 'users' => $users]);
        break;

    case 'update_mode':
        $user_id = $_GET['user_id'] ?? '';
        $new_mode = $_GET['status'] ?? '';
        
        if($user_id && $new_mode) {
            $stmt = $db->prepare('UPDATE casher SET state = :mode WHERE random_key = :id');
            $stmt->bindValue(':mode', $new_mode, SQLITE3_TEXT);
            $stmt->bindValue(':id', $user_id, SQLITE3_TEXT);
            
            if($stmt->execute()) {
                echo json_encode(['success' => true , 'message' => 'User Status updated']);
            } else {
                echo json_encode(['success' => false, 'error' => 'Failed to update mode']);
            }
        } else {
            echo json_encode(['success' => false, 'error' => 'Missing parameters']);
        }
        break;


    default:
        echo json_encode(['success' => false, 'error' => 'Invalid action']);
}

$db->close();
?> 