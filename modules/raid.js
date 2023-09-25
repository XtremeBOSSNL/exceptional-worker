class Worker {
    type
    level
    power

    constructor(type, level) {
        this.type = type;
        this.level = level;
        this.power = (type + 2) * (1 + type/3.25) * (1 + level/1.25);
    }

    getPower() {
        return this.power;
    }
}

class Farm {
    hp

    constructor(hp, worker) {
        this.hp = hp;
        this.worker = worker;
    }

    takeDmg(power) {
        let dmg = Math.round(80 * power / (this.worker?.power || 1));
        this.hp -= dmg;
        if (this.hp < 0) this.hp = 0;
        console.log(`atk power ${power}, def power ${this.worker?.power}, hp left ${this.hp}`);
        return this.hp;
    }
}

class Raid {
    atk
    def
    current_defender
    max_hp

    constructor(atk, def, hp) {
        this.atk = atk.map(x => new Worker(x.type, x.level));
        this.def = def.map(x => new Farm(hp, new Worker(x.type, x.level)));
        this.current_defender = 0;
        this.max_hp = hp;
    }

    simulate(verbose) {
        for(let i = 0; i < this.atk.length; i++) {
            let a = this.atk[i];
            let d = this.def[this.current_defender];
            if (d == undefined) {
                break;
            }
            let hp = d.takeDmg(a.getPower()); 
            if (hp == 0) {
                this.current_defender++;
            }
            if (verbose) console.log(`Turn ${i+1} - ${names[a.type]} Lv ${a.level} Hits ${names[d.worker.type]} Lv ${d.worker.level} leaving the farm at ${hp} hp`);
        }
        return [this.current_defender, this.def[this.current_defender]?.hp || 0];
    }
}

class RaidSolver {
    best_solution
    best_score
    best_hp_left
    hp
    atk
    def
    stats

    constructor (atk, def, hp) {
        this.hp = hp;
        this.atk = atk;
        this.def = def;
        this.best_score = 0;
        this.best_solution = [];
        this.best_hp_left = hp;
        this.stats = {
            count: 0,
        };
    }

    runAllSims() {
        const permute = (arr, m = []) => {
            if (arr.length === 0) {
                this.doRaid(m);
            } else {
              for (let i = 0; i < arr.length; i++) {
                let curr = arr.slice();
                let next = curr.splice(i, 1);
                permute(curr.slice(), m.concat(next))
             }
           }
         }
        
        permute(this.atk)

        return [this.best_score, this.best_solution, this.best_hp_left, this.stats];
    }

    doRaid(atk, verbose) {
        if (!verbose) verbose = 0;
        let raid = new Raid(atk, this.def, this.hp);
        let score = raid.simulate(verbose);
        this.stats.count++;
        this.stats[score[0].toFixed(0)] = (this.stats[score[0].toFixed(0)] || 0) + 1;
        if ((score[0] == this.best_score && score[1] < this.best_hp_left) || (score[0] > this.best_score)) {
            this.best_solution = atk;
            this.best_score = score[0];
            this.best_hp_left = score[1];
        }
    }
}

const names = ['None', 'Useless', 'Deficient', 'Common', 'Talented', 'Wise', 'Expert', 'Masterful'];

module.exports = {RaidSolver};