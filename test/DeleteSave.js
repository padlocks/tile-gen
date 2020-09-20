const fs = require('fs')
const path = './savedata/savedata'

const Main = async () => {
    if (fs.existsSync(path)) {
        fs.unlink(path, (err) => {
            if (err) throw err;
            console.log('Savefile deleted.');
        });
    } else {
        console.log('No savefile found.')
    }
}

Main()