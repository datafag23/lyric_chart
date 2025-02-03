let lyricsData = {}; // To store the fetched JSON data

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

// Function to count word occurrences per album
function countWordOccurrences(word) {
    console.log("Word to search:", word); // Debugging
    if (!lyricsData || Object.keys(lyricsData).length === 0) {
        alert("Data is still loading. Please try again.");
        return {};
    }

    let albumCounts = {};

    // Loop through each album
    for (let album in lyricsData) {
        let count = 0;

        // Loop through each song in the album
        for (let song in lyricsData[album]) {
            lyricsData[album][song].forEach(line => {
                const words = line.lyric.toLowerCase().split(/\W+/); // Split by non-word characters
                words.forEach(w => {
                    if (w === word.toLowerCase()) {
                        count += line.multiplicity; // Count occurrences considering multiplicity
                    }
                });
            });
        }

        albumCounts[album] = count;
    }
    return albumCounts;
}

// Function to render chart using ECharts
function renderChart(data) {
    const chartDom = document.getElementById('chartCanvas');
    const myChart = echarts.init(chartDom);

    // List of albums to hide by default
    const hiddenAlbums = [
        "The Hannah Montana Movie",
        "Two Lanes of Freedom",
        "Women in Music Part III",
        "Love Drunk",
        "Miss Americana",
        "Fifty Shades Darker",
        "Christmas Tree Farm",
        "Where The Crawdads Sing",
        "Cats",
        "How Long Do You Think It's Gonna Last",
        "The Hunger Games",
        "The Taylor Swift Holiday Collection",
        "Beautiful Eyes"
    ];

    // Filter out hidden albums
    const filteredAlbums = Object.keys(data).filter(album => !hiddenAlbums.includes(album));
    const filteredCounts = filteredAlbums.map(album => data[album]);

    const option = {
        title: { text: 'Word Occurrences in Taylor Swift Albums' },
        tooltip: {},
        xAxis: { 
            type: 'category', 
            data: filteredAlbums,
            axisLabel: { 
                fontSize: 12,
                interval: 0, // Show all labels
                formatter: function(value) {
                    return value.replaceAll(" ", "\n"); // Replaces all spaces with line breaks in the string
                }
            }
        },
        yAxis: { type: 'value' },
        series: [{ name: 'Occurrences', type: 'bar', data: filteredCounts, color: '#7e0d0d' }]
    };

    myChart.setOption(option);
}


// Event listener for search button
document.getElementById('searchButton').addEventListener('click', () => {
    const word = document.getElementById('searchInput').value.trim();
    if (!word) return alert("Please enter a word!");

    const results = countWordOccurrences(word);
    renderChart(results);
});

// Load lyrics data on page load
window.onload = loadLyricsData;
