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
import org.manca.racing_circuit_behind.dao.RaceRepo;
import org.manca.racing_circuit_behind.model.Athlete;
import org.manca.racing_circuit_behind.model.Category;
import org.manca.racing_circuit_behind.model.Race;
import org.manca.racing_circuit_behind.model.RaceDataForAthlete;
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
public class RaceService {

  private RaceRepo raceRepo;
  private AthleteRepo athleteRepo;
  private SerializationService ss;
  @Value("${org.manca.temp}")
  private String TEMPORARY_PATH;
  

  @Autowired
  public RaceService(RaceRepo raceRepo, AthleteRepo athleteRepo, SerializationService serializationService) {
    this.raceRepo = raceRepo;
    this.athleteRepo = athleteRepo;
    ss = serializationService;
  }


  /**
   * Get all races from the data source.
   * @return a java.util.List of org.manca.racing_circuit_behind.model.Race instances
   */
  public Iterable<Race> getAllRaces() {
    return raceRepo.findAll();
  }

  /**
   * Get a Race from the Data Source by its unique id
   * @param raceId
   * @return Race org.manca.racing_circuit_behind.model.Race
   */
  public Race raceById(Long raceId) {
    return raceRepo.findById(raceId).orElse(null);
  }


  /**
   * Get the configuration file from the client and store it temporally to next operations
   * @param file the configuration file.
   * @return a boolean true if uploading was successful, false otherwise.
   */
  public boolean storeInTemporaryFolder(MultipartFile file) {
    try  {
      Path path = Paths.get(TEMPORARY_PATH + file.getOriginalFilename());
      Files.write(path, file.getBytes(), StandardOpenOption.CREATE_NEW);
      return true;
    } catch (IOException | ClassCastException e) {
      e.printStackTrace();
      return false;
    }
  }


  /**
   * Retrieves an instance of the Race class from the DataStore using data contained in an instance 
   * of the RawRace class, serialized into the temporary file named with the value passed with the 
   * filename parameter.
   * @param filename the name of the temporary file.
   * @return An object, instance of the org.manca.racing_circuit_behind.model.Race class.
   */
  public Race getDataConfigurationAvailableForChanges(String filename) {
    Race configurationData;
    try {
      Path path = Paths.get(TEMPORARY_PATH + filename); 
      File file = path.toFile();
      RawRace configuration = (RawRace)ss.deserialize(file);      
      file.delete();

      configurationData = raceRepo.findById(configuration.getRaceId()).get();
      if(configurationData != null) {
        return configurationData;

      } else {
        return null;
      }

    } catch (Exception e) {
      e.printStackTrace();
      return null;
    }

  }

  /**
   * Persists the org.manca.racing_circuit_behind.model.Race instance in the Data Source
   * and return to the client the file in which is serialized the RawRace instance,
   * @param race
   * @return org.springframework.http.ResponseEntity<Resource> 
   */
  public ResponseEntity<Resource> createRace(Race race) {
    RawRace rawRace = getRawRaceFromRace(race);  
    Race newRace = raceRepo.save(race);
    String fileName = TEMPORARY_PATH + "race_" + newRace.getTitle() + "_" + newRace.getDate().getYear() + ".srr";

    rawRace.setRaceId(newRace.getId());
    return prepareDownload(rawRace, fileName);
  }


  /**
   * Obtain and return a RawRace instance from tha Race instance passed as parameter
   * @param raceToSerialize a org.manca.racing_circuit_behind.model.Race instance
   * @return org.manca.racing_circuit_behind.model.RawRace instance
   */
  private RawRace getRawRaceFromRace(Race raceToSerialize) {
    RawRace rawRace = new RawRace();

    String[] categoryNames = raceToSerialize.getCategories().split("¢");
    String[] categoryLaps = raceToSerialize.getLaps().split("¢");

    List<Category> categories = new ArrayList<>();
    for(int index = 0; index < categoryNames.length; index ++) {
      categories.add(new Category(categoryNames[index], Integer.parseInt(categoryLaps[index])));      
    }

    rawRace.setCategories(categories);
    
    return rawRace;
  }


