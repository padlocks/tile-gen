const tile_gen = require('../src/main.js')

async function main() {
    await tile_gen.visualize_encrypted_tilemap('./test/savedata')
}

main()