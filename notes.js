Note = {
  start_translation_mode: function() {
    var note = $('<div></div>');
    note.addClass("note-box");
    note.draggable({containment: "parent"});
    note.resizable({containment: "parent"});
    $("div#note-container").append(note);
  }
}

$(document).ready(function() {
  $("#translate-button").click(Note.start_translation_mode);
  $("#note-container").width($("#image").width());
  $("#note-container").height($("#image").height());
});
