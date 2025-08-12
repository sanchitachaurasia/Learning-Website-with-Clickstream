import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth'; // Import for current user
import { auth } from '../../firebase'; // Import for current user

const db = getFirestore();

export default function ManageUsers() {
  const [currentUser] = useAuthState(auth); // Get the currently logged-in admin
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all documents from the 'users' collection
      // Note: This shows users who have registered for at least one course
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);

      // Fetch all admin UIDs
      const adminsSnapshot = await getDocs(collection(db, 'admins'));
      const adminUids = adminsSnapshot.docs.map(doc => doc.id);
      setAdmins(new Set(adminUids));

    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleAdmin = async (uid, isCurrentlyAdmin) => {
    // Prevent admins from removing their own admin status
    if (currentUser.uid === uid) {
      alert("You cannot remove your own admin status.");
      return;
    }

    const adminDocRef = doc(db, 'admins', uid);
    try {
      if (isCurrentlyAdmin) {
        // Remove admin status
        await deleteDoc(adminDocRef);
      } else {
        // Add admin status
        await setDoc(adminDocRef, { isAdmin: true });
      }
      // Refresh the data to show the change
      fetchData();
    } catch (error) {
      console.error("Error updating admin status:", error);
      alert("Failed to update admin status.");
    }
  };

  return (
    <Layout>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Users</h1>
       {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="bg-white rounded-lg shadow-lg">
          <ul className="divide-y divide-gray-200">
            <li className="p-4 flex justify-between items-center font-bold text-gray-500 uppercase text-xs">
                <p>User UID</p>
                <p>Actions</p>
            </li>
            {users.map(user => {
              const isAdmin = admins.has(user.id);
              return (
                <li key={user.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-mono text-gray-900">{user.id}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isAdmin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {isAdmin ? 'Admin' : 'User'}
                    </span>
                    <button
                      onClick={() => handleToggleAdmin(user.id, isAdmin)}
                      disabled={currentUser.uid === user.id}
                      className={`px-3 py-1 text-xs font-medium text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed
                        ${isAdmin ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`
                      }
                    >
                      {isAdmin ? 'Remove Admin' : 'Make Admin'}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </Layout>
  );
}