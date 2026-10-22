/* ajay-kumar.com — site behaviour. Vanilla JS, no build step. */
(function () {
  "use strict";

  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- theme ---------- */
  const root = document.documentElement;
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") root.dataset.theme = saved;
  } catch (e) {}
  $("#theme-btn").addEventListener("click", () => {
    const dark = root.dataset.theme
      ? root.dataset.theme === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
  });

  /* ---------- nav ---------- */
  const nav = $(".nav");
  const links = $("#nav-links");
  $("#nav-toggle").addEventListener("click", () => {
    const open = links.classList.toggle("open");
    $("#nav-toggle").setAttribute("aria-expanded", String(open));
  });
  links.addEventListener("click", (e) => { if (e.target.tagName === "A") links.classList.remove("open"); });
  const sections = $$("main section[id]");
  const navAnchors = $$("#nav-links a");
  const onScroll = () => {
    nav.classList.toggle("scrolled", window.scrollY > 8);
    let current = "";
    for (const s of sections) if (s.getBoundingClientRect().top <= 120) current = s.id;
    navAnchors.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + current));
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- reveal on scroll ---------- */
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    $$(".reveal").forEach((el) => io.observe(el));
  } else {
    $$(".reveal").forEach((el) => el.classList.add("in"));
  }

  /* ---------- filters (projects + publications) ---------- */
  $$("[data-filter-group]").forEach((group) => {
    const target = group.dataset.filterGroup;
    const items = $$(target);
    group.addEventListener("click", (e) => {
      const btn = e.target.closest("button"); if (!btn) return;
      $$("button", group).forEach((b) => b.classList.toggle("active", b === btn));
      const f = btn.dataset.filter;
      items.forEach((it) => { it.hidden = !(f === "all" || (it.dataset.tags || "").split(" ").includes(f)); });
    });
  });

  /* ---------- contact form ---------- */
  const form = $("#contact-form");
  if (form) {
    const status = $(".status", form);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const action = form.getAttribute("action") || "";
      const name = data.get("name"), email = data.get("email"), subject = data.get("subject"), message = data.get("message");
      // Until a form endpoint is configured, hand the message to the visitor's mail app.
      if (!action || action.includes("YOUR_FORM_ID")) {
        const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
        window.location.href = `mailto:${form.dataset.to}?subject=${encodeURIComponent(subject)}&body=${body}`;
        status.textContent = "Opening your mail app…";
        return;
      }
      status.textContent = "Sending…";
      try {
        const r = await fetch(action, { method: "POST", body: data, headers: { Accept: "application/json" } });
        if (r.ok) { form.reset(); status.textContent = "Sent. I will reply within a day or two."; }
        else throw new Error("bad status");
      } catch (err) {
        status.textContent = "Could not send. Please email me directly at " + form.dataset.to;
      }
    });
  }

  /* ---------- talk map ---------- */
  const mapEl = $("#talk-map");
  if (mapEl && window.L) {
    const map = L.map(mapEl, { scrollWheelZoom: false, worldCopyJump: true }).setView([35, -40], 2);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 12,
    }).addTo(map);
    const icon = L.divIcon({ className: "", html: '<div class="map-pin"></div>', iconSize: [14, 14], iconAnchor: [7, 7] });
    const stops = [
      [40.015, -105.27, "Boulder, CO", "IEEE IISWC 2026 · paper talk"],
      [39.95, -75.165, "Philadelphia, PA", "ACM BCB 2025 · paper talk"],
      [43.615, -116.2, "Boise, ID", "ACM CIKM 2024 · demo"],
      [45.764, 4.835, "Lyon, France", "ISMB/ECCB 2023 · G2PDeep tutorial"],
      [40.35, -74.66, "Princeton, NJ", "Siemens Technology · 2026"],
      [38.94, -92.33, "Columbia, MO", "University of Missouri · NSF workshop 2026"],
      [17.385, 78.486, "Hyderabad, India", "IRRI South Asia Hub · trained 100+ scientists"],
      [28.61, 77.21, "New Delhi, India", "University of Delhi · DIC-SPA"],
      [25.27, 82.99, "Varanasi, India", "Banaras Hindu University · M.Sc."],
    ];
    stops.forEach(([lat, lng, place, what]) => {
      L.marker([lat, lng], { icon }).addTo(map).bindPopup(`<b>${place}</b><br>${what}`);
    });
  }

  /* ---------- terminal ---------- */
  const body = $("#term-body");
  const input = $("#term-input");
  if (!body || !input) return;

  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const out = (html, cls) => {
    const d = document.createElement("div");
    d.className = "t-out" + (cls ? " " + cls : "");
    d.innerHTML = html;
    body.insertBefore(d, $("#term-live"));
    body.scrollTop = body.scrollHeight;
    return d;
  };
  const promptLine = (cmd) => {
    const d = document.createElement("div");
    d.className = "t-line";
    d.innerHTML = `<span class="t-prompt">ajay@portfolio<b>:~$</b></span> ${esc(cmd)}`;
    body.insertBefore(d, $("#term-live"));
    return d;
  };

  const kv = (pairs) => `<dl class="t-kv">${pairs.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl>`;
  const link = (href, text) => `<a href="${href}"${href.startsWith("http") ? ' target="_blank" rel="noopener"' : ""}>${text}</a>`;

  const COMMANDS = {
    help: () => `<span class="t-dim"># things you can type</span>\n` + kv([
      ["about", "who I am, in four lines"],
      ["now", "what I am working on this month"],
      ["papers", "publications, newest first"],
      ["projects", "selected projects and apps"],
      ["skills", "the stack I actually use"],
      ["teaching", "courses and workshops"],
      ["awards", "fellowships and prizes"],
      ["news", "press and recent updates"],
      ["contact", "email, calendar, socials"],
      ["hire", "what I am looking for"],
      ["cv", "download the PDF"],
      ["clear", "wipe the screen"],
    ]),
    about: () => `Ajay Kumar. Ph.D. candidate in computer science at the University of Missouri (4.0 GPA), defending December 2026.
I make large scientific workloads run faster and cheaper on clusters, and I build evaluation systems that tell you when an LLM pipeline is wrong.
Currently a research intern in Siemens' Foundational Technology AI group in Princeton, NJ.
Before the Ph.D.: statistical genomics at the International Rice Research Institute, where I trained 100+ scientists.`,
    now: () => kv([
      ["siemens", "validation framework for agentic LLM pipelines · 2 invention disclosures · paper under review at CAIN 2027"],
      ["thesis", "optimizing scientific workflows on NSF cyberinfrastructure (FABRIC, CloudLab) · defense Dec 2026"],
      ["latest", "DeepNeuroBench presented at IEEE IISWC 2026, Boulder · 72% less energy per subject at 10% of the cost"],
      ["seeking", "Applied Scientist · Research Scientist · ML Engineer roles, starting 2027"],
    ]),
    papers: () => [
      ["2026", "DeepNeuroBench: cost- and energy-efficient neuroimaging workflows", "IEEE IISWC", "first author"],
      ["2026", "Layer-boundary validation for a production LLM pipeline (Siemens)", "CAIN @ ICSE 2027", "under review"],
      ["2025", "GPU-enabled variant calling on human genomes", "ACM BCB", "first author"],
      ["2025", "VariantKG: knowledge graphs + graph ML over 650 GB of variants", "Frontiers in Big Data", ""],
      ["2024", "Democratizing variant calling on commodity clusters", "ACM CIKM demo", ""],
      ["2024", "Et-GWAS: rare variants in the 3,000 rice genome", "Life Science Alliance", ""],
      ["2023", "DeepMap: four-line deep learning for crop breeding", "bioRxiv", ""],
    ].map(([y, t, v, n]) => `<span class="t-amber">${y}</span>  ${t}  <span class="t-dim">· ${v}${n ? " · " + n : ""}</span>`).join("\n")
      + `\n\n${link("#research", "→ full list with abstracts")}`,
    projects: () => kv([
      ["deepneurobench", "benchmark for neuroimaging pipelines on commodity clusters (IISWC 2026)"],
      ["gpu-gaf", "distributed multi-GPU variant calling, 2× throughput via job-shop scheduling"],
      ["variantkg", "1,508 genomes → 4 billion RDF statements, queryable with SPARQL"],
      ["g2pdeep-v2", "multi-omics deep learning platform used by 120+ researchers"],
      ["lameness-predictor", "1st place, Claude Builder Club Hackathon · live Streamlit app"],
      ["operation-fit", "iOS fitness planner, on the App Store · SwiftUI, on-device AI"],
    ]) + `\n${link("#projects", "→ all projects")}`,
    skills: () => kv([
      ["llms", "fine-tuning, RAG, agentic pipelines, evaluation and validation, Hugging Face"],
      ["ml", "PyTorch, TensorFlow/Keras, scikit-learn, graph ML"],
      ["systems", "Slurm, Docker, Kubernetes, FABRIC, CloudLab, AWS, multi-GPU training/inference"],
      ["data", "Python, SQL, R, Spark, Pandas, RDF/SPARQL, knowledge graphs"],
      ["also", "SwiftUI (three iOS apps), Django/Flask, Nextflow"],
    ]),
    teaching: () => kv([
      ["CS 4080", "Parallel Programming for HPC"],
      ["CS 3910", "Advanced Cybersecurity"],
      ["CMP_SC 1300", "Computing with Data in Python"],
      ["CS/ECE 4001", "Integrated Cyberinfrastructure & Biomedical Engineering"],
      ["award", "Outstanding Teaching Assistant, University of Missouri"],
      ["workshops", "100+ scientists trained at IRRI · NSF Scientific Workflows workshop organizer, 2026"],
    ]),
    awards: () => kv([
      ["$5,500", "FABRIC competitive travel fellowship"],
      ["$2,500", "ACM UPE Executive Council Award (as chapter VP)"],
      ["$1,500", "IEEE IISWC 2026 travel award"],
      ["$500", "UPE Outstanding Chapter Award"],
      ["1st place", "Claude Builder Club Hackathon, Mizzou"],
      ["award", "Outstanding Teaching Assistant · Outstanding Ph.D. Student"],
    ]),
    news: () => `<span class="t-amber">Feb 2026</span>  Mizzou Engineering: "Computer science students take on neuroscience"\n<span class="t-amber">Jan 2025</span>  Mizzou Engineering: "Increasing access to cybertraining technology"\n\n${link("#news", "→ press and updates")}`,
    contact: () => kv([
      ["email", link("mailto:ajay.ducs@gmail.com", "ajay.ducs@gmail.com")],
      ["academic", link("mailto:ajay.kumar@missouri.edu", "ajay.kumar@missouri.edu")],
      ["calendar", link("https://calendly.com/ajay-ducs/30min", "calendly.com/ajay-ducs/30min")],
      ["linkedin", link("https://www.linkedin.com/in/xenificity/", "linkedin.com/in/xenificity")],
      ["github", link("https://github.com/xenificity", "github.com/xenificity")],
      ["scholar", link("https://scholar.google.com/citations?user=lVXFrj0AAAAJ", "Google Scholar")],
    ]),
    hire: () => `I am looking for <span class="t-green">Applied Scientist, Research Scientist and ML Engineer</span> roles starting in 2027, after my December 2026 defense.
Strongest fit: LLM evaluation and validation, agentic systems, distributed ML infrastructure, scientific computing.
Open to on-site, hybrid or remote in the US. I will need H-1B sponsorship.
\n${link("#contact", "→ get in touch")}  ·  ${link("assets/files/AjayKumar_CV.pdf", "→ CV (PDF)")}`,
    cv: () => { window.open("assets/files/AjayKumar_CV.pdf", "_blank"); return `Opening ${link("assets/files/AjayKumar_CV.pdf", "AjayKumar_CV.pdf")}…`; },
    whoami: () => "ajay — Ph.D. candidate, builder, occasional podcast host",
    pwd: () => "/home/ajay/portfolio",
    ls: () => `about/  research/  projects/  teaching/  news/  contact/  <span class="t-green">AjayKumar_CV.pdf</span>`,
    date: () => new Date().toString(),
    sudo: () => `<span class="t-amber">ajay is not in the sudoers file. This incident will be reported.</span> (Just kidding. Try <b>hire</b>.)`,
    clear: () => { $$(".t-out, .t-line", body).forEach((n) => n.remove()); return null; },
  };
  COMMANDS.publications = COMMANDS.papers;
  COMMANDS.work = COMMANDS.projects;
  COMMANDS.email = COMMANDS.contact;
  COMMANDS.resume = COMMANDS.cv;
  COMMANDS["?"] = COMMANDS.help;

  const history = []; let hIdx = -1;
  const run = (raw) => {
    const cmd = raw.trim();
    if (!cmd) return;
    promptLine(cmd);
    history.unshift(cmd); hIdx = -1;
    const [name, ...rest] = cmd.toLowerCase().split(/\s+/);
    if (name === "cd" || name === "open" || name === "goto") {
      const sec = (rest[0] || "").replace(/^#|\/$/g, "");
      const target = document.getElementById(sec);
      if (target) { out(`→ ${sec}`); target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }); }
      else out(`<span class="t-amber">no such section: ${esc(sec)}</span>  (try: about, research, projects, teaching, news, contact)`);
      return;
    }
    if (name === "echo") { out(esc(rest.join(" "))); return; }
    const fn = COMMANDS[name];
    if (fn) { const r = fn(rest); if (r != null) out(r); }
    else out(`<span class="t-amber">command not found: ${esc(name)}</span>  — type <b>help</b>`);
  };

  // Typing animation for the intro, then hand over to the visitor.
  const typeCmd = (cmd) => new Promise((res) => {
    const line = promptLine("");
    if (reduceMotion) { line.innerHTML = `<span class="t-prompt">ajay@portfolio<b>:~$</b></span> ${esc(cmd)}`; return res(); }
    let i = 0;
    const tick = () => {
      line.innerHTML = `<span class="t-prompt">ajay@portfolio<b>:~$</b></span> ${esc(cmd.slice(0, i))}<span class="t-cursor"></span>`;
      if (i++ < cmd.length) setTimeout(tick, 38 + Math.random() * 50);
      else { line.innerHTML = `<span class="t-prompt">ajay@portfolio<b>:~$</b></span> ${esc(cmd)}`; setTimeout(res, 180); }
    };
    tick();
  });
  const wait = (ms) => new Promise((r) => setTimeout(r, reduceMotion ? 0 : ms));

  (async () => {
    $("#term-live").hidden = true;
    await typeCmd("whoami");
    out(`<div class="t-name">Ajay Kumar</div><div class="t-tag"># Ph.D. candidate · distributed systems × genomics × LLM evaluation · Siemens research intern</div>`);
    await wait(300);
    await typeCmd("cat now.md");
    out(COMMANDS.now());
    await wait(200);
    out(`<span class="t-dim">type <b>help</b> to explore, or just scroll.</span>`, "t-hint");
    $("#term-live").hidden = false;
  })();

  body.addEventListener("click", (e) => { if (!e.target.closest("a, button")) input.focus({ preventScroll: true }); });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { run(input.value); input.value = ""; }
    else if (e.key === "ArrowUp") { e.preventDefault(); if (history[hIdx + 1] != null) input.value = history[++hIdx]; }
    else if (e.key === "ArrowDown") { e.preventDefault(); hIdx = Math.max(-1, hIdx - 1); input.value = hIdx === -1 ? "" : history[hIdx]; }
    else if (e.key === "Tab") {
      e.preventDefault();
      const m = Object.keys(COMMANDS).filter((k) => k.startsWith(input.value.toLowerCase()));
      if (m.length === 1) input.value = m[0];
    } else if (e.key === "l" && e.ctrlKey) { e.preventDefault(); COMMANDS.clear(); }
  });
  $$(".t-chips button").forEach((b) => b.addEventListener("click", () => { run(b.dataset.cmd); input.focus({ preventScroll: true }); }));
})();
