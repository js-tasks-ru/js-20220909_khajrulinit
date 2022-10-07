import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  data = [];
  subElements = {};
  isLoading = false;
  documentBottomOffset = 50;
  queryOffset = 30;

  constructor(headersConfig, {
    url = '',
    sorted = {},
    isSortLocally = false
  } = {}) {
    this.headersConfig = [...headersConfig];
    this.url = `${BACKEND_URL}/${url}`;
    this.sorted = {
      id: this.headersConfig.find(item => !!item.sortable).id,
      order: 'asc',
      start: 0,
      end: this.queryOffset,
      ...sorted
    };
    if (sorted.start && sorted.end) {
      this.queryOffset = sorted.end - sorted.start;
    }
    this.isSortLocally = isSortLocally;

    this.createElement();
    this.render();
    this.initEventListeners();
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.headerPointerDownHandler);
    document.addEventListener('scroll', this.onScrollHandler);
  }

  onScrollHandler = async (event) => {
    const documentHeight = document.body.scrollHeight;
    const currentScroll = window.scrollY + window.innerHeight;

    if ((currentScroll + this.documentBottomOffset) > documentHeight && !this.isLoading) {
      this.toShowSpinner(true);
      this.sorted.start += this.queryOffset;
      this.sorted.end += this.queryOffset;
      await this.loadData();
      this.updateBodyElements();
      this.toShowSpinner(false);
    }
  };

  headerPointerDownHandler = async (event) => {
    const elem = event.target.closest("[data-sortable='true']")?.dataset;
    if (!elem?.id) {
      return;
    }

    this.updateQueryParams(elem.id);
    this.toShowSpinner(true);
    await this.sort(elem.id, this.sorted.order);
    this.toShowSpinner(false);
    this.updateBodyElements();
    this.updateHeaderSortArrow(elem.id, this.sorted.order);
  };

  loadData = async ({
    id = this.sorted.id,
    order = this.sorted.order,
    start = this.sorted.start,
    end = this.sorted.end
  } = {}) => {
    this.isLoading = true;

    const url = new URL(this.url);
    Object.entries({
      _sort: id,
      _order: order,
      _start: start,
      _end: end
    }).forEach(([key, val]) => url.searchParams.append(key, val));

    let data = [];
    try {
      data = await fetchJson(url);
    } catch (e) {
      console.error('loadData error:', e);
    }

    this.data.push(...data);
    this.isLoading = false;
    return data;
  };

  async sort(id, order) {
    if (this.isSortLocally) {
      this.sortOnClient(id, order);
    } else {
      await this.sortOnServer(id, order);
    }
  }

  async sortOnServer(id, order) {
    await this.loadData({id, order});
  }

  sortOnClient(fieldValue, orderValue) {
    const ORDER = {
      'asc': 1,
      'desc': -1
    };

    const CASE = {
      'asc': 'upper',
      'desc': 'lower'
    };

    const strCompareFn = (obj1, obj2) => {
      return ORDER[orderValue] * obj1[fieldValue].localeCompare(obj2[fieldValue], ['ru', 'en'],
        {caseFirst: CASE[orderValue]}
      );
    };

    const numCompareFn = (obj1, obj2) => ORDER[orderValue] * (obj1[fieldValue] - obj2[fieldValue]);

    const getCompareFn = (obj1, obj2) => {
      switch (typeof obj1[fieldValue]) {
      case 'string':
        return strCompareFn(obj1, obj2);
      case 'number':
        return numCompareFn(obj1, obj2);
      }
    };

    this.data.sort(getCompareFn);
    this.updateBodyElements();
    this.updateHeaderSortArrow(fieldValue, orderValue);
  }

  toShowSpinner(toShow) {
    if (toShow) {
      this.subElements.loading.style.display = 'block';
    } else {
      this.subElements.loading.style.display = 'none';
    }
  }

  toShowEmptyPlaceholder(toShow) {
    if (toShow) {
      this.subElements.emptyPlaceholder.style.display = 'block';
    } else {
      this.subElements.emptyPlaceholder.style.display = 'none';
    }
  }

  updateQueryParams(id) {
    this.sorted.id = id;
    this.sorted.order = this.sorted.order === 'asc' ? 'desc' : 'asc';
    this.sorted.start = 0;
    this.sorted.end = this.queryOffset;

    this.data = [];
  }

  updateBodyElements() {
    if (this.data.length) {
      this.toShowEmptyPlaceholder(false);
      this.subElements.body.innerHTML = this.bodyElements;
    } else {
      this.subElements.body.replaceChildren();
      this.toShowEmptyPlaceholder(true);
    }
  }

  updateHeaderSortArrow(fieldValue, orderValue) {
    const prevSortedHeader = this.subElements.header.querySelector("[data-order]");
    if (prevSortedHeader) {
      prevSortedHeader.removeAttribute("data-order");
    }
    const curSortedHeader = this.subElements.header.querySelector(`[data-id="${fieldValue}"]`);
    if (curSortedHeader) {
      curSortedHeader.setAttribute('data-order', orderValue);
    }
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const element of elements) {
      const name = element.dataset.element;
      result[name] = element;
    }

    return result;
  }

  get header() {
    return this.headersConfig.map(item => {
      return `
        <div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}">
          <span>${item.title}</span>
          <span data-element="arrow" class="sortable-table__sort-arrow">
            <span class="sort-arrow"></span>
          </span>
        </div>
      `;
    }).join('');
  }

  getTableRow = (product) => {
    const rowData = this.headersConfig.map(config => {
      switch (config.id) {
      case 'images':
        return config.template(product?.images);
      default:
        return `<div class="sortable-table__cell">${product[config.id]}</div>`;
      }
    }).join('');

    return `
      <a href="/products/${product.id}" class="sortable-table__row">
        ${rowData}
      </a>
    `;
  };

  get bodyElements() {
    return this.data.map(this.getTableRow).join('');
  }

  get template() {
    return `
      <div class="sortable-table">
        <div data-element="header" class="sortable-table__header sortable-table__row">
          ${this.header}
        </div>
        <div data-element="body" class="sortable-table__body">
          ${this.bodyElements}
        </div>

        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          <div>
            <p>No products satisfies your filter criteria</p>
            <button type="button" class="button-primary-outline">Reset all filters</button>
          </div>
        </div>
      </div>
    `;
  }

  createElement() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();
  }

  async render() {
    this.toShowSpinner(true);
    await this.loadData();
    this.toShowSpinner(false);
    this.updateBodyElements();
    this.updateHeaderSortArrow(this.sorted.id, this.sorted.order);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    document.removeEventListener('scroll', this.onScrollHandler);
    if (this.subElements.header) {
      this.subElements.header.removeEventListener('pointerdown', this.headerPointerDownHandler);
    }
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
