
import React, { useRef, useState } from "react";
import DashboardSidebar from "../shared/DashboardSidebar";

import {
    getLandingHeroSettings,
    saveLandingHeroSettings,
    clearLandingHeroSettings,
    resetLandingPageContent,
} from "../../../data/landingPageStorage";

import "./LandingPageSettings.css";

const MAX_IMAGE_SIZE = 3 * 1024 * 1024;

const CONTENT_FIELDS = [
    {
        section: "hero",
        title: "Hero Section",
        description: "The main heading and introduction at the top of the website.",
        fields: [
            ["heading1", "Heading line 1", "input"],
            ["heading2", "Heading line 2", "input"],
            ["heading3", "Heading line 3", "input"],
            ["description", "Introduction", "textarea"],
            ["primaryButton", "Primary button text", "input"],
            ["secondaryButton", "Secondary button text", "input"],
            ["loginPrompt", "Login prompt", "input"],
            ["loginLink", "Login link text", "input"],
        ],
    },
    {
        section: "features",
        title: "Feature Cards",
        description: "The three cards displayed below the hero section.",
        fields: [
            ["propertyLabel", "Property card label", "input"],
            ["propertyTitle", "Property card heading", "input"],
            ["propertyDescription", "Property card description", "textarea"],
            ["propertyLink", "Property card link text", "input"],
            ["intelligenceLabel", "Intelligence card label", "input"],
            ["intelligenceTitle", "Intelligence card heading", "input"],
            ["intelligenceDescription", "Intelligence card description", "textarea"],
            ["intelligenceLink", "Intelligence card link text", "input"],
            ["communityLabel", "Community card label", "input"],
            ["communityTitle", "Community card heading", "input"],
            ["communityDescription", "Community card description", "textarea"],
            ["communityLink", "Community card link text", "input"],
        ],
    },
    {
        section: "properties",
        title: "Property Listings Section",
        description: "Edit the introduction above the property cards.",
        fields: [
            ["label", "Section label", "input"],
            ["heading", "Section heading", "input"],
            ["description", "Section description", "textarea"],
            ["viewAllButton", "View all button text", "input"],
        ],
    },
    {
        section: "intelligence",
        title: "Property Intelligence Section",
        description: "Edit the AI valuation and investment information.",
        fields: [
            ["label", "Section label", "input"],
            ["heading1", "Heading line 1", "input"],
            ["heading2", "Heading line 2", "input"],
            ["description", "Introduction", "textarea"],
            ["feature1Title", "AI Valuation heading", "input"],
            ["feature1Description", "AI Valuation description", "textarea"],
            ["feature2Title", "Growth Score heading", "input"],
            ["feature2Description", "Growth Score description", "textarea"],
            ["feature3Title", "Rental Yield heading", "input"],
            ["feature3Description", "Rental Yield description", "textarea"],
            ["feature4Title", "10-Year ROI heading", "input"],
            ["feature4Description", "10-Year ROI description", "textarea"],
            ["button", "Button text", "input"],
        ],
    },
    {
        section: "community",
        title: "Community Section",
        description: "Edit the community-management introduction and feature cards.",
        fields: [
            ["label", "Section label", "input"],
            ["heading1", "Heading line 1", "input"],
            ["heading2", "Heading line 2", "input"],
            ["description", "Introduction", "textarea"],
            ["feature1Title", "Feature 1 heading", "input"],
            ["feature1Description", "Feature 1 description", "textarea"],
            ["feature2Title", "Feature 2 heading", "input"],
            ["feature2Description", "Feature 2 description", "textarea"],
            ["feature3Title", "Feature 3 heading", "input"],
            ["feature3Description", "Feature 3 description", "textarea"],
            ["feature4Title", "Feature 4 heading", "input"],
            ["feature4Description", "Feature 4 description", "textarea"],
            ["button", "Button text", "input"],
        ],
    },
    {
        section: "howItWorks",
        title: "How It Works Section",
        description: "Edit the four steps explaining how VALORA works.",
        fields: [
            ["label", "Section label", "input"],
            ["heading1", "Heading line 1", "input"],
            ["heading2", "Heading line 2", "input"],
            ["description", "Introduction", "textarea"],
            ["step1Title", "Step 1 heading", "input"],
            ["step1Description", "Step 1 description", "textarea"],
            ["step2Title", "Step 2 heading", "input"],
            ["step2Description", "Step 2 description", "textarea"],
            ["step3Title", "Step 3 heading", "input"],
            ["step3Description", "Step 3 description", "textarea"],
            ["step4Title", "Step 4 heading", "input"],
            ["step4Description", "Step 4 description", "textarea"],
        ],
    },
    {
        section: "about",
        title: "About VALORA Section",
        description: "Edit the final introduction to the VALORA platform.",
        fields: [
            ["label", "Section label", "input"],
            ["heading1", "Heading line 1", "input"],
            ["heading2", "Heading line 2", "input"],
            ["description", "About description", "textarea"],
        ],
    },
];

