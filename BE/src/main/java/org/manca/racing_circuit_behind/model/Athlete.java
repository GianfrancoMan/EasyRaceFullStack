package org.manca.racing_circuit_behind.model;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "athletes")
public class Athlete {
  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private Long id;
  private String name;
  private String surname;
  private LocalDate birthday;
  private String cityOfBirth;
  private String team;


  //Constructors//
  public Athlete() {
  }

  public Athlete(String name, String surname, LocalDate birthday, String cityOfBirth) {
    this.name = name;
    this.surname = surname;
    this.birthday = birthday;
    this.cityOfBirth = cityOfBirth;
  }

  public Athlete(String name, String surname, LocalDate birthday, String cityOfBirth, String team) {
    this.name = name;
    this.surname = surname;
    this.birthday = birthday;
    this.cityOfBirth = cityOfBirth;
    this.team = team;
  }

  
  //Getters & Setters//
  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getSurname() {
    return surname;
  }

  public void setSurname(String surname) {
    this.surname = surname;
  }

  public LocalDate getBirthday() {
    return birthday;
  }

  public void setBirthday(LocalDate birthday) {
    this.birthday = birthday;
  }

  public String getCityOfBirth() {
    return cityOfBirth;
  }

  public void setCityOfBirth(String cityOfBirth) {
    this.cityOfBirth = cityOfBirth;
  }

  public String getTeam() {
    return team;
  }

  public void setTeam(String team) {
    this.team = team;
  }

  
}
