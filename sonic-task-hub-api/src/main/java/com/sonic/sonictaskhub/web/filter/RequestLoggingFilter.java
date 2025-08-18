package com.sonic.sonictaskhub.web.filter;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class RequestLoggingFilter implements Filter {

    private static final Logger logger = LoggerFactory.getLogger(RequestLoggingFilter.class);
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        logger.info("RequestLoggingFilter initialized");
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        if (request instanceof HttpServletRequest && response instanceof HttpServletResponse) {
            HttpServletRequest httpRequest = (HttpServletRequest) request;
            HttpServletResponse httpResponse = (HttpServletResponse) response;
            
            long startTime = System.currentTimeMillis();
            String requestTime = LocalDateTime.now().format(formatter);
            
            // Log request
            String requestInfo = String.format("[%s] %s %s from %s - User-Agent: %s",
                    requestTime,
                    httpRequest.getMethod(),
                    httpRequest.getRequestURI(),
                    getClientIpAddress(httpRequest),
                    httpRequest.getHeader("User-Agent"));
            
            logger.info("Incoming Request: {}", requestInfo);
            
            // Log query parameters if present
            String queryString = httpRequest.getQueryString();
            if (queryString != null && !queryString.isEmpty()) {
                logger.info("Query Parameters: {}", queryString);
            }
            
            // Log request headers (selective)
            String contentType = httpRequest.getContentType();
            if (contentType != null) {
                logger.debug("Content-Type: {}", contentType);
            }
            
            try {
                // Continue with the filter chain
                chain.doFilter(request, response);
                
                // Log response
                long duration = System.currentTimeMillis() - startTime;
                String responseInfo = String.format("[%s] Response %d for %s %s - Duration: %d ms",
                        LocalDateTime.now().format(formatter),
                        httpResponse.getStatus(),
                        httpRequest.getMethod(),
                        httpRequest.getRequestURI(),
                        duration);
                
                if (httpResponse.getStatus() >= 400) {
                    logger.warn("Request completed with error: {}", responseInfo);
                } else {
                    logger.info("Request completed successfully: {}", responseInfo);
                }
                
            } catch (Exception e) {
                long duration = System.currentTimeMillis() - startTime;
                logger.error("Request failed: [{}] {} {} - Duration: {} ms - Error: {}",
                        LocalDateTime.now().format(formatter),
                        httpRequest.getMethod(),
                        httpRequest.getRequestURI(),
                        duration,
                        e.getMessage());
                throw e;
            }
        } else {
            chain.doFilter(request, response);
        }
    }

    @Override
    public void destroy() {
        logger.info("RequestLoggingFilter destroyed");
    }

    /**
     * Get the real client IP address, considering possible proxy headers
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String[] headerNames = {
            "X-Forwarded-For",
            "X-Real-IP",
            "Proxy-Client-IP",
            "WL-Proxy-Client-IP",
            "HTTP_X_FORWARDED_FOR",
            "HTTP_X_FORWARDED",
            "HTTP_X_CLUSTER_CLIENT_IP",
            "HTTP_CLIENT_IP",
            "HTTP_FORWARDED_FOR",
            "HTTP_FORWARDED",
            "HTTP_VIA",
            "REMOTE_ADDR"
        };

        for (String header : headerNames) {
            String ip = request.getHeader(header);
            if (ip != null && ip.length() != 0 && !"unknown".equalsIgnoreCase(ip)) {
                // Get first IP if there are multiple (comma-separated)
                if (ip.contains(",")) {
                    ip = ip.split(",")[0].trim();
                }
                return ip;
            }
        }

        return request.getRemoteAddr();
    }
}