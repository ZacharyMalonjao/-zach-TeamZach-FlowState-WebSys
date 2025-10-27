let records = JSON.parse(localStorage.getItem("productivityRecords") || "[]");

//Delete fake data block
// records = records.filter(r => !r.date.startsWith("2025-09"));
// localStorage.setItem("productivityRecords", JSON.stringify(records));
// renderMonthlyChart(records);
//-------------------

//div debugger
// const date = localStorage.getItem("lastSavedDate");
// const debugDiv = document.querySelector("#debug-output");
// debugDiv.innerHTML = `<strong>Records:</strong> ${JSON.stringify(records)}`;


const today = new Date().toISOString().split('T')[0];
const dailyRecords = records.filter(r =>r.date === today);

const thisMonth = new Date().toISOString().slice(0, 7);
const monthlyRecords = records.filter(r => r.date.startsWith(thisMonth));


//-----=M E T H O D S --------



function calculateProductivity(records) {
  // if records array is empty or undefined
  if (!records || records.length === 0) {
    return { productive: 0, unproductive: 0 };
  }

  const totals = records.reduce(
    (acc, r) => {
      if (r.tag === "productive") acc.productive += r.minutes;
      else if (r.tag === "unproductive") acc.unproductive += r.minutes;
      return acc;
    },
    { productive: 0, unproductive: 0 }
  );

  // ✅ return the actual computed totals
  return totals;
}

