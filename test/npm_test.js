const tile_gen = require('../main.js')

async function main() {
    let tileset = await tile_gen.import_tiles_from_file('./test/main.tiles')
    let tilemap = await tile_gen.generate_tilemap(tileset, 5, 10)
    await tile_gen.visualize_tilemap(tilemap)
    console.log('done!')
}

main()