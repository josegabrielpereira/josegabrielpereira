const MARKETS = [
  "Stok Center",
  "Zaffari",
  "Asun",
  "Andreazza",
  "Rissul",
  "Imec",
  "Carrefour",
  "Atacadão",
];

const PRODUCTS = [
  { name: "Arroz 5 kg", prices: { "Stok Center": 24.9, Zaffari: 28.49, Asun: 26.9, Andreazza: 25.99, Rissul: 27.49, Imec: 26.49, Carrefour: 29.99, "Atacadão": 27.9 } },
  { name: "Feijão 1 kg", prices: { "Stok Center": 6.49, Zaffari: 7.49, Asun: 6.99, Andreazza: 6.79, Rissul: 7.29, Imec: 6.89, Carrefour: 8.49, "Atacadão": 7.29 } },
  { name: "Leite 1 L", prices: { "Stok Center": 4.99, Zaffari: 5.49, Asun: 5.19, Andreazza: 5.29, Rissul: 5.39, Imec: 5.09, Carrefour: 5.99, "Atacadão": 5.49 } },
  { name: "Açúcar 1 kg", prices: { "Stok Center": 4.29, Zaffari: 4.99, Asun: 4.69, Andreazza: 4.59, Rissul: 4.89, Imec: 4.49, Carrefour: 5.29, "Atacadão": 4.79 } },
  { name: "Óleo de soja 900 ml", prices: { "Stok Center": 7.49, Zaffari: 8.29, Asun: 7.99, Andreazza: 7.79, Rissul: 8.09, Imec: 7.69, Carrefour: 8.79, "Atacadão": 7.99 } },
  { name: "Café 500 g", prices: { "Stok Center": 12.9, Zaffari: 14.49, Asun: 13.49, Andreazza: 13.19, Rissul: 13.99, Imec: 12.99, Carrefour: 14.99, "Atacadão": 13.79 } },
  { name: "Macarrão 500 g", prices: { "Stok Center": 3.79, Zaffari: 4.49, Asun: 4.19, Andreazza: 3.99, Rissul: 4.29, Imec: 3.89, Carrefour: 4.69, "Atacadão": 4.09 } },
  { name: "Papel higiênico 12un", prices: { "Stok Center": 19.9, Zaffari: 22.9, Asun: 21.49, Andreazza: 20.99, Rissul: 21.9, Imec: 20.49, Carrefour: 23.49, "Atacadão": 21.29 } },
  { name: "Detergente 500 ml", prices: { "Stok Center": 2.29, Zaffari: 2.69, Asun: 2.49, Andreazza: 2.39, Rissul: 2.59, Imec: 2.35, Carrefour: 2.79, "Atacadão": 2.45 } },
  { name: "Sabão em pó 1 kg", prices: { "Stok Center": 11.9, Zaffari: 13.49, Asun: 12.49, Andreazza: 12.19, Rissul: 12.99, Imec: 11.99, Carrefour: 13.99, "Atacadão": 12.69 } },
];

const STORAGE_KEYS = {
  disabledMarkets: "economizars.disabledMarkets",
  myList: "economizars.myList",
};

let disabledMarkets = new Set(JSON.parse(localStorage.getItem(STORAGE_KEYS.disabledMarkets) || "[]"));
let myList = JSON.parse(localStorage.getItem(STORAGE_KEYS.myList) || "[]");

const searchInput = document.getElementById("search-input");
const clearBtn = document.getElementById("clear-btn");
const marketFilter = document.getElementById("market-filter");
const sortSelect = document.getElementById("sort-select");
const productsList = document.getElementById("products-list");
const emptyState = document.getElementById("empty-state");
const marketsListEl = document.getElementById("markets-list");
const listInput = document.getElementById("list-input");
const addItemBtn = document.getElementById("add-item-btn");
const myListEl = document.getElementById("my-list");
const listEmptyEl = document.getElementById("list-empty");
const listTotalEl = document.getElementById("list-total");
const clearListBtn = document.getElementById("clear-list-btn");

function formatPrice(value) {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

function activeMarkets() {
  return MARKETS.filter((m) => !disabledMarkets.has(m));
}

function cheapestMarketFor(product) {
  const markets = activeMarkets();
  let best = null;
  for (const m of markets) {
    const price = product.prices[m];
    if (price === undefined) continue;
    if (best === null || price < best.price) {
      best = { market: m, price };
    }
  }
  return best;
}

function populateMarketFilter() {
  marketFilter.innerHTML = '<option value="all">Todos os mercados</option>';
  MARKETS.forEach((m) => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    marketFilter.appendChild(opt);
  });
}

