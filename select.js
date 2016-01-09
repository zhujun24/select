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

    // For IE7/8 Array indexOf
    // Production steps of ECMA-262, Edition 5, 15.4.4.14
    // Reference: http://es5.github.io/#x15.4.4.14
    // From: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
    if (!Array.prototype.indexOf) {
      Array.prototype.indexOf = function (searchElement, fromIndex) {

        var k;

        // 1. Let o be the result of calling ToObject passing
        //    the this value as the argument.
        if (this == null) {
          throw new TypeError('"this" is null or not defined');
        }

        var o = Object(this);

        // 2. Let lenValue be the result of calling the Get
        //    internal method of o with the argument "length".
        // 3. Let len be ToUint32(lenValue).
        var len = o.length >>> 0;

        // 4. If len is 0, return -1.
        if (len === 0) {
          return -1;
        }

        // 5. If argument fromIndex was passed let n be
        //    ToInteger(fromIndex); else let n be 0.
        var n = +fromIndex || 0;

        if (Math.abs(n) === Infinity) {
          n = 0;
        }

        // 6. If n >= len, return -1.
        if (n >= len) {
          return -1;
        }

        // 7. If n >= 0, then Let k be n.
        // 8. Else, n<0, Let k be len - abs(n).
        //    If k is less than 0, then let k be 0.
        k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

        // 9. Repeat, while k < len
        while (k < len) {
          // a. Let Pk be ToString(k).
          //   This is implicit for LHS operands of the in operator
          // b. Let kPresent be the result of calling the
          //    HasProperty internal method of o with argument Pk.
          //   This step can be combined with c
          // c. If kPresent is true, then
          //    i.  Let elementK be the result of calling the Get
          //        internal method of o with the argument ToString(k).
          //   ii.  Let same be the result of applying the
          //        Strict Equality Comparison Algorithm to
          //        searchElement and elementK.
          //  iii.  If same is true, return k.
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
          searchInput.oldValue = '';
          $('.select-options-padding').delegate(".select-option", "click", function () {
            var _self = $(this);
            self.addSelected(_self.html());
            $(searchInput).val('');
          });

          //delete selected option
          $('.select-content').delegate(".select-cancel", "click", function () {
            var _self = $(this);
            var selectedText = _self.prev().html();
            _self.parent().remove();
            obj.selected.splice(obj.selected.indexOf(selectedText), 1);
            self.togglePlaceholder();
            self.openOptions();
          });

          //input backspace & enter when value is null
          searchInput.keydown(function (e) {
            var value = $.trim(searchInput.val());
            if (!value && e.keyCode == 8) {
              searchInput.parent().prev().find('.select-cancel').click();
              self.openOptions();
            } else if (value && (e.keyCode == 13 || e.keyCode == 32)) {
              self.addSelected(value);
              searchInput.val('');
            }
          });

          //update input width
          searchInput.bind('input propertychange', function () {
            var value = $.trim(searchInput.val());
            if (value.length > settings.singleLength) {
              value = value.substr(0, settings.singleLength);
            }
            searchInput.val(value);
            if (value !== searchInput.oldValue) {
              searchInput.oldValue = value;
              if (settings.callback) {
                if (settings.callbackTimer) {
                  clearTimeout(searchInput.timer);
                  searchInput.timer = setTimeout(function () {
                    settings.callback(value);
                  }, settings.callbackTimer);
                } else {
                  settings.callback(value);
                }
              }
            }
          });

          //when click out of select,close options
          $(document).click(function (event) {
            var target = $(event.target);
            if (target.hasClass('select-cancel')) {
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
          if ($('.selected-options', obj).find('li').length === settings.limit + 1) {
            console.log('selected options beyond limit');
            return false;
          }
          return true;
        },

        addSelected: function (text) {
          if (this.isLimit() && obj.selected.indexOf(text) === -1) {
            obj.selected.push(text);
            $('.search-input-wrap', obj).before('<li><p>' + text + '</p><p class="select-cancel">&nbsp;X</p></li>');
          } else {
            console.log('This tag has added OR beyond limit');
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