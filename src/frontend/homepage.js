document.addEventListener('DOMContentLoaded', function() {
    const getStartedButton = document.getElementById('get-started');
    const hiddenElements = document.getElementById('hidden-elements');
    const ctaContainer = document.getElementById('cta-container');
    // const navToggle = document.getElementById('nav-toggle');
    // const navContent = document.getElementById('nav-content');

    getStartedButton.addEventListener('click', function() {
        ctaContainer.innerHTML = hiddenElements.innerHTML;
        console.log('Get Started button clicked');
        console.log('Hidden elements class list:', hiddenElements.classList);
        ctaContainer.scrollIntoView({ behavior: 'smooth' });

        // Re-attach event listeners to the new elements
        attachEventListeners();
    });

    navToggle.addEventListener('click', function() {
        navContent.classList.toggle('hidden');
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Dynamic background transitions
    const sections = document.querySelectorAll('.section');
    const options = {
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.backgroundImage = entry.target.dataset.backgroundImage;
            }
        });
    }, options);

    sections.forEach(section => {
        section.dataset.backgroundImage = section.style.backgroundImage;
        observer.observe(section);
    });

    // Initial attachment of event listeners
    attachEventListeners();
});

function attachEventListeners() {
    const createGroupButton = document.getElementById("create-group");
    const withoutGrouptButton = document.getElementById("continue-without-group");
    const withGroupButton = document.getElementById("continue");
    const groupID = document.getElementById("group-id");
    const groupIdInput = document.getElementById("groupID_input");
    const idDisplay = document.getElementById('id-display');
    const idDisplay2 = document.getElementById('id-display2');

    createGroupButton.addEventListener('click', async () => {
        if (groupIdInput.value) {
            try {
                const response = await fetch('http://localhost:8000/create_groupID/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ group_id: groupIdInput.value })  
                });
                const jsonResponse = await response.json();
                if (response.status === 201) {
                    idDisplay.textContent = jsonResponse.detail;
                    return;
                } 
                else if (response.status === 400) {
                    idDisplay.textContent = jsonResponse.detail; 
                }
                else {
                    throw new Error(jsonResponse.detail);
                }

            } catch (error) {
                console.error(error.message);
            }
        }
    });

    withoutGrouptButton.addEventListener('click', async () => {
        window.location.href = 'http://localhost:8000/main/'
    });

    withGroupButton.addEventListener('click', async () => {
        //check if groupID entered, if it exists on the server + save it as users groupID
        if(groupID.value) {
            try {    
                const response = await fetch(`http://localhost:8000/check_groupID/?group_id=${groupID.value}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const jsonResponse = await response.json();
                if (response.ok) {
                    window.location.href = `http://localhost:8000/main/?group_id=${encodeURIComponent(groupID.value)}`;
                    return;
                } 
                else if (response.status === 404) {
                    idDisplay2.textContent = jsonResponse.detail; 
                }
                else {
                    throw new Error(jsonResponse.detail);
                }

            } catch (error) {
                console.error(error.message);
            }
        }
    });
}