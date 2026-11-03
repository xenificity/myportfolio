# ajay-kumar.com

Personal site of Ajay Kumar. Plain HTML, CSS and JavaScript, no build step, hosted on GitHub Pages from the `main` branch (`CNAME` points the custom domain here).

## Files

| Path | What it is |
| --- | --- |
| `index.html` | The whole site. Every section is marked with a `<!-- ===== NAME ===== -->` comment. |
| `assets/css/site.css` | All styles. Colors live in the `:root` block at the top; dark mode overrides sit right below it. |
| `assets/js/site.js` | Terminal hero, dark-mode toggle, mobile menu, project/publication filters, contact form, talk map. |
| `assets/files/AjayKumar_CV.pdf` | The CV that the "CV" button and the `cv` terminal command open. Built from `~/Downloads/backuop/Jobs-and-CVs/CV/Current/Ajay_Kumar_CV_website_2026-11-03.tex`. |
| `assets/img/` | Photos and testimonial headshots. |
| `robots.txt`, `sitemap.xml` | For search engines. Bump `lastmod` in the sitemap when you make a big change. |

## Common edits

- **New paper**: copy one `<li class="pub">` block in the Publications list, set `data-tags` (`first`, `journal`, `conference`, `preprint`), and update the counts in `.scholar-row` and the `papers` command in `site.js`.
- **New project**: copy a `<article class="card proj">` block; `data-tags` drives the filter buttons (`research`, `ai`, `apps`, `oss`).
- **New update or news item**: add a `.update` row (newest first) or a `.news-card`.
- **Terminal commands**: the `COMMANDS` object in `site.js`. The intro types `whoami` and `cat now.md`; edit the `now` command to change what visitors see first.
- **Talk map pins**: the `stops` array in `site.js`.
- **Reviewing and service**: the `#service` section in `index.html` and the `service` command in `site.js`.
- **Search**: the page title, the `<h1>` under the terminal and the JSON-LD block in `<head>` are what target "Ajay Kumar computer scientist". Keep the wording consistent.

## Contact form

The form posts to the Formspree form "Portfolio contact" (`mbggqgyk`), which emails ajay.ducs@gmail.com. Manage it at formspree.io/forms. Analytics are at ajay-kumar.goatcounter.com.

## Preview locally

```bash
python3 -m http.server 8765
```

Then open http://localhost:8765.
