package org.manca.racing_circuit_behind.service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.manca.racing_circuit_behind.dao.AthleteRepo;
import org.manca.racing_circuit_behind.dao.RaceRepo;
import org.manca.racing_circuit_behind.model.Athlete;
import org.manca.racing_circuit_behind.model.Category;
import org.manca.racing_circuit_behind.model.CrossingData;
import org.manca.racing_circuit_behind.model.Race;
import org.manca.racing_circuit_behind.model.RawAthlete;
import org.manca.racing_circuit_behind.model.RawRace;
import org.manca.racing_circuit_behind.model.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletResponse;

@Service
public class OfficerService {

  private SerializationService ss;
  private AthleteRepo athleteRepo;
  private RaceRepo raceRepo;
  private RawRace rawRace;
  private String sessionId;

  @Value("${org.manca.temp}")
  private String TEMPORARY_PATH;

  @Autowired
  public OfficerService(RawRace rawRace, SerializationService ss, AthleteRepo athleteRepo, RaceRepo raceRepo) {
    this.ss = ss;
    this.athleteRepo = athleteRepo;
    this.raceRepo = raceRepo;
    this.rawRace = rawRace;
  }

  public ResponseEntity<List<Category>> getRawRaceForOfficer(MultipartFile multipart, String sessionId) {
    this.sessionId = sessionId;
    System.out.println(sessionId);
    try {
      Path path = Paths.get(TEMPORARY_PATH + multipart.getOriginalFilename());
      System.out.println(path);
      Files.write(path, multipart.getBytes());
      File file = path.toFile();      
      System.out.println(file.getName() + ":" + file.exists());
      RawRace raw = (RawRace)ss.deserialize(file);
      System.out.println(raw);

      file.delete();
      
      return this.set(raw);

    } catch (IOException e) {

        return retrievesEmpty();
    }
  }

  private ResponseEntity<List<Category>> set(RawRace rawRace) {
    this.setDefault();
    try {
      this.rawRace.setPerformed(true);
      this.rawRace.setRaceId(rawRace.getRaceId());
      this.rawRace.setRaceNumberToAssign(rawRace.getRaceNumberToAssign());
      rawRace.getCategories().forEach(rc -> this.rawRace.getCategories().add(rc));
      rawRace.getRawAthletes().forEach(ra -> this.rawRace.getRawAthletes().add(ra));
    } catch (Exception e) {
      e.printStackTrace();
      return retrievesEmpty();
    }

    //start... here code to get only the categories that have at least one athlete registered with those categories.
    List<Category> categoriesInCompetition = new ArrayList<Category>();
    var categories = rawRace.getCategories();
    var athletesInCompetition = rawRace.getRawAthletes();
    for(var c : categories) {
      for( var a : athletesInCompetition) {
        if((a.getCategory().getName().trim()).equalsIgnoreCase(c.getName().trim())) {
          categoriesInCompetition.add(c);
          break;
        }
      }
    }//end

    return ResponseEntity.
      ok()
      .header("Set-Cookie", "JSESSIONID="+this.sessionId, "Path=/", "Secure", "HttpOnly")
      .header("Access-Control-Allow-Credentials", "true")
      .body(categoriesInCompetition);
  }


  /**
   * Setup start time for athletes who are part of one of the categories received from the client
   * @param categories
   * @return The number of athletes who started running the race
   */
  public int setStartTimes(String stringCategories, HttpServletResponse response) {
    try {
      response.addHeader("Set-Cookie", "JSESSIONID="+this.sessionId + ";Path=/"+";Secure"+";HttpOnly");
      response.addHeader("Access-Control-Allow-Credentials", "true");
      var categories = stringCategories.split("¢");
      for(String name: categories)System.out.println(name);
      System.out.println(this.rawRace.getRawAthletes());

      long startTime = ZonedDateTime.of(LocalDateTime.now(), ZoneId.systemDefault()).toInstant().toEpochMilli();
      int startedAthlete = 0;
      for(String name:categories) {
         for(RawAthlete athlete:this.rawRace.getRawAthletes()) {
          System.out.println(athlete.getCategory().getName().trim().toUpperCase());
          if(athlete.getCategory().getName().equals(name)) {
            athlete.setStartTime(startTime);
            System.out.println("id:" + athlete.getAthleteId() + ", startTime:" + athlete.getStartTime());
            startedAthlete ++;
          }
         }
      }
      return startedAthlete;
    } catch (Exception e) {
      e.printStackTrace();
      return 0;
    }
  }

