(function ($) {
  $.fn.Select1 = function (options) {
    var settings = $.extend({
      containerSelector: '',
      selected: [],
      options: [],
      limit: 0
    }, options);

    this.each(function () {
      var obj = $(this);
      this.select = {
        createElems: function () {
          var self = this;
          $('<div class="select-content"><ul class="selected-options"></ul><div class="switch"><div></div></div></div>').appendTo(obj);
          obj.selectOptionsUl = $('<ul class="select-options"></ul>').appendTo(obj);
          obj.placeholder = $('<p class="placeholder">选择云单分类，最多选两个</p>').appendTo('.selected-options', obj);
          this.createLi(settings.options);
          this.addEvent();
          //init selected
          if (settings.selected.length) {
            obj.placeholder.addClass('hide');
            self.setSelected(settings.selected);
          }
        },

        createLi: function (arr) {
          var selected = this.getOptions();
          $(arr).each(function (index, element) {
            var remain = index % 3;
            var liCls = '';
            if (remain === 0) {
              liCls = 'left ';
            } else if (remain === 2) {
              liCls = 'right ';
            }
            $(selected).each(function (index2, element2) {
              if (element.id === element2.id) {
                liCls += 'selected';
              }
            });
            $('<li data-id="' + element.id + '" class="' + liCls + '">' + element.name + '</li>').appendTo(obj.selectOptionsUl);
          });
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
              var selected = self.getOptions();
              if (!selected.length) {
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
          if (!settings.limit) {
            return true;
          }
          if ($('.selected-options', obj).find('li').length === settings.limit) {
            console.log('selected options beyond limit');
            return false;
          }
          return true;
        },

        addSelected: function (data) {
          $('.selected-options', obj).append('<li data-id="' + data.id + '">' + data.name + '</li>');
        },

        removeSelected: function (data) {
          $('.selected-options>li', obj).each(function (index, element) {
            if ($(element).html() === data.name) {
              $(element).remove();
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

        setOptions: function (options) {
          obj.selectOptionsUl.empty();
          this.createLi(options);
        },

        getOptions: function () {
          var selected = [];
          $('.selected-options>li', obj).each(function (index, element) {
            var li = $(element);
            selected.push({
              name: li.html(),
              id: li.data('id')
            });
          });
          return selected;
        },

        setSelected: function (arr) {
          var _self = this;
          //clear selected
          $('.selected-options', obj).find('li').remove();
          //add selected array
          $(arr).each(function (index, element) {
            _self.addSelected(element);
          });
          //render select options
          $('.select-options>li', obj).each(function (index2, element2) {
            var isSelected = false;
            $(arr).each(function (index, element) {
              if ($(element2).data('id') === element.id) {
                isSelected = true;
              }
            });
            if (isSelected) {
              $(element2).addClass('selected');
            } else {
              $(element2).removeClass('selected');
            }
          });
          arr.length && obj.placeholder.addClass('hide');
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