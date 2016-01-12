(function ($) {
  $.fn.Select2 = function (options) {
    var settings = $.extend({
      containerSelector: '',
      placeholder: 'Please enter...',
      selected: [],
      options: [],
      callback: null,
      callbackTimer: 0,
      limit: 0,
      singleLength: 0
    }, options);

    // For IE7/8 Array indexOf
    // From: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
    if (!Array.prototype.indexOf) {
      Array.prototype.indexOf = function (searchElement, fromIndex) {
        var k;
        if (this == null) {
          throw new TypeError('"this" is null or not defined');
        }
        var o = Object(this);
        var len = o.length >>> 0;
        if (len === 0) {
          return -1;
        }
        var n = +fromIndex || 0;
        if (Math.abs(n) === Infinity) {
          n = 0;
        }
        if (n >= len) {
          return -1;
        }
        k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
        while (k < len) {
          if (k in o && o[k] === searchElement) {
            return k;
          }
          k++;
        }
        return -1;
      };
    }


    this.each(function () {
      var obj = $(this);
      this.select = {
        createElems: function () {
          var self = this;
          obj.searchInputTimer = null;
          obj.oldValue = '';
          obj.selectContent = $('<div class="select-content"><ul class="selected-options"><li class="search-input-wrap"><input placeholder="' + settings.placeholder + '" class="search-input" type="text"></li></ul></div>').appendTo(obj);
          obj.selectOptions = $('<div class="select-options"></div>').appendTo(obj);
          obj.selectOptionsDiv = $('<div class="select-options-padding"><span>推荐标签：</span></div>').appendTo(obj.selectOptions);
          this.createLi(settings.options);
          this.addEvent();
          //init selected
          if (settings.selected.length) {
            self.setSelected(settings.selected);
          }
        },

        createLi: function (arr) {
          $(arr).each(function (index, element) {
            $('<span data-id="' + element.id + '" class="select-option">' + element.name + '</span>').appendTo(obj.selectOptionsDiv);
          });
        },

        addEvent: function () {
          //options click
          var self = this;
          var searchInput = $('.search-input', obj);
          $('.select-options-padding').delegate(".select-option", "click", function () {
            var _self = $(this);
            self.addSelected({
                name: _self.html(),
                id: _self.data('id')
              }
            );
            clearTimeout(obj.searchInputTimer);
            self.inputAutoWidth(searchInput);
          });

          //delete selected option
          $('.select-content').delegate(".select-cancel", "click", function () {
            var _self = $(this);
            var selectedText = _self.prev().html();
            _self.parent().remove();
            var selected = self.getOptions();
            if (!selected.length) {
              self.togglePlaceholder(true);
            }
            self.inputAutoWidth();
          });

          //input backspace & enter when value is null
          searchInput.keydown(function (e) {
            var value = $.trim(searchInput.val());
            if (!value && e.keyCode == 8) {
              var prevObj = searchInput.parent().prev();
              searchInput.val(prevObj.find('p:eq(0)').html());
              prevObj.find('p:eq(1)').click();
              self.openOptions();
              self.inputChange();
              return false;

            } else if (value && (e.keyCode == 13 || e.keyCode == 32)) {
              self.addSelected({
                name: value,
                id: ''
              });
              clearTimeout(obj.searchInputTimer);
              searchInput.val('');
              self.inputAutoWidth(this);
              return false;
            }
          });

          //update input width
          searchInput.bind('input propertychange', function () {
            self.inputChange();
          });

          //when click out of select,close options
          $(document).click(function (event) {
            var target = $(event.target);
            if (target.hasClass('select-cancel')) {
              searchInput.focus();
              return false;
            }
            if (target.parents(settings.containerSelector).length) {
              self.openOptions();
            } else {
              self.closeOptions();
            }
          });
        },

        inputChange: function () {
          var searchInput = $('.search-input', obj);
          var value = $.trim(searchInput.val());
          var maxLength = settings.singleLength ? settings.singleLength : false;
          if (maxLength && value.length > settings.singleLength) {
            value = value.substr(0, settings.singleLength);
            searchInput.val(value);
          }
          //input callback
          if (value !== obj.oldValue) {
            obj.oldValue = value;
            if (settings.callback) {
              if (settings.callbackTimer) {
                clearTimeout(obj.searchInputTimer);
                obj.searchInputTimer = setTimeout(function () {
                  settings.callback(value);
                }, settings.callbackTimer);
              } else {
                settings.callback(value);
              }
            }
          }
          this.inputAutoWidth(searchInput);
        },

        inputAutoWidth: function (input, restWidth) {
          var input = $(input);
          var value = input.val() || '';
          var span = $('<span/>').css({
            display: 'none',
            fontSize: input.css('fontSize'),
            fontFamily: input.css('fontFamily')
          }).appendTo('body');
          span.html(value.replace(/&/g, '&amp;').replace(/\s/g, '&nbsp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
          input.width(span.width() + (restWidth || 1));
          console.log(span.width());
          if (!span.width()) {
            this.togglePlaceholder();
          }
          span.remove();
        },

        isLimit: function () {
          if (!settings.limit) {
            return false;
          }
          if ($('.selected-options', obj).find('li').length === settings.limit + 1) {
            console.log('selected options beyond limit');
            return true;
          }
          return false;
        },

        addSelected: function (data) {
          if (this.isLimit()) {
            console.log('This tag beyond limit');
            return false;
          }

          var isSelected = false;
          var selected = this.getOptions();
          $(selected).each(function (index, element) {
            if (element.name === data.name) {
              isSelected = true;
              console.log('This tag has added');
              return false;
            }
          });

          if (isSelected) {
            return false
          }

          $('.search-input-wrap', obj).before('<li><p data-id="' + data.id + '">' + data.name + '</p><p class="select-cancel">&nbsp;X</p></li>');
          this.togglePlaceholder();
        },

        setOptions: function (options) {
          obj.selectOptionsDiv.find('.select-option').remove();
          this.createLi(options);
          if ($('.select-options', obj).css('height') !== '0px') {
            this.openOptions();
          }
        },

        getOptions: function () {
          var selected = [];
          $('li.search-input-wrap', obj).prevAll().each(function (index, element) {
            var p = $(element).find('p:eq(0)');
            selected.push({
              name: p.html(),
              id: p.data('id')
            });
          });
          return selected;
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

        togglePlaceholder: function (hehe) {
          var selected = this.getOptions();
          if (selected.length && !hehe) {
            $('.search-input', obj).attr('placeholder', '');
          } else {
            $('.search-input', obj).width(468).attr('placeholder', settings.placeholder);
          }
        },

        setSelected: function (arr) {
          var _self = this;
          $('li.search-input-wrap', obj).prevAll().remove();
          $(arr).each(function (index, element) {
            _self.addSelected(element);
            _self.inputAutoWidth($('.search-input', obj));
          });
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