import React, { createContext, useState, useEffect } from "react";

// Default static assets
const DEFAULT_LOGIN_LOGO = "/IAF_login_logo.png";
const DEFAULT_NAVBAR_LOGO = "/download.png";
const DEFAULT_FAVICON = "/airforce-favicon.ico";
const DEFAULT_SLOGAN =
  "AccessArc is a robust license management system designed to streamline and curate your company software privileges. It ensures efficient allocation and monitoring of licenses, optimizing usage and compliance. With AccessArc, you gain full control over your software assets, reducing costs and enhancing operational efficiency.";
const DEFAULT_APP_NAME = "IMIR";

export const NAVBAR_LOGO_STYLE = {
  height: { xs: "35px", sm: "40px", md: "45px", lg: "50px" },
  width: "auto",
  objectFit: "contain",
  transform: {
    xs: "scale(1.8)",
    sm: "scale(2.0)",
    md: "scale(2.4)",
    lg: "scale(2.8)",
  },
  transformOrigin: "left center",
  imageRendering: "auto",
  backfaceVisibility: "hidden",
  WebkitFontSmoothing: "antialiased",
  transition: "all 0.3s ease-in-out",
};

export const LogoContext = createContext();

export const LogoProvider = ({ children }) => {
  const [logoData, setLogoData] = useState({
    loginImage: DEFAULT_LOGIN_LOGO,
    mainApplogo: DEFAULT_NAVBAR_LOGO,
    favicon: DEFAULT_FAVICON,
    slogan: DEFAULT_SLOGAN,
    appName: DEFAULT_APP_NAME,
  });
  const [loading, setLoading] = useState(true);
  const hasFetched = React.useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchLogoData = async () => {
      try {
        // Adjust endpoint based on your setup. Assuming relative path works with proxy.
        // If not, you might need process.env.REACT_APP_API_URL or similar.
        const url = `${window.__ENV__?.REACT_APP_ROUTE || ""}/tenants/public/getLogoData`;

        const response = await fetch(url, {
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();

          // Check if data has valid images, otherwise stick to defaults
          setLogoData({
            loginImage: data.loginImage || DEFAULT_LOGIN_LOGO,
            mainApplogo: data.mainApplogo || DEFAULT_NAVBAR_LOGO,
            favicon: data.favicon || DEFAULT_FAVICON,
            slogan: data.slogan || DEFAULT_SLOGAN,
            appName: data.appName || DEFAULT_APP_NAME,
          });

          // Update Title dynamically
          document.title = data.appName || DEFAULT_APP_NAME;

          // Update Favicon dynamically
          if (data.favicon) {
            updateFavicon(data.favicon);
          }
        }
      } catch (error) {
        console.error("Failed to fetch logo data:", error);
        // Fallback is already set in initial state
      } finally {
        setLoading(false);
      }
    };

    fetchLogoData();
  }, []);

  const updateFavicon = (href) => {
    if (!href) return;

    const head = document.getElementsByTagName("head")[0];

    // Remove existing favicon links to avoid browser confusion
    const existingLinks = document.querySelectorAll("link[rel*='icon']");
    existingLinks.forEach((link) => head.removeChild(link));

    // Create new icon link
    const link = document.createElement("link");
    link.type = href.startsWith("data:image/png")
      ? "image/png"
      : "image/x-icon";
    link.rel = "icon";
    link.href = href;
    head.appendChild(link);

    // Create new shortcut icon link (for older browsers)
    const shortcutLink = document.createElement("link");
    shortcutLink.type = link.type;
    shortcutLink.rel = "shortcut icon";
    shortcutLink.href = href;
    head.appendChild(shortcutLink);
  };

  return (
    <LogoContext.Provider value={{ logoData, loading }}>
      {children}
    </LogoContext.Provider>
  );
};
