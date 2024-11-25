package exceptions;

import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AccountStatusException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.SignatureException;

@RestControllerAdvice
public class GlobalExceptionHandler {
  @ExceptionHandler(Exception.class)
  public ProblemDetail manageSecurityException(Exception exception) {
    ProblemDetail errProblemDetail = null;
    exception.printStackTrace();
    if(exception instanceof BadCredentialsException) {
      errProblemDetail = ProblemDetail.forStatusAndDetail(HttpStatusCode.valueOf(401), exception.getMessage());
      errProblemDetail.setProperty("Description", "username or password is incorrect");

      return errProblemDetail;
    }
    
    if(exception instanceof AccountStatusException) {
      errProblemDetail = ProblemDetail.forStatusAndDetail(HttpStatusCode.valueOf(403), exception.getMessage());
      errProblemDetail.setProperty("Description", "The account is locked");

      return errProblemDetail;
    }
    
    if(exception instanceof AccessDeniedException) {
      errProblemDetail = ProblemDetail.forStatusAndDetail(HttpStatusCode.valueOf(403), exception.getMessage());
      errProblemDetail.setProperty("Description", "you are not authorize to access this resource");

      return errProblemDetail;
    }
    
    if(exception instanceof SignatureException) {
      errProblemDetail = ProblemDetail.forStatusAndDetail(HttpStatusCode.valueOf(403), exception.getMessage());
      errProblemDetail.setProperty("Description", "The JWT signature is invalid");

      return errProblemDetail;
    }
    
    if(exception instanceof ExpiredJwtException) {
      errProblemDetail = ProblemDetail.forStatusAndDetail(HttpStatusCode.valueOf(403), exception.getMessage());
      errProblemDetail.setProperty("Description", "The JWT token has expired");

      return errProblemDetail;
    }
    
    if(errProblemDetail == null) {
      errProblemDetail = ProblemDetail.forStatusAndDetail(HttpStatusCode.valueOf(500), exception.getMessage());
      errProblemDetail.setProperty("Description", "Unknown internal server error");
    }

    return errProblemDetail;
  }
}
