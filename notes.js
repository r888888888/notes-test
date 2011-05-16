Note = {
  start_translation_mode: function() {
    var note = $('<div></div>');
    note.addClass("note-box");
    note.draggable({contain: "parent"});
    note.resizable({contain: "parent"});
    $("div#note-container").append(note);
  }
}

$(document).ready(function() {
  $("#translate-button").click(Note.start_translation_mode);
});
