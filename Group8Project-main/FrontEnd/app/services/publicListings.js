/**
 * Listed properties for the public pages (home, properties).
 *
 * A unit is "listed" when it has an active public listing (`/api/v1/listings`,
 * created when an estate agent publishes). Each result joins the unit's details
 * and first photo with its newest active listing.
 */
import { listListings } from './listingApi.js';
import { listProperties, photoSrc } from './propertyApi.js';

/** The newest active listing per unit. */
function latestActiveByUnit(listings) {
  const byUnit = new Map();
  for (const listing of listings) {
    const current = byUnit.get(listing.unitId);
    if (!current || String(listing.updatedAt) > String(current.updatedAt)) {
      byUnit.set(listing.unitId, listing);
    }
  }
  return byUnit;
}

/*
 * The home page and the Properties page show the same list, so a result is
 * reused for a minute: moving between them doesn't wait on the server again.
 * A failed load is not kept, so the next visit tries again.
 */
const CACHE_MS = 60_000;
let cached = null; // { at, promise }

/** Listed units, newest listing first. */
export function loadListedProperties() {
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.promise;
  const promise = fetchListedProperties();
  cached = { at: Date.now(), promise };
  promise.catch(() => {
    if (cached?.promise === promise) cached = null;
  });
  return promise;
}

async function fetchListedProperties() {
  const [units, listings] = await Promise.all([
    listProperties({ pageSize: 100 }),
    listListings({ status: 'active', pageSize: 100 }),
  ]);
  const listingByUnit = latestActiveByUnit(listings.items);

  return units.items
    .filter((unit) => listingByUnit.has(unit.id))
    .map((unit) => ({
      id: unit.id,
      title: unit.complexName || 'VALORA property',
      location: [unit.streetAddress, unit.suburb].filter(Boolean).join(', '),
      bedrooms: unit.bedrooms,
      bathrooms: unit.bathrooms,
      unitNumber: unit.unitNo,
      sizeM2: unit.sizeM2,
      // the cover is the first photo whose image is actually available
      photo: photoSrc(unit.imageUrl || unit.photos.find((p) => p.available)?.url),
      listing: listingByUnit.get(unit.id),
    }))
    .sort((a, b) => String(b.listing.updatedAt).localeCompare(String(a.listing.updatedAt)));
}

export function isRental(property) {
  return property?.listing?.listingType === 'rent';
}

export function formatListingPrice(listing) {
  const price = Number(listing?.price);
  if (!Number.isFinite(price) || price <= 0) return 'Price on request';
  const formatted = `R${price.toLocaleString('en-ZA')}`;
  return listing.listingType === 'rent' ? `${formatted} / month` : formatted;
}
