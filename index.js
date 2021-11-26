import * as owl from './lib/owl.es.js';
import * as atom from './lib/atom.js';
import Main from './Main.js';
import GlobalState from './GlobalState.js';

owl.utils.whenReady(async () => {
  const state = atom.reactive(new GlobalState(), () => {});
  window.state = state;
  Main.env = { state };
  owl.mount(Main, { target: document.body });
});
