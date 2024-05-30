const urlParams = new URLSearchParams(window.location.search);
const group_name = urlParams.get('group_id');
console.log(group_name);

// src/static/js/test.js

document.addEventListener('DOMContentLoaded', async () => {


    if (!group_name) {
        console.error('Group ID not found in query parameters');
        return;
    }

    try {
        const response = await fetch(`http://localhost:8000/list-plots?group_id=${group_name}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const jsonResponse = await response.json();

        if (response.ok) {

            const plotPaths = data.plot_paths;

            const plotContainer = document.getElementById('plot-container');
            plotContainer.innerHTML = ''; // Clear previous plots

            plotPaths.forEach(plotPath => {
                const img = document.createElement('img');
                img.src = plotPath;
                img.alt = 'Plot Image';
                plotContainer.appendChild(img);
            });

        } else {
            throw new Error(jsonResponse.detail);
        }

    } catch (error) {
        console.error(error.message);
    }
    
});
