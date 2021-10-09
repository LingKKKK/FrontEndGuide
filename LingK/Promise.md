# Promise 常用内容

    包含了三种状态: pending(等待中) fulfilled|resolve(已成功) reject(已失败)
    这三种状态的变化是不可逆的, 只能从 pending -> fulfilled(resolve)/reject

# 手动实现 Promise 对象

    ```javascript
    	/**
    	 * @status: 记录Promise的状态, 有三种值: pending/fulfilled/rejected
    	 * @value: 记录Promise执行resolve的值
    	 * @reason: 记录Promise执行reject的值
    	 * @onFulfilledCB: then中的第一个参数
    	 * @onRejectedCB: then中的第二个参数
    	 */
    	function _promise(fn) {
    		let that = this;
    		that.status = 'pending';
    		that.value = null;
    		that.reason = null;
    		that.onFulfilledCB = [];
    		that.onRejectedCB = [];

    		function _resolve(value) {
    			setTimeout(() => {
    				that.status = 'fulfilled';
    				that.value = value;
    				that.onFulfilledCB.map(item => {
    					item(that.value);
    				})
    			}, 0)
    		}

    		function _reject(value) {
    			setTimeout(() => {
    				that.status = 'rejected';
    				that.reason = value;
    				that.onRejectedCB.map(item => {
    					item(that.reason);
    				})
    			}, 0)
    		}

    		fn(_resolve, _reject);
    	}
    ```

# 常用 Promise API (all race allSettled)

    ```JavaScript
    	let p1 = new Promise((resolve, reject) => {
    		resolve('success1');
    	})
    	let p2 = new Promise((resolve, reject) => {
    		resolve('success2');
    	})
    	let p3 = new Promise((resolve, reject) => {
    		resolve('success2');
    	})

    	/**
    	 * Promise.all 返回一个Promise实例; 执行顺序有先后
    	 * 如果全部都返回resolve且执行完毕, 就执行实例的resolve
    	 * 如果有一个参数执行了reject, 就会执行实例的reject
    	 */
    	Promise.all([p1, p2, p3]).then(resolve => {
    		console.log('全部运行完毕');
    	}).catch(err => {
    		console.log('运行出错');
    	})

    	/**
    	 * Promise.rece 返回一个Promise实例; 执行顺序无先后
    	 * 会根据先执行完毕的返回值来触发实例的状态, 如果resolve触发then,如果reject先执行就触发catch
    	 */
    	Promise.all([p1, p2, p3]).then(resoluve => {
    		console.log('全部运行完毕');
    	}).catch(err => {
    		console.log('运行出错');
    	})

    	/**
    	 * Promise.allSettled 返回一个Promise实例; 执行顺序有先后
    	 * 当所有的参数都执行完毕, 再返回每个对象的描述结果, 输出实例参数的信息[包含了 status/value/reason等信息]
    	 */
    	Promise.allSettled([p1, p2, p3]).then(args => {
    		console.log(args);
    	})
    ```

# 如何提前终止 Promise

    1. 返回 pending 状态的实例
    2. Promise.race();
    3. throw new Error
    4. 调用reject

# 实现 Promise.all

    ```javascript
    	Promise.all = Promise.all || function(params) {
    		var resolvedCounter = 0; // 处理的数量
    		var promiseNum = params.length; // 参数的数量
    		var result = [];
    		return new Promise.((resolve, reject) => {
    			if (!Array.isArray(params)) {
    				return reject('参数必须是数组');
    			}
    			for (let i in params) {
    				Promise.resolve(params[i]).then(res => {
    					resolvedCounter += 1;
    					result[i] = res;
    					if (resolvedCounter == promiseNum) {
    						resovle(result);
    					}
    				}, err => {
    					reject(err);
    				})
    			}
    		})
    	}
    ```

# 实现 Promise.allSettled

    ```javascript
    	// settled [ˈsetld]
    	Promise.allSettled = Promise.allSettled || function(params) {
    		return new Promise((resolve, reject) => {
    			if (!Array.isArray(params)) {
    				return reject(
    					new TypeError('参数必须是数组');
    				)
    			}
    			var resolvedCounter = 0; // 已处理的数量
    			var promiseNum = params.length; // 参数的数量
    			var resolveValue = new Array(promiseNum); // 返回值集合
    			for (let i = 0; i < promiseNum; i++) {
    				(function(i) {
    					Promise.resolve(params[i]).then(
    						function(value) {
    							resolvedCounter++;
    							resolveValue[i] = value;
    							if (resolvedCounter >= promiseNum) {
    								resolve(resolveValue);
    							}
    						}
    					),
    					function(reason) {
    							resolvedCounter++;
    							resolveValue[i] = reason;
    							if (resolvedCounter >= promiseNum) {
    								reject(resolveValue);
    							}
    					}
    				})(i);
    			}
    		})
    	}
    ```

# 使用 Promise 封装一个分页请求的函数

    ```JavaScript
    	// 使用Promise封装方法, 每次请求10条数据, 请求完毕开始下一轮的请求;
    	var data = Array(99).fill(0);
    	data.forEach((i, k) => {
    		data[k] = k + 1
    	})
    	var output = [];
    	var recursion = (index, size) => {
    		return new Promise((resolve, reject) => {
    			setTimeout(() => {
    				var _list = data.slice(index, index + size);
    				resolve(_list);
    			}, 30)
    		})
    	}
    	var queryData = (ajax, index, size) => {
    		ajax(index, size).then(res => {
    				output.push(res);
    				let _index = index + size;
    				// 终止的条件就是超出范围
    				if (res.length < size || _index > data.length - 1) return false;
    				queryData(ajax, _index, size);
    		});
    	}
    	queryData(recursion, 0, 10)

    ```
