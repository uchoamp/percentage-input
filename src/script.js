const percentageInputFormat = {
  maskPercentage: function (opts) {

    const default_opts = {
      negative:  false,
      sufix: "%",
      decimal_symbol: ",",
      decimal_places: 2
    }

    opts = {...default_opts, ...opts}

    function fixDecimalPlacePosition(value, offsetCursor) {
      const decimal_symbol = opts.decimal_symbol;
      const decimal_places = opts.decimal_places;

      if(!decimal_places || !decimal_symbol)
        return [ value, 0 ];

      const value_length = value.length;

      const placeIndex = value.indexOf(decimal_symbol); 
      let  = 1;

      const left_offset = value.startsWith("-") ? 1 : 0;
      const right_offset = opts.sufix.length;

      let num_length = value_length - (left_offset + right_offset);

      if(placeIndex > -1) {
        const left_value = value.slice(0, placeIndex);
        const right_value = value.slice(placeIndex + 1, value_length);
        const end_length = decimal_places + opts.sufix.length;

        num_length -= 1;

        if(num_length > decimal_places && right_value.length < end_length) {
          value = left_value[left_value.length - 1] + right_value;
          value = left_value.slice(0, left_value.length - 1) + decimal_symbol + value;
        }
        else if(num_length > decimal_places && right_value.length > end_length) {
          value = left_value + right_value[0];
          value += decimal_symbol + right_value.slice(1);
        } else if (num_length <= decimal_places) {
          value = left_value + right_value;
          offsetCursor--;
        }
      } else if (num_length > decimal_places) {
        const right_begin = value_length - right_offset - decimal_places;
        const left_value = value.slice(0, right_begin);
        const right_value = value.slice(right_begin, value_length);
        value = left_value + decimal_symbol + right_value;
        offsetCursor++;
      }

      return [ value, offsetCursor ];
    }

    function fixedCursor(e) {
      let positionCursor = e.target.selectionStart;
      const valueLength = this.value.length;

      const key = e.key;
      e.preventDefault();

      if(key == "ArrowLeft" && positionCursor > 0)
        positionCursor -= 1;
      else if(key == "ArrowRight")
        positionCursor += 1;

      const isPositionOverflowLeft = this.value[positionCursor] == "-";
      const isPositionOverflowRight = positionCursor > valueLength - 2; 

      if(!this.value.endsWith(opts.sufix)) {
        this.value = opts.sufix;
        positionCursor = positionCursor;
      } else if (isPositionOverflowRight) {
        positionCursor = positionCursor - ((positionCursor + opts.sufix.length) - valueLength);
      } else if (isPositionOverflowLeft)  {
        positionCursor = positionCursor + 1;
      }

      this.setSelectionRange(positionCursor, positionCursor)
    }

    $(this).on("focus", fixedCursor);
    $(this).on("mousedown", function (e) { e.preventDefault(); this.focus() });
    $(this).on("keydown", function(e) {
      const positionCursor = this.selectionEnd;

      const key = e.key;

      if(!key.startsWith("ArrowLeft") && !key.startsWith("ArrowRight"))
        e.preventDefault();
      else if(key.startsWith("Arrow"))
          fixedCursor.call(this, e);

      if(!((key >= '0' && key <= '9') || key == "Backspace" || (opts.negative && key == '-')))
        return;

      let value = this.value;
      let offsetCursor = 1;

      if(key == "Backspace") {
        offsetCursor = 0;
        if(positionCursor > 0) 
          [ value, offsetCursor ] = fixDecimalPlacePosition(value.slice(0, positionCursor - 1) + value.slice(positionCursor), -1); 
      }
      else if(key == "-") { 
        if(value.startsWith("-")) {
          value = value.slice(1);
          offsetCursor = -1;
        } else {
          value = "-" + value;
        }
      } else {
        const valueLength =  value.length;

        const leftValue = value.slice(0, positionCursor);
        const rightValue = value.slice(positionCursor, valueLength);

        [ value, offsetCursor ] = fixDecimalPlacePosition(leftValue + key + rightValue, 1);
      }

      this.value = value;
      this.selectionEnd = positionCursor + offsetCursor;
    })
  }
}

jQuery.fn.extend(percentageInputFormat);

$(".percentage").maskPercentage({ negative: true })

