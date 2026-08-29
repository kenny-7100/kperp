import styles from './index.module.scss';

export type Account = {
  id: number;
  btcBalance: number;
  usdtBalance: number;
};

export const accounts: Account[] = Array.from({ length: 100 }, (_, index) => ({
  id: index + 1,
  btcBalance: 10,
  usdtBalance: 5_000_000,
}));

type AccountListProps = {
  currentAccount: Account;
  onSelect: (account: Account) => void;
};

const formatBalance = (value: number) => value.toLocaleString('en-US');

const AccountList = ({ currentAccount, onSelect }: AccountListProps) => {
  return (
    <section className={styles.accountList} aria-label="Account list">
      <header className={styles.titleBar}>
        <h2>Accounts</h2>
        <span>100 total</span>
      </header>

      <div className={styles.columnHeaders}>
        <span>Account</span>
        <span>BTC</span>
        <span>USDT</span>
      </div>

      <div className={styles.rows}>
        {accounts.map((account) => {
          const isCurrent = account.id === currentAccount.id;

          return (
            <button
              aria-pressed={isCurrent}
              className={isCurrent ? styles.selected : undefined}
              key={account.id}
              onClick={() => onSelect(account)}
              type="button"
            >
              <span>Account #{account.id}</span>
              <span>{formatBalance(account.btcBalance)}</span>
              <span>{formatBalance(account.usdtBalance)}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default AccountList;
