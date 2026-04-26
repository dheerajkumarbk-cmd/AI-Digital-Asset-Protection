const handlers = require('../backend/handlers');

module.exports = (req, res) => handlers.analyzeTextHandler(req, res);
