//--------------O B J E C T S--------------
class Record{
    constructor(website, minutes, tag){
        this.website=website;
        this.minutes=minutes;
        this.tag=tag;
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


//-----D E C L A R A T I O N S--------
const tracker = new ProductivityTracker();

// tracker.addRecord(new Record("YouTube", 34, "unproductive"));
// tracker.addRecord(new Record("Stack Overflow", 48, "productive"));
// tracker.addRecord(new Record("Google Sheets", 120, "productive"));

const form = document.querySelector(".form-input__container");
const tableBody = document.querySelector(".table__body");
const productiveTotal = document.querySelector("#productive-total");
const unproductiveTotal = document.querySelector("#unproductive-total");


//-------E V E N T  L I S T E N E R S--------
form.addEventListener("submit", function(event){
    event.preventDefault();
   //  console.log("✅ Form submitted event fired");
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

    //update table
    const newRow = document.createElement("tr")
    newRow.innerHTML = `
        <td class="table__desc">${website}</td>
        <td class="table__desc">${minutes}</td>
        <td class="table__desc">${tag}</td>
        <td class="table__desc"><button class="button table-remove__button">X</button></td>
    `;

     tableBody.appendChild(newRow);

      const totals = tracker.calculateTotals();
    console.log(totals); // for now, just show in console

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
         row.remove();
        updateTotals();
    }
    }
});






