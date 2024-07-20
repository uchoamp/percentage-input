const percentageInputFormat = {
  maskPercentage: function (opts) {

    const default_opts = {
      negative:  false,
      sufix: " %",
      decimal_symbol: ",",
      decimal_places: 2
    }

    opts = {...default_opts, ...opts}

    function fixDecimalPlacePosition(value) {
      const decimal_symbol = opts.decimal_symbol;
      const decimal_places = opts.decimal_places;

      if(!decimal_places || !decimal_symbol)
        return [ value, 0 ];

      const placeIndex = value.indexOf(decimal_symbol); 
      let offsetCursor = placeIndex >= 0 ? 0 : 2;

      let place_and_digits = value.match(/\d*,?\d+/)[0]
      const startswith_place = place_and_digits.startsWith(",");
      const p_and_d_length = place_and_digits.length;

      if(startswith_place && p_and_d_length <= decimal_places + 1) {
        place_and_digits = place_and_digits.slice(1);
        offsetCursor = -1;
      } else if (placeIndex >= 0) {
        place_and_digits[placeIndex] = place_and_digits[placeIndex + 1];
        place_and_digits[placeIndex + 1] = decimal_symbol;
      } else if (placeIndex == -1 && p_and_d_length > decimal_places) {
        place_and_digits = place_and_digits[0] +  place_and_digits;
        place_and_digits[1] = decimal_symbol;
      }

      value = value.replace(/\d*,?\d+/, place_and_digits);
      return [ value, offsetCursor ];
    }

    function fixedCursor(e) {
      let positionCursor = this.selectionEnd;
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

      this.selectionEnd = positionCursor;
      this.selectionStart = positionCursor;
    }

    $(this).on("focus", fixedCursor);
    $(this).on("click", fixedCursor);

    $(this).on("keydown", function(e) {
      const positionCursor = this.selectionEnd;

      const key = e.key;

      if(!key.startsWith("Backspace") && !key.startsWith("ArrowLeft") && !key.startsWith("ArrowRight"))
        e.preventDefault();
        else if(key.startsWith("Arrow"))
          fixedCursor.call(this, e);

      if(!((key >= '0' && key <= '9') || (opts.negative && key == '-')))
        return;

      let value = this.value;
      let offsetCursor = 1;

      if(key == "-") { 
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

        [ value, offsetCursor ] = fixDecimalPlacePosition(leftValue + key + rightValue);
      }

      this.value = value;
      this.selectionEnd = positionCursor + offsetCursor;
    })
  }
}

jQuery.fn.extend(percentageInputFormat);

$(".percentage").maskPercentage({ negative: true })
