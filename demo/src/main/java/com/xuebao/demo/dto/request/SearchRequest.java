package com.xuebao.demo.dto.request;

public class SearchRequest {
    private String keyword; // 搜索关键词

    // 无参构造器、Getter 和 Setter 是必需的
    public SearchRequest() {}
    public String getKeyword() { return keyword; }
    public void setKeyword(String keyword) { this.keyword = keyword; }
}