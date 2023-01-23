let currentTimer;
let timers = {};
//Data module
const Data = (function(){
    // Declare a counter to keep track of the unique id for each item
    let idCounter = 0;
    
    // Constructor function for creating an item object
    const Items = function(name,time){
        this.id = idCounter++; // increment id counter
        this.name = name;
        this.time = time;
        this.utcTime = Data.UTC(); // add the current UTC time to the item object
    }
    
    // Object to store the array of items
    const ItemsState = {
        itemsArray: [],
    }
    
    // Function to save the items array to local storage
    function saveToLocalStorage() {
        // Convert the item objects to plain objects to store in local storage
        const plainItems = ItemsState.itemsArray.map(item => Object.assign({}, item));
        localStorage.setItem("itemsArray", JSON.stringify(plainItems));
    }
    
    // Function to load the items array from local storage
    function loadFromLocalStorage() {
        const itemsArray = JSON.parse(localStorage.getItem("itemsArray"));
        if (itemsArray) {
            ItemsState.itemsArray = itemsArray;
            // Update the idCounter to the highest id in the loaded array
            idCounter = Math.max(...itemsArray.map(item => item.id), -1) + 1;
        }
    }
    
    // Function to load the list items from local storage and add them to the UI
    function loadListItemsFromLocalStorage(){
        Data.loadFromLocalStorage();
        const {ItemsState} = Data.DataOut();
        ItemsState.itemsArray.forEach(item => {
          UI.AddToList(item.name, item.time, item.id);
        });
      }

      // Function to return current UTC time
      function UTC(){
        return Date.now();
      }

    // Object returned by the module
    return {
        DataOut: () => ({ ItemsState, Items}),
        DeBug: () => ({itemsArray:ItemsState.itemsArray}),
        saveToLocalStorage: saveToLocalStorage,
        loadFromLocalStorage: loadFromLocalStorage,
        loadListItemsFromLocalStorage: loadListItemsFromLocalStorage,
        UTC: UTC,
    }
})();
//UI module
const UI = (function(){
    // Object containing all the selectors for the HTML elements used in this code
    const htmlSelectors ={
        input1: '#input1',
        input12: '#input12',
        input13: '#input13',
        input14: '#input14',
        input15: '#input15',
        button1: '#button1',
        button2: '#button2',
        button3: '#button3',
        button4: '#button4',
        btn_clear: '#btn-clear',
        MainList:"#MainList"
    }

    // Function that sets a timer for a specific list item
    function timer(input1,input2,li,id) {
        // Find the item in the data array that matches the given id
        let item = Data.DataOut().ItemsState.itemsArray.find(i => i.id === id);
        if (item) {
            // Split the time string into an array of days, hours, minutes, and seconds
            let timeArray = item.time.split(":");
            let days = timeArray[0];
            let hours = timeArray[1];
            let minutes = timeArray[2];
            let seconds = timeArray[3];
            let currentUTC = Data.UTC();
            // Calculate the difference between the current UTC time and the item's UTC time
            let diff = (currentUTC - item.utcTime)/1000;
            // Subtract the difference from the seconds
            seconds -= diff;
            // Decrement minutes and hours as needed if seconds become negative
            while (seconds < 0) {
                seconds += 60;
                minutes--;
            }
            while (minutes < 0) {
                minutes += 60;
                hours--;
            }
            while (hours < 0) {
                hours += 24;
                days--;
            }
            // If days are negative, clear the interval and display that time has expired
            if (days < 0) {
                clearInterval(timers[id]);
                li.innerHTML = `${input1}<br>Vreme je isteklo
                <button class="btn badge btn-outline-light" id="Edit">X</button>`;
            } else {
                // Else, display the remaining time on the item
                li.innerHTML = `${input1}<br>${days.toString().padStart(2, "0")}:${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${Math. trunc(seconds).toString().padStart(2, "0")}
                <button class="btn badge btn-outline-light" id="Edit">X</button>`;
                // Set a new interval that decrements the seconds every second
                timers[id] = setInterval(() => {
                    seconds--;
                    while (seconds < 0) {
                        seconds += 60;
                        minutes--;
                    }
                    while (minutes < 0) {
                        minutes += 60;
                        hours--;
                    }
                    while (hours < 0) {
                        hours += 24;
                        days--;
                    }
                    // If days are negative, clear the interval and display that time has expired
                    if (days < 0) {
                        clearInterval(timers[id]);
                        li.innerHTML = `${input1}<br>Vreme je isteklo
                        <button class="btn badge btn-outline-light" id="Edit">X</button>`;
                    } else {
                        // Else, display the remaining time on the item
                        li.innerHTML = `${input1}<br>${days.toString().padStart(2, "0")}:${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${Math.trunc(seconds).toString().padStart(2, "0")}
                        <button class="btn badge btn-outline-light" id="Edit">X</button>`;
                        item.utcTime = currentUTC; 
                        // Save the updated UTC time to local storage
                        Data.saveToLocalStorage(); 
                    }
                }, 1000);
            }
        }
    }

    // Function that updates a list item with new input1 and input2 values
    function UpdateList(input1,input2,id){
        // Select the list item that matches the given id
        const li = document.querySelector(`li[data-id='${id}']`);
        // Set the "data-name" and "data-name2" attributes to the new input1 and input2 values
        li.setAttribute("data-name", input1);
        li.setAttribute("data-name2", input2);

        // Clear the interval for this item
        clearInterval(timers[id]);
        // Set a new timer for the updated item
        timer(input1,input2,li, id);
    }

    // Function that adds a new list item with the given input1, input2, and id values
    function AddToList(input1,input2,id){
        // Create a new list item
        const li = document.createElement('li');
        // Set the class and "data-id", "data-name", and "data-name2" attributes for the new list item
        li.className = 'list-group-item bg-dark text-white d-flex justify-content-between align-items-center lista';
        li.setAttribute("data-id", id);
        li.setAttribute("data-name", input1);
        li.setAttribute("data-name2", input2);
        // Append the new list item to the "MainList" element
        document.querySelector(htmlSelectors.MainList).appendChild(li);
        // Set a timer for the new list item
        timer(input1,input2,li, id);
    }
    // Object returned by the module
    return {
        TakeSelectors: () => htmlSelectors,
        htmlSelectors: htmlSelectors,
        AddToList: AddToList,
        UpdateList: UpdateList,
    }
})();

