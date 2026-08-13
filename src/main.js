import { App } from './App.js?v=1786635068';

const { createElement } = window.React;
const { createRoot } = window.ReactDOM;

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(createElement(App));
}
