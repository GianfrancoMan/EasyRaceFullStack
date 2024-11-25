package org.manca.racing_circuit_behind.controller;

import org.manca.racing_circuit_behind.model.LoginResponse;
import org.manca.racing_circuit_behind.model.LoginUserDto;
import org.manca.racing_circuit_behind.model.RegisterUserDto;
import org.manca.racing_circuit_behind.model.User;
import org.manca.racing_circuit_behind.service.AuthenticationService;
import org.manca.racing_circuit_behind.service.JwtService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;



@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/auth")
public class AuthenticationController {

  private final JwtService jwtService;
  private final AuthenticationService authenticationService;

  public AuthenticationController(JwtService jwtService, AuthenticationService authenticationService) {
    this.jwtService = jwtService;
    this.authenticationService = authenticationService;
  }

  @PostMapping("/signup")
  public ResponseEntity<User> register(@RequestBody RegisterUserDto registerUserDto) {
      User registeredUser = authenticationService.signup(registerUserDto);      
      return ResponseEntity.ok(registeredUser);
  }

  @PostMapping("/login")
  public ResponseEntity<LoginResponse> postMethodName(@RequestBody LoginUserDto loginUserDto) {
      User authenticatedUser = authenticationService.authenticate(loginUserDto);
      String jwtToken = jwtService.generateToken(authenticatedUser);
      LoginResponse loginResponse = new LoginResponse();
      loginResponse.setToken(jwtToken);
      loginResponse.setExpiresIn(jwtService.getExpirationTime());
      return ResponseEntity.ok(loginResponse);
  }


  /**Clears useless files */
  @GetMapping("/context_clr")  
  public void getClearContext() {
    authenticationService.clearContext();
  }

}
