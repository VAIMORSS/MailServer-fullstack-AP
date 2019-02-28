const express = require("express");
const app = express();
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const Handlebars = require("handlebars");
const HTTP_PORT = process.env.PORT || 8080;
const dataFetcher = require("./dataService.js");
const clientSession = require("client-sessions");
// const mongoDb = require("./mongoData");

function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);

}

app.use(clientSession({
    cookieName: "session",
    secret: "mails",
    duration: 60 * 60 * 1000,
    activeDuration: 1000 * 60 
  }));

  const user = {
    username: '',
    password: ''
  };

  function ensureLogin(req, res, next) {
    if (!req.session.user) {
      res.redirect("/");
    } else {
      next();
    }
 }

app.listen(HTTP_PORT, onHttpStart());

app.use(bodyParser.urlencoded({
    extended: true
}));

app.engine(".hbs", exphbs({
    extname: ".hbs"
}));

app.use(express.static('public'));

app.set("view engine", ".hbs");

app.get('/',(req,res)=>{
    //console.log(req.body.data+" this is working")
    res.render("login");
});

app.get('/composer',ensureLogin,(req,res)=>{
    res.render("composer",{
        layout:"main"
    });
})

app.get('/inbox',ensureLogin,(req,res)=>{

    dataFetcher.myInbox(req).then((data)=>{
        var p = JSON.stringify(data);
        p = JSON.parse(p);
        res.render("inbox",{
            layout:"main",
            data:p
        });
    })

    
})

app.get('/sent',ensureLogin,(req,res)=>{
    dataFetcher.mySent(req).then((data)=>{
        var p = JSON.stringify(data);
        p = JSON.parse(p);
        res.render("sent",{
            layout:"main",
            data:p
        });
    })

})


app.get('/archived',ensureLogin,(req,res)=>{
    dataFetcher.myArchived(req).then((data)=>{
        console.log(data);
        var p = JSON.stringify(data);
        p = JSON.parse(p);
        console.log(p,">>>>>");
        res.render("archived",{
            layout:"main",
            data:p
        });
    })
    
})
app.get('/search',ensureLogin,(req,res)=>{
    res.render("search",{
        layout:"main",
        data:''
    });
})

app.post('/signUp',(req,res)=>{
    res.render('signup');
})

app.get('/logout',(req,res)=>{
    req.session.reset();
    res.redirect('/');
})

//signUp form
app.post("/asignup", (req, res) => {

    dataFetcher.addUser(req.body).then(
        (data)=>{
            if(data==="1"){
                Error.error=" We are very sorry the username is taken please try other one ";
                res.render("signup",{
                    data:Error
                });
            }else{
                dataFetcher.authenticate(data.userName,data.password).then((data)=>{
                    if(data!=""){
                        userLogIn=data;
                        req.session.user={
                            username:data.userName,
                            password:data.password
                        };
                        
                        res.redirect('/');
                    }});
            }
        }
    );
});
//all handlebars

Handlebars.registerHelper('router', function (url, options) {
    return '<li ' + ((app.locals.activeRoute == url) ? 'class="active"' : '') + '> <a href="' + url + '">' + options.fn(this) + '</a></li>';
});


//hadeling login 

app.post("/logIn", (req, res) => {

    //trying to open the table which is connected to the user
    
    dataFetcher.authenticate(req.body.userNameLn,req.body.passwordLn).then((data)=>{
            if(data!=""){
                {userLogIn=data[0];}
                req.session.user={
                    username:req.body.userNameLn,
                    password:req.body.passwordLn
                };
    
                res.redirect('/inbox');
            }else{
                res.redirect("/");
            }
        }).then(()=>{
            personDefiner(req);
        });
    });


    //sending the mail
    app.post('/composeTo',ensureLogin,(req,res)=>{
        dataFetcher.sendMail(req);
        res.redirect('/composer');
    });

    

    app.get('/inbox/remove/:id',(req,res)=>{
        dataFetcher.removeMailFromInbox(req.params.id).then((data)=>{
            res.redirect('/inbox');
        });
    })

    app.get('/inbox/archive/:id',(req,res)=>{
        dataFetcher.archiveMailFromInbox(req.params.id).then((data)=>{
            res.redirect('/inbox');
        });
    })

    app.get('/inbox/rmarchive/:id',(req,res)=>{
        dataFetcher.rmarchiveMailFromInbox(req.params.id).then((data)=>{
            res.redirect('/inbox');
        });
    })

    
    app.post('/searchit',(req,res)=>{
        dataFetcher.searchIt(req.body.search).then((data)=>{
            res.render("Search",
            {
                layout:"main",
                data:data
            });
        });

        
    });


