// Algolia parameters
API_KEY = "6be0576ff61c053d5f9a3225e2a90f76";
APPLICATION_ID = "latency";
INDEX = "instant_search";
const url = `https://${APPLICATION_ID}-dsn.algolia.net/1/indexes/${INDEX}/query`;

// Initialize variables
let current_page = 0;
let hits_array = [];
var timerId;

// CSS Selectors
let search_results_container = document.getElementById("search-results");
var to_top_botton = document.getElementById("go-to-top");

function renderHitTemplate(name, description) {
  return `
    <div class=card>
    <div class=title>${name}</div>
    <div> ${description} </div>
    </div>
`;
}

function debounce(func, delay, arguments) {
  // Cancels the setTimeout method execution
  clearTimeout(timerId);

  // Executes the func after delay time.
  timerId = setTimeout(func, delay, arguments);
}

function resetResults() {
  hits_array = [];
  search_results_container.innerHTML = "";
  current_page = 0;
}

function searchboxEntry(query) {
  resetResults();
  search(query).then((data) => {
    hits_array.push(...data.hits);
    hits_array.forEach((hit) => {
      search_results_container.innerHTML += renderHitTemplate(
        hit.name,
        hit.description
      );
    });
  });
}

function debouncedSearch(query) {
  debounce(searchboxEntry, 500, { query });
}

// Append a new page a results from Algolia
function appendSearchResults() {
  query = search(document.getElementById("searchinput").value);
  search(query).then((data) => {
    hits_array.push(...data.hits);
    hits_array.forEach((hit) => {
      search_results_container.innerHTML += renderHitTemplate(
        hit.name,
        hit.description
      );
    });
    current_page += 1;
  });
}

// Algolia API call
async function search(query) {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Algolia-API-Key": API_KEY,
      "X-Algolia-Application-Id": APPLICATION_ID,
    },
    body: JSON.stringify({
      query: query,
      hitsPerPage: 10,
      page: current_page,
    }),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
    })
    .catch((error) => {
      console.log("error:", error);
    });
}

// Show / Hide the nav button depending on scroll location
function showNavButton() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    to_top_botton.style.display = "block";
  } else {
    to_top_botton.style.display = "none";
  }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

window.onscroll = () => {
  showNavButton();
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
    if (current_page >= 2) {
      console.log("Ok enough scrolling");
    } else {
      appendSearchResults();
    }
  }
};