  /**
   *Based on the race number, it retrieves the athlete who crossed the finish line, sets the lap time and calculates the athlete's ranking position, 
   *collects and returns this information.
   * @param raceNumber
   * @return org.manca.racing_circuit_behind.modelCrossingData instance
   */
  public CrossingData manageCrossingFinishLine(Integer raceNumber, HttpServletResponse response) {
    try {
      response.addHeader("Set-Cookie", "JSESSIONID="+this.sessionId + ";Path=/"+";Secure"+";HttpOnly");
      response.addHeader("Access-Control-Allow-Credentials", "true");
      RawAthlete rwAthlete = this.rawRace.getRawAthletes().stream()
        .filter( rawAthlete -> rawAthlete.getRaceNumber() == raceNumber)
          .findFirst().orElse(null);
    
      if(rwAthlete != null && rwAthlete.getStartTime()!= 0L) {

        if(!(rwAthlete.getPerformedLaps() == rwAthlete.getCategory().getLapsToDo())) {
        
          Athlete athlete = athleteRepo.findById(rwAthlete.getAthleteId()).orElse(null);
          if(athlete != null) {
            for(int i = 0; i < rwAthlete.getRaceTimes().length; ++i) {
              if(rwAthlete.getRaceTimes()[i] == 0L ) {
                rwAthlete.getRaceTimes()[i] = ZonedDateTime.of(LocalDateTime.now(), ZoneId.systemDefault()).toInstant().toEpochMilli() - rwAthlete.getStartTime();
                rwAthlete.setCurrentTime(rwAthlete.getRaceTimes()[i]);
                rwAthlete.setPerformedLaps(rwAthlete.getPerformedLaps() + 1);
                i = rwAthlete.getRaceTimes().length;
              }
            }           
            System.out.println(rwAthlete);
          }
  
          return this.setCrossingData(rwAthlete, false);

        } else {

          var crossingData = new CrossingData();
          crossingData.setResponseStatus("valid_finished");
          crossingData.setFinished(true);
          crossingData.setRaceNumber(raceNumber);
          System.out.println("the athlete has finished");
          return crossingData;
        }
      }

      var noValidCrossingData = new CrossingData();
      noValidCrossingData.setRaceNumber(raceNumber);
      return noValidCrossingData;
      
    } catch (Exception e) {
      e.printStackTrace();
      var noValidCrossingData = new CrossingData();
      noValidCrossingData.setRaceNumber(raceNumber);
      return noValidCrossingData;
    }
  }

  
  /**
   * Return the category's ranking passed as parameter.
   * @param categoryName java.util.String: the name of the category for which the ranking is request
   * @param response jakarta.servlet.http.HttpServletResponse: this doesn't come by client directly but we get it by the servlet that manage the response in the context
   * I use it to add some headers for to allow the session scope.
   * @return a java.util.List of org.manca.racing_circuit_behind.model.CrossingData instances
   */
  public List<CrossingData> categoryRanking(String categoryName, HttpServletResponse response) {
    response.addHeader("Set-Cookie", "JSESSIONID="+this.sessionId + ";Path=/"+";Secure"+";HttpOnly");
    response.addHeader("Access-Control-Allow-Credentials", "true");

    var ranking = new ArrayList<CrossingData>();
    List<RawAthlete> rwAthletes = this.getCategoryRanking(categoryName);
    for(RawAthlete rwa : rwAthletes ) {
      ranking.add(this.setCrossingData(rwa, false));
    }
    
    return ranking;
  }


    
  /**
   * Return the general ranking.
   * @param response jakarta.servlet.http.HttpServletResponse: this doesn't come by client directly but we get it by the servlet that manage the response in the context
   * I use it to add some headers for to allow the session scope.
   * @return a java.util.List of org.manca.racing_circuit_behind.model.CrossingData instances
   */
  public List<CrossingData> ranking(HttpServletResponse response) {
    response.addHeader("Set-Cookie", "JSESSIONID="+this.sessionId + ";Path=/"+";Secure"+";HttpOnly");
    response.addHeader("Access-Control-Allow-Credentials", "true");
    
    List<RawAthlete> rawAthletesCopy = new ArrayList<>();
    rawAthletesCopy = this.rawRace.getRawAthletes().stream().collect(Collectors.toList());
    rawAthletesCopy = this.getRanking(rawAthletesCopy);

    var ranking = new ArrayList<CrossingData>();
    for(RawAthlete rw : rawAthletesCopy ) {
      ranking.add(this.setCrossingData(rw, true));
    }
    
    return ranking;
  }


