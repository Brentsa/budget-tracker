//var to hold database connection
var db;
var dbName = "BudgetTrackerDatabase";

//establish a connection to indexedDb database, using version 1
const request = indexedDB.open(dbName, 1)

//called when database first updated or created
request.onupgradeneeded = function(event){
    //save a reference to a db on upgrade
    const db = event.target.result;

    //create a new object store from our local databae connection
    db.createObjectStore("Transactions", {autoIncrement: true});
}

//event handler that gets called on database failure
request.onerror = function(event){
    console.log("Database error: " + event.target.errorCode);
}

//event handler on successful idb creation that sets the db to the success result
//Will run every time we interact with the database
request.onsuccess = function(event){
    console.log("Indexed DB connected successfully.");
    db = event.target.result;

    //check if the application is connected to the internet
    if(navigator.onLine){
        uploadTransaction();
    }
}

//This function will be called if we submit a new budget transaction but there is no internet
//Save the transaction record into indexedDB
function saveRecord(record){
    //create a transaction with the obj store with readwrite capabilites
    const transaction = db.transaction(["Transactions"], 'readwrite');

    //Access the Transactions object store
    const budgetObjectStore = transaction.objectStore("Transactions");

    //Add the record to our transaction store using add method
    budgetObjectStore.add(record);

    alert("Transaction has been saved in temporary storage until an internet connection has been reestablished.")
}

//This function will be called to collect the data from indexed db and POST it to the server
function uploadTransaction(){
    const transaction = db.transaction(["Transactions"], 'readwrite');
    const budgetObjectStore = transaction.objectStore("Transactions");
    
    //Get all the transactions in the indexedDB store and save them
    const allRecords = budgetObjectStore.getAll();

    //upon successful .getAll() run the following funtion
    allRecords.onsuccess = function(){
        //if there is data in the indexed store, send it to the server
        if(allRecords.result.length > 0){
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(allRecords.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if(serverResponse.message){
                    throw new Error(serverResponse);
                }

                const transaction = db.transaction(["Transactions"], 'readwrite');
                const budgetObjectStore = transaction.objectStore("Transactions");
                budgetObjectStore.clear();

                alert('All saved transactions have been submitted!');
                window.location.reload();
            })
            .catch(error => console.log(error));
        }
    }
}

//Listener to check if the internet connection is restored
window.addEventListener('online', uploadTransaction);