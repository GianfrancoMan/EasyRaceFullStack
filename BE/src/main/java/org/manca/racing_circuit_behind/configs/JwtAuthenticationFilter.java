package org.manca.racing_circuit_behind.configs;

import java.io.IOException;

import org.manca.racing_circuit_behind.service.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

import exceptions.CustomExpiredJwtException;
import exceptions.GlobalExceptionHandler;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
  private final HandlerExceptionResolver handlerExceptionResolver;
  private final JwtService jwtService;
  private final UserDetailsService sUserDetailsService;

  public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService, HandlerExceptionResolver handlerExceptionResolver) {
    this.handlerExceptionResolver = handlerExceptionResolver;
    this.sUserDetailsService = userDetailsService;
    this.jwtService = jwtService;
  }


  @Override
  protected void doFilterInternal(
    @NonNull HttpServletRequest request,
    @NonNull HttpServletResponse response,
    @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
      

      try {
      final String authHeader = request.getHeader("Authorization");
      if(authHeader == null || !authHeader.startsWith("Bearer ")) {
        filterChain.doFilter(request, response);
        return;
      }
        final String jwt = authHeader.substring(7);
        final String userEmail = jwtService.extractUsername(jwt);
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(userEmail != null && authentication == null) {
          UserDetails userDetails = this.sUserDetailsService.loadUserByUsername(userEmail);
          if(jwtService.isTokenValid(jwt, userDetails)) {
            System.out.println(userEmail);
            UsernamePasswordAuthenticationToken authToken =
              new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
          }
        }
        filterChain.doFilter(request, response);
      } catch (Exception e) {
        e.printStackTrace();
        handlerExceptionResolver.resolveException(request, response, null, e);        
        if(e instanceof ExpiredJwtException) {
          throw new CustomExpiredJwtException();
        }
      }
  }

}
