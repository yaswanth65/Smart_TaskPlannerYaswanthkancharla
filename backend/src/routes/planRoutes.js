const express = require('express');
const router = express.Router();
const { generatePlan, listPlans, getPlan, updateTaskProgress, getStats, deletePlan } = require('../controllers/planController');
const { validateGeneratePlan, validateTaskProgress, validatePagination } = require('../middleware/validation');

router.post('/generate-plan', validateGeneratePlan, generatePlan);
router.get('/plans', validatePagination, listPlans);
router.get('/plans/:id', getPlan);
router.delete('/plans/:id', deletePlan);
router.post('/plans/:id/tasks/:taskIndex/progress', validateTaskProgress, updateTaskProgress);
router.get('/stats', getStats);

module.exports = router;
