package org.manca.racing_circuit_behind.service;

import org.manca.racing_circuit_behind.dao.UserRepo;
import org.manca.racing_circuit_behind.model.LoginUserDto;
import org.manca.racing_circuit_behind.model.RegisterUserDto;
import org.manca.racing_circuit_behind.model.User;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {
  private final UserRepo userRepo;
  private final PasswordEncoder passwordEncoder;
  private final AuthenticationManager authenticationManager;
  private final SerializationService ss;

  public AuthenticationService(
          UserRepo userRepo,
          PasswordEncoder passwordEncoder,
          AuthenticationManager authenticationManager,
          SerializationService ss
          ) {
    this.userRepo = userRepo;
    this.passwordEncoder = passwordEncoder;
    this.authenticationManager = authenticationManager;
    this.ss = ss;
  }

  public User signup(RegisterUserDto rud) {
    System.out.println("called");
    User user = new User();
    user.setName(rud.getName());
    user.setSurname(rud.getSurname());
    user.setEmail(rud.getEmail());
    user.setPassword(passwordEncoder.encode(rud.getPassword()));
    return userRepo.save(user);
  }  

  public User authenticate(LoginUserDto lud) {
      authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(lud.getEmail(), lud.getPassword()));
      return userRepo.findByEmail(lud.getEmail()).orElseThrow();
  }
  

  /**clears useless temporary files*/
  public void clearContext() {
    this.ss.clearSerializationContext();
  }
}
