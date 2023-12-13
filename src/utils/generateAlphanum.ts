// Generate random alphanumeric

const options =
  "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export default function generateAlphanumeric(charLength: number): string {
  const result = [];

  for (let i = 0; i < charLength; i++) {
    const randomIndex = Math.floor(Math.random() * options.length);
    const randomChar = options[randomIndex];
    result.push(randomChar);
  }

  return result.join("");
}
