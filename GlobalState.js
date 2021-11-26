let nextId = 0;
function getNextId() {
  const next = nextId++;
  return `c${next}`;
}

class Product {
  constructor(name, unitPrice) {
    this.id = getNextId();
    this.name = name;
    this.unitPrice = unitPrice;
  }
}

class Order {
  constructor(discount = 0) {
    this.id = getNextId();
    this.discount = discount;
    this.selectedOrderlineId = null;
    this.lines = {};
  }
  addOrderline(product, options = {}) {
    const newLine = new Orderline(this, product, options);
    this.lines[newLine.id] = newLine;
    this.selectedOrderlineId = newLine.id;
    return newLine.id;
  }
  deleteOrderline(line) {
    delete line.order.lines[line.id];
  }
  getOrderTotal() {
    return (
      (1 - this.discount) *
      Object.values(this.lines).reduce(
        (total, line) => total + line.getLineTotal(),
        0
      )
    );
  }
  getNumberOfLines() {
    return Object.keys(this.lines).length;
  }
  getLine(lineId) {
    return this.lines[lineId];
  }
  smartAddOrderline(product) {
    const existingLine = Object.values(this.lines).find(
      (line) => line.product.id == product.id
    );
    if (existingLine) {
      existingLine.setQuantity(existingLine.quantity + 1);
    } else {
      this.addOrderline(product);
    }
  }
}

class Orderline {
  constructor(order, product, options) {
    const defaultOptions = { quantity: 1, unitPrice: null };
    options = Object.assign(defaultOptions, options);
    this.id = getNextId();
    this.order = order;
    this.product = product;
    this.isManualPrice = options.unitPrice !== null;
    this.quantity = options.quantity;
    this.unitPrice = options.unitPrice;
  }
  setQuantity(newQuantity) {
    if (newQuantity == 0) {
      this.order.deleteOrderline(this);
    } else {
      this.quantity = newQuantity;
    }
  }
  getUnitPrice() {
    if (this.isManualPrice) {
      return this.unitPrice;
    } else {
      return this.product.unitPrice;
    }
  }
  getLineTotal() {
    return this.getUnitPrice() * this.quantity;
  }
}

const products =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam rhoncus auctor feugiat. Integer ac massa mauris. Nullam luctus dapibus lobortis. Etiam porta sit amet est ut viverra. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Vestibulum in augue quis turpis bibendum pretium. Aenean ac lacinia dolor. Morbi interdum dictum magna, sed congue leo eleifend vel. Nunc sit amet neque tincidunt, ultricies ex in, consequat ante.'
    .split(' ')
    .map((word) => word.toLowerCase().replaceAll(/,|\./g, ''))
    .map((word) => new Product(word, Math.floor(Math.random() * 10) + 1));

export default class GlobalState {
  constructor() {
    this.selectedOrderId = { value: null };
    this.orders = {};
    this.products = {};
    this._loadProducts();
  }
  _loadProducts() {
    for (const product of products) {
      this.products[product.id] = product;
    }
  }
  getProducts() {
    return Object.values(this.products);
  }
  getOrders() {
    return Object.values(this.orders);
  }
  getNumberOfOrders() {
    return this.getOrders().length;
  }
  createNewOrder() {
    const newOrder = new Order();
    this.orders[newOrder.id] = newOrder;
    this.selectOrder(newOrder);
    return newOrder.id;
  }
  selectOrder(order) {
    this.selectedOrderId.value = order ? order.id : null;
  }
  deleteOrder(order) {
    const deletedOrderId = order.id;
    delete this.orders[order.id];
    if (deletedOrderId == this.selectedOrderId.value) {
      this.selectOrder(null);
    }
  }
  getProduct(productId) {
    return this.products[productId];
  }
  getOrder(orderId) {
    return this.orders[orderId];
  }
  getSelectedOrder() {
    return this.getOrder(this.selectedOrderId.value);
  }
  async makeOrders(n) {
    for (let i = 0; i < n; i++) {
      this.createNewOrder();
      await artificialDelay();
      await this.addRandomLines(Math.floor(Math.random() * 100) + 1);
      await artificialDelay();
      if (Math.random() < 0.995) {
        this.deleteOrder(this.getSelectedOrder());
      }
      console.log('makeOrder', i);
    }
  }
  async addRandomLines(n) {
    for (let i = 0; i < n; i++) {
      const order = this.getSelectedOrder();
      const product = selectRandom(this.getProducts());
      order.smartAddOrderline(product);
      await artificialDelay();
    }
  }
}

function artificialDelay() {
  return new Promise((resolve) => setTimeout(resolve, Math.random() * 10));
}

function selectRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}
