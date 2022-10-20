# slot API 更新
自 2.6.0 版本, 使用 v-slot 来优化 slot 和 scope-slot 标签. 使用 v-slot 会统一作用域插槽和普通插槽的使用.
旧API已被移除,但是依然可以使用.
[为什么要更新slot](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0001-new-slot-syntax.md)

这就是传统的插槽写法, 匿名具名
```js 被废弃的方法,不会出现在 Vue3 中
  <base-layout>
    <template slot="header">
      <h1>Here might be a page title</h1>
    </template>
    <p>A paragraph for the main content.</p>
    <p>And another one.</p>
    <template slot="footer">
      <p>Here's some contact info</p>
    </template>
  </base-layout>
```

插槽的分类:
  1.匿名插槽(或默认插槽): 只能有一个
  2.具名插槽: slot使用name命名
  3.作用域插槽: 父组件用于接收子组件内数据

```html Foo父组件
  <template>
    <div class="tmpl">
      <h1>父子组件与兄弟组件通信</h1>
      <h3>子组件通信为 {{childMsg}}</h3>
      <my-bar :message="parentMsg">
        <template #default>
          匿名插槽内容
        </template>
      </my-bar>
      <my-baz>
        <template v-slot:header="items">
          <p>具名插槽 header</p>
          <p>作用域插槽： {{items.user.name}}</p>
        </template>
        <template v-slot:default>
          <p>匿名插槽内容</p>
        </template>
        <template v-slot:footer>
          <p>具名插槽 footer</p>
        </template>
      </my-baz>
    </div>
  </template>
  <script>
  import MyBar from '@/components/Foo/Bar.vue'
  import MyBaz from '@/components/Foo/Baz.vue'
  export default {
    name: 'Foo',
    components: {
      MyBar, MyBaz
    },
    data () {
      return {
        parentMsg: 'abc123',
        childMsg: ''
      }
    }
  }
  </script>
```
```html 匿名插槽 Bar
  <template>
    <div class="tmpl">
      <h1>父组件传值为 {{message}}</h1>
      <button>通信父组件</button>
      <slot></slot>
    </div>
  </template>
  <script>
    export default {
      name: 'Bar',
      props: {
        message: {
          type: String,
          default: '默认为空'
        }
      },
    }
  </script>
```
```html 具名&作用域插槽 Baz
  <template>
    <div class="tmpl">
      <h1>Baz</h1>
      <h1>兄弟组件通信为{{brotherMsg}}</h1>
      <slot name="header" :user="user">
        {{ user.name }}
      </slot>
      <slot></slot>
      <slot name="footer"></slot>
    </div>
  </template>
  <script>
    export default {
      name: 'Baz',
      data () {
        return {
          brotherMsg: '',
          user: {
            name: '李四',
            age: 15
          }
        }
      }
    }
  </script>
```
匿名|具名|作用域插槽的内容基本上没有变化, 只是添加了一个插槽的标签.
```html 输出结果
  <template>
    <div class="tmpl">
      <h1>父子组件与兄弟组件通信</h1>
      <h3>子组件通信为 </h3>
      <div class="tmpl">
        <h1>父组件传值为 abc123</h1>
        <button>通信父组件</button>
        匿名插槽内容
      </div>
      <div class="tmpl">
        <h1>Baz</h1>
        <h1>兄弟组件通信为</h1>
        <p>具名插槽 header</p>
        <p>作用域插槽： 李四</p>
        <p>匿名插槽内容</p>
        <p>具名插槽 footer</p>
      </div>
    </div>
  </template>
```

# 简写技巧
具名插槽的缩写
跟 v-on 和 v-bind 一样，v-slot 也有缩写，即把参数之前的所有内容 (v-slot:) 替换为字符 #。例如 v-slot:header 可以被重写为 #header
```html
  <template v-slot:footer>
    <p>具名插槽 footer</p>
  </template>
  <!-- 等价于 -->
  <template #footer>
    <p>具名插槽 footer</p>
  </template>
  ...
  ...
  <current-user #default="{ user }">
    {{ user.firstName }}
  </current-user>
```


