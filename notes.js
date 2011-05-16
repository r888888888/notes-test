Note = {
  id: "x",
  dragging: false,
  editing: false,
  timeouts: [],
  pending: {},
  
  add: function(id, x, y, w, h, text) {
    var $note_box = Note.create_note_box(id);
    var $note_body = Note.create_note_body(id);
    
    $note_box.css({
      left: x,
      top: y,
      width: w,
      height: h
    });

    $note_body.html(text);
    
    $("div#note-container").append($note_box);
    $("div#note-container").append($note_body);
    Note.resize_black_border($note_box);
  },
  
  new: function() {
    var $note_box = Note.create_note_box(Note.id);
    var $note_body = Note.create_note_body(Note.id);
    $("div#note-container").append($note_box);
    $("div#note-container").append($note_body);
    Note.resize_black_border($note_box);
    Note.id += "x";
  },
  
  create_note_box: function(id) {
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
    Note.bind_note_box_events($note_box);
    
    return $note_box;
  },
  
  create_note_body: function(id) {
    var $note_body = $('<div></div>');
    $note_body.addClass("note-body");
    $note_body.data("id", id);
    $note_body.attr("data-id", id);
    $note_body.hide();
    Note.bind_note_body_events($note_body);
    return $note_body;
  },
  
  show_note_body: function(id) {
    if (Note.editing) {
      return;
    }
    
    Note.hide_all_note_bodies();
    Note.clear_timeouts();
    var $note_body = $("#note-container div.note-body[data-id=" + id + "]");
    Note.initialize_note_body($note_body);
    $note_body.show();
  },
  
  hide_note_body: function(id) {
    var $note_body = $("#note-container div.note-body[data-id=" + id + "]");
    Note.timeouts.push($.timeout(250).done(function() {$note_body.hide();}));
  },
  
  initialize_note_body: function($note_body) {
    var $note_box = $("#note-container div.note-box[data-id=" + $note_body.data("id") + "]");
    $note_body.css({
      top: $note_box.position().top + $note_box.height() + 5,
      left: $note_box.position().left
    });
  },
  
  bind_note_body_events: function($note_body) {
    $note_body.mouseover(function(e) {
      Note.show_note_body($note_body.data("id"));
    });
    
    $note_body.mouseout(function(e) {
      Note.hide_note_body($note_body.data("id"));
    });
    
    $note_body.click(function(e) {
      var $note_body_inner = $(e.currentTarget);
      Note.show_edit_dialog($note_body_inner);
    })
  },
  
  bind_note_box_events: function($note_box) {
    $note_box.bind(
      "dragstart resizestart",
      function(e) {
        var $note_box_inner = $(e.currentTarget);
        Note.dragging = true;
        Note.clear_timeouts();
        Note.hide_all_note_bodies();
        Note.resize_black_border($note_box_inner);
      }
    )
    
    $note_box.bind(
      "dragstop resizestop",
      function(e) {
        Note.dragging = false;
        var $note_box_inner = $(e.currentTarget);
        Note.resize_black_border($note_box_inner);
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
          Note.show_note_body($note_box_inner.data("id"));
        } else if (e.type === "mouseout") {
          Note.hide_note_body($note_box_inner.data("id"));
        }
      }
    );
  },
  
  clear_timeouts: function() {
    $.each(Note.timeouts, function(i, v) {
      v.clear();
    });
    
    Note.timeouts = [];
  },
  
  hide_all_note_bodies: function() {
    $(".note-body").hide();
  },
  
  resize_black_border: function($note_box) {
    var $black_border = $note_box.find("div.note-box-black-border");
    $black_border.css({
      height: $note_box.height() - 2, 
      width: $note_box.width() - 2
    });
  },
  
  show_edit_dialog: function($note_body) {
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
  
  cancel: function() {
    $(this).dialog("close");
  }
}

$(document).ready(function() {
  $("#translate-button").click(function() {
    Note.add(1, 20, 20, 100, 100, "Lorem ipsum");
    Note.id += 1;
  });
  $("#note-container").width($("#image").width());
  $("#note-container").height($("#image").height());
});
