/**
 * Listing photos an estate agent adds in Edit Listings are first kept in the
 * agent's browser. This sends them to the backend (stored in the shared
 * database), so the public site shows them on every device.
 *
 * Each photo is uploaded once and then marked `uploaded`, so calling this
 * again (on every publish, or when the agent pages open) never duplicates.
 */
import { getProperties, updateProperty } from '../data/propertyStorage';
import { uploadPropertyPhoto } from './propertyApi.js';

/* Photos being uploaded right now. Moving between the agent pages can start a
   second sync before the first finishes; this stops a photo going up twice. */
const inFlight = new Set();

/** Photos of a stored property that still have to reach the backend. */
function unsyncedPhotos(property) {
  return (property?.images || []).filter(
    (image) =>
      image && typeof image === 'object' && image.data && !image.uploaded && !inFlight.has(image.id),
  );
}

/**
 * Upload a property's unsent photos, in order (the first becomes the cover
 * when the property has no other photo).
 * Returns { property, uploaded, failed, error }; `property` is the updated
 * stored copy (or the original when nothing changed).
 */
export async function syncListingPhotos(property) {
  const pending = unsyncedPhotos(property);
  if (pending.length === 0) return { property, uploaded: 0, failed: 0, error: '' };

  const unitId = Number(property.id);
  const uploadedIds = [];
  let error = '';

  pending.forEach((image) => inFlight.add(image.id));
  try {
    for (const image of pending) {
      try {
        const blob = await (await fetch(image.data)).blob();
        const file = new File([blob], image.name || 'photo.jpg', { type: image.type || blob.type });
        await uploadPropertyPhoto(unitId, file);
        uploadedIds.push(image.id);
      } catch (uploadError) {
        console.error('Could not upload a listing photo:', uploadError);
        error = uploadError?.message || '';
      }
    }
  } finally {
    pending.forEach((image) => inFlight.delete(image.id));
  }

  let updated = property;
  if (uploadedIds.length > 0) {
    // re-read: the stored copy may have changed while uploading
    const latest = (getProperties() || []).find((item) => item.id === property.id) || property;
    updated =
      updateProperty(property.id, {
        images: (latest.images || []).map((image) =>
          image && uploadedIds.includes(image.id) ? { ...image, uploaded: true } : image,
        ),
      }) || property;
  }

  return {
    property: updated,
    uploaded: uploadedIds.length,
    failed: pending.length - uploadedIds.length,
    error,
  };
}

/**
 * Upload unsent photos of every published listing this agent handles.
 * Used when the agent pages open, so photos added before photo upload
 * existed still reach the public site. Returns how many were uploaded.
 */
export async function syncPublishedListingPhotos(agentId) {
  const mine = (getProperties() || []).filter(
    (property) =>
      property?.listing?.listingStatus === 'Published' &&
      String(property.listing.assignedAgentId) === String(agentId) &&
      unsyncedPhotos(property).length > 0,
  );

  let uploaded = 0;
  for (const property of mine) {
    uploaded += (await syncListingPhotos(property)).uploaded;
  }
  return uploaded;
}
