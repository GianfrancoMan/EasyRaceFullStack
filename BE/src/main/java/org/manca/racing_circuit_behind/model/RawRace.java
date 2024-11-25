package org.manca.racing_circuit_behind.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;


public class RawRace implements Serializable {
  private static final long serialVersionUID = 42378289874L;
  private long raceId;
  private boolean performed = false;
  private int raceNumberToAssign = 100;
  private List<Category> categories;  
  private List<RawAthlete> rawAthletes;


//Constructors//
  public RawRace() {
    this.categories = new ArrayList<>();
    this.rawAthletes = new ArrayList<>();
  }


  public RawRace(Long raceId, List<RawAthlete> rawAthletes) {
    this.raceId = raceId;
    this.rawAthletes = rawAthletes; 
  }

    
  //Getters & Setters//
  public long getRaceId() {
    return raceId;
  }

  public void setRaceId(long raceId) {
    this.raceId = raceId;
  }

  public List<RawAthlete> getRawAthletes() {
    return rawAthletes;
  }

  public void setRawAthletes(List<RawAthlete> rawAthletes) {
    this.rawAthletes = rawAthletes;
  }

  public List<Category> getCategories() {
    return categories;
  }

  public void setCategories(List<Category> categories) {
    this.categories = categories;
  }

  public int getRaceNumberToAssign() {
    return raceNumberToAssign;
  }

  public void setRaceNumberToAssign(int raceNumberToAssign) {
    this.raceNumberToAssign = raceNumberToAssign;
  }

  public boolean isPerformed() {
    return performed;
  }

  public void setPerformed(boolean performed) {
    this.performed = performed;
  }
  
  
  @Override
  public String toString() {
    return "[\n" + "raceId=" + raceId + "\n" + "performed=" + performed + "\n" + ", raceNumberToAssign=" + "\n" + raceNumberToAssign + "\n" + ", categories=" + categories
        + "\n" + ", rawAthletes=" + rawAthletes + "\n]";
  }

}
