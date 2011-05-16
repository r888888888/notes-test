Note = {
  Box: {
    create: function(id) {
      var $black_border = $('<div></div>');
      $black_border.addClass("note-box-black-border");
      $black_border.css({opacity: 0.7});

      var $note_box = $('<div></div>');
      $note_box.addClass("note-box");
      $note_box.data("id", id);
      $note_box.attr("data-id", id);
      $note_box.draggable({containment: "parent"});
      $note_box.resizable({
        containment: "parent", 
        handles: "se",
        alsoResize: ".note-box-black-border"
      });
      $note_box.append($black_border);
      Note.Box.bind_events($note_box);

      return $note_box;
    },
    
    bind_events: function($note_box) {
      $note_box.bind(
        "dragstart resizestart",
        function(e) {
          var $note_box_inner = $(e.currentTarget);
          Note.dragging = true;
          Note.clear_timeouts();
          Note.Body.hide_all();
        }
      )

      $note_box.bind(
        "dragstop resizestop",
        function(e) {
          Note.dragging = false;
          var $note_box_inner = $(e.currentTarget);
        }
      );

      $note_box.bind(
        "mouseover mouseout",
        function(e) {
          if (Note.dragging) {
            return;
          }

          var $note_box_inner = $(e.currentTarget);
          if (e.type === "mouseover") {
            Note.Body.show($note_box_inner.data("id"));
          } else if (e.type === "mouseout") {
            Note.Body.hide($note_box_inner.data("id"));
          }
        }
      );
    },
    
    resize_black_border: function($note_box) {
      var $black_border = $note_box.find("div.note-box-black-border");
      $black_border.css({
        height: $note_box.height() - 2, 
        width: $note_box.width() - 2
      });
    }
  },
  
  Body: {
    create: function(id) {
      var $note_body = $('<div></div>');
      $note_body.addClass("note-body");
      $note_body.data("id", id);
      $note_body.attr("data-id", id);
      $note_body.hide();
      Note.Body.bind_events($note_body);
      return $note_body;
    },
    
    initialize: function($note_body) {
      var $note_box = $("#note-container div.note-box[data-id=" + $note_body.data("id") + "]");
      $note_body.css({
        top: $note_box.position().top + $note_box.height() + 5,
        left: $note_box.position().left
      });
    },
    
    show: function(id) {
      if (Note.editing) {
        return;
      }

      Note.Body.hide_all();
      Note.clear_timeouts();
      var $note_body = $("#note-container div.note-body[data-id=" + id + "]");
      Note.Body.initialize($note_body);
      $note_body.show();
    },
    
    hide: function(id) {
      var $note_body = $("#note-container div.note-body[data-id=" + id + "]");
      Note.timeouts.push($.timeout(250).done(function() {$note_body.hide();}));
    },
    
    hide_all: function() {
      $(".note-body").hide();
    },
    
    resize: function($note_body) {
      var w = $note_body.width();
      var h = $note_body.height();
      var golden_ratio = 1.6180339887;

      if (h <= 20) {
        // don't bother resizing one liners
        return;
      }

      while (w / h < golden_ratio) {
        w = w * 1.05;
        h = h / 1.05;
        console.log("width=%d height=%d ratio=%f", w, h, w/h);
      }

      while (w / h > golden_ratio) {
        w = w / 1.05;
        h = h * 1.05;
        console.log("width=%d height=%d ratio=%f", w, h, w/h);
      }

      $note_body.css({
        width: w,
        height: h
      });
    },
    
    set_text: function($note_body, text) {
      $note_body.html(text);
      Note.Body.resize($note_body);
    },
    
    bind_events: function($note_body) {
      $note_body.mouseover(function(e) {
        var $note_body_inner = $(e.currentTarget);
        Note.Body.show($note_body_inner.data("id"));
      });

      $note_body.mouseout(function(e) {
        var $note_body_inner = $(e.currentTarget);
        Note.Body.hide($note_body_inner.data("id"));
      });

      $note_body.click(function(e) {
        var $note_body_inner = $(e.currentTarget);
        Note.Edit.show($note_body_inner);
      })
    }
  },
  
  Edit: {
    show: function($note_body) {
      if (Note.editing) {
        return;
      }

      $(".note-box").resizable("disable");
      $(".note-box").draggable("disable");

      $textarea = $('<textarea></textarea>');
      $textarea.css({
        width: "100%",
        height: "10em"
      });
      $textarea.val($note_body.html());

      $dialog = $('<div></div>');
      $dialog.append($textarea);
      $dialog.data("id", $note_body.data("id"));
      $dialog.dialog({
        modal: true,
        width: 300,
        dialogClass: "note-edit-dialog",
        buttons: {
          "Save": $.noop,
          "Cancel": Note.cancel,
          "Delete": $.noop,
          "History": $.noop
        }
      });
      $dialog.bind("dialogclose", function() {
        Note.editing = false;
        $(".note-box").resizable("enable");
        $(".note-box").draggable("enable");
      });
      Note.editing = true;
    },
  },
  
  id: "x",
  dragging: false,
  editing: false,
  timeouts: [],
  pending: {},
  
  add: function(id, x, y, w, h, text) {
    var $note_box = Note.Box.create(id);
    var $note_body = Note.Body.create(id);
    
    $note_box.css({
      left: x,
      top: y,
      width: w,
      height: h
    });
    
    $("div#note-container").append($note_box);
    $("div#note-container").append($note_body);
    Note.Box.resize_black_border($note_box);
    Note.Body.set_text($note_body, text);
  },
  
  new: function() {
    var $note_box = Note.Box.create(Note.id);
    var $note_body = Note.Body.create(Note.id);
    $("div#note-container").append($note_box);
    $("div#note-container").append($note_body);
    Note.Box.resize_black_border($note_box);
    Note.id += "x";
  },
  
  clear_timeouts: function() {
    $.each(Note.timeouts, function(i, v) {
      v.clear();
    });
    
    Note.timeouts = [];
  },
  
  cancel: function() {
    $(this).dialog("close");
  }
}

$(document).ready(function() {
  $("#translate-button").click(function() {
    if (Note.id === "x") {
      Note.add(Note.id, 20, 20, 100, 100, "Lorem ipsum");
    } else {
      Note.add(Note.id, 20, 20, 100, 100, "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.");
    }
    Note.id += "x";
  });
  $("#note-container").width($("#image").width());
  $("#note-container").height($("#image").height());
});
