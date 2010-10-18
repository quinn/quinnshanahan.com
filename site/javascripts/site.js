jQuery.fn.areas = function (name, url, opts) {
  Areas(this, name, url, opts);
  return this;
};

var Areas = function Areas (area, name, url, opts) {
  return Areas.register(name, new Areas.prototype.init(area, url, opts));
};

Areas.extend = jQuery.extend;

Areas.extend({
  areas: {},
  names: [],
  focusedArea: null,

  register: function (name, area) {
    this.areas[name] = area;
    this.names.push(name);
    if(!this.focusedArea) this.focusedArea = name;
    return area;
  },

  display: function () { },

  changeFocus: function (name) {
    var currentArea = this.areas[name];
    var areaWidth = currentArea.area.position().left;

    $('#areas .overflow').animate({left: '-' + areaWidth + 'px'}, 400);
    this.focusedArea = name;

    Areas.loadViewableAreas();
  },

  loadViewableAreas: function () {
    _(Areas.areas).each(function (area) {
      area.load();
    });
  }
});

Areas.prototype = {
  loaded: false,
  init: function (area, url, opts) {
    this.template = area.find('.row-template');
    this.renderer = opts.renderer || opts;
    this.processor = opts.processor || this.processor;
    this.url = url;
    this.area = area;

    return this;
  },
  processor: function (d) { return d; },
  load: function () {
    if (this.loaded) return true;

    var context = this;
    $.getJSON(this.url, function (data) {
      context.area.find('.loading').hide();

      var i = 0;
      var set = context.processor(data);

      $.each(set, function () {
        var row = context.template.clone()
          .appendTo(context.area)
          .addClass('row')
          .removeClass('row-template');

        if (context.renderer.call(this, context.area, row)) {
          i++;
          row.show();
        };

        if (i >= 10) return false;
      });
    });

    this.loaded = true;
  }
};

Areas.prototype.init.prototype = Areas.prototype;

jQuery(function ($) {
  var github  = "http://github.com/quinn.json?callback=?";
  var twitter = "http://twitter.com/status/user_timeline/dontdie.json?count=10&callback=?";
  var tumblr  = "http://quinn.tumblr.com/api/read/json?callback=?";
  var flickr  = "http://api.flickr.com/services/feeds/photos_public.gne?id=57195921@N00&format=json&jsoncallback=?";
  var blog    = "http://blog.quinnshanahan.com/api/get_recent_posts/?callback=?";

  $('.area.github').areas('github', github, {
    processor: function (data) {
      return $.map(data, function (item) {
        var payload = item.payload;
        var repo = item.repository;
        var url = "";
        var linkText = "";
        var description = "";
        var findLinkText = function (type) {
          switch(type) {
          case "FollowEvent":
            return "started following " + payload.target;
          case "GistEvent":
            return payload.action + "d " + payload.name;
          case "PushEvent":
            if (!repo) return true;
            return "pushed to " + repo.name;
          case "CreateEvent":
            if (repo) {
              return "created " + repo.name;
            } else {
              return "created " + payload.name;
            }
          case "WatchEvent":
            return payload.action + " watching " + repo.name;
          case "CommitCommentEvent":
            return "commented on " + repo.name + " by " + repo.owner;
          case "ForkEvent":
            return "forked " + repo.name + " by " + repo.owner;
          case "MemberEvent":
            return payload.action + " " + repo.name;
          default:
            return item.type + ' on github';
          }
        }

        
        if (payload) description = payload.snippet;
        if (!description && payload.shas) description = $(payload.shas).last()[0][2];
        if (!description && repo) description = repo.description;
        if (typeof description == "undefined") description = "";

        if (item) url = item.url;
        if (!url && payload) url = payload.url;
        if (!url && payload) url = "http://github.com/" + payload.target;
        if (url == "http://github.com/undefined") url = "http://github.com/quinn";

        item.url = url;
        item.linkText = findLinkText(item.type);
        item.description = description;
        return item;
      });
    },
    renderer: function (area, row) {
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

  $('.area.twitter').areas('twitter', twitter, function (area, row) {
    return row
      .find('a')
        .attr('href', "http://twitter.com/dontdie/status/" + this.id)
        .end()
      .find('.description')
        .html(this.text)
        .end();
  });

  $('.area.tumblr').areas('tumblr', tumblr, {
    processor: function (data) {
      return data.posts;
    },
    renderer: function (area, row) {
      return true;
    }
  });

  $('.area.flickr').areas('flickr', flickr, {
    processor: function (data) {
      return $.map(data.items, function (item) {
        item.media.s = item.media.m.replace("_m.jpg", "_s.jpg");
        return item;
      });
    },
    renderer: function (area, row) {
      return row.find('img').attr('src', this.media.s);
    }
  });

  var toggleLinks = $('.toggle-links');
  toggleLinks.find('a').click(function (e) { 
    Areas.changeFocus($(this).attr('href').substr(1));
    
    e.preventDefault();
  });

  Areas.changeFocus('flickr');
});
