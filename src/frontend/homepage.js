var createGroupButton = document.getElementById("create-group");
var withoutGrouptButton = document.getElementById("continue-without-group");
var withGroupButton = document.getElementById("continue");
var groupID = document.getElementById("group-id");
var groupIdInput = document.getElementById("groupID_input");
var idDisplay = document.getElementById('id-display');
var idDisplay2 = document.getElementById('id-display2');



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
    
    
 