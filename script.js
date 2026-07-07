const header = document.querySelector("[data-header]");
const filterButtons = document.querySelectorAll("[data-filter]");
const filterLinks = document.querySelectorAll("[data-filter-link]");
const productGrid = document.querySelector("[data-products]");
const managedImages = document.querySelectorAll("[data-managed-image]");

let activeFilter = "all";

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "\"": "&quot;",
  "'": "&#039;"
}[character]));

const normalizeOffers = (offers) => Object.entries(offers)
  .filter(([, offer]) => offer.enabled !== false)
  .map(([slug, offer]) => ({ slug, ...offer }));

const getImagePath = (offer, images) => {
  const image = images[offer.imageKey] || images.default;
  return image ? image.src : "";
};

const applyManagedImages = (images) => {
  managedImages.forEach((element) => {
    const image = images[element.dataset.managedImage] || images.default;

    if (!image) {
      return;
    }

    element.src = image.src;
    element.alt = image.alt || "";
  });
};

const renderProducts = (offers, images) => {
  productGrid.innerHTML = offers.map((offer) => {
    const imagePath = getImagePath(offer, images);
    const tags = (offer.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
    const position = offer.imagePosition || "center";

    return `
      <article class="product-card" data-category="${escapeHtml(offer.category)}">
        <div class="product-visual" style="--product-image: url('${escapeHtml(imagePath)}'); background-position: ${escapeHtml(position)};" aria-hidden="true"></div>
        <div class="product-body">
          <p class="product-kicker">${escapeHtml(offer.categoryLabel || offer.category)}</p>
          <h3>${escapeHtml(offer.title)}</h3>
          <p>${escapeHtml(offer.description)}</p>
          <div class="product-meta">${tags}</div>
          <a class="product-link" href="/${escapeHtml(offer.slug)}" rel="nofollow sponsored">${escapeHtml(offer.cta || "See pick")}</a>
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

  document.querySelectorAll("[data-category]").forEach((card) => {
    const isVisible = category === "all" || card.dataset.category === category;
    card.classList.toggle("is-hidden", !isVisible);
  });
};

const loadOfferData = async () => {
  try {
    const [offersResponse, imagesResponse] = await Promise.all([
      fetch("/data/offers.json", { cache: "no-store" }),
      fetch("/data/images.json", { cache: "no-store" })
    ]);

    if (!offersResponse.ok || !imagesResponse.ok) {
      throw new Error("Offer data failed to load.");
    }

    const [offers, images] = await Promise.all([
      offersResponse.json(),
      imagesResponse.json()
    ]);

    applyManagedImages(images);
    renderProducts(normalizeOffers(offers), images);
  } catch (error) {
    productGrid.innerHTML = "<p class=\"loading-note\">Product picks could not be loaded. Please refresh the page.</p>";
  }
};

window.addEventListener("scroll", () => {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
}, { passive: true });

filterButtons.forEach((button) => {
  button.addEventListener("click", () => setActiveFilter(button.dataset.filter));
});

filterLinks.forEach((link) => {
  link.addEventListener("click", () => setActiveFilter(link.dataset.filterLink));
});

loadOfferData();
