const crypto = require("crypto");

function generateBase62() {
    // Generate a random 64-bit ID using the crypto module
    const id = crypto.randomBytes(6).readUIntLE(0, 6);

    // Convert the ID to base 62 (using alphanumeric characters)
    const characters =
        "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const base = characters.length;
    let result = "";
    let remaining = id;
    do {
        const index = remaining % base;
        result = characters.charAt(index) + result;
        remaining = Math.floor(remaining / base);
    } while (remaining > 0);

    if (result.length > 7) {
        return generateBase62();
    }

    return result;
}

module.exports = generateBase62;
