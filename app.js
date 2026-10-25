// Minimalist Card Dashboard with Direct Supabase Integration

// Default credentials loaded from .env
const SUPABASE_CONFIG = {
  url: "https://zeqefyxwhznqiyfgjmrn.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplcWVmeXh3aHpucWl5ZmdqbXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MjYwNTcsImV4cCI6MjA2MzMwMjA1N30.ktk-5EzJBa7W2zq5ALoYMDrRHrx0wScyiu874g0czaw",
  table: "dashboard_links"
};

const DEFAULT_LINKS = [
  {
    title: "INTERNSHIP DETAILS",
    url: "https://docs.google.com/spreadsheets/d/1HaWsE2UKkIJm_iEH40RqI4dn9N3laZ2G2Hi5s_crgG0/edit?usp=drive_link"
  },
  {
    title: "CODING PROGRESS",
    url: "https://drive.google.com/drive/folders/1LP3H60HqTGiF5s3YaXwcrnO9sAg1A7x6?usp=drive_link"
  },
  {
    title: "NPTEL",
    url: "https://drive.google.com/drive/folders/1h1QcjQcIabOl6-iWaXV4HQBtrKJiff16?usp=drive_link"
  },
  {
    title: "NPTEL FINAL COURSES",
    url: "https://docs.google.com/spreadsheets/d/1R0xV1jgsjjX9aEPGdFMOtCNKx9PaaXLSVQkuuEN_zsA/edit?usp=drive_link"
  },
  {
    title: "VVITU",
    url: "https://drive.google.com/drive/folders/1txSN7Jgya_lVMusTO68Sjtbl9YR9tVG4?usp=drive_link"
  },
  {
    title: "COLLEGE DATA",
    url: "https://vvitguntur-my.sharepoint.com/:f:/g/personal/23bq1a0539_vvit_net/IgCxCS4AoIA_ToaGmNzCeMP1AX7YjKtcyUrt1W43hbUpohs?e=0aZzRW"
  }
];

let links = [...DEFAULT_LINKS];
let supabaseClient = null;

// DOM Elements
let cardsGrid, searchInput;
let addModal, openAddModalBtn, closeAddBtn, cancelAddBtn, addLinkForm, submitAddBtn;
let toast;

function initDOMElements() {
  cardsGrid = document.getElementById("cardsGrid");
  searchInput = document.getElementById("searchInput");

  addModal = document.getElementById("addModal");
  openAddModalBtn = document.getElementById("openAddModalBtn");
  closeAddBtn = document.getElementById("closeAddBtn");
  cancelAddBtn = document.getElementById("cancelAddBtn");
  addLinkForm = document.getElementById("addLinkForm");
  submitAddBtn = document.getElementById("submitAddBtn");

  toast = document.getElementById("toast");
}

async function init() {
  initDOMElements();
  setupEventListeners();
  renderCards(); // Instant render with pre-loaded links

  await loadEnvConfig();
  initSupabase();
  await loadLinks();
  renderCards(); // Re-render with Supabase live data
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

function setupEventListeners() {
  if (searchInput) {
    searchInput.addEventListener("input", renderCards);
  }

  // Add Link Modal Events
  if (openAddModalBtn) {
    openAddModalBtn.addEventListener("click", () => addModal.classList.add("active"));
  }
  if (closeAddBtn) {
    closeAddBtn.addEventListener("click", () => addModal.classList.remove("active"));
  }
  if (cancelAddBtn) {
    cancelAddBtn.addEventListener("click", () => addModal.classList.remove("active"));
  }

  if (addModal) {
    addModal.addEventListener("click", (e) => {
      if (e.target === addModal) addModal.classList.remove("active");
    });
  }

  // Handle Form Submission -> Store to Supabase
  if (addLinkForm) {
    addLinkForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = document.getElementById("linkTitle").value.trim();
      const url = document.getElementById("linkUrl").value.trim();

      if (!title || !url) return;

      if (submitAddBtn) {
        submitAddBtn.disabled = true;
        submitAddBtn.textContent = "Saving...";
      }

      await addNewLink({ title, url });

      if (submitAddBtn) {
        submitAddBtn.disabled = false;
        submitAddBtn.textContent = "Save Link";
      }

      addLinkForm.reset();
      addModal.classList.remove("active");
    });
  }
}

// Optionally fetch and parse .env file if available
async function loadEnvConfig() {
  try {
    const res = await fetch(".env");
    if (res.ok) {
      const text = await res.text();
      text.split("\n").forEach(line => {
        const [k, ...v] = line.trim().split("=");
        if (k && v.length) {
          const val = v.join("=").trim().replace(/^["']|["']$/g, '');
          if (k === "SUPABASE_URL") SUPABASE_CONFIG.url = val;
          if (k === "SUPABASE_ANON_KEY") SUPABASE_CONFIG.anonKey = val;
          if (k === "SUPABASE_TABLE") SUPABASE_CONFIG.table = val;
        }
      });
    }
  } catch (e) {}
}

// Initialize Supabase Client
function initSupabase() {
  if (window.supabase && SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
    try {
      supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    } catch (e) {
      console.error("Failed to create Supabase client:", e);
    }
  }
}

// Fetch links from Supabase
async function loadLinks() {
  if (!supabaseClient) return;
  try {
    const { data, error } = await supabaseClient
      .from(SUPABASE_CONFIG.table)
      .select("*")
      .order("created_at", { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      links = data;
    }
  } catch (e) {
    console.error("Failed to query Supabase:", e);
  }
}

// Insert new link into Supabase
async function addNewLink(item) {
  if (!supabaseClient) {
    showToast("Supabase client not initialized");
    return;
  }

  try {
    const { data, error } = await supabaseClient
      .from(SUPABASE_CONFIG.table)
      .insert([{ title: item.title, url: item.url, category: "General" }])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      showToast("Error: " + error.message);
      return;
    }

    if (data && data[0]) {
      links.push(data[0]);
      renderCards();
      showToast("Link stored in Supabase!");
    }
  } catch (err) {
    console.error("Supabase insert exception:", err);
    showToast("Error: " + err.message);
  }
}

// Render Small Cards
function renderCards() {
  if (!cardsGrid) return;
  const query = (searchInput ? searchInput.value : "").toLowerCase().trim();
  const filtered = links.filter(l => 
    (l.title || "").toLowerCase().includes(query) ||
    (l.url || "").toLowerCase().includes(query)
  );

  if (filtered.length === 0) {
    cardsGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 30px;">No links found</div>`;
    return;
  }

  cardsGrid.innerHTML = filtered.map(link => `
    <div class="card">
      <div class="card-title">${escape(link.title)}</div>
      <div class="card-actions">
        <a href="${escape(link.url)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Open ↗</a>
        <button class="btn" onclick="copyUrl('${escape(link.url)}')">Copy</button>
      </div>
    </div>
  `).join("");
}

// Copy URL to Clipboard
window.copyUrl = (url) => {
  navigator.clipboard.writeText(url).then(() => {
    showToast("Copied to clipboard!");
  }).catch(() => {
    const el = document.createElement("textarea");
    el.value = url;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    showToast("Copied to clipboard!");
  });
};

function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.style.display = "block";
  setTimeout(() => { toast.style.display = "none"; }, 2500);
}

function escape(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
