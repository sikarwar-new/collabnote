import React, { useEffect, useState } from "react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { listenToUserNotes, checkNoteStatus } from "../services/notesService";

const Card = ({
  id,
  title,
  subject,
  numRatings,
  price,
  driveLink,
  btn = "Add to Cart",
  isBought = false,
}) => {
  const { addToCart, removeFromCart, isInCart } = useCart();
  const { user } = useAuth();
  const [noteStatus, setNoteStatus] = useState('none');
  const [userNotes, setUserNotes] = useState({ pendingNotes: [], approvedNotes: [] });

  const alreadyInCart = isInCart(title);

  useEffect(() => {
    if (!user || !id) {
      setNoteStatus('none');
      return;
    }

    // Listen to user's notes in real-time
    const unsubscribe = listenToUserNotes(user.uid, (notes) => {
      setUserNotes(notes);
      const status = checkNoteStatus(id, notes.pendingNotes, notes.approvedNotes);
      setNoteStatus(status);
    });

    return () => unsubscribe();
  }, [user, id]);

  const handleClick = () => {
    if (alreadyInCart) {
      removeFromCart(title);
    } else {
      addToCart({ id, title, subject, numRatings, price, driveLink });
    }
  };

  const handleAccessClick = () => {
    if (driveLink) {
      window.open(driveLink, "_blank");
    } else {
      alert("Drive link not available");
    }
  };

  let buttonText = btn;
  let buttonAction = handleClick;
  let buttonClasses =
    "w-full py-2 px-4 rounded-md text-sm font-medium transition-colors duration-150 bg-orange-500 text-white hover:bg-orange-600";

  if (noteStatus === 'approved' || isBought) {
    buttonText = "Start Reading";
    buttonAction = handleAccessClick;
    buttonClasses =
      "w-full py-2 px-4 rounded-md text-sm font-medium transition-colors duration-150 bg-green-600 text-white hover:bg-green-700";
  } else if (noteStatus === 'pending') {
    buttonText = "Pending";
    buttonAction = () => {}; // Disabled
    buttonClasses =
      "w-full py-2 px-4 rounded-md text-sm font-medium transition-colors duration-150 bg-yellow-500 text-white cursor-not-allowed";
  } else if (alreadyInCart) {
    buttonText = "Remove Item";
    buttonAction = handleClick;
    buttonClasses =
      "w-full py-2 px-4 rounded-md text-sm font-medium transition-colors duration-150 bg-red-500 text-white hover:bg-red-600";
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-1">{subject}</p>
      <p className="text-xs text-gray-400 mb-3">⭐ {numRatings} ratings</p>

      {noteStatus !== 'approved' && !isBought && (
        <p className="text-md font-semibold text-green-600 mb-4">₹{price}</p>
      )}

      <button onClick={buttonAction} className={buttonClasses}>
        {buttonText}
      </button>
    </div>
  );
};

export default Card;
