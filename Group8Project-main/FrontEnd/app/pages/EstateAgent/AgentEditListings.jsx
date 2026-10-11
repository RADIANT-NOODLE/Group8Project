import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    getProperties,
    updateProperty,
} from "../../data/propertyStorage";

import {
    getPropertyRequests,
} from "../../data/propertyRequests";

import * as authService from "../../services/authService.js";
import { getSessionUser } from "../../services/session.js";
import ConfirmPrompt from "../../components/ConfirmPrompt";
import "./AgentEditListings.css";


/*
=========================================================
VALORA AGENT EDIT LISTINGS
=========================================================
*/

function AgentEditListings() {

    const navigate = useNavigate();

    const [properties, setProperties] =
        useState([]);

    const [assignedRequests, setAssignedRequests] =
        useState([]);

    const [selectedPropertyId, setSelectedPropertyId] =
        useState(null);

    const [editingProperty, setEditingProperty] =
        useState(null);

    const [editingRequest, setEditingRequest] =
        useState(null);

    const [formData, setFormData] = useState({
        listingType: "",
        askingPrice: "",
        rentalPrice: "",
        description: "",
    });

    const [selectedFiles, setSelectedFiles] =
        useState([]);

    /* The listing awaiting removal confirmation. This used to
       be a browser window.confirm dialog. */

    const [pendingRemoval, setPendingRemoval] =
        useState(null);

    const [message, setMessage] =
        useState("");


    /*
    =========================================================
    ICONS
    =========================================================
    */

    const Icon = ({
        name,
        size = 18,
    }) => {

        const commonProps = {
            width: size,
            height: size,
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "1.8",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            "aria-hidden": "true",
        };


        switch (name) {

            case "dashboard":

                return (
                    <svg {...commonProps}>
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                );


            case "property":

                return (
                    <svg {...commonProps}>
                        <path d="M3 10.5 12 3l9 7.5" />
                        <path d="M5 9.5V21h14V9.5" />
                        <path d="M9 21v-6h6v6" />
                    </svg>
                );


            case "edit":

                return (
                    <svg {...commonProps}>
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                    </svg>
                );


            case "inquiries":

                return (
                    <svg {...commonProps}>
                        <path d="M4 5h16v11H8l-4 4Z" />
                        <path d="M8 9h8" />
                        <path d="M8 13h5" />
                    </svg>
                );


            case "valuation":

                return (
                    <svg {...commonProps}>
                        <path d="M4 19V9" />
                        <path d="M10 19V5" />
                        <path d="M16 19v-8" />
                        <path d="M22 19V3" />
                    </svg>
                );


            case "logout":

                return (
                    <svg {...commonProps}>
                        <path d="M10 17l5-5-5-5" />
                        <path d="M15 12H3" />
                        <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
                    </svg>
                );


            case "close":

                return (
                    <svg {...commonProps}>
                        <path d="m6 6 12 12" />
                        <path d="m18 6-12 12" />
                    </svg>
                );


            case "upload":

                return (
                    <svg {...commonProps}>
                        <path d="M12 16V4" />
                        <path d="m7 9 5-5 5 5" />
                        <path d="M5 20h14" />
                    </svg>
                );


            case "check":

                return (
                    <svg {...commonProps}>
                        <path d="m5 12 4 4L19 6" />
                    </svg>
                );


            case "trash":

                return (
                    <svg {...commonProps}>
                        <path d="M4 7h16" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                        <path d="M6 7l1 14h10l1-14" />
                        <path d="M9 7V4h6v3" />
                    </svg>
                );


            default:

                return null;
        }

    };


    /*
    =========================================================
    GET CURRENT ESTATE AGENT
    =========================================================
    */

    const getCurrentAgent = () => {

        try {

            return getSessionUser();

        } catch (error) {

            console.error(
                "Unable to read current VALORA user:",
                error
            );

            return null;
        }

    };


    /*
    =========================================================
    GET AGENT NAME
    =========================================================
    */

    const getAgentName = (
        user
    ) => {

        if (!user) {
            return "";
        }

        const fullName =
            `${user.firstName || ""} ${
                user.lastName || ""
            }`.trim();

        return (
            fullName ||
            user.name ||
            user.fullName ||
            ""
        );

    };


    /*
    =========================================================
    LOAD ASSIGNED PROPERTIES
    =========================================================
    */

    const loadAssignedProperties = () => {

        const currentUser =
            getCurrentAgent();

        if (!currentUser) {

            setProperties([]);
            setAssignedRequests([]);

            return;
        }

        const allProperties =
            getProperties();

        const allRequests =
            getPropertyRequests();

        const currentAgentName =
            getAgentName(
                currentUser
            );


        const agentRequests =
            allRequests.filter(
                (request) => {

                    const assignedById =
                        request.assignedAgentId &&
                        request.assignedAgentId ===
                            currentUser.id;

                    const assignedByName =
                        request.assignedAgentName &&
                        request.assignedAgentName ===
                            currentAgentName;

                    return (
                        assignedById ||
                        assignedByName
                    );

                }
            );


        const assignedProperties =
            agentRequests
                .map(
                    (request) => {

                        const property =
                            allProperties.find(
                                (item) =>
                                    item.id ===
                                    request.propertyId
                            );

                        if (!property) {
                            return null;
                        }

                        return property;

                    }
                )
                .filter(Boolean);


        const uniqueProperties = [];

        assignedProperties.forEach(
            (property) => {

                const alreadyExists =
                    uniqueProperties.some(
                        (item) =>
                            item.id ===
                            property.id
                    );

                if (!alreadyExists) {

                    uniqueProperties.push(
                        property
                    );

                }

            }
        );

        setProperties(
            uniqueProperties
        );

        setAssignedRequests(
            agentRequests
        );

    };


    /*
    =========================================================
    INITIAL LOAD
    =========================================================
    */

    useEffect(() => {

        loadAssignedProperties();

    }, []);


    /*
    =========================================================
    GET REQUEST FOR PROPERTY
    =========================================================
    */

    const getRequestForProperty = (
        propertyId
    ) => {

        return (
            assignedRequests.find(
                (request) =>
                    request.propertyId ===
                    propertyId
            ) || null
        );

    };


    /*
    =========================================================
    SELECT PROPERTY
    =========================================================
    */

    const handleEdit = (
        property
    ) => {

        const request =
            getRequestForProperty(
                property.id
            );


        if (!request) {

            setMessage(
                "This property has not been assigned to you by the HOA."
            );

            return;
        }


        setSelectedPropertyId(
            property.id
        );

        setEditingProperty(
            property
        );

        setEditingRequest(
            request
        );


        setFormData({
            listingType:
                property.listing?.listingType ||
                request.requestType ||
                "",

            askingPrice:
                property.listing?.askingPrice ||
                request.askingPrice ||
                "",

            rentalPrice:
                property.listing?.rentalPrice ||
                "",

            description:
                property.listing?.description ||
                "",
        });

        setSelectedFiles([]);

        setMessage("");

    };


    /*
    =========================================================
    CLOSE EDITOR
    =========================================================
    */

    const handleCancel = () => {

        setSelectedPropertyId(
            null
        );

        setEditingProperty(
            null
        );

        setEditingRequest(
            null
        );

        setSelectedFiles([]);

        setMessage("");

    };


    /*
    =========================================================
    FORM CHANGE
    =========================================================
    */

    const handleChange = (
        event
    ) => {

        const {
            name,
            value,
        } = event.target;

        setFormData(
            (current) => ({
                ...current,
                [name]: value,
            })
        );

    };


    /*
    =========================================================
    FILE TO BASE64
    =========================================================
    */

    const fileToBase64 = (
        file
    ) => {

        return new Promise(
            (
                resolve,
                reject
            ) => {

                const reader =
                    new FileReader();

                reader.onload = () =>
                    resolve(
                        reader.result
                    );

                reader.onerror = () =>
                    reject(
                        new Error(
                            "Unable to read image."
                        )
                    );

                reader.readAsDataURL(
                    file
                );

            }
        );

    };


    /*
    =========================================================
    SELECT PHOTOS
    =========================================================
    */

    const handlePhotoSelect = async (
        event
    ) => {

        const files =
            Array.from(
                event.target.files || []
            );

        if (
            files.length === 0
        ) {
            return;
        }


        const imageFiles =
            files.filter(
                (file) =>
                    file.type.startsWith(
                        "image/"
                    )
            );


        if (
            imageFiles.length === 0
        ) {

            setMessage(
                "Please select image files only."
            );

            return;
        }


        try {

            const convertedImages =
                await Promise.all(
                    imageFiles.map(
                        async (
                            file
                        ) => {

                            const base64 =
                                await fileToBase64(
                                    file
                                );

                            return {
                                id:
                                    `IMG-${Date.now()}-${Math.random()
                                        .toString(36)
                                        .substring(
                                            2,
                                            9
                                        )}`,

                                name:
                                    file.name,

                                type:
                                    file.type,

                                size:
                                    file.size,

                                data:
                                    base64,
                            };

                        }
                    )
                );


            setSelectedFiles(
                (current) => [
                    ...current,
                    ...convertedImages,
                ]
            );


            setMessage(
                `${convertedImages.length} photo${
                    convertedImages.length === 1
                        ? ""
                        : "s"
                } selected and ready for HOA submission.`
            );

        } catch (error) {

            console.error(
                error
            );

            setMessage(
                "Unable to process the selected photos."
            );

        }

        event.target.value = "";

    };


    /*
    =========================================================
    REMOVE SELECTED PHOTO
    =========================================================
    */

    const removeSelectedPhoto = (
        imageId
    ) => {

        setSelectedFiles(
            (current) =>
                current.filter(
                    (image) =>
                        image.id !==
                        imageId
                )
        );

    };


    /*
    =========================================================
    REMOVE APPROVED PHOTO
    =========================================================
    */

    const removeApprovedPhoto = (
        imageId
    ) => {

        if (!editingProperty) {
            return;
        }


        const request =
            getRequestForProperty(
                editingProperty.id
            );


        if (!request) {

            setMessage(
                "This property is no longer assigned to you."
            );

            return;
        }


        const currentImages =
            editingProperty.images ||
            [];


        const existingRemovals =
            editingProperty.pendingPhotoRemovals ||
            [];


        const imageToRemove =
            currentImages.find(
                (image) => {

                    if (
                        typeof image ===
                        "string"
                    ) {

                        return (
                            image ===
                            imageId
                        );

                    }

                    return (
                        image.id ===
                        imageId
                    );

                }
            );


        if (!imageToRemove) {

            setMessage(
                "The selected photo could not be found."
            );

            return;
        }


        const alreadyPending =
            existingRemovals.some(
                (image) => {

                    if (
                        typeof image ===
                        "string"
                    ) {

                        return (
                            image ===
                            imageId
                        );

                    }

                    if (
                        typeof imageToRemove ===
                        "string"
                    ) {

                        return false;

                    }

                    return (
                        image.id ===
                        imageToRemove.id
                    );

                }
            );


        if (alreadyPending) {

            setMessage(
                "This photo is already marked for removal and is awaiting HOA approval."
            );

            return;
        }


        const updatedPendingRemovals = [
            ...existingRemovals,
            imageToRemove,
        ];


        const updatedProperty =
            updateProperty(
                editingProperty.id,
                {

                    pendingPhotoRemovals:
                        updatedPendingRemovals,

                    listing: {
                        ...(
                            editingProperty.listing ||
                            {}
                        ),

                        listingStatus:
                            "Pending HOA Approval",

                        hoaApprovalStatus:
                            "Pending Review",

                        hoaReviewMessage:
                            "An approved property photo has been marked for removal by the assigned Estate Agent and requires HOA review.",
                    },

                }
            );


        setEditingProperty(
            updatedProperty
        );


        setProperties(
            (current) =>
                current.map(
                    (property) =>
                        property.id ===
                        updatedProperty.id
                            ? updatedProperty
                            : property
                )
        );


        setMessage(
            "Photo removal has been submitted for HOA approval. The current public photo will remain visible until the HOA approves the change."
        );

    };


    /*
    =========================================================
    SAVE LISTING + SUBMIT PHOTOS
    =========================================================
    */

    const handleSave = async (
        event
    ) => {

        event.preventDefault();


        if (!editingProperty) {
            return;
        }


        const currentUser =
            getCurrentAgent();


        if (!currentUser) {

            setMessage(
                "Your Estate Agent session could not be found. Please log in again."
            );

            return;
        }


        const request =
            getRequestForProperty(
                editingProperty.id
            );


        if (!request) {

            setMessage(
                "You cannot edit this property because it is not assigned to you."
            );

            return;
        }


        if (!formData.listingType) {

            setMessage(
                "Please select whether the property is For Sale or For Rent."
            );

            return;
        }


        if (
            formData.listingType ===
                "For Sale" &&
            !formData.askingPrice
        ) {

            setMessage(
                "Please enter the asking price."
            );

            return;
        }


        if (
            formData.listingType ===
                "For Rent" &&
            !formData.rentalPrice
        ) {

            setMessage(
                "Please enter the rental price."
            );

            return;
        }


        const existingPendingImages =
            editingProperty.pendingImages ||
            [];


        const updatedPendingImages = [
            ...existingPendingImages,
            ...selectedFiles,
        ];


        const pendingPhotoRemovals =
            editingProperty.pendingPhotoRemovals ||
            [];


        const updatedListing = {
            ...(
                editingProperty.listing ||
                {}
            ),

            listingType:
                formData.listingType,

            askingPrice:
                formData.listingType ===
                    "For Sale"
                    ? Number(
                        formData.askingPrice
                    )
                    : null,

            rentalPrice:
                formData.listingType ===
                    "For Rent"
                    ? Number(
                        formData.rentalPrice
                    )
                    : null,

            description:
                formData.description,

            ownerId:
                request.requesterId ||
                editingProperty.listing?.ownerId ||
                null,

            ownerName:
                request.requesterName ||
                editingProperty.listing?.ownerName ||
                null,

            assignedAgentId:
                currentUser.id,

            assignedAgentName:
                getAgentName(
                    currentUser
                ),

            listingStatus:
                "Pending HOA Approval",

            hoaApprovalStatus:
                "Pending Review",

            hoaReviewMessage:
                "Listing changes submitted by the assigned Estate Agent and awaiting HOA approval.",
        };


        const updatedProperty =
            updateProperty(
                editingProperty.id,
                {

                    listing:
                        updatedListing,

                    pendingImages:
                        updatedPendingImages,

                    pendingPhotoRemovals:
                        pendingPhotoRemovals,

                }
            );


        setProperties(
            (current) =>
                current.map(
                    (property) =>
                        property.id ===
                        updatedProperty.id
                            ? updatedProperty
                            : property
                )
        );


        setEditingProperty(
            updatedProperty
        );


        setSelectedFiles([]);


        setMessage(
            "Listing changes and photos have been submitted to the HOA for approval."
        );

    };


    /*
    =========================================================
    REMOVE LISTING DETAILS
    =========================================================
    */

    const handleRemoveListing = (
        property
    ) => {

        const request =
            getRequestForProperty(
                property.id
            );


        if (!request) {

            setMessage(
                "You cannot remove this listing because the property is not assigned to you."
            );

            return;
        }


        setMessage("");

        setPendingRemoval(property);
    };


    const confirmRemoveListing = () => {

        const property =
            pendingRemoval;

        setPendingRemoval(null);


        const updatedProperty =
            updateProperty(
                property.id,
                {

                    listing: {
                        ...(
                            property.listing ||
                            {}
                        ),

                        listingType:
                            null,

                        askingPrice:
                            null,

                        rentalPrice:
                            null,

                        description:
                            "",

                        listingStatus:
                            "Not Listed",

                        hoaApprovalStatus:
                            "Not Submitted",

                        hoaReviewMessage:
                            "",

                    },

                    pendingImages:
                        [],

                    pendingPhotoRemovals:
                        [],

                }
            );


        setProperties(
            (current) =>
                current.map(
                    (item) =>
                        item.id ===
                        updatedProperty.id
                            ? updatedProperty
                            : item
                )
        );


        if (
            selectedPropertyId ===
            property.id
        ) {

            setEditingProperty(
                updatedProperty
            );

            setFormData({
                listingType: "",
                askingPrice: "",
                rentalPrice: "",
                description: "",
            });

            setSelectedFiles([]);

        }


        setMessage(
            "Listing information has been removed. The property unit remains in VALORA."
        );

    };


    /*
    =========================================================
    PROPERTY STATUS
    =========================================================
    */

    const getListingStatus = (
        property
    ) => {

        return (
            property.listing
                ?.listingStatus ||
            "Not Listed"
        );

    };


    /*
    =========================================================
    PROPERTY PRICE
    =========================================================
    */

    const getPrice = (
        property
    ) => {

        const listing =
            property.listing ||
            {};


        if (
            listing.listingType ===
            "For Sale"
        ) {

            return listing.askingPrice
                ? `R${Number(
                    listing.askingPrice
                ).toLocaleString()}`
                : "Price not set";

        }


        if (
            listing.listingType ===
            "For Rent"
        ) {

            return listing.rentalPrice
                ? `R${Number(
                    listing.rentalPrice
                ).toLocaleString()} / month`
                : "Rental price not set";

        }


        return "Not Listed";

    };


    /*
    =========================================================
    APPROVED IMAGE COUNT
    =========================================================
    */

    const getApprovedImageCount = (
        property
    ) => {

        return (
            property.images ||
            []
        ).length;

    };


    /*
    =========================================================
    PENDING IMAGE COUNT
    =========================================================
    */

    const getPendingImageCount = (
        property
    ) => {

        return (
            property.pendingImages ||
            []
        ).length;

    };


    /*
    =========================================================
    PENDING PHOTO REMOVAL COUNT
    =========================================================
    */

    const getPendingPhotoRemovalCount = (
        property
    ) => {

        return (
            property.pendingPhotoRemovals ||
            []
        ).length;

    };


    /*
    =========================================================
    REQUEST STATUS
    =========================================================
    */

    const getRequestStatus = (
        property
    ) => {

        const request =
            getRequestForProperty(
                property.id
            );

        return (
            request?.status ||
            "Assigned"
        );

    };


    /*
    =========================================================
    CURRENT AGENT
    =========================================================
    */

    const currentAgent =
        getCurrentAgent();

    const currentAgentName =
        getAgentName(
            currentAgent
        );


    /*
    =========================================================
    LOGOUT
    =========================================================
    */

    const handleLogout = () => {

        authService.logout();

        authService.logout();

        navigate("/login");

    };


    /*
    =========================================================
    RENDER
    =========================================================
    */

    return (

        <div className="agent-edit-layout">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="agent-edit-sidebar">

                <div className="agent-edit-brand">

                    <img
                        src="/assets/valora-logo.svg"
                        alt="VALORA"
                    />

                </div>


                <div className="agent-edit-user">

                    <div className="agent-edit-avatar">
                        {currentAgentName
                            ? currentAgentName
                                .charAt(0)
                                .toUpperCase()
                            : "E"}
                    </div>

                    <div className="agent-edit-user-info">

                        <strong>
                            {
                                currentAgentName ||
                                "Estate Agent"
                            }
                        </strong>

                        <span>
                            Estate Agent
                        </span>

                    </div>

                </div>


                <nav className="agent-edit-nav">

                    <Link to="/dashboard">

                        <Icon
                            name="dashboard"
                        />

                        <span>
                            Dashboard
                        </span>

                    </Link>


                    <Link to="/agent-listings">

                        <Icon
                            name="property"
                        />

                        <span>
                            My Listings
                        </span>

                    </Link>


                    <Link
                        to="/agent-edit-listings"
                        className="active"
                    >

                        <Icon
                            name="edit"
                        />

                        <span>
                            Edit Listings
                        </span>

                    </Link>


                    <Link to="/agent-inquiries">

                        <Icon
                            name="inquiries"
                        />

                        <span>
                            Inquiry Log
                        </span>

                    </Link>


                    <Link to="/valuation">

                        <Icon
                            name="valuation"
                        />

                        <span>
                            AI Valuation
                        </span>

                    </Link>

                </nav>


                <div className="agent-edit-sidebar-bottom">

                    <button
                        type="button"
                        onClick={
                            handleLogout
                        }
                    >

                        <Icon
                            name="logout"
                        />

                        <span>
                            Logout
                        </span>

                    </button>

                </div>

            </aside>


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="agent-edit-main">

                {/* =================================================
                    TOP BAR
                ================================================= */}

                <header className="agent-edit-topbar">

                    <div>

                        <h1>
                            Edit Listings
                        </h1>

                        <p>
                            Update assigned property listings
                            and submit changes for HOA approval.
                        </p>

                    </div>


                    <div className="agent-edit-profile">

                        <div className="agent-edit-profile-avatar">
                            {currentAgentName
                                ? currentAgentName
                                    .charAt(0)
                                    .toUpperCase()
                                : "E"}
                        </div>

                        <div>

                            <strong>
                                {
                                    currentAgentName ||
                                    "Estate Agent"
                                }
                            </strong>

                            <span>
                                Estate Agent
                            </span>

                        </div>

                    </div>

                </header>


                {/* =================================================
                    CONTENT
                ================================================= */}

                <div className="agent-edit-content">

                    {/* =================================================
                        MESSAGE
                    ================================================= */}

                    <ConfirmPrompt
                        open={Boolean(pendingRemoval)}
                        tone="danger"
                        title="Remove this listing?"
                        description={
                            `Remove the listing information for ${pendingRemoval?.unitNumber ?? "this unit"}? The unit itself will not be deleted.`
                        }
                        confirmLabel="Remove listing"
                        onConfirm={confirmRemoveListing}
                        onCancel={() =>
                            setPendingRemoval(null)
                        }
                    />


                    {message && (

                        <div className="agent-edit-message">

                            <div className="agent-edit-message-icon">
                                <Icon
                                    name="check"
                                    size={19}
                                />
                            </div>

                            <p>
                                {message}
                            </p>

                        </div>

                    )}


                    {/* =================================================
                        STATS
                    ================================================= */}

                    <div className="agent-edit-stats">

                        <div className="agent-edit-stat-card">

                            <span>
                                Assigned Properties
                            </span>

                            <strong>
                                {
                                    properties.length
                                }
                            </strong>

                        </div>


                        <div className="agent-edit-stat-card">

                            <span>
                                Published
                            </span>

                            <strong>
                                {
                                    properties.filter(
                                        (property) =>
                                            getListingStatus(
                                                property
                                            ) ===
                                            "Published"
                                    ).length
                                }
                            </strong>

                        </div>


                        <div className="agent-edit-stat-card">

                            <span>
                                Pending Approval
                            </span>

                            <strong>
                                {
                                    properties.filter(
                                        (property) =>
                                            getListingStatus(
                                                property
                                            ) ===
                                            "Pending HOA Approval"
                                    ).length
                                }
                            </strong>

                        </div>


                        <div className="agent-edit-stat-card">

                            <span>
                                Pending Photos
                            </span>

                            <strong>
                                {
                                    properties.reduce(
                                        (
                                            total,
                                            property
                                        ) =>
                                            total +
                                            getPendingImageCount(
                                                property
                                            ),
                                        0
                                    )
                                }
                            </strong>

                        </div>

                    </div>


                    {/* =================================================
                        PROPERTY LIST
                    ================================================= */}

                    <section className="agent-edit-card">

                        <div className="agent-edit-card-header">

                            <div>

                                <h2>
                                    My Assigned Properties
                                </h2>

                                <p>
                                    Properties assigned to you
                                    by the HOA.
                                </p>

                            </div>

                        </div>


                        <div className="agent-edit-table-wrapper">

                            <table className="agent-edit-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Unit
                                        </th>

                                        <th>
                                            Property Type
                                        </th>

                                        <th>
                                            Owner / Requester
                                        </th>

                                        <th>
                                            Listing
                                        </th>

                                        <th>
                                            Price
                                        </th>

                                        <th>
                                            Photos
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Actions
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {properties.length ===
                                    0 ? (

                                        <tr>

                                            <td
                                                colSpan="8"
                                                className="agent-edit-empty-cell"
                                            >

                                                <div className="agent-edit-empty">

                                                    <div className="agent-edit-empty-icon">

                                                        <Icon
                                                            name="property"
                                                            size={26}
                                                        />

                                                    </div>

                                                    <strong>
                                                        No properties assigned yet
                                                    </strong>

                                                    <p>
                                                        Properties will appear here
                                                        after the HOA approves a
                                                        Sell/Rent request and assigns
                                                        you as the Estate Agent.
                                                    </p>

                                                </div>

                                            </td>

                                        </tr>

                                    ) : (

                                        properties.map(
                                            (
                                                property
                                            ) => {

                                                const request =
                                                    getRequestForProperty(
                                                        property.id
                                                    );


                                                return (

                                                    <tr
                                                        key={
                                                            property.id
                                                        }
                                                    >

                                                        <td>

                                                            <strong>
                                                                {
                                                                    property.unitNumber
                                                                }
                                                            </strong>

                                                            <small>
                                                                {
                                                                    property.id
                                                                }
                                                            </small>

                                                        </td>


                                                        <td>
                                                            {
                                                                property.propertyType
                                                            }
                                                        </td>


                                                        <td>

                                                            <strong>
                                                                {
                                                                    request?.requesterName ||
                                                                    property.listing?.ownerName ||
                                                                    "Not available"
                                                                }
                                                            </strong>

                                                            <small>
                                                                {
                                                                    request?.requestType ||
                                                                    property.listing?.listingType ||
                                                                    "Request"
                                                                }
                                                            </small>

                                                        </td>


                                                        <td>
                                                            {
                                                                property
                                                                    .listing
                                                                    ?.listingType ||
                                                                request?.requestType ||
                                                                "Not Listed"
                                                            }
                                                        </td>


                                                        <td>
                                                            {
                                                                getPrice(
                                                                    property
                                                                )
                                                            }
                                                        </td>


                                                        <td>

                                                            <div className="agent-edit-photo-count">

                                                                <span>
                                                                    {
                                                                        getApprovedImageCount(
                                                                            property
                                                                        )
                                                                    }{" "}
                                                                    approved
                                                                </span>

                                                                {getPendingImageCount(
                                                                    property
                                                                ) >
                                                                    0 && (

                                                                    <small>
                                                                        {
                                                                            getPendingImageCount(
                                                                                property
                                                                            )
                                                                        }{" "}
                                                                        pending
                                                                    </small>

                                                                )}

                                                                {getPendingPhotoRemovalCount(
                                                                    property
                                                                ) >
                                                                    0 && (

                                                                    <small>
                                                                        {
                                                                            getPendingPhotoRemovalCount(
                                                                                property
                                                                            )
                                                                        }{" "}
                                                                        removal
                                                                        {
                                                                            getPendingPhotoRemovalCount(
                                                                                property
                                                                            ) ===
                                                                            1
                                                                                ? ""
                                                                                : "s"
                                                                        }{" "}
                                                                        pending
                                                                    </small>

                                                                )}

                                                            </div>

                                                        </td>


                                                        <td>

                                                            <div className="agent-edit-status-cell">

                                                                <span
                                                                    className={`agent-edit-status agent-edit-status-${String(
                                                                        getListingStatus(
                                                                            property
                                                                        )
                                                                    )
                                                                        .toLowerCase()
                                                                        .replace(
                                                                            /[^a-z0-9]+/g,
                                                                            "-"
                                                                        )}`}
                                                                >
                                                                    {
                                                                        getListingStatus(
                                                                            property
                                                                        )
                                                                    }
                                                                </span>

                                                                <small>
                                                                    {
                                                                        getRequestStatus(
                                                                            property
                                                                        )
                                                                    }
                                                                </small>

                                                            </div>

                                                        </td>


                                                        <td>

                                                            <div className="agent-edit-actions">

                                                                <button
                                                                    type="button"
                                                                    className="agent-edit-btn agent-edit-btn-primary"
                                                                    onClick={() =>
                                                                        handleEdit(
                                                                            property
                                                                        )
                                                                    }
                                                                >
                                                                    <Icon
                                                                        name="edit"
                                                                        size={15}
                                                                    />

                                                                    Edit
                                                                </button>


                                                                <button
                                                                    type="button"
                                                                    className="agent-edit-btn agent-edit-btn-danger"
                                                                    onClick={() =>
                                                                        handleRemoveListing(
                                                                            property
                                                                        )
                                                                    }
                                                                >
                                                                    <Icon
                                                                        name="trash"
                                                                        size={15}
                                                                    />

                                                                    Remove
                                                                </button>

                                                            </div>

                                                        </td>

                                                    </tr>

                                                );

                                            }
                                        )

                                    )}

                                </tbody>

                            </table>

                        </div>

                    </section>


                    {/* =================================================
                        EDITOR
                    ================================================= */}

                    {editingProperty && (

                        <section className="agent-edit-card agent-edit-editor">

                            <div className="agent-edit-card-header">

                                <div>

                                    <div className="agent-edit-section-label">
                                        PROPERTY LISTING
                                    </div>

                                    <h2>
                                        Edit{" "}
                                        {
                                            editingProperty.unitNumber
                                        }
                                    </h2>

                                    <p>
                                        {
                                            editingProperty.propertyType
                                        }
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    className="agent-edit-close-btn"
                                    onClick={
                                        handleCancel
                                    }
                                >

                                    <Icon
                                        name="close"
                                        size={17}
                                    />

                                    Close

                                </button>

                            </div>


                            {/* =================================================
                                ASSIGNMENT INFORMATION
                            ================================================= */}

                            {editingRequest && (

                                <div className="agent-edit-info-box">

                                    <div className="agent-edit-info-header">

                                        <div>

                                            <h3>
                                                Assignment Information
                                            </h3>

                                            <p>
                                                Information supplied
                                                through the HOA
                                                Sell/Rent request.
                                            </p>

                                        </div>

                                    </div>


                                    <div className="agent-edit-info-grid">

                                        <div>

                                            <span>
                                                Owner / Requester
                                            </span>

                                            <strong>
                                                {
                                                    editingRequest.requesterName ||
                                                    "Not available"
                                                }
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Email
                                            </span>

                                            <strong>
                                                {
                                                    editingRequest.requesterEmail ||
                                                    "Not available"
                                                }
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Request Type
                                            </span>

                                            <strong>
                                                {
                                                    editingRequest.requestType ||
                                                    "Not specified"
                                                }
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Request Status
                                            </span>

                                            <strong>
                                                {
                                                    editingRequest.status ||
                                                    "Assigned"
                                                }
                                            </strong>

                                        </div>

                                    </div>

                                </div>

                            )}


                            <form
                                onSubmit={
                                    handleSave
                                }
                            >

                                {/* =================================================
                                    LISTING DETAILS
                                ================================================= */}

                                <div className="agent-edit-form-section">

                                    <div className="agent-edit-form-heading">

                                        <h3>
                                            Listing Details
                                        </h3>

                                        <p>
                                            Enter the information
                                            that should be submitted
                                            to the HOA for approval.
                                        </p>

                                    </div>


                                    <div className="agent-edit-form-grid">

                                        <div className="agent-edit-field">

                                            <label>
                                                Listing Type
                                            </label>

                                            <select
                                                name="listingType"
                                                value={
                                                    formData.listingType
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            >

                                                <option value="">
                                                    Select Listing Type
                                                </option>

                                                <option value="For Sale">
                                                    For Sale
                                                </option>

                                                <option value="For Rent">
                                                    For Rent
                                                </option>

                                            </select>

                                        </div>


                                        <div className="agent-edit-field">

                                            <label>
                                                Asking Price
                                            </label>

                                            <input
                                                type="number"
                                                name="askingPrice"
                                                value={
                                                    formData.askingPrice
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="e.g. 1850000"
                                            />

                                        </div>


                                        <div className="agent-edit-field">

                                            <label>
                                                Rental Price
                                            </label>

                                            <input
                                                type="number"
                                                name="rentalPrice"
                                                value={
                                                    formData.rentalPrice
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="e.g. 12000"
                                            />

                                        </div>

                                    </div>


                                    <div className="agent-edit-field agent-edit-description-field">

                                        <label>
                                            Listing Description
                                        </label>

                                        <textarea
                                            name="description"
                                            value={
                                                formData.description
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            rows="6"
                                            placeholder="Enter the property listing description..."
                                        />

                                    </div>

                                </div>


                                {/* =================================================
                                    APPROVED PHOTOS
                                ================================================= */}

                                <div className="agent-edit-photo-section">

                                    <div className="agent-edit-form-heading">

                                        <h3>
                                            Approved Photos
                                        </h3>

                                        <p>
                                            These photographs are
                                            currently approved for
                                            public display.
                                        </p>

                                    </div>


                                    {(
                                        editingProperty.images ||
                                        []
                                    ).length === 0 ? (

                                        <div className="agent-edit-photo-empty">

                                            <Icon
                                                name="property"
                                                size={24}
                                            />

                                            <p>
                                                No approved photographs
                                                are currently available.
                                            </p>

                                        </div>

                                    ) : (

                                        <div className="agent-edit-photo-grid">

                                            {(
                                                editingProperty.images ||
                                                []
                                            ).map(
                                                (
                                                    image,
                                                    index
                                                ) => {

                                                    const imageSrc =
                                                        typeof image ===
                                                        "string"
                                                            ? image
                                                            : image.data;

                                                    const imageId =
                                                        typeof image ===
                                                        "string"
                                                            ? image
                                                            : image.id;

                                                    const isPendingRemoval =
                                                        (
                                                            editingProperty
                                                                .pendingPhotoRemovals ||
                                                            []
                                                        ).some(
                                                            (
                                                                pendingImage
                                                            ) => {

                                                                if (
                                                                    typeof pendingImage ===
                                                                    "string"
                                                                ) {

                                                                    return (
                                                                        pendingImage ===
                                                                        imageId
                                                                    );

                                                                }

                                                                if (
                                                                    typeof image ===
                                                                    "string"
                                                                ) {

                                                                    return false;

                                                                }

                                                                return (
                                                                    pendingImage.id ===
                                                                    image.id
                                                                );

                                                            }
                                                        );


                                                    return (

                                                        <div
                                                            key={
                                                                imageId ||
                                                                index
                                                            }
                                                            className="agent-edit-photo-card"
                                                        >

                                                            <div className="agent-edit-photo-image">

                                                                <img
                                                                    src={
                                                                        imageSrc
                                                                    }
                                                                    alt={
                                                                        `Approved property photo ${
                                                                            index +
                                                                            1
                                                                        }`
                                                                    }
                                                                />

                                                            </div>


                                                            <button
                                                                type="button"
                                                                className="agent-edit-photo-remove"
                                                                onClick={() =>
                                                                    removeApprovedPhoto(
                                                                        imageId
                                                                    )
                                                                }
                                                                disabled={
                                                                    isPendingRemoval
                                                                }
                                                            >

                                                                <Icon
                                                                    name="trash"
                                                                    size={15}
                                                                />

                                                                {
                                                                    isPendingRemoval
                                                                        ? "Removal Pending HOA"
                                                                        : "Request Photo Removal"
                                                                }

                                                            </button>

                                                        </div>

                                                    );

                                                }
                                            )}

                                        </div>

                                    )}

                                </div>


                                {/* =================================================
                                    PENDING PHOTOS
                                ================================================= */}

                                <div className="agent-edit-photo-section">

                                    <div className="agent-edit-form-heading">

                                        <h3>
                                            Photos Awaiting HOA Approval
                                        </h3>

                                        <p>
                                            These photographs have been
                                            submitted but are not yet
                                            visible publicly.
                                        </p>

                                    </div>


                                    {(
                                        editingProperty.pendingImages ||
                                        []
                                    ).length === 0 ? (

                                        <div className="agent-edit-photo-empty">

                                            <Icon
                                                name="upload"
                                                size={24}
                                            />

                                            <p>
                                                No photographs are
                                                currently awaiting
                                                approval.
                                            </p>

                                        </div>

                                    ) : (

                                        <div className="agent-edit-photo-grid">

                                            {(
                                                editingProperty.pendingImages ||
                                                []
                                            ).map(
                                                (
                                                    image,
                                                    index
                                                ) => {

                                                    const imageSrc =
                                                        typeof image ===
                                                        "string"
                                                            ? image
                                                            : image.data;


                                                    return (

                                                        <div
                                                            key={
                                                                image.id ||
                                                                index
                                                            }
                                                            className="agent-edit-photo-card"
                                                        >

                                                            <div className="agent-edit-photo-image">

                                                                <img
                                                                    src={
                                                                        imageSrc
                                                                    }
                                                                    alt={
                                                                        `Pending property photo ${
                                                                            index +
                                                                            1
                                                                        }`
                                                                    }
                                                                />

                                                            </div>


                                                            <div className="agent-edit-photo-status">
                                                                Awaiting HOA approval
                                                            </div>

                                                        </div>

                                                    );

                                                }
                                            )}

                                        </div>

                                    )}

                                </div>


                                {/* =================================================
                                    PENDING REMOVALS
                                ================================================= */}

                                {(
                                    editingProperty.pendingPhotoRemovals ||
                                    []
                                ).length > 0 && (

                                    <div className="agent-edit-photo-section">

                                        <div className="agent-edit-form-heading">

                                            <h3>
                                                Photo Removals Awaiting HOA Approval
                                            </h3>

                                            <p>
                                                These approved photographs
                                                have been marked for removal.
                                                They remain public until the
                                                HOA approves the change.
                                            </p>

                                        </div>


                                        <div className="agent-edit-photo-grid">

                                            {(
                                                editingProperty.pendingPhotoRemovals ||
                                                []
                                            ).map(
                                                (
                                                    image,
                                                    index
                                                ) => {

                                                    const imageSrc =
                                                        typeof image ===
                                                        "string"
                                                            ? image
                                                            : image.data;


                                                    return (

                                                        <div
                                                            key={
                                                                image.id ||
                                                                index
                                                            }
                                                            className="agent-edit-photo-card"
                                                        >

                                                            <div className="agent-edit-photo-image">

                                                                <img
                                                                    src={
                                                                        imageSrc
                                                                    }
                                                                    alt={
                                                                        `Photo marked for removal ${
                                                                            index +
                                                                            1
                                                                        }`
                                                                    }
                                                                />

                                                            </div>


                                                            <div className="agent-edit-photo-status agent-edit-photo-status-warning">
                                                                Removal awaiting HOA approval
                                                            </div>

                                                        </div>

                                                    );

                                                }
                                            )}

                                        </div>

                                    </div>

                                )}


                                {/* =================================================
                                    UPLOAD
                                ================================================= */}

                                <div className="agent-edit-upload-section">

                                    <div className="agent-edit-form-heading">

                                        <h3>
                                            Upload New Photos
                                        </h3>

                                        <p>
                                            New photographs will be
                                            submitted to the HOA for
                                            approval before becoming
                                            public.
                                        </p>

                                    </div>


                                    <label className="agent-edit-upload-box">

                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={
                                                handlePhotoSelect
                                            }
                                        />

                                        <div className="agent-edit-upload-icon">

                                            <Icon
                                                name="upload"
                                                size={25}
                                            />

                                        </div>

                                        <strong>
                                            Select property photos
                                        </strong>

                                        <span>
                                            PNG, JPG, JPEG and other
                                            image formats
                                        </span>

                                    </label>


                                    {selectedFiles.length >
                                        0 && (

                                        <div className="agent-edit-selected-heading">

                                            <strong>
                                                New Photos Selected
                                            </strong>

                                            <span>
                                                {selectedFiles.length}{" "}
                                                photo
                                                {
                                                    selectedFiles.length ===
                                                    1
                                                        ? ""
                                                        : "s"
                                                }
                                            </span>

                                        </div>

                                    )}


                                    {selectedFiles.length >
                                        0 && (

                                        <div className="agent-edit-photo-grid">

                                            {selectedFiles.map(
                                                (
                                                    image
                                                ) => (

                                                    <div
                                                        key={
                                                            image.id
                                                        }
                                                        className="agent-edit-photo-card"
                                                    >

                                                        <div className="agent-edit-photo-image">

                                                            <img
                                                                src={
                                                                    image.data
                                                                }
                                                                alt={
                                                                    image.name
                                                                }
                                                            />

                                                        </div>


                                                        <div className="agent-edit-photo-file-name">

                                                            {
                                                                image.name
                                                            }

                                                        </div>


                                                        <button
                                                            type="button"
                                                            className="agent-edit-photo-remove"
                                                            onClick={() =>
                                                                removeSelectedPhoto(
                                                                    image.id
                                                                )
                                                            }
                                                        >

                                                            <Icon
                                                                name="trash"
                                                                size={15}
                                                            />

                                                            Remove

                                                        </button>

                                                    </div>

                                                )
                                            )}

                                        </div>

                                    )}

                                </div>


                                {/* =================================================
                                    ACTIONS
                                ================================================= */}

                                <div className="agent-edit-form-actions">

                                    <button
                                        type="submit"
                                        className="agent-edit-submit-btn"
                                    >

                                        <Icon
                                            name="check"
                                            size={17}
                                        />

                                        Submit Changes for HOA Approval

                                    </button>


                                    <button
                                        type="button"
                                        className="agent-edit-cancel-btn"
                                        onClick={
                                            handleCancel
                                        }
                                    >

                                        <Icon
                                            name="close"
                                            size={17}
                                        />

                                        Cancel

                                    </button>

                                </div>

                            </form>

                        </section>

                    )}

                </div>

            </main>

        </div>

    );

}

export default AgentEditListings;
