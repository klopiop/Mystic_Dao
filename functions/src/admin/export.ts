import { prisma } from '../lib/prisma';
import { getUserFromRequest } from '../lib/auth';

export async function handler(req: Request): Promise<Response> {
  // CORS 处理
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // 验证用户
  const user = await getUserFromRequest(req.headers);
  if (!user || user.role !== 'ADMIN') {
    return new Response(
      JSON.stringify({ error: 'Forbidden' }),
      {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // 获取所有用户数据
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        bannedAt: true,
        createdAt: true,
        _count: {
          select: {
            conversations: true,
          },
        },
      },
    });

    // 获取所有会话数据
    const conversations = await prisma.conversation.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 获取所有消息数据
    const messages = await prisma.message.findMany({
      include: {
        conversation: {
          select: {
            id: true,
            type: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 1000, // 限制返回数量
    });

    // 获取审计日志
    const auditLogs = await prisma.auditLog.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 500,
    });

    const exportData = {
      users,
      conversations,
      messages,
      auditLogs,
      exportedAt: new Date().toISOString(),
      exportedBy: user.id,
    };

    // 记录导出操作
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'EXPORT_USERS',
        message: 'Admin exported all data',
        ip: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
      },
    });

    return new Response(JSON.stringify(exportData), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="export-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}
