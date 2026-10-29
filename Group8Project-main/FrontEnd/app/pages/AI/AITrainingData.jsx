import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardSidebar from "../Dashboards/shared/DashboardSidebar";
import "./AITrainingData.css";

const DATASETS_STORAGE_KEY = "valoraAITrainingDatasets";
const DATASETS_UPDATED_EVENT = "valoraAITrainingDatasetsUpdated";

/*
 * These are connections to existing VALORA storage sources, not sample
 * datasets. A source appears as a configured dataset only when an admin
 * adds it.
 */
const DATA_SOURCES = [
    {
        key: "properties",
        label: "Property Records",
        category: "Property Valuation",
        type: "Properties",
        storageKey: "valoraProperties",
        description: "Property records available in VALORA.",
    },
    {
        key: "complaints",
        label: "Resident Complaints",
        category: "Community Trends",
        type: "Complaints",
        storageKey: "valoraComplaints",
        description: "Complaint records submitted through VALORA.",
    },
    {
        key: "maintenance",
        label: "Maintenance Requests",
        category: "Community Trends",
        type: "Maintenance",
        storageKey: "valoraMaintenanceRequests",
        description: "Maintenance requests recorded in VALORA.",
    },
];

function readArrayFromStorage(key) {
    try {
        const saved = localStorage.getItem(key);

        if (!saved) {
            return [];
        }

        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
            return parsed;
        }

        // Support storage entries that wrap records in an array property.
        if (parsed && Array.isArray(parsed.records)) {
            return parsed.records;
        }

        if (parsed && Array.isArray(parsed.data)) {
            return parsed.data;
        }

        return [];
    } catch (error) {
        console.error(`Unable to read VALORA data from "${key}".`, error);
        return [];
    }
}

function readDatasetConfigurations() {
    try {
        const saved = localStorage.getItem(DATASETS_STORAGE_KEY);

        if (!saved) {
            return [];
        }

        const parsed = JSON.parse(saved);

        if (!Array.isArray(parsed)) {
            return [];
        }

        // Ignore invalid configurations and configurations whose source
        // is no longer supported.
        return parsed.filter(
            (item) =>
                item &&
                typeof item.id === "string" &&
                typeof item.name === "string" &&
                DATA_SOURCES.some((source) => source.key === item.sourceKey)
        );
    } catch (error) {
        console.error("Unable to read AI dataset configurations.", error);
        return [];
    }
}

function getSourceByKey(sourceKey) {
    return DATA_SOURCES.find((source) => source.key === sourceKey);
}

