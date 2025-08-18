package com.sonic.sonictaskhub.web.handler;

import com.sonic.sonictaskhub.model.response.BaseResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Handle generic runtime exceptions
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<BaseResponse<Object>> handleRuntimeException(RuntimeException ex, WebRequest request) {
        logger.error("Runtime exception occurred: {}", ex.getMessage(), ex);
        
        BaseResponse<Object> response = BaseResponse.error(ex.getMessage(), "RUNTIME_ERROR");
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle illegal argument exceptions
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<BaseResponse<Object>> handleIllegalArgumentException(IllegalArgumentException ex, WebRequest request) {
        logger.error("Illegal argument exception: {}", ex.getMessage(), ex);
        
        BaseResponse<Object> response = BaseResponse.error(ex.getMessage(), "INVALID_ARGUMENT");
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle null pointer exceptions
     */
    @ExceptionHandler(NullPointerException.class)
    public ResponseEntity<BaseResponse<Object>> handleNullPointerException(NullPointerException ex, WebRequest request) {
        logger.error("Null pointer exception occurred: {}", ex.getMessage(), ex);
        
        BaseResponse<Object> response = BaseResponse.error("An unexpected error occurred", "NULL_POINTER_ERROR");
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Handle authentication/authorization exceptions
     */
    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<BaseResponse<Object>> handleSecurityException(SecurityException ex, WebRequest request) {
        logger.error("Security exception: {}", ex.getMessage(), ex);
        
        BaseResponse<Object> response = BaseResponse.error(ex.getMessage(), "SECURITY_ERROR");
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Handle generic exceptions
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<BaseResponse<Object>> handleGenericException(Exception ex, WebRequest request) {
        logger.error("Unexpected exception occurred: {}", ex.getMessage(), ex);
        
        BaseResponse<Object> response = BaseResponse.error("An unexpected error occurred", "INTERNAL_ERROR");
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Handle custom business logic exceptions
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<BaseResponse<Object>> handleBusinessException(BusinessException ex, WebRequest request) {
        logger.warn("Business exception: {}", ex.getMessage());
        
        BaseResponse<Object> response = BaseResponse.error(ex.getMessage(), ex.getErrorCode());
        return new ResponseEntity<>(response, ex.getHttpStatus());
    }

    /**
     * Custom exception class for business logic errors
     */
    public static class BusinessException extends RuntimeException {
        private final String errorCode;
        private final HttpStatus httpStatus;

        public BusinessException(String message) {
            this(message, "BUSINESS_ERROR", HttpStatus.BAD_REQUEST);
        }

        public BusinessException(String message, String errorCode) {
            this(message, errorCode, HttpStatus.BAD_REQUEST);
        }

        public BusinessException(String message, String errorCode, HttpStatus httpStatus) {
            super(message);
            this.errorCode = errorCode;
            this.httpStatus = httpStatus;
        }

        public String getErrorCode() {
            return errorCode;
        }

        public HttpStatus getHttpStatus() {
            return httpStatus;
        }
    }
}