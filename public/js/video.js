// client
//http://www.walmart.com/ip/Sun-Joe-Mow-Joe-14-Electric-Lawn-Mower-with-Grass-Box/11538868
var socketIoPort = "3000";
var socketIoDomain = location.protocol + "//" + window.location.hostname + ":" + socketIoPort;
var clientIO = io(socketIoDomain);

var source = $("#entry-template").html();
var template = Handlebars.compile(source);

//helper
function toHHMMSS(seconds) {
  seconds = +seconds;
  var hh = Math.floor(seconds / 3600),
    mm = Math.floor(seconds / 60) % 60,
    ss = Math.floor(seconds) % 60;
  return (hh ? (hh < 10 ? "0" : "") + hh + ":" : "") + ((mm < 10) && hh ? "0" : "") + mm + ":" + (ss < 10 ? "0" : "") + ss;
}

clientIO.on("connect", function () {
  console.log("client socket connected");
  //console.log(client.io.engine.id); //socket.id on server
});

var $video = $("#really-cool-video"),
  video = $video[0],
  $videoSubtitle = $("#video-subtitle");
if (isHost === "true") {
  // Host: control pause, timeupdate
  $video.on("timeupdate", function() {
    //if controlling host: then send timeline to server socket io
    console.log(video.currentTime);
    clientIO.emit("timeupdate", $video[0].currentTime);
  });
  $video.on("pause", function() {
    console.log("pause");
    clientIO.emit("pause", $video[0].currentTime);
  });
  $video.on("play", function() {
    console.log("play");
    clientIO.emit("play", $video[0].currentTime);
  });
} else {
  enableClientVideoSync();
}

function enableClientVideoSync() {
  // Client: listen to server timeupdate io
  clientIO.on("timeupdate", function (timeline) {
    console.log(timeline);
    // set video current time
    video.currentTime = timeline;
  });
  clientIO.on("pause", function(timeline) {
    video.currentTime = timeline;
    video.pause();
  });
  clientIO.on("play", function() {
    if (video.paused) {
      video.play();
    }
  });
}

$("#btn-sync").on("click", function() {
  var $this = $(this);
  // turn off
  if ($this.hasClass("btn-success")) {
    $this.removeClass("btn-success")
      .addClass("btn-danger")
      .text("Sync off");

    clientIO.removeAllListeners("timeupdate");
    clientIO.removeAllListeners("pause");
    clientIO.removeAllListeners("play");
  } else { //turn on
    $this.removeClass("btn-danger")
      .addClass("btn-success")
      .text("Sync on");

    enableClientVideoSync();
  }
});

$("#chat-message").on("click", ".list-group-item", function(ev) {
  //click item to update video timeline
  var timeline = $(this).data("timeline");
  video.currentTime = timeline;
  var data = $(this).data("json");
  console.log(data);
  //data = JSON.parse(data);
  $videoSubtitle.html($(this).clone());
  //console.log(template(data));
  //$videoSubtitle.html(template(data));
});

var $chat = $("#chat-form"),
  $chatInput = $("#chat-input"),
  $chatMessage = $("#chat-message"),
  $chatTimeline = $("#chat-timeline");

clientIO.on("chat", function(msg) {
  var $li = $("<li class='list-group-item'>")
    .attr("data-timeline", msg.timeline)
    .attr("data-json", JSON.stringify(msg));

  $li.append($("<span class='glyphicon glyphicon-play-circle'>"));
  $li.append($("<span class='chat-time'>").text(msg.timelineFormatted + " "));
  $li.append($("<span class='chat-line'>").text(msg.msg));
  $chatMessage.append($li);
});

$chatInput.on("focus", function() {
  // pause video and add
  if (!video.paused) {
    video.pause();
  }
  var formatTimeline = toHHMMSS(video.currentTime);
  $chat
    .data("timelineFormatted", formatTimeline)
    .data("timeline", video.currentTime);

  $chatTimeline.html(formatTimeline);
});

$chat.on("submit", function(ev) {
  ev.preventDefault();
  var value = $chatInput.val();
  if (!value) { return; }
  data = {
    msg: value,
    timelineFormatted: $chat.data("timelineFormatted"),
    timeline: $chat.data("timeline")
  };
  clientIO.emit("chat", data);
  $chatInput.val("");
});

// copy & paste feature
//var copy = new ZeroClipboard( document.getElementById("copy-button") );
//copy.on( "ready", function( readyEvent ) {
//  // alert( "ZeroClipboard SWF is ready!" );
//
//  copy.on( "aftercopy", function( event ) {
//    // `this` === `client`
//    // `event.target` === the element that was clicked
//    event.target.style.display = "none";
//    //alert("Copied text to clipboard: " + event.data["text/plain"] );
//  } );
//} );
//$("body").on("copy", ".zclip", function(/* ClipboardEvent */ e) {
//    e.clipboardData.clearData();
//    e.clipboardData.setData("text/plain", $(this).data("zclip-text"));
//
//    console.log("done");
//    e.preventDefault();
//  });

window.onbeforeunload = function(e) {
  clientIO.disconnect();
};
