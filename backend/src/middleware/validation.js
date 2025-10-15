/**
 * Input validation middleware
 */

const ValidationError = {
  INVALID_GOAL: 'Goal must be a non-empty string between 5 and 500 characters',
  INVALID_USER_ID: 'User ID must be a valid string',
  INVALID_TASK_INDEX: 'Task index must be a valid number',
  INVALID_STATUS: 'Status must be one of: todo, in-progress, done',
  INVALID_PROGRESS: 'Progress must be a number between 0 and 100',
  INVALID_PAGINATION: 'Page and limit must be positive numbers'
};

function validateGeneratePlan(req, res, next) {
  const { goal, save, userId, skipCache } = req.body;

  // Validate goal
  if (!goal || typeof goal !== 'string') {
    return res.status(400).json({
      status: 'error',
      message: ValidationError.INVALID_GOAL,
      code: 'INVALID_GOAL',
      requestId: req.requestId
    });
  }

  const trimmedGoal = goal.trim();
  if (trimmedGoal.length < 5 || trimmedGoal.length > 500) {
    return res.status(400).json({
      status: 'error',
      message: ValidationError.INVALID_GOAL,
      code: 'INVALID_GOAL',
      requestId: req.requestId
    });
  }

  // Validate optional fields
  if (save !== undefined && typeof save !== 'boolean') {
    return res.status(400).json({
      status: 'error',
      message: 'Save must be a boolean',
      code: 'INVALID_SAVE',
      requestId: req.requestId
    });
  }

  if (userId !== undefined && typeof userId !== 'string') {
    return res.status(400).json({
      status: 'error',
      message: ValidationError.INVALID_USER_ID,
      code: 'INVALID_USER_ID',
      requestId: req.requestId
    });
  }

  if (skipCache !== undefined && typeof skipCache !== 'boolean') {
    return res.status(400).json({
      status: 'error',
      message: 'skipCache must be a boolean',
      code: 'INVALID_SKIP_CACHE',
      requestId: req.requestId
    });
  }

  next();
}

function validateTaskProgress(req, res, next) {
  const { status, progress, notes } = req.body;
  const { taskIndex } = req.params;

  // Validate task index
  const idx = parseInt(taskIndex);
  if (isNaN(idx) || idx < 0) {
    return res.status(400).json({
      status: 'error',
      message: ValidationError.INVALID_TASK_INDEX,
      code: 'INVALID_TASK_INDEX',
      requestId: req.requestId
    });
  }

  // Validate status
  if (status !== undefined) {
    const validStatuses = ['todo', 'in-progress', 'done'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: ValidationError.INVALID_STATUS,
        code: 'INVALID_STATUS',
        requestId: req.requestId
      });
    }
  }

  // Validate progress
  if (progress !== undefined) {
    const prog = parseInt(progress);
    if (isNaN(prog) || prog < 0 || prog > 100) {
      return res.status(400).json({
        status: 'error',
        message: ValidationError.INVALID_PROGRESS,
        code: 'INVALID_PROGRESS',
        requestId: req.requestId
      });
    }
  }

  // Validate notes
  if (notes !== undefined && typeof notes !== 'string') {
    return res.status(400).json({
      status: 'error',
      message: 'Notes must be a string',
      code: 'INVALID_NOTES',
      requestId: req.requestId
    });
  }

  next();
}

function validatePagination(req, res, next) {
  const { page, limit } = req.query;

  if (page !== undefined) {
    const pageNum = parseInt(page);
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        status: 'error',
        message: ValidationError.INVALID_PAGINATION,
        code: 'INVALID_PAGE',
        requestId: req.requestId
      });
    }
  }

  if (limit !== undefined) {
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        status: 'error',
        message: 'Limit must be between 1 and 100',
        code: 'INVALID_LIMIT',
        requestId: req.requestId
      });
    }
  }

  next();
}

module.exports = {
  validateGeneratePlan,
  validateTaskProgress,
  validatePagination,
  ValidationError
};
