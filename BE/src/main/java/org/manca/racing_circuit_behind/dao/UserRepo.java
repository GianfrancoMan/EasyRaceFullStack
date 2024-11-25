package org.manca.racing_circuit_behind.dao;

import java.util.Optional;

import org.manca.racing_circuit_behind.model.User;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.CrossOrigin;

@Repository
@CrossOrigin(origins = "http://localhost:4200")
public interface UserRepo extends CrudRepository<User, Long> {

  Optional<User> findByEmail(String email);

}