  /**
   * Get and delete the file indicated of the parma
   * @param fileName 
   */
  public void deleteFile(String fileName) {
    File f = new File(TEMPORARY_PATH + fileName);
    f.delete();
  }

  
  /**
   * Retrieve data for athlete registration
   * @param file
   * @return An org.manca.racing_circuit_behind.model.RaceDataForAthlete instance
   */
  public RaceDataForAthlete raceDataForAthlete(MultipartFile file) {
    try {
      RaceDataForAthlete raceDataForAthlete = new RaceDataForAthlete();
      File fis;
      Path path = Paths.get(TEMPORARY_PATH + file.getOriginalFilename());
      Files.write(path, file.getBytes(), StandardOpenOption.CREATE_NEW);
      fis = path.toFile();
      RawRace raw = (RawRace) ss.deserialize(fis);
      fis.delete();

      List<RawAthlete> athletesWithCustomizedRaceNumber = 
        raw.getRawAthletes()
          .stream()
            .filter( athl -> athl.getRaceNumber() > 0 && athl.getRaceNumber()<100)
              .collect(Collectors.toList());
      List<Integer> customizedRaceNumbers = new ArrayList<Integer>();
      if(athletesWithCustomizedRaceNumber.size() > 0) {
        for( var a : athletesWithCustomizedRaceNumber) {
          customizedRaceNumbers.add(a.getRaceNumber());
        }
      }

      raceDataForAthlete.setCustomizedNumberAssigned(customizedRaceNumbers);
      raceDataForAthlete.setStatus(raw.isPerformed());
      raceDataForAthlete.setCategories(raw.getCategories());
      raceDataForAthlete.setRaceNumber(raw.getRaceNumberToAssign());
      Race race = raceRepo.findById(raw.getRaceId()).orElse(null);
      if(race != null)
        raceDataForAthlete.setRaceTitle(race.getTitle());
      return raceDataForAthlete;
    } catch (IOException e) {
        e.printStackTrace();
        return null;
    }
  }


  /**
   * The passed as parameter contains the a serialized race configuration, managing this configuration
   * returns the list of the athletes registered to this race. 
   * @param file the configuration file
   * @return a java.util.List of org.manca.racing_circuit_behind.model.RawAthlete instances. 
   */
  public List<Athlete> raceAthletes(MultipartFile file) {
    try {
      var athletes = new ArrayList<Athlete>();
      File fis;
      Path path = Paths.get(TEMPORARY_PATH + file.getOriginalFilename());
      Files.write(path, file.getBytes(), StandardOpenOption.CREATE_NEW);
      fis = path.toFile();
      RawRace raw = (RawRace) ss.deserialize(fis);
      if(raw != null) {
        var rwAthletes = raw.getRawAthletes();
        for(RawAthlete ra : rwAthletes ) {
          athletes.add(athleteRepo.findById(ra.getAthleteId()).orElse(null));
        }
      }
      return athletes;
    } catch (IOException e) {
        e.printStackTrace();
        return null;
    }
  }



  /**
   * Assuming that a race configuration file exists in the temp directory,
   * this method uses this file to get a the Race configuration (a RawRace instance).
   * and looking for the athlete registered to the race by its id, when finds it, remove it
   * from the registered athletes list.
   * @param athleteId the id of the athlete to remove.
   * @param fileName the name of the configuration file
   * @return a org.springframework.http.ResponseEntity<Resource> instance
   */
  public  ResponseEntity<Resource> removeAthlete(Long athleteId, String fileName) {
    try {      
      File file = new File(TEMPORARY_PATH + fileName);
      RawRace rr = (RawRace)ss.deserialize(file);
      file.delete();
      List<RawAthlete> athletes = rr.getRawAthletes();
      int pos = -1;
      for(int idx=0; idx<athletes.size(); idx++ ) {
        if(athletes.get(idx).getAthleteId() == athleteId) {
          pos = idx;
          idx = athletes.size(); 
        }
      }
      if(pos != -1) {
        athletes.remove(pos);
      }
      ResponseEntity<Resource> response = prepareDownload(rr, (TEMPORARY_PATH + fileName));
      return response;
    } catch (ClassCastException e) {
      e.printStackTrace();
      return null;
    }
  }



  /**
   * Retrieves the instance of a RawRace class, serialized in the temporary file 
   * with name equal to the value of the <strong>filename</strong> param.
   * Later part of the Race data passed as parameter will be stored in the data store and part
   * will be serialized in a new file configuration that wil be returned to the client.
   * @param race  A Race instance with changes made by the client user.
   * @param filename Name of the temporary file containing the original serialized RawRace instance.
   * @return An instance of ResponseEntity<Resource>, basically a file that contains the modified RawRace instance. 
   */
  public ResponseEntity<Resource> serveUpdateConfiguration(Race race, String filename) {
    try {
      File f = new File(TEMPORARY_PATH + filename);
      RawRace rawRace = (RawRace)ss.deserialize(f);
      if(rawRace != null) {
        if(race.getCategories() != null && race.getCategories() != "") {
          var stringCategories  = race.getCategories();
          var stringLaps = race.getLaps();

          if(!stringCategories.substring(stringCategories.length() - 1).equals("¢")) 
            stringCategories = stringCategories.substring(0, (stringCategories.length()-1));

          if(!stringLaps.substring(stringLaps.length() - 1).equals("¢")) 
            stringLaps = stringLaps.substring(0, (stringLaps.length()-1));
            
          var categoriesArray = stringCategories.split("¢");
          var lapsArray = stringLaps.split("¢");

          var idx = 0;
          for(var categoryName : categoriesArray) {
            Category category = new Category(categoryName, Integer.parseInt(lapsArray[idx]));
            if(rawRace.getCategories().stream().filter(c -> c.getName().trim().equalsIgnoreCase(categoryName.trim())).findFirst().orElse(null) == null )
              rawRace.getCategories().add(category);
              
            ++idx;
          }
            
        }
        if(raceRepo.save(race) != null) {
          f.delete();
          return prepareDownload(rawRace, TEMPORARY_PATH + filename);
        }
        else
          return null;

      }
      return null;  

    } catch (ClassCastException e) {
      e.printStackTrace();
      return null;

    }
  }


