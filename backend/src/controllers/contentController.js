const Idea = require('../models/Idea');
const Template = require('../models/Template');

async function listIdeas(req, res) {
  try {
    const ideas = await Idea.find().sort({ createdAt: -1 }).limit(50);
    return res.json({ status: 'ok', data: { ideas }, requestId: req.requestId });
  } catch (err) {
    req.logger?.error({ error: err }, 'listIdeas error');
    return res.status(500).json({ status: 'error', message: 'Failed to list ideas', requestId: req.requestId });
  }
}

async function createIdea(req, res) {
  try {
    const { title, content } = req.body;
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ status: 'error', message: 'Title is required', requestId: req.requestId });
    }
    const idea = await Idea.create({ title: title.trim(), content: content || '' });
    return res.status(201).json({ status: 'ok', data: { idea }, requestId: req.requestId });
  } catch (err) {
    req.logger?.error({ error: err }, 'createIdea error');
    return res.status(500).json({ status: 'error', message: 'Failed to create idea', requestId: req.requestId });
  }
}

async function deleteIdea(req, res) {
  try {
    const { id } = req.params;
    const idea = await Idea.findByIdAndDelete(id);
    if (!idea) return res.status(404).json({ status: 'error', message: 'Idea not found', requestId: req.requestId });
    return res.json({ status: 'ok', message: 'Idea deleted', requestId: req.requestId });
  } catch (err) {
    req.logger?.error({ error: err }, 'deleteIdea error');
    return res.status(500).json({ status: 'error', message: 'Failed to delete idea', requestId: req.requestId });
  }
}

// Templates
async function listTemplates(req, res) {
  try {
    const templates = await Template.find().sort({ createdAt: -1 }).limit(50);
    return res.json({ status: 'ok', data: { templates }, requestId: req.requestId });
  } catch (err) {
    req.logger?.error({ error: err }, 'listTemplates error');
    return res.status(500).json({ status: 'error', message: 'Failed to list templates', requestId: req.requestId });
  }
}

async function createTemplate(req, res) {
  try {
    const { name, description, data } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ status: 'error', message: 'Name is required', requestId: req.requestId });
    }
    const template = await Template.create({ name: name.trim(), description: description || '', data: data || {} });
    return res.status(201).json({ status: 'ok', data: { template }, requestId: req.requestId });
  } catch (err) {
    req.logger?.error({ error: err }, 'createTemplate error');
    return res.status(500).json({ status: 'error', message: 'Failed to create template', requestId: req.requestId });
  }
}

async function deleteTemplate(req, res) {
  try {
    const { id } = req.params;
    const template = await Template.findByIdAndDelete(id);
    if (!template) return res.status(404).json({ status: 'error', message: 'Template not found', requestId: req.requestId });
    return res.json({ status: 'ok', message: 'Template deleted', requestId: req.requestId });
  } catch (err) {
    req.logger?.error({ error: err }, 'deleteTemplate error');
    return res.status(500).json({ status: 'error', message: 'Failed to delete template', requestId: req.requestId });
  }
}

module.exports = {
  listIdeas,
  createIdea,
  deleteIdea,
  listTemplates,
  createTemplate,
  deleteTemplate
};
