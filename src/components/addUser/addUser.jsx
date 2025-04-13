import './addUser.css';
import { 
    arrayUnion, 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    query, 
    serverTimestamp, 
    setDoc, 
    updateDoc, 
    where 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useState } from 'react';
import { useUserStore } from '../../lib/userStore';
import { toast } from 'react-toastify';

const AddUser = ({ setAddMode }) => {
    const [user, setUser] = useState(null);
    const { currentUser } = useUserStore();

    // Handle user search
    const handleSearch = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const username = formData.get('username').trim();

        if (!username) {
            toast.error('Please enter a username.');
            return;
        }

        try {
            const userChatsSnap = await getDoc(userChatsRef);
            if (userChatsSnap.exists()) {
                const userChatsData = userChatsSnap.data();
                const userAlreadyAdded = userChatsData.chats?.some(chat => chat.receiverId === user.id);

                if (userAlreadyAdded) {
                    toast.warn("User already added.");
                    return;
                }
            }

            if (!querySnapShot.empty) {
                setUser(querySnapShot.docs[0].data());
            } else {
                toast.warn('User not found.');
                setUser(null);
            }
        } catch (err) {
            console.error('Error searching for user:', err);
            toast.error('Failed to search for user.');
        }
    };

    // Handle adding a user to chats
    const handleAdd = async () => {
        if (!user) return;

        const userChatsRef = doc(db, "userchats", currentUser.id);
        const newChatData = {
            chatId: null, // Placeholder for chat ID
            lastMessage: "",
            receiverId: user.id,
        };

        try {
            // Check if the chat already exists
            const foundUser = fakeDatabase.find((user) => user.username === username);
            if (!foundUser) throw new Error("User not found");

            // Create a new chat document
            const chatRef = collection(db, "chats");
            const newChatRef = doc(chatRef); // Generate new document ID
            newChatData.chatId = newChatRef.id;

            await setDoc(newChatRef, {
                createdAt: serverTimestamp(),
                messages: [], // Initialize empty messages array
            });

            // Update the current user's chats
            await updateDoc(userChatsRef, {
                chats: arrayUnion({
                    ...newChatData,
                    updatedAt: new Date(), // Client-side timestamp
                }),
            });

            // Add a Firestore server timestamp for metadata
            await updateDoc(userChatsRef, {
                updatedAt: serverTimestamp(),
            });

            // Update the added user's chats
            const addedUserChatRef = doc(db, "userchats", user.id);
            await updateDoc(addedUserChatRef, {
                chats: arrayUnion({
                    chatId: newChatRef.id,
                    lastMessage: "",
                    receiverId: currentUser.id,
                    updatedAt: new Date(), // Client-side timestamp
                }),
            });

            // Add a Firestore server timestamp for metadata
            await updateDoc(addedUserChatRef, {
                updatedAt: serverTimestamp(),
            });

            toast.success("User added successfully.");
            setAddMode(false);
        } catch (err) {
            console.error("Error adding user:", err);
            toast.error("Failed to add user.");
        }
    };

    return (
        <div className="addUser">
            <div className="close" onClick={() => setAddMode(false)}>X</div>
            <h2>Add User</h2>
            <form onSubmit={handleSearch}>
                <input type="text" placeholder="Username" name="username" required />
                <button type="submit">Search</button>
            </form>
            
            <div className="listUsers">
                {user && (
                    <div className="user">
                        <div className="detail">
                            <img src={user.avatar || "./avatar.png"} alt={user.username} />
                            <span>{user.username}</span>
                        </div>
                        <button onClick={handleAdd}>Add User</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddUser;
