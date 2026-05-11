const appCatalog = [
  { id: "gmail", name: "Gmail", url: "https://mail.google.com", color: "#d94f43", notifications: true, notificationCount: 0 },
  { id: "github", name: "GitHub", url: "https://github.com", color: "#24292f", notifications: true, notificationCount: 0 },
  { id: "slack", name: "Slack", url: "https://slack.com/signin", color: "#4a154b", notifications: true, notificationCount: 0 },
  { id: "notion", name: "Notion", url: "https://www.notion.so", color: "#111111", notifications: true, notificationCount: 0 },
  { id: "calendar", name: "Calendar", url: "https://calendar.google.com", color: "#3478f6", notifications: true, notificationCount: 0 },
  { id: "linear", name: "Linear", url: "https://linear.app", color: "#5e6ad2", notifications: true, notificationCount: 0 },
  { id: "chatgpt", name: "ChatGPT", url: "https://chatgpt.com", color: "#10a37f", notifications: true, notificationCount: 0 }
];

const starterState = {
  density: "normal",
  skin: "biscuit",
  customSkin: {
    cream: "#f6f4ee",
    sidebar: "#eee8de",
    accent: "#e16f43"
  },
  settingsOpen: false,
  settingsSection: "general",
  maskUrl: false,
  sidebarCollapsed: false,
  secretsHidden: false,
  showHiddenApps: false,
  workspaces: [
    { id: "work", name: "Work", icon: "W", color: "#e16f43" },
    { id: "personal", name: "Personal", icon: "P", color: "#f8f3ea" }
  ],
  activeWorkspaceId: "work",
  appsByWorkspace: {
    work: appCatalog.slice(0, 5),
    personal: [appCatalog[3], appCatalog[6]]
  },
  activeAppByWorkspace: {
    work: "gmail",
    personal: "notion"
  },
  tabsByApp: {}
};

let state = loadState();
let activeTabId = null;
let contextMenu = null;
let workspaceMenu = null;
let propertiesAppId = null;
let propertiesWorkspaceId = null;
let shareDraft = null;
let pageMenu = null;

const root = document.getElementById("app");

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem("cookiers.state"));
    return migrateState(stored && stored.workspaces ? stored : starterState);
  } catch {
    return migrateState(starterState);
  }
}

function migrateState(input) {
  const next = structuredClone(input);
  next.density ||= "normal";
  next.skin ||= "biscuit";
  next.customSkin ||= starterState.customSkin;
  next.settingsOpen = Boolean(next.settingsOpen);
  next.settingsSection ||= "general";
  next.maskUrl = Boolean(next.maskUrl);
  next.sidebarCollapsed = Boolean(next.sidebarCollapsed);
  next.secretsHidden = Boolean(next.secretsHidden);
  next.showHiddenApps = Boolean(next.showHiddenApps);
  next.workspaces = (next.workspaces || starterState.workspaces).map((workspace, index) => ({
    color: index === 0 ? "#e16f43" : "#f8f3ea",
    highlightColor: "",
    iconImage: "",
    ...workspace
  }));
  Object.keys(next.appsByWorkspace || {}).forEach((workspaceId) => {
    next.appsByWorkspace[workspaceId] = next.appsByWorkspace[workspaceId].map((app) => ({
      notifications: true,
      notificationCount: 0,
      hidden: false,
      iconImage: "",
      highlightColor: "",
      color: "#e16f43",
      ...app
    }));
  });
  next.tabsByApp ||= {};
  Object.keys(next.tabsByApp).forEach((appId) => {
    next.tabsByApp[appId] = next.tabsByApp[appId].map((tab) => ({ secret: false, ...tab }));
  });
  return next;
}

function saveState() {
  localStorage.setItem("cookiers.state", JSON.stringify(state));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function normalizeUrl(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "about:blank";
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("about:")) return trimmed;
  if (trimmed.includes(".") && !trimmed.includes(" ")) return `https://${trimmed}`;
  return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
}

function hostnameFromUrl(url) {
  try {
    return new URL(normalizeUrl(url)).hostname;
  } catch {
    return "";
  }
}

