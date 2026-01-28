# File Organization Plan

## Current Structure Issues
- All files scattered in root directory
- Test files mixed with production files
- Documentation files mixed with code
- CSS and JS files not organized
- Hard to maintain and navigate

## Proposed New Structure

```
project-root/
├── assets/                 # Static assets
│   ├── images/
│   │   └── logo.jpg
│   └── icons/
├── css/                    # Stylesheets
│   ├── main.css           # Renamed from style (1).css
│   └── owner-portal.css
├── js/                     # JavaScript files
│   ├── main.js            # Renamed from script (12).js
│   ├── api-service.js
│   └── owner-portal.js
├── pages/                  # HTML pages (organized)
│   ├── main/              # Main website pages
│   │   ├── index.html
│   │   ├── about.html
│   │   ├── contact.html
│   │   ├── products.html
│   │   ├── product-detail.html
│   │   ├── payment.html
│   │   ├── order-details.html
│   │   └── track-order.html
│   └── owner/             # Owner portal pages
│       ├── owner.html
│       └── owner-login-debug.html
├── tests/                  # All test files
│   ├── api/
│   ├── functionality/
│   ├── integration/
│   └── realtime/
├── docs/                   # Documentation
│   ├── setup/
│   ├── guides/
│   └── fixes/
├── config/                 # Configuration (existing)
├── models/                 # Database models (existing)
├── routes/                 # API routes (existing)
├── node_modules/          # Dependencies (existing)
├── .env                   # Environment variables
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── server.js              # Main server file
└── README.md
```

## Migration Steps

### Phase 1: Create Directories
- Create new folder structure
- Ensure no conflicts with existing files

### Phase 2: Move Static Assets
- Move logo.jpg to assets/images/
- Move CSS files to css/
- Move JS files to js/

### Phase 3: Organize HTML Pages
- Move main website pages to pages/main/
- Move owner portal pages to pages/owner/
- Update all internal links and references

### Phase 4: Organize Test Files
- Move all test-*.html files to tests/
- Organize by category (api, functionality, etc.)

### Phase 5: Organize Documentation
- Move all .md files to docs/
- Organize by category (setup, guides, fixes)

### Phase 6: Update References
- Update server.js static file serving
- Update HTML file references to CSS/JS
- Update any hardcoded paths

## Files to Move

### Assets
- logo.jpg → assets/images/logo.jpg

### CSS
- style (1).css → css/main.css
- owner-portal.css → css/owner-portal.css

### JavaScript
- script (12).js → js/main.js
- api-service.js → js/api-service.js
- owner-portal.js → js/owner-portal.js
- owner-portal-fixed.js → js/owner-portal-fixed.js (backup)

### Main Pages
- index.html → pages/main/index.html
- about.html → pages/main/about.html
- contact.html → pages/main/contact.html
- products.html → pages/main/products.html
- product-detail.html → pages/main/product-detail.html
- payment.html → pages/main/payment.html
- order-details.html → pages/main/order-details.html
- track-order.html → pages/main/track-order.html
- working-buy-now.html → pages/main/working-buy-now.html

### Owner Portal Pages
- owner.html → pages/owner/owner.html
- owner-login-debug.html → pages/owner/owner-login-debug.html
- owner-simple.html → pages/owner/owner-simple.html
- owner-working.html → pages/owner/owner-working.html
- owner-working-final.html → pages/owner/owner-working-final.html
- owner-portal-quick-fix.html → pages/owner/owner-portal-quick-fix.html

### Test Files
All test-*.html files → tests/ (organized by category)

### Documentation
All .md files → docs/ (organized by category)

## Benefits After Organization

1. **Better Maintainability**: Easy to find and modify files
2. **Cleaner Structure**: Logical separation of concerns
3. **Easier Development**: Clear file organization
4. **Better Collaboration**: Team members can navigate easily
5. **Scalability**: Easy to add new features and files
6. **Professional Structure**: Industry-standard organization

## Implementation Notes

- All moves will preserve file content
- All internal references will be updated
- Server routing will be updated to handle new structure
- No functionality will be broken
- Backup of current structure will be maintained