package org.manca.racing_circuit_behind.controller;

import org.manca.racing_circuit_behind.model.RegisterUserDto;
import org.manca.racing_circuit_behind.model.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/user")
public class UserController {

  @GetMapping
  public RegisterUserDto getUser(@AuthenticationPrincipal User user) {
      RegisterUserDto rUDto = new RegisterUserDto(); 
      rUDto.setEmail(user.getEmail());
      rUDto.setName(user.getName());
      rUDto.setSurname(user.getSurname());
      return rUDto;
  }
  

}
