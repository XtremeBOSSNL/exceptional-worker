const mongoose = require("mongoose");

const dataSchema = mongoose.Schema({
    user: String,
    tag: String,
    settings: {
        showRaidPointDiff: { type:Boolean, default:false },
        energyReminder: { type:Boolean, default:false},
        energyReminderTreshold: { type:Number, default:100},
        raidHelper: {type: Boolean, default:false},
        raidSimpleMode: {type: Boolean, default:false},
        raidWorkerEmoji: {type: Boolean, default:true},
        showLastClaim: {type: Boolean, default:false},
        claimReminder: {type: Boolean, default:false}
    },
    data: {
        lastClaim: { type: Number, default: 0 },
        lastClaimHours: {type: Number, default: 0 },
        lastRaidpoints: { type: Number, default: 0 },
        donorTier: { type:Number, default: 0},
        energyRegenUpgrade: {type:Number, default:0},
    },
    info: {
        creation_date: { type: Date, default: Date.now() },
    },
});

module.exports = mongoose.model("user", dataSchema);
