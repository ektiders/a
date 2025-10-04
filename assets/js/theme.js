// ------------------------------
// THEME SCRIPT (HEAD-READY)
// ------------------------------

// Toggle through light, dark, system
let toggleThemeSetting = () => {
  let current = document.documentElement.getAttribute("data-theme-setting") || "system";
  if (current === "system") setThemeSetting("light");
  else if (current === "light") setThemeSetting("dark");
  else setThemeSetting("system");
};

// Save and apply theme
let setThemeSetting = (themeSetting) => {
  localStorage.setItem("theme", themeSetting);
  document.documentElement.setAttribute("data-theme-setting", themeSetting);
  applyTheme();
};

// Apply theme to document & libraries
let applyTheme = () => {
  let theme = determineComputedTheme();

  transTheme();
  setHighlight(theme);
  setGiscusTheme(theme);
  setSearchTheme(theme);

  if (typeof mermaid !== "undefined") setMermaidTheme(theme);
  if (typeof Diff2HtmlUI !== "undefined") setDiff2htmlTheme(theme);
  if (typeof echarts !== "undefined") setEchartsTheme(theme);
  if (typeof Plotly !== "undefined") setPlotlyTheme(theme);
  if (typeof vegaEmbed !== "undefined") setVegaLiteTheme(theme);

  document.documentElement.setAttribute("data-theme", theme);

  // Table styling
  document.querySelectorAll("table").forEach(t => {
    if (theme === "dark") t.classList.add("table-dark");
    else t.classList.remove("table-dark");
  });

  // Medium-zoom background
  if (typeof medium_zoom !== "undefined") {
    medium_zoom.update({
      background: getComputedStyle(document.documentElement).getPropertyValue("--global-bg-color") + "ee",
    });
  }
};

// ------------------------------
// LIBRARY SUPPORT FUNCTIONS
// ------------------------------
let setHighlight = theme => {
  document.getElementById("highlight_theme_light").media = theme === "dark" ? "none" : "";
  document.getElementById("highlight_theme_dark").media = theme === "dark" ? "" : "none";
};

let setGiscusTheme = theme => {
  const iframe = document.querySelector("iframe.giscus-frame");
  if (!iframe) return;
  iframe.contentWindow.postMessage({ giscus: { setConfig: { theme: theme } } }, "https://giscus.app");
};

let addMermaidZoom = (records, observer) => {
  d3.selectAll(".mermaid svg").each(function () {
    let svg = d3.select(this);
    svg.html("<g>" + svg.html() + "</g>");
    let inner = svg.select("g");
    svg.call(d3.zoom().on("zoom", event => inner.attr("transform", event.transform)));
  });
  observer.disconnect();
};

let setMermaidTheme = theme => {
  theme = theme === "light" ? "default" : theme;
  document.querySelectorAll(".mermaid").forEach(elem => {
    let svgCode = elem.previousSibling.childNodes[0].innerHTML;
    elem.removeAttribute("data-processed");
    elem.innerHTML = svgCode;
  });
  mermaid.initialize({ theme: theme });
  window.mermaid.init(undefined, document.querySelectorAll(".mermaid"));
  const observable = document.querySelector(".mermaid svg");
  if (observable) {
    const observer = new MutationObserver(addMermaidZoom);
    observer.observe(observable, { childList: true });
  }
};

let setDiff2htmlTheme = theme => {
  document.querySelectorAll(".diff2html").forEach(elem => {
    let textData = elem.previousSibling.childNodes[0].innerHTML;
    elem.innerHTML = "";
    new Diff2HtmlUI(elem, textData, { colorScheme: theme, drawFileList: true, highlight: true, matching: "lines" }).draw();
  });
};

let setEchartsTheme = theme => {
  document.querySelectorAll(".echarts").forEach(elem => {
    let jsonData = elem.previousSibling.childNodes[0].innerHTML;
    echarts.dispose(elem);
    let chart = theme === "dark" ? echarts.init(elem, "dark-fresh-cut") : echarts.init(elem);
    chart.setOption(JSON.parse(jsonData));
  });
};

let setPlotlyTheme = theme => {
  document.querySelectorAll(".js-plotly-plot").forEach(elem => {
    let jsonData = JSON.parse(elem.previousSibling.childNodes[0].innerHTML);
    const darkLayout = { /* your existing dark template */ };
    const lightLayout = { /* your existing light template */ };

    jsonData.layout = jsonData.layout || {};
    jsonData.layout.template = theme === "dark" ? { ...darkLayout, ...jsonData.layout.template } : { ...lightLayout, ...jsonData.layout.template };
    Plotly.relayout(elem, jsonData.layout);
  });
};

let setVegaLiteTheme = theme => {
  document.querySelectorAll(".vega-lite").forEach(elem => {
    let jsonData = elem.previousSibling.childNodes[0].innerHTML;
    elem.innerHTML = "";
    vegaEmbed(elem, JSON.parse(jsonData), theme === "dark" ? { theme: "dark" } : {});
  });
};

let setSearchTheme = theme => {
  const ninjaKeys = document.querySelector("ninja-keys");
  if (!ninjaKeys) return;
  theme === "dark" ? ninjaKeys.classList.add("dark") : ninjaKeys.classList.remove("dark");
};

// ------------------------------
// HELPER FUNCTIONS
// ------------------------------
let transTheme = () => {
  document.documentElement.classList.add("transition");
  setTimeout(() => document.documentElement.classList.remove("transition"), 500);
};

let determineThemeSetting = () => {
  let t = localStorage.getItem("theme");
  return ["light", "dark", "system"].includes(t) ? t : "system";
};

let determineComputedTheme = () => {
  let s = determineThemeSetting();
  if (s === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return s;
};

// ------------------------------
// INITIALIZATION
// ------------------------------
let initTheme = () => {
  let themeSetting = determineThemeSetting();
  document.documentElement.setAttribute("data-theme-setting", themeSetting);
  applyTheme();

  const mode_toggle = document.getElementById("light-toggle");
  if (mode_toggle) mode_toggle.addEventListener("click", toggleThemeSetting);

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme);
};

// Call immediately
initTheme();
