(function () {
  try {
    var t = localStorage.getItem("theme");
    if (!t) {
      t =
        window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    }
    document.documentElement.setAttribute("data-theme", t);
  } catch (e) {
    /* localStorage blocked — fall through to the default data-theme on <html>. */
  }
})();
