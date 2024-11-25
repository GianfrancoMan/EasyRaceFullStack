package org.manca.racing_circuit_behind.configs;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {
  private final AuthenticationProvider authenticationProvider;
  private final JwtAuthenticationFilter jwtAuthenticationFilter;

  public SecurityConfiguration(
    AuthenticationProvider authenticationProvider,
    JwtAuthenticationFilter jwtAuthenticationFilter
    ) {
    this.authenticationProvider = authenticationProvider;
    this.jwtAuthenticationFilter = jwtAuthenticationFilter;
  }

  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http) {
    try {
      http
        .csrf(AbstractHttpConfigurer::disable)
        .authorizeHttpRequests(req -> {
          req.requestMatchers("auth/**", "officer/**")
          .permitAll()
          .anyRequest()
          .authenticated();
        })
        .sessionManagement((ssn) -> ssn.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
        .authenticationProvider(authenticationProvider)
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
  
      return http.build();      
    } catch (Exception e) {
      e.printStackTrace();
      return null;
    }
  }

}
