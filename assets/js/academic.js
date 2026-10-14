(() => {
  const root = document.documentElement;
  const colorPreference = window.matchMedia("(prefers-color-scheme: dark)");
  let savedTheme;

  try {
    savedTheme = localStorage.getItem("theme");
  } catch {
    savedTheme = null;
  }

  root.dataset.theme = savedTheme === "dark" || savedTheme === "light"
    ? savedTheme
    : colorPreference.matches ? "dark" : "light";

  document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.querySelector(".theme-toggle");
    const themeColor = document.querySelector('meta[name="theme-color"]');

    const updateToggle = () => {
      const isDark = root.dataset.theme === "dark";
      toggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} theme`);
      toggle.setAttribute("aria-pressed", String(isDark));
      toggle.title = toggle.getAttribute("aria-label");
      themeColor.content = isDark ? "#151c25" : "#ffffff";
    };

    if (!toggle) return;
    toggle.hidden = false;
    updateToggle();

    toggle.addEventListener("click", () => {
      root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("theme", root.dataset.theme);
      } catch {
        savedTheme = root.dataset.theme;
      }
      updateToggle();
    });
  });
})();
