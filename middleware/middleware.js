// middleware/auth.js
import jwt from 'jsonwebtoken';
import { promisify } from 'util';

const verify = promisify(jwt.verify);

export const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    try {
      const decodedToken = await verify(token, process.env.JWT_SECRET_ACCESS);
      req.companyId = decodedToken.companyId;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  } else {
    res.status(401).json({ error: 'Missing token' });
  }
};
