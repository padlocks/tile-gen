const tile_gen = require('../src/main')
const SaveData = require('../src/SaveData')

async function main() {
    let structure = await tile_gen.import_structure_from_file('./test/structure')
    let tileset = await tile_gen.import_tiles_from_file('./test/main', structure)
    let tilemap = await tile_gen.generate_tilemap(tileset, 5, 10)
    await tile_gen.visualize_tilemap(tilemap)

    let player = {}
    let mapdata = {
        tilemap: tilemap
    }
    let villagers = {}
    let data = new SaveData(player, mapdata, villagers)
    let operation = await data.save('./test/savedata')

    if (operation) console.log('Game data has been saved successfully.')
    else console.log('There was an issue saving your game.')
}

main()