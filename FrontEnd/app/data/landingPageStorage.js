import { readStoredItem, removeStoredItem, writeStoredItem } from "../services/browserStorage";


export const LANDING_HERO_STORAGE_KEY = "valoraLandingHero";
export const LANDING_CONTENT_UPDATED_EVENT = "valoraLandingSettingsUpdated";

export const DEFAULT_LANDING_HERO_SETTINGS = {
    image: "",
    placement: "side",
    imageName: "",
};

export const DEFAULT_LANDING_PAGE_CONTENT = {
    hero: {
        heading1: "PROPERTY INTELLIGENCE.",
        heading2: "BETTER COMMUNITIES.",
        heading3: "SMARTER DECISIONS.",
        description:
            "VALORA combines property listings, AI-powered property insights and community management tools for South African gated communities and residential complexes.",
        primaryButton: "EXPLORE PROPERTIES",
        secondaryButton: "GET AI VALUATION",
        loginPrompt: "Already a member?",
        loginLink: "Log in",
    },
    features: {
        propertyLabel: "PROPERTY",
        propertyTitle: "Find Properties",
        propertyDescription:
            "Explore properties within the VALORA development and view the information available for each property.",
        propertyLink: "Explore Properties",
        intelligenceLabel: "INTELLIGENCE",
        intelligenceTitle: "Understand Value",
        intelligenceDescription:
            "Use AI-powered valuation, growth scores, rental yield and 10-year ROI to make informed decisions.",
        intelligenceLink: "Try AI Valuation",
        communityLabel: "COMMUNITY",
        communityTitle: "Connect & Manage",
        communityDescription:
            "Report issues, track complaints, find service providers and stay updated with community news.",
        communityLink: "Explore Community",
    },
    properties: {
        label: "THE VALORA DEVELOPMENT",
        heading: "Explore our properties.",
        description:
            "Explore the units within the VALORA development. Property information and approved listing details will be updated as the development progresses.",
        viewAllButton: "View All Units",
    },
    intelligence: {
        label: "PROPERTY INTELLIGENCE",
        heading1: "Know the value.",
        heading2: "Understand the future.",
        description:
            "VALORA combines property data with AI-powered insights to help buyers, investors and estate agents make smarter property decisions.",
        feature1Title: "AI Valuation",
        feature1Description:
            "Get an estimated property value based on local property data.",
        feature2Title: "Growth Score",
        feature2Description:
            "Understand the potential growth of the surrounding area.",
        feature3Title: "Rental Yield",
        feature3Description:
            "Estimate potential rental returns from your property.",
        feature4Title: "10-Year ROI",
        feature4Description:
            "Explore projected long-term investment returns.",
        button: "GET AI VALUATION",
    },
    community: {
        label: "BETTER COMMUNITIES",
        heading1: "Connect. Manage.",
        heading2: "Live Better.",
        description:
            "VALORA brings residents, homeowners associations and trusted service providers together in one connected community platform.",
        feature1Title: "Report Issues",
        feature1Description:
            "Report community issues and keep track of their progress.",
        feature2Title: "Find Trusted Services",
        feature2Description:
            "Discover verified service providers available within your community.",
        feature3Title: "Stay Connected",
        feature3Description:
            "Keep up with community announcements, events and HOA updates.",
        feature4Title: "Manage Your Community",
        feature4Description:
            "Give HOAs the tools they need to manage residents and community information more effectively.",
        button: "EXPLORE COMMUNITY",
    },
    howItWorks: {
        label: "HOW VALORA WORKS",
        heading1: "From property searching",
        heading2: "to smarter decisions.",
        description:
            "VALORA brings property discovery, intelligent insights and community management together in one platform.",
        step1Title: "Explore",
        step1Description:
            "Find properties within your preferred community and explore available listings.",
        step2Title: "Understand",
        step2Description:
            "Use AI-powered insights to understand property value, growth potential and rental returns.",
        step3Title: "Connect",
        step3Description:
            "Stay connected with your community, report issues and access trusted local services.",
        step4Title: "Decide",
        step4Description:
            "Use the information available through VALORA to make more informed property decisions.",
    },
    about: {
        label: "ABOUT VALORA",
        heading1: "Smarter property decisions.",
        heading2: "Stronger communities.",
        description:
            "VALORA is a property intelligence and community management platform designed to bring property information, intelligent analysis and community services together in one place.",
    },
};

function getDefaultSettings() {
    return {
        ...DEFAULT_LANDING_HERO_SETTINGS,
        content: JSON.parse(JSON.stringify(DEFAULT_LANDING_PAGE_CONTENT)),
    };
}

function mergeContent(savedContent = {}) {
    const defaults = DEFAULT_LANDING_PAGE_CONTENT;
    const result = {};

    Object.keys(defaults).forEach((section) => {
        result[section] = {
            ...defaults[section],
            ...(savedContent[section] || {}),
        };
    });

    return result;
}

export function getLandingHeroSettings() {
    try {
        const saved = readStoredItem(LANDING_HERO_STORAGE_KEY);

        if (!saved) {
            return getDefaultSettings();
        }

        const parsed = JSON.parse(saved);

        return {
            ...getDefaultSettings(),
            ...parsed,
            content: mergeContent(parsed.content),
            placement:
                parsed.placement === "background" ? "background" : "side",
        };
    } catch (error) {
        console.error("Unable to load landing-page settings:", error);
        return getDefaultSettings();
    }
}

export function getLandingPageContent() {
    return getLandingHeroSettings().content;
}

export function saveLandingHeroSettings(settings) {
    const current = getLandingHeroSettings();

    const updated = {
        ...current,
        ...settings,
        content: mergeContent(settings.content || current.content),
        placement:
            settings.placement === "background" ? "background" : "side",
    };

    if (!writeStoredItem(LANDING_HERO_STORAGE_KEY, JSON.stringify(updated))) {
        throw new Error("Browser storage is full or unavailable.");
    }

    window.dispatchEvent(new Event(LANDING_CONTENT_UPDATED_EVENT));

    return updated;
}

export function saveLandingPageContent(content) {
    const current = getLandingHeroSettings();

    return saveLandingHeroSettings({
        ...current,
        content: mergeContent(content),
    });
}

export function clearLandingHeroSettings() {
    removeStoredItem(LANDING_HERO_STORAGE_KEY);
    window.dispatchEvent(new Event(LANDING_CONTENT_UPDATED_EVENT));
}

export function resetLandingPageContent() {
    const current = getLandingHeroSettings();

    return saveLandingHeroSettings({
        ...current,
        content: JSON.parse(JSON.stringify(DEFAULT_LANDING_PAGE_CONTENT)),
    });
}
