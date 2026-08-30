const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const activityLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now }
});

const subtaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  isCompleted: { type: Boolean, default: false }
});

const labelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  color: { type: String, required: true }
});

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, default: 'To Do' },
  assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema],
  deadline: { type: Date },
  subtasks: [subtaskSchema],
  labels: [labelSchema]
});

const boardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tasks: [taskSchema],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  inviteToken: { type: String },
  activityLog: [activityLogSchema],
  version: { type: Number, default: 0 }, // For optimistic concurrency control
  columns: [{ id: String, title: String }],
  background: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Board', boardSchema);
