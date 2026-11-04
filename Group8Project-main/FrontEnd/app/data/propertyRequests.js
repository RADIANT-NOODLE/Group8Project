/* =========================================================
   VALORA PROPERTY REQUESTS (Sell / Rent)

   These used to live in localStorage, which meant a request
   made by a resident was never visible to the HOA admin or the
   estate agent (each browser had its own copy). They now come
   from the API; this module keeps the names the pages already
   use so the screens only have to `await` them.
========================================================= */

import {
    approvePropertyRequest as apiApprove,
    assignEstateAgent as apiAssignAgent,
    createPropertyRequest as apiCreate,
    listPropertyRequests,
    rejectPropertyRequest as apiReject,
} from "../services/propertyRequestApi";
import { getProperties, saveProperties } from "./propertyStorage";

/** Every request the signed-in user may see (the API scopes it by role). */
export async function getPropertyRequests() {
    const { items } = await listPropertyRequests({ pageSize: 100 });
    return items;
}

export async function getPendingHOARequests() {
    const { items } = await listPropertyRequests({ status: "pending_review", pageSize: 100 });
    return items;
}

export function createPropertyRequest(requestData) {
    return apiCreate({
        unitId: requestData.unitId ?? requestData.propertyId,
        requestType: requestData.requestType,
        askingPrice: requestData.askingPrice,
        rentalPeriod: requestData.rentalPeriod,
        financialInformation: requestData.financialInformation,
        additionalDetails: requestData.additionalDetails,
    });
}

export function approvePropertyRequest(requestId) {
    return apiApprove(requestId);
}

export function rejectPropertyRequest(requestId, reason) {
    return apiReject(requestId, reason || "Property request was not approved.");
}

export function assignEstateAgent(requestId, agentId) {
    return apiAssignAgent(requestId, agentId);
}

/**
 * The agent screens edit listing text and photos in the local property store
 * (there is no listing-photo API yet). A request now points at a database unit,
 * so make sure a local record exists for it and return that record.
 */
export function ensureLocalPropertyForRequest(request) {
    if (!request?.propertyId) return null;

    const existing = getProperties();
    const found = existing.find((property) => String(property.id) === String(request.propertyId));
    if (found) return found;

    const created = {
        id: String(request.propertyId),
        unitNumber: request.unitNo ? `Unit ${request.unitNo}` : `Unit ${request.propertyId}`,
        propertyType: request.propertyType || "Apartment",
        bedrooms: request.bedrooms === "" ? null : request.bedrooms,
        bathrooms: request.bathrooms === "" ? null : request.bathrooms,
        floorArea: request.propertySize || "",
        development: request.complexName || "VALORA Estate",
        location: request.propertyAddress || request.complexName || "VALORA Estate",
        unitStatus: "Available",
        images: [],
        listing: {
            listingType: request.requestType === "Rent" ? "For Rent" : "For Sale",
            listingStatus: "Assigned",
            ownerId: request.requesterId,
            ownerName: request.requesterName,
        },
    };

    saveProperties([...existing, created]);
    return created;
}
