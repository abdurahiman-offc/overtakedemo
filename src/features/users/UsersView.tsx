import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useLeads } from '../../context/LeadsContext';
import { UserPlus, Shield, X, Save, Edit2, Trash2 } from 'lucide-react';
import { User } from '../../types';
import { ConfirmDeleteModal } from '../../components/ConfirmDeleteModal';

export function UsersView() {
    const { users, addUser, updateUser, deleteUser } = useLeads();

    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const [userFormData, setUserFormData] = useState({
        username: '',
        role: 'sales' as 'admin' | 'manager' | 'sales'
    });

    const [error, setError] = useState('');
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; username: string }>({
        isOpen: false,
        id: '',
        username: ''
    });

    const openAddModal = () => {
        setEditingUser(null);
        setUserFormData({ username: '', role: 'sales' });
        setError('');
        setIsUserModalOpen(true);
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setUserFormData({
            username: user.username || '',
            role: user.role as 'admin' | 'manager' | 'sales'
        });
        setError('');
        setIsUserModalOpen(true);
    };

    const handleUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userFormData.username.trim()) {
            setError('Username is required');
            return;
        }

        if (editingUser) {
            await updateUser(editingUser._id, userFormData);
        } else {
            await addUser(userFormData);
        }
        setIsUserModalOpen(false);
        setEditingUser(null);
        setUserFormData({ username: '', role: 'sales' });
        setError('');
    };

    const handleDeleteUser = (id: string, username: string) => {
        setDeleteModal({ isOpen: true, id, username });
    };

    const confirmDeleteUser = async () => {
        if (deleteModal.id) {
            await deleteUser(deleteModal.id);
            setDeleteModal({ isOpen: false, id: '', username: '' });
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Manage team users</h2>
                    <p className="text-xs sm:text-sm text-gray-500">Configure system settings and manage team users.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#1B1B19] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-gray-200 hover:bg-black transition-all active:scale-95 w-full sm:w-auto"
                >
                    <UserPlus size={18} />
                    Add Sales Rep
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden z-10">
                {/* Desktop view table */}
                <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 bg-gray-50/50">
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {users.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-[#1B1B19] font-bold uppercase">
                                                {user.username?.charAt(0) || 'U'}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900">{user.username}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                            <Shield size={14} className="text-[#1B1B19]" />
                                            <span className="capitalize">{user.role}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(user)}
                                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="Edit User"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user._id, user.username)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete User"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-sm text-gray-400 italic">
                                        No users found. Add your first team member!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile view cards */}
                <div className="sm:hidden divide-y divide-gray-100">
                    {users.map((user) => (
                        <div key={user._id} className="p-4 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center text-[#1B1B19] font-bold uppercase border border-gray-100">
                                        {user.username?.charAt(0) || 'U'}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-900">{user.username}</span>
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                                            <Shield size={12} className="text-gray-400" />
                                            <span className="capitalize">{user.role}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openEditModal(user)}
                                        className="p-2.5 text-gray-600 bg-gray-50 border border-gray-100 rounded-xl transition-colors active:bg-gray-100"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUser(user._id, user.username)}
                                        className="p-2.5 text-red-600 bg-red-50 border border-red-100 rounded-xl transition-colors active:bg-red-100"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {users.length === 0 && (
                        <div className="px-6 py-12 text-center text-sm text-gray-400 italic bg-gray-50/50">
                            No users found. Add your first team member!
                        </div>
                    )}
                </div>
            </div>

            {/* USER MODAL */}
            {isUserModalOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-50/70 p-4">
                    <div className="w-full max-w-md flex flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-2xl animate-fadeIn">
                        <div className="flex items-center justify-between border-b border-gray-100/50 px-6 py-5">
                            <h2 className="text-xl font-bold text-gray-900">{editingUser ? 'Edit Sales Rep' : 'Add New Sales Rep'}</h2>
                            <button onClick={() => setIsUserModalOpen(false)} className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleUserSubmit} className="flex flex-col gap-5 p-6">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-gray-700">Username</label>
                                <input
                                    value={userFormData.username}
                                    onChange={(e) => {
                                        setUserFormData({ ...userFormData, username: e.target.value });
                                        if (error) setError('');
                                    }}
                                    className={`rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all placeholder-gray-400 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-[#1B1B19] focus:ring-gray-100'}`}
                                    placeholder="johndoe"
                                />
                                {error && <span className="text-[10px] font-bold text-red-500 uppercase px-1">{error}</span>}
                            </div>


                            <div className="flex flex-col gap-1.5 opacity-60">
                                <label className="text-sm font-semibold text-gray-700">Role</label>
                                <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-500 flex items-center gap-2">
                                    <Shield size={16} className="text-gray-400" />
                                    Sales Representative (Static)
                                </div>
                            </div>

                            <div className="mt-4 flex justify-end gap-3 border-t border-gray-100/50 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsUserModalOpen(false)}
                                    className="rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 rounded-xl bg-[#1B1B19] px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-gray-200 hover:bg-black"
                                >
                                    <Save size={18} />
                                    {editingUser ? 'Update Rep' : 'Save Rep'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
            {/* Delete Confirmation Modal */}
            <ConfirmDeleteModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={confirmDeleteUser}
                title="Delete User Account"
                message={`Are you sure you want to permanently delete the user account for "${deleteModal.username}"? They will lose all access to the CRM.`}
            />
        </div>
    );
}
