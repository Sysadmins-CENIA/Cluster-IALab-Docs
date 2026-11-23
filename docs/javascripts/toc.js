(function () {
  const content = document.querySelector(".rst-content");
  if (!content) return;

  const heads = content.querySelectorAll("h1, h2, h3");
  if (heads.length < 2) return;

  const toc = document.createElement("nav");
  toc.className = "page-toc";
  toc.innerHTML = '<p class="page-toc-title">En esta página</p>';
  const ul = document.createElement("ul");

  heads.forEach((h, i) => {
    if (!h.id) {
      const slug = h.textContent.trim().toLowerCase().replace(/[^\wáéíóúñü]+/g, "-");
      h.id = `sec-${i}-${slug}`;
    }
    const li = document.createElement("li");
    li.className = h.tagName === "H3" ? "lvl3" : "lvl2";
    const a = document.createElement("a");
    a.href = `#${h.id}`;
    a.textContent = h.textContent.replace("¶", "").trim();
    li.appendChild(a);
    ul.appendChild(li);
  });

  toc.appendChild(ul);
  document.body.appendChild(toc);

  // Marca la sección visible actual
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      ul.querySelectorAll("a").forEach(a => a.classList.remove("active"));
      const link = ul.querySelector(`a[href="#${e.target.id}"]`);
      if (link) link.classList.add("active");
    });
  }, { rootMargin: "0px 0px -70% 0px" });

  heads.forEach(h => io.observe(h));
})();