import { getSkyIconPath } from './sky-icon';

describe('getSkyIconPath', () => {
  it.each([
    { skyId: '11', icon: 'sunny' },
    { skyId: '12', icon: 'partly-cloudy' },
    { skyId: '13', icon: 'partly-cloudy' },
    { skyId: '16', icon: 'overcast' },
    { skyId: '26', icon: 'rain' },
    { skyId: '46', icon: 'rain' },
    { skyId: '53', icon: 'storm' },
    { skyId: '64', icon: 'storm' },
    { skyId: '34', icon: 'snow' },
    { skyId: '73', icon: 'snow' },
    { skyId: '82', icon: 'fog' },
  ])('mapea el código AEMET $skyId al icono $icon', ({ skyId, icon }) => {
    expect(getSkyIconPath(skyId)).toBe(`assets/icons/${icon}.svg`);
  });

  it('cae en "cloudy" para un código desconocido', () => {
    expect(getSkyIconPath('99')).toBe('assets/icons/cloudy.svg');
  });

  it('ignora caracteres no numéricos antes de mapear el código', () => {
    expect(getSkyIconPath('n11')).toBe('assets/icons/sunny.svg');
  });
});
