<?php
// casher.php

header('Content-Type: application/json');

// Connect to your database
$db = new SQLite3('casher.db');

// Create the table if it doesn't exist
$db->exec('CREATE TABLE IF NOT EXISTS casher (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    cartorder TEXT,
    full_price TEXT,
    random_key TEXT,
    state TEXT,
    created_at TEXT
)');

// Function to generate random key
function generateRandomKey($length = 15) {
    $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    $randomKey = '';
    for ($i = 0; $i < $length; $i++) {
        $randomKey .= $characters[random_int(0, strlen($characters) - 1)];
    }
    return $randomKey;
}

// Receive the POST data
$cartJson = $_POST['cart'] ?? '';
$userName = $_POST['userName'] ?? '';
$password_kay = $_POST['random_key'] ??'';
$full_price = $_POST['full_price'];

if (empty($cartJson) || empty($userName)) {
    echo json_encode([
        "status" => "error",
        "message" => "Missing cart data or username."
    ]);
    exit;
}

$cart = json_decode($cartJson, true);

if (!is_array($cart)) {
    echo json_encode([
        "status" => "error",
        "message" => "Invalid cart format."
    ]);
    exit;
}

// Prepare cartorder as a list of IDs
$cartOrderIds = [];
foreach ($cart as $item) {
    if (isset($item['id'])) {
        $cartOrderIds[] = $item['id'];
    }
}
$cartOrder = implode(',', $cartOrderIds);

// Generate random key
$randomKey = generateRandomKey();

function insertdata($db, $userName, $cartOrder, $randomKey,$full_price) {
    $stmt = $db->prepare('INSERT INTO casher (username, cartorder, full_price, random_key, state, created_at)
                          VALUES (:username, :cartorder, :full_price, :random_key, :state, :created_at)');
    $stmt->bindValue(':username', $userName, SQLITE3_TEXT);
    $stmt->bindValue(':cartorder', $cartOrder, SQLITE3_TEXT);
    $stmt->bindValue(':random_key', $randomKey, SQLITE3_TEXT);
    $stmt->bindValue(':state', 'pending', SQLITE3_TEXT);
    $stmt->bindValue(':full_price',$full_price, SQLITE3_TEXT); // Assuming full_price is 0 for now
    $stmt->bindValue(':created_at', date('Y-m-d H:i:s'), SQLITE3_TEXT);

    $result = $stmt->execute();
    return $result;
}

function readFromKey($db, $password_kay) {
    $stmt = $db->prepare('SELECT * FROM casher WHERE random_key = :random');
    $stmt->bindValue(':random', $password_kay, SQLITE3_TEXT);
    $result = $stmt->execute();
    $data = $result->fetchArray(SQLITE3_ASSOC);
    return $data;
}

try {

    if($password_kay != ''){
        echo json_encode([
            "status" => "progress",
            "message" => "Order already placed!",
            "data" => readFromKey($db, $password_kay)
        ]);
        exit;
    }else{
        if (insertdata($db, $userName, $cartOrder, $randomKey , $full_price)) {
        echo json_encode([
            "status" => "success",
            "message" => "Order placed successfully!",
            "random_key" => $randomKey
        ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "Failed to save order."
            ]);
        }
    }

    
} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Server error: " . $e->getMessage()
    ]);
}
?>
