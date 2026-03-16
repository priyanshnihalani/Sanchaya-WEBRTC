// src/utils/getOrCreateUserId.js
import { v4 as uuidv4 } from 'uuid';

export function getOrCreateUserId() {
  let id = sessionStorage.getItem('unique_user_id');
  if (!id) {
    id = uuidv4();
    sessionStorage.setItem('unique_user_id', id);
  }
  return id;
}