function createId() {
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {
        return crypto.randomUUID();
    }

    return `dataset-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function Icon({ name, size = 20 }) {
    const common = {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.8,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": true,
    };

    const paths = {
        database: (
            <>
                <ellipse cx="12" cy="5" rx="8" ry="3" />
                <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
                <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
            </>
        ),
        plus: (
            <>
                <path d="M12 5v14" />
                <path d="M5 12h14" />
            </>
        ),
        refresh: (
            <>
                <path d="M20 7v5h-5" />
                <path d="M4 17v-5h5" />
                <path d="M5.6 9a7 7 0 0 1 11.55-2.6L20 12" />
                <path d="M4 12l2.85 5.6A7 7 0 0 0 18.4 15" />
            </>
        ),
        search: (
            <>
                <circle cx="10.8" cy="10.8" r="6.8" />
                <path d="m16 16 4 4" />
            </>
        ),
        review: (
            <>
                <path d="m5 12 4 4L19 6" />
                <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
            </>
        ),
        trash: (
            <>
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="m19 6-1 14H6L5 6" />
                <path d="M10 10v6M14 10v6" />
            </>
        ),
        close: (
            <>
                <path d="m18 6-12 12M6 6l12 12" />
            </>
        ),
        info: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5M12 8h.01" />
            </>
        ),
        empty: (
            <>
                <ellipse cx="12" cy="5" rx="8" ry="3" />
                <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
                <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
                <path d="M9 9h6" />
            </>
        ),
    };

    return <svg {...common}>{paths[name] || paths.info}</svg>;
}

function getDatasetStatus(dataset, recordCount) {
    if (
        Number.isFinite(dataset.lastReviewedCount) &&
        dataset.lastReviewedCount === recordCount
    ) {
        return "Reviewed";
    }

    return "Needs Review";
}

export default function AITrainingData() {
    const [datasets, setDatasets] = useState([]);
    const [sourceCounts, setSourceCounts] = useState({});
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedSourceKey, setSelectedSourceKey] = useState("");
    const [datasetName, setDatasetName] = useState("");
    const [notice, setNotice] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const refreshData = useCallback(() => {
        const configurations = readDatasetConfigurations();
        const counts = {};

        DATA_SOURCES.forEach((source) => {
            counts[source.key] = readArrayFromStorage(
                source.storageKey
            ).length;
        });

        setDatasets(configurations);
        setSourceCounts(counts);
    }, []);

    useEffect(() => {
        refreshData();

        const handleStorageChange = (event) => {
            if (
                !event.key ||
                [
                    DATASETS_STORAGE_KEY,
                    ...DATA_SOURCES.map((source) => source.storageKey),
                ].includes(event.key)
            ) {
                refreshData();
            }
        };

        const relevantEvents = [
            DATASETS_UPDATED_EVENT,
            "valoraPropertiesUpdated",
            "valoraComplaintsUpdated",
            "valoraMaintenanceUpdated",
            "valoraMaintenanceRequestsUpdated",
        ];

        window.addEventListener("storage", handleStorageChange);
        window.addEventListener("focus", refreshData);
        relevantEvents.forEach((eventName) =>
            window.addEventListener(eventName, refreshData)
        );

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("focus", refreshData);
            relevantEvents.forEach((eventName) =>
                window.removeEventListener(eventName, refreshData)
            );
        };
    }, [refreshData]);

    const configuredSourceKeys = useMemo(
        () => new Set(datasets.map((dataset) => dataset.sourceKey)),
        [datasets]
    );

    const categories = useMemo(
        () => [
            "All",
            ...new Set(
                datasets
                    .map((dataset) => getSourceByKey(dataset.sourceKey)?.category)
                    .filter(Boolean)
            ),
        ],
        [datasets]
    );

    const visibleDatasets = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return datasets.filter((dataset) => {
            const source = getSourceByKey(dataset.sourceKey);
            const matchesCategory =
                categoryFilter === "All" ||
                source?.category === categoryFilter;
            const matchesSearch =
                !normalizedSearch ||
                dataset.name.toLowerCase().includes(normalizedSearch) ||
                source?.label.toLowerCase().includes(normalizedSearch) ||
                source?.type.toLowerCase().includes(normalizedSearch);

            return matchesCategory && matchesSearch;
        });
    }, [datasets, categoryFilter, searchTerm]);

    const totalRecords = datasets.reduce(
        (total, dataset) =>
            total + (sourceCounts[dataset.sourceKey] || 0),
        0
    );

    const needsReviewCount = datasets.filter((dataset) => {
        const count = sourceCounts[dataset.sourceKey] || 0;
        return getDatasetStatus(dataset, count) === "Needs Review";
    }).length;

    const saveConfigurations = (updatedDatasets) => {
        try {
            localStorage.setItem(
                DATASETS_STORAGE_KEY,
                JSON.stringify(updatedDatasets)
            );

            setDatasets(updatedDatasets);

            window.dispatchEvent(
                new CustomEvent(DATASETS_UPDATED_EVENT, {
                    detail: { datasets: updatedDatasets },
                })
            );

            return true;
        } catch (error) {
            console.error("Unable to save AI dataset configurations.", error);
            setErrorMessage(
                "VALORA could not save this dataset configuration. Check your browser storage and try again."
            );
            return false;
        }
    };

    const openAddModal = () => {
        setNotice("");
        setErrorMessage("");

        const firstAvailableSource = DATA_SOURCES.find(
            (source) =>
                (sourceCounts[source.key] || 0) > 0 &&
                !configuredSourceKeys.has(source.key)
        );

        setSelectedSourceKey(firstAvailableSource?.key || "");
        setDatasetName(firstAvailableSource?.label || "");
        setShowAddModal(true);
    };

    const handleSourceChange = (event) => {
        const sourceKey = event.target.value;
        const source = getSourceByKey(sourceKey);

        setSelectedSourceKey(sourceKey);
        setDatasetName(source?.label || "");
        setErrorMessage("");
    };

    const handleAddDataset = (event) => {
        event.preventDefault();
        setErrorMessage("");
        setNotice("");

        const source = getSourceByKey(selectedSourceKey);
        const recordCount = sourceCounts[selectedSourceKey] || 0;
        const trimmedName = datasetName.trim();

        if (!source) {
            setErrorMessage("Choose a valid VALORA data source.");
            return;
        }

        if (!trimmedName) {
            setErrorMessage("Enter a name for this dataset.");
            return;
        }

        if (recordCount === 0) {
            setErrorMessage(
                "This source currently has no records. Add real records to VALORA before configuring it as a dataset."
            );
            return;
        }

        if (configuredSourceKeys.has(selectedSourceKey)) {
            setErrorMessage(
                "This data source already has a dataset configuration."
            );
            return;
        }

        const newDataset = {
            id: createId(),
            name: trimmedName,
            sourceKey: selectedSourceKey,
            lastReviewedCount: null,
        };

        const updatedDatasets = [...datasets, newDataset];

        if (saveConfigurations(updatedDatasets)) {
            setShowAddModal(false);
            setCategoryFilter("All");
            setSearchTerm("");
            setNotice("Dataset configuration added using existing VALORA records.");
        }
    };

    const handleReview = (dataset) => {
        setErrorMessage("");
        setNotice("");

        const currentCount = sourceCounts[dataset.sourceKey] || 0;

        if (currentCount === 0) {
            setErrorMessage(
                "This source has no records to review. The dataset has not been marked as reviewed."
            );
            return;
        }

        const updatedDatasets = datasets.map((item) =>
            item.id === dataset.id
                ? { ...item, lastReviewedCount: currentCount }
                : item
        );

        if (saveConfigurations(updatedDatasets)) {
            setNotice(
                `"${dataset.name}" has been marked as reviewed. This does not mean the AI model has been trained.`
            );
        }
    };

    const handleRemove = (dataset) => {
        const confirmed = window.confirm(
            `Remove the "${dataset.name}" dataset configuration? This will not delete the underlying VALORA records.`
        );

        if (!confirmed) {
            return;
        }

        const updatedDatasets = datasets.filter(
            (item) => item.id !== dataset.id
        );

        if (saveConfigurations(updatedDatasets)) {
            setNotice("Dataset configuration removed. Source records were not deleted.");
        }
    };

    return (
        <div className="ai-training-page">
            <DashboardSidebar />

            <main className="ai-training-main">
                <header className="ai-training-header">
                    <div>
                        <p className="ai-training-eyebrow">VALORA / HOA ADMIN</p>
                        <h1>AI Training Data</h1>
                        <p className="ai-training-subtitle">
                            Configure and review data sources that exist in your VALORA system.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="ai-training-refresh-button"
                        onClick={() => {
                            refreshData();
                            setNotice("Data refreshed from VALORA's current browser storage.");
                            setErrorMessage("");
                        }}
                    >
                        <Icon name="refresh" size={17} />
                        Refresh Data
                    </button>
                </header>

                {notice && (
                    <div className="ai-training-notice" role="status">
                        <Icon name="info" size={18} />
                        <span>{notice}</span>
                        <button
                            type="button"
                            aria-label="Dismiss message"
                            onClick={() => setNotice("")}
                        >
                            <Icon name="close" size={16} />
                        </button>
                    </div>
                )}

                {errorMessage && (
                    <div className="ai-training-error" role="alert">
                        <Icon name="info" size={18} />
                        <span>{errorMessage}</span>
                        <button
                            type="button"
                            aria-label="Dismiss error"
                            onClick={() => setErrorMessage("")}
                        >
                            <Icon name="close" size={16} />
                        </button>
                    </div>
                )}

                <section className="ai-training-stats" aria-label="Dataset summary">
                    <article className="ai-training-stat-card">
                        <div className="ai-training-stat-icon">
                            <Icon name="database" size={21} />
                        </div>
                        <div>
                            <span className="ai-training-stat-label">
                                Configured Datasets
                            </span>
                            <strong>{datasets.length}</strong>
                        </div>
                    </article>

                    <article className="ai-training-stat-card">
                        <div className="ai-training-stat-icon">
                            <Icon name="database" size={21} />
                        </div>
                        <div>
                            <span className="ai-training-stat-label">
                                Source Records
                            </span>
                            <strong>{totalRecords.toLocaleString()}</strong>
                        </div>
                    </article>

                    <article className="ai-training-stat-card">
                        <div className="ai-training-stat-icon ai-training-review-icon">
                            <Icon name="review" size={21} />
                        </div>
                        <div>
                            <span className="ai-training-stat-label">
                                Datasets Needing Review
                            </span>
                            <strong>{needsReviewCount}</strong>
                        </div>
                    </article>
                </section>

                <section className="ai-training-source-panel">
                    <div className="ai-training-section-heading">
                        <div>
                            <h2>Connected VALORA Sources</h2>
                            <p>
                                These counts are read from existing application records.
                                They are not claims about AI model training.
                            </p>
                        </div>
                    </div>

                    <div className="ai-training-source-grid">
                        {DATA_SOURCES.map((source) => {
                            const count = sourceCounts[source.key] || 0;
                            const configured = configuredSourceKeys.has(source.key);

                            return (
                                <article
                                    className="ai-training-source-card"
                                    key={source.key}
                                >
                                    <div className="ai-training-source-top">
                                        <span className="ai-training-source-icon">
                                            <Icon name="database" size={19} />
                                        </span>
                                        <span
                                            className={`ai-training-source-state ${
                                                count > 0 ? "is-available" : "is-empty"
                                            }`}
                                        >
                                            {count > 0 ? "Records available" : "No records"}
                                        </span>
                                    </div>

                                    <h3>{source.label}</h3>
                                    <p>{source.description}</p>

                                    <div className="ai-training-source-bottom">
                                        <strong>{count.toLocaleString()}</strong>
                                        <span>records</span>
                                    </div>

                                    {configured && (
                                        <span className="ai-training-configured-label">
                                            Dataset configured
                                        </span>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                </section>

                <section className="ai-training-datasets-panel">
                    <div className="ai-training-section-heading ai-training-table-heading">
                        <div>
                            <h2>Configured Datasets</h2>
                            <p>
                                Only datasets you configure appear here. Source records remain
                                in their original VALORA sections.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="ai-training-primary-button"
                            onClick={openAddModal}
                        >
                            <Icon name="plus" size={18} />
                            Add Data Source
                        </button>
                    </div>

                    <div className="ai-training-filters">
                        <label className="ai-training-search">
                            <Icon name="search" size={18} />
                            <input
                                type="search"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search configured datasets..."
                                aria-label="Search configured datasets"
                            />
                        </label>

                        <select
                            value={categoryFilter}
                            onChange={(event) => setCategoryFilter(event.target.value)}
                            aria-label="Filter datasets by category"
                        >
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category === "All" ? "All Categories" : category}
                                </option>
                            ))}
                        </select>
                    </div>

                    {visibleDatasets.length === 0 ? (
                        <div className="ai-training-empty-state">
                            <div className="ai-training-empty-icon">
                                <Icon name="empty" size={30} />
                            </div>

                            <h3>
                                {datasets.length === 0
                                    ? "No datasets configured yet"
                                    : "No matching datasets"}
                            </h3>

                            <p>
                                {datasets.length === 0
                                    ? "There are no configured AI data sources yet. Add a source to use records already stored in VALORA. Nothing will be added until you choose it."
                                    : "Try a different search term or category filter."}
                            </p>

                            {datasets.length === 0 && (
                                <button
                                    type="button"
                                    className="ai-training-primary-button"
                                    onClick={openAddModal}
                                >
                                    <Icon name="plus" size={18} />
                                    Configure a Data Source
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="ai-training-table-wrap">
                            <table className="ai-training-table">
                                <thead>
                                    <tr>
                                        <th>Dataset</th>
                                        <th>Category</th>
                                        <th>Data Type</th>
                                        <th>Source Records</th>
                                        <th>Review Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleDatasets.map((dataset) => {
                                        const source = getSourceByKey(dataset.sourceKey);
                                        const count = sourceCounts[dataset.sourceKey] || 0;
                                        const status = getDatasetStatus(dataset, count);

                                        return (
                                            <tr key={dataset.id}>
                                                <td>
                                                    <div className="ai-training-dataset-name">
                                                        <span className="ai-training-table-icon">
                                                            <Icon name="database" size={18} />
                                                        </span>
                                                        <span>{dataset.name}</span>
                                                    </div>
                                                </td>
                                                <td>{source?.category || "—"}</td>
                                                <td>{source?.type || "—"}</td>
                                                <td>{count.toLocaleString()}</td>
                                                <td>
                                                    <span
                                                        className={`ai-training-status ${
                                                            status === "Reviewed"
                                                                ? "is-reviewed"
                                                                : "is-pending"
                                                        }`}
                                                    >
                                                        {status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="ai-training-row-actions">
                                                        <button
                                                            type="button"
                                                            className="ai-training-review-button"
                                                            onClick={() => handleReview(dataset)}
                                                            disabled={count === 0 || status === "Reviewed"}
                                                            title={
                                                                status === "Reviewed"
                                                                    ? "Current record count already reviewed"
                                                                    : "Mark current source records as reviewed"
                                                            }
                                                        >
                                                            <Icon name="review" size={16} />
                                                            Review
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="ai-training-remove-button"
                                                            onClick={() => handleRemove(dataset)}
                                                            aria-label={`Remove ${dataset.name} configuration`}
                                                            title="Remove configuration"
                                                        >
                                                            <Icon name="trash" size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <div className="ai-training-disclaimer">
                    <Icon name="info" size={18} />
                    <p>
                        <strong>Important:</strong> this page configures and reviews references
                        to existing VALORA records. It does not train an AI model or change
                        valuation predictions. A real training pipeline must be connected
                        before the application can report model training as completed.
                    </p>
                </div>
            </main>

            {showAddModal && (
                <div
                    className="ai-training-modal-backdrop"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setShowAddModal(false);
                            setErrorMessage("");
                        }
                    }}
                >
                    <section
                        className="ai-training-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="ai-training-modal-title"
                    >
                        <div className="ai-training-modal-heading">
                            <div>
                                <span className="ai-training-modal-icon">
                                    <Icon name="database" size={21} />
                                </span>
                                <h2 id="ai-training-modal-title">
                                    Configure Data Source
                                </h2>
                            </div>

                            <button
                                type="button"
                                className="ai-training-modal-close"
                                aria-label="Close dialog"
                                onClick={() => {
                                    setShowAddModal(false);
                                    setErrorMessage("");
                                }}
                            >
                                <Icon name="close" size={20} />
                            </button>
                        </div>

                        <p className="ai-training-modal-description">
                            Select an existing VALORA source. This creates a configuration
                            only; it does not copy, fabricate or train records.
                        </p>

                        <form onSubmit={handleAddDataset}>
                            <label className="ai-training-field">
                                <span>VALORA Data Source</span>
                                <select
                                    value={selectedSourceKey}
                                    onChange={handleSourceChange}
                                    required
                                >
                                    <option value="">Choose a source</option>
                                    {DATA_SOURCES.map((source) => {
                                        const count = sourceCounts[source.key] || 0;
                                        const alreadyConfigured =
                                            configuredSourceKeys.has(source.key);

                                        return (
                                            <option
                                                key={source.key}
                                                value={source.key}
                                                disabled={count === 0 || alreadyConfigured}
                                            >
                                                {source.label} — {count} records
                                                {alreadyConfigured
                                                    ? " (already configured)"
                                                    : count === 0
                                                    ? " (no records available)"
                                                    : ""}
                                            </option>
                                        );
                                    })}
                                </select>
                            </label>

                            <label className="ai-training-field">
                                <span>Dataset Name</span>
                                <input
                                    type="text"
                                    value={datasetName}
                                    onChange={(event) =>
                                        setDatasetName(event.target.value)
                                    }
                                    placeholder="Enter a dataset name"
                                    maxLength={100}
                                    required
                                />
                            </label>

                            {selectedSourceKey && (
                                <div className="ai-training-selected-source">
                                    <Icon name="info" size={18} />
                                    <p>
                                        {getSourceByKey(selectedSourceKey)?.description}{" "}
                                        Current records:{" "}
                                        <strong>
                                            {(
                                                sourceCounts[selectedSourceKey] || 0
                                            ).toLocaleString()}
                                        </strong>
                                    </p>
                                </div>
                            )}

                            {errorMessage && (
                                <div className="ai-training-error ai-training-modal-error" role="alert">
                                    {errorMessage}
                                </div>
                            )}

                            <div className="ai-training-modal-actions">
                                <button
                                    type="button"
                                    className="ai-training-cancel-button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setErrorMessage("");
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="ai-training-primary-button"
                                    disabled={
                                        !selectedSourceKey ||
                                        (sourceCounts[selectedSourceKey] || 0) === 0 ||
                                        configuredSourceKeys.has(selectedSourceKey)
                                    }
                                >
                                    Add Dataset
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </div>
    );
}
