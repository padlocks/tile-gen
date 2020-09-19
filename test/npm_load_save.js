const SaveData = require('../src/SaveData')

async function main() {
    await SaveData.load('./test/savedata')
}

main()