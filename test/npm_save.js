const tile_gen = require('../src/main.js')

async function main() {
    let structure = await tile_gen.import_structure_from_file('./test/structure')
    let tileset = await tile_gen.import_tiles_from_file('./test/main', structure)
    let tilemap = await tile_gen.generate_tilemap(tileset, 5, 10)
    await tile_gen.visualize_tilemap(tilemap)
    await tile_gen.save(tilemap, './test/savedata')
}

main()