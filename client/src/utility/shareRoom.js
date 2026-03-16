import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';

export function shareRoom() {
    const path = window.location.pathname;
    const parts = path.split("/");
    if (parts[2]) {
        return parts[2];
    }
    const newRoom = uniqueNamesGenerator({
        dictionaries: [adjectives, animals],
        separator: '-',
        length: 2,
    }) + '-' + Math.floor(Math.random() * 1000);

    window.history.replaceState(null, "", `/room/${newRoom}`);
    return newRoom;
}