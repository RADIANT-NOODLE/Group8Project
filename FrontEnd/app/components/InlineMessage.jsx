import "./InlineMessage.css";


/*
=========================================================
INLINE MESSAGE

A browser alert blocks the page, cannot be styled, cannot
be tested and loses its meaning the moment it is dismissed.
This keeps the message on the page, next to the action that
produced it, and announces it: `role="alert"` for a problem,
`role="status"` for a result.

Usage:
    <InlineMessage tone="error">{error}</InlineMessage>
    <InlineMessage tone="success">{notice}</InlineMessage>

It renders nothing when there is no message, so a page can
render it unconditionally.
=========================================================
*/

export default function InlineMessage({

    tone = "info",
    children

}) {

    if (!children) {

        return null;
    }


    return (

        <p
            className={`inline-message inline-message-${tone}`}
            role={tone === "error" ? "alert" : "status"}
        >
            {children}
        </p>

    );
}
