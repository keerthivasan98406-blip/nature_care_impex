import os
import re

files = [
    'index.html', 'about.html', 'contact.html', 'products.html', 
    'track-order.html', 'product-detail.html', 'order-details.html', 'payment.html'
]

for file in files:
    if not os.path.exists(file):
        continue
        
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Replace Navbar
    # We find the products.html link in the navLinks section
    nav_pattern = re.compile(r'(<li><a href="products\.html"[^>]*>Products</a></li>)')
    if 'href="gallery.html"' not in content: # Avoid double inserting
        content = nav_pattern.sub(r'\1\n                <li><a href="gallery.html" class="nav-link" onclick="closeNav()">Gallery</a></li>', content)
        
    # Replace Footer (there might be multiple footer-links lists, we just insert after products)
    footer_pattern = re.compile(r'(<li><a href="products\.html">Products</a></li>)')
    content = footer_pattern.sub(r'\1\n                        <li><a href="gallery.html">Gallery</a></li>', content)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
print("Updated all files!")
