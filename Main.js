import * as atom from './lib/atom.js';
import * as owl from './lib/owl.es.js';

class Products extends owl.Component {
  static template = owl.tags.xml/* html */ `
    <div>
      <ul t-foreach="env.state.getProducts()" t-as="product" t-key="product.id">
        <li>
          <span t-esc="product.name" />
          <span t-esc="product.unitPrice" />
          <span>
            <button t-on-click="trigger('click-product', product)">add</button>
          </span>
        </li>
      </ul>
      <hr />
    </div>
  `;
}

class Controls extends owl.Component {
  static template = owl.tags.xml/* html */ `
    <div>
      <span>
        <button t-on-click="trigger('new-order')">New Order</button>
      </span>
      <span>Number of orders:</span>
      <span t-esc="props.numberOfOrders" />
      <hr />
    </div>
  `;
}

class Orders extends owl.Component {
  static template = owl.tags.xml/* html */ `
    <div>
      <ul t-foreach="props.orders" t-as="order" t-key="order.id">
        <li>
          <span t-esc="order.getNumberOfLines()" />
          <span>items @</span>
          <span t-esc="formattedOrderTotal(order)" />
          <span>
            <button t-on-click="trigger('delete-order', order)">x</button>
            <button t-on-click="trigger('select-order', order)">select</button>
          </span>
        </li>
      </ul>
      <hr />
    </div>
  `;
  getNumberOfLines(order) {
    return order.lines.length;
  }
  formattedOrderTotal(order) {
    return `$${order.getOrderTotal()}`;
  }
}

class Orderline extends owl.Component {
  static template = owl.tags.xml/*html*/ `
    <li>
      <span>
        <button
          t-on-click="trigger('delete-orderline', props.line)"
        >
          x
        </button>
      </span>
      <span t-esc="getFormattedLineTotal()"/>
      <span>>>></span>
      <span t-esc="props.line.quantity" />
      <span t-esc="props.line.product.name" />
      <span>@</span>
      <span t-esc="getFormattedUnitPrice()" />
      <span>
        <button
          t-on-click="trigger('increment-orderline', props.line)"
        >
          inc
        </button>
        <button
          t-on-click="trigger('decrement-orderline', props.line)"
        >
          dec
      </button>
      </span>
    </li>
  `;
  getFormattedUnitPrice() {
    return `$${this.props.line.getUnitPrice()}`;
  }
  getFormattedLineTotal() {
    return `$${this.props.line.getLineTotal()}`;
  }
}

class OrderTotal extends owl.Component {
  static template = owl.tags.xml/*html*/ `
    <div>
      <span>Total Amount:</span>
      <span t-esc="getTotalAmount()" />
    </div>
  `;
  getTotalAmount() {
    return this.props.order.getOrderTotal();
  }
}

class SelectedOrder extends owl.Component {
  static components = { Orderline, OrderTotal };
  static template = owl.tags.xml/* html */ `
    <div>
      <t t-if="props.order">
        <div>
          <span>Order ID:</span><t t-esc="props.order.id"></t>
        </div>
        <ul t-foreach="props.order.lines" t-as="line_id" t-key="line_id">
          <Orderline line="props.order.getLine(line_id)" />
        </ul>
        <OrderTotal order="props.order" />
      </t>
      <t t-else="">
        <p>No selected order</p>
      </t>
      <hr />
    </div>
  `;
}

export default class App extends owl.Component {
  static components = { Products, Orders, SelectedOrder, Controls };
  static template = owl.tags.xml/* html */ `
    <div
      t-on-click-product="onClickProduct"
      t-on-select-order="onClickOrder"
      t-on-new-order="onNewOrder"
      t-on-delete-order="onDeleteOrder"
      t-on-delete-orderline="onDeleteOrderline"
      t-on-increment-orderline="onIncrementOrderline"
      t-on-decrement-orderline="onDecrementOrderline"
    >
      <Products />
      <Controls numberOfOrders="state.getNumberOfOrders()" />
      <SelectedOrder order="state.getSelectedOrder()" />
      <Orders orders="state.getOrders()" />
    </div>
  `;
  setup() {
    this.state = atom.useState(this.env.state);
  }
  onClickProduct({ detail: product }) {
    const selectedOrder = this.state.getSelectedOrder();
    if (selectedOrder) {
      const existingLine = Object.values(selectedOrder.lines).find(
        (line) => line.product.id == product.id
      );
      if (existingLine) {
        existingLine.setQuantity(existingLine.quantity + 1);
      } else {
        selectedOrder.addOrderline(product);
      }
    }
  }
  onClickOrder({ detail: order }) {
    this.state.selectOrder(order);
  }
  onNewOrder() {
    this.state.createNewOrder();
  }
  onDeleteOrder({ detail: order }) {
    this.state.deleteOrder(order);
  }
  onDeleteOrderline({ detail: line }) {
    line.order.deleteOrderline(line);
  }
  onIncrementOrderline({ detail: line }) {
    line.setQuantity(line.quantity + 1);
  }
  onDecrementOrderline({ detail: line }) {
    if (line.quantity > 0) {
      line.setQuantity(line.quantity - 1);
    }
  }
}