  /**
   * Collect all athletes that are part of the category passed by <b>categoryName</b> and return the ranking for this category
   * @param categoryName
   * @return The ranking of a specific category
   */
  private List<RawAthlete> getCategoryRanking(String categoryName) {
    try {
      List<RawAthlete> athletesByCategory = this.rawRace.getRawAthletes()
                                            .stream()
                                              .filter(r -> r.getCategory().getName().equals(categoryName))
                                                .collect(Collectors.toList());
  
      this.getRanking(athletesByCategory);
      
      return athletesByCategory;
    } catch (Exception e) {
      e.printStackTrace();
      return null;
    }
  }

  /**
   * Sorts the list of RawAthlete instances by the value of laps performed by the athlete if they are not equal, 
   * otherwise by the time of laps performed by the athlete. 
   * Basically this method calculates the ranking for the passed list
   * @param listToOrder the list to order
   */
  private List<RawAthlete> getRanking(List<RawAthlete> listToOrder){
    if(listToOrder.size() == 1) return listToOrder;  
    Collections.sort(listToOrder, new Comparator<RawAthlete>() {

      public int compare(RawAthlete ra1, RawAthlete ra2) {
        if(ra1.getPerformedLaps() != ra2.getPerformedLaps()) 
          return Integer.valueOf(ra1.getPerformedLaps()).compareTo(Integer.valueOf(ra2.getPerformedLaps())) * (-1);        
        else
          return Long.valueOf(ra1.getCurrentTime()).compareTo(Long.valueOf(ra2.getCurrentTime()));
      }

    });
    for(RawAthlete a : listToOrder) System.out.println("number:" + a.getRaceNumber() + ", time:" + a.getCurrentTime());
    return listToOrder;
  }


  /**
   * Calculates the gap between the athlete passed as parameter and first Athlete of the category ranking
   * @return a Long that is the gap-time in milliseconds.
   */
  private Long computeGap(RawAthlete ra) {;
    var ranking = getCategoryRanking(ra.getCategory().getName());
    return this.getGap(ranking, ra);
  }

  
  /**
   * Returns the gap between the athlete passed as parameter and first Athlete of the category ranking
   * @return a Long that is the gap-time in milliseconds.
   */
  private Long computeGapForGeneral(RawAthlete ra) {
    var ranking = getRanking(this.rawRace.getRawAthletes());
    return this.getGap(ranking, ra);
  }

  /**
   * Based on the ranking and the athlete passed as parameter calculates the gap between the athlete and the first athlete of the ranking. 
   * @param ranking a java.util.List instance of org.manca.racing_circuit_behind.model.CrossingData instances.
   * @param ra an org.manca.racing_circuit_behind.model.RawAthlete instance (the athlete)
   * @return a Long that is the gap-time in milliseconds.
   */
  private Long getGap(List<RawAthlete> ranking, RawAthlete ra) {
    Long gap = 0L;
    var first = ranking.get(0);
    if((first.getAthleteId() != ra.getAthleteId())) {
      if(first.getPerformedLaps() != ra.getPerformedLaps()) {
        return Long.valueOf(ra.getPerformedLaps() - first.getPerformedLaps()); 
      }
      gap = ra.getCurrentTime() - ranking.get(0).getCurrentTime();
    }

    return gap;
  }


