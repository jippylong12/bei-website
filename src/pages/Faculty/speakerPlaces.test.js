// The speakers by place, and which places share a pin on the map. The places
// are real; the people are made up.
import { describe, expect, it } from 'vitest';
import { pinRadius, pinsFor, placesOf, tagsFor } from './speakerPlaces';

const at = (location, lat, lon) => ({ first_name: 'A', last_name: location, location, lat, lon });
const AUSTIN = at('Austin', 30.2672, -97.7431);
const COLLEGE_STATION = at('College Station', 30.628, -96.3344);
const LOS_ANGELES = at('Los Angeles', 34.0522, -118.2437);
const WEST_HOLLYWOOD = at('West Hollywood', 34.09, -118.3617);
const ORANGE_COUNTY = at('Orange County', 33.7175, -117.8311);
const LONDON = at('London', 51.5074, -0.1278);

const names = (pins) => pins.map((pin) => pin.places.map((place) => place.name).join(' + '));

describe('placesOf', () => {
  it('groups the speakers by place, most first, ties by name, the unplaced last', () => {
    const places = placesOf([
      LONDON,
      AUSTIN,
      { ...at('', null, null) },
      AUSTIN,
      COLLEGE_STATION,
      { ...at('Nowhere', null, null) }, // a place the backend could not place
    ]);

    expect(places.map((p) => `${p.name || '?'} ${p.people.length}`)).toEqual([
      'Austin 2',
      'College Station 1',
      'London 1',
      '? 2',
    ]);
  });

  it('puts a place in the United States on the map, and one outside it off the map', () => {
    const [austin, london] = placesOf([AUSTIN, AUSTIN, LONDON]);

    const [x, y] = austin.at;
    // Inside the 975 x 610 map, in Texas: south of the middle, left of centre.
    expect(x).toBeGreaterThan(400);
    expect(x).toBeLessThan(500);
    expect(y).toBeGreaterThan(400);
    expect(y).toBeLessThan(610);
    expect(london.at).toBeNull();
  });
});

describe('pinsFor', () => {
  it('gives each place well apart its own pin, sized on the screen, the biggest first', () => {
    const places = placesOf([AUSTIN, AUSTIN, AUSTIN, COLLEGE_STATION, LONDON]);

    const pins = pinsFor(places, 1);

    expect(names(pins)).toEqual(['Austin', 'College Station']); // London is off the map
    expect(pins.map((pin) => pin.count)).toEqual([3, 1]);
    expect(pins[0].r).toBe(pinRadius(3));
    // At half the size on the screen, the same pin is twice as big in map units.
    expect(pinsFor(places, 0.5)[0].r).toBe(pinRadius(3) * 2);
  });

  it('lets places whose pins would cover each other share one, where most speakers are', () => {
    const pins = pinsFor(placesOf([LOS_ANGELES, LOS_ANGELES, WEST_HOLLYWOOD, AUSTIN]), 1);

    expect(names(pins)).toEqual(['Los Angeles + West Hollywood', 'Austin']);
    expect(pins[0].count).toBe(3);
    expect(pins[0].r).toBe(pinRadius(3));
    expect([pins[0].x, pins[0].y]).toEqual(placesOf([LOS_ANGELES])[0].at);
  });

  it('keeps joining while a joined pin, now bigger, covers another', () => {
    // Places set out on a line, in map units: C is just clear of A's pin,
    // but not of the bigger pin A and B make together.
    const place = (name, count, x) => ({ name, people: Array(count).fill({}), at: [x, 0] });
    const a = place('A', 2, 0);
    const b = place('B', 1, -1);
    const c = place('C', 1, 13.75);
    expect(names(pinsFor([a, c], 1))).toEqual(['A', 'C']);

    // Whichever of B and C is looked at first.
    expect(names(pinsFor([a, b, c], 1))).toEqual(['A + B + C']);
    expect(names(pinsFor([a, c, b], 1))).toEqual(['A + B + C']);
  });

  it('joins the real places that sit close together: Los Angeles, West Hollywood, Orange County', () => {
    const pins = pinsFor(placesOf([LOS_ANGELES, LOS_ANGELES, ORANGE_COUNTY, WEST_HOLLYWOOD, AUSTIN]), 770 / 975);

    expect(names(pins)).toEqual(['Los Angeles + Orange County + West Hollywood', 'Austin']);
    expect(pins[0].count).toBe(4);
  });

  it('joins more places on a small map (a phone) than on a big one', () => {
    const places = placesOf([AUSTIN, AUSTIN, COLLEGE_STATION]);

    expect(names(pinsFor(places, 0.8))).toEqual(['Austin', 'College Station']);
    expect(names(pinsFor(places, 0.25))).toEqual(['Austin + College Station']);
  });
});

