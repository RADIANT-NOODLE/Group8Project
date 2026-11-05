
import properties from "./properties";

/*
=========================================================
VALORA PROPERTY STORAGE
=========================================================

Current stage: Frontend development.

Existing frontend features can continue using localStorage.
Property Management uses getPropertiesForManagement(),
which returns no records until the backend is connected.

When the backend is ready, replace the implementation of
getPropertiesForManagement() with the real API request.

=========================================================
*/

const STORAGE_KEY = "valoraProperties";

/*
=========================================================
EXISTING FRONTEND STORAGE
Kept for compatibility with other VALORA pages.
=========================================================
*/

export function getProperties() {
    const storedProperties = localStorage.getItem(STORAGE_KEY);

    if (storedProperties) {
        try {
            const parsedProperties = JSON.parse(storedProperties);

            if (Array.isArray(parsedProperties)) {
                return parsedProperties;
            }

            console.warn(
                "VALORA property storage does not contain a valid property list."
            );
        } catch (error) {
            console.error(
                "Unable to read VALORA property storage:",
                error
            );
        }
    }

    const initialProperties = JSON.parse(
        JSON.stringify(properties)
    );

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(initialProperties)
    );

    return initialProperties;
}

export function saveProperties(updatedProperties) {
    if (!Array.isArray(updatedProperties)) {
        console.error(
            "Unable to save VALORA properties: expected an array."
        );

        return [];
    }

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedProperties)
    );

    return updatedProperties;
}

export function getPropertyById(propertyId) {
    if (!propertyId) {
        return null;
    }

    const allProperties = getProperties();

    return (
        allProperties.find(
            property => property.id === propertyId
        ) || null
    );
}

export function updateProperty(propertyId, updates = {}) {
    const allProperties = getProperties();

    const updatedProperties = allProperties.map(property => {
        if (property.id !== propertyId) {
            return property;
        }

        const updatedListing =
            updates.listing !== undefined
                ? {
                    ...(property.listing || {}),
                    ...(updates.listing || {}),
                }
                : property.listing;

        return {
            ...property,
            ...updates,
            listing: updatedListing,
        };
    });

    try {
        saveProperties(updatedProperties);
    } catch (error) {
        if (error?.name !== "QuotaExceededError") throw error;

        // The browser's storage is small. This property's photos are still held
        // in the returned copy, ready to upload, so the stored copy can go without.
        saveProperties(
            updatedProperties.map(property =>
                withoutPhotoData(property, property.id === propertyId)
            )
        );
    }

    return (
        updatedProperties.find(
            property => property.id === propertyId
        ) || null
    );
}

function withoutPhotoData(property, includeUnsent) {
    const lighten = (images) =>
        Array.isArray(images)
            ? images.map(image => {
                if (!image?.data || !(includeUnsent || image.uploaded)) return image;
                const { data, ...rest } = image;
                return rest;
            })
            : images;

    return {
        ...property,
        images: lighten(property.images),
        pendingImages: lighten(property.pendingImages),
    };
}

export function resetProperties() {
    localStorage.removeItem(STORAGE_KEY);

    const initialProperties = JSON.parse(
        JSON.stringify(properties)
    );

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(initialProperties)
    );

    return initialProperties;
}

/*
=========================================================
PROPERTY MANAGEMENT DATA SOURCE
=========================================================

This function intentionally returns an empty array for now.

It does NOT:
- Load sample properties.
- Seed localStorage with demo properties.
- Assume that a backend endpoint already exists.

Backend integration can replace this function without
requiring PropertyManagement.jsx to be rewritten.
=========================================================
*/

export async function getPropertiesForManagement() {
    // TODO: Replace with the backend API request when available.
    // Example future implementation:
    //
    // const response = await fetch(`${API_BASE_URL}/properties`);
    //
    // if (!response.ok) {
    //     throw new Error("Unable to load properties.");
    // }
    //
    // const data = await response.json();
    // return Array.isArray(data) ? data : data.properties || [];

    return [];
}

export default {
    getProperties,
    saveProperties,
    getPropertyById,
    updateProperty,
    resetProperties,
    getPropertiesForManagement,
};
