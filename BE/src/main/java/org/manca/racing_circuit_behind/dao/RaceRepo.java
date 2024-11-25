package org.manca.racing_circuit_behind.dao;


import org.manca.racing_circuit_behind.model.Race;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.CrossOrigin;

@Repository
@CrossOrigin(origins = "http://localhost:4200")
public interface RaceRepo extends CrudRepository<Race, Long> {

  // public Iterable<Race> findByTitleLikeOrCityLikeOrDateBetween(
  //   String filterTitle, String filterCity, LocalDate filterDateStart, LocalDate filterDateEnd
  // );

}
