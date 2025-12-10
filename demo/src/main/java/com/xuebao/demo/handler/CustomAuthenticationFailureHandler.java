package com.xuebao.demo.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.xuebao.demo.dto.response.LoginResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class CustomAuthenticationFailureHandler implements AuthenticationFailureHandler {

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        String errorMessage = "fail";
        if (exception instanceof BadCredentialsException) {
            errorMessage = "wrong password or username";
        } else if (exception instanceof DisabledException) {
            errorMessage = "enabled user";
        }

        LoginResponse loginResponse = new LoginResponse(false, errorMessage);
        response.getWriter().write(new ObjectMapper().writeValueAsString(loginResponse));
    }
}