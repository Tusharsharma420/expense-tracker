# Security Policy

## Supported versions

This project is a static progressive web app. Security fixes are applied to the default branch and released through the hosted GitHub Pages build.

## Reporting a vulnerability

Please do not open a public issue for vulnerabilities that expose private data, API URLs, or backend access details.

Instead, contact the maintainer privately through the contact method shown on the GitHub profile that owns this repository. Include:

- A concise description of the vulnerability.
- Steps to reproduce or a proof of concept.
- Potential impact.
- Any suggested fix, if known.

## Data and privacy notes

- The frontend stores profile settings, avatars, categories, and cached transactions in the user's browser `localStorage`.
- The optional Google Apps Script backend URL is user-provided and should be treated like a deployment secret.
- Do not commit real family IDs, production Apps Script URLs, exported spreadsheets, or personal financial data to this repository.
