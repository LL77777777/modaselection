# Moda Selection

Static affiliate curation website for `modaselection.com`.

Editorial positioning:

Moda Selection should lead with useful content first for a primarily female audience: outfit formulas, styling tips, beauty routine advice, shoe care, smart daily tech, buying notes, and common shopping mistakes. Product links should appear as a natural next step inside helpful articles, not as the main reason the page exists.

Public contact email:

```text
info@modaselection.com
```

## Local Preview

Run a small local server so the JSON offer files can load. VS Code Live Server, Cloudflare Pages preview, or any static server will work.

On Windows PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\preview.ps1
```

Then visit `http://localhost:8787`.

If Python is installed:

```powershell
python -m http.server 8787
```

Then visit `http://localhost:8787`.

## Cloudflare Pages

Recommended Pages settings:

- Framework preset: `None`
- Build command: leave empty
- Build output directory: `/`
- Production branch: your main branch

After deployment, add `modaselection.com` as a custom domain in Cloudflare Pages.

## Compliance Pages

The site includes:

- `disclosure.html`
- `privacy.html`
- `terms.html`
- `contact.html`

These pages provide a practical baseline for an affiliate content site. Review them with qualified counsel if you need jurisdiction-specific legal compliance.

## Product Links

Edit `data/offers.json`.

The top-level key is the public offer path. For example:

```json
"wireless-earbuds-guide-pick": {
  "url": "https://your-affiliate-link.example/deal"
}
```

That creates a site link of:

```text
https://modaselection.com/wireless-earbuds-guide-pick
```

When a visitor opens that path on Cloudflare Pages, `redirect.html` reads `data/offers.json` and redirects to the configured affiliate URL. The affiliate network should see the referring page as the clean offer path.

Current homepage categories:

- `electronics`
- `apparel`
- `shoes`
- `skincare`

## Images

Keep primary brand images inside `assets/` when possible.

Manage image keys in `data/images.json`, then reference those keys from `data/offers.json` with `imageKey`. Each image entry can use a local path such as `/assets/example.png` or a stable stock image URL. Use distinct keys for different offers so homepage cards do not repeat the same visual too often.

The homepage includes a visible affiliate disclosure. The FTC guidance for endorsements and online disclosures emphasizes clear and conspicuous disclosure of material connections.
