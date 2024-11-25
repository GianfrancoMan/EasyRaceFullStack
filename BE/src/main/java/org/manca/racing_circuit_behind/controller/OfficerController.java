package org.manca.racing_circuit_behind.controller;

import java.util.List;

import org.manca.racing_circuit_behind.model.Category;
import org.manca.racing_circuit_behind.model.CrossingData;
import org.manca.racing_circuit_behind.model.Result;
import org.manca.racing_circuit_behind.service.OfficerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;



@RestController
@RequestMapping("/officer")
@CrossOrigin(origins = "http://localhost:4200")
public class OfficerController {

  private OfficerService officer;

  @Autowired
  public OfficerController(OfficerService officer) {
    this.officer = officer;
  }
  
  /**
   * Receives a org.springframework.web.multipart.MultipartFile that contains a serialized org.manca.racing_circuit_behind.model.RawRace
   * instance as parameter
   * Delegates OfficeService to get the RawRace and manage it.
   * @param file
   * @return boolean true if success otherwise false.
   */
  @PostMapping("/upload")
  public ResponseEntity<List<Category>> uploadFileForRegister(@RequestParam MultipartFile file, HttpSession session) {
    return officer.getRawRaceForOfficer(file, session.getId());
  }


  /**
   * Send the received categories to the OfficerService by calling the setStartTimes method which provides
   * for the initialization of the athletes' starting time.
   * @param categories
   * @return
   */
  @PostMapping("/start")
  public int startCategories(@RequestParam String categories, HttpServletResponse response) {
    return officer.setStartTimes(categories, response);
  }


  /**
   * Obtain from the client the race number of the athlete that across the finish line and delegates
   * the OfficerService  to handle these feature.
   * @param raceNumber
   * @return org.manca.racing_circuit_behind.model.CrossingData
   */
  @GetMapping("/crossing")    
  public CrossingData crossingFinishLine(@RequestParam Integer rn, HttpServletResponse response) {
    return officer.manageCrossingFinishLine(rn, response);
  }

  @GetMapping("/category-ranking/{catname}")
  public List<CrossingData> getCategoryRanking(@PathVariable String catname, HttpServletResponse response) {
      return this.officer.categoryRanking(catname, response);
  }

  
  @GetMapping("/ranking")
  public List<CrossingData> getRanking(HttpServletResponse response) {
      return this.officer.ranking(response);
  }

  @GetMapping("/performed")
  public ResponseEntity<Resource> postAsPerformed(@RequestParam String filename) {
    return officer.markAsPerformed(filename);
  }
  
  @GetMapping("/results")
  public List<Result> getRaceResults(@RequestParam String filename, @RequestParam String rankingName) {
      return officer.raceResults(filename, rankingName);
  }
  

}