//App module
const App = (function(Data, UI){
    const HtmlSelectors = UI.TakeSelectors();
    const AddToList = UI.AddToList;
    const DataItems = Data.DataOut();
    let selectedId,selectedList;
    document.querySelector(HtmlSelectors.MainList).addEventListener('click',Edit)
    document.querySelector(HtmlSelectors.button1).addEventListener('click',ADDTASK)
    document.querySelector(HtmlSelectors.button2).addEventListener('click',UPDATETASK)
    document.querySelector(HtmlSelectors.button3).addEventListener('click',DELETETASK)
    document.querySelector(HtmlSelectors.button4).addEventListener('click',BACK)
    document.querySelector(HtmlSelectors.btn_clear).addEventListener('click',btn_clear)
    
    // This function clears the Local Storage and the DataItems array
    function btn_clear() {
        try {
            localStorage.clear();
            Data.DataOut().ItemsState.itemsArray = [];
            document.querySelector('.lista').parentElement.innerHTML="";
            TasksCounter();
        } catch (error) {
            Error('Svaki task je vec obrisan');
        }
    }

    // This function returns an object containing the selected item's id and list.
    function getSelecteditem() {
        const ItemSelectors ={
            selectedId,
            selectedList,
        }
        return {        
            ItemSelectors
        }
    }
    // This function displays an error message in the UI.
    function Error(Reason){
        const container = document.querySelector("#alert");
        let alertDiv = document.querySelector(".alert");
        if (alertDiv) {
            alertDiv.remove();
        }
        // Create a new div to hold the alertDiv
        const centerDiv = document.createElement("div");
        centerDiv.style.margin = "auto";
        centerDiv.style.textAlign = "center";
        // Create the alertDiv
        alertDiv = document.createElement("div");
        alertDiv.classList.add("alert", "alert-warning", "col-12");
        alertDiv.setAttribute("role", "alert");
        alertDiv.innerHTML = Reason;
        // Append the alertDiv to the centerDiv
        centerDiv.appendChild(alertDiv);
        // Insert the centerDiv before the container
        container.insertAdjacentElement("beforebegin", centerDiv);
        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    }
    // This function adds a new task to the DataItems array and the UI.
    function ADDTASK() {
        // Get the input values for the task's name and time.
        const input1 = document.querySelector(HtmlSelectors.input1).value;
        const input12 = document.querySelector(HtmlSelectors.input12).value;
        const input13 = document.querySelector(HtmlSelectors.input13).value;
        const input14 = document.querySelector(HtmlSelectors.input14).value;
        const input15 = document.querySelector(HtmlSelectors.input15).value;
        const input2 = input12 + ":" + input13 + ":" + input14 + ":" + input15;
    
        // Regular expression for time validation
        const pattern = new RegExp("^\\d{1,2}:\\d{1,2}:\\d{1,2}:\\d{1,2}$");
        // Check if the time input is valid
        if (pattern.test(input2)) {
            if (input1 !== "" && input13 !== "" && input14 !== "" && input15) {
                // Create a new task object
                const newItem = new DataItems.Items(input1, input2);
                // Check if the task name already exists
                if(!DataItems.ItemsState.itemsArray.some(x => x.name === input1)){
                    // Add the task to the DataItems array
                    DataItems.ItemsState.itemsArray.push(newItem);
                    // Add the task to the UI
                    AddToList(input1,input2,newItem.id);
                    // Go back to the main view
                    BACK();
                    // Update the task count
                    TasksCounter();
                }else{
                    Error("Task sa tim imenom je vec unet");
                }
            }
            else{
                Error("Vrednost mora biti upisana u oba polja");
            }
        }
        else{
            Error("Vreme je neispravno,format je dd:hh:mm:ss");
        }
    }
    function UPDATETASK() {
        // Get the selected item's id and list.
        const selectedId = parseInt(getSelecteditem().ItemSelectors.selectedId);
        const selectedList = getSelecteditem().ItemSelectors.selectedList;
        // Get the input values for the task's name and time.
        const input1 = document.querySelector(HtmlSelectors.input1).value;
        const input12 = document.querySelector(HtmlSelectors.input12).value;
        const input13 = document.querySelector(HtmlSelectors.input13).value;
        const input14 = document.querySelector(HtmlSelectors.input14).value;
        const input15 = document.querySelector(HtmlSelectors.input15).value;
        const input2 = input12 + ":" + input13 + ":" + input14 + ":" + input15;
    
        // Regular expression for time validation
        const pattern = new RegExp("^\\d{1,2}:\\d{1,2}:\\d{1,2}:\\d{1,2}$");
        // Check if the time input is valid
        if (pattern.test(input2)) {
            if (input1 !== "" && input13 !== "" && input14 !== "" && input15) {
                // Find the selected task object in the DataItems array
                const selectedTask = DataItems.ItemsState.itemsArray.find(x => x.id === selectedId);
                // Check if the task name already exists
                if(!DataItems.ItemsState.itemsArray.some(x => x.name === input1 && x.id !== selectedId)){
                    // Update the task object with the new values
                    selectedTask.name = input1;
                    selectedTask.time = input2;
                    // Update the task in the UI
                    selectedList.textContent = input1;
                    selectedList.nextElementSibling.textContent = input2;
                    // Go back to the main view
                    BACK();
                }else{
                    Error("Task sa tim imenom je vec unet");
                }
            }
            else{
                Error("Vrednost mora biti upisana u oba polja");
            }
        }
        else{
            Error("Vreme je neispravno,format je dd:hh:mm:ss");
        }
    }
    function DELETETASK() {
        // Get the selected item's id.
        const selectedId = parseInt(getSelecteditem().ItemSelectors.selectedId);
        // Find the selected task object in the DataItems array
        const selectedItemToDelete = DataItems.ItemsState.itemsArray.find(item => item.id === selectedId)
        // Remove the selected task object from the DataItems array
        DataItems.ItemsState.itemsArray.splice(DataItems.ItemsState.itemsArray.indexOf(selectedItemToDelete), 1);
        // Find the selected task element in the UI
        const selectedLi = document.querySelector(`li[data-id="${selectedId}"]`);
        // Get the parent element of the selected task element
        const parent = selectedLi.parentElement;
        // Remove the selected task element from the UI
        parent.removeChild(selectedLi);
        // Go back to the main view
        BACK();
        // Update the task count
        TasksCounter();
        // Save the updated task list to local storage
        Data.saveToLocalStorage();
    }
    function BACK() {
        // Clear the input fields
        document.querySelector(HtmlSelectors.input1).value = "";
        document.querySelector(HtmlSelectors.input12).value = "";
        document.querySelector(HtmlSelectors.input13).value = "";
        document.querySelector(HtmlSelectors.input14).value = "";
        document.querySelector(HtmlSelectors.input15).value = "";
    
        // Hide the update and delete buttons
        document.querySelectorAll("#button2, #button3, #button4").forEach(el => el.classList.add("d-none"));
        // Show the add button
        document.getElementById("button1").classList.remove("d-none");
    }
    function Edit(e) {
        // Check if the clicked element is the "Edit" button
        if(e.target.id === "Edit") {
            // Get the selected list element
            selectedList = e.target.parentElement;
            // Get the selected task's id
            selectedId = e.target.parentElement.getAttribute('data-id');
            // Split the selected task's time into an array
            ArraySplit = e.target.parentElement.getAttribute('data-name2').split(":");
    
            // Show the update and delete buttons
            document.querySelectorAll("#button2, #button3, #button4").forEach(el => el.classList.remove("d-none"));
            // Hide the add button
            document.getElementById("button1").classList.add("d-none");
    
            // Find the selected task object in the DataItems array
            const selectedItemToUpdate = DataItems.ItemsState.itemsArray.find(item => item.id === Number(selectedId));
            // Set the input fields to the selected task's name and time
            document.querySelector(HtmlSelectors.input1).value = selectedItemToUpdate.name;
    
            document.querySelector(HtmlSelectors.input12).value = ArraySplit[0];
            document.querySelector(HtmlSelectors.input13).value = ArraySplit[1];
            document.querySelector(HtmlSelectors.input14).value = ArraySplit[2];
            document.querySelector(HtmlSelectors.input15).value = ArraySplit[3];
        }
    }
    function TasksCounter(){
        // Get the task count element
        const tasksCounter = document.getElementById("TasksCounter");
        // Get the number of tasks
        const taskCount = DataItems.ItemsState.itemsArray.length;
        // Update the task count element
        tasksCounter.innerHTML = `<h1>Number of Tasks: ${taskCount}</h1>`;
    }
    // Object returned by the module
    return {
        TasksCounter: TasksCounter,
    }

}) (Data, UI);

document.addEventListener("DOMContentLoaded", function(){
    // Load list items from local storage
    Data.loadListItemsFromLocalStorage();
    // Update the task count
    App.TasksCounter();
});