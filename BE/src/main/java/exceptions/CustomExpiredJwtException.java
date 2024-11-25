package exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class CustomExpiredJwtException extends RuntimeException{
  public CustomExpiredJwtException() {
    this.handle();
  }

  private ResponseEntity<Boolean>handle() {
    return new ResponseEntity<Boolean>(false, HttpStatus.FORBIDDEN);
  }
}
