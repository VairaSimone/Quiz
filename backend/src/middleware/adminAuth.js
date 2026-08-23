const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

module.exports = (req, res, next) => {
  const password = req.headers['x-admin-password'];
  
  if (password && password === ADMIN_PASSWORD) {
    return next();
  }
  return res.status(401).json({ success: false, message: 'Password Admin errata o mancante' });
};