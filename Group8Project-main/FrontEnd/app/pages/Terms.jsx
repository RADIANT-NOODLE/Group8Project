import React, { useEffect } from "react";

import { PublicFooter, PublicHeader } from "../components/PublicSite";
import { FullTerms } from "./Auth/TermsContent.jsx";
import "./Terms.css";

/* The latest terms, open to everyone, as section 12 of the terms promises. */
export default function Terms() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="lp terms-page">
            <PublicHeader current="terms" />

            <main className="terms-page-main">
                <article className="terms-page-card">
                    <h1>Terms and Conditions &amp; Privacy Policy</h1>
                    <FullTerms />
                </article>
            </main>

            <PublicFooter />
        </div>
    );
}
