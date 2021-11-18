(function main() {
    var isSelfCrossing = function (distance) {
        var map = new Set();
        map.add("0-0");
        var x = 0,
            y = 0;
        var output = false;
        distance.forEach((vaule, index) => {
            if (index == 0) {
                for (var i = 1; i <= vaule; i++) {
                    y += 1;
                    var pos = `${x}-${y}`;
                    if (!map.has(pos)) {
                        map.add(pos);
                    } else {
                        map.add(pos);
                        output = true;
                        return false;
                    }
                }
            }
            if (index == 1) {
                for (var i = 1; i <= vaule; i++) {
                    x -= 1;
                    var pos = `${x}-${y}`;
                    if (!map.has(pos)) {
                        map.add(pos);
                    } else {
                        map.add(pos);
                        output = true;
                        return false;
                    }
                }
            }
            if (index == 2) {
                for (var i = 1; i <= vaule; i++) {
                    y -= 1;
                    var pos = `${x}-${y}`;
                    if (!map.has(pos)) {
                        map.add(pos);
                    } else {
                        output = true;
                        return false;
                    }
                }
            }
            if (index == 3) {
                for (var i = 1; i <= vaule; i++) {
                    x += 1;
                    var pos = `${x}-${y}`;
                    if (!map.has(pos)) {
                        map.add(pos);
                    } else {
                        output = true;
                        return false;
                    }
                }
            }
        });
        console.log(map);
        return output;
    };
    var distance = [1, 2, 3, 4];
    console.log(isSelfCrossing(distance));
})();
