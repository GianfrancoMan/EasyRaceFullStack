package org.manca.racing_circuit_behind.configs;

import org.manca.racing_circuit_behind.dao.UserRepo;
import org.manca.racing_circuit_behind.model.RawRace;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.context.annotation.SessionScope;


@Configuration
public class ConfigurationClass {

  private final UserRepo userRepo;

  @Autowired
  public ConfigurationClass(UserRepo userRepo) {
    this.userRepo = userRepo;
  }
  

  @Bean
  UserDetailsService userDetailsService() {
    return username -> userRepo.findByEmail(username).orElseThrow(()-> new UsernameNotFoundException("User Not Found"));
  }

  @Bean
  BCryptPasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
    return config.getAuthenticationManager();
  }

  @Bean
  AuthenticationProvider authenticationProvider() {
    DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
    authProvider.setUserDetailsService(userDetailsService());
    authProvider.setPasswordEncoder(passwordEncoder());
    return authProvider;
  }

  @Bean
  @SessionScope
  RawRace rawRace() { return new RawRace(); }



}
