// power = ([worker speed] + [worker strength] + [worker intelligence]) * (1 + [worker type]/4) * (1 + [worker level]/2.5)
const types = ['L',"useless","deficient","common","talented","wise","expert","masterful"]

// const stats = {
//     useless: {
//         spd: 1,
//         str: 1,
//         int:1 ,
//     },
//     deficient: {
//         spd: 1.5,
//         str: 1.5,
//         int: 1,
//     },
//     common: {
//         spd: 1.5,
//         str: 2,
//         int: 1.5,
//     },
//     talented: {
//         spd: 2,
//         str: 2,
//         int: 2,
//     },
//     wise: {
//         spd: 1,
//         str: 1,
//         int:1 ,
//     },
//     expert: {
//         spd: 1,
//         str: 1,
//         int:1 ,
//     },
//     masterfull: {
//         spd: 3,
//         str: 3,
//         int: 3,
//     },
// }


for(let type = 1; type <= 7; type++){
    for (let level = 1; level <= 60; level++) {
        let calc = (type + 2) * (1 + type/4) * (1 + level/2.5);
        console.log(`${types[type]} Lv ${level} Power ${calc} %${100 * calc / (calc || 1)}`);
    }
}