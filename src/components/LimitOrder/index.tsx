import { useState } from 'react';
import dayjs from 'dayjs';
import type { Account } from '../AccountList';
import styles from './index.module.scss';

type LimitOrderProps = {
  currentAccount: Account;
};

type Side = 'buy' | 'sell';
type AmountUnit = 'BTC' | 'USDT';

type OrderPreview = {
  account: string;
  side: 'Buy' | 'Sell';
  price: number;
  btcAmount: number;
  timestamp: string;
};

const FIXED_SCALE = 10_000;
const CALCULATION_SCALE = FIXED_SCALE * FIXED_SCALE;
const DEFAULT_PRICE_INPUT = '67250';
const DEFAULT_PRICE = 672_500_000;
const PERCENTAGES = [0, 25, 50, 75, 100];
const FOUR_DECIMAL_INPUT = /^\d*(?:\.\d{0,4})?$/;
const INTEGER_INPUT = /^\d*$/;

const parseFixed = (value: string, decimals: number) => {
  if (!value) return 0;

  const [whole = '0', fraction = ''] = value.split('.');
  const scale = 10 ** decimals;
  const paddedFraction = fraction.padEnd(decimals, '0');

  return Number(whole || 0) * scale + Number(paddedFraction || 0);
};

const formatFixed = (value: number, decimals: number) => {
  if (decimals === 0) return String(value);

  const scale = 10 ** decimals;
  const whole = Math.floor(value / scale);
  const fraction = String(value % scale).padStart(decimals, '0');

  return `${whole}.${fraction}`;
};

const formatBalance = (value: number, maximumFractionDigits = 2) => (
  value.toLocaleString('en-US', { maximumFractionDigits })
);

