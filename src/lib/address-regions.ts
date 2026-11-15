import { INDIA_CITIES, INDIA_STATES } from "@/lib/data/india-cities";

export { INDIA_STATES };

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** Old names and geocoder spellings → the dropdown's name. */
const STATE_ALIASES: Record<string, string> = {
  "national capital territory of delhi": "Delhi",
  "nct of delhi": "Delhi",
  "new delhi": "Delhi",
  orissa: "Odisha",
  pondicherry: "Puducherry",
  uttaranchal: "Uttarakhand",
  "dadra and nagar haveli": "Dadra and Nagar Haveli and Daman and Diu",
  "daman and diu": "Dadra and Nagar Haveli and Daman and Diu",
  "andaman and nicobar": "Andaman and Nicobar Islands",
  "jammu kashmir": "Jammu and Kashmir",
};

const CITY_ALIASES: Record<string, string> = {
  bangalore: "Bengaluru",
  "bengaluru urban": "Bengaluru",
  "bangalore urban": "Bengaluru",
  bombay: "Mumbai",
  "mumbai suburban": "Mumbai",
  "mumbai city": "Mumbai",
  gurugram: "Gurgaon",
  mangalore: "Mangaluru",
  calcutta: "Kolkata",
  madras: "Chennai",
  poona: "Pune",
};

const STATE_BY_NORM = new Map(INDIA_STATES.map((s) => [norm(s), s]));

/** The dropdown's state name for any spelling, or "" if it isn't an Indian state. */
export function matchState(raw?: string | null): string {
  if (!raw) return "";
  const n = norm(raw);
  return STATE_BY_NORM.get(n) ?? STATE_ALIASES[n] ?? "";
}

export function citiesOf(state: string): readonly string[] {
  return INDIA_CITIES[state] ?? [];
}

/**
 * The listed city name for a spelling, within a state. Falls back to the
 * cleaned-up input so a small town that isn't listed is never lost.
 */
export function matchCity(state: string, raw?: string | null): string {
  const value = (raw ?? "").trim();
  if (!value) return "";
  const list = citiesOf(state);
  const n = norm(value);
  const candidates = [n, n.replace(/ (city|district|urban|rural)$/, ""), CITY_ALIASES[n] ? norm(CITY_ALIASES[n]) : ""];
  for (const c of candidates) {
    const hit = c && list.find((city) => norm(city) === c);
    if (hit) return hit;
  }
  return value;
}

export const isListedCity = (state: string, city: string) => citiesOf(state).includes(city);

/** Cities of a state matching a search, best matches (prefix) first. */
export function searchCities(state: string, query: string, limit = 60): string[] {
  const list = citiesOf(state);
  const q = norm(query);
  if (!q) return list.slice(0, limit);
  const starts: string[] = [];
  const contains: string[] = [];
  for (const city of list) {
    const n = norm(city);
    if (n.startsWith(q)) starts.push(city);
    else if (n.includes(q)) contains.push(city);
  }
  return [...starts, ...contains].slice(0, limit);
}

export type PincodeInfo = { state: string; city: string };

/** India Post lookup: which state and city a pincode belongs to. `null` = no such pincode. */
export async function lookupPincode(pincode: string, signal?: AbortSignal): Promise<PincodeInfo | null> {
  const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, { signal });
  if (!response.ok) throw new Error(String(response.status));
  const [result] = (await response.json()) as {
    Status: string;
    PostOffice: { State: string; District: string; Division?: string; Region?: string; Block?: string }[] | null;
  }[];
  const office = result?.Status === "Success" ? result.PostOffice?.[0] : undefined;
  if (!office) return null;

  const state = matchState(office.State);
  if (!state) return null;
  // The district usually is the city; try the post office's other names if it isn't listed.
  const names = [office.District, office.Division, office.Region, office.Block].filter(Boolean) as string[];
  const listed = names.map((n) => matchCity(state, n)).find((c) => isListedCity(state, c));
  return { state, city: listed ?? matchCity(state, office.District) };
}
