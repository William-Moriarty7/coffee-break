let orderList = document.getElementById("orderList");
let treecoffee = [];

async function showOrder() {
    try {
        const response = await fetch("db/get-drinks.php");
        if (!response.ok) {
            throw new Error("Network response was not ok.");
        }
        const data = await response.json();

        // Clear previous list
        orderList.innerHTML = "";
        treecoffee = data;

        // Loop through each drink and create a card/item
        data.forEach(item => {
            const listItem = document.createElement('div');
            listItem.className = 'order-list-item fade-in';
            listItem.setAttribute('data-name', item.name.toLowerCase());
            listItem.innerHTML = `
                <img src="${item.image || "https://vinut.com.vn/wp-content/webp-express/webp-images/doc-root/wp-content/uploads/2023/12/how-to-make-a-macchiato-the-classic-way-6572e3d759e13.jpeg.webp"}" alt="${item.name}" loading="lazy" class="order-list-image">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <p>Price: ${item.price}$</p>
                <button class="order-button" data-item='${JSON.stringify(item)}' onclick="addtocart(this)">Order Now</button>
            `;
            orderList.appendChild(listItem);
        });

    } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
    }
}

async function searchEngine(searchKey) {
    try {
        const response = await fetch(`../db/get-drinks.php?search=${encodeURIComponent(searchKey)}`);
        if (!response.ok) {
            throw new Error("Network response was not ok.");
        }
        const drinks = await response.json();
        
        orderList.innerHTML = ""; // Clear previous list
        treecoffee = drinks;
        
        drinks.forEach(item => {
            const listItem = document.createElement('div');
            listItem.className = 'order-list-item fade-in';
            listItem.setAttribute('data-name', item.name.toLowerCase());
            listItem.innerHTML = `
                <img src="${item.image || "https://vinut.com.vn/wp-content/webp-express/webp-images/doc-root/wp-content/uploads/2023/12/how-to-make-a-macchiato-the-classic-way-6572e3d759e13.jpeg.webp"}" alt="${item.name}" loading="lazy" class="order-list-image">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <p>Price: ${item.price}$</p>
                <button class="order-button" data-item='${JSON.stringify(item)}' onclick="addtocart(this)">Order Now</button>
            `;
            orderList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error searching drinks:", error);
    }
}

// Initialize the page
showOrder();

// Add search event listener
const searchInput = document.getElementById("searchBox");
searchInput.addEventListener("input", function() {
    const searchKey = this.value.trim();
    searchEngine(searchKey);
});