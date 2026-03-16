import { v4 as uuidv4 } from "uuid";

export function getOrCreateUserId() {
  let id = localStorage.getItem('unique_user_id');

  if (!id) {
    id = uuidv4();
    localStorage.setItem('unique_user_id', id);
  }

  return id;
}