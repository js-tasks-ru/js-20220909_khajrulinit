import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
    data = [];
    chartHeight = 50;
    subElements = {};
    
    constructor({
        url = '',
        range = {},
        label = '',
        link = '',
        formatHeading = data => data
    } = {}) {
        this.url = `${BACKEND_URL}/${url}`;
        this.label = label;
        this.range = range;
        this.link = link;
        this.formatHeading = formatHeading;
        
        this.render();
    }
    
    getLink() {
        return `<a href="${this.link}" class="column-chart__link">View all</a>`;
    }
    
    getArraySum = (arr) => arr.reduce((accum, cur) => accum + cur, 0);
    
    getHeading() {
        return this.formatHeading(this.getArraySum(this.data));
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
        
    loadData = async (fromDate, toDate) => {
        let data = {};
        try {
            const url = new URL(this.url);
            const params = {
                from: fromDate.toISOString(),
                to: toDate.toISOString()
            };
            Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
            data = await fetchJson(url);
            
        } catch (e) {
            console.error(e);
        }
        return data;
    };
    
    async update(fromDate, toDate) {
        const data = await this.loadData(fromDate, toDate);
        this.data = Object.values(data);
        
        this.element.classList.toggle('column-chart_loading', !this.data.length);
        this.subElements.body.innerHTML = this.getChartColumns();
        this.subElements.header.innerHTML = this.getHeading();
        
        return data;
    }
    
    get template() {
        return `
        <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
        ${this.label}
        ${this.getLink()}
        </div>
        <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">${this.getHeading()}</div>
        <div data-element="body" class="column-chart__chart">
        ${this.getChartColumns()}
        </div>
        </div>
        </div>
        `;
    }
    
    render() {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = this.template;
        
        this.element = wrapper.firstElementChild;
        this.subElements = this.getSubElements();
    }
    
    remove() {
        if (this.element) {
            this.element.remove();
        }
    }
    
    destroy() {
        this.remove();
        this.element = null;
        this.subElements = {};
    }
}