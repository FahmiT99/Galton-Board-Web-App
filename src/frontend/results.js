import "./node_modules/html2pdf.js/dist/html2pdf.bundle.min.js"

var plot_paths = [];
var listed_plot_paths = [];
 
// src/static/js/test.js

// Function to list plots in the plot container
function sort_plots(plotPaths) {

   
    // Funktion zur Extraktion der Abweichung aus dem Dateinamen
    function extractDeviation(plotPath) {
        const fileName = plotPath.split('/').pop(); // Extrahiere den Dateinamen
        const parts = fileName.split('_');
        const deviationStr = parts[parts.length - 2].replace('.png', ''); // Extrahiere die Abweichung
        return parseFloat(deviationStr); // Umwandeln in Zahl
    }

    // Sort plotPaths based on deviation in descending order
    return plotPaths.slice().sort((a, b) => {
        const deviationA = extractDeviation(a);
        const deviationB = extractDeviation(b);
        return deviationA - deviationB  ; // Sort in ascending order
    });

    
}

function list_plots(PlotPaths) {
    const plotContainer = document.getElementById('plot-container');
    plotContainer.innerHTML = ''; // Clear previous plots

    // Determine the number of images per row based on orientation
    const isPortrait = window.matchMedia("(orientation: portrait)").matches;
    const imagesPerRow = isPortrait ? 2 : 4;

    let rowContainer = null;
    PlotPaths.forEach((plotPath, index) => {
        if (index % imagesPerRow === 0) {
            rowContainer = document.createElement('div');
            rowContainer.className = 'plot-row';
            plotContainer.appendChild(rowContainer);
        }
        const img = document.createElement('img');
        img.src = plotPath;
        img.alt = 'Plot Image';
        rowContainer.appendChild(img);
    });

    return PlotPaths;
}

// Event listener für den Sortieren-Button
const sortRadioButtons = document.getElementsByName('sort-option');
sortRadioButtons.forEach(button => {
    button.addEventListener('click', () => {
     
        // Sortiere Bilder in umgekehrter Reihenfolge
        list_plots(listed_plot_paths.reverse());
    });
});


// Event listener für das Filtern nach Anzahl der Reihen
// const filterSelect = document.getElementById('filter-select');
// filterSelect.addEventListener('change', () => {
//     var filteredPlotPaths = []
//     const selectedRows = parseInt(filterSelect.value); // Ausgewählte Anzahl der Reihen
//     plot_paths = sort_plots(plot_paths);
//     document.getElementById('ascending').checked = true;

//     if (selectedRows === 0) {
//         filteredPlotPaths = plot_paths;
//     }
//     else {
//     // Filtere Bilder nach der Anzahl der Reihen
//     filteredPlotPaths = plot_paths.filter(plotPath => {
//         const parts = plotPath.split('_');
//         const rows = parseInt(parts.pop().replace('.png', '')); // Extract the number of rows
//         return rows === selectedRows;
//         });
//     }

//     // Liste die gefilterten Bilder
//     listed_plot_paths = list_plots(filteredPlotPaths);

// });

const filterSelectElements = document.querySelectorAll('#filter-select');

filterSelectElements.forEach(filterSelect => {
    filterSelect.addEventListener('change', () => {
        var filteredPlotPaths = [];
        const selectedRows = parseInt(filterSelect.value); // Ausgewählte Anzahl der Reihen
        plot_paths = sort_plots(plot_paths);
        document.getElementById('ascending').checked = true;

        if (selectedRows === 0) {
            filteredPlotPaths = plot_paths;
        } else {
            // Filtere Bilder nach der Anzahl der Reihen
            filteredPlotPaths = plot_paths.filter(plotPath => {
                const parts = plotPath.split('_');
                const rows = parseInt(parts.pop().replace('.png', '')); // Extract the number of rows
                return rows === selectedRows;
            });
        }

        // Liste die gefilterten Bilder
        listed_plot_paths = list_plots(filteredPlotPaths);
    });
});



document.querySelectorAll('[id=return-button]').forEach(button => {
    button.addEventListener("click", () => {
        window.history.back();
    });
});

