(function() {
  $("#logoimg").fadeIn('slow');

  var dataName, inserChar, inserClass, jAnimConsole, separator;

  inserChar = '|';

  separator = ';';

  dataName = "list";

  inserClass = "inserChar";

  jAnimConsole = function() {
    var blinkAnim, currentChar, currentWord, htmlInser, list, out, printWord, timeBwtLetters, timeBwtWords;
    out = $(this);
    list = $(this).data(dataName).split(separator);
    htmlInser = "<span class=" + inserClass + ">" + inserChar + "</span>";
    out.html(htmlInser);
    blinkAnim = function() {
      $("." + inserClass).delay(1000).hide(100).delay(1000).show(100);
      $("." + inserClass).queue(function(next) {
        next();
        blinkAnim();
      });
    };
    currentWord = 0;
    currentChar = 1;
    timeBwtLetters = 50;
    timeBwtWords = 2500;
    printWord = function() {
      var substr;
      substr = list[currentWord].substr(0, currentChar++);
      out.html("" + substr + htmlInser);
      if (currentChar <= list[currentWord].length) {
        return setTimeout(printWord, timeBwtLetters);
      } else {
        setTimeout(blinkAnim, timeBwtLetters);
        currentWord = (currentWord + 1) % list.length;
        currentChar = 1;
        return setTimeout(printWord, timeBwtWords);
      }
    };
    setTimeout(printWord, 0);
  };

  $(".jAnimConsole").each(jAnimConsole);

}).call(this);