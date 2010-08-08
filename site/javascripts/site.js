jQuery(function ($) {
  var github = "http://shoulder-pads.heroku.com/u/0818286d3b581485f846d50827614010?callback=?"
  $.getJSON(github, function (data) {
    var container = $('#areas .github');
    $.each(data, function (i) {
      var template = $('.row-template').clone();
      var payload = this.payload;
      var repo = this.repository;
      var url = "";
      var linkText = "";

      switch(this.type) {
      case "FollowEvent":
        linkText = "started following " + payload.target;
        url = "http://github.com/" + payload.target;
        break;

      case "GistEvent":
        linkText = payload.action + "d " + payload.name;
        url = payload.url;
        break;

      case "PushEvent":
        if (repo) linkText = "pushed to "+ repo.name;
        url = this.url;
        break;

      case "CreateEvent":
        if (repo) linkText = "pushed to "+ repo.name;
        url = this.url;
        break;

      case "WatchEvent":
        linkText = payload.action + " watching " + repo.name;
        url = this.url;
        break;

      case "CommitCommentEvent":
        linkText = "commented on " + repo.name + " by " + repo.owner;
        url = this.url;
        break;

      case "ForkEvent":
        linkText = "forked " + repo.name + " by " + repo.owner;
        url = this.url;
        break;

      case "MemberEvent":
        linkText = payload.action + " " + repo.name;
        url = this.url;
        break;

      default:
        if (console) console.log(this);
        linkText = this.type + ' on github';
        url = (this.url || payload.url);
      }

      console.log(this);
      if (url) {
        template
          .appendTo(container)
          .addClass('row')
          .removeClass('row-template')
          .find('a')
            .attr('href', "" + url)
            .html(linkText)
            .end()
          .show();
      }
    });
  });
});
