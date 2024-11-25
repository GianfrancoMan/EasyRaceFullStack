import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinishLineComponent } from './finish-line.component';

describe('FinishLineComponent', () => {
  let component: FinishLineComponent;
  let fixture: ComponentFixture<FinishLineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FinishLineComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FinishLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
