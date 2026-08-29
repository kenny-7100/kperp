import styles from './index.module.scss';

type Order = {
  price: number;
  amount: number;
};

type OrderWithSum = Order & {
  sum: number;
};

const asks: Order[] = [
  { price: 67251, amount: 0.0842 },
  { price: 67252, amount: 0.1357 },
  { price: 67253, amount: 0.0624 },
  { price: 67254, amount: 0.2186 },
  { price: 67255, amount: 0.0973 },
  { price: 67256, amount: 0.3418 },
  { price: 67257, amount: 0.1562 },
  { price: 67258, amount: 0.0749 },
  { price: 67259, amount: 0.2831 },
  { price: 67260, amount: 0.1195 },
  { price: 67261, amount: 0.2074 },
  { price: 67262, amount: 0.0918 },
  { price: 67263, amount: 0.1646 },
  { price: 67264, amount: 0.0527 },
  { price: 67265, amount: 0.2389 },
];

const bids: Order[] = [
  { price: 67250, amount: 0.1268 },
  { price: 67249, amount: 0.0735 },
  { price: 67248, amount: 0.1924 },
  { price: 67247, amount: 0.0581 },
  { price: 67246, amount: 0.2673 },
  { price: 67245, amount: 0.1046 },
  { price: 67244, amount: 0.3217 },
  { price: 67243, amount: 0.0892 },
  { price: 67242, amount: 0.1459 },
  { price: 67241, amount: 0.2148 },
  { price: 67240, amount: 0.0674 },
  { price: 67239, amount: 0.1785 },
  { price: 67238, amount: 0.1123 },
  { price: 67237, amount: 0.2461 },
  { price: 67236, amount: 0.0957 },
];

const withCumulativeSum = (orders: Order[]): OrderWithSum[] => {
  let sum = 0;

  return orders.map((order) => {
    sum += order.amount;
    return { ...order, sum };
  });
};

const askRows = withCumulativeSum(asks).reverse();
const bidRows = withCumulativeSum(bids);
const maxSum = Math.max(askRows[0].sum, bidRows[bidRows.length - 1].sum);
const bestAsk = asks[0].price;
const bestBid = bids[0].price;
const midPrice = (bestAsk + bestBid) / 2;

const formatPrice = (price: number) => price.toLocaleString('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const formatAmount = (value: number) => value.toFixed(4);

type OrderRowsProps = {
  orders: OrderWithSum[];
  side: 'ask' | 'bid';
};

const OrderRows = ({ orders, side }: OrderRowsProps) => (
  <div className={styles.rows}>
    {orders.map((order) => (
      <div className={styles.row} key={order.price}>
        <span
          aria-hidden="true"
          className={`${styles.depth} ${styles[side]}`}
          style={{ width: `${(order.sum / maxSum) * 100}%` }}
        />
        <span className={styles[`${side}Price`]}>{formatPrice(order.price)}</span>
        <span>{formatAmount(order.amount)}</span>
        <span>{formatAmount(order.sum)}</span>
      </div>
    ))}
  </div>
);

const OrderBook = () => {
  return (
    <section className={styles.orderBook} aria-label="BTC USDT order book">
      <header className={styles.titleBar}>
        <h2>Order Book</h2>
        <span className={styles.symbol}>BTC / USDT</span>
      </header>

      <div className={styles.columnHeaders}>
        <span>Price (USDT)</span>
        <span>Amount (BTC)</span>
        <span>Sum (BTC)</span>
      </div>

      <OrderRows orders={askRows} side="ask" />

      <div className={styles.spread}>
        <strong>{midPrice.toLocaleString('en-US', { minimumFractionDigits: 1 })}</strong>
        <span>Spread {formatPrice(bestAsk - bestBid)} USDT</span>
      </div>

      <OrderRows orders={bidRows} side="bid" />

      <footer className={styles.footer}>
        <span>Aggregation</span>
        <strong>1 USDT</strong>
      </footer>
    </section>
  );
};

export default OrderBook;
