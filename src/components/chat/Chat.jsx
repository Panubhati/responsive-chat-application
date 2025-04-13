import './chat.css';
import { useEffect, useRef, useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useChatStore } from '../../lib/chatStore';
import { useUserStore } from '../../lib/userStore';

const Chat = () => {
  const [chat, setChat] = useState(null); // Initialize chat state as null
  const [openEmoji, setOpenEmoji] = useState(false);
  const [text, setText] = useState("");
  const [img, setImg] = useState({
    file: null,
    url: "",
  });
  const [loading, setLoading] = useState(true); // Add loading state

  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();

  const endRef = useRef(null);

  useEffect(() => {
    // Scroll to the bottom when chat updates
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  useEffect(() => {
    if (!chatId) {
      console.error("No chatId provided");
      return; // Ensure chatId is defined
    }
    const unSub = onSnapshot(
      doc(db, "chats", chatId),
      (res) => {
        if (res.exists()) {
          setChat(res.data());
          setLoading(false); // Stop loading once chat data is available
        } else {
          console.error("Chat not found");
        }
      }
    );

    return () => {
      unSub();
    };
  }, [chatId]);

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpenEmoji(false);
  };

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSend = async () => {
    if (!chatId || !currentUser?.id) {
      console.error("Missing chatId or currentUser id");
      return; // Ensure chatId and currentUser are available
    }

    if (text === "" && !img.file) return; // Prevent sending empty messages

    let imgUrl = null;

    try {
      if (img.file) {
        imgUrl = await upload(img.file); // Assuming upload is a function that handles image upload
      }

      // Update the chat document with the new message
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }),
        }),
      });

      const userIDs = [currentUser.id, user.id];

      // Update the userchats collection to reflect the last message
      userIDs.forEach(async (id) => {
        const userChatRef = doc(db, "userchats", id);
        const userChatsSnapShot = await getDoc(userChatRef);

        if (userChatsSnapShot.exists()) {
          const userChatsData = userChatsSnapShot.data();
          const chatIndex = userChatsData.chats.findIndex((c) => c.chatId === chatId);

          if (chatIndex !== -1) {
            userChatsData.chats[chatIndex].lastMessage = text;
            userChatsData.chats[chatIndex].isSeen = id === currentUser.id;
            userChatsData.chats[chatIndex].updatedAt = Date.now();

            await updateDoc(userChatRef, {
              chats: userChatsData.chats,
            });
          }
        }
      });

      // Clear image and text after sending
      setImg({
        file: null,
        url: "",
      });
      setText("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  if (loading) {
    return <div>Loading chat...</div>; // Display loading message until chat data is available
  }

  return (
    <div className='chat'>
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="User Avatar" />
          <div className="texts">
            <span>{user?.username || "User"}</span>
            <p>Connecting...</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="Phone" />
          <img src="./video.png" alt="Video" />
          <img src="./info.png" alt="Info" />
        </div>
      </div>

      <div className="center">
        {chat?.messages?.length > 0 ? (
          chat.messages.map((message) => (
            <div
              className={message.senderId === currentUser?.id ? "message own" : "message"}
              key={message.createdAt?.seconds || message.createdAt}>
              <img src={user?.avatar || "./avatar.png"} className='avatar' alt="Avatar" />
              <div className="texts">
                {message.img && <img src={message.img} alt="Message Image" />}
                <p>{message.text}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No messages</p>
        )}

        {img?.url && (
          <div className="message own">
            <div className="texts">
              <img src={img.url} alt="Uploaded Image" />
            </div>
          </div>
        )}

        <div ref={endRef}></div>
      </div>

      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img src="./img.png" alt="Upload Image" />
          </label>
          <input type="file" id='file' style={{ display: 'none' }} onChange={handleImg} />
          <img src="./camera.png" alt="Camera" />
          <img src="./mic.png" alt="Microphone" />
        </div>

        <input
          type="text"
          placeholder={(isCurrentUserBlocked || isReceiverBlocked) ? "You cannot send a message" : "Type a message..."}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        />

        <div className="emoji">
          <img src="./emoji.png" alt="Emoji" onClick={() => setOpenEmoji((prev) => !prev)} />
          <div className="picker">
            <EmojiPicker open={openEmoji} onEmojiClick={handleEmoji} width={"300px"} height={"400px"} />
          </div>
        </div>

        <button
          className="sendButtom"
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isReceiverBlocked || text === ""}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
