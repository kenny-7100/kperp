import { useState } from 'react';
import AccountList, { accounts } from './components/AccountList';
import Header from './components/Header';
import OrderBook from './components/OrderBook';
import styles from './App.module.scss';

function App() {
  const [currentAccount, setCurrentAccount] = useState(accounts[0]);

  return (
    <div className={styles.page}>
      <Header currentAccount={currentAccount} />
      <main className={styles.content}>
        <OrderBook />
        <AccountList
          currentAccount={currentAccount}
          onSelect={setCurrentAccount}
        />
      </main>
    </div>
  );
}

export default App;
