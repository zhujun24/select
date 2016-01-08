(function ($) {
  $.fn.Select2 = function (options) {
    var settings = $.extend({
      containerSelector: '',
      placeholder: 'Please enter...',
      options: ['aaaaa', 'bbbbb', 'cccccc', 'ddddddd', 'eeeeeeee', 'fffffff', '11111111', '22222222', '333333'],
      callback: null,
      callbackTimer: 0,
      limit: 5,
      singleLength: 4
    }, options);

    if (!Array.prototype.indexOf) {
      //Fuck IE7/8
      Array.prototype.indexOf = function (elt) {
        var len = this.length >>> 0;
        for (var i = 0; i < len; i++) {
          if (i in this && this[i] === elt)
            return i;
        }
        return -1;
      };
    }


    this.each(function () {
      var obj = $(this);
      obj.selected = [];
      this.select = {
        createElems: function () {
          obj.selectContent = $('<div class="select-content"><ul class="selected-options"><li class="search-input-wrap"><input placeholder="' + settings.placeholder + '" class="search-input" type="text"></li></ul></div>').appendTo(obj);
          obj.selectOptions = $('<div class="select-options"></div>').appendTo(obj);
          obj.selectOptionsDiv = $('<div class="select-options-padding"><span>推荐标签：</span></div>').appendTo(obj.selectOptions);
          this.createLi(settings.options);
          this.addEvent();
        },

        createLi: function (arr) {
          $(arr).each(function (index, element) {
            $('<span class="select-option">' + element + '</span>').appendTo(obj.selectOptionsDiv);
          });
        },

        addEvent: function () {
          //options click
          var self = this;

          var searchInput = $('.search-input', obj);
          $('.select-options-padding').delegate(".select-option", "click", function () {
            var _self = $(this);
            self.addSelected(_self.html());
            $(searchInput).val('').focus();
          });

          //delete selected option
          $('.select-content').delegate(".select-cancel", "click", function (event) {
            var _self = $(this);
            var selectedText = _self.prev().html();
            _self.parent().remove();
            obj.selected.splice(obj.selected.indexOf(selectedText), 1);
            self.togglePlaceholder();
            event.stopPropagation();
            self.openOptions();
          });

          //input backspace & enter when value is null
          $(searchInput).keydown(function (e) {
            var _self = $(this);
            var value = $.trim(_self.val());
            if (!value && e.keyCode == 8) {
              _self.parent().prev().find('.select-cancel').click();
              self.openOptions();
            } else if (value && (e.keyCode == 13 || e.keyCode == 32)) {
              self.addSelected(value);
              _self.val('');
            }
          });

          //update input width
          $(searchInput).bind('input propertychange', function () {
            var _self = $(this);
            var value = $.trim(_self.val());
            if (value.length > settings.singleLength) {
              _self.val(value.substr(0, settings.singleLength));
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

          //when click out of select,close options
          $(document).click(function (event) {
            if ($(event.target).parents(settings.containerSelector).length) {
              self.openOptions();
            } else {
              self.closeOptions();
            }
          });
        },

        isLimit: function () {
          if ($('.selected-options', obj).find('li').length === settings.limit + 1) {
            console.log('selected options beyond limit');
            return false;
          } else {
            return true;
          }
        },

        addSelected: function (text) {
          if (this.isLimit() && obj.selected.indexOf(text) === -1) {
            obj.selected.push(text);
            $('.search-input-wrap', obj).before('<li><p>' + text + '</p><p class="select-cancel">&nbsp;X</p></li>');
          } else {
            console.log('This tag has added');
          }
          this.togglePlaceholder();
        },

        setOptions: function (options) {
          obj.selectOptionsDiv.find('.select-option').remove();
          this.createLi(options);
          this.openOptions();
        },

        getOptions: function () {
          return obj.selected;
        },

        openOptions: function () {
          $('.search-input', obj).focus();
          var el = $('.select-options', obj),
            curHeight = el.height(),
            autoHeight = el.css('height', 'auto').height();
          el.stop().height(curHeight).animate({
            height: autoHeight
          }, 300);
        },

        closeOptions: function () {
          $('.select-options', obj).stop().animate({
            height: 0
          }, 300);
        },

        togglePlaceholder: function () {
          if (obj.selected.length) {
            $('.search-input', obj).width(56).attr('placeholder', '');
          } else {
            $('.search-input', obj).width(468).attr('placeholder', settings.placeholder);
          }
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