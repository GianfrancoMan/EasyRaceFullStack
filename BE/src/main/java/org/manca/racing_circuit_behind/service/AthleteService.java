package org.manca.racing_circuit_behind.service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.manca.racing_circuit_behind.dao.AthleteRepo;
import org.manca.racing_circuit_behind.model.Athlete;
import org.manca.racing_circuit_behind.model.AthletePersistenceOperation;
import org.manca.racing_circuit_behind.model.Category;
import org.manca.racing_circuit_behind.model.DataForRegistration;
import org.manca.racing_circuit_behind.model.RawAthlete;
import org.manca.racing_circuit_behind.model.RawRace;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class AthleteService {

  private AthleteRepo athleteRepo;
  private SerializationService ss;
  @Value("${org.manca.temp}")
  private String TEMPORARY_PATH;

  @Autowired
  public AthleteService(AthleteRepo athleteRepo, SerializationService serializationService) {
    this.athleteRepo = athleteRepo;
    ss = serializationService;
  }



  public Athlete findAtllheteById(Long id) {
    Athlete athlete = athleteRepo.findById(id).orElse(null);
    if(athlete != null)
      return athlete;
    else
      return new Athlete();
  }

  /**
   * Get all Athletes from the data source.
   * @return a java.util.List of org.manca.racing_circuit_behind.model.Athlete instances
   */
  public Iterable<Athlete> getAllAthletes() {
    return athleteRepo.findAll();
  }

  
  /**
   * Persists the org.manca.racing_circuit_behind.model.Athlete instance in the Data Source
   * @param race
   * @return
   */
  public Athlete createAthlete(Athlete athlete) {
    return  athleteRepo.save(athlete);
  }



  /**
   * Basically delegates a method of AthleteRepo interface to search and return
   * athletes that contain in their full name the content of the filter passed
   * as a parameter
   * @param filter the filter
   * @return  a java.util.List of org.manca.racing_circuit_behind.model.Athlete
   */
  public List<Athlete> filteredAthletes(String filterName, String filterSurname) {

    String likeFilter1 = "%"+filterName+"%";
    String likeFilter2 = "%"+filterSurname+"%";
    List<Athlete> filteredAthletes = new ArrayList<>();

    if(filterName.equals("_")) {
      for(Athlete athlete : athleteRepo.findBySurnameLike(likeFilter2)) filteredAthletes.add(athlete);
      return filteredAthletes;
    }

    if(filterSurname.equals("_")) {
      for(Athlete athlete : athleteRepo.findByNameLike(likeFilter1)) filteredAthletes.add(athlete);
      return filteredAthletes;
    }
    
    for(Athlete athlete : athleteRepo.findByNameLikeOrSurnameLike(likeFilter1, likeFilter2)) filteredAthletes.add(athlete);
    return filteredAthletes;    
  }


  /**
   * Does persistence operations with Athlete entity and serialization/deserialization operations to update
   * race configuration based the new athlete registration.
   * @param multipart an org.springframework.web.multipart.MultipartFile instance.
   * @param athlete an org.manca.racing_circuit_behind.model instance.
   * @return an org.springframework.http.ResponseEntity<org.springframework.core.io.Resource>.
   */
  public boolean uploadRegister(MultipartFile multipart) {
    try {
      Path path = Paths.get(TEMPORARY_PATH + multipart.getOriginalFilename());
      Files.write(path, multipart.getBytes(), StandardOpenOption.CREATE_NEW);
      return true;
    } catch (IOException e) {
        return false;
    }
  }


  /**
   * 
   * Receives Athlete date to be stored in the db and in RawRace instance serialized.
   * @param data the necessary data to register the athlete
   * @return the resource that consists in a file where is serialized the  RawRace instance updated.
   */
  public ResponseEntity<Resource> manageDataForRegister(DataForRegistration data) {
    String headerText = "";

    System.out.println("manageDataForRegister: " + data.getFileName());
    File file = new File(TEMPORARY_PATH + data.getFileName());
    RawRace raw = (RawRace) ss.deserialize(file);
    
    for(int i= 0; i< data.getAthletes().size(); i++) {
      //call method to check if the entity athlete needs persistence operations
      Athlete athlete= persistAthleteIfNeeded(data, i);
      System.out.println("ATHLETE ID:"+athlete.getId());
      RawAthlete rawAthlete = new RawAthlete();
      rawAthlete.setAthleteId(athlete.getId());
      rawAthlete.setCategory(data.getCategories().get(i));
      rawAthlete.setRaceNumber(data.getRaceNumbersAutoAssign().get(i) ? raw.getRaceNumberToAssign() : data.getRaceNumbers().get(i));
      
      //only if athlete is not already registered for that race
      if(raw.getRawAthletes().stream().filter(ath -> ath.getAthleteId() == athlete.getId()).collect(Collectors.toList()).size() == 0) {

        //if the isRaceNumberAutoAssign Data attribute is true...
        if(data.getRaceNumbersAutoAssign().get(i) == true) {    
          //...increment of one the race number to assign.
          raw.setRaceNumberToAssign(raw.getRaceNumberToAssign() + 1);
        }
    
        raw.getRawAthletes().add(rawAthlete);
      } else {
        //update what will be the value of the Data-Registration custom header
        headerText += athlete.getName() + " " + athlete.getSurname() + ",";
      }      
    }
    
    //to remove the the final comma if exists.
    if(!headerText.equals("")) headerText = headerText.substring(0, headerText.length()-1);

    return this.prepareResource(file, raw, data, headerText);

  }

  /**
   * 
   * @param data
   * @param i
   * @return
   */
  private Athlete persistAthleteIfNeeded(DataForRegistration data, int i) {

    if(AthletePersistenceOperation.NO_OP.value.equals(data.getPersistenceOperations().get(i))) {
      return data.getAthletes().get(i);
    }
    
    return athleteRepo.save(data.getAthletes().get(i));
  }


  /**
   * prepare a ResponseEntity for the Resource instance
   * @param file 
   * @param raw
   * @param data
   * @return a response entity with the resource
   */
  private ResponseEntity<Resource> prepareResource(File file, RawRace raw, DataForRegistration data, String dataRegistrationHeader) {
    
    //delete the file
    System.out.println("FILE DELETED:"+file.delete());

    try {
      //create a new file with the new information to attach to the response
      file = ss.serialize(raw, TEMPORARY_PATH + data.getFileName());    
      Path path = file.toPath();
      Resource resource = new UrlResource(path.toUri());
    
      //create the response
      return ResponseEntity.ok()
              .contentType(MediaType.APPLICATION_OCTET_STREAM)
              .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getName() + "\"")
              .header("Data-Registration", "unsuccess for:" + dataRegistrationHeader.trim())
              .header(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, "Data-Registration")
              .body(resource);
    } catch(IOException e) {
      return null;
    }
  }


  public Iterable<Athlete>findAthletesById(List<Long> ids) {
    return athleteRepo.findAllById(ids);
  }



  /**
   * Retrieves and returns the athlete category from a serialized RawRace instance.
   * The RawRace instance is currently serialized in the temporary file 
   * that has the name equal to the value of the <b>filename</b> parameter.
   * The athlete that we need to reach is indicated by its <b>id</b> passed as parameter.
   * @param filename the name of the temporary file that contains the serialized RawRace instance.
   * @param id the unique id of the athlete to reach.
   * @return The athlete category if operation was successful otherwise a special category instance with failure data.
   */
  public Category findCategory(String filename, Long id) {
    Category notFoundCategory = new Category("not_found", -1);
    try {
      File file = new File(TEMPORARY_PATH + filename);
      RawRace rawRace = (RawRace)ss.deserialize(file);
      if(rawRace != null) {
        List<RawAthlete> rawAthletes= rawRace.getRawAthletes();
        RawAthlete athl = rawAthletes.stream().filter(athlete -> athlete.getAthleteId() == id).findFirst().orElse(null);
        if(athl != null)
          return athl.getCategory(); 
      }
      return notFoundCategory;

    } catch (Exception e) {
      return null;
    }
  }

  /**
   * Updates a race configuration changing the category of the target athlete with the one passed as parameter. 
   * @param filename the name of the file in which is serialized the RawRace instance (the race configuration). 
   * @param id the unique ID of the target athlete.
   * @param category the new category of the target athlete.
   * @return boolean true if the operation was successful otherwise false.
   */
  public boolean updateAthleteCategory(String filename, Long id, Category category) {
    try {
      boolean check = false;
      File file = new File(TEMPORARY_PATH + filename);
      RawRace rawRace = (RawRace)ss.deserialize(file);
      if(rawRace != null) {
        var rawAthletes = rawRace.getRawAthletes();
        for(var athlete : rawAthletes) {
          if(athlete.getAthleteId() == id) {
            athlete.setCategory(category);
            check = true;
            break;
          }
        }
        file.delete();
        file = ss.serialize(rawRace, TEMPORARY_PATH + filename);
        return check;
      } else {
        return false;
      }   
    } catch (IOException | ClassCastException e) {
     return false;
    }
  }

}
//END OF CLASS
