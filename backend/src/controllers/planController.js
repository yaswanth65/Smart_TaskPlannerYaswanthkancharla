/**
 * planController: handles incoming requests around plan generation.
 */
const Plan = require('../models/Plan');
const aiService = require('../services/aiService');
const planCache = require('../services/cacheService');
const analytics = require('../services/analyticsService');

/**
 * POST /api/generate-plan
 * Body: { goal: string, save?: boolean, userId?: string, skipCache?: boolean }
 */
async function generatePlan(req, res) {
  try {
    const { goal, save, userId, skipCache } = req.body;
    if (!goal || typeof goal !== 'string' || !goal.trim()) {
      req.logger.warn({ goal }, 'Invalid goal provided');
      analytics.recordError(400, 'Invalid goal provided');
      return res.status(400).json({ 
        status: 'error', 
        message: 'Invalid goal provided',
        requestId: req.requestId 
      });
    }

    analytics.recordRequest({ type: 'generate-plan', goal: goal.trim(), save, userId });
    req.logger.info({ goal: goal.trim(), save, userId }, 'Generating plan');
    
    let aiResult;
    let cached = false;

    // Check cache first (unless skipCache is true)
    if (!skipCache && planCache.has(goal.trim())) {
      const cachedEntry = planCache.get(goal.trim());
      aiResult = cachedEntry.data;
      cached = true;
      req.logger.info({ goal: goal.trim() }, 'Plan served from cache');
    } else {
      // Generate new plan
      aiResult = await aiService.generatePlan(goal.trim(), req.logger);
      
      // Cache the result
      planCache.set(goal.trim(), aiResult);
    }

    // Record analytics
    analytics.recordAICall(
      aiResult.parseStatus, 
      aiResult.latencyMs, 
      aiResult.tasks?.length,
      cached
    );

    const planDoc = {
      goal: goal.trim(),
      tasks: aiResult.tasks || [],
      userId: userId || null,
      rawAiOutput: aiResult.raw,
      parseStatus: aiResult.parseStatus,
      aiModel: aiResult.aiModel,
      aiLatencyMs: cached ? 0 : aiResult.latencyMs,
      requestId: req.requestId,
      cached
    };

    let saved = null;
    if (save) {
      saved = await Plan.create(planDoc);
      req.logger.info({ planId: saved._id }, 'Plan saved to database');
    }

    analytics.recordSuccess(200);
    return res.json({ 
      status: 'ok', 
      message: 'Plan generated', 
      data: { plan: planDoc, saved, cached },
      requestId: req.requestId
    });
  } catch (err) {
    req.logger.error({ error: err }, 'generatePlan error');
    analytics.recordError(500, 'Failed to generate plan');
    return res.status(500).json({ 
      status: 'error', 
      message: 'Failed to generate plan',
      requestId: req.requestId
    });
  }
}

/**
 * GET /api/plans
 * Query: ?userId=&limit=&page=
 */
async function listPlans(req, res) {
  try {
    const { userId, limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    
    const filter = {};
    if (userId) filter.userId = userId;

    req.logger.info({ filter, limit, page }, 'Listing plans');
    
    const plans = await Plan.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-rawAiOutput'); // Exclude raw output in list view

    const total = await Plan.countDocuments(filter);

    return res.json({
      status: 'ok',
      data: {
        plans,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      requestId: req.requestId
    });
  } catch (err) {
    req.logger.error({ error: err }, 'listPlans error');
    return res.status(500).json({ 
      status: 'error', 
      message: 'Failed to list plans',
      requestId: req.requestId
    });
  }
}

/**
 * GET /api/plans/:id
 */
async function getPlan(req, res) {
  try {
    const { id } = req.params;
    req.logger.info({ planId: id }, 'Getting plan details');
    
    const plan = await Plan.findById(id);
    if (!plan) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Plan not found',
        requestId: req.requestId
      });
    }

    return res.json({
      status: 'ok',
      data: { plan },
      requestId: req.requestId
    });
  } catch (err) {
    req.logger.error({ error: err }, 'getPlan error');
    return res.status(500).json({ 
      status: 'error', 
      message: 'Failed to get plan',
      requestId: req.requestId
    });
  }
}

/**
 * POST /api/plans/:id/tasks/:taskIndex/progress
 * Body: { status?: string, progress?: number, notes?: string }
 */
async function updateTaskProgress(req, res) {
  try {
    const { id, taskIndex } = req.params;
    const { status, progress, notes } = req.body;
    
    req.logger.info({ planId: id, taskIndex, updates: { status, progress, notes } }, 'Updating task progress');
    
    const plan = await Plan.findById(id);
    if (!plan) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Plan not found',
        requestId: req.requestId
      });
    }

    const taskIdx = parseInt(taskIndex);
    if (taskIdx < 0 || taskIdx >= plan.tasks.length) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Invalid task index',
        requestId: req.requestId
      });
    }

    // Update task fields if provided
    if (status !== undefined) plan.tasks[taskIdx].status = status;
    if (progress !== undefined) plan.tasks[taskIdx].progress = progress;
    if (notes !== undefined) plan.tasks[taskIdx].notes = notes;

    await plan.save();
    
    return res.json({
      status: 'ok',
      message: 'Task progress updated',
      data: { task: plan.tasks[taskIdx] },
      requestId: req.requestId
    });
  } catch (err) {
    req.logger.error({ error: err }, 'updateTaskProgress error');
    return res.status(500).json({ 
      status: 'error', 
      message: 'Failed to update task progress',
      requestId: req.requestId
    });
  }
}

/**
 * GET /api/stats
 * Get analytics and usage statistics
 */
async function getStats(req, res) {
  try {
    req.logger.info('Getting analytics stats');
    
    const metrics = analytics.getMetrics();
    const costs = analytics.estimateCosts();
    const cacheStats = planCache.getStats();

    return res.json({
      status: 'ok',
      data: {
        analytics: metrics,
        costs,
        cache: cacheStats
      },
      requestId: req.requestId
    });
  } catch (err) {
    req.logger.error({ error: err }, 'getStats error');
    return res.status(500).json({ 
      status: 'error', 
      message: 'Failed to get stats',
      requestId: req.requestId
    });
  }
}

/**
 * DELETE /api/plans/:id
 * Delete a plan
 */
async function deletePlan(req, res) {
  try {
    const { id } = req.params;
    req.logger.info({ planId: id }, 'Deleting plan');
    
    const plan = await Plan.findByIdAndDelete(id);
    if (!plan) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Plan not found',
        requestId: req.requestId
      });
    }

    return res.json({
      status: 'ok',
      message: 'Plan deleted successfully',
      requestId: req.requestId
    });
  } catch (err) {
    req.logger.error({ error: err }, 'deletePlan error');
    return res.status(500).json({ 
      status: 'error', 
      message: 'Failed to delete plan',
      requestId: req.requestId
    });
  }
}

module.exports = { generatePlan, listPlans, getPlan, updateTaskProgress, getStats, deletePlan };
