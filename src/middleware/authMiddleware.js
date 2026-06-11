import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
  let token;

  // Header check: "Authorization: Bearer <token>"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // Token verify karo
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Decoded metadata ko request block me inject karo (id, role)
      req.user = decoded;
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token validation failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token found in headers' });
  }
};