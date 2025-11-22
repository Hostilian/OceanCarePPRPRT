document.addEventListener('DOMContentLoaded', () => {
    // Selects the container where products will be displayed on the products page
    const productList = document.getElementById('product-list');
    
    // Retrieves the saved cart items from localStorage, or initializes as an empty array if nothing is found
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

    // Selects various HTML elements related to the cart display
    const cartCount = document.getElementById('cart-count'); // Updates the cart item count in the header
    const cartTotal = document.getElementById('cart-total'); // Shows the total price of items in the cart
    const cartItemsContainer = document.getElementById('cart-items'); // Lists items in the cart on the cart page
    const checkoutButton = document.getElementById('checkout-button'); // Triggers checkout process

    // Function to render the products on the products page
    function renderProducts() {
        // Iterates over each product in the 'products' array (assumed to be dummy JSON data loaded separately)
        products.forEach(product => {
            // Creates a new div element to represent each product and adds a CSS class
            const productElement = document.createElement('div');
            productElement.classList.add('product');
            
            // Fills the div with product details: image, name, price, and an "Add to Cart" button
            productElement.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>$${product.price}</p>
                <button onclick="addToCart(${product.id})">Add to Cart</button>
            `;
            
            // Appends the new product element to the main product list container in the HTML
            productList.appendChild(productElement);
        });
    }

    // Function to add a selected product to the cart
    window.addToCart = function (productId) {
        // Finds the product in the dummy 'products' array by matching the given product ID
        const product = products.find(p => p.id === productId);
        
        // Adds the selected product to the cartItems array and updates the cart
        cartItems.push(product);
        updateCart();
        saveCart(); // Saves the updated cart to localStorage
    };

    // Function to save the current cart state to localStorage
    function saveCart() {
        // Converts the cartItems array to JSON and stores it in localStorage under 'cartItems'
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }

    // Function to update the cart's UI display
    function updateCart() {
        // Clears the current list of cart items displayed in the cart items container
        cartItemsContainer.innerHTML = '';
        
        // Initializes a total price variable for calculating the cart's total value
        let total = 0;
        
        // Iterates through each item in the cart
        cartItems.forEach((item, index) => {
            // Adds the item's price to the total price
            total += item.price;
            
            // Creates a new list item for the cart display and populates it with item name and price
            const li = document.createElement('li');
            li.textContent = `${item.name} - $${item.price}`;
            
            // Appends the new list item to the cart items container in the HTML
            cartItemsContainer.appendChild(li);
        });
        
        // Updates the cart count display in the header with the current number of items
        cartCount.textContent = cartItems.length;
        
        // Updates the cart total display in the cart page with the total price of all items
        cartTotal.textContent = total.toFixed(2);
    }

    // Event listener for the checkout button to simulate a checkout process
    checkoutButton?.addEventListener('click', () => {
        // Alerts the user that checkout is successful
        alert('Checkout successful');
        
        // Clears the cartItems array, effectively emptying the cart
        cartItems.length = 0;  
        
        // Updates the cart display and localStorage to reflect the emptied cart
        updateCart();
        saveCart(); // Saves the empty cart back to localStorage
    });

    // Initial call to update the cart's display upon loading the page, using any saved cart data
    updateCart();
    
    // Initial call to render the products on the page
    renderProducts();
});
