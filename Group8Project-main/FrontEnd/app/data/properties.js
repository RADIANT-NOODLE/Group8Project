/*
=========================================================
VALORA PROPERTY DATA
=========================================================

This file contains the 8 units in the VALORA development.

IMPORTANT:
- Unit information is separate from listing information.
- Images are NOT hard-coded.
- Public images will only appear once approved.
- Estate Agents will eventually manage listing photos.
- HOA Admin approval controls what becomes public.

This file remains a DEFAULT EXPORT because other pages use:

import properties from "../data/properties";
=========================================================
*/

const properties = [
    {
        id: "VAL-001",

        /*
        =================================================
        UNIT INFORMATION
        =================================================
        */

        unitNumber: "Unit 01",
        propertyType: "3 Bedroom Apartment",

        bedrooms: 3,
        bathrooms: 2,

        floorArea: 120,
        floor: "Ground Floor",

        development: "VALORA Estate",
        location: "VALORA Estate",

        unitStatus: "Available",

        /*
        =================================================
        LISTING INFORMATION
        =================================================

        listingType:
        null / "For Sale" / "For Rent"

        listingStatus:
        "Not Listed"
        "Assigned"
        "Draft"
        "Pending HOA Approval"
        "Changes Requested"
        "Published"
        */

        listing: {
            listingType: null,

            askingPrice: null,
            rentalPrice: null,

            description: "",

            listingStatus: "Not Listed",

            ownerId: null,
            ownerName: null,

            assignedAgentId: null,
            assignedAgentName: null,

            hoaApprovalStatus: "Not Submitted",
        },

        /*
        =================================================
        APPROVED PUBLIC PHOTOS
        =================================================

        This MUST remain empty until an Estate Agent
        uploads photos and HOA approves them.

        */

        images: [],

        /*
        =================================================
        PENDING PHOTOS
        =================================================

        Estate Agent uploads can temporarily be stored
        here while waiting for HOA approval.

        These must NEVER appear on the public website.
        */

        pendingImages: [],

        /*
        =================================================
        PROPERTY FEATURES
        =================================================
        */

        features: [
            "3 Bedrooms",
            "2 Bathrooms",
            "Kitchen",
            "Living Area",
            "Parking",
        ],

        description:
            "A modern three-bedroom apartment within the VALORA development. Full property information and approved photographs will be published as the unit progresses through the VALORA listing process.",
    },

    {
        id: "VAL-002",

        unitNumber: "Unit 02",
        propertyType: "3 Bedroom Apartment",

        bedrooms: 3,
        bathrooms: 2,

        floorArea: 120,
        floor: "Ground Floor",

        development: "VALORA Estate",
        location: "VALORA Estate",

        unitStatus: "Available",

        listing: {
            listingType: null,

            askingPrice: null,
            rentalPrice: null,

            description: "",

            listingStatus: "Not Listed",

            ownerId: null,
            ownerName: null,

            assignedAgentId: null,
            assignedAgentName: null,

            hoaApprovalStatus: "Not Submitted",
        },

        images: [],
        pendingImages: [],

        features: [
            "3 Bedrooms",
            "2 Bathrooms",
            "Kitchen",
            "Living Area",
            "Parking",
        ],

        description:
            "A three-bedroom apartment within the VALORA development. Approved property information and photographs will be displayed once the unit has an approved listing.",
    },

    {
        id: "VAL-003",

        unitNumber: "Unit 03",
        propertyType: "4 Bedroom Apartment",

        bedrooms: 4,
        bathrooms: 2,

        floorArea: 135,
        floor: "First Floor",

        development: "VALORA Estate",
        location: "VALORA Estate",

        unitStatus: "Available",

        listing: {
            listingType: null,

            askingPrice: null,
            rentalPrice: null,

            description: "",

            listingStatus: "Not Listed",

            ownerId: null,
            ownerName: null,

            assignedAgentId: null,
            assignedAgentName: null,

            hoaApprovalStatus: "Not Submitted",
        },

        images: [],
        pendingImages: [],

        features: [
            "4 Bedrooms",
            "2 Bathrooms",
            "Kitchen",
            "Living Area",
            "Parking",
        ],

        description:
            "A spacious four-bedroom apartment within the VALORA development, offering additional accommodation for larger households.",
    },

    {
        id: "VAL-004",

        unitNumber: "Unit 04",
        propertyType: "3 Bedroom Apartment",

        bedrooms: 3,
        bathrooms: 2,

        floorArea: 120,
        floor: "First Floor",

        development: "VALORA Estate",
        location: "VALORA Estate",

        unitStatus: "Available",

        listing: {
            listingType: null,

            askingPrice: null,
            rentalPrice: null,

            description: "",

            listingStatus: "Not Listed",

            ownerId: null,
            ownerName: null,

            assignedAgentId: null,
            assignedAgentName: null,

            hoaApprovalStatus: "Not Submitted",
        },

        images: [],
        pendingImages: [],

        features: [
            "3 Bedrooms",
            "2 Bathrooms",
            "Kitchen",
            "Living Area",
            "Parking",
        ],

        description:
            "A modern three-bedroom apartment within the VALORA development.",
    },

    {
        id: "VAL-005",

        unitNumber: "Unit 05",
        propertyType: "2 Bedroom Apartment",

        bedrooms: 2,
        bathrooms: 1,

        floorArea: 85,
        floor: "Second Floor",

        development: "VALORA Estate",
        location: "VALORA Estate",

        unitStatus: "Available",

        listing: {
            listingType: null,

            askingPrice: null,
            rentalPrice: null,

            description: "",

            listingStatus: "Not Listed",

            ownerId: null,
            ownerName: null,

            assignedAgentId: null,
            assignedAgentName: null,

            hoaApprovalStatus: "Not Submitted",
        },

        images: [],
        pendingImages: [],

        features: [
            "2 Bedrooms",
            "1 Bathroom",
            "Kitchen",
            "Living Area",
            "Parking",
        ],

        description:
            "A practical two-bedroom apartment within the VALORA development, suitable for smaller households.",
    },

    {
        id: "VAL-006",

        unitNumber: "Unit 06",
        propertyType: "2 Bedroom Apartment",

        bedrooms: 2,
        bathrooms: 1,

        floorArea: 85,
        floor: "Second Floor",

        development: "VALORA Estate",
        location: "VALORA Estate",

        unitStatus: "Available",

        listing: {
            listingType: null,

            askingPrice: null,
            rentalPrice: null,

            description: "",

            listingStatus: "Not Listed",

            ownerId: null,
            ownerName: null,

            assignedAgentId: null,
            assignedAgentName: null,

            hoaApprovalStatus: "Not Submitted",
        },

        images: [],
        pendingImages: [],

        features: [
            "2 Bedrooms",
            "1 Bathroom",
            "Kitchen",
            "Living Area",
            "Parking",
        ],

        description:
            "A two-bedroom apartment within the VALORA development.",
    },

    {
        id: "VAL-007",

        unitNumber: "Unit 07",
        propertyType: "Bachelor Suite",

        bedrooms: 1,
        bathrooms: 1,

        floorArea: 55,
        floor: "Third Floor",

        development: "VALORA Estate",
        location: "VALORA Estate",

        unitStatus: "Available",

        listing: {
            listingType: null,

            askingPrice: null,
            rentalPrice: null,

            description: "",

            listingStatus: "Not Listed",

            ownerId: null,
            ownerName: null,

            assignedAgentId: null,
            assignedAgentName: null,

            hoaApprovalStatus: "Not Submitted",
        },

        images: [],
        pendingImages: [],

        features: [
            "Bachelor Suite",
            "1 Bathroom",
            "Kitchen Area",
            "Living Area",
            "Parking",
        ],

        description:
            "A compact bachelor suite within the VALORA development, designed for practical modern living.",
    },

    {
        id: "VAL-008",

        unitNumber: "Unit 08",
        propertyType: "2 Bedroom Apartment",

        bedrooms: 2,
        bathrooms: 1,

        floorArea: 85,
        floor: "Third Floor",

        development: "VALORA Estate",
        location: "VALORA Estate",

        unitStatus: "Available",

        listing: {
            listingType: null,

            askingPrice: null,
            rentalPrice: null,

            description: "",

            listingStatus: "Not Listed",

            ownerId: null,
            ownerName: null,

            assignedAgentId: null,
            assignedAgentName: null,

            hoaApprovalStatus: "Not Submitted",
        },

        images: [],
        pendingImages: [],

        features: [
            "2 Bedrooms",
            "1 Bathroom",
            "Kitchen",
            "Living Area",
            "Parking",
        ],

        description:
            "A two-bedroom apartment within the VALORA development.",
    },
];

/*
=========================================================
DEFAULT EXPORT
=========================================================
*/

export default properties;
