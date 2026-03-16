import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';

export function shareRoom() {
    const name = uniqueNamesGenerator({
        dictionaries: [adjectives, animals],
        separator: '-',
        length: 2,
    }) + '-' + Math.floor(Math.random() * 1000);

    return name
}


