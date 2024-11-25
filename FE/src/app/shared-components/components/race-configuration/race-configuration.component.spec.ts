import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaceConfigurationComponent } from './race-configuration.component';

describe('RaceConfigurationComponent', () => {
  let component: RaceConfigurationComponent;
  let fixture: ComponentFixture<RaceConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RaceConfigurationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RaceConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
