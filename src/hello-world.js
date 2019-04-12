import { LitElement, html } from 'lit-element';
import '@vaadin/vaadin-button';

customElements.define(
  'hello-world',
  class extends LitElement {
    static get properties() {
      return {
        items: {
          type: Array
        }
      };
    }

    constructor() {
      super();
      this.items = new Array(100).fill('');
    }

    render() {
      return html`
        ${this.items.map((_, idx) => {
          return html`
            <vaadin-button>Button ${idx}</vaadin-button>
          `;
        })}
      `;
    }
  }
);
