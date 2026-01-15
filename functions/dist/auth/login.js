import { prisma } from '../lib/prisma';
import { verifyPassword, generateToken, } from '../lib/auth';
export async function handler(req) {
    // CORS 处理
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }
    try {
        const payload = (await req.json());
        const { email, password } = payload;
        if (!email || !password) {
            return new Response(JSON.stringify({ error: 'Email and password are required' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }
        // 查找用户
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!user) {
            return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }
        // 检查用户是否被封禁
        if (user.bannedAt) {
            return new Response(JSON.stringify({ error: 'Account has been banned' }), {
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }
        // 验证密码
        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) {
            return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }
        // 生成 JWT token
        const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role,
        });
        // 记录审计日志
        await prisma.auditLog.create({
            data: {
                actorId: user.id,
                action: 'LOGIN',
                message: 'User logged in',
                ip: req.headers.get('x-forwarded-for') || 'unknown',
                userAgent: req.headers.get('user-agent') || 'unknown',
            },
        });
        const response = {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
            token,
        };
        return new Response(JSON.stringify(response), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
}
