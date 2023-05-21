let currentTimer;
let timers = {};

// Data module
const Data = (function() {
  let idCounter = 0;
  
  const Items = function(name, time) {
    this.id = idCounter++;
    this.name = name;
    this.time = time;
    this.utcTime = Data.UTC();
  }

  const ItemsState = {
    itemsArray: [],
  }

  function saveToLocalStorage() {
    const plainItems = ItemsState.itemsArray.map(item => ({ ...item }));
    localStorage.setItem("itemsArray", JSON.stringify(plainItems));
  }

  function loadFromLocalStorage() {
    const itemsArray = JSON.parse(localStorage.getItem("itemsArray"));
    if (itemsArray) {
      ItemsState.itemsArray = itemsArray;
      idCounter = Math.max(...itemsArray.map(item => item.id), -1) + 1;
    }
  }

  function loadListItemsFromLocalStorage() {
    Data.loadFromLocalStorage();
    const { ItemsState } = Data.DataOut();
    ItemsState.itemsArray.forEach(item => {
      UI.AddToList(item.name, item.time, item.id);
    });
  }

  function UTC() {
    return Date.now();
  }

  return {
    DataOut: () => ({ ItemsState, Items }),
    DeBug: () => ({ itemsArray: ItemsState.itemsArray }),
    saveToLocalStorage: saveToLocalStorage,
    loadFromLocalStorage: loadFromLocalStorage,
    loadListItemsFromLocalStorage: loadListItemsFromLocalStorage,
    UTC: UTC,
  }
})();

// UI module
const UI = (function() {
  const htmlSelectors = {
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
    MainList: "#MainList"
  }

  function timer(input1, input2, li, id) {
    let item = Data.DataOut().ItemsState.itemsArray.find(i => i.id === id);
    if (item) {
      let timeArray = item.time.split(":");
      let days = parseInt(timeArray[0]);
      let hours = parseInt(timeArray[1]);
      let minutes = parseInt(timeArray[2]);
      let seconds = parseInt(timeArray[3]);
      let currentUTC = Data.UTC();

      let diff = (currentUTC - item.utcTime) / 1000;
      seconds -= diff;
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

      if (days < 0) {
        clearInterval(timers[id]);
        li.innerHTML = `${input1}<br>Vreme je isteklo
        <button class="btn badge btn-outline-light" id="Edit">X</button>`;
      } else {
        li.innerHTML = `${input1}<br>${days.toString().padStart(2, "0")}:${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${Math.trunc(seconds).toString().padStart(2, "0")}
        <button class="btn badge btn-outline-light" id="Edit">X</button>`;
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

          if (days < 0) {
            clearInterval(timers[id]);
            li.innerHTML = `${input1}<br>Vreme je isteklo
            <button class="btn badge btn-outline-light" id="Edit">X</button>`;
          } else {
            li.innerHTML = `${input1}<br>${days.toString().padStart(2, "0")}:${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${Math.trunc(seconds).toString().padStart(2, "0")}
            <button class="btn badge btn-outline-light" id="Edit">X</button>`;
          }
        }, 1000);
      }
    }
  }

  function AddToList(input1, input2, id) {
    const li = document.createElement('li');
    li.className = 'list-group-item bg-dark text-white d-flex justify-content-between align-items-center lista';
    li.setAttribute("data-id", id);
    li.setAttribute("data-name", input1);
    li.setAttribute("data-name2", input2);
    document.querySelector(htmlSelectors.MainList).appendChild(li);
    timer(input1, input2, li, id);
  }

  function clearList() {
    const list = document.querySelector(htmlSelectors.MainList);
    while (list.firstChild) {
      list.firstChild.remove();
    }
  }

  function initEventListener() {
    const button1 = document.querySelector(htmlSelectors.button1);
    const button2 = document.querySelector(htmlSelectors.button2);
    const button3 = document.querySelector(htmlSelectors.button3);
    const button4 = document.querySelector(htmlSelectors.button4);
    const btn_clear = document.querySelector(htmlSelectors.btn_clear);

    button1.addEventListener('click', function(e) {
        e.preventDefault();
        const input1 = document.querySelector(htmlSelectors.input1).value;
        const input12 = document.querySelector(htmlSelectors.input12).value || "00";
        const input13 = document.querySelector(htmlSelectors.input13).value || "00";
        const input14 = document.querySelector(htmlSelectors.input14).value || "00";
        const input15 = document.querySelector(htmlSelectors.input15).value || "00";
        
        const input2 = input12 + ":" + input13 + ":" + input14 + ":" + input15;
      
        if (input1 !== "") {
          const { Items, ItemsState } = Data.DataOut();
          const newItem = new Items(input1, input2);
          ItemsState.itemsArray.push(newItem);
          Data.saveToLocalStorage();
          UI.AddToList(input1, input2, newItem.id);
        }
      
        document.querySelector(htmlSelectors.input1).value = "";
        document.querySelector(htmlSelectors.input12).value = "";
        document.querySelector(htmlSelectors.input13).value = "";
        document.querySelector(htmlSelectors.input14).value = "";
        document.querySelector(htmlSelectors.input15).value = "";
      });

    button2.addEventListener('click', function(e) {
      e.preventDefault();
      const { ItemsState } = Data.DataOut();
      clearList();
      ItemsState.itemsArray = [];
      Data.saveToLocalStorage();
    });

    button3.addEventListener('click', function(e) {
      e.preventDefault();
      const { ItemsState } = Data.DataOut();
      clearList();
      ItemsState.itemsArray.forEach(item => {
        AddToList(item.name, item.time, item.id);
      });
    });

    button4.addEventListener('click', function(e) {
      e.preventDefault();
      const { ItemsState } = Data.DataOut();
      clearList();
      ItemsState.itemsArray.forEach(item => {
        if (item.name.includes(document.querySelector(htmlSelectors.input1).value)) {
          AddToList(item.name, item.time, item.id);
        }
      });
    });

    btn_clear.addEventListener('click', function(e) {
      e.preventDefault();
      document.querySelector(htmlSelectors.input1).value = "";
    });

    document.querySelector(htmlSelectors.MainList).addEventListener('click', function(e) {
      if (e.target.id === "Edit") {
        const { ItemsState } = Data.DataOut();
        const li = e.target.parentElement;
        const id = parseInt(li.getAttribute("data-id"));
        const index = ItemsState.itemsArray.findIndex(item => item.id === id);
        ItemsState.itemsArray.splice(index, 1);
        Data.saveToLocalStorage();
        li.remove();
        clearInterval(timers[id]);
      }
    });
  }

  return {
    AddToList: AddToList,
    clearList: clearList,
    initEventListener: initEventListener,
  }
})();

// App module
const App = (function(UI, Data) {
  function init() {
    Data.loadListItemsFromLocalStorage();
    UI.initEventListener();
  }

  return {
    init: init,
  }
})(UI, Data);

App.init();
