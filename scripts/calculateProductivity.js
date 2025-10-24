//--------------O B J E C T S--------------
class Record {
    constructor(website, minutes, tag, date = new Date().toISOString().split('T')[0]) {
        this.website = website;
        this.minutes = minutes;
        this.tag = tag;
        this.date = date; // format like "2025-10-22"
    }
}

class ProductivityTracker{
    constructor(){
        this.records=[]
    }

    addRecord(record){
        this.records.push(record);
    }

    calculateTotals(){
        let productive = 0;
        let unproductive = 0;

        for(let record of this.records){
            if(record.tag ==="productive") productive +=record.minutes;
            else if(record.tag ==="unproductive") unproductive +=record.minutes;

        }

        return{productive, unproductive}
    }
}


//---M E T H O D S-------
function updateTotals(){
    const totals = tracker.calculateTotals();
    productiveTotal.textContent = `${totals.productive} mins`;
    unproductiveTotal.textContent = `${totals.unproductive} mins`;

    const total = totals.productive + totals.unproductive;
    const productivePercent = total > 0 ? (totals.productive / total) * 100 : 0;
    const unproductivePercent = 100 - productivePercent;

    updateDonutChart(productivePercent.toFixed(1), unproductivePercent.toFixed(1));

}

function updateDonutChart(productivePercent, unproductivePercent) {
    const productiveCircle = document.querySelector(".donut-productive");
    const unproductiveCircle = document.querySelector(".donut-unproductive");
    const donutText = document.querySelector(".donut-text");

    productiveCircle.setAttribute("stroke-dasharray", `${productivePercent} ${100 - productivePercent}`);
    productiveCircle.setAttribute("stroke-dashoffset", 0);

    unproductiveCircle.setAttribute("stroke-dasharray", `${unproductivePercent} ${100 - unproductivePercent}`);
    unproductiveCircle.setAttribute("stroke-dashoffset", -productivePercent);

    donutText.textContent = `${productivePercent}%`;

    document.querySelector("#productive-percent").textContent = `${productivePercent}%`;
    document.querySelector("#unproductive-percent").textContent = `${unproductivePercent}%`;

}

// Load data
function loadRecords() {
    const today = new Date().toISOString().split('T')[0];
    const lastSavedDate = localStorage.getItem("lastSavedDate");
    const saved = JSON.parse(localStorage.getItem("productivityRecords")) || [];

    if (lastSavedDate === today) {
        tracker.records = saved.map(r => new Record(r.website, r.minutes, r.tag, r.date));
    } else {
        // new day, clear today's list
        tracker.records = [];
        localStorage.setItem("productivityRecords", JSON.stringify([]));
        localStorage.setItem("lastSavedDate", today);
    }
}

// Save data
function saveRecords() {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem("productivityRecords", JSON.stringify(tracker.records));
    localStorage.setItem("lastSavedDate", today);
}




//-----D E C L A R A T I O N S--------
const tracker = new ProductivityTracker();


const form = document.querySelector(".form-input__container");
const tableBody = document.querySelector(".table__body");
const productiveTotal = document.querySelector("#productive-total");
const unproductiveTotal = document.querySelector("#unproductive-total");


//----I N I T--------
loadRecords();

for (let record of tracker.records) {
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td class="table__desc">${record.website}</td>
        <td class="table__desc">${record.minutes}</td>
        <td class="table__desc">${record.tag}</td>
        <td class="table__desc"><button class="button table-remove__button">X</button></td>
    `;
    tableBody.appendChild(newRow);
}
updateTotals();

//-------E V E N T  L I S T E N E R S--------
form.addEventListener("submit", function(event){
    event.preventDefault();
   
    //Get values
    const website = document.querySelector("#website").value;
    const minutes = parseInt(document.querySelector("#minutes").value);
    const tag = document.querySelector('input[name="productivity"]:checked').value;
   
    const totalsNow = tracker.calculateTotals();
    const currentTotal = totalsNow.productive + totalsNow.unproductive;

    if(currentTotal + minutes > 1440){
        alert('Cannot add minutes because it exceeds the minutes in a day (1440)');
        return;

    }


    //create record
    const record = new Record(website, minutes, tag);
    tracker.addRecord(record);

     saveRecords();
    console.log("LocalStorage content:");
for (let key in localStorage) {
  if (localStorage.hasOwnProperty(key)) {
    console.log(key, localStorage.getItem(key));
  }
}

    //update table
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td class="table__desc">${website}</td>
        <td class="table__desc">${minutes}</td>
        <td class="table__desc">${tag}</td>
        <td class="table__desc"><button class="button table-remove__button">X</button></td>
    `;
    tableBody.appendChild(newRow);


      //const totals = tracker.calculateTotals();
   // console.log(totals); // for now, just show in console

    updateTotals();
  
   
    form.reset();
});

tableBody.addEventListener("click", function(event){
    if(event.target.classList.contains("table-remove__button")){
        const row = event.target.closest("tr");
        const website = row.children[0].textContent;
        const minutes = parseInt(row.children[1].textContent);
        const tag = row.children[2].textContent;

        const confirmDelete = confirm(`Are you sure you want to delete the record for "${website}" (${minutes} mins)?`);
       
        if (confirmDelete) {

        tracker.records = tracker.records.filter(record => {
            return !(record.website === website && record.minutes === minutes && record.tag === tag);
        });
        saveRecords();
         row.remove();
        updateTotals();
    }
    }
});


