package com.xuebao.demo.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.xuebao.demo.dto.request.LoginRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JsonUsernamePasswordAuthenticationFilter extends UsernamePasswordAuthenticationFilter {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request,
                                                HttpServletResponse response)
            throws AuthenticationException {

        // 检查 Content-Type 是否为 JSON
        if ("application/json".equalsIgnoreCase(request.getContentType())) {
            try {
                // 解析 JSON 请求体
                LoginRequest loginRequest = objectMapper.readValue(
                        request.getInputStream(), LoginRequest.class);

                // 创建认证令牌
                UsernamePasswordAuthenticationToken authRequest =
                        UsernamePasswordAuthenticationToken.unauthenticated(
                                loginRequest.getUsername(),
                                loginRequest.getPassword()
                        );

                // 设置详细信息
                setDetails(request, authRequest);

                // 执行认证
                return this.getAuthenticationManager().authenticate(authRequest);

            } catch (IOException e) {
                throw new RuntimeException("JSON parsing error", e);
            }
        } else {
            // 降级到默认的表单处理
            return super.attemptAuthentication(request, response);
        }
    }
}