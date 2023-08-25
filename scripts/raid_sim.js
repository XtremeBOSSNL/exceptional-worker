const {RaidSolver, Raid} = require('../modules/raid');

const attackers = [
    {
        type:1,
        level:1,
    },
    {
        type:2,
        level:6,
    },
    {
        type:3,
        level:7,
    },
    {
        type:4,
        level:5,
    },
    {
        type:5,
        level:4,
    },
    {
        type:6,
        level:3,
    },
    {
        type:7,
        level:2,
    },
    {
        type:7,
        level:2,
    },
    {
        type:7,
        level:2,
    },
    {
        type:7,
        level:2,
    }
]

const defenders = [
    {
        type:7,
        level:2,
    },
    {
        type:6,
        level:3,
    },
    {
        type:5,
        level:4,
    },
    {
        type:4,
        level:6,
    },
    {
        type:3,
        level:8,
    },
    {
        type:2,
        level:7,
    }
]

const solver = new RaidSolver(attackers, defenders, 100);

let stats = solver.runAllSims();
// let stats = solver.doRaid(attackers);
console.log(stats);
// console.log('initiate raid');
// let raid = new Raid(attackers, defenders, 100);
// console.log('simulate');
// console.log(raid.simulate());