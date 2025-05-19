<?php
$db = new SQLite3("../../casher/casher.db");

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

if($_SERVER['REQUEST_METHOD'] === "POST") {
    if(isset($_POST['status']) && $_POST['status'] === 'customers') {
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
    else if(isset($_POST['get_Recent_Orders'])) {
        $stmt = $db->prepare('SELECT * FROM casher ORDER BY id DESC LIMIT 5');
        $result = $stmt->execute();
        $data = [];

        while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
            $data[] = [
                'order_id' => $row['random_key'],
                'customer_name' => $row['username'],
                'items_count' => count(explode(',', $row['cartorder'])),
                'total' => $row['full_price'],
                'status' => $row['state'],
                'state' => $row['state'],
                'created_at' => $row['created_at'],
                'cartorder' => $row['cartorder'],
                'random_key' => $row['random_key']
            ];
        }

        echo json_encode($data);
    }
}
?>