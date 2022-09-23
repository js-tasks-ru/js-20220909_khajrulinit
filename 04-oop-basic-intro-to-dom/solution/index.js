export default class ColumnChart {
    chartHeight = 50;
    subElements = {};
    
    constructor({
        data = [],
        label = '',
        link = '',
        value = 0,
        formatHeading = data => data
    } = {}) {
        this.data = [...data];
        this.label = label;
        this.link = link;
        this.value = value;
        this.formatHeading = formatHeading;
        
        this.render();
    }
    
    getLink() {
        return this.link || '';
    }
    
    getHeading() {
        return this.formatHeading(this.value);
    }
    
    formatDataItem(num, maxValue) {
        const scale = this.chartHeight / maxValue;
        return {
            percent: (num / maxValue * 100).toFixed(0) + '%',
            value: String(Math.floor(num * scale))
        };
    }
    
    getChartColumns() {
        const maxValue = Math.max(...this.data);
        return this.data.map(num => {
            const {percent, value} = this.formatDataItem(num, maxValue);
            return `<div style="--value: ${value}" data-tooltip="${percent}"></div>`;
        }).join('');
    }
    
    getSubElements() {
        const result = {};
        const elements = this.element.querySelectorAll("[data-element]");
        
        for (const subElement of elements) {
            const name = subElement.dataset.element;
            result[name] = subElement;
        }
        
        return result;
    }
    
    update(data = []) {
        this.data = [...data];
        this.subElements.body.innerHTML = this.getChartColumns();
    }
    
    destroy() {
        this.remove();
        this.element = null;
        this.subElements = {};
    }
    
    remove() {
        if (this.element) {
            this.element.remove();
        }
    }
    
    render() {
        const div = document.createElement('div');
        
        div.className = this.data.length ? `dashboard__chart_${this.label}` : 'column-chart_loading';
        div.innerHTML = `
        <div class="column-chart" style="--chart-height: ${this.chartHeight}">
            <div class="column-chart__title">
                ${this.label}
                <a href="${this.getLink()}" class="column-chart__link">View all</a>
            </div>
            <div class="column-chart__container">
                <div data-element="header" class="column-chart__header">${this.getHeading()}</div>
                <div data-element="body" class="column-chart__chart">
                    ${this.getChartColumns()}
                </div>
            </div>
        </div>
        `;
        
        this.element = div;
        this.subElements = this.getSubElements();
    }
}