function faviconUrl(url) {
  const domain = hostnameFromUrl(url);
  return domain ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64` : "";
}

function activeWorkspace() {
  return state.workspaces.find((workspace) => workspace.id === state.activeWorkspaceId) || state.workspaces[0];
}

function activeApps() {
  return state.appsByWorkspace[state.activeWorkspaceId] || [];
}

function visibleApps() {
  const apps = activeApps();
  return state.showHiddenApps ? apps : apps.filter((app) => !app.hidden);
}

function activeApp() {
  const apps = visibleApps();
  const id = state.activeAppByWorkspace[state.activeWorkspaceId] || apps[0]?.id;
  return apps.find((app) => app.id === id) || apps[0];
}

function findApp(appId) {
  return activeApps().find((app) => app.id === appId);
}

function findWorkspace(workspaceId) {
  return state.workspaces.find((workspace) => workspace.id === workspaceId);
}

function tabsFor(appId) {
  if (!state.tabsByApp[appId]) {
    const app = [...appCatalog, ...activeApps()].find((item) => item.id === appId);
    state.tabsByApp[appId] = [
      {
        id: `${appId}-${Date.now()}`,
        title: app?.name || "Nouvel onglet",
        url: app?.url || "about:blank",
        secret: false
      }
    ];
  }
  return state.tabsByApp[appId];
}

function visibleTabsFor(appId) {
  const tabs = tabsFor(appId);
  return state.secretsHidden ? tabs.filter((tab) => !tab.secret) : tabs;
}

function ensureVisibleActiveTab(appId) {
  const visibleTabs = visibleTabsFor(appId);
  if (!visibleTabs.length) {
    activeTabId = null;
    return null;
  }
  const active = visibleTabs.find((tab) => tab.id === activeTabId) || visibleTabs[0];
  activeTabId = active.id;
  return active;
}

function getActiveTab() {
  const app = activeApp();
  if (!app) return null;
  return ensureVisibleActiveTab(app.id);
}

function applyChromeSettings() {
  document.body.className = `density-${state.density} skin-${state.skin}`;
  const skin = state.skin === "custom" ? state.customSkin : null;
  document.body.style.setProperty("--custom-cream", skin?.cream || "");
  document.body.style.setProperty("--custom-sidebar", skin?.sidebar || "");
  document.body.style.setProperty("--custom-accent", skin?.accent || "");
}

function setDensity(density) {
  state.density = density;
  saveState();
  render();
}

function setSkin(skin) {
  state.skin = skin;
  saveState();
  render();
}

function updateCustomSkin(formData) {
  state.skin = "custom";
  state.customSkin = {
    cream: String(formData.get("cream") || state.customSkin.cream),
    sidebar: String(formData.get("sidebar") || state.customSkin.sidebar),
    accent: String(formData.get("accent") || state.customSkin.accent)
  };
  saveState();
  render();
}

function openSettings(section = "general") {
  state.settingsOpen = true;
  state.settingsSection = section;
  saveState();
  render();
}

function closeSettings() {
  state.settingsOpen = false;
  saveState();
  render();
}

function setSettingsSection(section) {
  state.settingsSection = section;
  saveState();
  render();
}

function toggleMaskUrl() {
  state.maskUrl = !state.maskUrl;
  saveState();
  render();
}

function toggleSidebar() {
  state.sidebarCollapsed = !state.sidebarCollapsed;
  saveState();
  render();
}

function selectWorkspace(id) {
  state.activeWorkspaceId = id;
  const app = activeApp();
  activeTabId = app ? visibleTabsFor(app.id)[0]?.id || null : null;
  closeMenus();
  saveState();
  render();
}

function selectWorkspaceByOffset(offset) {
  const index = state.workspaces.findIndex((workspace) => workspace.id === state.activeWorkspaceId);
  const next = (index + offset + state.workspaces.length) % state.workspaces.length;
  selectWorkspace(state.workspaces[next].id);
}

function selectApp(id) {
  state.activeAppByWorkspace[state.activeWorkspaceId] = id;
  activeTabId = visibleTabsFor(id)[0]?.id || null;
  closeMenus();
  saveState();
  render();
}

function selectTab(id) {
  activeTabId = id;
  closeMenus();
  render();
}

function closeTab(id) {
  const app = activeApp();
  const tabs = tabsFor(app.id);
  if (tabs.length === 1) return;
  state.tabsByApp[app.id] = tabs.filter((tab) => tab.id !== id);
  activeTabId = visibleTabsFor(app.id)[0]?.id || null;
  saveState();
  render();
}

function createTab(url, secret = false) {
  const app = activeApp();
  if (!app) return;
  const tab = {
    id: `${app.id}-${Date.now()}`,
    title: secret ? "Secret" : "Nouvel onglet",
    url: normalizeUrl(url || app.url),
    secret
  };
  state.tabsByApp[app.id] = [...tabsFor(app.id), tab];
  activeTabId = tab.id;
  state.secretsHidden = false;
  saveState();
  render();
}

function updateActiveTabUrl(url) {
  const app = activeApp();
  const tab = getActiveTab();
  if (!app || !tab) return;
  tab.url = normalizeUrl(url);
  tab.title = tab.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  saveState();
  render();
}

function toggleActiveTabSecret() {
  const tab = getActiveTab();
  if (!tab) return;
  tab.secret = !tab.secret;
  if (tab.secret) state.secretsHidden = false;
  saveState();
  render();
}

function toggleSecretsHidden() {
  state.secretsHidden = !state.secretsHidden;
  const app = activeApp();
  if (app) ensureVisibleActiveTab(app.id);
  saveState();
  render();
}

function toggleHiddenApps() {
  state.showHiddenApps = !state.showHiddenApps;
  const app = activeApp();
  if (app) state.activeAppByWorkspace[state.activeWorkspaceId] = app.id;
  saveState();
  render();
}

function addWorkspace() {
  const index = state.workspaces.length + 1;
  const id = `group-${Date.now()}`;
  const workspace = {
    id,
    name: `Groupe ${index}`,
    icon: String(index).slice(-1),
    iconImage: "",
    color: "#f8f3ea",
    highlightColor: ""
  };
  state.workspaces = [...state.workspaces, workspace];
  state.appsByWorkspace[id] = [];
  state.activeAppByWorkspace[id] = null;
  state.activeWorkspaceId = id;
  propertiesWorkspaceId = id;
  saveState();
  render();
}

function addCustomApp({ name, url }) {
  const normalized = normalizeUrl(url);
  const id = `${String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
  const app = {
    id,
    name: String(name).trim() || "App",
    url: normalized,
    color: "#e16f43",
    highlightColor: "",
    iconImage: "",
    notifications: true,
    notificationCount: 0,
    hidden: false
  };
  state.appsByWorkspace[state.activeWorkspaceId] = [...activeApps(), app];
  state.activeAppByWorkspace[state.activeWorkspaceId] = id;
  state.tabsByApp[id] = [{ id: `${id}-home`, title: app.name, url: normalized, secret: false }];
  activeTabId = `${id}-home`;
  saveState();
  render();
}

function updateAppProperties(appId, formData) {
  const app = findApp(appId);
  if (!app) return;
  app.name = String(formData.get("name") || app.name).trim();
  app.url = normalizeUrl(formData.get("url"));
  app.color = String(formData.get("color") || app.color);
  app.highlightColor = String(formData.get("highlightColor") || "");
  app.iconImage = String(formData.get("iconImage") || "").trim();
  app.notifications = formData.get("notifications") === "on";
  app.notificationCount = Number(formData.get("notificationCount") || 0);
  app.hidden = formData.get("hidden") === "on";
  const homeTab = tabsFor(app.id)[0];
  homeTab.title = app.name;
  homeTab.url = app.url;
  propertiesAppId = null;
  saveState();
  render();
}

function toggleAppHidden(appId) {
  const app = findApp(appId);
  if (!app) return;
  app.hidden = !app.hidden;
  if (app.hidden && state.activeAppByWorkspace[state.activeWorkspaceId] === appId) {
    const next = visibleApps().find((item) => item.id !== appId);
    if (next) state.activeAppByWorkspace[state.activeWorkspaceId] = next.id;
  }
  saveState();
  render();
}

function updateWorkspaceProperties(workspaceId, formData) {
  const workspace = findWorkspace(workspaceId);
  if (!workspace) return;
  workspace.name = String(formData.get("name") || workspace.name).trim();
  workspace.icon = String(formData.get("icon") || workspace.icon).trim().slice(0, 2).toUpperCase();
  workspace.iconImage = String(formData.get("iconImage") || "").trim();
  workspace.color = String(formData.get("color") || workspace.color);
  workspace.highlightColor = String(formData.get("highlightColor") || "");
  propertiesWorkspaceId = null;
  saveState();
  render();
}

function duplicateApp(appId) {
  const app = findApp(appId);
  if (!app) return;
  const copy = { ...app, id: `${app.id}-copy-${Date.now()}`, name: `${app.name} 2` };
  copy.hidden = false;
  state.appsByWorkspace[state.activeWorkspaceId] = [...activeApps(), copy];
  state.tabsByApp[copy.id] = [{ id: `${copy.id}-home`, title: copy.name, url: copy.url, secret: false }];
  selectApp(copy.id);
}

function deleteApp(appId) {
  const apps = activeApps();
  if (apps.length <= 1) return;
  state.appsByWorkspace[state.activeWorkspaceId] = apps.filter((app) => app.id !== appId);
  delete state.tabsByApp[appId];
  state.activeAppByWorkspace[state.activeWorkspaceId] = state.appsByWorkspace[state.activeWorkspaceId][0].id;
  activeTabId = visibleTabsFor(state.activeAppByWorkspace[state.activeWorkspaceId])[0]?.id || null;
  saveState();
  render();
}

function moveWorkspace(sourceId, targetId) {
  if (sourceId === targetId) return;
  const sourceIndex = state.workspaces.findIndex((workspace) => workspace.id === sourceId);
  const targetIndex = state.workspaces.findIndex((workspace) => workspace.id === targetId);
  if (sourceIndex < 0 || targetIndex < 0) return;
  const [item] = state.workspaces.splice(sourceIndex, 1);
  state.workspaces.splice(targetIndex, 0, item);
  saveState();
  render();
}

function moveApp(sourceId, targetId) {
  if (sourceId === targetId) return;
  const apps = activeApps();
  const sourceIndex = apps.findIndex((app) => app.id === sourceId);
  const targetIndex = apps.findIndex((app) => app.id === targetId);
  if (sourceIndex < 0 || targetIndex < 0) return;
  const [item] = apps.splice(sourceIndex, 1);
  apps.splice(targetIndex, 0, item);
  state.appsByWorkspace[state.activeWorkspaceId] = apps;
  saveState();
  render();
}

function exportConfig() {
  const payload = JSON.stringify(state, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `cookiers-config-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function readIconUpload(file, callback) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => callback(String(reader.result || ""));
  reader.readAsDataURL(file);
}

function importConfig(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(String(reader.result || ""));
      state = migrateState(imported);
      activeTabId = null;
      saveState();
      render();
    } catch {
      alert("JSON config invalide.");
    }
  };
  reader.readAsText(file);
}

function iconText(name) {
  return String(name)
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function partitionFor(workspaceId, appId, tab) {
  return tab.secret ? `persist:cookiers-secret-${workspaceId}-${appId}-${tab.id}` : `persist:cookiers-${workspaceId}-${appId}`;
}

function densityLabel(value) {
  return { compact: "A", normal: "B", large: "C" }[value];
}

function notificationBadge(app) {
  if (!app.notifications || !app.notificationCount) return "";
  return `<span class="notification-badge">${app.notificationCount > 99 ? "99+" : app.notificationCount}</span>`;
}

function incrementNotification(appId) {
  const app = findApp(appId);
  if (!app || !app.notifications) return;
  app.notificationCount = Number(app.notificationCount || 0) + 1;
  saveState();
  render();
}

function installNotificationHook(webview) {
  const script = `
    (() => {
      if (window.__cookiersNotificationHooked || !window.Notification) return;
      window.__cookiersNotificationHooked = true;
      const NativeNotification = window.Notification;
      const report = (payload) => {
        try {
          console.info("__COOKIERS_NOTIFICATION__" + JSON.stringify(payload || {}));
        } catch {}
      };
      function WrappedNotification(title, options) {
        report({ title: String(title || ""), body: String((options && options.body) || "") });
        return new NativeNotification(title, options);
      }
      WrappedNotification.permission = NativeNotification.permission;
      WrappedNotification.requestPermission = (...args) => NativeNotification.requestPermission(...args);
      WrappedNotification.prototype = NativeNotification.prototype;
      try {
        Object.defineProperty(window, "Notification", { configurable: true, writable: true, value: WrappedNotification });
      } catch {}
    })();
  `;
  webview.executeJavaScript(script).catch(() => {});
}

function parseNotificationCount(title) {
  const match = String(title || "").match(/^\((\d+)\)/);
  return match ? Number(match[1]) : 0;
}

async function openShareModal() {
  const tab = getActiveTab();
  const webview = document.querySelector("webview.active");
  if (!tab || !webview) return;
  let selectedText = "";
  try {
    selectedText = await webview.executeJavaScript("String(window.getSelection && window.getSelection().toString() || '')");
  } catch {
    selectedText = "";
  }
  shareDraft = {
    text: selectedText.trim(),
    title: tab.title,
    url: tab.url
  };
  render();
}

function shareText() {
  if (!shareDraft) return "";
  const intro = shareDraft.text ? `${shareDraft.text}\n\n` : `${shareDraft.title}\n`;
  return `${intro}${shareDraft.url}`;
}

function shareTo(target) {
  if (!shareDraft) return;
  const text = shareText();
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(shareDraft.url);
  if (target === "copy") window.cookiers.copyText(text);
  if (target === "x") window.cookiers.openExternal(`https://twitter.com/intent/tweet?text=${encodedText}`);
  if (target === "linkedin") window.cookiers.openExternal(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`);
  if (target === "mail") window.cookiers.openExternal(`mailto:?subject=${encodeURIComponent(shareDraft.title)}&body=${encodedText}`);
  if (target === "buffer") window.cookiers.openExternal(`https://buffer.com/add?text=${encodedText}&url=${encodedUrl}`);
  if (target === "copy") {
    shareDraft = null;
    render();
  }
}

function closeMenus() {
  contextMenu = null;
  workspaceMenu = null;
  pageMenu = null;
}

function render() {
  applyChromeSettings();
  const workspace = activeWorkspace();
  const apps = visibleApps();
  const app = activeApp();
  const tabs = app ? tabsFor(app.id) : [];
  const visibleTabs = app ? visibleTabsFor(app.id) : [];
  const tab = getActiveTab();
  const shellClasses = ["shell", state.sidebarCollapsed ? "sidebar-icons" : "", state.secretsHidden ? "secrets-hidden" : "", state.maskUrl ? "url-masked" : ""].filter(Boolean).join(" ");

  root.innerHTML = `
    <main class="${shellClasses}">
      <aside class="workspace-rail" aria-label="Workspaces">
        ${state.workspaces
          .map(
            (item, index) => `
              <button class="workspace-button ${item.id === workspace.id ? "active" : ""}" draggable="true" data-workspace="${item.id}" title="${escapeHtml(item.name)} - Cmd/Ctrl+${index + 1}" style="background:${item.id === workspace.id ? "var(--accent)" : escapeHtml(item.color)};--highlight:${escapeHtml(item.highlightColor || "transparent")}">
                ${item.iconImage ? `<img src="${escapeHtml(item.iconImage)}" alt="" />` : escapeHtml(item.icon)}
              </button>
            `
          )
          .join("")}
        <div class="workspace-spacer"></div>
        <button class="add-workspace" title="Propriétés du groupe actif" data-workspace-properties="${workspace.id}">⚙</button>
      </aside>

      <aside class="app-sidebar">
        <header class="brand cookie-brand">
          <div class="brand-copy">
            <div class="brand-title">${escapeHtml(workspace.name)}</div>
          </div>
          <button class="collapse-button" data-toggle-sidebar title="Réduire la colonne apps">${state.sidebarCollapsed ? "›" : "‹"}</button>
        </header>

        <section class="sidebar-section">
          <div class="app-list">
            ${apps
              .map((item) => {
                const icon = item.iconImage || faviconUrl(item.url);
                return `
                  <button class="app-button cookie-app ${app?.id === item.id ? "active" : ""} ${item.hidden ? "hidden-app" : ""}" draggable="true" data-app="${item.id}" data-menu-app="${item.id}" title="${escapeHtml(item.name)}" style="--highlight:${escapeHtml(item.highlightColor || "transparent")}">
                    <span class="app-icon-wrap">
                      <span class="app-icon" style="background:${escapeHtml(item.color)}">
                        ${icon ? `<img src="${escapeHtml(icon)}" alt="" />` : escapeHtml(iconText(item.name))}
                      </span>
                      ${notificationBadge(item)}
                    </span>
                    <span class="app-copy">
                      <span class="app-name">${escapeHtml(item.name)}</span>
                    </span>
                  </button>
                `;
              })
              .join("")}
          </div>
        </section>
        <div class="cookie-footer">
          <button data-add-workspace>+ Groupe</button>
          <button class="cookie-add-app" data-open-modal>+ App</button>
        </div>
      </aside>

      <section class="browser">
        <div class="toolbar">
          <div class="nav-controls">
            <button class="icon-button" data-nav="back" title="Retour">←</button>
            <button class="icon-button" data-nav="forward" title="Avant">→</button>
            <button class="icon-button" data-nav="reload" title="Recharger">↻</button>
          </div>
          <form class="address-form">
            <span>URL</span>
            <input name="url" value="${escapeHtml(state.maskUrl ? hostnameFromUrl(tab?.url || "") : tab?.url || "")}" autocomplete="off" spellcheck="false" ${state.maskUrl ? "readonly" : ""} />
          </form>
          <div class="right-controls">
            <button class="icon-button" data-new-tab title="Nouvel onglet">+</button>
            <button class="icon-button" data-share title="Partager sélection + URL">⇪</button>
            <button class="icon-button" data-page-menu title="Menu contextuel">☰</button>
            <button class="icon-button" data-open-settings="general" title="Paramètres">⚙</button>
            <button class="icon-button" data-external title="Ouvrir dans le navigateur">↗</button>
          </div>
        </div>

        <div class="tabbar">
          ${visibleTabs
            .map(
              (item) => `
                <button class="tab ${item.id === activeTabId ? "active" : ""} ${item.secret ? "secret" : ""}" data-tab="${item.id}">
                  <span class="tab-title">${item.secret ? "● " : ""}${escapeHtml(item.title)}</span>
                  <span class="tab-close" data-close-tab="${item.id}">×</span>
                </button>
              `
            )
            .join("")}
        </div>

        <div class="web-stage">
          <div class="web-frame">
            ${
              tab && app && visibleTabs.length
                ? tabs
                    .filter((item) => !state.secretsHidden || !item.secret)
                    .map(
                      (item) => `
                        <webview
                          class="${item.id === activeTabId ? "active" : ""}"
                          src="${escapeHtml(item.url)}"
                          partition="${partitionFor(workspace.id, app.id, item)}"
                          data-tab-id="${item.id}"
                          data-app-id="${app.id}"
                          allowpopups
                        ></webview>
                      `
                    )
                    .join("")
                : `<div class="empty-state"><div class="empty-box"><h1>${state.secretsHidden ? "Onglets secrets cachés" : "Ajoute une app"}</h1><p>${state.secretsHidden ? "Cmd/Ctrl+Shift+H les réaffiche." : "CookieRS organise les apps web par workspace, avec sessions séparées."}</p><button class="primary" data-open-modal>Ajouter</button></div></div>`
            }
          </div>
        </div>
      </section>
    </main>

    ${renderAddModal()}
    ${renderPropertiesModal(app)}
    ${renderWorkspaceModal()}
    ${renderShareModal()}
    ${renderSettingsModal()}
    ${renderContextMenu()}
    ${renderWorkspaceMenu()}
    ${renderPageMenu()}
  `;

  wireEvents();
}

function renderAddModal() {
  return `
    <div class="modal-backdrop" id="add-modal">
      <form class="modal">
        <h2>Ajouter une app</h2>
        <div class="field">
          <label for="app-name">Nom</label>
          <input id="app-name" name="name" placeholder="Ex: Perplexity" required />
        </div>
        <div class="field">
          <label for="app-url">URL</label>
          <input id="app-url" name="url" placeholder="https://example.com" required />
        </div>
        <div class="modal-actions">
          <button type="button" class="secondary" data-close-add-modal>Annuler</button>
          <button type="submit" class="primary">Ajouter</button>
        </div>
      </form>
    </div>
  `;
}

function renderPropertiesModal(active) {
  const app = propertiesAppId ? findApp(propertiesAppId) : active;
  if (!propertiesAppId || !app) return "";
  const icon = app.iconImage || faviconUrl(app.url);
  return `
    <div class="modal-backdrop open" id="properties-modal">
      <form class="modal">
        <h2>Propriétés app</h2>
        <div class="property-head">
          <span class="app-icon large" style="background:${escapeHtml(app.color)}">
            ${icon ? `<img src="${escapeHtml(icon)}" alt="" />` : escapeHtml(iconText(app.name))}
          </span>
          <div>
            <strong>${escapeHtml(app.name)}</strong>
            <small>${escapeHtml(hostnameFromUrl(app.url))}</small>
          </div>
        </div>
        <div class="field"><label for="prop-name">Nom</label><input id="prop-name" name="name" value="${escapeHtml(app.name)}" required /></div>
        <div class="field"><label for="prop-url">URL</label><input id="prop-url" name="url" value="${escapeHtml(app.url)}" required /></div>
        <div class="field"><label for="prop-color">Couleur icône</label><input id="prop-color" name="color" type="color" value="${escapeHtml(app.color)}" /></div>
        <div class="field"><label for="prop-highlight">Highlight</label><input id="prop-highlight" name="highlightColor" type="color" value="${escapeHtml(app.highlightColor || "#ffffff")}" /></div>
        <div class="field"><label for="prop-icon-image">Image icône URL</label><input id="prop-icon-image" name="iconImage" value="${escapeHtml(app.iconImage || "")}" placeholder="https://..." /></div>
        <div class="field"><label for="prop-icon-upload">Uploader icône</label><input id="prop-icon-upload" type="file" accept="image/*" data-upload-app-icon="${app.id}" /></div>
        <div class="field"><label for="prop-count">Compteur notifications</label><input id="prop-count" name="notificationCount" type="number" min="0" value="${Number(app.notificationCount || 0)}" /></div>
        <label class="check-row"><input type="checkbox" name="notifications" ${app.notifications ? "checked" : ""} /> Notifications pour cette app</label>
        <label class="check-row"><input type="checkbox" name="hidden" ${app.hidden ? "checked" : ""} /> App cachée</label>
        <div class="modal-actions split">
          <button type="button" class="danger" data-delete-app="${app.id}">Supprimer</button>
          <span></span>
          <button type="button" class="secondary" data-close-properties>Annuler</button>
          <button type="submit" class="primary">Enregistrer</button>
        </div>
      </form>
    </div>
  `;
}

function renderWorkspaceModal() {
  const workspace = propertiesWorkspaceId ? findWorkspace(propertiesWorkspaceId) : null;
  if (!workspace) return "";
  return `
    <div class="modal-backdrop open" id="workspace-modal">
      <form class="modal">
        <h2>Propriétés groupe</h2>
        <div class="property-head">
          <span class="workspace-button active preview" style="background:${escapeHtml(workspace.color)}">
            ${workspace.iconImage ? `<img src="${escapeHtml(workspace.iconImage)}" alt="" />` : escapeHtml(workspace.icon)}
          </span>
          <div><strong>${escapeHtml(workspace.name)}</strong><small>Raccourci Cmd/Ctrl+1..9</small></div>
        </div>
        <div class="field"><label for="workspace-name">Nom</label><input id="workspace-name" name="name" value="${escapeHtml(workspace.name)}" required /></div>
        <div class="field"><label for="workspace-icon">Icône texte</label><input id="workspace-icon" name="icon" value="${escapeHtml(workspace.icon)}" maxlength="2" required /></div>
        <div class="field"><label for="workspace-icon-image">Icône image URL</label><input id="workspace-icon-image" name="iconImage" value="${escapeHtml(workspace.iconImage || "")}" placeholder="https://..." /></div>
        <div class="field"><label for="workspace-icon-upload">Uploader icône</label><input id="workspace-icon-upload" type="file" accept="image/*" data-upload-workspace-icon="${workspace.id}" /></div>
        <div class="field"><label for="workspace-color">Couleur groupe</label><input id="workspace-color" name="color" type="color" value="${escapeHtml(workspace.color)}" /></div>
        <div class="field"><label for="workspace-highlight">Highlight</label><input id="workspace-highlight" name="highlightColor" type="color" value="${escapeHtml(workspace.highlightColor || "#ffffff")}" /></div>
        <div class="modal-actions">
          <button type="button" class="secondary" data-close-workspace>Annuler</button>
          <button type="submit" class="primary">Enregistrer</button>
        </div>
      </form>
    </div>
  `;
}

function renderShareModal() {
  if (!shareDraft) return "";
  return `
    <div class="modal-backdrop open" id="share-modal">
      <div class="modal">
        <h2>Partager</h2>
        <div class="share-preview">${escapeHtml(shareText())}</div>
        <div class="modal-actions share-actions">
          <button type="button" class="secondary" data-share-target="copy">Copier</button>
          <button type="button" class="secondary" data-share-target="x">X</button>
          <button type="button" class="secondary" data-share-target="linkedin">LinkedIn</button>
          <button type="button" class="secondary" data-share-target="buffer">Buffer</button>
          <button type="button" class="primary" data-share-target="mail">Mail</button>
        </div>
        <div class="modal-actions">
          <button type="button" class="secondary" data-close-share>Fermer</button>
        </div>
      </div>
    </div>
  `;
}

function renderSettingsModal() {
  if (!state.settingsOpen) return "";
  const items = [
    ["general", "Général"],
    ["downloads", "Téléchargements"],
    ["notifications", "Notifications"],
    ["shortcuts", "Raccourcis"],
    ["permissions", "Micro/caméra"],
    ["fonts", "Polices"],
    ["sync", "Sync"],
    ["extensions", "Extensions"],
    ["import", "Importer / Exporter"],
    ["advanced", "Avancé"]
  ];
  return `
    <div class="settings-panel">
      <aside class="settings-nav">
        <h2>Paramètres</h2>
        ${items
          .map(
            ([id, label]) => `<button class="${state.settingsSection === id ? "active" : ""}" data-settings-section="${id}"><span>${settingsIcon(id)}</span>${label}</button>`
          )
          .join("")}
      </aside>
      <section class="settings-body">
        <button class="settings-close" data-close-settings>×</button>
        ${renderSettingsSection()}
      </section>
    </div>
  `;
}

function settingsIcon(id) {
  return {
    general: "⌘",
    downloads: "⇩",
    notifications: "♢",
    shortcuts: "⌨",
    permissions: "◇",
    fonts: "T",
    sync: "↻",
    extensions: "✜",
    import: "⇳",
    advanced: "⌁"
  }[id] || "•";
}

function renderSettingsSection() {
  if (state.settingsSection === "general") {
    return `
      <div class="settings-card">
        <div>
          <h3>Masquer l'URL dans l'écran principal</h3>
          <p>Affiche seulement le domaine dans la barre principale.</p>
        </div>
        <button class="switch ${state.maskUrl ? "on" : ""}" data-toggle-mask-url><span></span></button>
      </div>
      <div class="settings-card">
        <div>
          <h3>Mode interface</h3>
          <p>A réduit à 50 %, B normal, C augmenté à 125 %.</p>
        </div>
        <div class="segmented settings-segmented">
          ${["compact", "normal", "large"].map((item) => `<button class="${state.density === item ? "active" : ""}" data-density="${item}">${densityLabel(item)}</button>`).join("")}
        </div>
      </div>
      <div class="settings-card">
        <div>
          <h3>Afficher les apps cachées</h3>
          <p>Contrôle l'affichage temporaire des apps cachées.</p>
        </div>
        <button class="switch ${state.showHiddenApps ? "on" : ""}" data-toggle-hidden-apps><span></span></button>
      </div>
      <div class="settings-card">
        <div>
          <h3>Donate</h3>
          <p>Emplacement réservé dans les réglages globaux.</p>
        </div>
        <button class="secondary" type="button">Donate</button>
      </div>
    `;
  }
  if (state.settingsSection === "extensions") {
    return `
      <div class="settings-card">
        <div>
          <h3>Activer le bloqueur de publicités</h3>
          <p>Emplacement prévu pour listes de filtres intégrées.</p>
        </div>
        <button class="switch"><span></span></button>
      </div>
    `;
  }
  if (state.settingsSection === "import") {
    return `
      <div class="settings-card column">
        <h3>Importer / Exporter les paramètres</h3>
        <p>Sauvegarde tous les groupes, apps, couleurs, icônes, skins et onglets.</p>
        <div class="settings-actions">
          <button class="primary" data-export-config>Exporter JSON</button>
          <button class="secondary" data-import-config>Importer JSON</button>
          <input type="file" data-import-config-file accept="application/json" hidden />
        </div>
      </div>
    `;
  }
  if (state.settingsSection === "advanced") {
    return `
      <form class="settings-card column" data-custom-skin-form>
        <h3>Skin personnalisé</h3>
        <p>Définit les couleurs globales du chrome CookieRS.</p>
        <div class="color-grid">
          <label>Fond <input type="color" name="cream" value="${escapeHtml(state.customSkin.cream)}" /></label>
          <label>Sidebar <input type="color" name="sidebar" value="${escapeHtml(state.customSkin.sidebar)}" /></label>
          <label>Accent <input type="color" name="accent" value="${escapeHtml(state.customSkin.accent)}" /></label>
        </div>
        <div class="field">
          <label>Skin</label>
          <select data-skin>
            <option value="biscuit" ${state.skin === "biscuit" ? "selected" : ""}>Biscuit</option>
            <option value="dark" ${state.skin === "dark" ? "selected" : ""}>Dark</option>
            <option value="mono" ${state.skin === "mono" ? "selected" : ""}>Mono</option>
            <option value="custom" ${state.skin === "custom" ? "selected" : ""}>Custom</option>
          </select>
        </div>
        <button class="primary" type="submit">Appliquer le skin</button>
      </form>
    `;
  }
  return `
    <div class="settings-card">
      <div>
        <h3>${escapeHtml(itemsLabel(state.settingsSection))}</h3>
        <p>Section prévue pour les réglages CookieRS.</p>
      </div>
    </div>
  `;
}

function itemsLabel(id) {
  return {
    downloads: "Téléchargements",
    notifications: "Notifications",
    shortcuts: "Raccourcis",
    permissions: "Micro/caméra",
    fonts: "Polices",
    sync: "Sync"
  }[id] || "Réglages";
}

function renderPageMenu() {
  if (!pageMenu) return "";
  const tab = getActiveTab();
  const app = activeApp();
  return `
    <div class="context-menu page-menu" style="right:22px;top:72px">
      <div class="context-label">Page</div>
      <button data-page-action="back">Retour</button>
      <button data-page-action="forward">Avant</button>
      <button data-page-action="reload">Recharger</button>
      <button data-page-action="share">Partager sélection + URL</button>
      <button data-page-action="secret">${tab?.secret ? "Retirer secret" : "Onglet secret"}</button>
      <button data-page-action="hide-secrets">${state.secretsHidden ? "Afficher secrets" : "Cacher secrets"}</button>
      <button data-page-action="mask-url">${state.maskUrl ? "Afficher URL" : "Masquer URL"}</button>
      <button data-page-action="external">Ouvrir navigateur</button>
      <div class="context-label">App</div>
      <button data-page-action="app-open">Ouvrir ${escapeHtml(app?.name || "app")}</button>
      <button data-page-action="app-new-tab">Nouvel onglet app</button>
      <button data-page-action="app-secret-tab">Onglet secret app</button>
      <button data-page-action="properties">Propriétés app</button>
      <button data-page-action="app-duplicate">Dupliquer app</button>
      <button data-page-action="app-notifications">${app?.notifications ? "Couper notifications" : "Activer notifications"}</button>
      <button data-page-action="app-hidden">${app?.hidden ? "Afficher app" : "Cacher app"}</button>
      <button data-page-action="app-clear-count">Reset compteur</button>
      <button data-page-action="app-delete" class="danger-text">Supprimer app</button>
      <div class="context-label">Groupe</div>
      <button data-page-action="workspace-properties">Propriétés groupe</button>
      <button data-page-action="workspace-previous">Groupe précédent</button>
      <button data-page-action="workspace-next">Groupe suivant</button>
    </div>
  `;
}

function renderContextMenu() {
  if (!contextMenu) return "";
  const app = findApp(contextMenu.appId);
  if (!app) return "";
  return `
    <div class="context-menu" style="left:${contextMenu.x}px;top:${contextMenu.y}px">
      <button data-context-action="open">Ouvrir</button>
      <button data-context-action="new-tab">Nouvel onglet</button>
      <button data-context-action="secret-tab">Onglet secret</button>
      <button data-context-action="properties">Propriétés</button>
      <button data-context-action="duplicate">Dupliquer</button>
      <button data-context-action="notifications">${app.notifications ? "Couper notifications" : "Activer notifications"}</button>
      <button data-context-action="hidden">${app.hidden ? "Afficher" : "Cacher"}</button>
      <button data-context-action="clear-count">Reset compteur</button>
      <button data-context-action="delete" class="danger-text">Supprimer</button>
    </div>
  `;
}

function renderWorkspaceMenu() {
  if (!workspaceMenu) return "";
  return `
    <div class="context-menu" style="left:${workspaceMenu.x}px;top:${workspaceMenu.y}px">
      <button data-workspace-action="properties">Propriétés groupe</button>
      <button data-workspace-action="previous">Groupe précédent</button>
      <button data-workspace-action="next">Groupe suivant</button>
    </div>
  `;
}

function wireEvents() {
  document.querySelectorAll("[data-workspace]").forEach((button) => {
    button.addEventListener("click", () => selectWorkspace(button.dataset.workspace));
    button.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/cookiers-workspace", button.dataset.workspace);
    });
    button.addEventListener("dragover", (event) => event.preventDefault());
    button.addEventListener("drop", (event) => {
      event.preventDefault();
      moveWorkspace(event.dataTransfer.getData("text/cookiers-workspace"), button.dataset.workspace);
    });
    button.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      workspaceMenu = { workspaceId: button.dataset.workspace, x: event.clientX, y: event.clientY };
      contextMenu = null;
      render();
    });
  });

  document.querySelector("[data-workspace-properties]")?.addEventListener("click", (event) => {
    propertiesWorkspaceId = event.currentTarget.dataset.workspaceProperties;
    render();
  });
  document.querySelector("[data-add-workspace]")?.addEventListener("click", addWorkspace);

  document.querySelector("[data-toggle-sidebar]")?.addEventListener("click", toggleSidebar);
  document.querySelector("[data-toggle-hidden-apps]")?.addEventListener("click", toggleHiddenApps);
  document.querySelectorAll("[data-open-settings]").forEach((button) => {
    button.addEventListener("click", () => openSettings(button.dataset.openSettings || "general"));
  });
  document.querySelector("[data-close-settings]")?.addEventListener("click", closeSettings);
  document.querySelectorAll("[data-settings-section]").forEach((button) => {
    button.addEventListener("click", () => setSettingsSection(button.dataset.settingsSection));
  });
  document.querySelector("[data-toggle-mask-url]")?.addEventListener("click", toggleMaskUrl);
  document.querySelector("[data-custom-skin-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    updateCustomSkin(new FormData(event.currentTarget));
  });
  document.querySelector("[data-export-config]")?.addEventListener("click", exportConfig);
  document.querySelector("[data-import-config]")?.addEventListener("click", () => {
    document.querySelector("[data-import-config-file]")?.click();
  });
  document.querySelector("[data-import-config-file]")?.addEventListener("change", (event) => {
    importConfig(event.target.files?.[0]);
  });
  document.querySelectorAll("[data-density]").forEach((button) => button.addEventListener("click", () => setDensity(button.dataset.density)));
  document.querySelector("[data-skin]")?.addEventListener("change", (event) => setSkin(event.target.value));

  document.querySelectorAll("[data-app]").forEach((button) => {
    button.addEventListener("click", () => selectApp(button.dataset.app));
    button.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/cookiers-app", button.dataset.app);
    });
    button.addEventListener("dragover", (event) => event.preventDefault());
    button.addEventListener("drop", (event) => {
      event.preventDefault();
      moveApp(event.dataTransfer.getData("text/cookiers-app"), button.dataset.app);
    });
    button.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      contextMenu = { appId: button.dataset.app, x: event.clientX, y: event.clientY };
      workspaceMenu = null;
      state.activeAppByWorkspace[state.activeWorkspaceId] = button.dataset.app;
      saveState();
      render();
    });
  });

  document.querySelectorAll("[data-tab]").forEach((button) => button.addEventListener("click", () => selectTab(button.dataset.tab)));
  document.querySelectorAll("[data-close-tab]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      closeTab(button.dataset.closeTab);
    });
  });

  document.querySelector("[data-new-tab]")?.addEventListener("click", () => createTab("https://www.google.com"));
  document.querySelector("[data-toggle-secret-tab]")?.addEventListener("click", toggleActiveTabSecret);
  document.querySelector("[data-toggle-secrets-hidden]")?.addEventListener("click", toggleSecretsHidden);
  document.querySelector("[data-page-menu]")?.addEventListener("click", (event) => {
    event.stopPropagation();
    pageMenu = pageMenu ? null : true;
    render();
  });
  document.querySelector("[data-share]")?.addEventListener("click", openShareModal);
  document.querySelector("[data-open-properties]")?.addEventListener("click", () => {
    propertiesAppId = activeApp()?.id || null;
    render();
  });
  document.querySelector("[data-external]")?.addEventListener("click", () => {
    const tab = getActiveTab();
    if (tab) window.cookiers.openExternal(tab.url);
  });

  document.querySelector(".address-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    updateActiveTabUrl(new FormData(event.currentTarget).get("url"));
  });

  document.querySelectorAll("[data-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      const webview = document.querySelector("webview.active");
      if (!webview) return;
      const action = button.dataset.nav;
      if (action === "back" && webview.canGoBack()) webview.goBack();
      if (action === "forward" && webview.canGoForward()) webview.goForward();
      if (action === "reload") webview.reload();
    });
  });

  document.querySelectorAll("webview").forEach((webview) => {
    webview.addEventListener("dom-ready", () => installNotificationHook(webview));
    webview.addEventListener("did-navigate", () => syncWebview(webview));
    webview.addEventListener("did-navigate-in-page", () => syncWebview(webview));
    webview.addEventListener("page-title-updated", (event) => updateWebviewTitle(webview, event.title));
    webview.addEventListener("console-message", (event) => {
      if (String(event.message || "").startsWith("__COOKIERS_NOTIFICATION__")) {
        incrementNotification(webview.dataset.appId);
      }
    });
  });

  wireAddModal();
  wirePropertiesModal();
  wireWorkspaceModal();
  wireShareModal();
  wireContextMenu();
  wireWorkspaceMenu();
  wirePageMenu();
  wireShortcuts();

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".context-menu") && (contextMenu || workspaceMenu || pageMenu)) {
      closeMenus();
      render();
    }
  }, { once: true });
}

