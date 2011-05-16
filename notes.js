Note = {
  id: 1,
  timeouts: [],
  dragging: false,
  
  add: function() {
    var $black_border = $('<div></div>');
    $black_border.addClass("note-box-black-border");
    $black_border.css({opacity: 0.5});
    
    var $note_box = $('<div></div>');
    $note_box.addClass("note-box");
    $note_box.data("id", Note.id);
    $note_box.attr("data-id", Note.id);
    $note_box.draggable({containment: "parent"});
    $note_box.resizable({containment: "parent"});
    $note_box.append($black_border);
    Note.bind_note_box_events($note_box);
    $("div#note-container").append($note_box);
    Note.resize_black_border($note_box);
    
    var $note_body = $('<div></div>');
    $note_body.addClass("note-body");
    $note_body.data("id", Note.id);
    $note_body.attr("data-id", Note.id);
    $note_body.hide();
    Note.bind_note_body_events($note_body);
    $("div#note-container").append($note_body);
    
    Note.id += 1;
  },
  
  show_note_body: function(id) {
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
        
        var $current_target = $(e.currentTarget);
        if (e.type === "mouseover") {
          Note.show_note_body($current_target.data("id"));
        } else if (e.type === "mouseout") {
          Note.hide_note_body($current_target.data("id"));
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
  }
}

$(document).ready(function() {
  $("#translate-button").click(Note.add);
  $("#note-container").width($("#image").width());
  $("#note-container").height($("#image").height());
});
