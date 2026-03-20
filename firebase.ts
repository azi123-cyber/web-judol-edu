import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, child, push, update, remove } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAO6cXwPSgJzrOrvxHgYqvU3stKirVnarM",
  authDomain: "portofolio-96ae7.firebaseapp.com",
  databaseURL: "https://portofolio-96ae7-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "portofolio-96ae7",
  storageBucket: "portofolio-96ae7.firebasestorage.app",
  messagingSenderId: "499422138108",
  appId: "1:499422138108:web:840f1df56aa0f7a1365179",
  measurementId: "G-QP356HCHBV"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Save new user
export const saveUserData = async (userId: string, data: any) => {
  try {
    await set(ref(db, 'users/' + userId), {
      username: data.username,
      password: data.password, 
      role: data.role || 'user',
      balance: data.balance || 0,
      lastLogin: Date.now()
    });
  } catch (error) {
    console.error("Error saving data:", error);
  }
};

// Get specific user
export const getUserData = async (userId: string) => {
  const dbRef = ref(db);
  try {
    const snapshot = await get(child(dbRef, `users/${userId}`));
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Add Balance Directly for Simulation
export const addBalanceDirectly = async (userId: string, amount: number) => {
  try {
    const userRef = child(ref(db), `users/${userId}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      const currentBalance = snapshot.val().balance || 0;
      await update(ref(db, `users/${userId}`), {
        balance: currentBalance + amount
      });
      return true;
    }
    return false;
  } catch (err) {
    console.error(err);
    return false;
  }
};

// Add Item to Inventory
export const addItemToInventory = async (userId: string, item: any, cost: number = 0) => {
  try {
    // We use push to generate a unique key for this specific instance of the item
    const newItemRef = push(child(ref(db), `users/${userId}/inventory`));
    await set(newItemRef, item);

    // Deduct Gems if cost is provided
    if (cost > 0) {
      const userRef = child(ref(db), `users/${userId}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const currentGems = snapshot.val().gems || 0;
        await update(ref(db, `users/${userId}`), {
          gems: currentGems - cost
        });
      }
    }

    return true;
  } catch (error) {
    console.error("Error adding item:", error);
    return false;
  }
};

// Sell Item (Remove from Inventory, Add Gems)
export const sellItem = async (userId: string, itemKey: string, price: number) => {
  try {
    // 1. Remove item
    await remove(ref(db, `users/${userId}/inventory/${itemKey}`));

    // 2. Add Gems
    const userRef = child(ref(db), `users/${userId}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      const currentGems = snapshot.val().gems || 0;
      await update(ref(db, `users/${userId}`), {
        gems: currentGems + price
      });
    }
    return true;
  } catch (error) {
    console.error("Error selling item:", error);
    return false;
  }
};

// Get All Users (For Admin)
export const getAllUsers = async () => {
  const dbRef = ref(db);
  try {
    const snapshot = await get(child(dbRef, `users`));
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return {};
  } catch (error) {
    return {};
  }
};

// Request Top Up
export const requestTopUp = async (userId: string, username: string, amount: number, method: string) => {
  try {
    const newKey = push(child(ref(db), 'topups')).key;
    await set(ref(db, 'topups/' + newKey), {
      userId,
      username,
      amount,
      method,
      status: 'pending',
      timestamp: Date.now()
    });
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

// Get All Top Ups (For Admin)
export const getAllTopUps = async () => {
  const dbRef = ref(db);
  try {
    const snapshot = await get(child(dbRef, `topups`));
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return {};
  } catch (error) {
    return {};
  }
};

// Approve Top Up (Admin Feature)
export const approveTopUp = async (topUpId: string, userId: string, amount: number) => {
  try {
    // 1. Update status topup jadi success
    await update(ref(db, `topups/${topUpId}`), {
      status: 'success'
    });

    // 2. Ambil saldo user sekarang
    const userSnap = await get(child(ref(db), `users/${userId}`));
    if (userSnap.exists()) {
      const currentBalance = userSnap.val().balance || 0;
      // 3. Tambah saldo
      await update(ref(db, `users/${userId}`), {
        balance: currentBalance + amount
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error approving topup:", error);
    return false;
  }
};