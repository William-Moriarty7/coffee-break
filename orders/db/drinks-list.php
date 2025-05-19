<?php

// Create/connect to SQLite database
$db = new SQLite3('drinks-list.db');

// Create drinks table
$db->exec('CREATE TABLE IF NOT EXISTS drinks (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT NOT NULL,
    image TEXT
)');

// Read JSON file
$jsonData = file_get_contents('drinks-list.json');
$drinks = json_decode($jsonData, true);

// Prepare insert statement
$stmt = $db->prepare('INSERT OR REPLACE INTO drinks (id, name, price, description, image) 
                      VALUES (:id, :name, :price, :description, :image)');

// Insert each drink
foreach ($drinks as $drink) {
    $stmt->bindValue(':id', $drink['id'], SQLITE3_INTEGER);
    $stmt->bindValue(':name', $drink['name'], SQLITE3_TEXT);
    $stmt->bindValue(':price', $drink['price'], SQLITE3_FLOAT);
    $stmt->bindValue(':description', $drink['description'], SQLITE3_TEXT);
    $stmt->bindValue(':image', $drink['image'], SQLITE3_TEXT);
    
    $stmt->execute();
}

echo "Database created and populated successfully!";

// Close database connection
$db->close();

?>