function wireShortcuts() {
  document.onkeydown = (event) => {
    const mod = event.metaKey || event.ctrlKey;
    if (!mod) return;
    const number = Number(event.key);
    if (number >= 1 && number <= 9 && state.workspaces[number - 1]) {
      event.preventDefault();
      selectWorkspace(state.workspaces[number - 1].id);
    }
    if (event.key === "ArrowLeft" && event.altKey) {
      event.preventDefault();
      selectWorkspaceByOffset(-1);
    }
    if (event.key === "ArrowRight" && event.altKey) {
      event.preventDefault();
      selectWorkspaceByOffset(1);
    }
    if (event.shiftKey && event.key.toLowerCase() === "s") {
      event.preventDefault();
      toggleActiveTabSecret();
    }
    if (event.shiftKey && event.key.toLowerCase() === "h") {
      event.preventDefault();
      toggleSecretsHidden();
    }
  };
}

function wireAddModal() {
  const modal = document.getElementById("add-modal");
  document.querySelectorAll("[data-open-modal]").forEach((button) => button.addEventListener("click", () => modal.classList.add("open")));
  document.querySelector("[data-close-add-modal]")?.addEventListener("click", () => modal.classList.remove("open"));
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) modal.classList.remove("open");
  });
  modal?.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    addCustomApp({ name: formData.get("name"), url: formData.get("url") });
  });
}

