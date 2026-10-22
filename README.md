# ajay-kumar.com

Personal site of Ajay Kumar. Plain HTML, CSS and JavaScript, no build step, hosted on GitHub Pages from the `main` branch (`CNAME` points the custom domain here).

## Files

| Path | What it is |
| --- | --- |
| `index.html` | The whole site. Every section is marked with a `<!-- ===== NAME ===== -->` comment. |
| `assets/css/site.css` | All styles. Colors live in the `:root` block at the top; dark mode overrides sit right below it. |
| `assets/js/site.js` | Terminal hero, dark-mode toggle, mobile menu, project/publication filters, contact form, talk map. |
| `assets/files/AjayKumar_CV.pdf` | The CV that the "CV" button and the `cv` terminal command open. Replace the file to update it. |
| `assets/img/` | Photos and testimonial headshots. |
| `robots.txt`, `sitemap.xml` | For search engines. Bump `lastmod` in the sitemap when you make a big change. |

## Common edits

- **New paper**: copy one `<li class="pub">` block in the Publications list, set `data-tags` (`first`, `journal`, `conference`, `preprint`), and update the counts in `.scholar-row` and the `papers` command in `site.js`.
- **New project**: copy a `<article class="card proj">` block; `data-tags` drives the filter buttons (`research`, `ai`, `apps`, `oss`).
- **New update or news item**: add a `.update` row (newest first) or a `.news-card`.
- **Terminal commands**: the `COMMANDS` object in `site.js`. The intro types `whoami` and `cat now.md`; edit the `now` command to change what visitors see first.
- **Talk map pins**: the `stops` array in `site.js`.

## Contact form

The form posts to Formspree. Create a free form at formspree.io, then replace `YOUR_FORM_ID` in the form's `action` attribute. Until then, submitting opens the visitor's mail app with the message prefilled, so nothing is lost.

## Preview locally

```bash
python3 -m http.server 8765
```

Then open http://localhost:8765.
