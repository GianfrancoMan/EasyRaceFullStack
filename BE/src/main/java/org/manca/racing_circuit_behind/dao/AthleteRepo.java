package org.manca.racing_circuit_behind.dao;

import org.manca.racing_circuit_behind.model.Athlete;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.CrossOrigin;

@Repository
@CrossOrigin(origins = "http://localhost:4200")
public interface AthleteRepo extends CrudRepository<Athlete, Long> {

  /**
   * search and return athletes that contain in their full name
   * the content of the filter passed as a parameter.
   */
  public Iterable<Athlete> findByNameLikeOrSurnameLike(String nameFilter, String surnameFilter);

  /**
   * search and return athletes that contain in their first name
   * the content of the filter passed as a parameter.
   */
  public Iterable<Athlete> findByNameLike(String nameFilter);

  
  /**
   * search and return athletes that contain in their last name
   * the content of the filter passed as a parameter.
   */
  public Iterable<Athlete> findBySurnameLike(String surnameFilter);


  @Modifying
  @Query("UPDATE Athlete a SET   a.team=:team WHERE a.id=:id")
  public int setAthlete( @Param("team") String team, @Param("id") Long id);
 

}
