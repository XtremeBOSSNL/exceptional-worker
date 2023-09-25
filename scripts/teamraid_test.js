let attackers = [
    {
        type:5,
        level:4,
        name:"a",
        id:1,
    },
    {
        type:3,
        level:5,
        name:"a",
        id:2,
    },
    {
        type:7,
        level:3,
        name:"a",
        id:3
    },
    {
        type:5,
        level:3,
        name:"a",
        id:4
    }
];

const defenders = [
    {
        type:6,
        level:4,
        hp:100,
    }
];

const best_order = [];


for (let i = 0;i < defenders.length;i++) {
    if (!attackers.length) break;
    let defender = defenders[i];
    let dmg_array = make_dmg_array(attackers, defender);
    let exact_match = dmg_array.find(x => x.dmg == defender.hp);
    let double_dmg_workers = make_double_dmg_array([...dmg_array]);
    let minimal_single = dmg_array.filter(x => x.dmg >= defender.hp).sort((a,b) => a.dmg - b.dmg)[0] || undefined;
    let minimal_double = double_dmg_workers.filter(x => x.dmg >= defender.hp).sort((a,b) => a.dmg - b.dmg)[0] || undefined;
    if (exact_match) {
        best_order.push(attackers.splice(exact_match.id-1,exact_match.id-1));
    } else if (minimal_double && minimal_single && minimal_double.dmg < minimal_single.dmg || minimal_double && !minimal_single) {
        best_order.push(attackers.splice(minimal_double.ids[0],minimal_double.ids[0]))
        best_order.push(attackers.splice(minimal_double.ids[1],minimal_double.ids[1]))
    } else if (minimal_single && !minimal_double) {
        best_order.push(attackers.splice(minimal_single.id, minimal_single.id));
    } else {
        best_order.push(...attackers);
        attackers = [];
    }
}

console.log(best_order);

function make_dmg_array (attackers, defender) {
    let def_power = get_power(defender.type, defender.level);
    let dmg = attackers.map(item => {
        return {
            dmg:Math.round(100 * get_power(item.type, item.level) / (def_power || 1)),
            ...item,
        }
    });
    dmg.sort((a,b) => { return b.dmg - a.dmg });
    return dmg;
}

function make_double_dmg_array (attackers) {
    let dmg = [];
    while (attackers.length > 1) {
        let atk = attackers.shift();
        for (let i = 0;i < attackers.length;i++) {
            dmg.push(
                {
                    dmg:atk.dmg+attackers[i].dmg,
                    ids:[atk.id,attackers[i].id],
                }
            )
        }
    }
    dmg.sort((a,b) => { return b.dmg - a.dmg });
    return dmg;
}

function get_power (type, level) {
    return (type + 2) * (1 + type/3.25) * (1 + level/1.25);
}