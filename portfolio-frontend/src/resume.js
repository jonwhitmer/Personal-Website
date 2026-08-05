// The one place the resume lives. Both the desktop preview modal (Portfolio.jsx)
// and the mobile/tablet download button (Header.jsx) read from here.
//
// They used to hold separate hard-coded strings, and the mobile one was never
// filled in — it pointed at "/path-to-your-resume.pdf", so the Resume button
// downloaded nothing at all on any screen under 1024px. One constant means the
// next resume swap cannot leave half the site behind.
//
// The file itself is portfolio-frontend/public/doc/, copied from
// C:\Users\jonwh\Documents\Internship\JonWhitmer_Resume2026.pdf
export const RESUME_PATH = '/doc/JonWhitmer_Resume2026.pdf';

// What the file is called once it lands in someone's Downloads folder.
export const RESUME_FILENAME = 'Jon_Whitmer_Resume.pdf';
