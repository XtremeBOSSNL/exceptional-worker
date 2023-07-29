class Worker {
    type
    level
    power

    constructor(type, level) {
        this.type = type;
        this.level = level;
        this.power = (type + 2) * (1 + type/4) * (1 + level/2.5);
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
        let dmg = Math.round(100 * power / (this.worker?.power || 1));
        this.hp -= dmg;
        if (this.hp < 0) this.hp = 0;
        return this.hp;
    }
}

class Raid {
    atk
    def
    current_defender

    constructor(atk, def, hp) {
        this.atk = atk.map(x => new Worker(x.type, x.level));
        this.def = def.map(x => new Farm(hp, new Worker(x.type, x.level)));
        this.current_defender = 0;
    }

    simulate() {
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
        }
        return this.current_defender;
    }
}

class RaidSolver {
    best_solution
    best_score
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

        return [this.best_score, this.best_solution, this.stats];
    }

    doRaid(atk) {
        let raid = new Raid(atk, this.def, this.hp);
        let score = raid.simulate();
        this.stats.count++;
        this.stats[score] = (this.stats[score] || 0) + 1;
        if (score > this.best_score) {
            this.best_solution = atk;
            this.best_score = score;
        }
        if (this.best_score == this.def.length) {
            return true;
        }
        return false;
    }
}

module.exports = {RaidSolver};