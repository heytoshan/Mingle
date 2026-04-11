import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "No authentication token" });

  try {
    const verified = jwt.verify(token, process.env.NEXTAUTH_SECRET || "DJKALDJFL");
    req.userId = verified.id;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token verification failed" });
  }
};

export default authMiddleware;
