/**
 * Mongoose schema for storing generated plans.
 */
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dependsOn: { type: [String], default: [] },
  duration: { type: String },
  deadline: { type: String },
  // New fields for task progress
  status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  notes: { type: String, default: '' }
});

const PlanSchema = new mongoose.Schema({
  goal: { type: String, required: true },
  tasks: { type: [TaskSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  // New metadata fields
  userId: { type: String }, // Optional user ID if authenticated
  rawAiOutput: { type: String }, // Raw AI response for debugging
  parseStatus: { type: String, enum: ['json', 'text', 'mock'], default: 'json' },
  aiModel: { type: String }, // Which AI model was used
  aiLatencyMs: { type: Number }, // How long the AI call took
  requestId: { type: String } // Unique request identifier for tracing
});

module.exports = mongoose.model('Plan', PlanSchema);
