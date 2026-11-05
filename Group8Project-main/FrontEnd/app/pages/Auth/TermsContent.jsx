import React from "react";

/* The wording shown on the registration form. */
export function TermsSummary() {
    return (
        <>
            <h3>Privacy and Data Protection Agreement</h3>
            <p>
                We value your privacy and are committed to protecting your personal
                information in accordance with POPIA.
            </p>
            <p>
                Your information will only be collected and used for legitimate
                property-related services. We will not sell your information or share it
                with unauthorised third parties. Any necessary sharing will be subject to
                applicable privacy laws and appropriate safeguards.
            </p>
            <p>
                By registering, you agree to our Terms and Conditions and acknowledge our
                Privacy Policy.
            </p>
        </>
    );
}

/* The full Terms and Conditions and Privacy Policy. deploy.py refuses to go live while any
   square-bracket blank below is still unfilled. */
export function FullTerms() {
    return (
        <>
            <p className="auth-terms-brand">VALORA</p>
            <p><strong>Effective Date:</strong> [Insert Date]</p>
            <h4>1. Introduction</h4>
            <p>Welcome to VALORA</p>
            <p>We are committed to providing a secure, reliable and professional online platform for property management and related services.</p>
            <p>By accessing, registering for or using this Website, users agree to comply with these Terms and Conditions.</p>
            <p>We respect the privacy of all users and are committed to protecting personal information in accordance with the Protection of Personal Information Act 4 of 2013 (POPIA) and other applicable South African laws.</p>
            <h4>2. Collection of Personal Information</h4>
            <p>To provide our services, we may collect certain personal information, including:</p>
            <ul>
                <li>Full names and surnames</li>
                <li>Contact numbers and email addresses</li>
                <li>Property addresses and property-related information</li>
                <li>Ownership, tenancy and management details</li>
                <li>Account registration and login information</li>
                <li>Documents voluntarily submitted through the Website</li>
                <li>Billing, payment and municipal account information, where applicable</li>
            </ul>
            <p>We will only collect information that is reasonably necessary for legitimate purposes associated with the services provided.</p>
            <h4>3. Use of Personal Information</h4>
            <p>All personal information collected through the Website will be used responsibly and only for legitimate, specified purposes.</p>
            <p>Information may be used for:</p>
            <ul>
                <li>Managing user accounts and property records</li>
                <li>Providing property-related services</li>
                <li>Communicating with registered users</li>
                <li>Processing authorised requests and enquiries</li>
                <li>Maintaining accurate property management records</li>
                <li>Improving website functionality and security</li>
                <li>Complying with applicable legal obligations</li>
            </ul>
            <p><strong>We will not use personal information for unlawful, fraudulent, misleading or unauthorised purposes.</strong></p>
            <p>Personal information will not be sold, rented or commercially exploited.</p>
            <h4>4. Protection and Confidentiality of Information</h4>
            <p>We recognise the importance of maintaining the confidentiality and security of personal information.</p>
            <p>We undertake to implement reasonable technical and organisational safeguards to protect personal information against unauthorised access, loss, misuse, alteration or disclosure.</p>
            <p>Access to personal information will be restricted to authorised individuals who require it to perform legitimate duties.</p>
            <p>All persons authorised to handle personal information must maintain appropriate confidentiality.</p>
            <p>Although reasonable security measures will be maintained, no online system can guarantee absolute protection against every cybersecurity threat.</p>
            <h4>5. Sharing of Personal Information</h4>
            <p><strong>We will not sell or disclose users' personal information to unrelated third parties for marketing or other unauthorised purposes.</strong></p>
            <p>Personal information will only be shared where:</p>
            <ul>
                <li>The user has provided valid consent, where consent is required.</li>
                <li>Sharing is necessary to provide a service requested or authorised by the user.</li>
                <li>An authorised service provider requires limited information to perform services on our behalf, subject to appropriate confidentiality and security safeguards.</li>
                <li>Disclosure is required or permitted by applicable law.</li>
            </ul>
            <p>We will not share information with property agents, landlords, tenants, contractors or other parties unless there is an appropriate lawful basis and the disclosure is relevant to the services provided.</p>
            <h4>6. User Responsibilities</h4>
            <p>Users agree to:</p>
            <ul>
                <li>Provide accurate and truthful information.</li>
                <li>Use the Website only for lawful purposes.</li>
                <li>Respect the privacy and confidentiality of other users.</li>
                <li>Refrain from accessing information without authorisation.</li>
                <li>Keep account credentials secure.</li>
                <li>Avoid uploading false, fraudulent or misleading documents.</li>
                <li>Refrain from distributing personal or property-related information without lawful authorisation.</li>
            </ul>
            <p>Any unauthorised use of the Website or misuse of personal information may result in suspension or termination of access and, where appropriate, legal action.</p>
            <h4>7. Property Information and Documentation</h4>
            <p>Property-related information submitted to the Website remains subject to the rights of its lawful owners and other relevant parties.</p>
            <p>The Website does not claim ownership of documents uploaded by users.</p>
            <p>Documents and records will only be accessed, processed or used for legitimate property-related services.</p>
            <p>Users must ensure that they are legally entitled to upload or disclose any property documents or personal information belonging to another person.</p>
            <h4>8. Data Storage and Retention</h4>
            <p>Personal information will be stored securely and retained only for as long as reasonably necessary to fulfil the purposes for which it was collected, or as required or permitted by applicable law.</p>
            <p>Where information is no longer required, it will be securely deleted, destroyed or de-identified in accordance with applicable legal requirements.</p>
            <h4>9. User Rights</h4>
            <p>Subject to applicable law, users may:</p>
            <ul>
                <li>Request access to personal information held about them.</li>
                <li>Request corrections to inaccurate or outdated information.</li>
                <li>Request deletion of personal information where legally permissible.</li>
                <li>Object to certain processing activities.</li>
                <li>Withdraw consent where processing is based on consent.</li>
                <li>Lodge a complaint with the Information Regulator of South Africa.</li>
            </ul>
            <p>Requests may be submitted through the contact details provided on the Website.</p>
            <h4>10. Website Security</h4>
            <p>We aim to maintain a secure online environment through appropriate security controls, which may include encrypted connections, access restrictions, authentication measures and system monitoring.</p>
            <p>Users are responsible for protecting their login credentials and notifying us promptly of suspected unauthorised account activity.</p>
            <h4>11. Limitation of Liability</h4>
            <p>We will take reasonable steps to maintain the accuracy, availability and security of the Website.</p>
            <p>However, we cannot guarantee uninterrupted access or that the Website will always be free from technical errors.</p>
            <p>Nothing in these Terms and Conditions excludes or limits any liability or legal rights that cannot lawfully be excluded or limited under South African law.</p>
            <h4>12. Changes to Terms and Conditions</h4>
            <p>We reserve the right to update these Terms and Conditions and Privacy Policy when necessary to reflect changes in our services, technology or legal obligations.</p>
            <p>Material changes will be communicated to users through appropriate channels.</p>
            <p>The latest version will remain available on the Website.</p>
            <h4>13. Contact Information</h4>
            <p>For enquiries regarding these Terms and Conditions, privacy or personal information, please contact:</p>
            <p><strong>Website / Company Name:</strong> [Insert Name]</p>
            <p><strong>Email Address:</strong> [Insert Email]</p>
            <p><strong>Contact Number:</strong> [Insert Number]</p>
            <p><strong>Physical Address:</strong> [Insert Address]</p>
            <p><strong>Information Officer:</strong> [Insert Name or Contact Details]</p>
            <h4>14. Acceptance of Terms</h4>
            <p>By registering for or using the Website, users acknowledge that they have read and understood these Terms and Conditions.</p>
            <p>Where consent is legally required for particular processing activities, such consent will be requested separately and may be withdrawn in accordance with applicable law.</p>
            <p><strong>Our Commitment</strong></p>
            <p>We are committed to respecting user privacy, protecting confidential information and ensuring that personal and property-related information is handled responsibly, securely and lawfully.</p>
        </>
    );
}
