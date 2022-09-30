class Tooltip {
  static tooltip = null;
  element = null;
  prevTarget = null;
  offset = 10;

  constructor() {
    if (!Tooltip.tooltip) {
      Tooltip.tooltip = this;
    }
    return Tooltip.tooltip;
  }

  initialize() {
    document.body.addEventListener('pointerover', this.onPointerOverHandler);
    document.body.addEventListener('pointerout', this.onPointerOutHandler);
  }

  onPointerOverHandler = (event) => {
    document.body.addEventListener('pointermove', this.onMouseMoveHandler);
    this.render();

    const target = event.target;
    if (!target.dataset.tooltip) {
      return;
    }

    this.prevTarget = target;
    this.element.innerHTML = target.dataset.tooltip;
  };

  onPointerOutHandler = (event) => {
    const target = event.target;
    if (this.prevTarget === target) {
      this.remove();
      document.body.removeEventListener('pointermove', this.onMouseMoveHandler);
    }
  };

  onMouseMoveHandler = (event) => {
    this.element.style.top = `${event.clientY + this.offset}px`;
    this.element.style.left = `${event.clientX + this.offset}px`;
  };

  get template() {
    return `
      <div class="tooltip">${this.element?.tooltip}</div>
    `;
  }

  render() {
    const div = document.createElement('div');
    div.innerHTML = this.template;
    this.element = div.firstElementChild;

    document.body.append(this.element);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    document.body.removeEventListener('pointerover', this.onPointerOverHandler);
    document.body.removeEventListener('pointerout', this.onPointerOutHandler);
    document.body.removeEventListener('pointermove', this.onMouseMoveHandler);
    this.remove();
    this.element = null;
    this.prevTarget = null;
    Tooltip.tooltip = null;
  }
}

export default Tooltip;
