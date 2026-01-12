# Deployment Guide for www.edubasic.net

## Quick Start

```bash
npm run build:prod
```

This will create a production build in `dist/edu-basic/browser/` that is ready for deployment.

## Deployment to GoDaddy cPanel

### 1. Build the Application

From the project root:

```bash
npm run build:prod
```

This command:
- Builds the Grit audio worklet (minified)
- Builds the Angular application for production
- Outputs to `dist/edu-basic/browser/`

### 2. Upload Files

Upload the **contents** of `dist/edu-basic/browser/` to GoDaddy's `public_html/` directory.

**Critical:** Upload the contents, not the folder itself. The structure should be:

```
public_html/
  .htaccess          ← Included in build output
  index.html         ← Must be at this level
  main-*.js
  polyfills-*.js
  styles-*.css
  grit-worklet.js
  favicon.ico
  assets/
    fonts/
```

### 3. Upload Methods

**Option A – cPanel File Manager:**
1. Log into GoDaddy cPanel
2. Open File Manager
3. Navigate to `public_html/`
4. Delete any existing files (except `.htaccess` if you want to preserve it)
5. Upload all files from `dist/edu-basic/browser/`

**Option B – FTP:**
- Host: `edubasic.net`
- Upload directory: `public_html/`
- Upload contents of `dist/edu-basic/browser/`

### 4. Verify Deployment

After uploading, verify the site works correctly:

1. Visit `http://edubasic.net` → should redirect to `https://www.edubasic.net`
2. Visit `https://edubasic.net` → should redirect to `https://www.edubasic.net`
3. Open browser DevTools → Network tab:
   - All assets should load via HTTPS
   - No mixed-content warnings
4. Test Angular routing by refreshing on a deep route (if any exist)

## Build Output Details

- **Output directory:** `dist/edu-basic/browser/`
- **Worklet file:** `grit-worklet.js` (audio synthesis processor)
- **Apache config:** `.htaccess` (included in build, forces HTTPS and www)
- **Assets:** Fonts copied from ng-luna package

## SSL Configuration

- SSL is managed by GoDaddy
- Certificate covers `www.edubasic.net`
- All traffic is automatically redirected to HTTPS with www subdomain
- The `.htaccess` file handles these redirects

## Troubleshooting

| Issue                 | Solution                                               |
|-----------------------|--------------------------------------------------------|
| Blank page            | Verify files are in `public_html/`, not a subdirectory |
| 404 on refresh.       | Ensure `.htaccess` was uploaded                        |
| Mixed content warning | Check for hardcoded `http://` URLs                     |
| Assets not loading    | Verify `baseHref` is "/" in build                      |

## Related Documentation

- [Full GoDaddy Deployment Instructions](docs/deploying_angular_static_site_to_go_daddy_c_panel_edubasic.md)
