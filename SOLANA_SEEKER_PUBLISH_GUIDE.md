# Publishing to Solana Seeker dApp Store

This guide outlines the steps to publish X-Booster to the Solana Seeker (formerly Saga) dApp Store.

## Prerequisites

-   **Solana Mobile Stack (SMS):** Your app should be compatible with the Solana Mobile Stack.
-   **APK File:** You need an Android build of your application. Since X-Booster is a web app, you will need to wrap it using a Trusted Web Activity (TWA) or build a React Native version. This guide focuses on the **TWA approach** (wrapping your existing web app).

---

## Step 1: Convert Web App to Android App (TWA)

The Solana dApp Store requires an Android Package Kit (APK). You can use **Bubblewrap** to convert your PWA (Progressive Web App) into an Android app.

1.  **Install Bubblewrap:**
    ```bash
    npm install -g @bubblewrap/cli
    ```

2.  **Initialize Project:**
    ```bash
    mkdir android-build && cd android-build
    bubblewrap init --manifest https://your-deployed-domain.com/manifest.json
    ```
    *Note: Ensure you have a valid `manifest.json` in your web project's `public` folder.*

3.  **Build the APK:**
    ```bash
    bubblewrap build
    ```
    This will generate an `app-release-signed.apk`.

---

## Step 2: Prepare Store Assets

You will need the following assets for your store listing:

-   **App Icon:** 512x512 px (PNG)
-   **Screenshots:** At least 2 screenshots (1080x1920 recommended)
-   **Banner:** 1024x500 px
-   **Description:** A clear description of your app's features (SocialFi, Earn, Boost, etc.).
-   **Privacy Policy URL:** Link to your privacy policy.

---

## Step 3: Submit to Solana dApp Store

1.  **Go to the Solana dApp Store Publisher Portal:**
    [https://dappstore.solanamobile.com/](https://dappstore.solanamobile.com/)

2.  **Create a New Release:**
    -   Upload your APK file.
    -   Fill in the metadata (Name, Description, Category: Social).

3.  **Solana Mobile Stack (SMS) Compliance:**
    -   Ensure your app detects `window.solana` properly (already implemented in `App.tsx`).
    -   The dApp Store reviews apps to ensure they function correctly on the Seeker device.

4.  **Submit for Review:**
    -   The review process typically takes a few days.
    -   Once approved, your app will be available for download on all Solana Seeker devices.

---

## Step 4: Post-Launch Marketing

-   **Twitter/X:** Announce your launch tagging @SolanaMobile.
-   **Discord:** Join the Solana Mobile Discord to share your app.
-   **Airdrops:** Consider airdropping tokens or points to Seeker holders (detected via wallet connection) to drive initial adoption.

---

## Technical Checklist for Seeker

-   [x] **Wallet Detection:** App checks for `window.solana` or `window.solflare`.
-   [x] **Responsive Design:** App fits the Seeker screen aspect ratio.
-   [ ] **Manifest.json:** Ensure you have a valid manifest file for PWA installation.
-   [ ] **HTTPS:** Your backend/frontend must be served over HTTPS.
