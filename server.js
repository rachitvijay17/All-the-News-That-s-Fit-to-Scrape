var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
//mongoose.connect("mongodb://localhost/unit18Populater", { useNewUrlParser: true });

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

app.get("/scrape", function(req, res){

    axios.get("https://www.grafdom.com/blog/top-20-best-tech-websites-and-blogs/")
    .then(function(response){


        var $ = cheerio.load(response.data);
        // console.log(response.data);

        var result = {};

        $("p").each(function(i,element){
            //console.log("test");

            var title = $(element).find("strong").text();
            var link = $(element).find("a").attr("href");
            var text = $(element).text().split("\n")[2];
        
            if(link && link && text){
            result.title = title;
            result.link = link;
            result.text = text;
            result.saved = false;
            };

            db.Article.create(result)
            .then(function(dbArticle) {
            // View the added result in the console
            console.log(dbArticle);
            })
            .catch(function(err) {
            // If an error occurred, log it
            console.log(err);
            });

        });

        console.log(result);
        res.send("Scrape Complete");
    });
    
});

app.get("/articles", function(req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
      .then(function(dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });


app.get("/savedarticles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({saved:true})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});  


app.get("/article/:id", function(req, res) {
// Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
    // If we were able to successfully find an Article with the given id, send it back to the client
    res.json(dbArticle);
    // console.log(dbArticle);
    })
    .catch(function(err) {
    // If an error occurred, send it to the client
    res.json(err);
    });
}); 

app.post("/deletenote/:id/:noteid", function(req,res){

  console.log(req.params.id);
  console.log(req.params.noteid);

  db.Article.update( { _id: req.params.id }, { $pull: { note: req.params.noteid } },
    function(error, edited) {
      // Log any errors from mongojs
      if (error) {
        console.log(error);
        res.send(error);
      }
      else {
        // Otherwise, send the mongojs response to the browser
        // This will fire off the success function of the ajax request
        console.log(edited);
        res.send(edited);
      }
    }
    );
});;


app.post("/articles/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
      .then(function(dbNote) {
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { note: dbNote._id } }, { new: true });
      })
      .then(function(dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });


app.post("/article_saved/:id", function(req,res){

  console.log(req.params.id);

  db.Article.update(
    {
      _id: req.params.id
    },
    {
      $set:{
          saved: true
      }
    },
    function(error, edited) {
      // Log any errors from mongojs
      if (error) {
        console.log(error);
        res.send(error);
      }
      else {
        // Otherwise, send the mongojs response to the browser
        // This will fire off the success function of the ajax request
        console.log(edited);
        res.send(edited);
      }
    }
  );
});


  app.get("/delete_articles", function(req,res){
    db.Article.remove({}, function(error, response) {
      // Log any errors to the console
      if (error) {
        console.log(error);
        res.send(error);
      }
      else {
        // Otherwise, send the mongojs response to the browser
        // This will fire off the success function of the ajax request
        console.log(response);
        res.send(response);
      }
    });
  });


  app.post("/delete/:id", function(req, res) {
    // Remove a note using the objectID
    db.Article.update(
      {
        _id: req.params.id
      },
      {
        $set:{
            saved: false
        }
      },
      function(error, removed) {
        // Log any errors from mongojs
        if (error) {
          console.log(error);
          res.send(error);
        }
        else {
          // Otherwise, send the mongojs response to the browser
          // This will fire off the success function of the ajax request
          console.log(removed);
          res.send(removed);
        }
      }
    );
  });
  
  // Start the server
  app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });

