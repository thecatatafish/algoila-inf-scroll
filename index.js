// Settings
const MAX_PAGES_INF_SCROLL = 2;


// Algolia parameters
const API_KEY = "6be0576ff61c053d5f9a3225e2a90f76";
const APPLICATION_ID = "latency";
const INDEX = "instant_search";
const url = `https://${APPLICATION_ID}-dsn.algolia.net/1/indexes/${INDEX}/query`;

// Initialize global variables
let current_page = 0;
let hits_array = [];
let timerId;

// CSS Selectors
const search_results_container = document.getElementById("search-results");
const to_top_botton = document.getElementById("go-to-top");

// Each hit will be rendered with this function
function renderHitTemplate(name, description) {
  return `
    <div class=card>
    <div class=title>${name}</div>
    <div> ${description} </div>
    </div>
`;
}

// This function is to make sure we don't fire off the API call when user is typing
function debounce(func, delay, arguments) {
  // Cancels the setTimeout method execution
  clearTimeout(timerId);

  // Executes the func after delay time.
  timerId = setTimeout(func, delay, arguments);
}

// Flush out the results if a new query is entered
function resetResults() {
  hits_array = [];
  search_results_container.innerHTML = "";
  current_page = 0;
}

// As the user types in the searchbox we update the results shown on the page
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

// Debounce the user search
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

// Scrolling actions
window.onscroll = () => {
  showNavButton();
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
    if (current_page >= MAX_PAGES_INF_SCROLL) {
      console.log("Ok enough scrolling");
    } else {
      appendSearchResults();
    }
  }
};
