package com.xuebao.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class StaticResourceController {

    @GetMapping("/.well-known/appspecific/com.chrome.devtools.json")
    public Map<String, Object> chromeDevToolsConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("name", "Xuebao Blog API");
        config.put("version", "1.0.0");
        config.put("timestamp", System.currentTimeMillis());
        return config;
    }

    @GetMapping("/favicon.ico")
    public ResponseEntity<Void> favicon() {
        return ResponseEntity.noContent().build();
    }
}