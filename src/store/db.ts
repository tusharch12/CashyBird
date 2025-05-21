import mongoose from 'mongoose';

const db = mongoose.connect('mongodb+srv://charmtechic:Illl6ZZaoJBdw4wK@cashybird.bpnydfs.mongodb.net/cashy_bird_db').then(()=>[
console.log("Connection done !!!")
]).catch((err:any)=>{
console.log("error ...",err);
process.exit(1);
})

export default db;