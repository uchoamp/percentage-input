

function __configureInputPercentageMask(el, opts) {
  const range = document.createRange();
  const selection = window.getSelection();

  el.attr("type", "hidden");
  const parent = $(el.parent());

  $(`<div class="percentage-input ${opts.input_classes}"> </div>`).insertBefore(el);
  const real_input = parent.find(".percentage-input");
  real_input.append(`<span contenteditable="true"></span>`);
  real_input.append(`<span contenteditable="false">${opts.sufix}</span>`);
  const input_text = real_input.children().first()[0];

  function updateFormInputValue() {
    el.val(input_text.innerText.replace(",", "."));
  }

  function fixDecimalPlacePosition(value, offsetCursor) {
    const decimal_symbol = opts.decimal_symbol;
    const decimal_places = opts.decimal_places;

    if (!decimal_places || !decimal_symbol)
      return [value, offsetCursor];

    const value_length = value.length;

    const placeIndex = value.indexOf(decimal_symbol);

    const left_offset = value.startsWith("-") ? 1 : 0;
    const right_offset = 0;

    let num_length = value_length - (left_offset + right_offset);

    if (placeIndex > -1) {
      const left_value = value.slice(0, placeIndex);
      const right_value = value.slice(placeIndex + 1, value_length);
      const end_length = decimal_places + right_offset;

      num_length -= 1;

      if (num_length > decimal_places && right_value.length < end_length) {
        value = left_value[left_value.length - 1] + right_value;
        value = left_value.slice(0, left_value.length - 1) + decimal_symbol + value;
      }
      else if (num_length > decimal_places && right_value.length > end_length) {
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

    return [value, offsetCursor];
  }

  function fixCursorPosition(e) {
    const value_length = input_text.innerText.length;

    let positionCursor = e.key ? selection.anchorOffset : range.startOffset;
    if (e.type == "click") {
      const input_text_bouding = input_text.getBoundingClientRect();
      if (input_text_bouding.left >= e.clientX)
        positionCursor = 0;
      else if (input_text_bouding.right <= e.clientX)
        positionCursor = value_length;
      else
        positionCursor = selection.anchorOffset;
    }

    const key = e.key;
    e.preventDefault();

    if (key == "ArrowLeft" && positionCursor > 0)
      positionCursor -= 1;
    else if (key == "ArrowRight")
      positionCursor += 1;

    const isPositionOverflowLeft = input_text.innerText[positionCursor] == "-";
    const isPositionOverflowRight = positionCursor > value_length;

    if (isPositionOverflowRight) {
      positionCursor = value_length;
    }
    if (isPositionOverflowLeft) {
      positionCursor = positionCursor + 1;
    }

    selection.removeAllRanges();
    selection.addRange(range);
    range.setStart(input_text.childNodes[0] || input_text, positionCursor);
    range.collapse(true);
    input_text.focus();
  }

  function handleKeyInputPercentage(e) {
    const positionCursor = selection.anchorOffset;

    const key = e.key;

    if (!key.startsWith("ArrowLeft") && !key.startsWith("ArrowRight"))
      e.preventDefault();
    else if (key.startsWith("Arrow"))
      fixCursorPosition.call(input_text, e);

    if (!((key >= '0' && key <= '9') || key == "Backspace" || (opts.negative && key == '-')))
      return;

    let value = input_text.innerText;
    let offsetCursor = 1;

    if (key == "Backspace") {
      offsetCursor = 0;
      if (positionCursor > 0)
        [value, offsetCursor] = fixDecimalPlacePosition(value.slice(0, positionCursor - 1) + value.slice(positionCursor), -1);
    }
    else if (key == "-") {
      if (value.startsWith("-")) {
        value = value.slice(1);
        offsetCursor = -1;
      } else {
        value = "-" + value;
      }
    } else {
      const valueLength = value.length;

      const leftValue = value.slice(0, positionCursor);
      const rightValue = value.slice(positionCursor, valueLength);

      [value, offsetCursor] = fixDecimalPlacePosition(leftValue + key + rightValue, 1);
    }

    input_text.innerText = value;
    range.setStart(input_text.childNodes[0] || input_text, positionCursor + offsetCursor);
    updateFormInputValue();
  }

  $(input_text).on("focus", fixCursorPosition);
  real_input.on("click", fixCursorPosition);
  real_input.on("keydown", handleKeyInputPercentage)
}

const percentageInputFormat = {
  inputPercentage: function (opts) {
    const default_opts = {
      negative: false,
      sufix: "%",
      decimal_symbol: ",",
      decimal_places: 2,
      input_classes: ""
    }

    opts = { ...default_opts, ...opts }

    for (const el of this) {
      __configureInputPercentageMask($(el), opts)
    }
  }
}

jQuery.fn.extend(percentageInputFormat);

$(".percentage-field").inputPercentage({ negative: true, decimal_places: 2, input_classes: "form-control" })

