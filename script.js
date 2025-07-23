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

let allPokemonData = [];

function loadAndShowPkm() {
  fetch("https://pokeapi.co/api/v2/pokemon?limit=25")
    .then((response) => response.json())
    .then((data) => {
      const requests = [];
      for (let i = 0; i < data.results.length; i++) {
        const url = data.results[i].url;
        requests.push(fetch(url).then((res) => res.json()));
      }
      Promise.all(requests).then((pokemonArray) => {
        for (let i = 0; i < pokemonArray.length; i++) {
          const p = pokemonArray[i];
          const types = [];
          for (let j = 0; j < p.types.length; j++) {
            types.push(p.types[j].type.name);
          }
          let hp = 0;
          let attack = 0;
          for (let j = 0; j < p.stats.length; j++) {
            if (p.stats[j].stat.name === "hp") {
              hp = p.stats[j].base_stat;
            }
            if (p.stats[j].stat.name === "attack") {
              attack = p.stats[j].base_stat;
            }
          }
          const pokemon = {
            id: p.id,
            name: capitalize(p.name),
            types: types,
            hp: hp,
            attack: attack,
            image: p.sprites.other["official-artwork"].front_default,
            description: `This is ${capitalize(p.name)}, a Pokémon of type(s): ${types.join(", ")}.`
          };
          allPokemonData.push(pokemon);
        }
        renderPkmCards(allPokemonData);
      });
    })
    .catch((error) => {
      console.log("Error loading Pokémon:", error);
    });
}

function renderPkmCards(pokeArray) {
  const container = document.getElementById("content");
  container.innerHTML = "";

  for (let i = 0; i < pokeArray.length; i++) {
    const pkm = pokeArray[i];

    let typesHTML = "";
    for (let j = 0; j < pkm.types.length; j++) {
      const type = pkm.types[j];
      const icon = typeIcons[type] || type;
      typesHTML += `<span class="type ${type}">${icon}</span>`;
    }

    container.innerHTML += `
      <div class="card" onclick="showDetails(${pkm.id})">
        <h4>#${pkm.id} ${pkm.name}</h4>
        <div class="image-box"><img src="${pkm.image}" alt="${pkm.name}" /></div>
        <div class="types">${typesHTML}</div>
      </div>
    `;
  }
}

function filterPokemon(query) {
  const search = query.toLowerCase();
  const filtered = [];

  for (let i = 0; i < allPokemonData.length; i++) {
    if (allPokemonData[i].name.toLowerCase().includes(search)) {
      filtered.push(allPokemonData[i]);
    }
  }

  renderPkmCards(filtered);
}

function showDetails(id) {
  let pkm = null;

  for (let i = 0; i < allPokemonData.length; i++) {
    if (allPokemonData[i].id === id) {
      pkm = allPokemonData[i];
      break;
    }
  }

  if (!pkm) return;

  let typesHTML = "";
  for (let j = 0; j < pkm.types.length; j++) {
    const type = pkm.types[j];
    const icon = typeIcons[type] || type;
    typesHTML += `<span class="type ${type}">${icon}</span>`;
  }

  const detail = document.getElementById("detail_content");
  detail.innerHTML = `
  <div class="detail-header ${pkm.types[0]}-bg">
    <h2>${pkm.name}</h2>
  </div>
  <img class="detail-img" src="${pkm.image}" alt="${pkm.name}" />
  <div class="detail-types">
    ${pkm.types.map(t => `<span class="type-badge ${t}">${typeIcons[t] || t}</span>`).join('')}
  </div>
  <div class="detail-stats">
    <div class="stat-box">❤️ HP: ${pkm.hp}</div>
    <div class="stat-box">💪 Attack: ${pkm.attack}</div>
  </div>
  <p class="description">${pkm.description}</p>
  <p class="pkm-id">#${pkm.id}</p>
`;

  document.getElementById("detail_view_dialog").classList.remove("d_none");
}

function closeDialog() {
  document.getElementById("detail_view_dialog").classList.add("d_none");
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function showLoadingSpinner() {
  document.getElementById("loading").classList.remove("d_none");
}

function hideLoadingSpinner() {
  document.getElementById("loading").classList.add("d_none");
}