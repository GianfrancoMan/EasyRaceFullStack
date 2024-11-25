package org.manca.racing_circuit_behind.model;

import java.util.List;

public class DataForRegistration {
  private List<String> persistenceOperations;
  private List<Athlete> athletes;
  private List<Category> categories;
  private List<Integer> raceNumbers;
  private String fileName;
  private List<Boolean> raceNumbersAutoAssign;


  public List<String> getPersistenceOperations() {
    return persistenceOperations;
  }
  public void setPersistenceOperations(List<String> persistenceOperations) {
    this.persistenceOperations = persistenceOperations;
  }
  public List<Athlete> getAthletes() {
    return athletes;
  }
  public void setAthletes(List<Athlete> athletes) {
    this.athletes = athletes;
  }
  public List<Category> getCategories() {
    return categories;
  }
  public void setCategories(List<Category> categories) {
    this.categories = categories;
  }
  public List<Integer> getRaceNumbers() {
    return raceNumbers;
  }
  public void setRaceNumbers(List<Integer> raceNumbers) {
    this.raceNumbers = raceNumbers;
  }
  public String getFileName() {
    return fileName;
  }
  public void setFileName(String fileName) {
    this.fileName = fileName;
  }
  public List<Boolean> getRaceNumbersAutoAssign() {
    return raceNumbersAutoAssign;
  }
  public void setRaceNumbersAutoAssign(List<Boolean> raceNumbersAutoAssign) {
    this.raceNumbersAutoAssign = raceNumbersAutoAssign;
  }
  
  @Override
  public String toString() {
    
    String str = "DataForRegistration\n\t";
    for(int i=0; i<athletes.size(); i++ ) {
      str += "name:" + athletes.get(i).getName()
              + " surname:" + athletes.get(i).getSurname()
              + " cityOfBird:" + athletes.get(i).getCityOfBirth()
              + " birthday:" + athletes.get(i).getBirthday().getDayOfMonth() + "/" + athletes.get(i).getBirthday().getMonthValue() + "/" + athletes.get(i).getBirthday().getYear()
              + " team:" + athletes.get(i).getTeam()
              + " persistenceOperation:" + persistenceOperations.get(i)
              + " category:" + categories.get(i).getName()
              + " lapsTodo:" + categories.get(i).getLapsToDo()
              + " raceNumber" + raceNumbers.get(i)
              + " raceNumbersAutoAssign:" + raceNumbersAutoAssign.get(i)
              + "\n";
    }
    str += fileName;
    return str;
  }
  

  
}
