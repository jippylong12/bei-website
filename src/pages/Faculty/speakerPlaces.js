// The speakers by place, and the pins that show the places on the map
// (SpeakerMap.jsx draws them).
import { geoAlbersUsa } from 'd3-geo';

// The map's box, in map units. The state outlines (us-atlas's
// states-albers-10m) were projected with exactly this projection, so a
// place's [x, y] lands on its state.
export const MAP_WIDTH = 975;
export const MAP_HEIGHT = 610;
const projection = geoAlbersUsa().scale(1300).translate([MAP_WIDTH / 2, MAP_HEIGHT / 2]);

// A pin's radius on the screen, in pixels, for `count` speakers: bigger for
// more, but a place with 13 is not 13 times the size of a place with one.
export const pinRadius = (count) => 5 + 2.4 * Math.sqrt(count);

// The speakers grouped by their `location`, most speakers first; ties go by
// name. Each place is { name, people, at }: `at` is its [x, y] on the map, or
// null when it is off the map (outside the United States). Speakers the
// backend could not place (no `lat` and `lon`) are one last group named ''.
export function placesOf(people) {
  const byName = new Map();
  for (const person of people) {
    const known = Boolean(person.location) && Number.isFinite(person.lat) && Number.isFinite(person.lon);
    const name = known ? person.location : '';
    let place = byName.get(name);
    if (!place) {
      place = { name, people: [], at: known ? projection([person.lon, person.lat]) : null };
      byName.set(name, place);
    }
    place.people.push(person);
  }
  return [...byName.values()].sort(
    (a, b) =>
      (a.name === '') - (b.name === '') ||
      b.people.length - a.people.length ||
      a.name.localeCompare(b.name),
  );
}

// Two pins closer than this share of their radii added together would cover
// each other's numbers, so they become one.
const OVERLAP = 0.85;

// The pins for the places on the map, when the map is drawn at `scale` screen
// pixels per map unit: [{ x, y, r, count, places }], r in map units, the
// biggest first (drawn first, so a smaller pin beside a big one stays on top
// and can be clicked). Pins are sized on the screen, so places that close
// share one pin (Los Angeles, West Hollywood and Orange County), at the spot
// of the place with the most speakers. Joining makes a pin bigger, which can
// make it cover another, so it goes on until no two pins are that close. A
// smaller map (a phone) joins more.
export function pinsFor(places, scale) {
  const pins = places
    .filter((place) => place.at)
    .map((place) => ({ x: place.at[0], y: place.at[1], count: place.people.length, places: [place] }));
  const tooClose = (a, b) =>
    Math.hypot(a.x - b.x, a.y - b.y) * scale < (pinRadius(a.count) + pinRadius(b.count)) * OVERLAP;

  for (let joined = true; joined; ) {
    joined = false;
    pins.sort((a, b) => b.count - a.count);
    for (let i = 0; i < pins.length && !joined; i++) {
      const j = pins.findIndex((pin, k) => k > i && tooClose(pins[i], pin));
      if (j > 0) {
        pins[i].count += pins[j].count;
        pins[i].places.push(...pins[j].places);
        pins.splice(j, 1);
        joined = true;
      }
    }
  }
  return pins.map((pin) => ({ ...pin, r: pinRadius(pin.count) / scale }));
}
