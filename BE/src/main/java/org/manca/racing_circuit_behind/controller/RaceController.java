package org.manca.racing_circuit_behind.controller;


import java.util.List;

import org.manca.racing_circuit_behind.model.Athlete;
import org.manca.racing_circuit_behind.model.Category;
import org.manca.racing_circuit_behind.model.Race;
import org.manca.racing_circuit_behind.model.RaceDataForAthlete;
import org.manca.racing_circuit_behind.model.User;
import org.manca.racing_circuit_behind.service.RaceService;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PutMapping;







@RestController
@CrossOrigin(
  origins = "http://localhost:4200")
@RequestMapping("/race")
public class RaceController {

  private RaceService raceService;

  @Autowired
  public RaceController(RaceService raceService) {
    this.raceService = raceService;
  }

  /**
   * Delegates org.manca.racing_circuit_behind.service.RaceService to Get all races from the data source.
   * @return a java.util.List of org.manca.racing_circuit_behind.model.Race instances 
   */
  @GetMapping
  public Iterable<Race> allRaces() {
      return raceService.getAllRaces();
  }

  
  // /**
  //  *Return a set of races selected by the filter passed as parameter
  //  * @param  filter the filter.
  //  * @return a java.util.List of org.manca.racing_circuit_behind.model.Race instances 
  //  */
  // @GetMapping("/{filterData}")
  // public Iterable<Race> getRacesByFilter(@PathVariable String filterData) {
  //     return raceService.racesByFilter(filterData);
  // }
    

  /**
   * This http method receives request to persists a new instance of Race.
   * When a new race is created I need to create and serialize a new instance of
   * RawRace(that will be useful in race execution time) to send to the client.
   * RaceService method is delegating to solve this challenge.
   * @param race org.manca.racing_circuit_behind.model.Race instance.
   * @return org.springframework.http.ResponseEntity<Resource>
   */
  @PostMapping
  public ResponseEntity<Resource> addRace(@RequestBody Race race) {
    return raceService.createRace(race);
  }

  /**
   * This end point is used to delete temporary file created when race has been created
   * @param fileName
   */
  @DeleteMapping("/file/{fileName}")
  public void deleteTemporaryFile(@PathVariable String fileName) {
    raceService.deleteFile(fileName);
  }


  /**
   * upload a file that contains a serialized RawRace instance, basically
   * this instance is the race configuration.
   * @param file The file that contain the race configuration.
   * @return A boolean true if uploading was successful, false otherwise.
   */
  @PostMapping("/upload")
  public boolean uploadConfiguration(MultipartFile file) {
    return raceService.storeInTemporaryFolder(file);
  }


  /**
   * Retrieve categories, laps  and race number available to be assigned automatically
   * related to a specific race.
   * based on the data contained in the file sen as parameter.
   * @param file a org.springframework.web.multipart.MultipartFile instance
   * @return An org.manca.racing_circuit_behind.model.RaceDataForAthlete instance
   */
  @PostMapping("/data-for-athlete")  
  public RaceDataForAthlete getRaceDataForAthlete(@RequestParam MultipartFile file) {
    return raceService.raceDataForAthlete(file);
  }


  /**
   * returns all athletes registered for the race by retrieving them from the race configuration contained in the file passed as a parameter.j
   * @param file a org.springframework.web.multipart.MultipartFile instance
   * @return An java.util.List of org.manca.racing_circuit_behind.model.Athlete instances
   */
  @PostMapping("/lst-athl")  
  public List<Athlete> getRaceAthletes(@RequestParam MultipartFile file) {
    return raceService.raceAthletes(file);
  }


  /**
   * Removes an Athlete registered for a specific race using his ID
   * @param filename
   * @param athleteId
   * @return an org.springframework.http.ResponseEntity<Resource> instance.
   */
  @GetMapping("/excl-athl")
  public ResponseEntity<Resource> removeAthleteFromRace(@RequestParam String filename, @RequestParam Long athleteId) {
      return raceService.removeAthlete(athleteId, filename);
  }


  /**
   * Deserializes the serialized RawRace instance into the temporary file to get 
   * the race ID with which to retrieve the Race instance from the DataStore 
   * and return it to the client
   * 
   * @param filename the name of the file to deserialized.
   * @return an org.manca.racing_circuit_behind.model.Race instance
   */
  @GetMapping("/avlbl-dt")
  public Race configurationData(@RequestParam String filename) {
      return raceService.getDataConfigurationAvailableForChanges(filename);
  }

  /**
   * Endpoint to replace currently data configuration with ones passed to the client
   * @param race an object, instance of org.manca.racing_circuit_behind.model.Race.
   * @return A file containing the modified race configuration.
   */
  @PutMapping("/updt-bsc")
  public ResponseEntity<Resource> updateConfiguration(@RequestBody Race race, @RequestParam String filename) {
      return raceService.serveUpdateConfiguration(race, filename);
  }



  /**
   * Delegates the service to retrieves and returns categories from the race configuration currently  serialized in the temporary file
   * with name equal to the value of the <strong>filename</strong> parameter
   * @param  <strong>filename</strong> the name f the temporary file.
   * @return a java.util.List of org.manca.racing_circuit_behind.model.Category instances.
   */
  @GetMapping("/ctgrs")
  public List<Category> getRaceCategories(@RequestParam String filename) {
    return this.raceService.getCategories(filename);
  }

  /**
   * Delegates Service to retrieves the race configuration to return back.
   * @param filename the name of a temporary file that contains race configuration data.
   * @return a ResponseEntity<Resource>, basically a file that contains a serialized RaceConfiguration instance.
   */
  @GetMapping("/get/cnf")
  public ResponseEntity<Resource> getConfiguration(@RequestParam String filename) {
    return raceService.downloadConfiguration(filename);
  }


  /**
   * Delegates service to change the name af a category in a race configuration
   * @param filename the name of a temporary file
   * @param oldName the category name to change
   * @param newName the new category name
   * @return an org.manca.racing_circuit_behind.model.Category instance
   */
  @PutMapping("/chng/nm")
  public Category putCategoryName(@RequestParam String[] parameter) {
    return raceService.changeCategoryName(parameter[0], parameter[1], parameter[2]);
  }



  /**
   * Delegates the service to check if the uploaded configuration is marked as performed or not
   * @param file a MultiPart instance that contains the file with data of the race configuration.
   * @return boolean true if the race configuration ahs been marked as performed, otherwise false.  
   */
  @PostMapping("/pld-chck")
  public ResponseEntity<Boolean> postCheckForPerformed(@RequestParam MultipartFile file) {
    boolean result = this.raceService.checkForPerformed(file);
    return new ResponseEntity<Boolean>(result, HttpStatus.OK);
  }
}
