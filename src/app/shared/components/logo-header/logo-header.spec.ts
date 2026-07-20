import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LogoHeader } from './logo-header';

describe('LogoHeader', () => {
  let component: LogoHeader;
  let fixture: ComponentFixture<LogoHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogoHeader],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LogoHeader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
