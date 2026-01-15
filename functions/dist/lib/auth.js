import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'dev-secret-change-me';
/**
 * 验证 JWT Token
 */
export async function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return {
            id: decoded.sub,
            email: decoded.email,
            role: decoded.role,
        };
    }
    catch (error) {
        return null;
    }
}
/**
 * 生成 JWT Token
 */
export function generateToken(user) {
    const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 天过期
    };
    return jwt.sign(payload, JWT_SECRET);
}
/**
 * 验证密码
 */
export async function verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
}
/**
 * 哈希密码
 */
export async function hashPassword(password) {
    return bcrypt.hash(password, 10);
}
/**
 * 从请求中提取用户信息
 */
export async function getUserFromRequest(headers) {
    const authHeader = headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.substring(7);
    return verifyToken(token);
}
/**
 * 检查用户权限
 */
export function checkPermission(user, requiredRole) {
    if (!user)
        return false;
    if (requiredRole && user.role !== requiredRole)
        return false;
    return true;
}
