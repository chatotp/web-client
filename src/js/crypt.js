class Cipher {
    constructor(key) {
        this.key = key;
    }

    encrypt(plainText) {
        let result = [];
        for (let i = 0; i < plainText.length; i++) {
            const charCode = plainText.charCodeAt(i);
            const newCharCode = charCode ^ this.key[i % this.key.length];
            result.push(newCharCode);
        }
        console.log(result);
        return result;
    }

    decrypt(cipherText) {
        let decryptedMsg = [];
        for (let i = 0; i < cipherText.length; i++) {
            const charCode = cipherText[i];
            const newCharCode = charCode ^ this.key[i % this.key.length];
            decryptedMsg.push(newCharCode);
        }
        return decryptedMsg.map(charCode => String.fromCharCode(charCode)).join('');
    }
}

export default Cipher;