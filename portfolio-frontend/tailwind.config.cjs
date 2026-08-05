/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  mode: "jit",
  // Dark is the DEFAULT here, not a media-query opt-in. `class` means the theme
  // is whatever `<html class="dark">` says, and the blocking script in
  // index.html puts that class there before the first paint. Deliberately NOT
  // `media`: prefers-color-scheme would hand a light-mode visitor a light site,
  // and this site is designed dark-first.
  darkMode: "class",
  theme: {
    extend: {
      // ---------------------------------------------------------------------
      // Display type scale, one step down.
      //
      // The section headings were `text-3xl sm:text-4xl lg:text-5xl`, which on a
      // laptop is a 48px word sitting over 14px card copy. That is poster
      // proportion, not portfolio proportion, and it is why the page read as a
      // template: everything was scaled up a notch, so less fitted on screen and
      // nothing looked considered.
      //
      // This is done at the TOKEN level rather than by rewriting each component
      // for one specific reason: Projects.jsx carries the same heading classes
      // and is owned elsewhere. Retuning the six sections by hand would have
      // left Projects alone at 48px, and one heading out of scale is worse than
      // all seven being slightly too big. Moving the token moves every user of
      // it in lockstep, including files this change does not touch.
      //
      // These four steps are used almost exclusively by the section-heading
      // triple and the hero heading, so the override is narrow in practice:
      //   2xl  24 -> 22   card and panel titles
      //   3xl  30 -> 24   section <h2> on a phone
      //   4xl  36 -> 28   section <h2> on a tablet
      //   5xl  48 -> 32   section <h2> on a laptop and up
      // Everything at text-xl and below is left alone: shrinking sub-headings
      // as well would flatten them into the 16px body copy and lose the
      // hierarchy this is trying to sharpen. The 13px phone floor is nowhere
      // near any of these.
      fontSize: {
        "2xl": ["1.375rem", { lineHeight: "1.75rem" }],
        "3xl": ["1.5rem", { lineHeight: "1.875rem" }],
        "4xl": ["1.75rem", { lineHeight: "2.125rem" }],
        "5xl": ["2rem", { lineHeight: "2.375rem" }],
      },

      // ---------------------------------------------------------------------
      // Section rhythm, one step down.
      //
      // Every section is `py-12 sm:py-16 lg:py-20` and every chapter eyebrow is
      // `pt-12 sm:pt-16 lg:pt-20`, so on a laptop each one spent 80px of pure
      // whitespace at each end. Same reasoning as the type scale: Projects.jsx
      // uses the identical triple and cannot be edited here, so the number has
      // to move under all of them at once or the page develops a limp.
      //
      // PADDING only, deliberately not `spacing`. Overriding `spacing` would
      // drag w-12, h-12, gap-12 and every margin along with it, and w-12/h-12 is
      // the icon tile size used all over the cards. These three keys are used
      // for section padding and nothing else on the page (Contact's input
      // right-padding was pinned to a literal so it keeps clearing its
      // validation tick).
      //   12  48 -> 40
      //   16  64 -> 48
      //   20  80 -> 56
      padding: {
        12: "2.5rem",
        16: "3rem",
        20: "3.5rem",
      },

      colors: {
        /* primary: "#050816", */
        primary: "#0f0c0b",
        secondary: "#aaa6c3",
        tertiary: "#151030",
        "black-100": "#100d25",
        "black-200": "#090325",
        "white-100": "#f3f3f3",
      },
      boxShadow: {
        card: "0px 35px 120px -15px #211e35",
      },
      screens: {
        xs: "450px",
      },
      backgroundImage: {
        "hero-pattern": "url('/src/assets/spacebg.png')",
      },

      // NOTE: the hero's motion is all inside a WebGL scene
      // (src/components/visuals/PortraitFieldScene.jsx), so it needs no CSS
      // keyframes here. An earlier attempt animated an SVG neural-network
      // diagram through `trace` and `nodefire` keyframes declared at this spot;
      // the diagram was cut, so the keyframes went with it rather than being
      // left behind to ship dead CSS forever.
    },
  },
  plugins: [],
};
