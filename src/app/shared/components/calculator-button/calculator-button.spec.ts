import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculatorButton } from './calculator-button';

describe('CalculatorButton', () => {
  let component: CalculatorButton;
  let fixture: ComponentFixture<CalculatorButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalculatorButton],
    }).compileComponents();

    fixture = TestBed.createComponent(CalculatorButton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
