// The speakers by place, and which places share a pin on the map. The places
// are real; the people are made up.
import { describe, expect, it } from 'vitest';
import { pinRadius, pinsFor, placesOf } from './speakerPlaces';

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
