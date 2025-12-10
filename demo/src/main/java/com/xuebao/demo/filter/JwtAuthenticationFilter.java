package com.xuebao.demo.filter;

import com.xuebao.demo.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UserDetailsService userDetailsService;

    // ✅ 修改：区分GET和POST的排除路径
    private static final List<String> GET_EXCLUDED_PATHS = Arrays.asList(
            "/.well-known/",
            "/favicon.ico",
            "/login",
            "/register",
            "/api/posts",           // GET文章列表
            "/api/posts/",          // GET单篇文章
            "/api/comments/",       // GET评论
            "/error"
    );

    private static final List<String> POST_EXCLUDED_PATHS = Arrays.asList(
            "/login",               // POST登录
            "/register"             // POST注册
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String requestURI = request.getRequestURI();
        String method = request.getMethod().toUpperCase(); // ✅ 获取HTTP方法
        System.out.println("=== JWT过滤器执行: " + method + " " + requestURI + " ===");

        // ✅ 修改：区分HTTP方法的路径检查
        if (isExcludedPath(method, requestURI)) {
            System.out.println("✅ 跳过JWT验证，公开接口: " + method + " " + requestURI);
            chain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        System.out.println("Authorization头: " + (authHeader != null ? authHeader.substring(0, Math.min(20, authHeader.length())) + "..." : "null"));

        if (!StringUtils.hasText(authHeader) || !authHeader.startsWith("Bearer ")) {
            System.out.println("❌ 无有效Authorization头，返回401错误");
            // ✅ 修改：返回401而不是继续过滤器链
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"需要认证令牌\"}");
            return;
        }

        try {
            String token = authHeader.substring(7);
            System.out.println("提取的Token: " + token.substring(0, Math.min(20, token.length())) + "...");

            System.out.println("开始验证Token...");
            boolean isValid = jwtUtil.validateToken(token);
            System.out.println("Token验证结果: " + isValid);

            if (isValid) {
                String username = jwtUtil.extractUsername(token);
                System.out.println("从Token提取的用户名: " + username);

                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    // 从数据库加载用户详情
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    System.out.println("✅ 用户详情加载成功: " + userDetails.getUsername());

                    UsernamePasswordAuthenticationToken authenticationToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );
                    authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authenticationToken);

                    System.out.println("✅ 认证信息已设置到SecurityContext");
                }
            } else {
                System.out.println("❌ Token验证失败，返回401错误");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Token无效或已过期\"}");
                return;
            }
        } catch (Exception e) {
            System.out.println("❌ JWT过滤器异常: " + e.getMessage());
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"认证处理失败\"}");
            return;
        }

        System.out.println("=== JWT过滤器执行结束 ===");
        chain.doFilter(request, response);
    }

    // ✅ 新增：支持HTTP方法区分的路径检查
    private boolean isExcludedPath(String method, String requestURI) {
        System.out.println("🔍 检查路径: " + method + " " + requestURI);

        // 1. OPTIONS预检请求总是放行
        if ("OPTIONS".equalsIgnoreCase(method)) {
            System.out.println("✅ 放行OPTIONS预检请求");
            return true;
        }

        // 2. 根据HTTP方法选择不同的排除列表
        List<String> excludedPaths;
        if ("GET".equalsIgnoreCase(method)) {
            excludedPaths = GET_EXCLUDED_PATHS;
            System.out.println("使用GET排除列表");
        } else if ("POST".equalsIgnoreCase(method)) {
            excludedPaths = POST_EXCLUDED_PATHS;
            System.out.println("使用POST排除列表");
        } else {
            // 其他方法（PUT、DELETE等）需要认证
            System.out.println("其他HTTP方法需要认证");
            return false;
        }

        // 3. 检查路径匹配
        for (String excludedPath : excludedPaths) {
            if (matchesPath(requestURI, excludedPath)) {
                System.out.println("✅ 匹配排除路径: " + excludedPath);
                return true;
            }
        }

        System.out.println("❌ 路径需要JWT认证");
        return false;
    }

    // ✅ 新增：改进的路径匹配方法（支持前缀匹配）
    private boolean matchesPath(String requestURI, String excludedPath) {
        // 精确匹配
        if (requestURI.equals(excludedPath)) {
            return true;
        }

        // 前缀匹配（对于以/结尾的路径）
        if (excludedPath.endsWith("/") && requestURI.startsWith(excludedPath)) {
            return true;
        }

        // 子路径匹配（对于不以/结尾的路径）
        if (!excludedPath.endsWith("/") && requestURI.startsWith(excludedPath + "/")) {
            return true;
        }

        return false;
    }

    // ✅ 保留原有方法（兼容性）
    private boolean isExcludedPath(String requestURI) {
        return isExcludedPath("GET", requestURI); // 默认使用GET方法检查
    }
}