describe('tagsFor', () => {
  // A made-up pin at [x, y] for `count` speakers of one place, at `scale`.
  const pinAt = (name, x, y, count, scale = 1) => ({
    x,
    y,
    count,
    r: pinRadius(count) / scale,
    places: [{ name }],
  });
  const tagged = (tags) => tags.map((tag) => `${tag.text} ${tag.anchor}`);

  it('names the pins for two speakers or more, to the right of the pin', () => {
    const pins = [pinAt('Austin', 400, 300, 13), pinAt('Seattle', 100, 100, 1)];

    const tags = tagsFor(pins, 1);

    expect(tagged(tags)).toEqual(['Austin start']);
    expect(tags[0].x).toBeCloseTo(400 + pins[0].r + 4);
    expect(tags[0].y).toBe(300);
  });

  it('puts a name on the left, above or below when the right is taken, and leaves it off when nothing is free', () => {
    // Right of A is B, so A's name goes left.
    expect(tagged(tagsFor([pinAt('Aaaa', 500, 300, 9), pinAt('Bbbb', 540, 300, 4)], 1))).toEqual([
      'Aaaa end',
      'Bbbb start',
    ]);

    // Mid sits between two bigger pins: its name goes above it; with a third
    // pin above, below it.
    const left = pinAt('Left', 470, 300, 9);
    const right = pinAt('Right', 530, 300, 9);
    const mid = pinAt('Mid', 500, 300, 2);
    const between = tagsFor([left, right, mid], 1);
    expect(tagged(between)).toEqual(['Left end', 'Right start', 'Mid middle']);
    expect(between[2].y).toBeLessThan(300);
    const under = tagsFor([left, right, pinAt('Top', 500, 275, 9), mid], 1);
    expect(tagged(under)).toEqual(['Left end', 'Right start', 'Top start', 'Mid middle']);
    expect(under[3].y).toBeGreaterThan(300);

    // Pins on all four sides: no room for Mid's name.
    const ring = [pinAt('N', 500, 280, 5), pinAt('S', 500, 320, 5), pinAt('W', 460, 300, 5), pinAt('E', 540, 300, 5)];
    expect(tagged(tagsFor([...ring, mid], 1))).toEqual(['N start', 'S start', 'W start', 'E start']);
  });

  it('keeps every name on the map, and names a shared pin after the place it stands on', () => {
    const pins = pinsFor(placesOf([LOS_ANGELES, LOS_ANGELES, ORANGE_COUNTY, WEST_HOLLYWOOD]), 770 / 975);
    const edge = pinAt('Right Edge', 960, 300, 3);

    const tags = tagsFor([...pins, edge], 770 / 975);

    expect(tagged(tags)).toEqual(['Los Angeles +2 start', 'Right Edge end']);
  });

  it('draws the names a fixed size on the screen: the smaller the map, the fewer fit', () => {
    const texas = placesOf([AUSTIN, AUSTIN, AUSTIN, COLLEGE_STATION, COLLEGE_STATION]);

    expect(tagged(tagsFor(pinsFor(texas, 0.8), 0.8))).toEqual(['Austin end', 'College Station start']);
    expect(tagged(tagsFor(pinsFor(texas, 0.25), 0.25))).toEqual(['Austin +1 start']);
  });
});
