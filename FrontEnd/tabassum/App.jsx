/* =========================================================
   VALORA - GLOBAL STYLES
   =========================================================
   PURPOSE:
   Global styling used across the entire VALORA application.

   PROJECT THEME:
   Primary Purple: #563F6B
   RGB: 86, 63, 107

   Page-specific styling:
   - home.css  → Aishwariya's Home/Landing Page
   - auth.css  → Linda's Login/Register
   - App.css   → Tabassum's Dashboard and system pages
   ========================================================= */


/* =========================================================
   GLOBAL VARIABLES
   ========================================================= */

:root {
  --primary: #563F6B;
  --primary-dark: #463256;
  --primary-light: #f1edf3;

  --white: #ffffff;

  --background: #f5f3f7;
  --surface: #ffffff;

  --text: #333333;
  --text-dark: #222222;
  --text-light: #777777;
  --text-muted: #999999;

  --border: #ddd7e2;

  --success: #27632a;
  --success-bg: #eef9f0;

  --danger: #a00000;
  --danger-bg: #ffe0e0;

  --shadow: 0 4px 15px rgba(0, 0, 0, 0.08);

  --font-main: Arial, Helvetica, sans-serif;

  font-family: var(--font-main);

  font-synthesis: none;
  text-rendering: optimizeLegibility;

  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}


/* =========================================================
   GLOBAL RESET
   ========================================================= */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}


/* =========================================================
   HTML & BODY
   ========================================================= */

html {
  width: 100%;
  min-height: 100%;
}

body {
  width: 100%;
  min-height: 100vh;

  margin: 0;

  font-family: var(--font-main);

  background: var(--background);
  color: var(--text);

  line-height: 1.5;
}


/* =========================================================
   ROOT REACT CONTAINER
   ========================================================= */

#root {
  width: 100%;
  min-height: 100vh;

  margin: 0;

  box-sizing: border-box;
}


/* =========================================================
   HEADINGS
   ========================================================= */

h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: var(--font-main);

  color: var(--text-dark);

  font-weight: 700;
}

h1 {
  font-size: 42px;
  line-height: 1.15;
}

h2 {
  font-size: 34px;
  line-height: 1.2;
}

h3 {
  font-size: 22px;
  line-height: 1.3;
}

h4 {
  font-size: 18px;
}


/* =========================================================
   PARAGRAPHS
   ========================================================= */

p {
  margin: 0;
  line-height: 1.6;
}


/* =========================================================
   LINKS
   ========================================================= */

a {
  color: var(--primary);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}


/* =========================================================
   BUTTONS
   ========================================================= */

button {
  font-family: inherit;
}


/* =========================================================
   FORM ELEMENTS
   ========================================================= */

input,
select,
textarea,
button {
  font-family: inherit;
}


/* =========================================================
   IMAGES
   ========================================================= */

img {
  max-width: 100%;
}


/* =========================================================
   SELECTION
   ========================================================= */

::selection {
  background: var(--primary);
  color: var(--white);
}


/* =========================================================
   MOBILE GLOBAL SETTINGS
   ========================================================= */

@media (max-width: 1024px) {

  h1 {
    font-size: 36px;
  }

  h2 {
    font-size: 30px;
  }
}


/* =========================================================
   SMALL MOBILE
   ========================================================= */

@media (max-width: 600px) {

  h1 {
    font-size: 32px;
  }

  h2 {
    font-size: 26px;
  }

  body {
    font-size: 15px;
  }
}
