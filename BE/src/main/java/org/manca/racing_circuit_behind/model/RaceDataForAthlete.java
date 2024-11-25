package org.manca.racing_circuit_behind.model;

import java.util.ArrayList;
import java.util.List;

public class RaceDataForAthlete {

  private boolean status;
  private List<Category> categories;
  private Integer raceNumber;
  private String raceTitle;
  private List<Integer> customizedNumberAssigned;

  public List<Category> getCategories() {
    return categories;
  }
  public void setCategories(List<Category> categories) {
    this.categories = categories;
  }
  public Integer getRaceNumber() {
    return raceNumber;
  }
  public void setRaceNumber(Integer raceNumber) {
    this.raceNumber = raceNumber;
  }
  public boolean isStatus() {
    return status;
  }
  public void setStatus(boolean status) {
    this.status = status;
  }
  public String getRaceTitle() {
    return raceTitle;
  }
  public void setRaceTitle(String raceTitle) {
    this.raceTitle = raceTitle;
  }
  public List<Integer> getCustomizedNumberAssigned() {
    return customizedNumberAssigned;
  }
  public void setCustomizedNumberAssigned(List<Integer> customizedNumberAssigned) {
    this.customizedNumberAssigned = customizedNumberAssigned;
  }
  

}
