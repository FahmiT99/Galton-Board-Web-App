var createGroupButton = document.getElementById("create-group");
var withoutGrouptButton = document.getElementById("continue-without-group");
var withGroupButton = document.getElementById("continue");
var groupID = document.getElementById("group-id");
var idDisplay = document.getElementById('id-display');


createGroupButton.addEventListener('click', async () => {
    const response = await fetch('http://localhost:8000/generate-groupID');
    const data = await response.json();
    console.log('Generated ID:', data.id);
    
    idDisplay.textContent = 'Gruppenname: ' + data.id;
});


withoutGrouptButton.addEventListener('click', async () => {
    window.location.href = 'http://localhost:8000/loadMain'
});

withGroupButton.addEventListener('click', async () => {
    //check if groupID entered, if it exists on the server + save it as users groupID
    
    
    window.location.href = 'http://localhost:8000/loadMain'
});