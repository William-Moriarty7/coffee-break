<?php
$db = new SQLite3("../../casher/casher.db");

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

if($_SERVER['REQUEST_METHOD'] === "POST" && $_POST['status'] === 'customers'){
    $stmt = $db->prepare('SELECT * FROM casher ORDER BY id DESC LIMIT 5');
    $result = $stmt->execute();
    $data = [];

    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $data[] = $row;
    }

    echo json_encode([
        'status'=> 'success',
        'data'=> $data
    ]);
}

?>