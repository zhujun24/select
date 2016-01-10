(function ($) {
  $.fn.Select1 = function (options) {
    var settings = $.extend({
      containerSelector: '',
      selected: [],
      options: ['aaaaa', 'bbbbb', 'cccccc', 'ddddddd', 'eeeeeeee'],
      limit: 2
    }, options);

    this.each(function () {
      var obj = $(this);
      obj.selected = [];
      this.select = {
        createElems: function () {
          var self = this;
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
            $('<li data-id="' + element.id + '" class="' + liCls + '">' + element.name + '</li>').appendTo(obj.selectOptionsUl);
          });
          this.addEvent();
          //init selected
          if (settings.selected.length) {
            $('.select-options>li', obj).each(function (index, element) {
              var _self = $(element);
              var _selfId = _self.data('id');
              $(settings.selected).each(function (index2, element2) {
                if (element2.id === _selfId) {
                  _self.click();
                  self.closeOptions();
                  return false;
                }
              });
            });
          }
        },

        addEvent: function () {
          //options click
          var self = this;
          $('.select-options', obj).delegate("li", "click", function () {
            var _self = $(this);
            var data = {
              name: _self.html(),
              id: _self.data('id')
            };
            if (_self.hasClass('selected')) {
              _self.removeClass('selected');
              self.removeSelected(data);
              if (!obj.selected.length) {
                obj.placeholder.removeClass('hide');
              }
            } else {
              if (self.isLimit()) {
                obj.placeholder.addClass('hide');
                _self.addClass('selected');
                self.addSelected(data);
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
          });

          //when click out of select,close options
          $(document).click(function (event) {
            var target = $(event.target);
            if (target.hasClass('switch') || target.parent().hasClass('switch')) {
              return false;
            }
            if (target.parents(settings.containerSelector).length) {
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
          }
          return true;
        },

        addSelected: function (data) {
          $('.selected-options', obj).append('<li>' + data.name + '</li>');
          obj.selected.push(data);
        },

        removeSelected: function (data) {
          $('.selected-options>li', obj).each(function (index, element) {
            if ($(element).html() === data.name) {
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