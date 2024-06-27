const activityLogService = require('../services/activityLogServices');

// Get all activity logs
module.exports.getAllActivityLogs = async (req, res) => {
    try {
        const projectId = req.body.projectId;
        const logs = await activityLogService.getProjectLogs(projectId);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


