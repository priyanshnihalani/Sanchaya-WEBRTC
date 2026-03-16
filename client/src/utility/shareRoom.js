import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';

export function getOrCreateUserName() {

  let name = sessionStorage.getItem("username");

  if (!name) {
    name =
      uniqueNamesGenerator({
        dictionaries: [adjectives, animals],
        separator: "-",
        length: 2,
      }) + "-" + Math.floor(Math.random() * 1000);

    sessionStorage.setItem("username", name);
  }

  return name;
}