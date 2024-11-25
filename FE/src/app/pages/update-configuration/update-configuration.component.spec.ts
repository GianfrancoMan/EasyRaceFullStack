import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateConfigurationComponent } from './update-configuration.component';

describe('UpdateConfigurationComponent', () => {
  let component: UpdateConfigurationComponent;
  let fixture: ComponentFixture<UpdateConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UpdateConfigurationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