const LimitOrder = ({ currentAccount }: LimitOrderProps) => {
  const [side, setSide] = useState<Side>('buy');
  const [externalPriceInput, setExternalPriceInput] = useState(DEFAULT_PRICE_INPUT);
  const [externalPrice, setExternalPrice] = useState(DEFAULT_PRICE);
  const [priceInput, setPriceInput] = useState(DEFAULT_PRICE_INPUT);
  const [price, setPrice] = useState(DEFAULT_PRICE);
  const [isPriceEdited, setIsPriceEdited] = useState(false);
  const [amountInput, setAmountInput] = useState('');
  const [amount, setAmount] = useState(0);
  const [amountUnit, setAmountUnit] = useState<AmountUnit>('BTC');
  const [orderPreview, setOrderPreview] = useState<OrderPreview | null>(null);

  const btcBalance = Math.round(currentAccount.btcBalance * FIXED_SCALE);
  const usdtBalance = Math.round(currentAccount.usdtBalance);
  const availableBalance = side === 'buy'
    ? usdtBalance
    : btcBalance;
  const availableUnit = side === 'buy' ? 'USDT' : 'BTC';

  const maxAmount = amountUnit === 'BTC'
    ? (side === 'buy' && price > 0
      ? Math.floor((usdtBalance * CALCULATION_SCALE) / price)
      : btcBalance)
    : (side === 'buy'
      ? usdtBalance
      : Math.floor((btcBalance * price) / CALCULATION_SCALE));

  const percentage = maxAmount > 0
    ? Math.min((amount / maxAmount) * 100, 100)
    : 0;

  const btcAmount = amountUnit === 'BTC'
    ? amount
    : (price > 0 ? Math.floor((amount * CALCULATION_SCALE) / price) : 0);
  const estimatedAmount = amountUnit === 'BTC'
    ? Math.floor((amount * price) / CALCULATION_SCALE)
    : btcAmount;
  const estimatedUnit = amountUnit === 'BTC' ? 'USDT' : 'BTC';
  const isOrderDisabled = price <= 0 || amount <= 0 || btcAmount <= 0;

  const updateAmountFromPercentage = (nextPercentage: number) => {
    const nextAmount = Math.floor((maxAmount * nextPercentage) / 100);
    setAmount(nextAmount);
    setAmountInput(nextPercentage === 0
      ? ''
      : formatFixed(nextAmount, amountUnit === 'BTC' ? 4 : 0));
  };

  const changeExternalPrice = (value: string) => {
    if (!FOUR_DECIMAL_INPUT.test(value)) return;

    const nextExternalPrice = parseFixed(value, 4);
    setExternalPriceInput(value);
    setExternalPrice(nextExternalPrice);

    if (!isPriceEdited) {
      setPriceInput(value);
      setPrice(nextExternalPrice);
    }
  };

  const changePrice = (value: string) => {
    if (!FOUR_DECIMAL_INPUT.test(value)) return;

    setIsPriceEdited(true);
    setPriceInput(value);
    setPrice(parseFixed(value, 4));
  };

  const changeAmount = (value: string) => {
    const pattern = amountUnit === 'BTC' ? FOUR_DECIMAL_INPUT : INTEGER_INPUT;
    if (!pattern.test(value)) return;

    setAmountInput(value);
    setAmount(parseFixed(value, amountUnit === 'BTC' ? 4 : 0));
  };

  const changeSide = (nextSide: Side) => {
    setSide(nextSide);
    setAmount(0);
    setAmountInput('');
  };

  const changeUnit = (nextUnit: AmountUnit) => {
    setAmountUnit(nextUnit);
    setAmount(0);
    setAmountInput('');
  };

  const createOrderPreview = () => {
    setOrderPreview({
      account: `Account #${currentAccount.id}`,
      side: side === 'buy' ? 'Buy' : 'Sell',
      price,
      btcAmount,
      timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss.SSS'),
    });
  };

  return (
    <section className={styles.limitOrder} aria-label="Limit order">
      <header className={styles.titleBar}>
        <h2>Limit Order</h2>
        <label className={styles.externalPrice}>
          <span>Market</span>
          <input
            data-fixed-price={externalPrice}
            inputMode="decimal"
            onChange={(event) => changeExternalPrice(event.target.value)}
            type="text"
            value={externalPriceInput}
          />
          <strong>USDT</strong>
        </label>
        <span className={styles.symbol}>BTC / USDT</span>
      </header>

      <div className={styles.sideControl} aria-label="Order side">
        <button
          aria-pressed={side === 'buy'}
          className={side === 'buy' ? styles.activeBuy : undefined}
          onClick={() => changeSide('buy')}
          type="button"
        >
          Buy
        </button>
        <button
          aria-pressed={side === 'sell'}
          className={side === 'sell' ? styles.activeSell : undefined}
          onClick={() => changeSide('sell')}
          type="button"
        >
          Sell
        </button>
      </div>

      <div className={styles.formBody}>
        <div className={styles.balanceRow}>
          <span>Available</span>
          <strong>
            {availableUnit === 'BTC'
              ? formatFixed(availableBalance, 4)
              : formatBalance(availableBalance, 0)} {availableUnit}
          </strong>
        </div>

        <label className={styles.field}>
          <span>Price</span>
          <div className={styles.inputBox}>
            <input
              inputMode="decimal"
              onChange={(event) => changePrice(event.target.value)}
              type="text"
              value={priceInput}
            />
            <strong>USDT</strong>
          </div>
        </label>

        <div className={styles.amountHeader}>
          <span>Amount</span>
          <div className={styles.unitControl} aria-label="Amount unit">
            <button
              aria-pressed={amountUnit === 'BTC'}
              className={amountUnit === 'BTC' ? styles.activeUnit : undefined}
              onClick={() => changeUnit('BTC')}
              type="button"
            >
              BTC
            </button>
            <button
              aria-pressed={amountUnit === 'USDT'}
              className={amountUnit === 'USDT' ? styles.activeUnit : undefined}
              onClick={() => changeUnit('USDT')}
              type="button"
            >
              USDT
            </button>
          </div>
        </div>

        <label className={styles.inputBox}>
          <input
            inputMode={amountUnit === 'BTC' ? 'decimal' : 'numeric'}
            onChange={(event) => changeAmount(event.target.value)}
            placeholder={amountUnit === 'BTC' ? '0.0000' : '0'}
            type="text"
            value={amountInput}
          />
          <strong>{amountUnit}</strong>
        </label>

        <div className={styles.sliderBlock}>
          <input
            aria-label="Percentage of available balance"
            max="100"
            min="0"
            onChange={(event) => updateAmountFromPercentage(Number(event.target.value))}
            step="1"
            type="range"
            value={percentage}
          />
          <div className={styles.percentageButtons}>
            {PERCENTAGES.map((value) => (
              <button
                key={value}
                onClick={() => updateAmountFromPercentage(value)}
                type="button"
              >
                {value}%
              </button>
            ))}
          </div>
        </div>

        <div className={styles.summary}>
          <span>Estimated</span>
          <strong>
            {estimatedUnit === 'BTC'
              ? formatFixed(estimatedAmount, 4)
              : formatBalance(estimatedAmount, 0)} {estimatedUnit}
          </strong>
        </div>

        <button
          className={side === 'buy' ? styles.buyButton : styles.sellButton}
          disabled={isOrderDisabled}
          onClick={createOrderPreview}
          type="button"
        >
          {side === 'buy' ? 'Buy BTC' : 'Sell BTC'}
        </button>

        {orderPreview && (
          <div className={styles.jsonOutput}>
            <span>Latest order JSON</span>
            <pre>{JSON.stringify(orderPreview, null, 2)}</pre>
          </div>
        )}
      </div>
    </section>
  );
};

export default LimitOrder;
