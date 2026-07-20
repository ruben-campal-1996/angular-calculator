import { Component, signal } from '@angular/core';

type Operator = '+' | '-' | '×' | '÷';

@Component({
  selector: 'app-calculator',
  imports: [],
  templateUrl: './calculator.html',
  styleUrl: './calculator.css',
})
export class Calculator {
  protected readonly display = signal('0');
  protected readonly error = signal(false);

  private readonly previousValue = signal<number | null>(null);
  private readonly operator = signal<Operator | null>(null);
  private readonly waitingForNewValue = signal(false);

  protected inputDigit(digit: string): void {
    if (this.error()) {
      this.clear();
    }

    if (this.waitingForNewValue()) {
      this.display.set(digit);
      this.waitingForNewValue.set(false);
      return;
    }

    this.display.set(this.display() === '0' ? digit : this.display() + digit);
  }

  protected inputDecimal(): void {
    if (this.error()) {
      this.clear();
    }

    if (this.waitingForNewValue()) {
      this.display.set('0.');
      this.waitingForNewValue.set(false);
      return;
    }

    if (!this.display().includes('.')) {
      this.display.set(this.display() + '.');
    }
  }

  protected setOperator(nextOperator: Operator): void {
    if (this.error()) {
      return;
    }

    const inputValue = Number(this.display());

    if (this.previousValue() !== null && this.operator() && !this.waitingForNewValue()) {
      const result = this.compute(this.previousValue()!, inputValue, this.operator()!);
      if (result === null) {
        this.setError();
        return;
      }
      this.display.set(String(result));
      this.previousValue.set(result);
    } else {
      this.previousValue.set(inputValue);
    }

    this.operator.set(nextOperator);
    this.waitingForNewValue.set(true);
  }

  protected calculate(): void {
    if (this.error() || this.operator() === null || this.previousValue() === null) {
      return;
    }

    const inputValue = Number(this.display());
    const result = this.compute(this.previousValue()!, inputValue, this.operator()!);

    if (result === null) {
      this.setError();
      return;
    }

    this.display.set(String(result));
    this.previousValue.set(null);
    this.operator.set(null);
    this.waitingForNewValue.set(true);
  }

  protected clear(): void {
    this.display.set('0');
    this.previousValue.set(null);
    this.operator.set(null);
    this.waitingForNewValue.set(false);
    this.error.set(false);
  }

  private compute(a: number, b: number, operator: Operator): number | null {
    switch (operator) {
      case '+':
        return this.round(a + b);
      case '-':
        return this.round(a - b);
      case '×':
        return this.round(a * b);
      case '÷':
        return b === 0 ? null : this.round(a / b);
    }
  }

  private setError(): void {
    this.display.set('Error');
    this.previousValue.set(null);
    this.operator.set(null);
    this.waitingForNewValue.set(false);
    this.error.set(true);
  }

  private round(value: number): number {
    return Math.round(value * 1e10) / 1e10;
  }
}
