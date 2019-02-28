var sequelize = require('sequelize');

var Sequelize = new sequelize('d558e7l0prgtpo', 'bhttoyjbvistmo', '24f9a4f901a9929509d983b24197af50a9240d2ceb62eb6eb91aa6beb656c425', {
    host: 'ec2-23-21-147-71.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: '5432',
    dialectOptions: {
        ssl: true
    }
});

Sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
}).catch((err) => {
    console.log('Unable to connect to the database:', err);
});


const LogInTbl = Sequelize.define('MyMailLogin', {
    firstName: sequelize.STRING,
    lastName: sequelize.STRING,
    userName:{ 
        type:sequelize.STRING,
        unique:true
    },
    password: sequelize.STRING,
});

const Mails = Sequelize.define('AllMails',{
    id: {
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    from:sequelize.STRING,
    to:sequelize.STRING,
    content:sequelize.STRING,
    isArchived:sequelize.BOOLEAN
})

const sent = Sequelize.define('MyMailLogin', {
    to: sequelize.STRING,
    content: sequelize.STRING,
});



module.exports.authenticate=(username,Password)=>{
    return new Promise((resolve, reject) => {
        
        Sequelize.sync().then(()=>{
            resolve(LogInTbl.findAll({
                where:{
                    userName:username,
                    password:Password
                },
                raw:true,
                JSON:true
            }))
        });
    });
}

module.exports.addUser=(usrInfo)=>{
    return new Promise((resolve,reject)=>{
        Sequelize.sync().then(()=>{

               LogInTbl.findAll({
                   where:{
                       userName:usrInfo.userName
                   }
               }).then((data)=>{
                   if(data==''){
                    resolve(LogInTbl.create({
                        userName: usrInfo.userName,
                        password: usrInfo.password,
                        firstName: usrInfo.firstName,
                        lastName: usrInfo.lastName,

                    }));
                   }else{
                       resolve("1");
                   }
               }).catch
             
        })
    })
}



module.exports.sendMail=(req)=>{
    return new Promise((resolve,reject)=>{
        Sequelize.sync().then(()=>{
            resolve(Mails.create({
                from:req.session.user.username,
                to:req.body.mailto,
                content:req.body.content,
                isArchived:false
            }))            
        }).catch((err)=>{reject(err)})
    })
}


module.exports.myInbox = (req) => {
    return new Promise((resolve, reject) => {
          Sequelize.sync().then(()=>{
              resolve(Mails.findAll({
                  where:{
                      to:req.session.user.username,
                      isArchived:false
                  }
              }))
          }).catch((err)=>{
              reject(err);
          });
         
      });
  }

  module.exports.mySent = (req) => {
    return new Promise((resolve, reject) => {
          Sequelize.sync().then(()=>{
              resolve(Mails.findAll({
                  where:{
                      from:req.session.user.username
                  }
              }))
          }).catch((err)=>{
              reject(err);
          });
         
      });
  }

  module.exports.myArchived = (req) => {
    return new Promise((resolve, reject) => {
          Sequelize.sync().then(()=>{
              resolve(Mails.findAll({
                  where:{
                      to:req.session.user.username,
                      isArchived:true
                  }
              }))
          }).catch((err)=>{
              reject(err);
          });
         
      });
  }

  module.exports.removeMailFromInbox= (num)=>{
      return new Promise((resolve,reject)=>{
            Sequelize.sync().then(()=>{
                resolve(Mails.destroy({
                    where:{
                        id:num
                    }
                }))
            }).catch((err)=>{
                reject();
            })
      })
  }


  module.exports.archiveMailFromInbox= (num)=>{
    return new Promise((resolve,reject)=>{
          Sequelize.sync().then(()=>{
              resolve(Mails.update({
                  isArchived:true
              },{
                  where:{
                      id:num
                  }
              }))
          }).catch((err)=>{
              reject();
          })
    })
}

 module.exports.rmarchiveMailFromInbox= (num)=>{
    return new Promise((resolve,reject)=>{
          Sequelize.sync().then(()=>{
              resolve(Mails.update({
                  isArchived:false
              },{
                  where:{
                      id:num
                  }
              }))
          }).catch((err)=>{
              reject();
          })
    })
}

const Op= Sequelize.Op;
module.exports.searchIt= (str)=>{
    return new Promise((resolve,reject)=>{
          Sequelize.sync().then(()=>{
              resolve(Mails.findAll({
                where:{
                    to:{$like:`%${str}%`}
                }
            }))
          }).catch((err)=>{
              reject();
          })
    })
}

