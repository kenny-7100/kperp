import type { Account } from '../AccountList';
import styles from './index.module.scss';

type HeaderProps = {
  currentAccount: Account;
};

const formatBalance = (value: number) => value.toLocaleString('en-US');

const Header = ({ currentAccount }: HeaderProps) => {
  return (
    <header className={styles.header}>
      <strong className={styles.brand}>KPERP</strong>

      <div className={styles.currentAccount} aria-label="Current account">
        <strong>Account #{currentAccount.id}</strong>
        <span><b>{formatBalance(currentAccount.btcBalance)}</b> BTC</span>
        <span><b>{formatBalance(currentAccount.usdtBalance)}</b> USDT</span>
      </div>
    </header>
  );
};

export default Header;
