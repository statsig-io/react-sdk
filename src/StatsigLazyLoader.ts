import type { StatsigReactContextUpdater } from './Statsig';

export class StatsigLazyLoader {
  private static init = false;
  private static loaded = false;
  private static statsigModuleAPI: typeof import('./Statsig');
  private static statsigJSModule: typeof import('statsig-js');
  private static reactContextUpdater: StatsigReactContextUpdater | null = null;

  public static get moduleLoaded() {
    return this.loaded;
  }

  public static initializeCalled() {
    if (this.loaded) {
      return this.statsigModuleAPI.Statsig.initializeCalled();
    }
    return false;
  }

  public static setReactContextUpdater(fn: (() => void) | null) {
    if (this.loaded) {
      return this.statsigModuleAPI.Statsig.setReactContextUpdater(fn);
    } else {
      this.reactContextUpdater = fn;
    }
  }

  public static shutdown() {
    if (this.loaded) {
      return this.statsigModuleAPI.Statsig.shutdown();
    }
  }

  public static getStatsigAPI() {
    return this.statsigModuleAPI;
  }

  public static getStatsigJSAPI() {
    return this.statsigJSModule;
  }

  public static async loadModule() {
    this.init = true;

    const statsigJSModule = await import('statsig-js');
    this.statsigModuleAPI = await import('./Statsig');

    this.statsigJSModule = statsigJSModule;
    window.__STATSIG_JS_SDK__ = statsigJSModule.default;

    this.loaded = true;

    this.preSetContextUpdater();

    return this.statsigModuleAPI;
  }

  private static preSetContextUpdater() {
    this.statsigModuleAPI.Statsig.setReactContextUpdater(
      this.reactContextUpdater,
    );
  }
}
