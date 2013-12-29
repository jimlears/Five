//
// "Five" a.k.a V Video jQuery Plugin
//

// todo: self-initialize looks for a container with a class="v"
// $(function() {
//   $(".v").Five();
// });

;(function ($, window, document, undefined) {
  var pluginName = "Five";

  var trace = function (msg) {
    if (typeof msg === "undefined") { msg = "" }
    console.log(pluginName + "::" + msg);
  };

  // video plugin
  $.Five = function(element, options) {
    var defaults = {
      bar: "bar"
    };

    // container
    var $element = $(element),
         element = element;

    // sizing
    var $sizing = {}, sizing = {};
    
    // HTML5 video
    var $video ={}, video = {};

    // UI elements
    var controls = {}
    var currentEmSize = 1.0;

    // this.settings = {}

    this.init = function() {
      // this.settings = $.extend({}, defaults, options);

      // ui controls
      $video                = $element.find("video");
      video                 = $video.get(0);
      controls.$playButton  = $element.find(".v-btn-playpause");
      controls.$muteButton  = $element.find(".v-btn-mute");
      controls.$skipButton  = $element.find(".v-btn-skip");
      controls.$fullButton  = $element.find(".v-btn-fullscreen");
      controls.$scrubBar    = $element.find(".v-bar-scrub");
      controls.$scrubBarP   = $element.find(".v-bar-scrub-p");

      // event listeners
      $video.on("timeupdate", updateProgress);
      controls.$playButton.on("click", togglePlay);
      controls.$muteButton.on("click", toggleMute);
      controls.$fullButton.on("click", toggleFullscreen);

      // todo: move this into functions
        // scrub bar -- inline right here
        controls.$scrubBar.on("change", function() {
          var val = controls.$scrubBar.val();

          // calculate the new time
          var time = video.duration * (val / 100);
          video.currentTime = time;
        });
        controls.$scrubBar.on("mousedown", function() { $.fn.pause(); });
        controls.$scrubBar.on("mouseup", function() { $.fn.play(); });

      // todo: volume
        // volBar.on("change", function() {
        //   var val = $(volBar).val();
        //   video.volume = val;
        // });

      // initial UI state
      setPaused();
      initTooltips();

      // set up resizing
      $sizing = $(".v-player-sizing");
      sizing = $sizing.get(0);

      // debounce this sucker to prevent a ton of firing (crank up the ms if wanted)
      var delayedResize = _.debounce(function(e) {
        resize();
      }, 0);

      window.addEventListener("resize", delayedResize, false);
      resize();
    }

    //
    // private API
    //
    function resize() {
      var containerHeight = element.getBoundingClientRect().height,
          sizingHeight = sizing.getBoundingClientRect().height,
          onePercentHeight = containerHeight / 100,
          offsetSize;

      if (sizingHeight > onePercentHeight) {
          offsetSize = sizingHeight / onePercentHeight;
          currentEmSize = currentEmSize / offsetSize;
      } else if (onePercentHeight > sizingHeight) {
          offsetSize = onePercentHeight / sizingHeight;
          currentEmSize = currentEmSize * offsetSize;
      }
      element.style.fontSize = currentEmSize + "em";

      // resize the container to remove weird "padding" that shows up (Chrome only?)
      var videoHeight = video.getBoundingClientRect().height;
      $element.height(videoHeight);
    }

    function setTooltip(val) {
      $element.find(".v-tooltip").html(val);
    }

    function initTooltips() {
      controls.$muteButton.hover(
        function() { setTooltip("todo: popup volume slider") },
        function() { setTooltip("") }
      );
      controls.$skipButton.hover(
        function() { setTooltip("todo: popup next 3") },
        function() { setTooltip("") }
      );
      controls.$fullButton.hover(
        function() { setTooltip("full screen") },
        function() { setTooltip("") }
      );
      controls.$scrubBar.hover(
        function() { setTooltip("progress") },
        function() { setTooltip("") }
      );
      setTooltip("");
    }

    function setPlaying() {
      // cover + info
      $(".v-cover-gradient").addClass("v-is-hidden");
      $(".v-info").addClass("v-is-hidden")
      
      controls.$playButton.removeClass("v-icon-play");
      controls.$playButton.addClass("v-icon-pause");
 
      // tooltip
      setTooltip("pause");
      controls.$playButton.hover(
        function() { setTooltip("pause") },
        function() { setTooltip("") }
      );
    }

    function setPaused() {
      // cover + info
      $(".v-cover-gradient").removeClass("v-is-hidden");
      $(".v-info").removeClass("v-is-hidden")

      controls.$playButton.addClass("v-icon-play");
      controls.$playButton.removeClass("v-icon-pause");

      // tooltip
      setTooltip("play");
      controls.$playButton.hover(
        function() { setTooltip("play") },
        function() { setTooltip("") }
      );
    }

    function setMuted() {
      controls.$muteButton.removeClass("v-icon-vol-high");
      controls.$muteButton.addClass("v-icon-vol-mute");
    }

    function setUnmuted() {
      controls.$muteButton.removeClass("v-icon-vol-mute");
      controls.$muteButton.addClass("v-icon-vol-high");
    }

    //
    // UI event listeners
    //
    function updateProgress() {
      // calculate the slider value
      var val = (100 / video.duration) * video.currentTime;
      controls.$scrubBar.val(val);
      controls.$scrubBarP.val(val);
    }

    function togglePlay() {
      if (video.paused === true) {
        $.fn.play();
      } else {
        $.fn.pause();
      }
    }

    function toggleMute() {
      if (video.muted === false) {
        $.fn.mute();
      } else {
        $.fn.unmute();
      }
    }

    function toggleFullscreen() {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      // Firefox
      } else if (video.mozRequestFullScreen) {
        video.mozRequestFullScreen(); 
      // Chrome and Safari
      } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen(); 
      }
    }

    //
    // public API
    //
    $.fn.play = function() {
      trace("play");
      video.play();
      setPlaying();
    }

    $.fn.pause = function() {
      trace("pause");
      video.pause();
      setPaused();
    }

    $.fn.mute = function() {
      video.muted = true;
      setMuted();
    }

    $.fn.unmute = function() {
      video.muted = false;
      setUnmuted();
    }

    $.fn.fullscreen = function() {
      toggleFullscreen();
    }

    $.fn.debug = function() {
      trace();
    }

    this.init();
  }

  // light ctor wrapper prevents multiple instantiations
  $.fn[pluginName] = function(options) {
    return this.each(function() {
      if ($(this).data("pluginName") === undefined) {
        new $.Five(this, options);
        $(this).data("pluginName", pluginName);
      }
    });

  }
}(jQuery, window, document));

//

$(document).ready(function() {
  $(".v-player-container").Five();
  $(".v-player-container").debug();
});