package org.manca.racing_circuit_behind.model;

public enum AthletePersistenceOperation {

  SAVE("save"),
  UPDATE("update"),
  NO_OP("nop");

  public String value;

  private AthletePersistenceOperation(String value) {
    this.value = value;
  }

}
