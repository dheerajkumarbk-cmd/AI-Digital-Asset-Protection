const handlers = require('../backend/handlers');

module.exports = (req, res) => {
  // Vercel serverless handler wrapper
  return handlers.simulateAttackHandler(req, res);
};
