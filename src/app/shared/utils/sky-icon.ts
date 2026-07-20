const ICONS_BY_STATE: Record<string, string> = {
  '11': 'sunny',
  '12': 'partly-cloudy',
  '13': 'partly-cloudy',
  '14': 'cloudy',
  '15': 'cloudy',
  '16': 'overcast',
  '17': 'cloudy',
  '23': 'rain',
  '24': 'rain',
  '25': 'rain',
  '26': 'rain',
  '27': 'rain',
  '33': 'snow',
  '34': 'snow',
  '35': 'snow',
  '36': 'snow',
  '43': 'rain',
  '44': 'rain',
  '45': 'rain',
  '46': 'rain',
  '51': 'storm',
  '52': 'storm',
  '53': 'storm',
  '54': 'storm',
  '61': 'storm',
  '62': 'storm',
  '63': 'storm',
  '64': 'storm',
  '71': 'snow',
  '72': 'snow',
  '73': 'snow',
  '74': 'snow',
  '81': 'fog',
  '82': 'fog',
  '83': 'fog',
};

export function getSkyIconPath(skyId: string): string {
  const numericCode = skyId.replace(/[^0-9]/g, '');
  const icon = ICONS_BY_STATE[numericCode] ?? 'cloudy';
  return `assets/icons/${icon}.svg`;
}
