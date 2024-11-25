package org.manca.racing_circuit_behind.controller;


import java.util.List;

import org.manca.racing_circuit_behind.model.Athlete;
import org.manca.racing_circuit_behind.model.Category;
import org.manca.racing_circuit_behind.model.DataForRegistration;
import org.manca.racing_circuit_behind.service.AthleteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;


@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/athlete")
public class AthleteController {

  private AthleteService athleteService;
  //private static final String BASE_URL = "/athlete";

  @Autowired
  public AthleteController(AthleteService athleteService) {
    this.athleteService = athleteService;
  }


  /**
   * Return the Athlete with ID equal to the value of the 'id' parameter or an empty Athlete instance if the service not found the needed athlete.
   * @param id tha ID of the Athlete to return.
   * @return an object instance of the org.manca.racing_circuit_behind.model.Athlete class.
   */
  public Athlete athleteById(Long id) {
    return athleteService.findAtllheteById(id);
  }


  /**
   * Delegates org.manca.racing_circuit_behind.service.AthleteService to Get all athletes from the data source.
   * @return a java.util.List of org.manca.racing_circuit_behind.model.Athlete instances 
   */
  @GetMapping("/")
  public Iterable<Athlete> allAthletes() {
      return athleteService.getAllAthletes();
  }
  

  /**
   * Delegates org.manca.racing_circuit_behind.service.AthleteService to persists
   * an org.manca.racing_circuit_behind.model.Athlete instance.
   * @param race
   * @return The created org.manca.racing_circuit_behind.model.Athlete instance
   */
  @PostMapping("/")
  public Athlete addAthlete(@RequestBody Athlete athlete) {

      return athleteService.createAthlete(athlete);
  }


  /**
   * return a list of athlete based on the filter parameter
   * @param filter The filter
   * @return a java.util.List of org.manca.racing_circuit_behind.model.Athlete
   */
  @GetMapping("/{filterName}"+"/{filterSurname}")
  public List<Athlete> getFilteredAthletes(@PathVariable String filterName, @PathVariable String filterSurname) {
    return athleteService.filteredAthletes(filterName, filterSurname);
  }


  /**
   * Receives a org.springframework.web.multipart.MultipartFile that contains a serialized org.manca.racing_circuit_behind.model.RawRace
   * instance as parameter and store it temporally.
   * @param file
   * @return boolean true if success otherwise false.
   */
  @PostMapping("/register/upload")
  public boolean uploadFileForRegister(@RequestParam MultipartFile file) {

    return athleteService.uploadRegister(file);
  }

  /**
   * Receives Athlete date to be stored in the db and in RawRace instance serialized in the file uploaded
   * by registerAthleteForRace method above.
   * Delegates setDataForRegister() method of AthleteService Class to manage this features.
   * @param athlete
   * @return
   */
  @PostMapping("/register/data")
  public ResponseEntity<Resource> setDataForRegister(@RequestBody DataForRegistration data) {
      return athleteService.manageDataForRegister(data);
  }


  @GetMapping("/partial")
  public Iterable<Athlete> getByIds(@RequestParam Long[] ids) {
    List<Long> idsList = List.of(ids);
    return athleteService.findAthletesById(idsList);
  }



  /**
   * Delegates the  AthleteService to find and retrieve the category of a specific athlete, from a race configuration
   * that is stored in a temporary file
   * @param filename the name of the temporary file.
   * @param athleteId the unique ID of the target athlete.
   * @return org.manca.racing_circuit_behind.model.Category the category of the target athlete.
   */
  @GetMapping("/ctgr")
  public Category getAthleteCategory(@RequestParam String fileName, @RequestParam Long athleteId) {
      return athleteService.findCategory(fileName, athleteId);
  }



  /**
   * Delegates the Athlete service to replace the category of a specific athlete with the one passed as parameter 
   * all needed data come from a race configuration stored in a temporary file.
   * @param filename the name of the temporary file.
   * @param athleteId the unique Id of the target athlete.
   * @param category the new category of the target athlete
   * @return boolean true if the operation was successful.
   */
  @PostMapping("/pdt-ctgr")
  public boolean updateAthleteCategory(@RequestBody Category category, @RequestParam String filename, @RequestParam Long idAthlete) {
    return athleteService.updateAthleteCategory(filename, idAthlete, category);    
  }

}