  private Long[] getLapsTimes(RawAthlete ra) {
    var size = 0;
    for(long n : ra.getRaceTimes()) if(n != 0L) size ++; else break;
    Long[] lapsTimes = new Long[size];
    if(lapsTimes.length != 0) {
      for(int i=0; i<ra.getRaceTimes().length; i++) {
        if(ra.getRaceTimes()[i] != 0L) {
          lapsTimes[i] = ra.getRaceTimes()[i];
        }
      }
    }
    if(lapsTimes.length > 1) {
      var effectiveTimes = new Long[lapsTimes.length];
      for(int idx = lapsTimes.length-1; idx > 0; idx--) {
        effectiveTimes[idx] = lapsTimes[idx]-lapsTimes[idx-1];
      }
      effectiveTimes[0] = lapsTimes[0];
      
      return effectiveTimes;
    } 

    return lapsTimes;
  }

  public String[] getTextTimes(Long [] lapsTimes) {
    String[] textTimes = new String[lapsTimes.length];
    for(int i = 0; i < lapsTimes.length; i ++) {
      textTimes[i] = this.formatTimes(lapsTimes[i]);
    } 
    return textTimes;
  }

  public int getPosition(RawAthlete athlete) {
    return this.getCategoryRanking(athlete.getCategory().getName()).indexOf(athlete) + 1;
  }

  private ResponseEntity<List<Category>> retrievesEmpty() {
    List<Category> empty = new ArrayList<>();
    return ResponseEntity.status(HttpStatusCode.valueOf(205)).body(empty);
  }

  private String formatTimes(Long time) {
    if(time > 0L) {
      double hoursDiscriminating = 3600000d;
      double minutesDiscriminating = 60000d;
      double secondsDiscriminating = 1000d;
      double milliseconds = time;
      double h = Math.floor(milliseconds/hoursDiscriminating);
      milliseconds = milliseconds - (h*hoursDiscriminating);
      double m = Math.floor(milliseconds/minutesDiscriminating);
      milliseconds = milliseconds - (m*minutesDiscriminating);
      double s = Math.floor(milliseconds/secondsDiscriminating);
      milliseconds = milliseconds - (s*secondsDiscriminating);
      var hStr = Integer.toString((int)h);
      var mStr = Integer.toString((int)m);
      var sStr = Integer.toString((int)s);
      var milliStr = Integer.toString((int)milliseconds);
      if(milliStr.length() > 3) milliStr = milliStr.substring(0, 3);
      if(milliStr.length() == 2) milliStr = "0" + milliStr;
      if(milliStr.length() == 1) milliStr = "00" + milliStr;
      return " " + ((hStr.length() < 2) ? "0" + hStr : hStr) + " : "
                 + ((mStr.length() < 2) ? "0" + mStr : mStr) + "' : "
                 + ((sStr.length() < 2) ? "0" + sStr : sStr) + "'' : "
                 + milliStr + "ms";
    }

    return " 00 : 00 : 00 : 000ms";
  }


  private CrossingData setCrossingData(RawAthlete rwAthlete, boolean general) {          
    var gap = general ? this.computeGapForGeneral(rwAthlete) : this.computeGap(rwAthlete);
    var lapsTimes = this.getLapsTimes(rwAthlete);
    var position = this.getPosition(rwAthlete);
    var crossingData = new CrossingData();
    crossingData.setRaceNumber(rwAthlete.getRaceNumber());
    crossingData.setAthlete(athleteRepo.findById(rwAthlete.getAthleteId()).orElse(null));
    crossingData.setCategory(rwAthlete.getCategory());
    crossingData.setTimes(lapsTimes);
    crossingData.setTextTimes(this.getTextTimes(lapsTimes));
    crossingData.setGap(gap);
    crossingData.setTextGap(gap < 0L ? gap + " Lap(s)" : formatTimes(gap));
    crossingData.setResponseStatus("valid");
    crossingData.setFinished(rwAthlete.getPerformedLaps() == rwAthlete.getCategory().getLapsToDo() );
    crossingData.setPosition(position);
    Long overall = 0L;
    for(Long time : lapsTimes) overall += time;
    crossingData.setTextOverall(this.formatTimes(overall));
    return crossingData;
  }


