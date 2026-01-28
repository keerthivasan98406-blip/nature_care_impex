# Logo Update Guide

## Step 1: Upload New Logo
1. Upload your new logo image to Cloudinary or another image hosting service
2. Copy the new URL (it should look like: `https://res.cloudinary.com/your-cloud/image/upload/v123456789/new-logo.jpg`)

## Step 2: Replace Logo URLs
Replace the old logo URL:
`https://res.cloudinary.com/dy5kyfcw4/image/upload/v1767190433/photo_2025-12-31_22-10-18_k0jfc7.jpg`

With your new logo URL in these files:

### HTML Files:
- `index.html` (3 locations: navbar, og:image, schema.org)
- `products.html` (navbar)
- `product-detail.html` (navbar)
- `order-details.html` (2 locations: navbar, og:image)
- `payment.html` (2 locations: navbar, og:image)
- `track-order.html` (2 locations: navbar, og:image)
- `owner.html` (owner portal login)
- `html/track-order.html` (navbar)

### Search and Replace:
Use your code editor's "Find and Replace" feature:
- **Find:** `https://res.cloudinary.com/dy5kyfcw4/image/upload/v1767190433/photo_2025-12-31_22-10-18_k0jfc7.jpg`
- **Replace:** `YOUR_NEW_LOGO_URL_HERE`

## Files to Update:
1. index.html
2. products.html
3. product-detail.html
4. order-details.html
5. payment.html
6. track-order.html
7. owner.html
8. html/track-order.html

## Quick Update Script:
You can also use this PowerShell command to replace all at once:
```powershell
$oldUrl = "https://res.cloudinary.com/dy5kyfcw4/image/upload/v1767190433/photo_2025-12-31_22-10-18_k0jfc7.jpg"
$newUrl = "YOUR_NEW_LOGO_URL_HERE"

Get-ChildItem -Path . -Include "*.html" -Recurse | ForEach-Object {
    (Get-Content $_.FullName) -replace [regex]::Escape($oldUrl), $newUrl | Set-Content $_.FullName
}
```