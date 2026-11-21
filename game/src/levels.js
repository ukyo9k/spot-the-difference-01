// Level data for Lantern Lane: three scenes, seven differences each.
// A difference is a spot in scene coordinates (560 x 420) where the right
// picture differs from the left. `key` names the variant the scene painter
// switches on for the right panel; `label` is the friendly name shown when
// the player finds it. Coordinates match the drawing code in scenes.js.

export const LEVELS = [
  {
    id: 'lantern',
    name: 'Lantern Lane',
    scene: 'lantern',
    blurb: 'A night market alley strung with paper lanterns.',
    timeLimit: 150,
    differences: [
      { key: 'moon', x: 472, y: 58, r: 30, label: 'The moon turned crescent' },
      { key: 'lantern', x: 300, y: 122, r: 26, label: 'A paper lantern went missing' },
      { key: 'cat', x: 110, y: 330, r: 30, label: 'The alley cat changed colour' },
      { key: 'awning', x: 140, y: 185, r: 30, label: 'The shop awning changed colour' },
      { key: 'window', x: 118, y: 248, r: 26, label: 'A window pane vanished' },
      { key: 'star', x: 392, y: 44, r: 16, label: 'A star went out' },
      { key: 'puddle', x: 300, y: 388, r: 30, label: 'The moon left the puddle' },
    ],
  },
  {
    id: 'garden',
    name: 'Tea Garden',
    scene: 'garden',
    blurb: 'A quiet garden with a koi pond and a little pagoda.',
    timeLimit: 150,
    differences: [
      { key: 'sun', x: 478, y: 56, r: 30, label: 'The sun hid behind a cloud' },
      { key: 'koi', x: 370, y: 332, r: 24, label: 'A koi swam away' },
      { key: 'blossom', x: 150, y: 148, r: 26, label: 'A cherry branch lost its blossom' },
      { key: 'lanternFlame', x: 470, y: 272, r: 16, label: 'The stone lantern went dark' },
      { key: 'plank', x: 283, y: 282, r: 18, label: 'A bridge plank changed colour' },
      { key: 'tulip', x: 60, y: 378, r: 16, label: 'A tulip changed colour' },
      { key: 'pagodaWindow', x: 332, y: 229, r: 18, label: 'The pagoda window went dark' },
    ],
  },
  {
    id: 'cove',
    name: 'Lighthouse Cove',
    scene: 'cove',
    blurb: 'A sunset coast with a striped lighthouse.',
    timeLimit: 150,
    differences: [
      { key: 'beam', x: 360, y: 113, r: 30, label: 'The lighthouse beam went out' },
      { key: 'gull', x: 480, y: 56, r: 16, label: 'A seagull flew off' },
      { key: 'sail', x: 150, y: 290, r: 30, label: 'The sail changed colour' },
      { key: 'coconut', x: 503, y: 226, r: 14, label: 'A coconut fell from the palm' },
      { key: 'rock', x: 390, y: 338, r: 22, label: 'A rock sank beneath the waves' },
      { key: 'rays', x: 92, y: 92, r: 34, label: 'The sun lost its rays' },
      { key: 'bucket', x: 200, y: 385, r: 20, label: 'The beach bucket vanished' },
    ],
  },
];
