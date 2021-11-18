(function main() {
  // 10. 写一个函数readInt(Number nb)功能是读出整数，如输入123期望的输出是"一百二十三";
  function readInt(num) {
    let number_arr = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    let unit_arr = ['个', '十', '百', '千', '万', '十', '百', '千', '亿'];
    // 111 101 1001 1010 1011
    let en_arr = String(num).split('');
    let output;
    en_arr.forEach((value, index) => {
      let _index = en_arr.length - index - 1; // 当前位数
      if (_index == 4 && output.indexOf('万') == -1) {
        output = output.slice(0, output.length - 1) + '万'
        en_arr[index] = 1;
      };
      if (Number(value) == 0) {
        if (en_arr[index - 1] != 0 && _index != 0) {
          output += `${number_arr[value]}`
        }
      } else {
        output += `${number_arr[value]}${_index ? unit_arr[_index] : ''}`
      }
    })
    if (output[output.length - 1] == "零") {
      output = output.slice(0, output.length - 1);
    }
    return output;
  }
  console.log(readInt(34000342))
})();
