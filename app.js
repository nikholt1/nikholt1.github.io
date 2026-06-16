document.addEventListener("DOMContentLoaded", () => initApp());

let num = 1;
let counterNum = 1;
function initApp() {
    console.log("DOM LOADED");

    document.getElementById("helloBtn")
        .addEventListener("click", () => {
            document.getElementById("buttonPressText").innerText =
                "you clicked the button";
        });

    document.getElementById("backgroundBtn")
        .addEventListener("click", changebackground);

    document.getElementById("listItemAddBtn")
        .addEventListener("click", addItemToList);

    document.getElementById("removeItem")
        .addEventListener("click", removeLastFromList);

    document.getElementById("clearAllBtn")
        .addEventListener("click", clearAllItems);

    document.getElementById("addCounterBtn")
        .addEventListener("click", addToCounter);

    document.getElementById("resetCounterBtn")
        .addEventListener("click", resetCounter);

    document.getElementById("heightlightBtn")
        .addEventListener("click", hightlight);

    const highlightBoxesContainer = document.getElementById("highlightBoxesContainer");
    highlightBoxesContainer.style.display = "flex";
    highlightBoxesContainer.style.flexDirection = "row";

    const counter = document.getElementById("counter");
    counter.innerText = `${counterNum}`

    document.getElementById("listItemAddBtn")
        .addEventListener("click", addItemToList);

    document.getElementById("addBubble").addEventListener("click", () => addItemToBubbleList())

    const bubbleItems = document.getElementById("bubbleItems");
    bubbleItems.addEventListener("click", (e)=> {
        if(e.target.classList.contains("deleteBtn")) {
            e.stopPropagation();
            e.target.parentElement.remove();
            return;
        }
        if (e.target.classList.contains("bubble-item")) {
            e.target.remove();
        }
    })

    const listItems = document.getElementById("listItems");

// EVENT DELEGATION (THE IMPORTANT PART)
    listItems.addEventListener("click", (e) => {
        // If delete button clicked → remove ONLY the item
        if (e.target.classList.contains("deleteBtn")) {
            e.stopPropagation();
            e.target.parentElement.remove();
            return;
        }

        // Otherwise clicking anywhere in LI deletes it
        if (e.target.classList.contains("list-item")) {
            e.target.remove();
        }
    });
}

function addItemToBubbleList() {
    const bubbleList = document.getElementById("bubbleItems");
    const item = document.createElement("div")
    item.classList.add("bubble-item");
    item.style.padding = "10px";
    item.style.margin = "5px";
    item.style.background = "lightgray";
    item.style.cursor = "pointer";
    item.innerHTML = `
        Item ${bubbleList.children.length + 1}
        <button class="deleteBtn">X</button>
    `;

    bubbleList.appendChild(item);
}

function changebackground() {
    const listOfColors = ["red", "blue", "green", "orange"];

    const randomIndex = Math.floor(Math.random() * listOfColors.length);

    document.body.style.background = listOfColors[randomIndex];
}

function addItemToList() {
    const listItems = document.getElementById("listItems");

    const item = document.createElement("div");
    item.classList.add("list-item");

    item.style.padding = "10px";
    item.style.margin = "5px";
    item.style.background = "lightgray";
    item.style.cursor = "pointer";

    item.innerHTML = `
        Item ${listItems.children.length + 1}
        <button class="deleteBtn">X</button>
    `;

    listItems.appendChild(item);
}
function removeLastFromList() {
    const listItems = document.getElementById("listItems");

    if(listItems.lastElementChild) {
        listItems.removeChild(listItems.lastElementChild)
        num--;
    }

}

function clearAllItems() {
    const listItems = document.getElementById("listItems");

    listItems.innerHTML = "";
}

function addToCounter() {
    const counter = document.getElementById("counter");
    counterNum += 1;
    counter.innerText = `${counterNum}`

}

function resetCounter() {
    const counter = document.getElementById("counter");
    counterNum = 0;
    counter.innerText = `${counterNum}`
}

function hightlight() {
    for (let i = 0; i < 4; i++) {
        document.getElementById(`box${i}`).style.background = "red";

    }

    let number = Math.floor(Math.random() * 4);
    console.log(number);
    document.getElementById(`box${number}`).style.background = "yellow";

}