# 插槽的使用
  一.匿名插槽
    1.匿名插槽只有一个
    2.一个不带name的slot, 出口会带有隐含的名字 default
    3.父组件调用带有插槽的子组件, 并传入值给子组件, 会替代子组件的默认值
  二.具名插槽
    1.slot有name属性, 可以拥有多个具名插槽
    2.任何没有包裹在 v-slot 中的内容, 都会被视为默认插槽的内容

  匿名插槽和具名插槽的使用: v-slot标签添加在templete标签上

  有时候,我们需要使用多个插槽, 如下,我们定义一个 <base-layout>组件
  ```html
      <div class="container">
        <header>
          <slot name="header"></slot>
        </header>
        <main>
          <slot></slot>
        </main>
        <footer>
          <slot name="footer"></slot>
        </footer>
      </div>
  ```
  使用时, 可以在templete标签上, 使用 v-slot 属性, 并以  v-slot 参数的形式提供其名称
  ```html
      <base-layout>
        <template v-slot:header>
          <h1>我是头部header</h1>
        </template>

        <p>未指定的内容默认归结为匿名插槽内容1</p>
        未指定的内容默认归结为匿名插槽内容2

        <template v-slot:footer>
          <p>我是尾部footer</p>
        </template>
      </base-layout>
  ```
    没有包裹在 v-slot 的内容都会被视为默认内容, 最后的输出结果如下
  ```html
    <h1>我是头部header</h1>
    <p>未指定的内容默认归结为匿名插槽内容1</p>
    未指定的内容默认归结为匿名插槽内容2
    <p>我是尾部footer</p>
  ```

  三.作用域插槽
    1.父级模板里的所有内容都是在父级作用域中编译的.
    2.子模板中的所有内容都是在子作用域中编译的
    3.`作用域插槽`让插槽能够访问子组件中才能访问到的数据

  ```html 父组件
    <todo-list>
    <template v-slot:todo="slotProps" >
      {{slotProps.user.firstName}}
    </template>
    </todo-list>
    <!-- slotProps 可以随意命名 -->
    <!-- slotProps 接取的是子组件标签slot上属性数据的集合所有v-bind:user="user" -->
  ```
  ```html 子页面
    <slot name="todo" :user="user" :test="test">
      {{ user.lastName }}
    </slot>
    <script>
      data() {
        return {
          user:{
            lastName:"张",
            firstName:"三"
          },
          test:[1,2,3,4]
        }
      },
    </script>
    <!-- {{ user.lastName }}是默认数据  v-slot:todo 当父页面没有(="slotProps")时显示： 张 -->
  ```
  父组件的 slotProps 属性,会直接提取子组件的内容.
  `:user="user" :test="test"` 这些类似属性的数据,都是在 slotProps 中传递的.

  解构插槽props
    在传递多个props的时候,使用解构的写法进行赋值,这样使模板更简洁.
    ```html 父组件
      <todo-list>
        <template v-slot:todo="{user,test}" >
          {{user.firstName}}  //此处原来需要写为{{slotProps.user.firstName}}
        </template>
      </todo-list>
      ## 显示 ##
      ## // yue
      <!-- 等同于function的参数和处理函数 -->
    ```
    ```html 子页面
      <slot name="todo" :user="user" :test="test">
        {{ user.lastName }}
      </slot>
      <script>
        data() {
          return {
            user:{
              lastName:"Zhang",
              firstName:"yue"
            },
            test:[1,2,3,4]
          }
        },
      </script>
      ## 显示 ##
      // yue
    ```

  独占默认插槽
    ☆ v-slot 属性, 只能用在templete标签上, 只有一种情况例外: 独占默认插槽
    当被提供的内容只有默认插槽时,组件的标签可以被当做插槽模板(templete)来使用.

    ```html 父组件
      <!-- 原本是需要写template -->
      <todo-list>
        <template v-slot:default="slotProps" >
          {{slotProps.user.firstName}}
        </template>
      </todo-list>
      <!--当被提供的内容只有默认插槽时 v-slot等属性可以直接写在组件标签上-->
      <todo-list v-slot:default="slotProps" >
        {{slotProps.user.firstName}}
      </todo-list>
      <!-- 或者简写 -->
      <todo-list #default="slotProps">
        {{slotProps.user.firstName}}
      </todo-list>
    ```
    ```html
      <slot :user="user" :test="test">
          {{ user.lastName }}
      </slot>
      <script>
        data() {
          return {
            user:{
              lastName:"Zhang",
              firstName:"yue"
            },
            test:[1,2,3,4]
          }
        },
        ## 显示 ##
        // yue
      </script>
    ```

# 总结
  在用上v-slot之后 只需要考虑好:
    1.是否需要命名(匿名插槽,具名插槽)
    2.父页面是否需要取存在子页面的数据(作用域插槽)

[参考](https://blog.csdn.net/weixin_42960907/article/details/123051244)
