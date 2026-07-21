import { fixMojibake } from './fix-mojibake';

describe('fixMojibake', () => {
  it.each([
    { input: 'mantendrÃ¡ la estabilidad', expected: 'mantendrá la estabilidad' },
    { input: 'AvilÃ©s', expected: 'Avilés' },
    { input: 'CÃ¡ceres', expected: 'Cáceres' },
    { input: 'aÃ±o', expected: 'año' },
    { input: 'lluvia prÃ³xima', expected: 'lluvia próxima' },
  ])('revierte el mojibake de "$input"', ({ input, expected }) => {
    expect(fixMojibake(input)).toBe(expected);
  });

  it.each([
    { input: 'texto sin acentos ni caracteres especiales' },
    { input: 'Madrid, Barcelona, Sevilla' },
    { input: '' },
  ])('deja intacto un texto que no está corrupto: "$input"', ({ input }) => {
    expect(fixMojibake(input)).toBe(input);
  });

  it('devuelve el texto original si contiene Ã/Â pero no es un mojibake válido', () => {
    const notActuallyMojibake = 'Ãz';

    expect(fixMojibake(notActuallyMojibake)).toBe(notActuallyMojibake);
  });
});
