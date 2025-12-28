import React from 'react';
import './WelcomeModal.css';

interface WelcomeModalProps {
  giftedName: string;
  welcomeMessage: string;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ giftedName, welcomeMessage, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content welcome-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Welcome, {giftedName}! 🎉</h2>
        <p>{welcomeMessage}</p>
        <button className="btn-primary" onClick={onClose}>
          Let's Begin!
        </button>
      </div>
    </div>
  );
};

