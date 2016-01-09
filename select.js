(function ($) {
  $.fn.Select1 = function (options) {
    var settings = $.extend({
      containerSelector: '',
      options: ['aaaaa', 'bbbbb', 'cccccc', 'ddddddd', 'eeeeeeee'],
      limit: 2
    }, options);

    this.each(function () {
      var obj = $(this);
      obj.selected = [];
      this.select = {
        createElems: function () {
          $('<div class="select-content"><ul class="selected-options"></ul><div class="switch"><div></div></div></div>').appendTo(obj);
          obj.selectOptionsUl = $('<ul class="select-options"></ul>').appendTo(obj);
          obj.placeholder = $('<p class="placeholder">选择云单分类，最多选两个</p>').appendTo('.selected-options', obj);
          $(settings.options).each(function (index, element) {
            var remain = index % 3;
            var liCls = '';
            if (remain === 0) {
              liCls = 'left';
            } else if (remain === 2) {
              liCls = 'right';
            }
            $('<li class="' + liCls + '">' + element + '</li>').appendTo(obj.selectOptionsUl);
          });
          this.addEvent();
        },

        addEvent: function () {
          //options click
          var self = this;
          $('.select-options', obj).delegate("li", "click", function () {
            var _self = $(this);
            var value = _self.html();
            if (_self.hasClass('selected')) {
              _self.removeClass('selected');
              self.removeSelected(value);
              if (!obj.selected.length) {
                obj.placeholder.removeClass('hide');
              }
            } else {
              if (self.isLimit()) {
                obj.placeholder.addClass('hide');
                _self.addClass('selected');
                self.addSelected(value);
              }
            }
          });

          //switch options open button
          $('.switch', obj).click(function (event) {
            if ($(this).hasClass('open')) {
              self.closeOptions();
            } else {
              self.openOptions();
            }
            //event.stopPropagation();
          });

          //when click out of select,close options
          $(document).click(function (event) {
            var target = $(event.target);
            if ($(target).hasClass('switch') || $(target).parent().hasClass('switch')) {
              return false;
            }
            if ($(target).parents(settings.containerSelector).length) {
              self.openOptions();
            } else {
              self.closeOptions();
            }
          });
        },

        isLimit: function () {
          if ($('.selected-options', obj).find('li').length === settings.limit) {
            console.log('selected options beyond limit');
            return false;
          } else {
            return true;
          }
        },

        addSelected: function (text) {
          $('.selected-options', obj).append('<li>' + text + '</li>');
          obj.selected.push(text);
        },

        removeSelected: function (text) {
          $('.selected-options>li', obj).each(function (index, element) {
            if ($(element).html() === text) {
              $(element).remove();
              obj.selected.splice(index, 1);
              return false;
            }
          });
        },

        openOptions: function () {
          $('.switch', obj).addClass('open');
          var el = $('.select-options', obj),
            curHeight = el.height(),
            autoHeight = el.css('height', 'auto').height();
          el.stop().height(curHeight).animate({
            height: autoHeight
          }, 300);
        },

        closeOptions: function () {
          $('.switch', obj).removeClass('open');
          $('.select-options', obj).stop().animate({
            height: 0
          }, 300);
        },

        getOptions: function () {
          return obj.selected;
        },

        init: function () {
          var O = this;
          O.createElems();
          return O
        }
      };

      this.select.init();
    });
  };
}(jQuery));