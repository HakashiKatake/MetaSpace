const ROLE_HIERARCHY = { admin: 3, manager: 2, operator: 1 };

const requireRole = (...roles) => (req, res, next) => {
  const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
  const requiredLevel = Math.min(...roles.map(r => ROLE_HIERARCHY[r] || 99));
  if (userLevel < requiredLevel) {
    return res.status(403).json({ error: 'Insufficient permissions.' });
  }
  next();
};

module.exports = { requireRole };
