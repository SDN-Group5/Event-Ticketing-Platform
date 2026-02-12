import jwt from "jsonwebtoken";
class AuthMiddleware {
    verifyToken = (req, res, next) => {
        try {
            let token = req.headers.authorization;
            if (!token) {
                throw new Error('Token not found');
            }
            if (token.startsWith("Bearer ")) {
                token = token.slice(7, token.length);
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json(
                {
                    message: "Unauthorized",
                    error: error.message
                }
            );
        }
    }
    // verifyRole = (roles) => {
    //     return (req, res, next) => {
    //         if (!req.user || !roles.includes(req.user.role)) {
    //             return res.status(403).json({
    //                 message: "You do not have permission"
    //             });
    //         }
    //         next();
    //     }
    // }
}
export default AuthMiddleware;
