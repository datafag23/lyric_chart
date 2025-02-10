// Function to count word occurrences per album
function countWordOccurrences(phrase, album = null) {
    if (!lyricsData || Object.keys(lyricsData).length === 0) {
        alert("Data is still loading. Please try again.");
        return {};
    }

    let counts = {};
    phrase = phrase.toLowerCase().trim(); // Normalize search input
    
    // If phrase is a single word, use word boundary matching
    const isOneWord = !phrase.includes(' ');
    const searchRegex = isOneWord ? 
        new RegExp(`\\b${phrase}\\b`, 'gi') : // Use word boundaries for single words
        new RegExp(phrase, 'gi'); // Use normal matching for phrases

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

            counts[song] = count; // Store occurrences per song
        }
    } else {
        // Count occurrences across all albums
        for (let albumName in lyricsData) {
            let count = 0;

            for (let song in lyricsData[albumName]) {
                lyricsData[albumName][song].forEach(line => {
                    const matches = line.lyric.toLowerCase().match(searchRegex);
                    if (matches) {
                        count += matches.length * line.multiplicity;
                    }
                });
            }

            counts[albumName] = count; // Store occurrences per album
        }
    }

    return counts;
}

// Function to render chart using ECharts
function renderChart(data, searchTerm) {
    const chartDom = document.getElementById('chartCanvas');
    const myChart = echarts.init(chartDom);

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
        titleText = `"${searchTerm}" Occurrences in "${albumName}" Songs`;

        interval = 4;
    } else {
        categories = Object.keys(data).filter(album => !hiddenAlbums.includes(album));
        seriesData = categories.map(album => ({
            value: data[album],
            itemStyle: {
                color: albumColors[album] || "#7e0d0d",
                borderColor: "#000000",
                borderWidth: 0.25
            }
        }));
        titleText = `"${searchTerm}" Occurrences in Taylor Swift Albums`;

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
                formatter: value => value.replaceAll(" ", "\n")
            }
        },
        yAxis: { type: 'value' },
        series: [{ name: 'Occurrences', type: 'bar', data: seriesData }]
    };

    myChart.setOption(option);

    // Add event listener for clicking on bars
    if(!albumName) {
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
    if (!searchTerm) return alert("Please enter a word or phrase!");

    const results = countWordOccurrences(searchTerm);
    renderChart(results, searchTerm); // Pass search term
}