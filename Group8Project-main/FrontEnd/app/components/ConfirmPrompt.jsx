import { useEffect, useId, useRef } from "react";

import "./ConfirmPrompt.css";


/*
=========================================================
CONFIRM PROMPT

The inline replacement for `window.confirm` and
`window.prompt`. A browser dialog cannot be styled, is
skipped by the page's own design language, cannot be tested
and gives the user nowhere to type a reason without leaving
the page — the UX rules doc asks for confirmed destructive
actions and for one component per purpose.

It renders an in-flow panel (not a modal overlay) holding
the question, an optional required reason field, and the
confirm/cancel pair. It renders nothing while closed, so a
page can mount it unconditionally and drive it from state.

Usage — plain confirmation:

    <ConfirmPrompt
        open={pendingId !== null}
        title="Remove this account?"
        description="The account is removed from VALORA immediately."
        confirmLabel="Remove account"
        onConfirm={removeConfirmed}
        onCancel={() => setPendingId(null)}
    />

Usage — confirmation that needs a reason:

    <ConfirmPrompt
        open={pendingId !== null}
        title="Reject this request?"
        description="The applicant sees your reason."
        confirmLabel="Reject request"
        reasonLabel="Reason (required)"
        reasonPlaceholder="Explain what is missing or wrong"
        onConfirm={rejectConfirmed}
        onCancel={cancel}
    />

`onConfirm` is only called when a required reason is filled
in; otherwise the panel shows its own error and keeps focus.
=========================================================
*/

export default function ConfirmPrompt({

    open,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    tone = "neutral",
    reasonLabel,
    reasonPlaceholder = "",
    reasonValue,
    onReasonChange,
    onConfirm,
    onCancel

}) {

    const textareaRef = useRef(null);
    const reasonErrorId = useId();


    /* A required reason field takes focus the moment the
       panel opens, so the user types instead of hunting. */

    useEffect(() => {

        if (open && reasonLabel && textareaRef.current) {

            textareaRef.current.focus();

        }

    }, [open, reasonLabel]);


    if (!open) {

        return null;

    }


    const reasonMissing =
        Boolean(reasonLabel) &&
        !String(reasonValue ?? "").trim();


    return (

        <section
            className={`confirm-prompt confirm-prompt-${tone}`}
            role="alertdialog"
            aria-label={title}
        >

            <div className="confirm-prompt-body">

                <h3 className="confirm-prompt-title">
                    {title}
                </h3>


                {description && (

                    <p className="confirm-prompt-description">
                        {description}
                    </p>

                )}


                {reasonLabel && (

                    <label className="confirm-prompt-field">

                        <span className="confirm-prompt-label">
                            {reasonLabel}
                        </span>

                        <textarea
                            ref={textareaRef}
                            rows={3}
                            value={reasonValue ?? ""}
                            placeholder={reasonPlaceholder}
                            aria-describedby={
                                reasonMissing ? reasonErrorId : undefined
                            }
                            onChange={(event) =>
                                onReasonChange?.(event.target.value)
                            }
                        />

                    </label>

                )}


                {reasonMissing && (

                    <p
                        className="confirm-prompt-error"
                        id={reasonErrorId}
                        role="alert"
                    >
                        A reason is required before you can continue.
                    </p>

                )}

            </div>


            <div className="confirm-prompt-actions">

                <button
                    type="button"
                    className="confirm-prompt-cancel"
                    onClick={onCancel}
                >
                    {cancelLabel}
                </button>


                <button
                    type="button"
                    className="confirm-prompt-confirm"
                    disabled={reasonMissing}
                    onClick={onConfirm}
                >
                    {confirmLabel}
                </button>

            </div>

        </section>

    );

}