  /**
   * Marks as performed the race configuration stored in the configuration file 
   * @param filename the name of the file that contains the race configuration
   * @return a file with the configuration marked as performed.
   */
  public ResponseEntity<Resource> markAsPerformed(String filename) {
    RawRace serializableRawRace = new RawRace();
    serializableRawRace.setPerformed(true);
    serializableRawRace.setRaceId(this.rawRace.getRaceId());
    serializableRawRace.setRaceNumberToAssign(this.rawRace.getRaceNumberToAssign());
    for(var rawAthlete : this.rawRace.getRawAthletes()) 
      serializableRawRace.getRawAthletes().add(rawAthlete);
    for(var category : this.rawRace.getCategories())
      serializableRawRace.getCategories().add(category);
    try {
      ss.serialize(serializableRawRace, TEMPORARY_PATH + filename); 
      Path path = Paths.get(TEMPORARY_PATH + filename);
      Resource resource  = new UrlResource(path.toUri());
      ResponseEntity<Resource> response =  ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_OCTET_STREAM)
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
        .header("Set-Cookie", "JSESSIONID="+this.sessionId + ";Path=/"+";Secure"+";HttpOnly")
        .header("Access-Control-Allow-Credentials", "true")
        .body(resource);

        return response;    
    } catch (IOException e) {
      return null;
    }
  }


/**
 * Construct a java.util.List of org.manca.racing_circuit_behind.model.Result manipulating data that come from both race configuration and persistent data store 
 * @param filename String the name of the temporary file that contains data about race configuration.
 * @param rankingName ia a string that can be the name of a race category  or 'OVERALL' for overall ranking.
 * @return
 */
  public List<Result> raceResults(String filename, String rankingName) {
    List<RawAthlete> ranking = new ArrayList<>();
    setDefault();
    try {
      File file = new File(TEMPORARY_PATH + filename);
      RawRace rr = (RawRace) ss.deserialize(file);
      file.delete();
      
      this.rawRace.setRaceId(rr.getRaceId());
      this.rawRace.setRaceNumberToAssign(rr.getRaceNumberToAssign());
      this.rawRace.setPerformed(rr.isPerformed());
      rr.getCategories().forEach(rc -> this.rawRace.getCategories().add(rc));
      rr.getRawAthletes().forEach(ra -> this.rawRace.getRawAthletes().add(ra));

      if(rankingName.equals("OVERALL")) {
        ranking = this.getRanking(this.rawRace.getRawAthletes());

      } else {
        ranking = this.getCategoryRanking(rankingName);
      }

      Race race = raceRepo.findById(this.rawRace.getRaceId()).orElse(null);

      List<Result> results = new ArrayList<>();
      for(var a : ranking) {
        Athlete athlete = athleteRepo.findById(a.getAthleteId()).orElse(null);
        System.out.println(athlete);
        if( (athlete != null) && (race != null) ) {
          List<Long> times = new ArrayList<>();
          for(var t : a.getRaceTimes()) times.add(t);
          String time = times.size() == 1 ? this.formatTimes(times.get(0)) : this.formatTimes(times.get(times.size()-1));
          String name = (athlete.getName() + " " + athlete.getSurname());
          name = (name != null) && (name != "") ? name : "Unknown Name";
          String team = athlete.getTeam();
          team = (team != null) && (team != "") ? team : "Unknown Team";
          String federation = race.getFederation();
          federation = (federation != null) && (federation != "") ? federation : "Unknown federation";
          String type = race.getType();
          type = (type != null) && (type != "") ? type : "Unknown type";
          String specialty = race.getSpecialty();
          specialty = (specialty != null) && (specialty != "") ? specialty : "Unknown specialty";          
          String date = race.getDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
          results.add(
            new Result(name, a.getRaceNumber(), team, time, a.getCategory().getName(), federation, type, specialty, date, race.getCity())
          );
        }
      }
      for(var r:results) System.out.println(r);
      return results;

    } catch (ClassCastException e) {
      return null;
    }
  }



  /**
   * setup the default values for session scoped RawRace
   */
  private void setDefault() {
    this.rawRace.setCategories(new ArrayList<Category>());
    this.rawRace.setPerformed(false);
    this.rawRace.setRaceId(0L);
    this.rawRace.setRaceNumberToAssign(100);
    this.rawRace.setRawAthletes(new ArrayList<RawAthlete>());
  }


}
