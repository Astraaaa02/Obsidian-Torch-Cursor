var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => CursorTorchPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var import_view = require("@codemirror/view");
var DEFAULT_SETTINGS = {
  size: 130,
  intensity: 0.9,
  color: "#ff9a3d",
  flicker: true,
  emberCaret: true,
  onlyFocused: true,
  darkness: 0.85,
  reach: 240
};
var TorchGlow = class {
  constructor(view, plugin) {
    this.view = view;
    this.plugin = plugin;
    // Layout reads must go through requestMeasure — CodeMirror throws if the
    // DOM is measured during an update cycle. A stable key dedupes requests.
    this.measureRequest = {
      key: this,
      read: () => this.readPosition(),
      write: (pos) => this.applyPosition(pos)
    };
    this.darkness = createDiv({ cls: "cursor-torch-darkness cursor-torch-hidden" });
    view.dom.appendChild(this.darkness);
    this.glow = createDiv({ cls: "cursor-torch-glow cursor-torch-hidden" });
    view.dom.appendChild(this.glow);
    this.scrollHandler = () => this.position();
    view.scrollDOM.addEventListener("scroll", this.scrollHandler, { passive: true });
    this.position();
  }
  update(update) {
    if (update.selectionSet || update.docChanged || update.geometryChanged || update.focusChanged) {
      this.position();
    }
  }
  position() {
    this.view.requestMeasure(this.measureRequest);
  }
  readPosition() {
    const view = this.view;
    if (this.plugin.settings.onlyFocused && !view.hasFocus) return null;
    const head = view.state.selection.main.head;
    let coords;
    try {
      coords = view.coordsAtPos(head);
    } catch {
      coords = null;
    }
    if (!coords) return null;
    const editorRect = view.dom.getBoundingClientRect();
    if (coords.bottom < editorRect.top || coords.top > editorRect.bottom) return null;
    return {
      x: coords.left - editorRect.left,
      y: (coords.top + coords.bottom) / 2 - editorRect.top
    };
  }
  applyPosition(pos) {
    if (!pos) {
      this.glow.addClass("cursor-torch-hidden");
      this.darkness.addClass("cursor-torch-hidden");
      return;
    }
    this.glow.style.left = `${pos.x}px`;
    this.glow.style.top = `${pos.y}px`;
    this.glow.removeClass("cursor-torch-hidden");
    this.darkness.style.setProperty("--cursor-torch-x", `${pos.x}px`);
    this.darkness.style.setProperty("--cursor-torch-y", `${pos.y}px`);
    this.darkness.removeClass("cursor-torch-hidden");
  }
  destroy() {
    this.view.scrollDOM.removeEventListener("scroll", this.scrollHandler);
    this.glow.remove();
    this.darkness.remove();
  }
};
var CursorTorchPlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.torches = /* @__PURE__ */ new Set();
  }
  async onload() {
    await this.loadSettings();
    const plugin = this;
    this.registerEditorExtension(
      import_view.ViewPlugin.fromClass(
        class {
          constructor(view) {
            this.torch = new TorchGlow(view, plugin);
            plugin.torches.add(this.torch);
          }
          update(update) {
            this.torch.update(update);
          }
          destroy() {
            plugin.torches.delete(this.torch);
            this.torch.destroy();
          }
        }
      )
    );
    this.addSettingTab(new CursorTorchSettingTab(this.app, this));
    this.applySettings();
  }
  onunload() {
    document.body.removeClass(
      "cursor-torch-flicker",
      "cursor-torch-ember-caret",
      "cursor-torch-darkness-on"
    );
    document.body.style.removeProperty("--cursor-torch-size");
    document.body.style.removeProperty("--cursor-torch-intensity");
    document.body.style.removeProperty("--cursor-torch-color");
    document.body.style.removeProperty("--cursor-torch-darkness");
    document.body.style.removeProperty("--cursor-torch-reach");
  }
  applySettings() {
    const body = document.body;
    body.style.setProperty("--cursor-torch-size", `${this.settings.size}px`);
    body.style.setProperty("--cursor-torch-intensity", `${this.settings.intensity}`);
    body.style.setProperty("--cursor-torch-color", this.settings.color);
    body.style.setProperty("--cursor-torch-darkness", `${this.settings.darkness}`);
    body.style.setProperty("--cursor-torch-reach", `${this.settings.reach}px`);
    body.toggleClass("cursor-torch-flicker", this.settings.flicker);
    body.toggleClass("cursor-torch-ember-caret", this.settings.emberCaret);
    body.toggleClass("cursor-torch-darkness-on", this.settings.darkness > 0);
    for (const torch of this.torches) torch.position();
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
    this.applySettings();
  }
};
var CursorTorchSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian.Setting(containerEl).setName("Glow size").setDesc("Height of the flame glow, in pixels (the width scales with it).").addSlider(
      (slider) => slider.setLimits(40, 400, 10).setValue(this.plugin.settings.size).setDynamicTooltip().onChange(async (value) => {
        this.plugin.settings.size = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Glow intensity").setDesc("How bright the torch burns.").addSlider(
      (slider) => slider.setLimits(0.1, 1, 0.05).setValue(this.plugin.settings.intensity).setDynamicTooltip().onChange(async (value) => {
        this.plugin.settings.intensity = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Torch color").setDesc("Main color of the flame. The core always stays warm white.").addColorPicker(
      (picker) => picker.setValue(this.plugin.settings.color).onChange(async (value) => {
        this.plugin.settings.color = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Darkness").setDesc("How dark the unlit text gets, as if writing in the dark. Set to 0 to disable.").addSlider(
      (slider) => slider.setLimits(0, 0.95, 0.05).setValue(this.plugin.settings.darkness).setDynamicTooltip().onChange(async (value) => {
        this.plugin.settings.darkness = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Light reach").setDesc("How far the torchlight reaches before the darkness takes over, in pixels.").addSlider(
      (slider) => slider.setLimits(100, 600, 20).setValue(this.plugin.settings.reach).setDynamicTooltip().onChange(async (value) => {
        this.plugin.settings.reach = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Flicker").setDesc("Make the glow waver like a real flame.").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.flicker).onChange(async (value) => {
        this.plugin.settings.flicker = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Ember caret").setDesc("Replace the text caret with a glowing ember-gradient bar (like the screenshot).").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.emberCaret).onChange(async (value) => {
        this.plugin.settings.emberCaret = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Only in focused editor").setDesc("Show the torch only in the editor pane you are typing in.").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.onlyFocused).onChange(async (value) => {
        this.plugin.settings.onlyFocused = value;
        await this.plugin.saveSettings();
      })
    );
  }
};
