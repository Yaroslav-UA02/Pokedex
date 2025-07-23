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

async function loadPokemons() {
  showLoadingSpinner();
  const pokemonList = await fetchPokemonList();
  const pokemonData = await fetchPokemonDetails(pokemonList);
  setTimeout(function () {
    addPokemonsToList(pokemonData);
    renderCurrentList();
    hideLoadingSpinner();
  }, 3000);
}

async function fetchPokemonList() {
  const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
  const response = await fetch(url);
  const data = await response.json();
  offset += limit;
  return data.results;
}

async function fetchPokemonDetails(pokemonList) {
  const detailedList = [];
  for (let index = 0; index < pokemonList.length; index++) {
    const pokemonURL = pokemonList[index].url;
    const response = await fetch(pokemonURL);
    const data = await response.json();
    const parsed = parsePokemon(data);
    detailedList.push(parsed);
  }
  return detailedList;
}

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

function addPokemonsToList(newPokemons) {
  for (let i = 0; i < newPokemons.length; i++) {
    allPokemons.push(newPokemons[i]);
  }
}

function renderCurrentList() {
  if (currentSearch.length >= 3) {
    filterPokemon(currentSearch);
  } else {
    renderPokemonCards(allPokemons);
  }
}

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

function closeDialog() {
  document.getElementById("detail_view_dialog").classList.add("d_none");
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function showLoadingSpinner() {
  document.getElementById("loading").classList.remove("d_none");
}

function hideLoadingSpinner() {
  document.getElementById("loading").classList.add("d_none");
}

window.onload = function () {
  loadPokemons();

  const input = document.querySelector('.main-header input');
  input.addEventListener('input', function (event) {
    filterPokemon(event.target.value);
  });

  const button = document.getElementById('load-more');
  button.addEventListener('click', loadPokemons);
};

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