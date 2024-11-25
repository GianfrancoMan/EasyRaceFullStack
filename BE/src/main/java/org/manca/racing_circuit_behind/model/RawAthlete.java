package org.manca.racing_circuit_behind.model;

import java.io.Serializable;

public class RawAthlete implements Serializable {
  private static final long serialVersionUID = 42378189874L;
  long athleteId;
  Category category;
  long startTime;
  long raceTimes[];
  long currentTime;
  int performedLaps;
  int raceNumber;

  

  public long getAthleteId() {
    return athleteId;
  }
  public void setAthleteId(long athleteId) {
    this.athleteId = athleteId;
  }
  public Category getCategory() {
    return category;
  }
  public void setCategory(Category category) {
    this.category = category;
    raceTimes = new long[category.getLapsToDo()]; 
    for(int i=0; i<raceTimes.length;++i) raceTimes[i] = 0L;
  }
  public long getStartTime() {
    return startTime; 
  }
  public void setStartTime(long startTime) {
    this.startTime = startTime;
  }
  public long[] getRaceTimes() {
    return raceTimes;
  }
  public void setRaceTimes(long[] raceTimes) {
    this.raceTimes = raceTimes;
  }
  public int getRaceNumber() {
    return raceNumber;
  }
  public void setRaceNumber(int raceNumber) {
    this.raceNumber = raceNumber;
  }
  public long getCurrentTime() {
    return currentTime;
  }
  public void setCurrentTime(long currentTime) {
    this.currentTime = currentTime;
  }
  public int getPerformedLaps() {
    return performedLaps;
  }
  public void setPerformedLaps(int performedLap) {
    this.performedLaps = performedLap;
  }
  
  @Override
  public String toString() {
    return
      "athleteId:" + athleteId +"\n" +
      "category name:" + category.getName() + ", lapsToDo:" + category.getLapsToDo() + "\n" +
      "startTime" + startTime +"\n" +
      "raceTimes:" +"\n" +
      "raceNumber:" + raceNumber + "\n" +
      "currentTime:" + currentTime + "\n" +
      "performedLaps:" + performedLaps + "\n";
  }

}
