import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  subElements = {};
  product = null;
  categories = [];
  productsUrl = new URL(`${BACKEND_URL}/api/rest/products`);
  categoriesUrl = new URL(`${BACKEND_URL}/api/rest/categories`);
  imgurUrl = new URL('https://api.imgur.com/3/image');

  constructor(productId = '') {
    this.productId = productId;
  }

  initEventListeners() {
    const { productForm, fileInput } = this.subElements;
    productForm.elements.uploadImage.addEventListener('pointerdown', this.openFileUploadDialogHandler);
    fileInput.addEventListener('change', this.uploadImageHandler);
  }

  saveEventHandler = (e) => {
    e.preventDefault();
    this.save();
  }

  openFileUploadDialogHandler = (e) => {
    this.subElements.fileInput.click();
  }

  uploadImageHandler = async (e) => {
    const file = this.subElements.fileInput.files[0];
    const formData = new FormData();
    formData.append('image', file);

    const options = {
      method: 'POST',
      headers: {
        Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
      },
      referrer: '',
      body: formData,
    };

    try {
      const data = await fetchJson(this.imgurUrl, options);
      console.log('==imgur resp', data);
    } catch (e) {
      console.error('save Error:', e);
    }
  }

  loadData = async () => {
    Object.entries({
      _sort: 'id',
      _refs: 'subcategory'
    }).forEach(([key, val]) => this.categoriesUrl.searchParams.append(key, val));
    const urls = [this.categoriesUrl];

    if (this.productId) {
      Object.entries({
        id: this.productId
      }).forEach(([key, val]) => this.productsUrl.searchParams.append(key, val));
      urls.push(this.productsUrl);
    }

    let data = [];
    try {
      data = await Promise.all(urls.map(url => fetchJson(url)));
      this.categories = data?.[0] || [];
      this.product = data?.[1][0];
    } catch (e) {
      console.error('loadData Error:', e);
    }

    return data;
  };

  save = async () => {
    const formData = new FormData(this.subElements.productForm);
    const formDataObj = Object.fromEntries(formData.entries());

    let data = {};
    try {
      data = await fetchJson(this.productsUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(formDataObj)
      });

    } catch (e) {
      console.error('save Error:', e);
    }

    let saveEvent = new Event("product-updated");
    this.element.dispatchEvent(saveEvent);

    return data;
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

  updateFormElements() {
    this.subElements.productForm.elements['subcategory'].innerHTML = this.getCategoryElements();
    this.subElements.imageListContainer.firstElementChild.innerHTML = this.getImageElements();

    for (const elem of this.subElements.productForm.elements) {
      const name = elem.getAttribute('name');
      if (this.product[name]) {
        elem.value = this.product[name];
      }
    }
  }

  getCategoryElements() {
    const options = [];
    for (const category of this.categories) {
      for (const subcategory of category.subcategories) {
        options.push(`<option value="${subcategory.id}">${category.title} &gt; ${subcategory.title}</option>`);
      }
    }

    return options.join('');
  }

  getImageElements() {
    const images = this.product.images.map(image => {
      return `
        <li class="products-edit__imagelist-item sortable-list__item" style="">
          <input type="hidden" name="url" value="${image.url}">
          <input type="hidden" name="source" value="${image.source}">
          <span>
            <img src="icon-grab.svg" data-grab-handle="" alt="grab">
            <img class="sortable-table__cell-img" alt="Image" src="${image.url}">
            <span>${image.source}</span>
          </span>
          <button type="button">
            <img src="icon-trash.svg" data-delete-handle="" alt="delete">
          </button>
        </li>
      `;
    });

    return images.join('');
  }

  get template() {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input id="title" required="" type="text" name="title" class="form-control" placeholder="Название товара">
            </fieldset>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea id="description" required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
          </div>
          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer">
                <ul class="sortable-list"></ul>
            </div>
            <input data-element="fileInput" id="fileInput" type="file" accept="image/png, image/jpeg" hidden/>
            <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
          </div>
          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            <select id="subcategory" class="form-control" name="subcategory">
            </select>
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input id="price" required="" type="number" name="price" class="form-control" placeholder="100">
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input id="discount" required="" type="number" name="discount" class="form-control" placeholder="0">
            </fieldset>
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input id="quantity" required="" type="number" class="form-control" name="quantity" placeholder="1">
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select id="status" class="form-control" name="status">
              <option value="1">Активен</option>
              <option value="0">Неактивен</option>
            </select>
          </div>
          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">
              Сохранить товар
            </button>
          </div>
        </form>
      </div>
    `;
  }

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();
    this.subElements.productForm.onsubmit = this.saveEventHandler;

    this.initEventListeners();

    await this.loadData();
    this.updateFormElements();
    return this.element;
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
