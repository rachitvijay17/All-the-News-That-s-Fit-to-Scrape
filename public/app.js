// Grab the articles as a json

function getresults(){
$.getJSON("/articles", function(data) {
    // For each one
    for (var i = 0; i < data.length; i++) {
      // Display the apropos information on the page
      $("#articles")
      .append("<p data-id='" 
      +data[i]._id + "'>" 
      + data[i].title 
      + "<br /><a href='"+data[i].link+"'>" 
      + data[i].link 
      + "</a><br />" + data[i].text 
      + "</p>").append("<button class = 'save' data-id='"+data[i]._id+"'> Save </button>");
    }
  });
};

getresults();

$(document).on("click", "#showarticles", function(event){
  event.preventDefault();

  getresults();
});

function getsavedarticles(){

  $.ajax({
    method: "GET",
    url: "/savedarticles"
  })
  .then(function(data){

    $("#articles").empty();

    for (var i = 0; i < data.length; i++) {
      // Display the apropos information on the page
      $("#articles")
      .append("<p data-id='" 
      +data[i]._id + "'>" 
      + data[i].title 
      + "<br /><a href='"+data[i].link+"'>" 
      + data[i].link 
      + "</a><br />" + data[i].text 
      + "</p>").append("<button class = 'delete' data-id='"+data[i]._id+"'> Delete </button>")
      .append("<button class = 'addnote' data-id='"+data[i]._id+"'> Add a Note </button>")
      .append("<button class = 'shownote' data-id='"+data[i]._id+"'> Show Notes </button>");
    } 

  });
};


  $("#scrape").on("click", function(event){
    event.preventDefault();

    $.ajax({
      method: "GET",
      url: "/delete_articles"
    })
    .then(function(data){
      // debugger;
      $("#articles").empty();
      $.ajax({
        method: "GET",
        url: "/scrape"
      }).then(function(data){
        // debugger;
      getresults();

      });
    });
  });

  $(document).on("click", "#savedarticles", function(event){
    event.preventDefault();

    getsavedarticles();    
  });



  $(document).on("click",".save", function(event){
    event.preventDefault();

    var selected = $(this);
    console.log(selected.attr("data-id"));
    // debugger;

    $.ajax({
      type: "POST",
      url: "/article_saved/"+selected.attr("data-id"),
      dataType: "json",
      data: {
        saved: true
      },
    }).then(function(data){
      console.log(data);
    });

  });


  $(document).on("click",".delete", function(event){
    event.preventDefault();

    var selected = $(this);
    // console.log(selected.attr("data-id"));
    // debugger;

    $.ajax({
      type: "POST",
      url: "/delete/"+selected.attr("data-id"),
      dataType: "json",
      data: {
        saved: false
      },
    }).then(function(data){
      console.log(data);

      getsavedarticles();

    });

  });


  
  // Whenever someone clicks a p tag
  $(document).on("click", ".addnote", function() {
    // Empty the notes from the note section
    $("#notes").empty();
    // Save the id from the p tag
    var thisId = $(this).attr("data-id");
  
    // Now make an ajax call for the Article
    $.ajax({
      method: "GET",
      url: "/article/" + thisId
    })
      // With that done, add the note information to the page
      .then(function(data) {
        console.log(data);
        // The title of the article
        $("#notes").append("<h2>" + data.title + "</h2>");
        // An input to enter a new title
        $("#notes").append("<input id='titleinput' name='title' >");
        // A textarea to add a new note body
        $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
        // A button to submit a new note, with the id of the article saved to it
        $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
  
        // If there's a note in the article
        if (data.note) {
          // Place the title of the note in the title input
          $("#titleinput").val(data.note.title);
          // Place the body of the note in the body textarea
          $("#bodyinput").val(data.note.body);
        }
      });
  });

  function shownote(id){

    $("#notes").empty();

    $.ajax({
      method: "GET",
      url: "/article/" + id
    })
    .then(function(data){

      for (var i = 0; i < data.note.length; i++){

        $("#notes").append("<h2> Title: " + data.note[i].title + "</h2>");
        $("#notes").append("<textarea id = 'notetext'>" + data.note[i].body + "</textarea>") 
        $("#notes").append("<button class = 'deletenote' data-artid='"+data._id+"' data-noteid='"+data.note[i]._id+"'> Delete Note</button>")
      };
    });

  };


  $(document).on("click", ".shownote", function(event){
    event.preventDefault();

    var thisId = $(this).attr("data-id");

    shownote(thisId);
  });

  $(document).on("click", ".deletenote", function(event){
    event.preventDefault();
    var id = $(this).attr("data-artid");
    var noteid = $(this).attr("data-noteid");

    $.ajax({
      method: "POST",
      url: "/deletenote/"+ id+"/"+noteid
    }).then(function(data){
      console.log(data);
      shownote(id);
    });
  });
  
  // When you click the savenote button
  $(document).on("click", "#savenote", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");
  
    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        // Value taken from title input
        title: $("#titleinput").val(),
        // Value taken from note textarea
        body: $("#bodyinput").val()
      }
    })
      // With that done
      .then(function(data) {
        // Log the response
        console.log(data);
        // Empty the notes section
        $("#notes").empty();
      });
  
    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
  });
  