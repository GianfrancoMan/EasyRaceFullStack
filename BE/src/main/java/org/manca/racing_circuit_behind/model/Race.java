package org.manca.racing_circuit_behind.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

@Entity
@Table(name = "races")
public class Race {

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  @Column(nullable = false)
  private Long id;
  @Transient
  private String categories;  
  @Column(nullable = false)
  private String city;
  @Column(nullable = false)
  private LocalDate date;
  @Column(nullable = false)
  private String meeting;
  @Transient
  private String laps;
  @Column(nullable = false)
  private String organizer;
  @Column(nullable = false)
  private String title;
  private String description;
  private String federation;
  private String specialty;
  private String type;


  //Constructors//
  public Race() {
  }
  
  public Race(String categories, String city, LocalDate date, String meeting, String laps, String organizer,
      String title) {
    this.categories = categories;
    this.city = city;
    this.date = date;
    this.meeting = meeting;
    this.laps = laps;
    this.organizer = organizer;
    this.title = title;
  }
  
  public Race(String categories, String city, LocalDate date, String meeting, String laps, String organizer,
      String title, String description) {
    this.categories = categories;
    this.city = city;
    this.date = date;
    this.meeting = meeting;
    this.laps = laps;
    this.organizer = organizer;
    this.title = title;
    this.description = description;
  }

  public Race(String categories, String city, LocalDate date, String meeting, String laps, String organizer,
      String title, String description, String federation) {
    this.categories = categories;
    this.city = city;
    this.date = date;
    this.meeting = meeting;
    this.laps = laps;
    this.organizer = organizer;
    this.title = title;
    this.description = description;
    this.federation = federation;
  }

  public Race(String categories, String city, LocalDate date, String meeting, String laps, String organizer,
      String title, String description, String federation, String specialty) {
    this.categories = categories;
    this.city = city;
    this.date = date;
    this.meeting = meeting;
    this.laps = laps;
    this.organizer = organizer;
    this.title = title;
    this.description = description;
    this.federation = federation;
    this.specialty = specialty;
  }

  public Race(String categories, String city, LocalDate date, String meeting, String laps, String organizer,
      String title, String description, String federation, String specialty, String type) {
    this.categories = categories;
    this.city = city;
    this.date = date;
    this.meeting = meeting;
    this.laps = laps;
    this.organizer = organizer;
    this.title = title;
    this.description = description;
    this.federation = federation;
    this.specialty = specialty;
    this.type = type;
  }



  //Getters & Setters//
  public Long getId() {
    return id;
  }
  public void setId(Long id) {
    this.id = id;
  }
  public String getCategories() {
    return categories;
  }
  public void setCategories(String categories) {
    this.categories = categories;
  }
  public String getCity() {
    return city;
  }
  public void setCity(String city) {
    this.city = city;
  }
  public LocalDate getDate() {
    return date;
  }
  public void setDate(LocalDate date) {
    this.date = date;
  }
  public String getMeeting() {
    return meeting;
  }
  public void setMeeting(String meeting) {
    this.meeting = meeting;
  }
  public String getLaps() {
    return laps;
  }
  public void setLaps(String laps) {
    this.laps = laps;
  }
  public String getOrganizer() {
    return organizer;
  }
  public void setOrganizer(String organizer) {
    this.organizer = organizer;
  }
  public String getTitle() {
    return title;
  }
  public void setTitle(String title) {
    this.title = title;
  }
  public String getDescription() {
    return description;
  }
  public void setDescription(String description) {
    this.description = description;
  }
  public String getFederation() {
    return federation;
  }
  public void setFederation(String federation) {
    this.federation = federation;
  }
  public String getSpecialty() {
    return specialty;
  }
  public void setSpecialty(String specialty) {
    this.specialty = specialty;
  }
  public String getType() {
    return type;
  }
  public void setType(String type) {
    this.type = type;
  }

  
  /*===========hashCode Method Override==============*/
  @Override
  public int hashCode() {
    final int prime = 31;
    int result = 1;
    result = prime * result + ((id == null) ? 0 : id.hashCode());
    result = prime * result + ((categories == null) ? 0 : categories.hashCode());
    result = prime * result + ((city == null) ? 0 : city.hashCode());
    result = prime * result + ((date == null) ? 0 : date.hashCode());
    result = prime * result + ((meeting == null) ? 0 : meeting.hashCode());
    result = prime * result + ((laps == null) ? 0 : laps.hashCode());
    result = prime * result + ((organizer == null) ? 0 : organizer.hashCode());
    result = prime * result + ((title == null) ? 0 : title.hashCode());
    result = prime * result + ((description == null) ? 0 : description.hashCode());
    result = prime * result + ((federation == null) ? 0 : federation.hashCode());
    result = prime * result + ((specialty == null) ? 0 : specialty.hashCode());
    result = prime * result + ((type == null) ? 0 : type.hashCode());
    return result;
  }
  
  
  /*==========toString Method Override==========*/  
  @Override
  public String toString() {
    return "Race [id=" + id + ", categories=" + categories + ", city=" + city + ", date=" + date + ", meeting="
        + meeting + ", laps=" + laps + ", organizer=" + organizer + ", title=" + title + ", description=" + description
        + ", federation=" + federation + ", specialty=" + specialty + ", type=" + type + "]";
  }

}
