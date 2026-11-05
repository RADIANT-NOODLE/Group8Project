import "./ValoraLogo.css";

/**
 * The logo. On a phone set to dark mode it switches to the white logo on a dark plate.
 * The site has no dark mode of its own, so the page may stay white on such a phone.
 * The plate keeps the white logo visible whether or not the browser darkens the page.
 * The media query here must match the one in ValoraLogo.css.
 */
export default function ValoraLogo({ alt, className = "" }) {
    return (
        <picture className="valora-logo-picture">
            <source media="(max-width: 900px) and (prefers-color-scheme: dark)" srcSet="/assets/valora-logo-white.png" />
            <img src="/assets/valora-logo.jpg" alt={alt} className={`valora-logo-image ${className}`.trim()} />
        </picture>
    );
}
