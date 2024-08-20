import { v4 as uuidv4 } from './node_modules/uuid/dist/esm-browser/index.js';


// Function to generate a UUID and ensure it's unique
async function generateUUID() {
    const urlParams = new URLSearchParams(window.location.search);
    let userId = urlParams.get('user_id');

    // if there is one check wether its in the db
    if (userId) {
        let nexists = await check_userId(userId);
        if(nexists) {
            return userId;
        }
    }

    userId = uuidv4();
    let exists = await createUserId(userId);
    
    //check if userID already exists
    while (exists) {
        userId = uuidv4();
        exists = await createUserId(userId);
    }
    
    window.location.search = '?user_id=' + userId;
    
    return userId;
}

// Function to create a new user ID in the database
async function createUserId(userId) {
    try {    
        const response = await fetch(`/create_userID/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id: userId })  
        });
        const jsonResponse = await response.json();

        if (response.status === 201) {
            return false;
        } 
        else if (response.status === 400) {
            return true;
        }
        else {
            throw new Error(jsonResponse.detail);
        }

    } catch (error) {
        console.error(error.message);
    }
}

// Function to check if a user ID exists in the database
async function check_userId(userId) {
    try {    
        const response = await fetch(`/check_userID/?user_id=${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const jsonResponse = await response.json();

        if (response.ok) {
            return true;
        } 
        else if (response.status === 404) {
            
            return false;
        }
        else {
            throw new Error(jsonResponse.detail);
        }

    } catch (error) {
        console.error(error.message);
    }
}

// Generate a UUID for the user on load
const userId = await generateUUID();

// Event listeners and UI interactions
const skipButton = document.getElementById("skip-button");
const ctaContainer = document.getElementById('cta-container');

function handleClick() {
    ctaContainer.scrollIntoView({ behavior: 'smooth' });
    attachEventListeners(); // Re-attach event listeners to the new elements
}

    // getStartedButton.addEventListener('click', handleClick);
skipButton.addEventListener('click', handleClick);


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
 

function attachEventListeners() {
    const createGroupButton = document.getElementById("create-group");
    const withoutGrouptButton = document.getElementById("continue-without-group");
    const withGroupButton = document.getElementById("continue");
    const groupID = document.getElementById("group-id");
    const groupIdInput = document.getElementById("groupID_input");
    const idDisplay = document.getElementById('id-display');
    const idDisplay2 = document.getElementById('id-display2');


    // Event listener for creating a group
    createGroupButton.addEventListener('click', async () => {
        if (groupIdInput.value) {
            try {
                const response = await fetch('/create_groupID/', {
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

    // Event listener for continuing without a group
    withoutGrouptButton.addEventListener('click', async () => {

        if (userId) {
            window.location.href = `/main?user_id=${userId}`;
        }
        
    });

    // Event listener for continuing with a group
    withGroupButton.addEventListener('click', async () => {
        //check if groupID entered, if it exists on the server + save it as users groupID
        if(groupID.value) {
            try {    
                const response = await fetch(`/check_groupID/?group_id=${groupID.value}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const jsonResponse = await response.json();
                if (response.ok) {
                    window.location.href = `/main/?group_id=${groupID.value}&user_id=${userId}`;
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
