const records = JSON.parse(localStorage.getItem("productivityRecords"));
const date = localStorage.getItem("lastSaved Date");

const today = new Date().toISOString().split('T')[0];
const dailyRecords = records.filter(r =>r.date === today);

const thisMonth = new Date().toISOString().slice(0, 7);
const monthlyRecords = records.filter(r => r.date.startsWith(thisMonth));

/*
const fakeRecords = [
  { website: "YouTube", minutes: 120, tag: "unproductive", date: "2025-10-01" },
  { website: "Stack Overflow", minutes: 90, tag: "productive", date: "2025-10-02" },
  { website: "Google Docs", minutes: 200, tag: "productive", date: "2025-10-15" },
  { website: "Facebook", minutes: 150, tag: "unproductive", date: "2025-09-28" },
  { website: "Figma", minutes: 80, tag: "productive", date: "2025-09-30" },
];

localStorage.setItem("productivityRecords", JSON.stringify(fakeRecords));
localStorage.setItem("lastSavedDate", "2025-10-22");
*/
//-------------D A I L Y  S U M M A R Y---------------


const dailyTotals = dailyRecords.reduce(
  (acc, r) => {
    if (r.tag === "productive") acc.productive += r.minutes;
    else if (r.tag === "unproductive") acc.unproductive += r.minutes;
    return acc;
  },
  { productive: 0, unproductive: 0 }
);

const total = dailyTotals.productive + dailyTotals.unproductive;
const productivePercent = total ? (dailyTotals.productive / total) * 100 : 0;
const unproductivePercent = 100 - productivePercent;
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
const siteTotals = {};

dailyRecords.forEach(r => {
  if (!siteTotals[r.website]) siteTotals[r.website] = 0;
  siteTotals[r.website] += r.minutes;
});

const sortedSites = Object.entries(siteTotals)
  .sort((a, b) => b[1] - a[1]) // sort by minutes descending
  .slice(0, 5); // top 5

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





