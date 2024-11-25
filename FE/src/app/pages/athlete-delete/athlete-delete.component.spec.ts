import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AthleteDeleteComponent } from './athlete-delete.component';

describe('AthleteDeleteComponent', () => {
  let component: AthleteDeleteComponent;
  let fixture: ComponentFixture<AthleteDeleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AthleteDeleteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AthleteDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
