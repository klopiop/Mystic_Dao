// ESA 函数计算入口文件
export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname;
        // 简单的路由处理
        if (path.startsWith('/api/')) {
            // 返回 API 响应
            return new Response(JSON.stringify({ message: 'API endpoint' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 200
            });
        }
        // 返回默认响应
        return new Response('Hello from ESA Functions!', {
            status: 200
        });
    }
};
