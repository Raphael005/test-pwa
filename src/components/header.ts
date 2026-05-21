import { LitElement, css, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { resolveRouterPath } from '../router';

import '@shoelace-style/shoelace/dist/components/button/button.js';

@customElement('app-header')
export class AppHeader extends LitElement {
  @property({ type: String }) title = 'test-pwa';

  @property({ type: Boolean }) enableBack: boolean = false;

  static styles = css`
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--app-color-primary);
      color: white;
      padding: 0 16px;

      position: fixed;
      left: env(titlebar-area-x, 0);
      top: env(titlebar-area-y, 0);
      height: env(titlebar-area-height, 50px);
      width: env(titlebar-area-width, 100%);
      -webkit-app-region: drag;
      z-index: 100;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    header h1 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    #left-block {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    nav {
      display: flex;
      align-items: center;
      gap: 4px;
      -webkit-app-region: no-drag;
    }

    nav a {
      color: white;
      text-decoration: none;
      font-size: 13px;
      padding: 6px 10px;
      border-radius: 4px;
      transition: background 0.15s;
    }

    nav a:hover {
      background: rgba(255, 255, 255, 0.15);
    }
  `;

  render() {
    return html`
      <header>
        <div id="left-block">
          ${this.enableBack
            ? html`<sl-button size="small" href="${resolveRouterPath()}">Back</sl-button>`
            : null}
          <h1>${this.title}</h1>
        </div>

        <nav>
          <a href="${resolveRouterPath()}">Home</a>
          <a href="${resolveRouterPath('about')}">About</a>
        </nav>
      </header>
    `;
  }
}
