

// src/static/js/test.js

function list_plots(plotPaths) {

    const plotContainer = document.getElementById('plot-container');
    plotContainer.innerHTML = ''; // Clear previous plots

    plotPaths.forEach(plotPath => {
        const img = document.createElement('img');
        img.src = plotPath;
        img.alt = 'Plot Image';
        plotContainer.appendChild(img);
    });
}


document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const group_id = urlParams.get('group_id');
    const user_id = urlParams.get('user_id');
    var title = document.getElementById("title");

    if (group_id && user_id) {
        title.innerHTML ="Gruppen-Ergebnisse";
        
        try {
            const response = await fetch(`http://localhost:8000/list-group-plots?group_id=${group_id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json' 
                }
            });
            const jsonResponse = await response.json();

            if (response.ok) {

                list_plots(jsonResponse.plot_paths);

            } else {
                throw new Error(jsonResponse.detail);
            }

        } catch (error) {
            console.error(error.message);
        }
    }

    else if (!group_id && user_id) {
        title.innerHTML ="Meine Ergebnisse";

        try {
            const response = await fetch(`http://localhost:8000/list-user-plots?user_id=${user_id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json' 
                }
            });
            const jsonResponse = await response.json();

            if (response.ok) {

                list_plots(jsonResponse.plot_paths);

            } else {

                throw new Error(jsonResponse.detail);
            }

        } catch (error) {
            console.error(error.message);
        }
    }
    

});