  /**
   * Retrieves and return the categories from the race configuration currently serialized ia a temporary file. 
   * @param filename the name of the temporary file.
   * @return a java.util.List of org.manca.racing_circuit_behind.model.Category instances.
   */
  public List<Category> getCategories(String filename) {
    List<Category> categories = new ArrayList<>();
    try {
      File f = new File(TEMPORARY_PATH + filename);
      RawRace rawRace = (RawRace)ss.deserialize(f);
      f.delete();
      categories =  rawRace.getCategories();
      return categories;
      
    } catch (Exception e) {
      e.printStackTrace();
      if(categories.size() <= 0) {
        categories.add(new Category("ERROR", 0));
      }
      return categories;
    }
  }



  public Category changeCategoryName(String filename, String oldName, String newName) {
    try {
      Path path = Paths.get(TEMPORARY_PATH + filename); 
      File f = path.toFile();
      RawRace rawRace = (RawRace)ss.deserialize(f);
      f.delete();      
      
      List<Category> categories= rawRace.getCategories();
      Category category = new Category();
      for(var targetCategory : categories) {
        if(targetCategory.getName().equalsIgnoreCase(oldName.trim())) {
          targetCategory.setName(newName);
          category = targetCategory;
          break;
        }
      }
      for(var athlete : rawRace.getRawAthletes()) {
        if(athlete.getCategory().getName().equals(oldName))
          athlete.setCategory(new Category(newName, athlete.getCategory().getLapsToDo()));
      }
      f = ss.serialize(rawRace, TEMPORARY_PATH + filename);
      return category;
    } catch (IOException | ClassCastException e) {
      e.printStackTrace();
      return null;
    }
  }



  /**
   * Returns a file that contain a serialized race configuration
   * @param filename the name of the file
   * @return a file that contains a serialized race configuration defined in a org.manca.racing_circuit_behind.model.RawRace instance.
   */
  public ResponseEntity<Resource> downloadConfiguration(String filename) {
    try {
        Path path = Paths.get(TEMPORARY_PATH + filename);
        Resource resource  = new UrlResource(path.toUri());
        return ResponseEntity.ok()
          .contentType(MediaType.APPLICATION_OCTET_STREAM)
          .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
          .body(resource);
    } catch (IOException e) {
      e.printStackTrace();
      return null;
    }
  }


  /**
   * Checks if the uploaded configuration is marked as performed or not
   * @param file a MultiPart instance that contains the file with data of the race configuration.
   * @return boolean true if the race configuration ahs been marked as performed, otherwise false. 
   */
  public Boolean checkForPerformed(MultipartFile file) {
    try {
      File fis;
      Path path = Paths.get(TEMPORARY_PATH + file.getOriginalFilename());
      Files.write(path, file.getBytes(), StandardOpenOption.CREATE_NEW);
      fis = path.toFile();
      RawRace rawRace = (RawRace) ss.deserialize(fis);

      fis.delete();

      if(rawRace.isPerformed() == true)
        return true;
      else
        return false;

    } catch (IOException | ClassCastException e) {
      e.printStackTrace();
      return null;
    }
  }


  /**
   * Serialized a RawRace instance in a file that will be returned as file configuration of the race.
   * @param rawRace the Object to serialize.
   * @param filename The name of the file
   * @return a org.springframework.http.ResponseEntity<Resource> instance.
   */
  private ResponseEntity<Resource> prepareDownload(RawRace rawRace, String filename) {
    
    try {
      File file = ss.serialize(rawRace, filename);

      // Create a resource for the file
      Path path = file.toPath();
      Resource resource = new UrlResource(path.toUri());

      // Set the content type and attachment header
      return ResponseEntity.ok()
              .contentType(MediaType.APPLICATION_OCTET_STREAM)
              .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
              .body(resource);

    } catch (IOException e) {
      e.printStackTrace();
      return null;
    }
  }

}