function wirePropertiesModal() {
  const modal = document.getElementById("properties-modal");
  if (!modal || !propertiesAppId) return;
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      propertiesAppId = null;
      render();
    }
  });
  document.querySelector("[data-close-properties]")?.addEventListener("click", () => {
    propertiesAppId = null;
    render();
  });
  document.querySelector("[data-delete-app]")?.addEventListener("click", (event) => deleteApp(event.currentTarget.dataset.deleteApp));
  document.querySelector("[data-upload-app-icon]")?.addEventListener("change", (event) => {
    readIconUpload(event.target.files?.[0], (dataUrl) => {
      const app = findApp(event.target.dataset.uploadAppIcon);
      if (!app) return;
      app.iconImage = dataUrl;
      saveState();
      render();
    });
  });
  modal.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();
    updateAppProperties(propertiesAppId, new FormData(event.currentTarget));
  });
}

function wireWorkspaceModal() {
  const modal = document.getElementById("workspace-modal");
  if (!modal || !propertiesWorkspaceId) return;
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      propertiesWorkspaceId = null;
      render();
    }
  });
  document.querySelector("[data-close-workspace]")?.addEventListener("click", () => {
    propertiesWorkspaceId = null;
    render();
  });
  document.querySelector("[data-upload-workspace-icon]")?.addEventListener("change", (event) => {
    readIconUpload(event.target.files?.[0], (dataUrl) => {
      const workspace = findWorkspace(event.target.dataset.uploadWorkspaceIcon);
      if (!workspace) return;
      workspace.iconImage = dataUrl;
      saveState();
      render();
    });
  });
  modal.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();
    updateWorkspaceProperties(propertiesWorkspaceId, new FormData(event.currentTarget));
  });
}

