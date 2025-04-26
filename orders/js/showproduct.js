let orderList = document.getElementById("orderList");
let treecoffee = [];
async function showOrder() {
    try {
        const response = await fetch("js/drinks/drinks-list.json");
        if (!response.ok) {
            throw new Error("Network response was not ok.");
        }
        const data = await response.json(); // Check your drinks data

        // Clear previous list (optional)
        orderList.innerHTML = "";

        // Loop through each drink and create a card/item
        data.forEach(item => {
            treecoffee.push(item);
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
showOrder();
function searchEngine(searchKey) {
    let filter = searchKey.toLowerCase();
    let items = ``;
    orderList.innerHTML = ""; // Clear previous list
    treecoffee.forEach(item => {
        if (item.name.toLowerCase().includes(filter)) {
            items += `
                <div class="order-list-item fade-in" data-name="${item.name.toLowerCase()}">
                <img src="${item.image || "https://vinut.com.vn/wp-content/webp-express/webp-images/doc-root/wp-content/uploads/2023/12/how-to-make-a-macchiato-the-classic-way-6572e3d759e13.jpeg.webp"}" alt="${item.name}" loading="lazy" class="order-list-image">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <p>Price: ${item.price}$</p>
                <button class="order-button" data-item='${JSON.stringify(item)}' onclick="addtocart(this)">Order Now</button>
                </div>
            `;

            orderList.innerHTML = items;
        }
    }
)
}
const searchInput = document.getElementById("searchBox").addEventListener("click", function() {
    const searchKey = this.value.trim(); // Get the value from the input field
    searchEngine(searchKey); // Call the search function with the input value
});