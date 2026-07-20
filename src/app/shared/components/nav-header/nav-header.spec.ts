import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NavHeader } from './nav-header';

describe('NavHeader', () => {
  let component: NavHeader;
  let fixture: ComponentFixture<NavHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavHeader],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(NavHeader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