function wireShareModal() {
  const modal = document.getElementById("share-modal");
  if (!modal) return;
  document.querySelector("[data-close-share]")?.addEventListener("click", () => {
    shareDraft = null;
    render();
  });
  document.querySelectorAll("[data-share-target]").forEach((button) => button.addEventListener("click", () => shareTo(button.dataset.shareTarget)));
}

function wireContextMenu() {
  document.querySelectorAll("[data-context-action]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!contextMenu) return;
      const app = findApp(contextMenu.appId);
      const action = button.dataset.contextAction;
      if (action === "open") selectApp(contextMenu.appId);
      if (action === "new-tab") createTab(app.url);
      if (action === "secret-tab") createTab(app.url, true);
      if (action === "properties") {
        propertiesAppId = contextMenu.appId;
        closeMenus();
        render();
      }
      if (action === "duplicate") duplicateApp(contextMenu.appId);
      if (action === "notifications") {
        app.notifications = !app.notifications;
        saveState();
        closeMenus();
        render();
      }
      if (action === "hidden") toggleAppHidden(contextMenu.appId);
      if (action === "clear-count") {
        app.notificationCount = 0;
        saveState();
        closeMenus();
        render();
      }
      if (action === "delete") deleteApp(contextMenu.appId);
    });
  });
}

