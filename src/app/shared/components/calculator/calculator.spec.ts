import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Calculator } from './calculator';

describe('Calculator', () => {
  let component: Calculator;
  let fixture: ComponentFixture<Calculator>;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [Calculator],
    }).compileComponents();

    fixture = TestBed.createComponent(Calculator);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  function getDisplay(): string {
    return fixture.nativeElement.querySelector('[data-testid="display"]').textContent.trim();
  }

  function getMemoryBadgeText(): string | null {
    const badge = fixture.nativeElement.querySelector('[data-testid="memory-badge"]');
    return badge ? badge.textContent.trim() : null;
  }

  function getButton(label: string): HTMLButtonElement {
    const button = Array.from<HTMLButtonElement>(
      fixture.nativeElement.querySelectorAll('button'),
    ).find((element) => element.textContent?.trim() === label);

    if (!button) {
      throw new Error(`No se ha encontrado ningún botón con la etiqueta "${label}"`);
    }

    return button;
  }

  function press(...labels: string[]): void {
    for (const label of labels) {
      getButton(label).click();
      fixture.detectChanges();
    }
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('muestra 0 en la pantalla al arrancar', () => {
    expect(getDisplay()).toBe('0');
  });

  describe('entrada de dígitos', () => {
    it('sustituye el cero inicial por el primer dígito', () => {
      press('7');
      expect(getDisplay()).toBe('7');
    });

    it('concatena los siguientes dígitos', () => {
      press('1', '2', '3');
      expect(getDisplay()).toBe('123');
    });

    it('solo permite un punto decimal', () => {
      press('1', '.', '2', '.', '5');
      expect(getDisplay()).toBe('1.25');
    });
  });

  describe('operaciones', () => {
    it.each([
      { keys: ['2', '+', '3', '='], expected: '5', description: 'suma' },
      { keys: ['9', '−', '4', '='], expected: '5', description: 'resta' },
      { keys: ['6', '×', '7', '='], expected: '42', description: 'multiplicación' },
      { keys: ['8', '÷', '2', '='], expected: '4', description: 'división' },
      {
        keys: ['5', '+', '3', '×', '2', '='],
        expected: '16',
        description: 'encadenar operador resuelve primero el pendiente (no da 11)',
      },
      {
        keys: ['0', '.', '1', '+', '0', '.', '2', '='],
        expected: '0.3',
        description: 'redondea los errores de coma flotante',
      },
    ])('$description', ({ keys, expected }) => {
      press(...keys);
      expect(getDisplay()).toBe(expected);
    });
  });

  describe('errores', () => {
    it('división entre cero muestra Error y bloquea las teclas salvo CE', () => {
      press('5', '÷', '0', '=');
      expect(getDisplay()).toBe('Error');

      press('+');
      expect(getDisplay()).toBe('Error');

      press('CE');
      expect(getDisplay()).toBe('0');
    });

    it('escribir un dígito tras un error empieza un número nuevo', () => {
      press('5', '÷', '0', '=');
      press('9');
      expect(getDisplay()).toBe('9');
    });
  });

  describe('CE', () => {
    it('reinicia la pantalla y la operación pendiente', () => {
      press('5', '+', '3', 'CE');
      expect(getDisplay()).toBe('0');

      press('4', '=');
      expect(getDisplay()).toBe('4');
    });
  });

  describe('memoria', () => {
    it('MR y MC empiezan deshabilitados y sin badge', () => {
      expect(getButton('MR').disabled).toBe(true);
      expect(getButton('MC').disabled).toBe(true);
      expect(getMemoryBadgeText()).toBeNull();
    });

    it('M+ guarda el valor mostrado y lo refleja en el badge', () => {
      press('7', 'M+');

      expect(getMemoryBadgeText()).toBe('M: 7');
      expect(getButton('MR').disabled).toBe(false);
      expect(getButton('MC').disabled).toBe(false);
    });

    it('M+ acumula sobre el valor ya guardado', () => {
      press('7', 'M+');
      press('CE', '3', 'M+');

      expect(getMemoryBadgeText()).toBe('M: 10');
    });

    it('M+ no hace nada en estado de error', () => {
      press('5', '÷', '0', '=', 'M+');

      expect(getMemoryBadgeText()).toBeNull();
    });

    it('MR recupera el valor guardado y deja la pantalla lista para un valor nuevo', () => {
      press('7', 'M+', 'CE');

      press('MR');
      expect(getDisplay()).toBe('7');

      press('2');
      expect(getDisplay()).toBe('2');
    });

    it('MC borra la memoria y hace desaparecer el badge', () => {
      press('7', 'M+', 'MC');

      expect(getMemoryBadgeText()).toBeNull();
      expect(getButton('MR').disabled).toBe(true);
      expect(getButton('MC').disabled).toBe(true);
    });

    it('el valor guardado sobrevive a recargar la vista (localStorage)', async () => {
      press('7', 'M+');

      const newFixture = TestBed.createComponent(Calculator);
      newFixture.detectChanges();
      await newFixture.whenStable();

      const badge = newFixture.nativeElement.querySelector('[data-testid="memory-badge"]');
      expect(badge?.textContent.trim()).toBe('M: 7');
    });

    it('MC borra también el valor persistido en localStorage', () => {
      press('7', 'M+', 'MC');

      expect(localStorage.getItem('calculator-memory')).toBeNull();
    });
  });
});
