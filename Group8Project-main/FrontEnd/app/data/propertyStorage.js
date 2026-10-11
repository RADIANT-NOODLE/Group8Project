import properties from "./properties";

/*
=========================================================
VALORA PROPERTY STORAGE
=========================================================

This file creates one shared property data source for VALORA.

The original property information comes from:
src/data/properties.js

A copy is stored in localStorage so that changes made by
different parts of the system can persist after refresh.

Storage key:
valoraProperties

IMPORTANT:
- Unit information is preserved.
- Listing information is preserved.
- Approved images are preserved.
- Pending images are preserved.
- Nested listing updates are merged safely.
=========================================================
*/

const STORAGE_KEY = "valoraProperties";

/*
=========================================================
GET ALL PROPERTIES
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

    /*
    -----------------------------------------------------
    FIRST LOAD
    -----------------------------------------------------
    */

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
SAVE ALL PROPERTIES
=========================================================
*/

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

/*
=========================================================
GET ONE PROPERTY
=========================================================
*/

export function getPropertyById(propertyId) {
    if (!propertyId) {
        return null;
    }

    const allProperties = getProperties();

    return (
        allProperties.find(
            (property) => property.id === propertyId
        ) || null
    );
}

/*
=========================================================
UPDATE ONE PROPERTY
=========================================================

Updates the selected property while preserving all
existing information.

If "listing" is included in the updates, it is MERGED
with the existing listing instead of replacing it.

This is important because the VALORA workflow uses the
same property record across:

Resident / Investor
        ↓
Request to Sell / Rent
        ↓
HOA Review
        ↓
Estate Agent Assignment
        ↓
Agent Listing
        ↓
HOA Property Approval
        ↓
Published Listing
=========================================================
*/

export function updateProperty(propertyId, updates = {}) {
    const allProperties = getProperties();

    const updatedProperties = allProperties.map((property) => {
        if (property.id !== propertyId) {
            return property;
        }

        /*
        -------------------------------------------------
        MERGE NESTED LISTING DATA
        -------------------------------------------------
        */

        const updatedListing =
            updates.listing !== undefined
                ? {
                      ...(property.listing || {}),
                      ...(updates.listing || {}),
                  }
                : property.listing;

        /*
        -------------------------------------------------
        UPDATE PROPERTY
        -------------------------------------------------
        */

        return {
            ...property,
            ...updates,
            listing: updatedListing,
        };
    });

    saveProperties(updatedProperties);

    return (
        updatedProperties.find(
            (property) => property.id === propertyId
        ) || null
    );
}

/*
=========================================================
RESET PROPERTY STORAGE
=========================================================

Useful during development if you want to remove test
changes and return to the original properties.js data.

WARNING:
This removes all current property workflow changes,
including:

- Listing information
- Assigned owners
- Assigned Estate Agents
- Approved photos
- Pending photos
- HOA approval statuses
=========================================================
*/

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
DEFAULT EXPORT
=========================================================
*/

export default {
    getProperties,
    saveProperties,
    getPropertyById,
    updateProperty,
    resetProperties,
};