function wireWorkspaceMenu() {
  document.querySelectorAll("[data-workspace-action]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!workspaceMenu) return;
      const action = button.dataset.workspaceAction;
      if (action === "properties") {
        propertiesWorkspaceId = workspaceMenu.workspaceId;
        closeMenus();
        render();
      }
      if (action === "previous") selectWorkspaceByOffset(-1);
      if (action === "next") selectWorkspaceByOffset(1);
    });
  });
}

function wirePageMenu() {
  document.querySelectorAll("[data-page-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.pageAction;
      const webview = document.querySelector("webview.active");
      const app = activeApp();
      const workspace = activeWorkspace();
      closeMenus();
      if (action === "back" && webview?.canGoBack()) webview.goBack();
      if (action === "forward" && webview?.canGoForward()) webview.goForward();
      if (action === "reload") webview?.reload();
      if (action === "share") openShareModal();
      if (action === "secret") toggleActiveTabSecret();
      if (action === "hide-secrets") toggleSecretsHidden();
      if (action === "mask-url") toggleMaskUrl();
      if (action === "external") {
        const tab = getActiveTab();
        if (tab) window.cookiers.openExternal(tab.url);
      }
      if (action === "app-open" && app) selectApp(app.id);
      if (action === "app-new-tab" && app) createTab(app.url);
      if (action === "app-secret-tab" && app) createTab(app.url, true);
      if (action === "properties") {
        propertiesAppId = app?.id || null;
        render();
      }
      if (action === "app-duplicate" && app) duplicateApp(app.id);
      if (action === "app-notifications" && app) {
        app.notifications = !app.notifications;
        saveState();
        render();
      }
      if (action === "app-hidden" && app) toggleAppHidden(app.id);
      if (action === "app-clear-count" && app) {
        app.notificationCount = 0;
        saveState();
        render();
      }
      if (action === "app-delete" && app) deleteApp(app.id);
      if (action === "workspace-properties" && workspace) {
        propertiesWorkspaceId = workspace.id;
        render();
      }
      if (action === "workspace-previous") selectWorkspaceByOffset(-1);
      if (action === "workspace-next") selectWorkspaceByOffset(1);
      if (!["share", "secret", "hide-secrets", "mask-url", "properties", "app-notifications", "app-hidden", "app-clear-count", "app-delete", "workspace-properties", "workspace-previous", "workspace-next"].includes(action)) {
        closeMenus();
        render();
      }
    });
  });
}

function updateWebviewTitle(webview, title) {
  const tab = getActiveTab();
  if (tab && webview.classList.contains("active")) {
    tab.title = title || tab.title;
    const app = activeApp();
    const count = parseNotificationCount(title);
    if (app && app.notifications) app.notificationCount = count;
    saveState();
    const label = document.querySelector(".tab.active .tab-title");
    if (label) label.textContent = `${tab.secret ? "● " : ""}${tab.title}`;
  }
}

function syncWebview(webview) {
  if (!webview.classList.contains("active")) return;
  const tab = getActiveTab();
  if (!tab) return;
  tab.url = webview.getURL();
  saveState();
  const input = document.querySelector(".address-form input");
  if (input) input.value = tab.url;
}

render();
