import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const db = getFirestore();

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchData();
  }, []);

  return (
    <Layout>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Users</h1>
       {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="bg-white rounded-lg shadow-lg">
          <ul className="divide-y divide-gray-200">
            <li className="p-4 flex justify-between items-center font-bold text-gray-500">
                <p>User UID</p>
                <p>Status</p>
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
                    {/* Admin toggle button will go here */}
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