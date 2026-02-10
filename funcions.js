// Function to count word occurrences per album
function countWordOccurrences(phrase, album = null) {
    if (!lyricsData || Object.keys(lyricsData).length === 0) {
        document.getElementById("error-msg").textContent = "Data is still loading. Please try again.";
        return {};
    }

    let counts = {};
    phrase = phrase.toLowerCase().trim();

    const isOneWord = !phrase.includes(' ');

    // Plural checkbox handling
    const includePlurals = document.getElementById('pluralCheckbox') && document.getElementById('pluralCheckbox').checked;

    // If checkbox is checked and it's one word, add (s)? to the regex
    const searchRegex = isOneWord ?
        new RegExp(`\\b${phrase}${includePlurals ? '(s)?' : ''}\\b`, 'gi') :
        new RegExp(phrase, 'gi');

    if (album) {
        // Count occurrences only within the selected album
        if (!lyricsData[album]) {
            console.error("Album not found:", album);
            return {};
        }

        for (let song in lyricsData[album]) {
            let count = 0;
            lyricsData[album][song].forEach(line => {
                const matches = line.lyric.toLowerCase().match(searchRegex);
                if (matches) {
                    count += matches.length * line.multiplicity;
                }
            });

            counts[song] = count;
        }
    } else {
        // Count occurrences across selected albums (if selection exists)
        const hasSelection = (typeof selectedAlbums !== "undefined") && selectedAlbums instanceof Set && selectedAlbums.size > 0;

        for (let albumName in lyricsData) {
            if (hasSelection && !selectedAlbums.has(albumName)) continue;

            let count = 0;

            for (let song in lyricsData[albumName]) {
                lyricsData[albumName][song].forEach(line => {
                    const matches = line.lyric.toLowerCase().match(searchRegex);
                    if (matches) {
                        count += matches.length * line.multiplicity;
                    }
                });
            }

            counts[albumName] = count;
        }
    }

    return counts;
}

// Function to render chart using ECharts
function renderChart(data, searchTerm) {
    // If albumName is provided, show song data instead of album data
    let categories, seriesData, titleText, interval;

    console.log("data", data);

    if (albumName) {
        data = countWordOccurrences(searchTerm, albumName);
        categories = Object.keys(data);
        seriesData = categories.map(song => ({
            value: data[song],
            itemStyle: {
                color: albumColors[albumName] || "#7e0d0d",
                borderColor: "#000000",
                borderWidth: 0.25
            }
        }));
        titleText = `"${searchTerm}" Occurrences in "${albumName}" Songs (Total: ${Object.values(data).reduce((a, b) => a + b, 0)})`;

        interval = 4;
    } else {
        // Only show selected albums (hiddenAlbums are now controlled by the selector)
        const hasSelection = (typeof selectedAlbums !== "undefined") && selectedAlbums instanceof Set && selectedAlbums.size > 0;
        categories = Object.keys(data).filter(album => !hasSelection || selectedAlbums.has(album));

        seriesData = categories.map(album => ({
            value: data[album],
            itemStyle: {
                color: albumColors[album] || "#7e0d0d",
                borderColor: "#000000",
                borderWidth: 0.25
            }
        }));

        titleText = `"${searchTerm}" Occurrences in Selected Albums (Total: ${categories.reduce((sum, a) => sum + (data[a] || 0), 0)})`;
        interval = 0;
    }

    const option = {
        title: { text: titleText, left: "center" },
        tooltip: {},
        xAxis: {
            type: 'category',
            data: categories,
            axisLabel: {
                fontSize: 12,
                interval: interval,
                formatter: value => {
                    if (value === "The Life of a Showgirl") {
                        return "The Life of\n a Showgirl";
                    }
                    return value.replaceAll(" ", "\n");
                }
            }
        },
        yAxis: { type: 'value' },
        series: [{ name: 'Occurrences', type: 'bar', data: seriesData }]
    };

    myChart.setOption(option);

    // Add event listener for clicking on bars
    if (!albumName) {
        myChart.on('click', function (params) {
            if (!albumName) {
                // If at album level, drill down to songs in clicked album
                const searchTerm = document.getElementById('searchInput').value.trim();
                albumName = params.name;
                renderChart(data, searchTerm); // Re-render chart with song data
            }
        });
    }

    // Show back button if viewing songs
    document.getElementById("backButton").style.display = albumName ? "block" : "none";
}

// Function to return to album view
function goBack() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    const results = countWordOccurrences(searchTerm);
    albumName = null; // Reset albumName
    renderChart(results, searchTerm);
}


// Event listener for search button
// Function to trigger search
function triggerSearch() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    myChart.clear(); // Clear previous chart
    if (!searchTerm) {
        document.getElementById("error-msg").textContent = "Please enter a word or phrase!";
        return;
    }

    document.getElementById("error-msg").textContent = ""; // Clear previous error message

    const results = countWordOccurrences(searchTerm);
    renderChart(results, searchTerm); // Pass search term

}