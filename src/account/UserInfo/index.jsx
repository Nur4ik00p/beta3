import React from 'react';
import { Avatar } from '@mui/material';
import styles from './UserInfo.module.scss';

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return interval + ' год' + (interval === 1 ? '' : 'а') + ' назад';
  }
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return interval + ' месяц' + (interval === 1 ? '' : 'а') + ' назад';
  }
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return interval + ' день' + (interval === 1 ? '' : '') + ' назад';
  }
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return interval + ' час' + (interval === 1 ? '' : 'а') + ' назад';
  }
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return interval + ' минут' + (interval === 1 ? 'а' : '') + ' назад';
  }
  return 'только что';
};

export const UserInfo = ({ avatarUrl, fullName, additionalText }) => {
  const formattedText = additionalText ? formatTimeAgo(additionalText) : null;
  
  // Получаем первые две буквы имени
  const getInitials = (name) => {
    if (!name) return '';
    const parts = name.split(' ');
    let initials = parts[0].substring(0, 1).toUpperCase();
    if (parts.length > 1) {
      initials += parts[1].substring(0, 1).toUpperCase();
    }
    return initials;
  };

  return (
    <div className={styles.root}>
      {avatarUrl ? (
        <Avatar 
          className={styles.avatar} 
          src={avatarUrl} 
          alt={fullName} 
        />
      ) : (
        <Avatar className={styles.avatar}>
          {getInitials(fullName)}
        </Avatar>
      )}
      <div className={styles.userDetails}>
        <span className={styles.userName}>{fullName}</span>
        {additionalText && (
          <span className={styles.additional}>{formattedText}</span>
        )}
      </div>
    </div>
  );
};