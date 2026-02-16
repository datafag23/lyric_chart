let lyricsData = {}; // To store the fetched JSON data

// Album-level chart
const hiddenAlbums = [
    "The Hannah Montana Movie", "Two Lanes of Freedom", "Women in Music Part III",
    "Love Drunk", "Miss Americana", "Fifty Shades Darker", "Christmas Tree Farm",
    "Where The Crawdads Sing", "Cats", "How Long Do You Think It's Gonna Last",
    "The Hunger Games", "The Taylor Swift Holiday Collection", "Beautiful Eyes"
];

// Define colors for specific albums
const albumColors = {
    "Taylor Swift": "#24752b", "Fearless (Taylor's Version)": "#eeeb3d",
    "Speak Now (Taylor's Version)": "#8c1bb9", "Red (Taylor's Version)": "#C70039",
    "1989 (Taylor's Version)": "#1E90FF", "reputation": "#2E2E2E",
    "Lover": "#FF69B4", "folklore": "#A9A9A9", "evermore": "#94551b",
    "Midnights": "#1c1257", "The Tortured Poets Department": "#eae8f3", "The Life of a Showgirl": "#e46c32",

    // Hidden albums
    "The Hannah Montana Movie": "#E6E6FA",
    "Two Lanes of Freedom": "#2F80ED",
    "Women in Music Part III": "#F2C94C",
    "Love Drunk": "#C70039",
    "Miss Americana": "#0B4F9E",
    "Fifty Shades Darker": "#151515",
    "Christmas Tree Farm": "#6E3C3B",
    "Where The Crawdads Sing": "#E8DDC9",
    "Cats": "#000000",
    "How Long Do You Think It's Gonna Last": "#D32F2F",
    "The Hunger Games": "#D4AF37",
    "The Taylor Swift Holiday Collection": "#B90F0F",
    "Beautiful Eyes": "#E7B24A"
};

let albumName = null;

/**
 * Albums currently included in search (global so funcions.js can use it).
 * Default: all albums except hiddenAlbums.
 */
let selectedAlbums = new Set();

const chartDom = document.getElementById('chartCanvas');
const myChart = echarts.init(chartDom);

function getAllAlbumsForSelector() {
    const fromData = Object.keys(lyricsData || {});
    const defaultAlbums = fromData.filter(a => !hiddenAlbums.includes(a));
    // The rest are the ones in hiddenAlbums
    return [...defaultAlbums, ...hiddenAlbums];
}

function applyDefaultAlbumSelection() {
    const all = getAllAlbumsForSelector();
    selectedAlbums = new Set(all.filter(a => !hiddenAlbums.includes(a)));
}

function updateAlbumSelectorButtonText() {
    const btn = document.getElementById('albumSelectorButton');
    if (!btn) return;

    const all = getAllAlbumsForSelector();
    const selectedCount = selectedAlbums.size;
    btn.textContent = selectedCount === all.length ? "Albums (All)" : `Albums (${selectedCount})`;
}

function renderAlbumCheckboxes() {
    const list = document.getElementById('albumCheckboxList');
    if (!list) return;

    const all = getAllAlbumsForSelector();
    list.innerHTML = "";

    all.forEach(album => {
        const id = `album_cb_${album.replace(/[^a-z0-9]+/gi, '_')}`;

        const row = document.createElement('label');
        row.className = "album-checkbox-item";
        // row.htmlFor = id; // No longer needed if input is inside, but we'll keep it for clarity if we want

        const cb = document.createElement('input');
        cb.type = "checkbox";
        cb.id = id;
        cb.dataset.album = album;
        cb.checked = selectedAlbums.has(album);

        cb.addEventListener('change', () => {
            if (cb.checked) selectedAlbums.add(album);
            else selectedAlbums.delete(album);

            updateAlbumSelectorButtonText();

            // If user is drilled into an album that gets unchecked, go back to album view
            if (albumName && !selectedAlbums.has(albumName)) {
                albumName = null;
            }

            const searchTerm = document.getElementById('searchInput').value.trim();
            if (searchTerm) triggerSearch();
        });

        const customCb = document.createElement('span');
        customCb.className = "custom-checkbox";

        const text = document.createElement('span');
        text.className = "album-checkbox-label";
        text.textContent = album;

        row.appendChild(cb);
        row.appendChild(customCb);
        row.appendChild(text);
        list.appendChild(row);
    });

    updateAlbumSelectorButtonText();
}