function LandingPageSettings() {
    const [settings, setSettings] = useState(() => getLandingHeroSettings());
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const fileInputRef = useRef(null);

    const updateContentField = (section, field, value) => {
        setSettings((current) => ({
            ...current,
            content: {
                ...current.content,
                [section]: {
                    ...current.content[section],
                    [field]: value,
                },
            },
        }));
    };

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];

        setMessage("");
        setError("");

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image file.");
            event.target.value = "";
            return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            setError("Please choose an image smaller than 3 MB.");
            event.target.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            if (typeof reader.result !== "string") {
                setError("The selected image could not be loaded.");
                return;
            }

            setSettings((current) => ({
                ...current,
                image: reader.result,
                imageName: file.name,
            }));

            setMessage("Image ready. Select Publish Changes to save it.");
        };

        reader.onerror = () => {
            setError("Unable to read this image. Please try another file.");
        };

        reader.readAsDataURL(file);
    };

    const handleSave = () => {
        setError("");
        setMessage("");

        try {
            saveLandingHeroSettings(settings);
            setMessage("Landing-page content and image settings have been saved.");
        } catch (saveError) {
            console.error("Unable to save landing-page settings:", saveError);
            setError(
                "The settings could not be saved. Try a smaller image or reduce the amount of text."
            );
        }
    };

    const handleRemoveImage = () => {
        try {
            const updated = {
                ...settings,
                image: "",
                imageName: "",
                placement: "side",
            };

            saveLandingHeroSettings(updated);
            setSettings(updated);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            setError("");
            setMessage("The custom hero image has been removed.");
        } catch (removeError) {
            console.error("Unable to remove landing-page image:", removeError);
            setError("The image could not be removed. Please try again.");
        }
    };

    const handleResetContent = () => {
        const confirmed = window.confirm(
            "Reset all landing-page text to the default VALORA content? Your hero image will be kept."
        );

        if (!confirmed) return;

        try {
            const updated = resetLandingPageContent();
            setSettings(updated);
            setError("");
            setMessage("Default landing-page content has been restored.");
        } catch (resetError) {
            console.error("Unable to reset landing-page content:", resetError);
            setError("The content could not be reset. Please try again.");
        }
    };

    return (
        <div className="landing-settings-layout">
            <DashboardSidebar />

            <main className="landing-settings-main">
                <div className="landing-settings-container">
                    <header className="landing-settings-heading">
                        <p className="landing-settings-eyebrow">
                            WEBSITE MANAGEMENT
                        </p>

                        <h1>Landing Page Settings</h1>

                        <p>
                            Manage the text and hero image shown on the public
                            VALORA website. Property details remain connected
                            to the existing property records.
                        </p>
                    </header>

                    <section className="landing-settings-card">
                        <div className="landing-settings-card-heading">
                            <h2>Hero Image</h2>
                            <p>
                                Upload a development or community image and
                                choose where it appears.
                            </p>
                        </div>

                        <div className="landing-settings-upload">
                            <label
                                className="landing-settings-label"
                                htmlFor="landing-hero-image"
                            >
                                Upload image
                            </label>

                            <input
                                ref={fileInputRef}
                                id="landing-hero-image"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                            />

                            <p className="landing-settings-hint">
                                Image files only. Maximum size: 3 MB.
                            </p>
                        </div>

                        <div className="landing-settings-placement">
                            <h3>Image placement</h3>

                            <label className="landing-settings-option">
                                <input
                                    type="radio"
                                    name="hero-placement"
                                    value="side"
                                    checked={settings.placement === "side"}
                                    onChange={() =>
                                        setSettings((current) => ({
                                            ...current,
                                            placement: "side",
                                        }))
                                    }
                                />

                                <span>
                                    <strong>Beside the main text</strong>
                                    <small>
                                        Display the image alongside the
                                        landing-page heading and description.
                                    </small>
                                </span>
                            </label>

                            <label className="landing-settings-option">
                                <input
                                    type="radio"
                                    name="hero-placement"
                                    value="background"
                                    checked={settings.placement === "background"}
                                    onChange={() =>
                                        setSettings((current) => ({
                                            ...current,
                                            placement: "background",
                                        }))
                                    }
                                />

                                <span>
                                    <strong>Hero background</strong>
                                    <small>
                                        Display the image behind the main
                                        landing-page text.
                                    </small>
                                </span>
                            </label>
                        </div>

                        <div className="landing-settings-preview-section">
                            <h3>Image preview</h3>

                            {settings.image ? (
                                <div className="landing-settings-preview">
                                    <img
                                        src={settings.image}
                                        alt="Landing-page preview"
                                    />

                                    <div className="landing-settings-preview-info">
                                        <strong>
                                            {settings.imageName || "Selected image"}
                                        </strong>
                                        <span>
                                            {settings.placement === "side"
                                                ? "Beside the main text"
                                                : "Hero background"}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="landing-settings-empty">
                                    <strong>No custom image selected</strong>
                                    <span>
                                        The landing page will use its default
                                        background.
                                    </span>
                                </div>
                            )}
                        </div>
                    </section>

                    {CONTENT_FIELDS.map((group) => (
                        <section
                            className="landing-settings-card landing-content-card"
                            key={group.section}
                        >
                            <div className="landing-settings-card-heading">
                                <h2>{group.title}</h2>
                                <p>{group.description}</p>
                            </div>

                            <div className="landing-content-fields">
                                {group.fields.map(([field, label, type]) => (
                                    <div
                                        className="landing-content-field"
                                        key={`${group.section}-${field}`}
                                    >
                                        <label
                                            className="landing-settings-label"
                                            htmlFor={`${group.section}-${field}`}
                                        >
                                            {label}
                                        </label>

                                        {type === "textarea" ? (
                                            <textarea
                                                id={`${group.section}-${field}`}
                                                rows={3}
                                                value={
                                                    settings.content?.[group.section]?.[field] ?? ""
                                                }
                                                onChange={(event) =>
                                                    updateContentField(
                                                        group.section,
                                                        field,
                                                        event.target.value
                                                    )
                                                }
                                            />
                                        ) : (
                                            <input
                                                id={`${group.section}-${field}`}
                                                type="text"
                                                value={
                                                    settings.content?.[group.section]?.[field] ?? ""
                                                }
                                                onChange={(event) =>
                                                    updateContentField(
                                                        group.section,
                                                        field,
                                                        event.target.value
                                                    )
                                                }
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}

                    {error && (
                        <p role="alert" className="landing-settings-message error">
                            {error}
                        </p>
                    )}

                    {message && (
                        <p role="status" className="landing-settings-message success">
                            {message}
                        </p>
                    )}

                    <div className="landing-settings-actions">
                        <button
                            type="button"
                            className="landing-settings-save"
                            onClick={handleSave}
                        >
                            Publish Changes
                        </button>

                        <button
                            type="button"
                            className="landing-settings-remove"
                            onClick={handleRemoveImage}
                            disabled={!settings.image}
                        >
                            Remove Image
                        </button>

                        <button
                            type="button"
                            className="landing-settings-remove"
                            onClick={handleResetContent}
                        >
                            Reset Text to Defaults
                        </button>
                    </div>

                    <p className="landing-settings-footer-note">
                        Changes are saved in this browser for this prototype.
                        A shared backend is required to publish the same settings
                        across different users and devices.
                    </p>
                </div>
            </main>
        </div>
    );
}

export default LandingPageSettings;
