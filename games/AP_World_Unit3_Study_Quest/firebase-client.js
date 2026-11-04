const firebaseConfig = window.EMPIRE_QUEST_FIREBASE_CONFIG;
const recaptchaSiteKey = window.EMPIRE_QUEST_RECAPTCHA_SITE_KEY;
let generateCallable;
let appCheckInitialized = false;

window.generateStudyQuestions = async (sourceText, title) => {
  if (!firebaseConfig?.projectId || !firebaseConfig?.apiKey) {
    throw new Error("Firebase is not configured yet. Add your Firebase web app config to config.js and deploy the AI function.");
  }
  if (!recaptchaSiteKey) {
    throw new Error("Firebase App Check is not configured yet. Add its reCAPTCHA v3 site key to config.js.");
  }

  if (!generateCallable) {
    const [{ initializeApp, getApps, getApp }, { getAuth, signInAnonymously }, { getFunctions, httpsCallable }, { initializeAppCheck, ReCaptchaV3Provider }] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js"),
      import("https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js"),
      import("https://www.gstatic.com/firebasejs/11.0.2/firebase-app-check.js")
    ]);
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    if (!appCheckInitialized) {
      initializeAppCheck(app, { provider: new ReCaptchaV3Provider(recaptchaSiteKey), isTokenAutoRefreshEnabled: true });
      appCheckInitialized = true;
    }
    const auth = getAuth(app);
    if (!auth.currentUser) await signInAnonymously(auth);

    generateCallable = httpsCallable(getFunctions(app, "us-central1"), "generateStudyQuestions", { timeout: 120000 });
  }
  const result = await generateCallable({ sourceText, title });
  return result.data.questions;
};
