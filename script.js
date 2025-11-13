// Fake frontend-only e-commerce app using localStorage

// Initialize data
if(!localStorage.users) localStorage.users = JSON.stringify([]);
if(!localStorage.products) localStorage.products = JSON.stringify([]);
if(!localStorage.orders) localStorage.orders = JSON.stringify([]);

// Helper functions
function getUsers(){ return JSON.parse(localStorage.users); }
function getProducts(){ return JSON.parse(localStorage.products); }
function getOrders(){ return JSON.parse(localStorage.orders); }
function saveUsers(users){ localStorage.users = JSON.stringify(users); }
function saveProducts(products){ localStorage.products = JSON.stringify(products); }
function saveOrders(orders){ localStorage.orders = JSON.stringify(orders); }
function setCurrentUser(user){ localStorage.currentUser = JSON.stringify(user); }
function getCurrentUser(){ return JSON.parse(localStorage.currentUser||'null'); }
function logout(){ localStorage.removeItem('currentUser'); window.location='login.html'; }

// Registration
function register(event){
    event.preventDefault();
    let name=document.getElementById('name').value;
    let email=document.getElementById('email').value;
    let password=document.getElementById('password').value;
    let users=getUsers();
    if(users.find(u=>u.email===email)){ alert('Email already registered'); return; }
    users.push({name,email,password,role:'user'});
    saveUsers(users);
    alert('Registered successfully! Please login');
    window.location='login.html';
}

// Login
function login(event){
    event.preventDefault();
    let email=document.getElementById('email').value;
    let password=document.getElementById('password').value;
    let users=getUsers();
    let user = users.find(u=>u.email===email && u.password===password);
    if(!user){ alert('Invalid credentials'); return; }
    setCurrentUser(user);
    if(user.role==='admin') window.location='admin.html'; else window.location='index.html';
}

// Load products
function loadProducts(){
    let container=document.getElementById('products');
    container.innerHTML='';
    let products=getProducts();
    products.forEach(p=>{
        container.innerHTML+=`<div class="product">
            <img src="${p.image}" alt="${p.name}">
            <h3>${p.name}</h3>
            <p>$${p.price.toFixed(2)}</p>
            <button class="btn" onclick="addToCart(${p.id})">Add to Cart</button>
        </div>`;
    });
}

// Cart functions
function getCart(){ return JSON.parse(localStorage.cart||'[]'); }
function saveCart(cart){ localStorage.cart = JSON.stringify(cart); }
function addToCart(productId){
    let user=getCurrentUser(); if(!user){ alert('Login first'); return; }
    let cart=getCart();
    let item=cart.find(c=>c.user===user.email && c.productId===productId);
    if(item) item.qty++; else cart.push({user:user.email, productId, qty:1});
    saveCart(cart);
    alert('Added to cart!');
}
function loadCart(){
    let container=document.getElementById('cart-items');
    container.innerHTML='';
    let cart=getCart().filter(c=>c.user===getCurrentUser().email);
    let products=getProducts();
    let total=0;
    cart.forEach(c=>{
        let p=products.find(pr=>pr.id===c.productId);
        let subtotal=p.price*c.qty; total+=subtotal;
        container.innerHTML+=`<div>${p.name} - $${p.price.toFixed(2)} x ${c.qty} = $${subtotal.toFixed(2)}</div>`;
    });
    container.innerHTML+=`<h3>Total: $${total.toFixed(2)}</h3>`;
}
function checkout(){
    let cart=getCart().filter(c=>c.user===getCurrentUser().email);
    if(cart.length===0){ alert('Cart empty'); return; }
    let card=document.getElementById('card').value.trim();
    let cvv=document.getElementById('cvv').value.trim();
    if(card.length!==16 || cvv.length!==3){ alert('Invalid card details'); return; }
    let orders=getOrders();
    orders.push({user:getCurrentUser().email, items:cart, total:cart.reduce((a,c)=>a+getProducts().find(p=>p.id===c.productId).price*c.qty,0), status:'Pending'});
    saveOrders(orders);
    localStorage.cart=JSON.stringify(getCart().filter(c=>c.user!==getCurrentUser().email));
    alert('Order placed! Fake email sent.');
    window.location='index.html';
}

// Admin functions
function loadAdminProducts(){
    let container=document.getElementById('admin-products');
    container.innerHTML='';
    getProducts().forEach(p=>{ container.innerHTML+=`<div>${p.name} - $${p.price.toFixed(2)}</div>`; }); 
}
function addProduct(event){
    event.preventDefault();
    let name=document.getElementById('pname').value;
    let price=parseFloat(document.getElementById('pprice').value);
    let image=document.getElementById('pimage').value;
    let products=getProducts();
    let id=products.length>0?products[products.length-1].id+1:1;
    products.push({id,name,price,image});
    saveProducts(products);
    loadAdminProducts();
    alert('Product added!');
}
function loadOrders(){
    let container=document.getElementById('orders');
    container.innerHTML='';
    getOrders().forEach((o,i)=>{
        container.innerHTML+=`<div>Order ${i+1}: User ${o.user}, Total: $${o.total.toFixed(2)}, Status: ${o.status}</div>`;
    });
}
