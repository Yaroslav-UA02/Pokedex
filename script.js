const typeIcons = {
  grass: "🌿",
  poison: "☠️",
  fire: "🔥",
  water: "💧",
  bug: "🐛",
  normal: "⚪",
  flying: "🕊️",
  electric: "⚡",
  fairy: "✨"
};

let allPokemons = [];
let offset = 0;
const limit = 20;
let currentSearch = "";

// Loads Pokemon data: list + detailed info, then renders them
function loadPokemons() {
  showLoadingSpinner();
  fetchPokemonList()
    .then(fetchPokemonDetails)
    .then(function (pokemonData) {
      setTimeout(function () {
        addPokemonsToList(pokemonData);
        renderCurrentList();
        hideLoadingSpinner();
      }, 3000);
    })
    .catch(function (error) {
      console.error("Error loading Pokémon:", error);
      hideLoadingSpinner();
    });
}

// Fetches a list of Pokemon with basic info (name + URL)
function fetchPokemonList() {
  const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
  return fetch(url)
    .then((response) => response.json())
    .then((data) => {
      offset += limit;
      return data.results;
    });
}

// Fetches full detailes (stats, types, image) for each Pokemon in the list
function fetchPokemonDetails(pokemonList) {
  const detailedPromises = pokemonList.map((pokemon) => {
    return fetch(pokemon.url)
      .then((response) => response.json())
      .then((data) => parsePokemon(data));
  });
  return Promise.all(detailedPromises);
}

// Parses and structures a singel Pokemon's data info a usable object
function parsePokemon(data) {
  const types = [];
  let hp = 0;
  let attack = 0;
  for (let statIndex = 0; statIndex < data.stats.length; statIndex++) {
    const stat = data.stats[statIndex];
    if (stat.stat.name === "hp") hp = stat.base_stat;
    if (stat.stat.name === "attack") attack = stat.base_stat;
  }
  for (let t = 0; t < data.types.length; t++) {
    types.push(data.types[t].type.name);
  }
  return {
    id: data.id,
    name: capitalize(data.name),
    types: types,
    hp: hp,
    attack: attack,
    image: data.sprites.other["official-artwork"].front_default,
    description: `This is ${capitalize(data.name)}, a Pokémon of type(s): ${types.join(", ")}.`
  };
}

// Adds newly loaded Pokemon to the global array
function addPokemonsToList(newPokemons) {
  for (let i = 0; i < newPokemons.length; i++) {
    allPokemons.push(newPokemons[i]);
  }
}

// Decides what to render based on current search input
function renderCurrentList() {
  if (currentSearch.length >= 3) {
    filterPokemon(currentSearch);
  } else {
    renderPokemonCards(allPokemons);
  }
}

// Renders Pokemon cards (image, name, types) to the main container 
function renderPokemonCards(pokemonArray) {
  const container = document.getElementById("content");
  container.innerHTML = "";
  for (let index = 0; index < pokemonArray.length; index++) {
    const pokemon = pokemonArray[index];
    let typeHTML = "";
    for (let t = 0; t < pokemon.types.length; t++) {
      const type = pokemon.types[t];
      const icon = typeIcons[type] || type;
      typeHTML += `<span class="type ${type}">${icon}</span>`;
    }
    container.innerHTML += `
      <div class="card" onclick="showDetails(${pokemon.id})">
        <h4>#${pokemon.id} ${pokemon.name}</h4>
        <div class="image-box"><img src="${pokemon.image}" alt="${pokemon.name}"></div>
        <div class="types">${typeHTML}</div>
      </div>`;
  }
}

// Filters Pokemon list by name based on the search query
function filterPokemon(query) {
  currentSearch = query.toLowerCase().trim();
  if (currentSearch.length < 3) {
    renderPokemonCards(allPokemons);
    return;
  }
  const filtered = [];
  for (let i = 0; i < allPokemons.length; i++) {
    if (allPokemons[i].name.toLowerCase().includes(currentSearch)) {
      filtered.push(allPokemons[i]);
    }
  }
  renderPokemonCards(filtered);
}

// Displays the detailed view of a selected Pokemon
function showDetails(id) {
  let pokemon = null;
  for (let i = 0; i < allPokemons.length; i++) {
    if (allPokemons[i].id === id) {
      pokemon = allPokemons[i];
      break;
    }
  }
  if (!pokemon) return;
  let typeHTML = "";
  for (let t = 0; t < pokemon.types.length; t++) {
    const type = pokemon.types[t];
    typeHTML += `<span class="type-badge ${type}">${typeIcons[type] || type}</span>`;
  }
  const detail = document.getElementById("detail_content");
  detail.innerHTML = `
    <div class="detail-header ${pokemon.types[0]}-bg"><h2>${pokemon.name}</h2></div>
    <img class="detail-img" src="${pokemon.image}" alt="${pokemon.name}">
    <div class="detail-types">${typeHTML}</div>
    <div class="detail-stats">
      <div class="stat-box">❤️ HP: ${pokemon.hp}</div>
      <div class="stat-box">💪 Attack: ${pokemon.attack}</div>
    </div>
    <p class="description">${pokemon.description}</p>
    <p class="pkm-id">#${pokemon.id}</p>
    <div class="nav-buttons">
      <button onclick="navigatePokemon(${pokemon.id}, -1)">←</button>
      <button onclick="navigatePokemon(${pokemon.id}, 1)">→</button>
    </div>
  `;
  document.getElementById("detail_view_dialog").classList.remove("d_none");
}

// Closes the detail view dialog
function closeDialog() {
  document.getElementById("detail_view_dialog").classList.add("d_none");
}

// Capitalizes the first letter of a string 
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Shows the loading spinner 
function showLoadingSpinner() {
  document.getElementById("loading").classList.remove("d_none");
}

// Hides the loading spinner 
function hideLoadingSpinner() {
  document.getElementById("loading").classList.add("d_none");
}

// Navigates to the previous or next Pokemon in the detail view 
function navigatePokemon(currentId, direction) {
  let currentIndex = -1;
  for (let i = 0; i < allPokemons.length; i++) {
    if (allPokemons[i].id === currentId) {
      currentIndex = i;
      break;
    }
  }
  const newIndex = currentIndex + direction;
  if (newIndex >= 0 && newIndex < allPokemons.length) {
    const nextPokemon = allPokemons[newIndex];
    showDetails(nextPokemon.id);
  }
}

// Initializes the app on page load: loads data and sets up event listeners 
window.onload = function () {
  loadPokemons();
  const input = document.querySelector('.main-header input');
  input.addEventListener('input', function (event) {
    filterPokemon(event.target.value);
  });
  const button = document.getElementById('load-more');
  button.addEventListener('click', loadPokemons);
  document.getElementById("detail_view_dialog").addEventListener("click", function () {
    closeDialog();
  });
  document.getElementById("detail_content").addEventListener("click", function (event) {
    event.stopPropagation();
  });
};