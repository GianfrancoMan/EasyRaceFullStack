import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AthleteSetupComponent } from './athlete-setup.component';

describe('AthleteSetupComponent', () => {
  let component: AthleteSetupComponent;
  let fixture: ComponentFixture<AthleteSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AthleteSetupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AthleteSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