function setAllAlbumCheckboxesChecked(checked) {
    const all = getAllAlbumsForSelector();
    selectedAlbums = new Set(checked ? all : []);
    renderAlbumCheckboxes();

    const searchTerm = document.getElementById('searchInput').value.trim();
    if (searchTerm) triggerSearch();
}

function initAlbumSelectorUI() {
    const btn = document.getElementById('albumSelectorButton');
    const tip = document.getElementById('albumSelectorTooltip');
    const closeBtn = document.getElementById('albumSelectorClose');

    if (!btn || !tip || !closeBtn) return;

    const open = () => {
        tip.hidden = false;
        btn.setAttribute('aria-expanded', 'true');
    };

    const close = () => {
        tip.hidden = true;
        btn.setAttribute('aria-expanded', 'false');
    };

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (tip.hidden) open();
        else close();
    });

    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        close();
    });

    document.addEventListener('click', () => {
        if (!tip.hidden) close();
    });

    tip.addEventListener('click', (e) => e.stopPropagation());

    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape" && !tip.hidden) close();
    });

    document.getElementById('albumsSelectAll')?.addEventListener('click', (e) => {
        e.stopPropagation();
        setAllAlbumCheckboxesChecked(true);
    });

    document.getElementById('albumsSelectNone')?.addEventListener('click', (e) => {
        e.stopPropagation();
        setAllAlbumCheckboxesChecked(false);
    });

    document.getElementById('albumsSelectDefault')?.addEventListener('click', (e) => {
        e.stopPropagation();
        applyDefaultAlbumSelection();
        renderAlbumCheckboxes();

        const searchTerm = document.getElementById('searchInput').value.trim();
        if (searchTerm) triggerSearch();
    });
}

function initHelpModalUI() {
    const helpBtn = document.getElementById('helpButton');
    const helpOverlay = document.getElementById('helpOverlay');
    const helpCloseBtn = document.getElementById('helpClose');

    if (!helpBtn || !helpOverlay || !helpCloseBtn) return;

    const open = () => {
        helpOverlay.hidden = false;
        helpBtn.setAttribute('aria-expanded', 'true');
    };

    const close = () => {
        helpOverlay.hidden = true;
        helpBtn.setAttribute('aria-expanded', 'false');
    };

    helpBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        open();
    });

    helpCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        close();
    });
}

// Function to fetch JSON data
async function loadLyricsData() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    try {
        if (loadingOverlay) loadingOverlay.hidden = false;
        const response = await fetch('data.json'); // Adjust the path if necessary
        lyricsData = await response.json();
        console.log("Lyrics data loaded:", lyricsData); // Debugging

        // Initialize album selection + tooltip after data is available
        applyDefaultAlbumSelection();
        initAlbumSelectorUI();
        initHelpModalUI();
        renderAlbumCheckboxes();
    } catch (error) {
        console.error("Error loading lyrics data:", error);
    } finally {
        if (loadingOverlay) loadingOverlay.hidden = true;
    }
}

// Search when button is clicked
document.getElementById('searchButton').addEventListener('click', triggerSearch);

// Search when pressing "Enter"
document.getElementById('searchInput').addEventListener('keypress', function (event) {
    if (event.key === "Enter") {
        triggerSearch();
    }
});

// Only trigger search from the plural checkbox if there's input text
document.getElementById('pluralCheckbox').addEventListener('change', function () {
    const searchTerm = document.getElementById('searchInput').value.trim();
    if (searchTerm) {
        triggerSearch();
    }
});

// Load lyrics data on page load
window.onload = loadLyricsData;

// Function to resize chart on window resize
window.addEventListener('resize', function () {
    myChart.resize();
});