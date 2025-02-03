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
    "Midnights": "#1c1257", "The Tortured Poets Department": "#eae8f3"
};

let albumName = null;

// Function to fetch JSON data
async function loadLyricsData() {
    try {
        const response = await fetch('data.json'); // Adjust the path if necessary
        lyricsData = await response.json();
        console.log("Lyrics data loaded:", lyricsData); // Debugging
    } catch (error) {
        console.error("Error loading lyrics data:", error);
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

// Load lyrics data on page load
window.onload = loadLyricsData;
