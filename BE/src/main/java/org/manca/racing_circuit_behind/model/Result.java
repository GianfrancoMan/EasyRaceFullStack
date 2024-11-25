package org.manca.racing_circuit_behind.model;

public class Result {
  String name;
  Integer raceNumber;
  String team;
  String time;
  String category;
  String federation;
  String type;
  String specialty;
  String date;
  String city;

  public Result() {}

  public Result(
                String name,
                Integer raceNumber,
                String team,
                String time,
                String category,
                String federation,
                String type,
                String specialty,
                String date,
                String city
                ) {
    this.name = name;
    this.raceNumber = raceNumber;
    this.team = team;
    this.time = time;
    this.category = category;
    this.federation = federation;
    this.type = type;
    this.specialty = specialty;
    this.date = date;
    this.city = city;
  }

  
  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public Integer getRaceNumber() {
    return raceNumber;
  }

  public void setRaceNumber(Integer raceNumber) {
    this.raceNumber = raceNumber;
  }

  public String getTeam() {
    return team;
  }

  public void setTeam(String team) {
    this.team = team;
  }

  public String getTime() {
    return time;
  }

  public void setTime(String time) {
    this.time = time;
  }

  public String getCategory() {
    return category;
  }

  public void setCategory(String category) {
    this.category = category;
  }

  public String getFederation() {
    return federation;
  }

  public void setFederation(String federation) {
    this.federation = federation;
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public String getSpecialty() {
    return specialty;
  }

  public void setSpecialty(String specialty) {
    this.specialty = specialty;
  }  

  public String getDate() {
    return date;
  }

  public void setDate(String date) {
    this.date = date;
  }

  public String getCity() {
    return city;
  }

  public void setCity(String city) {
    this.city = city;
  }

  @Override
  public String toString() {
    return "Result [name=" + name + ", raceNumber=" + raceNumber + ", team=" + team + ", time=" + time + ", category="
        + category + ", federation=" + federation + ", type=" + type + ", specialty=" + specialty + ", date=" + date
        + ", city=" + city + "]";
  }

  
}
