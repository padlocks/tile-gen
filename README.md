# tile-gen
A simple tool for generating tile-based maps. Written in javascript.

## Concepts
I've always been interested in how animal crossing works internally, so I decided to make some kind of clone of them game (at least parts of it,) to learn how it works. The first part was trying to figure out how to save so much data about each tile on the map in ACNH. In New Leaf, it wasn't as complex because you couldn't place items outside.

I checked out the NHSE (New Horizons Save Editor,) to see how data is stored in ACNH. Honestly, the code is a bit confusing to me so it's taken a while to understand. It looks like there's a separate item list and a separate tile list. If the property IsActive is equal to true, the item will show up (and I suppose the item has the tile's coordinates.) This doesn't really make sense to me. Why not add the actual item information inside the tile object? Maybe it looks cleaner but it just makes more sense. Or it's just a difference in programming style.

Anywho, this tool is my first draft for tile generation (with support for extensive tile rules such as setting items down, and adding paths like in ACNH.)

Essentially there are two starting files (which I guess could be merged into one but again, this is my first draft lol.) One which defines the structure of the tile object as well as how to read a tile save file and of course, the tile list. Since I don't have a full tilemap save file (yet,) it just uses default values and randomly generates location of the tiles. In the future I want to add additional rules (i.e. cannot spawn a rock next to another rock.)

I also am using text-based textures (instead of images,) so I don't need to make a whole unity game and whatnot because I don't have the energy for that. I really enjoy back-end and algo work which is what this is. I'm also using javascript since its the language I'm most "comfortable" with and therefore I would have an easier time understanding. I would probably adapt these tools to C# in unity if I were to pursue a full game experience.

Here is a 10x5 tilemap.
- grass: #
- rock: &
- flower: %

![Example 10x5 tilemap.](https://cdn.discordapp.com/attachments/756511199927074816/756515500875579402/unknown.png)
