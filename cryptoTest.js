// //encryption is a two way process -- data is 'encrypted' using an algorithm and key
// //you must know what the key is to decrypt or unscramble the data

// //use crypto-js for encryption
// const mySecret = 'I eat cookies for breakfast'

// const secretKey = 'myPassword'

// // Advanced Encryption Standard algorithm
// const crypto = require('crypto-js')

// // const myEncryption = crypto.AES.encrypt(mySecret,secretKey)
// //in this example String(100) represents Primary Key 100
// const myEncryption = crypto.AES.encrypt(String(100),secretKey)

// console.log(myEncryption.toString()) //lets see our encrypted data

// const decrypt = crypto.AES.decrypt(myEncryption.toString(),secretKey)
// console.log(decrypt.toString(crypto.enc.Utf8))

////------------------------------------------

// //passwords in the database will be hashed
// //hashing is a one way process, once data has been hashed you cannot unhash it
// //hasing functions alwyas return a hash of equla length regardless on input
// //hashing functions always return the same output given the same input
// const bcrypt = require('bcrypt')

// const userPassword = '12345password'
// //whent he user signs up we want to had their password and save it in the db
// //bcrypt refed the password back into the hash 12 times and takes extra time, this is called hash 'salt' 
// const hashedPassword = bcrypt.hashSync(userPassword, 12)
// console.log(hashedPassword)
// //this returns true

// //this returns false
// //COMPARE a string to a hand (user login)
// //this returns true
// console.log(bcrypt.compareSync(userPassword, hashedPassword))
// //this returns false
// // console.log(bcrypt.compareSync('wrong', hashedPassword))


//---------------------------

//node js's build tin crypto pack
//this is a sha256
const cryptoNode = require('crypto')
//it's predictable what the hash will be
const hash = cryptoNode.createHash('sha256').update('a','utf8').digest()
console.log(hash.toString('hex'))
