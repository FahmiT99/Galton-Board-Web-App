var createGroupButton = document.getElementById("create-group");
var withoutGrouptButton = document.getElementById("continue-without-group");
var withGroupButton = document.getElementById("continue");
var groupID = document.getElementById("group-id");
var groupIdInput = document.getElementById("groupID_input");
var idDisplay = document.getElementById('id-display');
var idDisplay2 = document.getElementById('id-display2');



createGroupButton.addEventListener('click', async () => {
    if (groupIdInput.value) {
        const response = await fetch('http://localhost:8000/create_groupID', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ group_id: groupIdInput.value })  
        });
        const res = await response.json();
        idDisplay.textContent =  res.message;
    }
});


withoutGrouptButton.addEventListener('click', async () => {
    window.location.href = 'http://localhost:8000/main'
});

withGroupButton.addEventListener('click', async () => {
    //check if groupID entered, if it exists on the server + save it as users groupID
    if(groupID.value) {
        const response = await fetch(`http://localhost:8000/check_groupID?group_id=${groupID.value}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const res = await response.json();
        if(res.ok) {
            window.location.href = `http://localhost:8000/main?group_id=${encodeURIComponent(groupID.value)}`;
            return;
        }
        idDisplay2.textContent =  res.message;
    }
});
    
    
 