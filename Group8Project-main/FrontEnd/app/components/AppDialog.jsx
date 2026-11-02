import { useEffect, useRef, useState } from "react";

import "./AppDialog.css";


/*
=========================================================
APP DIALOG

The site's own replacement for `window.alert` and
`window.confirm`. Browser dialogs cannot be styled and show
the "localhost says" banner, so every page calls these
helpers instead and one <DialogHost /> (mounted in App.jsx)
renders them as a VALORA-styled modal.

Usage:

    if (!(await showConfirm("Approve this request?"))) return;

    showAlert("Profile updated successfully.");

Both return a promise: showConfirm resolves to true/false,
showAlert resolves once the user closes the message.
=========================================================
*/

const DESTRUCTIVE_WORDS = /\b(delete|remove|reject|revoke|unassign|reset)\b/i;

let dialogQueue = [];
let notifyHost = null;
let nextDialogId = 1;


function openDialog(dialog) {

    return new Promise((resolve) => {

        dialogQueue = [
            ...dialogQueue,
            { ...dialog, id: nextDialogId++, resolve }
        ];

        notifyHost?.(dialogQueue);

    });

}


export function showConfirm(message, options = {}) {

    return openDialog({
        kind: "confirm",
        message,
        title: options.title || "Are you sure?",
        confirmLabel: options.confirmLabel || "Confirm",
        cancelLabel: options.cancelLabel || "Cancel",
        tone: options.tone || (DESTRUCTIVE_WORDS.test(message) ? "danger" : "neutral")
    });

}


export function showAlert(message, options = {}) {

    return openDialog({
        kind: "alert",
        message: String(message ?? ""),
        title: options.title || "Notice",
        confirmLabel: options.confirmLabel || "OK",
        tone: options.tone || "neutral"
    });

}


export default function DialogHost() {

    const [queue, setQueue] = useState(dialogQueue);
    const confirmButtonRef = useRef(null);

    const current = queue[0];


    useEffect(() => {

        notifyHost = setQueue;
        setQueue(dialogQueue);

        return () => {

            notifyHost = null;

        };

    }, []);


    function close(result) {

        if (!current) return;

        dialogQueue = dialogQueue.filter((dialog) => dialog.id !== current.id);
        setQueue(dialogQueue);
        current.resolve(result);

    }


    /* Focus the main button when a dialog opens, and let
       Escape cancel it, as a browser dialog would. */

    useEffect(() => {

        if (!current) return undefined;

        confirmButtonRef.current?.focus();

        function handleKeyDown(event) {

            if (event.key === "Escape") {

                event.preventDefault();
                close(current.kind === "alert");

            }

        }

        document.addEventListener("keydown", handleKeyDown);

        return () => document.removeEventListener("keydown", handleKeyDown);

    }, [current]);


    if (!current) {

        return null;

    }


    return (

        <div
            className="app-dialog-overlay"
            onMouseDown={(event) => {

                if (event.target === event.currentTarget) {

                    close(current.kind === "alert");

                }

            }}
        >

            <div
                className={`app-dialog app-dialog-${current.tone}`}
                role={current.kind === "confirm" ? "alertdialog" : "dialog"}
                aria-modal="true"
                aria-labelledby={`app-dialog-title-${current.id}`}
                aria-describedby={`app-dialog-message-${current.id}`}
            >

                <div className="app-dialog-header">

                    <span className="app-dialog-icon" aria-hidden="true">
                        {current.kind === "confirm" ? "?" : "i"}
                    </span>

                    <h2
                        className="app-dialog-title"
                        id={`app-dialog-title-${current.id}`}
                    >
                        {current.title}
                    </h2>

                </div>


                <p
                    className="app-dialog-message"
                    id={`app-dialog-message-${current.id}`}
                >
                    {current.message}
                </p>


                <div className="app-dialog-actions">

                    {current.kind === "confirm" && (

                        <button
                            type="button"
                            className="app-dialog-cancel"
                            onClick={() => close(false)}
                        >
                            {current.cancelLabel}
                        </button>

                    )}

                    <button
                        type="button"
                        ref={confirmButtonRef}
                        className="app-dialog-confirm"
                        onClick={() => close(true)}
                    >
                        {current.confirmLabel}
                    </button>

                </div>

            </div>

        </div>

    );

}
