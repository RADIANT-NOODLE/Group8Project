import { useEffect, useState } from "react";

import { fetchComplaintPhoto } from "../services/complaintApi";
import "./ComplaintPhoto.css";

/*
=========================================================
COMPLAINT PHOTO

Complaints are private, so their photos need the viewer's
login. An <img src> can't send one, so the image is fetched
first and shown from a temporary browser URL.
=========================================================
*/

export default function ComplaintPhoto({ complaint }) {
    const [src, setSrc] = useState("");
    const [failed, setFailed] = useState(false);
    const photoUrl = complaint?.photoUrl || "";

    useEffect(() => {
        setSrc("");
        setFailed(false);
        if (!photoUrl) return undefined;

        // older complaints may hold a plain link rather than a stored photo
        if (!photoUrl.startsWith("/api/")) {
            setSrc(photoUrl);
            return undefined;
        }

        let cancelled = false;
        let objectUrl = "";

        fetchComplaintPhoto(complaint.id)
            .then((blob) => {
                if (cancelled) return;
                objectUrl = URL.createObjectURL(blob);
                setSrc(objectUrl);
            })
            .catch((error) => {
                console.error("Could not load the complaint photo:", error);
                if (!cancelled) setFailed(true);
            });

        return () => {
            cancelled = true;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [complaint?.id, photoUrl]);

    if (!photoUrl) return null;

    if (failed) {
        return <p className="complaint-photo-note" role="status">The photo could not be loaded.</p>;
    }

    if (!src) {
        return <p className="complaint-photo-note" role="status">Loading photo…</p>;
    }

    return (
        <img
            className="complaint-photo"
            src={src}
            alt={`Photo attached to complaint ${complaint.id}`}
            onError={() => setFailed(true)}
        />
    );
}