//alternative:

// document.querySelectorAll('[id=return-button]').forEach(button => {
//     button.addEventListener("click", () => {
//         if(!group_id && user_id) {
//             window.location.href = `/main?user_id=${user_id}`;
//         } else if (group_id && user_id) {
//             window.location.href = `/main?group_id=${group_id}&user_id=${user_id}`;
//         } else {
//             window.location.href = `/main`;
//         }
//     });
// });


async function loadGroupPlots() {
    try {
        const response = await fetch(`/list-group-plots?group_id=${group_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json' 
            }
        });
        const jsonResponse = await response.json();

        if (response.ok) {

            plot_paths = sort_plots(jsonResponse.plot_paths);
            listed_plot_paths = list_plots(plot_paths);

        } else {
            throw new Error(jsonResponse.detail);
        }
    } catch (error) {
        console.error(error.message);
    }
}



async function loadUserPlots() {
    try {
        const response = await fetch(`/list-user-plots?user_id=${user_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json' 
            }
        });
        const jsonResponse = await response.json();

        if (response.ok) {

            plot_paths = sort_plots(jsonResponse.plot_paths);
            listed_plot_paths = list_plots(plot_paths);

        } else {
            throw new Error(jsonResponse.detail);
        }
    } catch (error) {
        console.error(error.message);
    }
}

//----------------------------------------------------------------init-------------------------------------------------//

const urlParams = new URLSearchParams(window.location.search);
const group_id = urlParams.get('group_id');
const user_id = urlParams.get('user_id');
var title = document.getElementById("title");

if (group_id && user_id) {
    title.innerHTML = "Gruppen Ergebnisse";
    loadGroupPlots();
} else if (!group_id && user_id) {
    title.innerHTML = "Meine Ergebnisse";
    loadUserPlots();
}


// const downloadButton = document.getElementById('downloadButton');
// const content = document.getElementById('content');

// const excludeIds = ['downloadButton', 'return-button'];

// downloadButton.addEventListener('click', function() {
//     // Options for html2pdf

//     excludeIds.forEach(id => {
//         const el = document.getElementById(id);
//         if (el) el.classList.add('exclude-from-pdf');
//     });


//     const opt = {
//         margin:       1,
//         filename:     'my-web-page.pdf',
//         image:        { type: 'jpeg', quality: 0.98 },
//         html2canvas:  { scale: 2 },
//         jsPDF:        { unit: 'in', format: 'a4' },
//         pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
//     };

//     // Generate the PDF
//     // html2pdf().from(content).set(opt).save();

//     html2pdf().from(content).set(opt).save().then(() => {
//         // Restore the display of the elements
//         excludeIds.forEach(id => {
//             const el = document.getElementById(id);
//             if (el) el.classList.remove('exclude-from-pdf');
//         });
//     });

//     listed_plot_paths.reverse();
// });

const downloadButtons = document.querySelectorAll('#downloadButton');
const content = document.getElementById('content');

const excludeIds = ['downloadButton', 'return-button'];

downloadButtons.forEach(downloadButton => {
    downloadButton.addEventListener('click', function() {
        // Add exclusion class to all elements with the specified IDs
        excludeIds.forEach(id => {
            document.querySelectorAll(`#${id}`).forEach(el => {
                el.classList.add('exclude-from-pdf');
            });
        });

        const opt = {
            margin:       1,
            filename:     'Galton Brett Simulation - Ergebnisse.pdf',
            image:        { type: 'jpeg', quality: 1.0 },
            html2canvas:  { scale: 4 },
            jsPDF:        { unit: 'mm', format: 'a4',  orientation: 'portrait'  },
            // pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
        };

        // Generate the PDF
        // html2pdf().from(content).set(opt).save();

        html2pdf().from(content).set(opt).save().then(() => {
            // Restore the display of the elements
            excludeIds.forEach(id => {
                document.querySelectorAll(`#${id}`).forEach(el => {
                    el.classList.remove('exclude-from-pdf');
                });
            });
        });

        listed_plot_paths.reverse();
    });
});




