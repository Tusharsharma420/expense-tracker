# Backend Setup Instructions

1.  **Create a Google Sheet**
    *   Go to [sheets.new](https://sheets.new)
    *   Name it "Expense Tracker DB"

2.  **Open Apps Script**
    *   In the Sheet, go to `Extensions` > `Apps Script`.
    *   Delete any code in the editor.

3.  **Paste Code**
    *   Copy the content of [Code.js](./Code.js) and paste it into the script editor.
    *   Save the project (Cmd/Ctrl + S).

4.  **Initial Setup**
    *   In the toolbar, select `setupSheets` from the function dropdown.
    *   Click **Run**.
    *   Review permissions (Click "Review permissions", choose your account, click "Advanced" > "Go to ... (unsafe)", then "Allow").
    *   *Verify*: Go back to your Sheet, you should see "Transactions", "Families", and "Persons" tabs.

5.  **Deploy as Web App**
    *   Click `Deploy` (top right) > `New deployment`.
    *   Select type: `Web app`.
    *   Description: "v1".
    *   **Execute as**: `Me` (your email).
    *   **Who has access**: `Anyone` (Important for the Android app to access it without complex OAuth flows for this MVP).
    *   Click `Deploy`.

6.  **Get URL**
    *   Copy the `Web App URL` (starts with `https://script.google.com/macros/s/...`).
    *   **Paste this URL** into `app/app.js` (we will create this shortly) as the `API_URL`.
