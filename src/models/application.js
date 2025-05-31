const mongoose = require('mongoose');

const appSchema = new mongoose.Schema({
  robloxUsername: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  isEmployedInDept: {
    type: Boolean,
    required: true,
  },
  employedDepartment: {
    type: String,
    default: 'None',
  },
  reasonToJoin: {
    type: String,
    required: true,
  },
  improveRoleplay: {
    type: String,
    required: true,
  },
  roleplayScenario: {
    type: String,
    required: true,
  },
  canSetupCivilian: {
    type: Boolean,
    required: true,
  },
  appStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Failed', 'Denied'],
    default: function () {
      if (!this.canSetupCivilian || this.age < 13) return 'Failed';
      return 'Pending';
    },
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  feedback: {
    type: String,
    default: '',
  },
  discordUserId: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Application', appSchema);