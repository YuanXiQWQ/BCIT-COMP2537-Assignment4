import express from 'express';
import axios from 'axios';

const router = express.Router();

const API_URL = 'https://pokeapi.co/api/v2';
let allPokemonList = [];
let allTypes = [];

const loadAllData = async () => {
    try {
        const typeResponse = await axios.get(`${API_URL}/type`);
        allTypes = typeResponse.data.results;

        const pokemonResponse = await axios.get(`${API_URL}/pokemon?limit=810`);
        allPokemonList = pokemonResponse.data.results;
    } catch (error) {
        console.error('Error loading initial data:', error);
    }
};

loadAllData().catch(err => console.error('Error loading initial data:', err));

router.get('/', (req, res) => {
    res.render('index', {
        types: allTypes,
    });
});

router.get('/data', async (req, res) => {
    try {
        const detailedPokemonList = await getDetailedPokemonList();
        res.json({ pokemonList: detailedPokemonList });
    } catch (error) {
        console.error('Error fetching Pokémon data:', error);
        res.status(500).send('Error fetching Pokémon data');
    }
});

const getDetailedPokemonList = async () => {
    const paginatedPokemonList = allPokemonList.slice(0, 20); // or adjust the limit as needed
    return await Promise.all(paginatedPokemonList.map(async (pokemon) => {
        const details = await axios.get(`${API_URL}/pokemon/${pokemon.name}`);
        return {
            name: pokemon.name,
            image: details.data.sprites.front_default,
            height: details.data.height,
            weight: details.data.weight,
            types: details.data.types.map(t => t.type.name),
            abilities: details.data.abilities.map(a => a.ability.name),
            stats: details.data.stats.map(s => ({name: s.stat.name, value: s.base_stat}))
        };
    }));
};

export default router;