function renderMarketsList() {
  marketsListEl.innerHTML = "";
  MARKETS.forEach((m) => {
    const li = document.createElement("li");
    const disabled = disabledMarkets.has(m);
    if (disabled) li.classList.add("disabled");
    li.innerHTML = `<span>${m}</span><span class="check">✓</span>`;
    li.addEventListener("click", () => {
      if (disabledMarkets.has(m)) {
        disabledMarkets.delete(m);
      } else {
        disabledMarkets.add(m);
      }
      localStorage.setItem(STORAGE_KEYS.disabledMarkets, JSON.stringify([...disabledMarkets]));
      renderMarketsList();
      renderProducts();
    });
    marketsListEl.appendChild(li);
  });
}

function getFilteredProducts() {
  const query = searchInput.value.trim().toLowerCase();
  const marketChoice = marketFilter.value;
  const sortMode = sortSelect.value;

  let list = PRODUCTS.filter((p) => p.name.toLowerCase().includes(query));

  if (marketChoice !== "all" && !disabledMarkets.has(marketChoice)) {
    list = list.filter((p) => p.prices[marketChoice] !== undefined);
  }

  const priceForSort = (p) => {
    if (marketChoice !== "all") return p.prices[marketChoice] ?? Infinity;
    const best = cheapestMarketFor(p);
    return best ? best.price : Infinity;
  };

  if (sortMode === "cheapest") {
    list = [...list].sort((a, b) => priceForSort(a) - priceForSort(b));
  } else if (sortMode === "expensive") {
    list = [...list].sort((a, b) => priceForSort(b) - priceForSort(a));
  } else {
    list = [...list].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }

  return list;
}

function renderProducts() {
  const list = getFilteredProducts();
  const marketChoice = marketFilter.value;
  const markets = activeMarkets();

  productsList.innerHTML = "";
  emptyState.hidden = list.length > 0;

  list.forEach((product) => {
    const best = cheapestMarketFor(product);
    const block = document.createElement("div");
    block.className = "product-block";

    const title = document.createElement("h3");
    title.textContent = product.name;
    block.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "price-grid";

    const marketsToShow = marketChoice === "all" ? markets : markets.filter((m) => m === marketChoice);

    marketsToShow.forEach((m) => {
      const price = product.prices[m];
      if (price === undefined) return;
      const tile = document.createElement("div");
      tile.className = "price-tile";
      const isCheapest = best && best.market === m && marketChoice === "all";
      if (isCheapest) tile.classList.add("cheapest");
      tile.innerHTML = `<span class="market-name">${m}${isCheapest ? '<span class="tag">• MENOR</span>' : ""}</span><span class="price">${formatPrice(price)}</span>`;
      tile.title = "Clique para adicionar à sua lista";
      tile.addEventListener("click", () => addToList(product.name, price, m));
      grid.appendChild(tile);
    });

    block.appendChild(grid);
    productsList.appendChild(block);
  });
}

function findCheapestPrice(name) {
  const product = PRODUCTS.find((p) => p.name.toLowerCase() === name.toLowerCase());
  if (!product) return null;
  const best = cheapestMarketFor(product);
  return best ? { price: best.price, market: best.market } : null;
}

function addToList(name, price, market) {
  myList.push({ name, price: price ?? 0, market: market ?? null });
  saveList();
  renderList();
}

function saveList() {
  localStorage.setItem(STORAGE_KEYS.myList, JSON.stringify(myList));
}

function renderList() {
  myListEl.innerHTML = "";
  listEmptyEl.hidden = myList.length > 0;

  let total = 0;
  myList.forEach((item, index) => {
    total += item.price || 0;
    const li = document.createElement("li");
    const label = item.market ? `${item.name} <span style="color:#5f6b64;font-weight:400;">(${item.market})</span>` : item.name;
    li.innerHTML = `<span>${label}</span><span><span class="item-price">${formatPrice(item.price || 0)}</span><button class="remove-btn" data-index="${index}">✕</button></span>`;
    myListEl.appendChild(li);
  });

  listTotalEl.textContent = formatPrice(total);

  myListEl.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idx = Number(e.currentTarget.dataset.index);
      myList.splice(idx, 1);
      saveList();
      renderList();
    });
  });
}

searchInput.addEventListener("input", renderProducts);
marketFilter.addEventListener("change", renderProducts);
sortSelect.addEventListener("change", renderProducts);
clearBtn.addEventListener("click", () => {
  searchInput.value = "";
  marketFilter.value = "all";
  sortSelect.value = "name";
  renderProducts();
});

addItemBtn.addEventListener("click", () => {
  const name = listInput.value.trim();
  if (!name) return;
  const found = findCheapestPrice(name);
  if (found) {
    addToList(name, found.price, found.market);
  } else {
    addToList(name, 0, null);
  }
  listInput.value = "";
});

listInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addItemBtn.click();
});

clearListBtn.addEventListener("click", () => {
  myList = [];
  saveList();
  renderList();
});

populateMarketFilter();
renderMarketsList();
renderProducts();
renderList();
