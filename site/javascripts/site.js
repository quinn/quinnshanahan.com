jQuery.makeContainer = function makeContainer (name, url, opts) {
  var container = $('#areas > .' + name);
  var template = container.find('.row-template');
  var renderer = opts.renderer || opts;
  var processor = opts.processor || function (d) { return d; };

  $.getJSON(url, function (data) {
    container.find('.loading').hide();

    var i = 0;
    var set = processor(data);
    $.each(set, function () {
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
  var github = "http://github.com/quinn.json?callback=?";
  var twitter = "http://twitter.com/status/user_timeline/dontdie.json?count=10&callback=?";
  var tumblr  = "http://quinn.tumblr.com/api/read/json?callback=?";
  var flickr  = "http://api.flickr.com/services/feeds/photos_public.gne?id=57195921@N00&format=json&jsoncallback=?";

  $.makeContainer('github', github, {
    processor: function (data) {
      return $.map(data, function (item) {
        var payload = item.payload;
        var repo = item.repository;
        var url = "";
        var linkText = "";
        var description = "";

        if (repo) description = repo.description;
        if (item) url = item.url;
        if (!url && payload) url = payload.url;
        if (!url && payload) url = "http://github.com/" + payload.target;

        switch(item.type) {
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
          linkText = item.type + ' on github';
        }

        item.url = url;
        item.linkText = linkText;
        item.description = description;
        return item;
      });
    },
    renderer: function (container, row) {
      if (this.url != "") {
        row
          .find('a')
            .attr('href', this.url)
            .html(this.linkText)
            .end()
          .find('.description')
            .html(this.description)
            .end();
        return true;
      } else {
        return false;
      }
    }
  });

  $.makeContainer('twitter', twitter, function (container, row) {
    return row
      .find('a')
        .attr('href', "http://twitter.com/dontdie/status/" + this.id)
        .end()
      .find('.description')
        .html(this.text)
        .end();
  });

  $.makeContainer('tumblr', tumblr, {
    processor: function (data) {
      return data.posts;
    },
    renderer: function (container, row) {
      return true;
    }
  });

  $.makeContainer('flickr', flickr, {
    processor: function (data) {
      return $.map(data.items, function (item) {
        item.media.s = item.media.m.replace("_m.jpg", "_s.jpg");
        return item;
      });
    },
    renderer: function (container, row) {
      return row
        .find('img')
          .attr('src', this.media.s);
    }
  });
});
