package org.manca.racing_circuit_behind.model;

import java.util.Arrays;

/**
 * This is an object that contains details that will be submitted to the client when an athlete across the finish line,
 * like its name, team, category, ranking position and race time. 
 */
public class CrossingData {
  private int raceNumber;
  private Athlete athlete;
  private Category category;
  private Long[] times;
  private String[] textTimes;
  private String responseStatus = "no_valid";
  private Long gap;
  private String textGap;
  private boolean finished;
  private int position;
  private String textOverall;
  

  public int getRaceNumber() {
    return raceNumber;
  }
  public void setRaceNumber(int raceNumber) {
    this.raceNumber = raceNumber;
  }
  public Athlete getAthlete() {
    return athlete;
  }
  public void setAthlete(Athlete athlete) {
    this.athlete = athlete;
  }
  public Category getCategory() {
    return category;
  }
  public void setCategory(Category category) {
    this.category = category;
  }
  public Long[] getTimes() {
    return times;
  }
  public void setTimes(Long[] times) {
    this.times = times;
  }
  public String getResponseStatus() {
    return responseStatus;
  }
  public void setResponseStatus(String responseStatus) {
    this.responseStatus = responseStatus;
  }
  public Long getGap() {
    return gap;
  }
  public void setGap(Long gap) {
    this.gap = gap;
  }
  public boolean isFinished() {
    return finished;
  }
  public void setFinished(boolean finished) {
    this.finished = finished;
  }
  public int getPosition() {
    return position;
  }
  public void setPosition(int position) {
    this.position = position;
  }
  public String getTextGap() {
    return textGap;
  }
  public void setTextGap(String textGap) {
    this.textGap = textGap;
  }
  public String[] getTextTimes() {
    return textTimes;
  }
  public void setTextTimes(String[] textTimes) {
    this.textTimes = textTimes;
  }
  public String getTextOverall() {
    return textOverall;
  }
  public void setTextOverall(String textOverall) {
    this.textOverall = textOverall;
  }
  
  
  @Override
  public String toString() {
    return "CrossingData[" 
      +"\n\traceNumber=" + raceNumber 
      + "\n\tathlete [ name:" + athlete.getName() + ", team:" + athlete.getTeam() 
      + "]\n\tcategory[ name:" + category.getName() + ", lapsTodo:" + category.getLapsToDo() 
      + "]\n\ttimes" + Arrays.toString(times)
      + "\n\tfinished:" + this.finished
      + "\n\tfinished:" + this.position
      + "\n]";
  }

}
