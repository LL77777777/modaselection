const header = document.querySelector("[data-header]");
const filterButtons = document.querySelectorAll("[data-filter]");
const filterLinks = document.querySelectorAll("[data-filter-link]");
const articleCarousel = document.querySelector("[data-products]");
const carouselPrev = document.querySelector("[data-carousel-prev]");
const carouselNext = document.querySelector("[data-carousel-next]");

let activeFilter = "all";

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "\"": "&quot;",
  "'": "&#039;"
}[character]));

const categoryKeys = {
  Style: "style",
  Beauty: "beauty",
  Shoes: "shoes",
  Gear: "gear"
};

const extraArticles = [
  {
    href: "/articles/best-wireless-earbuds",
    image: "/assets/article-wireless-earbuds.jpg",
    alt: "Unbranded wireless earbuds, charging case, phone, notebook and coffee on a pale wood desk",
    category: "Gear",
    title: "New earbuds? What to check before you upgrade",
    description: "Compare fit, controls, call quality, battery life, repair limits, and the routines a new pair would actually improve."
  }
];

const collectArticleData = () => {
  const homepageArticles = Array.from(document.querySelectorAll(".article-index > a")).map((card) => ({
    href: card.getAttribute("href") || "#",
    image: card.querySelector("img")?.getAttribute("src") || "",
    alt: card.querySelector("img")?.getAttribute("alt") || "",
    category: card.querySelector("span")?.textContent.trim() || "Journal",
    title: card.querySelector("strong")?.textContent.trim() || "",
    description: card.querySelector("p")?.textContent.trim() || ""
  }));

  return [...homepageArticles, ...extraArticles];
};

const renderArticleCarousel = (articles) => {
  if (!articleCarousel) {
    return;
  }

  articleCarousel.innerHTML = articles.map((article) => {
    const category = categoryKeys[article.category] || article.category.toLowerCase();

    return `
      <article class="product-card journal-carousel-card" data-category="${escapeHtml(category)}">
        <div class="product-visual" style="--product-image: url('${escapeHtml(article.image)}');" role="img" aria-label="${escapeHtml(article.alt)}"></div>
        <div class="product-body">
          <p class="product-kicker">${escapeHtml(article.category)}</p>
          <h3>${escapeHtml(article.title)}</h3>
          <p>${escapeHtml(article.description)}</p>
          <a class="product-link" href="${escapeHtml(article.href)}">Read article</a>
        </div>
      </article>
    `;
  }).join("");

  setActiveFilter(activeFilter);
};

const setActiveFilter = (category) => {
  activeFilter = category;

  filterButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === category);
  });

  articleCarousel?.querySelectorAll("[data-category]").forEach((card) => {
    const isVisible = category === "all" || card.dataset.category === category;
    card.classList.toggle("is-hidden", !isVisible);
  });

  articleCarousel?.scrollTo({ left: 0, behavior: "smooth" });
};

const scrollArticleCarousel = (direction) => {
  if (!articleCarousel) {
    return;
  }

  const card = articleCarousel.querySelector(".product-card:not(.is-hidden)");
  const gap = parseFloat(getComputedStyle(articleCarousel).columnGap) || 18;
  const distance = card ? card.getBoundingClientRect().width + gap : articleCarousel.clientWidth * 0.85;

  articleCarousel.scrollBy({
    left: direction * distance,
    behavior: "smooth"
  });
};

window.addEventListener("scroll", () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
}, { passive: true });

filterButtons.forEach((button) => {
  button.addEventListener("click", () => setActiveFilter(button.dataset.filter));
});

filterLinks.forEach((link) => {
  link.addEventListener("click", () => setActiveFilter(link.dataset.filterLink));
});

carouselPrev?.addEventListener("click", () => scrollArticleCarousel(-1));
carouselNext?.addEventListener("click", () => scrollArticleCarousel(1));

renderArticleCarousel(collectArticleData());
