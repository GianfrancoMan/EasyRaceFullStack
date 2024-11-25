package org.manca.racing_circuit_behind.model;

import java.io.Serializable;

public class Category implements Serializable {
  private static final long serialVersionUID = 42378089874L;
  private String name;
  private int lapsToDo; 

  //Constructors//
  public Category() {}

  public Category(String name, int laps) {
    this.name = name;
    lapsToDo = laps;
  }

  //Getters & Setters//
  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public int getLapsToDo() {
    return lapsToDo;
  }

  public void setLapsToDo(int lapsToDo) {
    this.lapsToDo = lapsToDo;
  }

  @Override
  public String toString() {
    return "Category [name=" + name + ", lapsToDo=" + lapsToDo + "]";
  }

  

  
}