function getTopSites(records, limit = 5) {
  if (!records || records.length === 0) return [];

  // Count total minutes per site
  const siteTotals = {};

  records.forEach(r => {
    if (!r.website) return; // skip if website field missing
    if (!siteTotals[r.website]) siteTotals[r.website] = 0;
    siteTotals[r.website] += r.minutes;
  });

  // Sort and return the top `limit` sites
  const sortedSites = Object.entries(siteTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

  return sortedSites; // e.g. [["YouTube", 120], ["Google Docs", 45], ...]
}
//-------------D A I L Y  S U M M A R Y---------------




const dailyTotals = calculateProductivity(dailyRecords);
const total = dailyTotals.productive + dailyTotals.unproductive;

let productivePercent = 0;
let unproductivePercent = 0;

if (total > 0) {
  productivePercent = (dailyTotals.productive / total) * 100;
  unproductivePercent = (dailyTotals.unproductive / total) * 100;
}

//   Labels
document.getElementById("productive-total").textContent =
  `${dailyTotals.productive} mins `;

document.getElementById("unproductive-total").textContent =
  `${dailyTotals.unproductive} mins `;

//chart
document.getElementById("productive-percent").textContent =
  `${productivePercent.toFixed(1)}%`;
document.getElementById("unproductive-percent").textContent =
  `${unproductivePercent.toFixed(1)}%`;

const productiveCircle = document.querySelector(".donut-productive");
const unproductiveCircle = document.querySelector(".donut-unproductive");

productiveCircle.setAttribute("stroke-dasharray", `${productivePercent} ${100 - productivePercent}`);
productiveCircle.setAttribute("stroke-dashoffset", 0);

unproductiveCircle.setAttribute("stroke-dasharray", `${unproductivePercent} ${100 - unproductivePercent}`);
unproductiveCircle.setAttribute("stroke-dashoffset", -productivePercent);

// Top Sites

const sortedSites = getTopSites(dailyRecords);

const siteList = document.querySelector(".daily-summary__site");
siteList.innerHTML = ""; // clear old ones

if (sortedSites.length === 0) {
  // If no data, show placeholder
  const li = document.createElement("li");
  li.classList.add("daily-summary__item--site");
  li.textContent = "Websites will show up here once you start tracking.";
  siteList.appendChild(li);
} else {
  // Otherwise, list top sites
  sortedSites.forEach(([site, minutes]) => {
    const li = document.createElement("li");
    li.classList.add("daily-summary__item--site");
    li.textContent = `${site} (${minutes}m)`;
    siteList.appendChild(li);
  });
}



//-----M O N T H L Y  S U M M A R Y----------

const monthlyTotals = calculateProductivity(monthlyRecords);
const totals = monthlyTotals.productive + monthlyTotals.unproductive;

//   Labels
document.getElementById("monthly-productive-total").textContent =
  `${monthlyTotals.productive} mins `;

document.getElementById("monthly-unproductive-total").textContent =
  `${monthlyTotals.unproductive} mins `;

//Top sites
const monthlySortedSites = getTopSites(monthlyRecords);

const monthlySiteList = document.querySelector(".monthly-summary__site");
monthlySiteList.innerHTML = ""; // clear old ones

if (monthlySortedSites.length === 0) {
  // If no data, show placeholder
  const li = document.createElement("li");
  li.classList.add("monthly-summary__item--site");
  li.textContent = "Websites will show up here once you start tracking.";
 monthlySiteList.appendChild(li);
} else {
  // Otherwise, list top sites
  monthlySortedSites.forEach(([site, minutes]) => {
    const li = document.createElement("li");
    li.classList.add("monthly-summary__item--site");
    li.textContent = `${site} (${minutes}m)`;
    monthlySiteList.appendChild(li);
  });
}

//---- B A R  C H A R T----
//---- B A R  C H A R T----
function renderMonthlyChart(records) {
  const chartContainer = document.querySelector(".monthly-summary__bar-chart");
  const monthHeading = document.querySelector(".monthly-summary__title");
  chartContainer.innerHTML = ""; // Clear old bars

  if (!records || records.length === 0) {
    chartContainer.textContent = "No data available for this year.";
    return;
  }

  const currentYear = new Date().getFullYear();
  const grouped = {};

  // Group records by month
  records.forEach(r => {
    const date = new Date(r.date);
    if (date.getFullYear() !== currentYear) return;

    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!grouped[monthKey]) grouped[monthKey] = { productive: 0, unproductive: 0 };

    if (r.tag === "productive") grouped[monthKey].productive += r.minutes;
    else if (r.tag === "unproductive") grouped[monthKey].unproductive += r.minutes;
  });

  const sortedMonths = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  const maxTotal = Math.max(...sortedMonths.map(([_, v]) => v.productive + v.unproductive)) || 1;

  sortedMonths.forEach(([month, data]) => {
    const group = document.createElement("div");
    group.classList.add("monthly-summary__bar-group");

    const bars = document.createElement("div");
    bars.classList.add("monthly-summary__bars");

    const productiveBar = document.createElement("div");
    productiveBar.classList.add("monthly-summary__bar", "monthly-summary--productive");
    productiveBar.style.height = `${(data.productive / maxTotal) * 100}%`;

    const unproductiveBar = document.createElement("div");
    unproductiveBar.classList.add("monthly-summary__bar", "monthly-summary--unproductive");
    unproductiveBar.style.height = `${(data.unproductive / maxTotal) * 100}%`;

    bars.appendChild(productiveBar);
    bars.appendChild(unproductiveBar);

    const label = document.createElement("p");
    label.classList.add("monthly-summary__text");
    const monthName = new Date(month + "-01").toLocaleString("default", { month: "short" });
    label.textContent = monthName;

    group.appendChild(bars);
    group.appendChild(label);
    chartContainer.appendChild(group);

    // Click handler: updates H3 heading, totals, and top sites
    group.addEventListener("click", () => {
      const monthlyRecords = records.filter(r => r.date.startsWith(month));
      const monthlyTotals = calculateProductivity(monthlyRecords);
      const total = monthlyTotals.productive + monthlyTotals.unproductive;
      const productivePercent = total ? (monthlyTotals.productive / total) * 100 : 0;
      const unproductivePercent = 100 - productivePercent;

      // Update H3 heading
      const [year, monthNumber] = month.split("-");
      const fullMonthName = new Date(year, Number(monthNumber) - 1).toLocaleString("default", { month: "long" });
      monthHeading.textContent = `Monthly Summary: ${fullMonthName}`;

      // Update totals
      document.getElementById("monthly-productive-total").textContent = `${monthlyTotals.productive} mins`;
      document.getElementById("monthly-unproductive-total").textContent = `${monthlyTotals.unproductive} mins`;
      document.getElementById("productive-percent").textContent = `${productivePercent.toFixed(1)}%`;
      document.getElementById("unproductive-percent").textContent = `${unproductivePercent.toFixed(1)}%`;

      // Update top sites
      const monthlySortedSites = getTopSites(monthlyRecords);
      const monthlySiteList = document.querySelector(".monthly-summary__site");
      monthlySiteList.innerHTML = "";
      if (monthlySortedSites.length === 0) {
        const li = document.createElement("li");
        li.classList.add("monthly-summary__item--site");
        li.textContent = "Websites will show up here once you start tracking.";
        monthlySiteList.appendChild(li);
      } else {
        monthlySortedSites.forEach(([site, minutes]) => {
          const li = document.createElement("li");
          li.classList.add("monthly-summary__item--site");
          li.textContent = `${site} (${minutes}m)`;
          monthlySiteList.appendChild(li);
        });
      }
    });
  });

  // Automatically click the current month if it exists
  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const currentMonthBar = Array.from(chartContainer.children).find(group => {
    const monthLabel = group.querySelector(".monthly-summary__text").textContent;
    const monthDate = new Date(`${monthLabel} 1`);
    const key = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;
    return key === currentMonthKey;
  });
  if (currentMonthBar) currentMonthBar.click();
}

// Call the function
renderMonthlyChart(records);








//------------F A K E  D A T A--------
// records.push(
//   { website: "Facebook", minutes: 45, tag: "unproductive", date: "2025-09-15" },
//   { website: "Google Docs", minutes: 60, tag: "productive", date: "2025-09-20" },
//   { website: "Facebook", minutes: 60, tag: "unproductive", date: "2025-08-15" },
//   { website: "Google Docs", minutes: 45, tag: "productive", date: "2025-08-20" }
// );
// localStorage.setItem("productivityRecords", JSON.stringify(records));
// renderMonthlyChart(records);




