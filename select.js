(function ($) {
  $.fn.Select = function (options) {
    // This is the easiest way to have default options.
    var settings = $.extend({
      placeholder: '',
      options: ['aaaaa', 'bbbbb', 'cccccc', 'ddddddd', 'eeeeeeee', 'fffffff', '11111111', '22222222', '333333'],
      callback: null,
      callbackTimer: 0,
      limit: 0,
      afterOpen: false,
      displayLength: 0
    }, options);

    var testVar = function (Var) {
      return Object.prototype.toString.call(Var).slice(8, -1);
    };

    this.each(function () {
      var obj = $(this); // the original select object.
      obj.css({'position': 'relative'});

      this.select = {

        createElems: function () {
          obj.selectContent = $('<div class="select-content"><ul class="selected-options"><li class="search-input-wrap"><input class="search-input" type="text"></li></ul></div>').appendTo(obj);
          this.createUl();
          this.createLi(settings.options);
          $('.select-options', obj).height(0);
          settings.placeholder && this.createPlaceHolder(settings.placeholder);
          this.setInputWidth($('.search-input', obj));
          this.addEvent();
        },

        createUl: function () {
          if (!obj.selectOptionsUl) {
            obj.selectOptionsUl = $('<ul class="select-options"></ul>').appendTo(obj);
          }
        },

        createLi: function (arr) {
          $(arr).each(function (index, element) {
            $('<li>' + element + '</li>').appendTo(obj.selectOptionsUl);
          });
        },

        createPlaceHolder: function (placeholder) {
          obj.append('<p class="select-placeholder">' + placeholder + '</p>');
          var placeHolder = $('.select-placeholder', obj);
          placeHolder.width(placeHolder.parent().width() - 10);
        },

        addEvent: function () {
          //options click
          var self = this;

          var searchInput = $('.search-input', obj);
          $('.select-options').delegate("li", "click", function () {
            var _self = $(this);
            if (!_self.hasClass('selected')) {
              if (self.isLimit()) {
                _self.addClass('selected');
                self.addSelected(_self.html());
              }
              $(searchInput).val('').focus();
              self.setInputWidth(searchInput);
              $('.select-placeholder', obj).addClass('hide');
              !!settings.afterOpen && self.optionsOpen();
            }
          });

          //delete selected option
          $('.select-content').delegate(".select-cancel", "click", function () {
            var _self = $(this);
            var selectedText = _self.prev().html();
            _self.parent().remove();
            self.setInputWidth(searchInput);
            obj.selectOptionsUl.find('li').each(function (index, element) {
              var optionsVal = $(element).html();
              if (optionsVal === selectedText) {
                obj.selectOptionsUl.find('li').eq(index).removeClass('selected');
                return false;
              }
            });
          });

          //input backspace when value is null
          $(searchInput).keydown(function (e) {
            var _self = $(this);
            var value = $.trim(_self.val());
            if (!value && e.keyCode == 8) {
              _self.parent().prev().find('.select-cancel').click();
            }
            if (value && (e.keyCode == 13 || e.keyCode == 32)) {
              if (self.isLimit()) {
                self.addSelected(value);
              }
              _self.val('');
            }
          });

          $(searchInput).blur(function () {
            self.optionsClose();
            $(this).val('');
            if (!$(this).parent().prev().length) {
              $('.select-placeholder', obj).removeClass('hide');
            }
          });

          //update input width
          $(searchInput).bind('input propertychange', function () {
            var _self = $(this);

            var sensor = $('<pre>' + _self.val() + '</pre>').css({display: 'none', fontSize: '14px'});
            $('body').append(sensor);
            var width = sensor.width();
            sensor.remove();
            if (_self.width() - width < 3) {
              _self.width(width + 3);
            }

            if (settings.callback) {
              if (settings.callbackTimer) {
                clearTimeout(searchInput.timer);
                searchInput.timer = setTimeout(function () {
                  settings.callback(_self.val());
                }, settings.callbackTimer);
              } else {
                settings.callback(_self.val());
              }
            }
          });

          //placeholder
          $('.select-placeholder', obj).click(function () {
            $(this).addClass('hide');
            $('.search-input', obj).focus();
            self.optionsOpen();
          });

          $('.select-content', obj).click(function () {
            $('.search-input').focus();
            $('.select-placeholder', obj).addClass('hide');
            self.optionsOpen();
          });
        },

        isLimit: function () {
          var isLimit = settings.limit ? $('.selected-options', obj).find('li').length - settings.limit : 0;
          if (isLimit > 0) {
            console.log('selected options beyond limit');
            return false;
          } else {
            return true;
          }
        },

        addSelected: function (text) {
          $('.search-input-wrap', obj).before('<li><p>' + text + '</p><p class="select-cancel">&nbsp;X</p></li>');
        },

        addOptions: function (options) {
          if (testVar(options) !== 'Array') {
            console.log('options must be a Array!');
            return false;
          }
          this.createLi(options);
          this.optionsOpen()
        },

        setOptions: function (options) {
          if (testVar(options) !== 'Array') {
            console.log('options must be a Array!');
            return false;
          }
          obj.selectOptionsUl.children().remove();
          this.createLi(options);
          this.optionsOpen();
        },

        getOptions: function () {
          var selected = $('.selected-options', obj).find('li');
          var result = [];
          selected.each(function (index, element) {
            if (selected.length === index + 1) {
              return false;
            }
            result.push($(element).find('p:first').html());
          });
          return result;
        },

        optionsOpen: function () {
          var self = $('.select-options', obj);
          var child = self.children();
          var singleHeight = child.outerHeight();
          if (settings.displayLength) {
            self.css({'overflowY': 'scroll'}).stop().animate({'height': settings.displayLength * singleHeight});
          } else {
            self.css({'overflowY': 'hidden'}).stop().animate({'height': child.length * singleHeight});
          }
        },

        optionsClose: function () {
          $('.select-options', obj).stop().animate({'height': 0});
        },

        setInputWidth: function (input) {
          input.width(1);
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