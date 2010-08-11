jQuery.makeContainer = function makeContainer (name, url, renderer) {
  var container = $('#areas > .' + name);
  var template = container.find('.row-template');

  $.getJSON(url, function (data) {
    container.find('.loading').hide();

    var i = 0;
    $.each(data, function () {
      var row = template.clone()
        .appendTo(container)
        .addClass('row')
        .removeClass('row-template');

      if (renderer.call(this, container, row)) {
        i++;
        row.show();
      };

      if (i >= 10) return false;
    });
  });
}

jQuery(function ($) {
  var github = "http://shoulder-pads.heroku.com/u/0818286d3b581485f846d50827614010?callback=?";
  var twitter = "http://twitter.com/status/user_timeline/dontdie.json?count=10&callback=?";

  $.makeContainer('github', github, function (container, row) {
    var payload = this.payload;
    var repo = this.repository;
    var url = "";
    var linkText = "";
    var description = "";

    if (repo) description = repo.description;
    if (this) url = this.url;
    if (!url && payload) url = payload.url;
    if (!url && payload) url = "http://github.com/" + payload.target;

    switch(this.type) {
    case "FollowEvent":
      linkText = "started following " + payload.target;
      break;

    case "GistEvent":
      linkText = payload.action + "d " + payload.name;
      description = payload.snippet;
      break;

    case "PushEvent":
      if (repo) linkText = "pushed to " + repo.name;
      description = $(payload.shas).last()[0][2];
      break;

    case "CreateEvent":
      if (repo) linkText = "created " + repo.name;
      break;

    case "WatchEvent":
      linkText = payload.action + " watching " + repo.name;
      break;

    case "CommitCommentEvent":
      linkText = "commented on " + repo.name + " by " + repo.owner;
      break;

    case "ForkEvent":
      linkText = "forked " + repo.name + " by " + repo.owner;
      break;

    case "MemberEvent":
      linkText = payload.action + " " + repo.name;
      break;

    default:
      linkText = this.type + ' on github';
    }

    if (url != "") {
      row
        .find('a')
          .attr('href', url)
          .html(linkText)
          .end()
        .find('.description')
          .html(description)
          .end();
      return true;
    } else {
      return false;
    }
  });

  $.makeContainer('twitter', twitter, function (container, row) {
    row
      .find('a')
        .attr('href', "http://twitter.com/dontdie/status/" + this.id)
        .end()
      .find('.description')
        .html(this.text)
        .end();
    return true;
  });
});
