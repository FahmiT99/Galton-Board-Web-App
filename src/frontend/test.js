// src/static/js/main.js
document.getElementById('generate-plot-btn').addEventListener('click', async () => {
    try {
        const response = await fetch('/plot');
        const image = await response.json();
        const plotPath = image.plot_path;
        document.getElementById('plot-img').src = plotPath;
    } catch (error) {
        console.error('Error generating plot:', error);
    }
});
